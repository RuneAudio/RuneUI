/* mpdscribble (MPD Client)
 * Copyright (C) 2008-2010 The Music Player Daemon Project
 * Copyright (C) 2005-2008 Kuno Woudt <kuno@frob.nl>
 * Project homepage: http://musicpd.org
 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

#include "lmc.h"
#include "file.h"
#include "compat.h"

#if LIBMPDCLIENT_CHECK_VERSION(2,5,0)
#include <mpd/message.h>
#endif

#include <glib.h>

#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

static struct mpd_connection *g_mpd;
static bool idle_supported, idle_notified;
static unsigned last_id = -1;
static struct mpd_song *current_song;
static bool was_paused;

/**
 * Is the current song being "loved"?  That variable gets set when the
 * client-to-client command "love" is received.
 */
static bool love;

#if LIBMPDCLIENT_CHECK_VERSION(2,5,0)
static bool subscribed;
#endif

static char *g_host;
static int g_port;

static guint reconnect_source_id, update_source_id, idle_source_id;

static void
lmc_schedule_reconnect(void);

static void
lmc_schedule_update(void);

static void
lmc_schedule_idle(void);

static void lmc_failure(void)
{
	char *msg = g_strescape(mpd_connection_get_error_message(g_mpd), NULL);

	g_warning("mpd error (%u): %s\n",
		  mpd_connection_get_error(g_mpd), msg);
	g_free(msg);
	mpd_connection_free(g_mpd);
	g_mpd = NULL;
}

#if LIBMPDCLIENT_CHECK_VERSION(2,4,0)

static char *
settings_name(const struct mpd_settings *settings)
{
	const char *host = mpd_settings_get_host(settings);
	if (host == NULL)
		host = "unknown";

	if (host[0] == '/')
		return g_strdup(host);

	unsigned port = mpd_settings_get_port(settings);
	if (port == 0 || port == 6600)
		return g_strdup(host);

	return g_strdup_printf("%s:%u", host, port);
}

#endif

static char *
connection_settings_name(const struct mpd_connection *connection)
{
#if LIBMPDCLIENT_CHECK_VERSION(2,4,0)
	const struct mpd_settings *settings =
		mpd_connection_get_settings(connection);
	if (settings == NULL)
		return g_strdup("unknown");

	return settings_name(settings);
#else
	(void)connection;
	return g_strdup(g_host);
#endif
}

static gboolean
lmc_reconnect(G_GNUC_UNUSED gpointer data)
{
	const unsigned *version;

	g_mpd = mpd_connection_new(g_host, g_port, 0);
	if (mpd_connection_get_error(g_mpd) != MPD_ERROR_SUCCESS) {
		lmc_failure();
		return true;
	}

	idle_supported = mpd_connection_cmp_server_version(g_mpd, 0, 14, 0) >= 0;

	version = mpd_connection_get_server_version(g_mpd);
	char *name = connection_settings_name(g_mpd);
	g_message("connected to mpd %i.%i.%i at %s\n",
		  version[0], version[1], version[2],
		  name);
	g_free(name);

#if LIBMPDCLIENT_CHECK_VERSION(2,5,0)
	subscribed = mpd_run_subscribe(g_mpd, "mpdscribble");
	if (!subscribed && !mpd_connection_clear_error(g_mpd)) {
		lmc_failure();
		return true;
	}
#endif

	lmc_schedule_update();

	reconnect_source_id = 0;
	return false;
}

static void
lmc_schedule_reconnect(void)
{
	assert(reconnect_source_id == 0);

	g_message("waiting 15 seconds before reconnecting\n");

	reconnect_source_id = g_timeout_add_seconds(15, lmc_reconnect, NULL);
}

void lmc_connect(char *host, int port)
{
	g_host = host;
	g_port = port;

	if (lmc_reconnect(NULL))
		lmc_schedule_reconnect();
}

void lmc_disconnect(void)
{
	if (reconnect_source_id != 0)
		g_source_remove(reconnect_source_id);

	if (update_source_id != 0)
		g_source_remove(update_source_id);

	if (idle_source_id != 0)
		g_source_remove(idle_source_id);

	if (g_mpd) {
		mpd_connection_free(g_mpd);
		g_mpd = NULL;
	}

	if (current_song != NULL) {
		mpd_song_free(current_song);
		current_song = NULL;
	}
}

static enum mpd_state
lmc_current(struct mpd_song **song_r, unsigned *elapsed_r)
{
	struct mpd_status *status;
	enum mpd_state state;
	struct mpd_song *song;

	assert(g_mpd != NULL);

	mpd_command_list_begin(g_mpd, true);
	mpd_send_status(g_mpd);
	mpd_send_current_song(g_mpd);
	mpd_command_list_end(g_mpd);

	status = mpd_recv_status(g_mpd);
	if (!status) {
		lmc_failure();
		return MPD_STATE_UNKNOWN;
	}

	state = mpd_status_get_state(status);
	*elapsed_r = mpd_status_get_elapsed_time(status);

	mpd_status_free(status);

	if (state != MPD_STATE_PLAY) {
		if (!mpd_response_finish(g_mpd)) {
			lmc_failure();
			return MPD_STATE_UNKNOWN;
		}

		return state;
	}

	if (!mpd_response_next(g_mpd)) {
		lmc_failure();
		return MPD_STATE_UNKNOWN;
	}

	song = mpd_recv_song(g_mpd);
	if (song == NULL) {
		if (!mpd_response_finish(g_mpd)) {
			lmc_failure();
			return MPD_STATE_UNKNOWN;
		}

		return MPD_STATE_UNKNOWN;
	}

	if (!mpd_response_finish(g_mpd)) {
		mpd_song_free(song);
		lmc_failure();
		return MPD_STATE_UNKNOWN;
	}

	*song_r = song;
	return MPD_STATE_PLAY;
}

