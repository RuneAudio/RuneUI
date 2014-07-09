/* mpdscribble (MPD Client)
 * Copyright (C) 2008-2010 The Music Player Daemon Project
 * Project homepage: http://musicpd.org
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

#include "http_client.h"
#include "file.h"
#include "config.h"

#include <curl/curl.h>

#include <assert.h>
#include <stdbool.h>

enum {
	/** maximum length of a response body */
	MAX_RESPONSE_BODY = 8192,
};

struct http_request {
	const struct http_client_handler *handler;
	void *handler_ctx;

	/** the CURL easy handle */
	CURL *curl;

	/** the POST request body */
	char *post_data;

	/** the response body */
	GString *body;

	/** error message provided by libcurl */
	char error[CURL_ERROR_SIZE];
};

static struct {
	/** the CURL multi handle */
	CURLM *multi;

	/** the GMainLoop source used to poll all CURL file
	    descriptors */
	GSource *source;

	/** the source id of #source */
	guint source_id;

	/** a linked list of all registered GPollFD objects */
	GSList *fds;

	/** a linked list of all active HTTP requests */
	GSList *requests;

	/**
	 * Set when inside http_multi_info_read(), to prevent
	 * recursive invocation.
	 */
	bool locked;

#if LIBCURL_VERSION_NUM >= 0x070f04
	/**
	 * Did CURL give us a timeout?  If yes, then we need to call
	 * curl_multi_perform(), even if there was no event on any
	 * file descriptor.
	 */
	bool timeout;
#endif
} http_client;

static inline GQuark
curl_quark(void)
{
    return g_quark_from_static_string("curl");
}

/**
 * Frees all resources of a #http_request object.  Also unregisters
 * the CURL easy handle from the CURL multi handle.  This function
 * does not affect the linked list http_client.requests.
 */
static void
http_request_free(struct http_request *request)
{
	g_string_free(request->body, true);
	curl_multi_remove_handle(http_client.multi, request->curl);
	curl_easy_cleanup(request->curl);
	g_free(request->post_data);
	g_free(request);
}

/**
 * Calculates the GLib event bit mask for one file descriptor,
 * obtained from three #fd_set objects filled by curl_multi_fdset().
 */
static gushort
http_client_fd_events(int fd, fd_set *rfds,
		      fd_set *wfds, fd_set *efds)
{
	gushort events = 0;

	if (FD_ISSET(fd, rfds)) {
		events |= G_IO_IN | G_IO_HUP | G_IO_ERR;
		FD_CLR(fd, rfds);
	}

	if (FD_ISSET(fd, wfds)) {
		events |= G_IO_OUT | G_IO_ERR;
		FD_CLR(fd, wfds);
	}

	if (FD_ISSET(fd, efds)) {
		events |= G_IO_HUP | G_IO_ERR;
		FD_CLR(fd, efds);
	}

	return events;
}

/**
 * Updates all registered GPollFD objects, unregisters old ones,
 * registers new ones.
 */
static void
http_client_update_fds(void)
{
	fd_set rfds, wfds, efds;
	int max_fd;
	CURLMcode mcode;
	GSList *fds;

	FD_ZERO(&rfds);
	FD_ZERO(&wfds);
	FD_ZERO(&efds);

	mcode = curl_multi_fdset(http_client.multi, &rfds, &wfds,
				 &efds, &max_fd);
	if (mcode != CURLM_OK) {
		g_warning("curl_multi_fdset() failed: %s\n",
			  curl_multi_strerror(mcode));
		return;
	}

	fds = http_client.fds;
	http_client.fds = NULL;

	while (fds != NULL) {
		GPollFD *poll_fd = fds->data;
		gushort events = http_client_fd_events(poll_fd->fd, &rfds,
						       &wfds, &efds);

		assert(poll_fd->events != 0);

		fds = g_slist_remove(fds, poll_fd);

		if (events != poll_fd->events)
			g_source_remove_poll(http_client.source, poll_fd);

		if (events != 0) {
			if (events != poll_fd->events) {
				poll_fd->events = events;
				g_source_add_poll(http_client.source, poll_fd);
			}

			http_client.fds = g_slist_prepend(http_client.fds,
							  poll_fd);
		} else {
			g_free(poll_fd);
		}
	}

	for (int fd = 0; fd <= max_fd; ++fd) {
		gushort events = http_client_fd_events(fd, &rfds,
						       &wfds, &efds);
		if (events != 0) {
			GPollFD *poll_fd = g_new(GPollFD, 1);
			poll_fd->fd = fd;
			poll_fd->events = events;
			g_source_add_poll(http_client.source, poll_fd);
			http_client.fds = g_slist_prepend(http_client.fds,
							  poll_fd);
		}
	}
}

