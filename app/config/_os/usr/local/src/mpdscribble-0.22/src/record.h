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

#ifndef RECORD_H
#define RECORD_H

#include <stdbool.h>
#include <stddef.h>

struct record {
	char *artist;
	char *track;
	char *album;
	char *number;
	char *mbid;
	char *time;
	int length;
	bool love;
	const char *source;
};

/**
 * Copies attributes from one record to another.  Does not free
 * existing values in the destination record.
 */
void
record_copy(struct record *dest, const struct record *src);

/**
 * Duplicates a record object.
 */
struct record *
record_dup(const struct record *src);

/**
 * Deinitializes a record object, freeing all members.
 */
void
record_deinit(struct record *record);

/**
 * Frees a record object: free all members with record_deinit(), and
 * free the record pointer itself.
 */
void
record_free(struct record *record);

void
record_clear(struct record *record);

/**
 * Does this record object have a defined and usable value?
 */
static inline bool
record_is_defined(const struct record *record)
{
	return record->artist != NULL && record->track != NULL;
}

#endif /* RECORD_H */