/**
 * Update: determine MPD's current song and enqueue submissions.
 */
static gboolean
lmc_update(G_GNUC_UNUSED gpointer data)
{
	struct mpd_song *prev;
	enum mpd_state state;
	unsigned elapsed = 0;

	prev = current_song;
	state = lmc_current(&current_song, &elapsed);

	if (state == MPD_STATE_PAUSE) {
		if (!was_paused)
			song_paused();
		was_paused = true;

		if (idle_supported) {
			lmc_schedule_idle();
			update_source_id = 0;
			return false;
		}

		return true;
	} else if (state != MPD_STATE_PLAY) {
		current_song = NULL;
		last_id = -1;
		was_paused = false;
	} else if (mpd_song_get_tag(current_song, MPD_TAG_ARTIST, 0) == NULL ||
		   mpd_song_get_tag(current_song, MPD_TAG_TITLE, 0) == NULL) {
		if (mpd_song_get_id(current_song) != last_id) {
			g_message("new song detected with tags missing (%s)\n",
				  mpd_song_get_uri(current_song));
			last_id = mpd_song_get_id(current_song);
		}

		mpd_song_free(current_song);
		current_song = NULL;
	}

	if (was_paused) {
		if (current_song != NULL &&
		    mpd_song_get_id(current_song) == last_id)
			song_continued();
		was_paused = false;
	}

	/* submit the previous song */
	if (prev != NULL &&
	    (current_song == NULL ||
	     mpd_song_get_id(prev) != mpd_song_get_id(current_song))) {
		song_ended(prev, love);
		love = false;
	}

	if (current_song != NULL) {
		if (mpd_song_get_id(current_song) != last_id) {
			/* new song. */

			song_started(current_song);
			last_id = mpd_song_get_id(current_song);
		} else {
			/* still playing the previous song */

			song_playing(current_song, elapsed);
		}
	}

	if (prev != NULL)
		mpd_song_free(prev);

	if (g_mpd == NULL) {
		lmc_schedule_reconnect();
		update_source_id = 0;
		return false;
	}

	if (idle_supported) {
		lmc_schedule_idle();
		update_source_id = 0;
		return false;
	}

	return true;
}

static void
lmc_schedule_update(void)
{
	assert(update_source_id == 0);

	update_source_id = g_timeout_add_seconds(idle_supported ? 0 : file_config.sleep,
						 lmc_update, NULL);
}

#if LIBMPDCLIENT_CHECK_VERSION(2,5,0)

static bool
lmc_read_messages(void)
{
	assert(subscribed);

	if (!mpd_send_read_messages(g_mpd))
		return mpd_connection_clear_error(g_mpd);

	struct mpd_message *msg;
	while ((msg = mpd_recv_message(g_mpd)) != NULL) {
		const char *text = mpd_message_get_text(msg);
		if (strcmp(text, "love") == 0)
			love = true;
		else
			g_message("Unrecognized client-to-client message: '%s'",
				  text);

		mpd_message_free(msg);
	}

	return mpd_response_finish(g_mpd);
}

#endif

static gboolean
lmc_idle(G_GNUC_UNUSED GIOChannel *source,
	 G_GNUC_UNUSED GIOCondition condition,
	 G_GNUC_UNUSED gpointer data)
{
	bool success;
	enum mpd_idle idle;

	assert(idle_source_id != 0);
	assert(g_mpd != NULL);
	assert(mpd_connection_get_error(g_mpd) == MPD_ERROR_SUCCESS);

	idle_source_id = 0;

	idle = mpd_recv_idle(g_mpd, false);
	success = mpd_response_finish(g_mpd);

	if (!success && mpd_connection_get_error(g_mpd) == MPD_ERROR_SERVER &&
	    mpd_connection_get_server_error(g_mpd) == MPD_SERVER_ERROR_UNKNOWN_CMD &&
	    mpd_connection_clear_error(g_mpd)) {
		/* MPD does not recognize the "idle" command - disable
		   it for this connection */

		g_message("MPD does not support the 'idle' command - "
			  "falling back to polling\n");

		idle_supported = false;
		lmc_schedule_update();
		return false;
	}

	if (!success) {
		lmc_failure();
		lmc_schedule_reconnect();
		return false;
	}

#if LIBMPDCLIENT_CHECK_VERSION(2,5,0)
	if (subscribed && (idle & MPD_IDLE_MESSAGE) != 0 &&
	    !lmc_read_messages()) {
		lmc_failure();
		lmc_schedule_reconnect();
		return false;
	}
#endif

	if (idle & MPD_IDLE_PLAYER)
		/* there was a change: query MPD */
		lmc_schedule_update();
	else
		/* nothing interesting: re-enter idle */
		lmc_schedule_idle();

	return false;
}

static void
lmc_schedule_idle(void)
{
	GIOChannel *channel;

	assert(idle_source_id == 0);
	assert(g_mpd != NULL);

	idle_notified = false;

	enum mpd_idle mask = MPD_IDLE_PLAYER;
#if LIBMPDCLIENT_CHECK_VERSION(2,5,0)
	if (subscribed)
		mask |= MPD_IDLE_MESSAGE;
#endif

	if (!mpd_send_idle_mask(g_mpd, mask)) {
		lmc_failure();
		lmc_schedule_reconnect();
		return;
	}

	/* add a GLib watch on the libmpdclient socket */

	channel = g_io_channel_unix_new(mpd_connection_get_fd(g_mpd));
	idle_source_id = g_io_add_watch(channel, G_IO_IN, lmc_idle, NULL);
	g_io_channel_unref(channel);
}
