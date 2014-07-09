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

#include "file.h"
#include "scrobbler.h"
#include "config.h"

#include <glib.h>

#include <assert.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

/*
  default locations for files.

  FILE_ETC_* are paths for a system-wide install.
  FILE_USR_* will be used instead if FILE_USR_CONF exists.
*/

#ifndef G_OS_WIN32

#define FILE_CACHE "/var/cache/mpdscribble/mpdscribble.cache"
#define FILE_HOME_CONF "~/.mpdscribble/mpdscribble.conf"
#define FILE_HOME_CACHE "~/.mpdscribble/mpdscribble.cache"

#endif

#define AS_HOST "http://post.audioscrobbler.com/"

struct config file_config = {
	.port = 0,
	.sleep = -1,
	.journal_interval = 600,
	.verbose = -1,
	.loc = file_unknown,
};

static int file_exists(const char *filename)
{
	return g_file_test(filename, G_FILE_TEST_IS_REGULAR);
}

static char *
file_expand_tilde(const char *path)
{
	const char *home;

	if (path[0] != '~')
		return g_strdup(path);

	home = getenv("HOME");
	if (!home)
		home = "./";

	return g_strconcat(home, path + 1, NULL);
}

static char *
get_default_config_path(void)
{
#ifndef G_OS_WIN32
	char *file = file_expand_tilde(FILE_HOME_CONF);
	if (file_exists(file)) {
		file_config.loc = file_home;
		return file;
	} else {
		free(file);

		if (!file_exists(FILE_CONF))
			return NULL;

		file_config.loc = file_etc;
		return g_strdup(FILE_CONF);
	}
#else
	return g_strdup("mpdscribble.conf");
#endif
}

static char *
get_default_log_path(void)
{
#ifndef G_OS_WIN32
	return g_strdup("syslog");
#else
	return g_strdup("-");
#endif
}

static char *
get_default_cache_path(void)
{
#ifndef G_OS_WIN32
	switch (file_config.loc) {
	case file_home:
		return file_expand_tilde(FILE_HOME_CACHE);

	case file_etc:
		return g_strdup(FILE_CACHE);

	case file_unknown:
		return NULL;
	}

	assert(false);
	return NULL;
#else
	return g_strdup("mpdscribble.cache");
#endif
}

static char *
get_string(GKeyFile *file, const char *group_name, const char *key,
	   GError **error_r)
{
	char *value = g_key_file_get_string(file, group_name, key, error_r);
	if (value != NULL)
		g_strchomp(value);
	return value;
}

static bool
load_string(GKeyFile *file, const char *name, char **value_r)
{
	GError *error = NULL;
	char *value;

	if (*value_r != NULL)
		/* already set by command line */
		return false;

	value = get_string(file, PACKAGE, name, &error);
	if (error != NULL) {
		if (error->code != G_KEY_FILE_ERROR_KEY_NOT_FOUND)
			g_error("%s\n", error->message);
		g_error_free(error);
		return false;
	}

	g_free(*value_r);
	*value_r = value;
	return true;
}

static bool
load_integer(GKeyFile * file, const char *name, int *value_r)
{
	GError *error = NULL;
	int value;

	if (*value_r != -1)
		/* already set by command line */
		return false;

	value = g_key_file_get_integer(file, PACKAGE, name, &error);
	if (error != NULL) {
		if (error->code != G_KEY_FILE_ERROR_KEY_NOT_FOUND)
			g_error("%s\n", error->message);
		g_error_free(error);
		return false;
	}

	*value_r = value;
	return true;
}

static bool
load_unsigned(GKeyFile *file, const char *name, unsigned *value_r)
{
	int value = -1;

	if (!load_integer(file, name, &value))
		return false;

	if (value < 0)
		g_error("Setting '%s' must not be negative", name);

	*value_r = (unsigned)value;
	return true;
}

