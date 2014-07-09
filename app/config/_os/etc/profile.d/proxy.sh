#!/bin/sh

export http_proxy=http://user:pass@proxy.crtnet:8080/
export https_proxy=$http_proxy
export ftp_proxy=$http_proxy
export rsync_proxy=$http_proxy
export no_proxy="localhost,127.0.0.1,localaddress,runeaudio.local"
