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

#include "cmdline.h"
#include "file.h"
#include "config.h"

#include <glib.h>

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static const char *blurb =
	PACKAGE " version " VERSION "\n"
	"another audioscrobbler plugin for music player daemon.\n"
	"Copyright 2005,2006 Kuno Woudt <kuno@frob.nl>.\n"
	"Copyright 2008-2010 Max Kellermann <max@duempel.org>\n" "\n";

#if GLIB_CHECK_VERSION(2,12,0)
static const char *summary =
	"A Music Player Daemon (MPD) client which submits information about\n"
	"tracks being played to Last.fm (formerly Audioscrobbler).";
#endif

static gboolean option_version;

static const GOptionEntry entries[] = {
	{ "version", 'V', 0, G_OPTION_ARG_NONE, &option_version,
	  "print version number", NULL },
	{ "no-daemon", 'D', 0, G_OPTION_ARG_NONE, &file_config.no_daemon,
	  "don't daemonize", NULL },
	{ "verbose", 'v', 0, G_OPTION_ARG_INT, &file_config.verbose,
	  "verbosity (0-2, default 2)", NULL },
	{ "conf", 0, 0, G_OPTION_ARG_STRING, &file_config.conf,
	  "load configuration from this file", NULL },
	{ "pidfile", 0, 0, G_OPTION_ARG_STRING, &file_config.pidfile,
	  "write the process id to this file", NULL },
	{ "daemon-user", 0, 0, G_OPTION_ARG_STRING, &file_config.daemon_user,
	  "run daemon as this user", NULL },
	{ "log", 0, 0, G_OPTION_ARG_STRING, &file_config.log,
	  "log file or 'syslog'", NULL },
	{ "host", 0, 0, G_OPTION_ARG_STRING, &file_config.host,
	  "MPD host name to connect to, or Unix domain socket path", NULL },
	{ "port", 0, 0, G_OPTION_ARG_INT, &file_config.port,
	  "MPD port to connect to", NULL },
	{ "proxy", 0, 0, G_OPTION_ARG_STRING, &file_config.host,
	  "HTTP proxy URI", NULL },
	{ .long_name = NULL }
};

static void version(void)
{
	fputs(blurb, stdout);

	printf
	    ("mpdscribble comes with NO WARRANTY, to the extent permitted by law.\n"
	     "You may redistribute copies of mpdscribble under the terms of the\n"
	     "GNU General Public License; either version 2 of the License, or\n"
	     "(at your option) any later version.\n"
	     "For more information about these matters, see the file named COPYING.\n"
	     "\n");

	exit(0);
}

void
parse_cmdline(int argc, char **argv)
{
	GError *error = NULL;
	GOptionContext *context;
	bool ret;

	context = g_option_context_new(NULL);
	g_option_context_add_main_entries(context, entries, NULL);

#if GLIB_CHECK_VERSION(2,12,0)
	g_option_context_set_summary(context, summary);
#endif

	ret = g_option_context_parse(context, &argc, &argv, &error);
	g_option_context_free(context);

	if (!ret) {
		g_print ("option parsing failed: %s\n", error->message);
		exit (1);
	}

	if (option_version)
		version();
}