/**
 * Aborts and frees a running HTTP request and report an error to its
 * handler.
 */
static void
http_request_abort(struct http_request *request, GError *error)
{
	http_client.requests = g_slist_remove(http_client.requests, request);

	request->handler->error(error, request->handler_ctx);
	http_request_free(request);
}

/**
 * Abort and free all HTTP requests, but don't invoke their handler
 * methods.
 */
static void
http_client_abort_all_requests(GError *error)
{
	while (http_client.requests != NULL) {
		struct http_request *request = http_client.requests->data;
		http_request_abort(request, g_error_copy(error));
	}

	g_error_free(error);
}

/**
 * Find a request by its CURL "easy" handle.
 */
static struct http_request *
http_client_find_request(CURL *curl)
{
	for (GSList *i = http_client.requests; i != NULL;
	     i = g_slist_next(i)) {
		struct http_request *request = i->data;

		if (request->curl == curl)
			return request;
	}

	return NULL;
}

/**
 * A HTTP request is finished: invoke its callback and free it.
 */
static void
http_request_done(struct http_request *request, CURLcode result, long status)
{
	/* invoke the handler method */

	if (result == CURLE_WRITE_ERROR &&
	    /* handle the postponed error that was caught in
	       http_request_writefunction() */
	    request->body->len > MAX_RESPONSE_BODY) {
		GError *error =
			g_error_new_literal(curl_quark(), 0,
					    "response body is too large");
		request->handler->error(error, request->handler_ctx);
	} else if (result != CURLE_OK) {
		GError *error = g_error_new(curl_quark(), result,
					    "curl failed: %s",
					    request->error);
		request->handler->error(error, request->handler_ctx);
	} else if (status < 200 || status >= 300) {
		GError *error = g_error_new(curl_quark(), 0,
					    "got HTTP status %ld",
					    status);
		request->handler->error(error, request->handler_ctx);
	} else
		request->handler->response(request->body->len,
					   request->body->str,
					   request->handler_ctx);

	/* remove it from the list and free resources */
	http_client.requests = g_slist_remove(http_client.requests, request);
	http_request_free(request);
}

/**
 * Check for finished HTTP responses.
 */
static void
http_multi_info_read(void)
{
	assert(!http_client.locked);
	http_client.locked = true;

	CURLMsg *msg;
	int msgs_in_queue;

	while ((msg = curl_multi_info_read(http_client.multi,
					   &msgs_in_queue)) != NULL) {
		if (msg->msg == CURLMSG_DONE) {
			struct http_request *request =
				http_client_find_request(msg->easy_handle);
			assert(request != NULL);

			long status = 0;
			curl_easy_getinfo(msg->easy_handle,
					  CURLINFO_RESPONSE_CODE, &status);

			http_request_done(request, msg->data.result, status);
		}
	}

	http_client.locked = false;
}

/**
 * Give control to CURL.
 */
