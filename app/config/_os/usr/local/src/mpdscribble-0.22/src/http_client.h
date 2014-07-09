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

#ifndef HTTP_CLIENT_H
#define HTTP_CLIENT_H

#include <glib.h>

#include <stddef.h>

struct http_client_handler {
	void (*response)(size_t length, const char *data, void *ctx);
	void (*error)(GError *error, void *ctx);
};

/**
 * Perform global initialization on the HTTP client library.
 */
void
http_client_init(void);

/**
 * Global deinitializaton.
 */
void
http_client_finish(void);

/**
 * Escapes URI parameters with '%'.  Free the return value with
 * g_free().
 */
char *
http_client_uri_escape(const char *src);

void
http_client_request(const char *url, const char *post_data,
		    const struct http_client_handler *handler, void *ctx);

#endif /* CONN_H */
