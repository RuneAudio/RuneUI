#!/bin/bash
if grep -q "/mnt/MPD/USB/EFI vfat" "/proc/mounts"; then
   devmon --unmount /mnt/MPD/USB/EFI
fi
/usr/bin/mpc update
