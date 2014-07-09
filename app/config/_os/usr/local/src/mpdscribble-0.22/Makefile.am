ACLOCAL_AMFLAGS = -I m4
AUTOMAKE_OPTIONS = foreign 1.10 dist-bzip2 subdir-objects

doc_DATA = README AUTHORS NEWS
dist_man_MANS = doc/mpdscribble.1
dist_sysconf_DATA = doc/mpdscribble.conf

EXTRA_DIST = autogen.sh

bin_PROGRAMS = src/mpdscribble

HTTP_CLIENT_SRC = src/http_client.h

if HAVE_CURL
HTTP_CLIENT_SRC += src/http_client_curl.c
endif

if HAVE_SOUP
HTTP_CLIENT_SRC += src/http_client_soup.c
endif

src_mpdscribble_SOURCES = \
	src/mpdscribble.c \
	src/compat.h \
	src/daemon.c src/daemon.h \
	src/record.c src/record.h \
	src/scrobbler.c src/scrobbler.h \
	$(HTTP_CLIENT_SRC) \
	src/http_client.h \
	src/cmdline.c src/cmdline.h \
	src/file.c src/file.h \
	src/journal.c src/journal.h \
	src/lmc.c src/lmc.h \
	src/log.c src/log.h

AM_CPPFLAGS = $(libcurl_CFLAGS) $(libsoup_CFLAGS) \
	$(LIBMPDCLIENT_CFLAGS) \
	$(libgthread_CFLAGS) \
	$(libgcrypt_CFLAGS) \
	$(libglib_CFLAGS) \
	-I$(srcdir)/src -I$(srcdir)/src/libmpdclient
LDADD = $(libcurl_LIBS) $(libsoup_LIBS) \
	$(LIBMPDCLIENT_LIBS) \
	$(libgthread_LIBS) \
	$(libgcrypt_LIBS) \
	$(libglib_LIBS)

AM_CPPFLAGS += -DFILE_CONF='"$(sysconfdir)/mpdscribble.conf"'


#
# Test suite
#

noinst_PROGRAMS = test/run_http_client

test_run_http_client_SOURCES = \
	$(HTTP_CLIENT_SRC) \
	src/file.c \
	test/run_http_client.c


#
# Sparse code analysis
#

SPARSE = sparse
SPARSE_FLAGS =
SPARSE_CPPFLAGS = $(DEFAULT_INCLUDES) \
	-I$(shell $(CC) -print-file-name=include) \
	-I$(shell $(CC) -print-file-name=include-fixed)
sparse-check:
	for i in $(src_mpdscribble_SOURCES); \
	do \
		$(SPARSE) -I. $(CFLAGS) $(AM_CPPFLAGS) $(SPARSE_FLAGS) $(SPARSE_CPPFLAGS) $(srcdir)/$$i || exit; \
	done


#
# Distribution
#

INSTALL_SECURE = $(INSTALL) -m 600

install-dist_sysconfDATA:
	test -z "$(sysconfdir)" || $(mkdir_p) "$(DESTDIR)$(sysconfdir)"
	@list='$(dist_sysconf_DATA)'; \
	for p in $$list; do \
	    dest=`echo $$p | sed -e 's|^.*/||'`; \
	    if test -f $(DESTDIR)$(sysconfdir)/$$dest; then \
	        echo "$@ will not overwrite existing $(DESTDIR)$(sysconfdir)/$$dest"; \
	    else \
	        if test -f "$$p"; then d=; else d="$(srcdir)/"; fi; \
	        echo " $(INSTALL_SECURE) $$d$$p $(DESTDIR)$(sysconfdir)/$$dest"; \
	        $(INSTALL_SECURE) $$d$$p $(DESTDIR)$(sysconfdir)/$$dest; \
	    fi; \
	done
