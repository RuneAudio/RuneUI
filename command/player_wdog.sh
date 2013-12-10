#!/bin/bash
#
#  Copyright (C) 2013 RuneAudio Team
#  http://www.runeaudio.com
#
#  RuneUI
#  copyright (C) 2013 – Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)
#
#  RuneOS
#  copyright (C) 2013 – Carmelo San Giovanni (aka Um3ggh1U)
#
#  RuneAudio website and logo
#  copyright (C) 2013 – ACX webdesign (Andrea Coiutti)
#
#  This Program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 3, or (at your option)
#  any later version.
#
#  This Program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with RuneAudio; see the file COPYING.  If not, see
#  <http://www.gnu.org/licenses/gpl-3.0.txt>.
# 
#  file: player_wdog.sh
#  version: 1.1
#
#
#####################################
# watchdog for php-fpm and player_wrk.php execution 
# by Orion					     													
#####################################
numproc=`pgrep -c php-fpm`
WRKPIDFILE='/run/player_wrk.pid'
# check player_worker exec
if [[ !(-x "/var/www/command/player_wrk.php") ]]
then	
	chmod a+x /var/www/command/player_wrk.php
fi

while true 
do
 	if (($numproc > 12 )); then 
		killall player_wrk.php
		rm $WRKPIDFILE > /dev/null 2>&1
		systemctl restart php-fpm > /dev/null 2>&1
	fi
	if ! kill -0 `cat $WRKPIDFILE` > /dev/null 2>&1; then
		rm $WRKPIDFILE > /dev/null 2>&1
			if [ "$1" == "startup" ]; then
			sleep 5
			fi
		/var/www/command/player_wrk.php > /dev/null 2>&1
	fi
    sleep 12
    numproc=`pgrep -c php-fpm`
done
