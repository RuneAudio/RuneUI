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
#ifndef FILE_H
#define FILE_H

#include <glib.h>

enum file_location { file_etc, file_home, file_unknown, };

struct config {
	/** don't daemonize the mpdscribble process */
	gboolean no_daemon;

	char *pidfile;

	char *daemon_user;

	char *log;
	char *conf;
	char *host;
	char *proxy;
	unsigned port;
	int sleep;

	/**
	 * The interval in seconds after which the journal is saved to
	 * the file system.
	 */
	unsigned journal_interval;

	int verbose;
	enum file_location loc;

	GSList *scrobblers;
};

extern struct config file_config;

int file_read_config(void);
void file_cleanup(void);

#endif /* FILE_H */
