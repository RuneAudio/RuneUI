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

#ifndef LMC_H
#define LMC_H

#include <mpd/client.h>

#include <stdbool.h>

void lmc_connect(char *host, int port);
void lmc_disconnect(void);


void
song_paused(void);

void
song_continued(void);

void
song_started(const struct mpd_song *song);

void
song_playing(const struct mpd_song *song, int elapsed);

void
song_ended(const struct mpd_song *song, bool love);

#endif /* LMC_H */
