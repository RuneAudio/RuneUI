<?php
/*
 * Copyright (C) 2013-2014 RuneAudio Team
 * http://www.runeaudio.com
 *
 * RuneUI
 * copyright (C) 2013-2014 - Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)
 *
 * RuneOS
 * copyright (C) 2013-2014 - Simone De Gregori (aka Orion) & Carmelo San Giovanni (aka Um3ggh1U)
 *
 * RuneAudio website and logo
 * copyright (C) 2013-2014 - ACX webdesign (Andrea Coiutti)
 *
 * This Program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3, or (at your option)
 * any later version.
 *
 * This Program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with RuneAudio; see the file COPYING.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.txt>.
 *
 *  file: db/redis_datastore_setup.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
 
// common include
include($_SERVER['HOME'].'/app/config/config.php');
ini_set('display_errors',1);
error_reporting('E_ALL');

// kernel profile
$redis->set('orionprofile', 'RuneAudio');

// player features
$redis->set('hostname', 'runeaudio');
$redis->set('ntpserver', 'pool.ntp.org');
$redis->set('airplay', 1);
$redis->set('udevil', 1);
$redis->set('coverart', 1);
$redis->set('playmod', 0);
$redis->set('ramplay', 0);
$redis->set('scrobbling_lastfm', 0);
$redis->set('cmediafix', 0);
$redis->set('globalrandom', 0);
$redis->set('globalrandom_lock', 0);
$redis->set('mpd_playback_status', '');

// plugins api-keys
$redis->set('lastfm_apikey', 'ba8ad00468a50732a3860832eaed0882');
$redis->hSet('jamendo', 'clientid', '5f3ed86c');
$redis->hSet('jamendo', 'secret', '1afcdcb13eb5ce8f6e534ac4566a3ab9');

// internal config hash control
$redis->set('mpdconfhash', '12eed229f02c52816ed997cbce4b9f32');
$redis->set('netconfhash', '643f8967af551f683b3cfd493950c550');
$redis->set('mpdconf_advanced', 0);
$redis->set('netconf_advanced', 0);

// developer parameters
$redis->set('dev', 0);
$redis->set('debug', 0);
$redis->set('opcache', 1);

// HW platform data
$redis->set('playerid', '');
$redis->set('hwplatform', '');
$redis->set('hwplatformid', '');

// player control
$redis->set('ao', 1);
$redis->set('volume', 0);
$redis->set('pl_length', 0);
$redis->set('nextsongid', 0);
$redis->set('lastsongid', 0);
?>