static bool
http_multi_perform(void)
{
	CURLMcode mcode;
	int running_handles;

	do {
		mcode = curl_multi_perform(http_client.multi,
					   &running_handles);
	} while (mcode == CURLM_CALL_MULTI_PERFORM);

	if (mcode != CURLM_OK && mcode != CURLM_CALL_MULTI_PERFORM) {
		GError *error = g_error_new(curl_quark(), mcode,
					    "curl_multi_perform() failed: %s",
					    curl_multi_strerror(mcode));
		http_client_abort_all_requests(error);
		return false;
	}

	return true;
}

/**
 * The GSource prepare() method implementation.
 */
static gboolean
curl_source_prepare(G_GNUC_UNUSED GSource *source, G_GNUC_UNUSED gint *timeout_)
{
	http_client_update_fds();

#if LIBCURL_VERSION_NUM >= 0x070f04
	http_client.timeout = false;

	long timeout2;
	CURLMcode mcode = curl_multi_timeout(http_client.multi, &timeout2);
	if (mcode == CURLM_OK) {
		if (timeout2 >= 0 && timeout2 < 10)
			/* CURL 7.21.1 likes to report "timeout=0",
			   which means we're running in a busy loop.
			   Quite a bad idea to waste so much CPU.
			   Let's use a lower limit of 10ms. */
			timeout2 = 10;

		*timeout_ = timeout2;

		http_client.timeout = timeout2 >= 0;
	} else
		g_warning("curl_multi_timeout() failed: %s\n",
			  curl_multi_strerror(mcode));
#endif

	return FALSE;
}

/**
 * The GSource check() method implementation.
 */
static gboolean
curl_source_check(G_GNUC_UNUSED GSource *source)
{
#if LIBCURL_VERSION_NUM >= 0x070f04
	if (http_client.timeout) {
		/* when a timeout has expired, we need to call
		   curl_multi_perform(), even if there was no file
		   descriptor event */
		http_client.timeout = false;
		return TRUE;
	}
#endif

	for (GSList *i = http_client.fds; i != NULL; i = i->next) {
		GPollFD *poll_fd = i->data;
		if (poll_fd->revents != 0)
			return TRUE;
	}

	return FALSE;
}

/**
 * The GSource dispatch() method implementation.  The callback isn't
 * used, because we're handling all events directly.
 */
static gboolean
curl_source_dispatch(G_GNUC_UNUSED GSource *source,
		     G_GNUC_UNUSED GSourceFunc callback,
		     G_GNUC_UNUSED gpointer user_data)
{
	if (http_multi_perform())
		http_multi_info_read();

	return true;
}

/**
 * The vtable for our GSource implementation.  Unfortunately, we
 * cannot declare it "const", because g_source_new() takes a non-const
 * pointer, for whatever reason.
 */
static GSourceFuncs curl_source_funcs = {
	.prepare = curl_source_prepare,
	.check = curl_source_check,
	.dispatch = curl_source_dispatch,
};

void
http_client_init(void)
{
	CURLcode code = curl_global_init(CURL_GLOBAL_ALL);
	if (code != CURLE_OK)
		g_error("curl_global_init() failed: %s",
			curl_easy_strerror(code));

	http_client.multi = curl_multi_init();
	if (http_client.multi == NULL)
		g_error("curl_multi_init() failed");

	http_client.source = g_source_new(&curl_source_funcs,
					  sizeof(*http_client.source));
	http_client.source_id = g_source_attach(http_client.source,
						g_main_context_default());
}

static void
http_request_free_callback(gpointer data, G_GNUC_UNUSED gpointer user_data)
{
	struct http_request *request = data;

	http_request_free(request);
}

void
http_client_finish(void)
{
	/* free all requests */

	g_slist_foreach(http_client.requests, http_request_free_callback, NULL);
	g_slist_free(http_client.requests);

	/* unregister all GPollFD instances */

	http_client_update_fds();

	/* free the GSource object */

	g_source_unref(http_client.source);
	g_source_remove(http_client.source_id);

	/* clean up CURL */

	curl_multi_cleanup(http_client.multi);
	curl_global_cleanup();
}

