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

#include "log.h"
#include "config.h"

#include <glib.h>

#include <assert.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>

#ifdef HAVE_SYSLOG
#include <syslog.h>
#endif

static FILE *log_file;
static GLogLevelFlags log_threshold = G_LOG_LEVEL_MESSAGE;

/**
 * Determines the length of the string excluding trailing whitespace
 * characters.
 */
static int
chomp_length(const char *p)
{
	size_t length = strlen(p);

	while (length > 0 && g_ascii_isspace(p[length - 1]))
		--length;

	return (int)length;
}

const char *
log_date(void)
{
	static char buf[32];
	time_t t;
	struct tm *tmp;

	t = time(NULL);
	tmp = localtime(&t);
	if (tmp == NULL) {
		buf[0] = 0;
		return buf;
	}

	if (!strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S%z", tmp)) {
		buf[0] = 0;
		return buf;
	}
	return buf;
}

static void
file_log_func(const gchar *log_domain, GLogLevelFlags log_level,
	      const gchar *message, G_GNUC_UNUSED gpointer user_data)
{
	if (log_level > log_threshold)
		return;

	if (log_domain == NULL)
		log_domain = "";

	fprintf(log_file, "%s %s%s%.*s\n",
		log_date(),
		log_domain, *log_domain == 0 ? "" : ": ",
		chomp_length(message), message);
}

static void
log_init_file(const char *path)
{
	assert(path != NULL);
	assert(log_file == NULL);

	if (strcmp(path, "-") == 0) {
		log_file = stderr;
	} else {
		log_file = fopen(path, "ab");
		if (log_file == NULL)
			g_error("cannot open %s: %s\n",
				path, g_strerror(errno));
	}

	setvbuf(log_file, NULL, _IONBF, 0);

	g_log_set_default_handler(file_log_func, NULL);
}

#ifdef HAVE_SYSLOG

static int
glib_to_syslog_level(GLogLevelFlags log_level)
{
	switch (log_level & G_LOG_LEVEL_MASK) {
	case G_LOG_LEVEL_ERROR:
	case G_LOG_LEVEL_CRITICAL:
		return LOG_ERR;

	case G_LOG_LEVEL_WARNING:
		return LOG_WARNING;

	case G_LOG_LEVEL_MESSAGE:
		return LOG_NOTICE;

	case G_LOG_LEVEL_INFO:
		return LOG_INFO;

	case G_LOG_LEVEL_DEBUG:
		return LOG_DEBUG;

	default:
		return LOG_NOTICE;
	}
}

static void
syslog_log_func(G_GNUC_UNUSED const gchar *log_domain,
		GLogLevelFlags log_level, const gchar *message,
		G_GNUC_UNUSED gpointer user_data)
{
	if (log_level > log_threshold)
		return;

	syslog(glib_to_syslog_level(log_level), "%.*s",
	       chomp_length(message), message);
}

static void
log_init_syslog(void)
{
	assert(log_file == NULL);

	openlog(PACKAGE, 0, LOG_DAEMON);
	g_log_set_default_handler(syslog_log_func, NULL);
}

#endif

void
log_init(const char *path, int verbose)
{
	assert(path != NULL);
	assert(verbose >= 0);
	assert(log_file == NULL);

	if (verbose == 0)
		log_threshold = G_LOG_LEVEL_ERROR;
	else if (verbose == 1)
		log_threshold = G_LOG_LEVEL_WARNING;
	else if (verbose == 2)
		log_threshold = G_LOG_LEVEL_INFO;
	else
		log_threshold = G_LOG_LEVEL_DEBUG;

#ifdef HAVE_SYSLOG
	if (strcmp(path, "syslog") == 0)
		log_init_syslog();
	else
#endif
		log_init_file(path);
}

void
log_deinit(void)
{
#ifndef HAVE_SYSLOG
	assert(log_file != NULL);

#else
	if (log_file == NULL)
		closelog();
	else
#endif
		fclose(log_file);
}
