#!/bin/sh -e

rm -rf config.cache build
mkdir build

aclocal -I m4 $ACLOCAL_FLAGS
autoconf
autoheader
automake --add-missing $AUTOMAKE_FLAGS

if test x$NOCONFIGURE = x; then
	echo "./configure $*"
	./configure "$@"
fi