static struct scrobbler_config *
load_scrobbler_config(GKeyFile *file, const char *group)
{
	struct scrobbler_config *scrobbler = g_new(struct scrobbler_config, 1);
	GError *error = NULL;

	/* Use default host for mpdscribble group, for backward compatability */
	if(strcmp(group, "mpdscribble") == 0) {
		char *username = get_string(file, group, "username", NULL);
		if (username == NULL) {
			/* the default section does not contain a
			   username: don't set up the last.fm default
			   scrobbler */
			g_free(scrobbler);
			return NULL;
		}

		g_free(username);

		scrobbler->name = g_strdup("last.fm");
		scrobbler->url = g_strdup(AS_HOST);
		scrobbler->file = NULL;
	} else {
		scrobbler->name = g_strdup(group);
		scrobbler->file = get_string(file, group,
							"file", NULL);

		if (scrobbler->file == NULL) {
			scrobbler->url = get_string(file, group, "url", &error);
			if (error != NULL)
				g_error("%s\n", error->message);
		} else
			scrobbler->url = NULL;
	}

	if (scrobbler->file == NULL) {
		scrobbler->username = get_string(file, group, "username", &error);

		scrobbler->username = get_string(file, group, "username", &error);
		if (error != NULL)
			g_error("%s\n", error->message);

		scrobbler->password = get_string(file, group, "password", &error);
		if (error != NULL)
			g_error("%s\n", error->message);
	} else {
		scrobbler->username = NULL;
		scrobbler->password = NULL;
	}

	scrobbler->journal = get_string(file, group, "journal", NULL);
	if (scrobbler->journal == NULL && strcmp(group, "mpdscribble") == 0) {
		/* mpdscribble <= 0.17 compatibility */
		scrobbler->journal = get_string(file, group, "cache", NULL);
		if (scrobbler->journal == NULL)
			scrobbler->journal = get_default_cache_path();
	}

	return scrobbler;
}

static void
load_config_file(const char *path)
{
	bool ret;
	char *data1, *data2;
	char **groups;
	int i = -1;
	GKeyFile *file;
	GError *error = NULL;

	ret = g_file_get_contents(path, &data1, NULL, &error);
	if (!ret)
		g_error("%s\n", error->message);

	/* GKeyFile does not allow values without a section.  Apply a
	   hack here: prepend the string "[mpdscribble]" to have all
	   values in the "mpdscribble" section */

	data2 = g_strconcat("[" PACKAGE "]\n", data1, NULL);
	g_free(data1);

	file = g_key_file_new();
	g_key_file_load_from_data(file, data2, strlen(data2),
				  G_KEY_FILE_NONE, &error);
	g_free(data2);
	if (error != NULL)
		g_error("%s\n", error->message);

	load_string(file, "pidfile", &file_config.pidfile);
	load_string(file, "daemon_user", &file_config.daemon_user);
	load_string(file, "log", &file_config.log);
	load_string(file, "host", &file_config.host);
	load_unsigned(file, "port", &file_config.port);
	load_string(file, "proxy", &file_config.proxy);
	load_integer(file, "sleep", &file_config.sleep);
	if (!load_unsigned(file, "journal_interval",
			   &file_config.journal_interval))
		load_unsigned(file, "cache_interval",
			      &file_config.journal_interval);
	load_integer(file, "verbose", &file_config.verbose);

	groups = g_key_file_get_groups(file, NULL);
	while(groups[++i]) {
		struct scrobbler_config *scrobbler =
			load_scrobbler_config(file, groups[i]);
		if (scrobbler != NULL)
			file_config.scrobblers =
				g_slist_prepend(file_config.scrobblers,
						scrobbler);
	}
	g_strfreev(groups);

	g_key_file_free(file);
}

int file_read_config(void)
{
	if (file_config.conf == NULL)
		file_config.conf = get_default_config_path();

	/* parse config file options. */

	if (file_config.conf != NULL)
		load_config_file(file_config.conf);

	if (!file_config.conf)
		g_error("cannot find configuration file\n");

	if (file_config.scrobblers == NULL)
		g_error("No audioscrobbler host configured in %s",
			file_config.conf);

	if (!file_config.log)
		file_config.log = get_default_log_path();

	if (!file_config.proxy)
		file_config.proxy = getenv("http_proxy");
	if (file_config.sleep <= 0)
		file_config.sleep = 1;
	if (file_config.verbose == -1)
		file_config.verbose = 1;

	return 1;
}

static void
scrobbler_config_free_callback(gpointer data, G_GNUC_UNUSED gpointer user_data)
{
	struct scrobbler_config *scrobbler = data;

	g_free(scrobbler->name);
	g_free(scrobbler->url);
	g_free(scrobbler->username);
	g_free(scrobbler->password);
	g_free(scrobbler->journal);
	g_free(scrobbler->file);
	g_free(scrobbler);
}

void file_cleanup(void)
{
	g_free(file_config.host);
	g_free(file_config.log);
	g_free(file_config.conf);

	g_slist_foreach(file_config.scrobblers,
			scrobbler_config_free_callback, NULL);
	g_slist_free(file_config.scrobblers);
}
