/* mpdscribble (MPD Client)
 * Copyright (C) 2008-2010 The Music Player Daemon Project
 * Copyright (C) 2005-2008 Kuno Woudt <kuno@frob.nl>
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

#include <libsoup/soup-uri.h>
#include <libsoup/soup-session-async.h>

#include <assert.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

struct http_request {
	const struct http_client_handler *handler;
	void *handler_ctx;
};

static struct {
	SoupSession *session;
#ifdef HAVE_SOUP_24
	SoupURI *proxy;
#else
	SoupUri *proxy;
#endif

	GList *requests;
} http_client;

static inline GQuark
soup_quark(void)
{
    return g_quark_from_static_string("soup");
}

void
http_client_init(void)
{
	g_type_init();
	g_thread_init(NULL);

	if (file_config.proxy != NULL)
		http_client.proxy = soup_uri_new(file_config.proxy);
	else
		http_client.proxy = NULL;

	http_client.session =
		soup_session_async_new_with_options(SOUP_SESSION_PROXY_URI,
						    http_client.proxy, NULL);
}

static void
http_request_free(struct http_request *request)
{
	g_free(request);
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
	soup_session_abort(http_client.session);
	g_object_unref(G_OBJECT(http_client.session));

	g_list_foreach(http_client.requests, http_request_free_callback, NULL);
	g_list_free(http_client.requests);

	if (http_client.proxy != NULL)
		soup_uri_free(http_client.proxy);
}

char *
http_client_uri_escape(const char *src)
{
#if GLIB_CHECK_VERSION(2,16,0)
	/* if GLib is recent enough, prefer that over SOUP
	   functions */
	return g_uri_escape_string(src, NULL, false);
#else
	return soup_uri_encode(src, "&");
#endif
}

static void
#ifdef HAVE_SOUP_24
http_client_soup_callback(G_GNUC_UNUSED SoupSession *session,
			  SoupMessage *msg, gpointer data)
#else
http_client_soup_callback(SoupMessage *msg, gpointer data)
#endif
{
	struct http_request *request = data;

	http_client.requests = g_list_remove(http_client.requests, request);

	/* NOTE: does not support redirects */
	if (SOUP_STATUS_IS_SUCCESSFUL(msg->status_code)) {
#ifdef HAVE_SOUP_24
		request->handler->response(msg->response_body->length,
					   msg->response_body->data,
					   request->handler_ctx);
#else
		request->handler->response(msg->response.length,
					   msg->response.body,
					   request->handler_ctx);
#endif
	} else {
		GError *error = g_error_new(soup_quark(), 0,
					    "got HTTP status %d (%s)",
					    msg->status_code,
					    msg->reason_phrase);
		request->handler->error(error, request->handler_ctx);
	}

	http_request_free(request);
}

void
http_client_request(const char *url, const char *post_data,
		    const struct http_client_handler *handler, void *ctx)
{
	SoupMessage *msg;
	struct http_request *request;

	if (post_data) {
		msg = soup_message_new(SOUP_METHOD_POST, url);
#ifdef HAVE_SOUP_24
		soup_message_set_request
		    (msg, "application/x-www-form-urlencoded",
		     SOUP_MEMORY_COPY, post_data, strlen(post_data));
		soup_message_headers_append(msg->request_headers, "User-Agent",
					    "mpdscribble/" VERSION);
		soup_message_headers_append(msg->request_headers, "Pragma",
					    "no-cache");
		soup_message_headers_append(msg->request_headers, "Accept",
					    "*/*");
#else
		soup_message_set_request
		    (msg, "application/x-www-form-urlencoded",
		     SOUP_BUFFER_SYSTEM_OWNED, g_strdup(post_data),
		     strlen(post_data));
		soup_message_add_header(msg->request_headers, "User-Agent",
					"mpdscribble/" VERSION);
		soup_message_add_header(msg->request_headers, "Pragma",
					"no-cache");
		soup_message_add_header(msg->request_headers, "Accept", "*/*");
#endif
	} else {
		msg = soup_message_new(SOUP_METHOD_GET, url);
	}

	soup_message_set_flags(msg, SOUP_MESSAGE_NO_REDIRECT);

	request = g_new(struct http_request, 1);
	request->handler = handler;
	request->handler_ctx = ctx;

	soup_session_queue_message(http_client.session, msg,
				   http_client_soup_callback, request);
}
