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
// ini_set('display_errors',1);
// error_reporting('E_ALL');

function redisDatastore($redis,$action) {

	switch ($action) {
			
			case 'reset':
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
			$redis->hSet('dirble', 'apikey', '134aabbce2878ce0dbfdb23fb3b46265eded085b');

			// internal config hash control
			// $redis->set('mpdconfhash', '');
			// $redis->set('netconfhash', '');
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
			$redis->set('lock_refresh_ao', 0);
			break;
			
			case 'check':
			// kernel profile
			$redis->get('orionprofile') || $redis->set('orionprofile', 'RuneAudio');

			// player features
			$redis->get('hostname') || $redis->set('hostname', 'runeaudio');
			$redis->get('ntpserver') || $redis->set('ntpserver', 'pool.ntp.org');
			$redis->hGet('airplay','enable') || $redis->hSet('airplay','enable', 1);
			$redis->hGet('airplay','name') || $redis->hSet('airplay','name', 'runeaudio');
			$redis->get('udevil') || $redis->set('udevil', 1);
			$redis->get('coverart') || $redis->set('coverart', 1);
			$redis->get('playmod') || $redis->set('playmod', 0);
			$redis->get('ramplay') || $redis->set('ramplay', 0);
			$redis->get('scrobbling_lastfm') || $redis->set('scrobbling_lastfm', 0);
			$redis->get('cmediafix') || $redis->set('cmediafix', 0);
			$redis->get('globalrandom') || $redis->set('globalrandom', 0);
			$redis->get('globalrandom_lock') || $redis->set('globalrandom_lock', 0);
			$redis->get('mpd_playback_status') || $redis->set('mpd_playback_status', '');

			// plugins api-keys
			$redis->get('lastfm_apikey') || $redis->set('lastfm_apikey', 'ba8ad00468a50732a3860832eaed0882');
			$redis->hGet('jamendo', 'clientid') || $redis->hSet('jamendo', 'clientid', '5f3ed86c');
			$redis->hGet('jamendo', 'secret') || $redis->hSet('jamendo', 'secret', '1afcdcb13eb5ce8f6e534ac4566a3ab9');
			$redis->hGet('dirble','apikey') || $redis->hSet('dirble', 'apikey', '134aabbce2878ce0dbfdb23fb3b46265eded085b');

			// internal config hash control
			$redis->get('mpdconfhash') || $redis->set('mpdconfhash', '');
			$redis->get('netconfhash') || $redis->set('netconfhash', '');
			$redis->get('mpdconf_advanced') || $redis->set('mpdconf_advanced', 0);
			$redis->get('netconf_advanced') || $redis->set('netconf_advanced', 0);

			// developer parameters
			$redis->get('dev') || $redis->set('dev', 0);
			$redis->get('debug') || $redis->set('debug', 0);
			$redis->get('opcache') || $redis->set('opcache', 1);

			// HW platform data
			$redis->get('playerid') || $redis->set('playerid', '');
			$redis->get('hwplatform') || $redis->set('hwplatform', '');
			$redis->get('hwplatformid') || $redis->set('hwplatformid', '');

			// player control
			$redis->get('ao') || $redis->set('ao', 1);
			$redis->get('volume') || $redis->set('volume', 0);
			$redis->get('pl_length') || $redis->set('pl_length', 0);
			$redis->get('nextsongid') || $redis->set('nextsongid', 0);
			$redis->get('lastsongid') || $redis->set('lastsongid', 0);	
			$redis->get('lock_refresh_ao') || $redis->set('lock_refresh_ao', 0);
			break;
	}
	
}

// inspect GET
if (isset($_GET['cmd'])) {

	switch ($_GET['cmd']) {
		
		case 'reset':
			redisDatastore($redis,'reset');
			include($_SERVER['HOME'].'/db/redis_acards_details.php');
		break;
		
		case 'check':
			redisDatastore($redis,'check');
		break;
		
	}
}
