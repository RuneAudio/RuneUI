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
######################################
# Orion RuneAudio Optimize script v0.93 #
######################################
ver="0.93"

if [ "$2" == "startup" ]; then
## kill useless system processes
#killall -9 avahi-daemon
#killall -9 dbus-daemon
#killall -9 exim4
#killall -9 ntpd
#killall -9 rpc.idmapd
#killall -9 rpc.statd
#killall -9 rpcbind
#killall -9 thd
#killall -9 udevd
#systemctl stop systemd-udevd
#killall -9 automount
#killall -9 cron
#killall -9 atd
#killall -9 dhclient
#killall -9 startpar

## temp hack
#nice -n -20 mpd
#renice 0 `pgrep mpd`
#renice -20 `pgrep cifsd`
echo "flush startup settings"
fi


##################
# sound profiles #
##################

# default
if [ "$1" == "default" ]; then
echo -n ondemand > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
ifconfig eth0 mtu 1500
ifconfig eth0 txqueuelen 1000
echo 60 > /proc/sys/vm/swappiness
echo 6000000 > /proc/sys/kernel/sched_latency_ns
# MPD advanced process priority settings
renice 20 $(pgrep cifsd);
count=1
for pid in $(pgrep -w mpd); 
do
	if ((count == 3)) 
	then
		renice 20 $pid;
	fi
	if ((count == 4))  
	then
		renice 20 $pid;
	fi
	if ((count == 5))
	then
		renice 20 $pid;
	fi
count=$((count+1))
done
echo "flush DEFAULT sound profile"
fi

# mod1
if [ "$1" == "ACX" ]; then
echo -n performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
ifconfig eth0 mtu 1500
ifconfig eth0 txqueuelen 1000
echo 0 > /proc/sys/vm/swappiness
echo 1000000 > /proc/sys/kernel/sched_latency_ns
# MPD advanced process priority settings
renice -18 $(pgrep cifsd);
count=1
for pid in $(pgrep -w mpd); 
do
	if ((count == 3)) 
	then
		renice 20 $pid;
	fi
	if ((count == 4))  
	then
		renice 20 $pid;
	fi
	if ((count == 5))
	then
		renice 20 $pid;
	fi
count=$((count+1))
done
echo "flush MOD1 (ACX) sound profile 'warm'"
fi

# mod2
if [ "$1" == "Orion" ]; then
echo -n performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
ifconfig eth0 mtu 1000
echo 0 > /proc/sys/vm/swappiness
echo 500000 > /proc/sys/kernel/sched_latency_ns
# MPD advanced process priority settings
renice -18 $(pgrep cifsd);
count=1
for pid in $(pgrep -w mpd); 
do
	if ((count == 3)) 
	then
		renice 20 $pid;
	fi
	if ((count == 4))  
	then
		renice 20 $pid;
	fi
	if ((count == 5))
	then
		renice 20 $pid;
	fi
count=$((count+1))
done
echo "flush MOD2 (Orion) sound profile 'balance and transparency'"
fi

# mod3
if [ "$1" == "OrionV2" ]; then
echo -n performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
ifconfig eth0 mtu 1500
ifconfig eth0 txqueuelen 10000
echo 0 > /proc/sys/vm/swappiness
echo 100000 > /proc/sys/kernel/sched_latency_ns
# MPD advanced process priority settings
renice -18 $(pgrep cifsd);
count=1
for pid in $(pgrep -w mpd); 
do
	if ((count == 3)) 
	then
		renice -15 $pid;
	fi
	if ((count == 4))  
	then
		renice -20 $pid;
	fi
	if ((count == 5))
	then
		renice -15 $pid;
	fi
count=$((count+1))
done
echo "flush MOD3 (OrionV2) sound profile"
fi

# mod4
if [ "$1" == "Um3gg1U" ]; then
echo -n performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
ifconfig eth0 mtu 1500
ifconfig eth0 txqueuelen 1000
echo 0 > /proc/sys/vm/swappiness
echo 500000 > /proc/sys/kernel/sched_latency_ns
# MPD advanced process priority settings
renice -18 $(pgrep cifsd);
count=1
for pid in $(pgrep -w mpd); 
do
	if ((count == 3)) 
	then
		renice 20 $pid;
	fi
	if ((count == 4))  
	then
		renice 20 $pid;
	fi
	if ((count == 5))
	then
		renice 20 $pid;
	fi
count=$((count+1))
done
echo "flush MOD4 (Um3ggh1U) sound profile"
fi

# dev
if [ "$1" == "dev" ]; then
echo "flush DEV sound profile 'fake'"
fi


if [ "$1" == "" ]; then
echo "Orion Optimize Script v$ver" 
echo "Usage: $0 {default|ACX|Orion|OrionV2|Um3ggh1U} {startup}"
exit 1
fi
