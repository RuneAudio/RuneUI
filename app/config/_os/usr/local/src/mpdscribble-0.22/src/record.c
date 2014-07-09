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

#include "record.h"

#include <glib.h>

void
record_copy(struct record *dest, const struct record *src)
{
	dest->artist = g_strdup(src->artist);
	dest->track = g_strdup(src->track);
	dest->album = g_strdup(src->album);
	dest->number = g_strdup(src->number);
	dest->mbid = g_strdup(src->mbid);
	dest->time = g_strdup(src->time);
	dest->length = src->length;
	dest->love = src->love;
	dest->source = src->source;
}

struct record *
record_dup(const struct record *src)
{
	struct record *dest = g_new(struct record, 1);
	record_copy(dest, src);
	return dest;
}

void
record_deinit(struct record *record)
{
	g_free(record->artist);
	g_free(record->track);
	g_free(record->album);
	g_free(record->number);
	g_free(record->mbid);
	g_free(record->time);
}

void
record_free(struct record *record)
{
	record_deinit(record);
	g_free(record);
}

void
record_clear(struct record *record)
{
	record->artist = NULL;
	record->track = NULL;
	record->album = NULL;
	record->number = NULL;
	record->mbid = NULL;
	record->time = NULL;
	record->length = 0;
	record->love = false;
	record->source = "P";
}
