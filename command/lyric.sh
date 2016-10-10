#!/bin/bash

artist_name=`mpc -f %artist% | head -n 1`
title=`mpc -f %title% | head -n 1`

artist=`perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' "$artist_name"`
title=`perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' "$title"`

echo $artist
echo $title

curl -s "http://makeitpersonal.co/lyrics?artist=$artist&title=$title" |sed ':a;N;$!ba;s/\n/<\/br>/g'