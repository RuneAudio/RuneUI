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
#  version: 1.2
#
#
######################################
# Orion RuneAudio Optimize script v0.94 #
######################################
ver="0.94"

####################
# common functions #
####################
mpdprio_nice () {
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
}

mpdprio_default () {
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
}

# adjust Kernel scheduler latency based on Architecture
modKschedLatency () {
    local "${@}"
    # RaspberryPi
    if ((${hw} == "01")) 
    then
        echo ${s01} > /proc/sys/kernel/sched_latency_ns
        sndusb_profile nrpacks=${u01}
        echo "USB nrpacks="${u01}
        echo -n performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
    fi
    # CuBox
    if ((${hw} == "02")) 
    then
        echo ${s02} > /proc/sys/kernel/sched_latency_ns
        sndusb_profile nrpacks=${u02}
        echo "USB nrpacks="${u02}
    fi
    # UDOO
    if ((${hw} == "03")) 
    then
        echo ${s03} > /proc/sys/kernel/sched_latency_ns
        sndusb_profile nrpacks=${u03}
        echo "USB nrpacks="${u03}
    fi
    # BeagleBoneBlack
    if ((${hw} == "04")) 
    then
        echo ${s04} > /proc/sys/kernel/sched_latency_ns
        sndusb_profile nrpacks=${u04}
        echo "USB nrpacks="${u04}
    fi
}

sndusb_profile() {
local "${@}"
mpc pause
sleep 0.2
modprobe -r snd-usb-audio
echo "options snd-usb-audio nrpacks=${nrpacks}" > /etc/modprobe.d/modprobe.conf
sleep 0.5
modprobe snd-usb-audio
mpc play
}
##################
# sound profiles #
##################

# default
if [ "$1" == "default" ]; then
ifconfig eth0 mtu 1500
ifconfig eth0 txqueuelen 1000
echo 60 > /proc/sys/vm/swappiness
modKschedLatency hw=$2 s01=6000000 s02=1700000 s03=1700000 s04=1700000
mpdprio_defalut
echo "flush DEFAULT sound profile"
fi

# mod1
if [ "$1" == "ACX" ]; then
ifconfig eth0 mtu 1500
ifconfig eth0 txqueuelen 1000
echo 0 > /proc/sys/vm/swappiness
modKschedLatency hw=$2 s01=1000000 s02=1700000 s03=1700000 s04=3000000 u04=1
mpdprio_default
renice -18 $(pgrep cifsd);
echo "flush MOD1 (ACX) sound profile 'warm'"
fi

# mod2
if [ "$1" == "Orion" ]; then
ifconfig eth0 mtu 1000
echo 0 > /proc/sys/vm/swappiness
modKschedLatency hw=$2 s01=500000 s02=1700000 s03=1700000 s04=1000000 u04=5
mpdprio_default
renice -18 $(pgrep cifsd);
echo "flush MOD2 (Orion) sound profile 'balance and transparency'"
fi

# mod3
if [ "$1" == "OrionV2" ]; then
ifconfig eth0 mtu 1500
ifconfig eth0 txqueuelen 10000
echo 0 > /proc/sys/vm/swappiness
modKschedLatency hw=$2 s01=100000 s02=1700000 s03=1700000 s04=1700000 u04=2
mpdprio_nice
echo "flush MOD3 (OrionV2) sound profile 'balanced warm sound'"
fi


# mod4
if [ "$1" == "Um3gg1U" ]; then
ifconfig eth0 mtu 1500
ifconfig eth0 txqueuelen 1000
echo 0 > /proc/sys/vm/swappiness
modKschedLatency hw=$2 s01=500000 s02=1700000 s03=1700000 s04=2700000 u04=3
mpdprio_default
renice -18 $(pgrep cifsd);
echo "flush MOD4 (Um3ggh1U) sound profile "
fi

# dev
if [ "$1" == "dev" ]; then
echo "flush DEV sound profile 'fake'"
fi


if [ "$1" == "" ]; then
echo "Orion Optimize Script v$ver" 
echo "Usage: $0 {default|ACX|Orion|OrionV2|Um3ggh1U} {architectureID}"
exit 1
fi