char *
http_client_uri_escape(const char *src)
{
#if GLIB_CHECK_VERSION(2,16,0)
	/* if GLib is recent enough, prefer that over CURL
	   functions */
	return g_uri_escape_string(src, NULL, false);
#else
	/* curl_escape() is deprecated, but for some reason,
	   curl_easy_escape() wants to have a CURL object, which we
	   don't have right now */
	char *tmp = curl_escape(src, 0);
	/* call g_strdup(), because the caller expects a pointer which
	   can be freed with g_free() */
	char *dest = g_strdup(tmp == NULL ? src : tmp);
	curl_free(tmp);
	return dest;
#endif
}

/**
 * Called by curl when new data is available.
 */
static size_t
http_request_writefunction(void *ptr, size_t size, size_t nmemb, void *stream)
{
	struct http_request *request = stream;

	g_string_append_len(request->body, ptr, size * nmemb);

	if (request->body->len > MAX_RESPONSE_BODY)
		/* response body too large */
		return 0;

	return size * nmemb;
}

void
http_client_request(const char *url, const char *post_data,
		    const struct http_client_handler *handler, void *ctx)
{
	struct http_request *request = g_new(struct http_request, 1);
	CURLcode code;
	CURLMcode mcode;
	bool success;

	request->handler = handler;
	request->handler_ctx = ctx;

	/* create a CURL request */

	request->curl = curl_easy_init();
	if (request->curl == NULL) {
		g_free(request);

		GError *error = g_error_new_literal(curl_quark(), 0,
						    "curl_easy_init() failed");
		handler->error(error, ctx);
		return;
	}

	mcode = curl_multi_add_handle(http_client.multi, request->curl);
	if (mcode != CURLM_OK) {
		curl_easy_cleanup(request->curl);
		g_free(request);

		GError *error = g_error_new_literal(curl_quark(), 0,
						    "curl_multi_add_handle() failed");
		handler->error(error, ctx);
		return;
	}

	/* .. and set it up */

	curl_easy_setopt(request->curl, CURLOPT_USERAGENT,
			 "mpdscribble/" VERSION);
	curl_easy_setopt(request->curl, CURLOPT_WRITEFUNCTION,
			 http_request_writefunction);
	curl_easy_setopt(request->curl, CURLOPT_WRITEDATA, request);
	curl_easy_setopt(request->curl, CURLOPT_FAILONERROR, true);
	curl_easy_setopt(request->curl, CURLOPT_ERRORBUFFER, request->error);
	curl_easy_setopt(request->curl, CURLOPT_BUFFERSIZE, 2048);

	if (file_config.proxy != NULL)
		curl_easy_setopt(request->curl, CURLOPT_PROXY, file_config.proxy);

	request->post_data = g_strdup(post_data);
	if (request->post_data != NULL) {
		curl_easy_setopt(request->curl, CURLOPT_POST, true);
		curl_easy_setopt(request->curl, CURLOPT_POSTFIELDS,
				 request->post_data);
	}

	code = curl_easy_setopt(request->curl, CURLOPT_URL, url);
	if (code != CURLE_OK) {
		curl_multi_remove_handle(http_client.multi, request->curl);
		curl_easy_cleanup(request->curl);
		g_free(request);

		GError *error = g_error_new_literal(curl_quark(), code,
						    "curl_easy_setopt() failed");
		handler->error(error, ctx);
		return;
	}

	request->body = g_string_sized_new(256);

	http_client.requests = g_slist_prepend(http_client.requests, request);

	/* initiate the transfer */

	success = http_multi_perform();
	if (!success) {
		http_client.requests = g_slist_remove(http_client.requests,
						      request);
		http_request_free(request);

		GError *error = g_error_new_literal(curl_quark(), code,
						    "http_multi_perform() failed");
		handler->error(error, ctx);
		return;
	}

	if (!http_client.locked)
		http_multi_info_read();
}
