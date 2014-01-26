<?php 
/*
 * Copyright (C) 2013-2014 RuneAudio Team
 * http://www.runeaudio.com
 *
 * RuneUI
 * copyright (C) 2013-2014 - Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)
 *
 * RuneOS
 * copyright (C) 2013-2014 - Carmelo San Giovanni (aka Um3ggh1U) & Simone De Gregori (aka Orion)
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
 *  file: command/rune_PL_wrk.php
 *  version: 1.2
 *
 */
 
// common include
include('/var/www/inc/player_lib.php');
ini_set('display_errors', '1');
ini_set('error_reporting', 1);
ini_set('error_log','/var/log/runeaudio/rune_PL_wrk.log');
$db = 'sqlite:/var/www/db/player.db';

// --- DEMONIZE ---
	$lock = fopen('/run/rune_PL_wrk.pid', 'c+');
	if (!flock($lock, LOCK_EX | LOCK_NB)) {
		die('already running');
	}
	 
	switch ($pid = pcntl_fork()) {
		case -1:
			die('unable to fork');
		case 0: // this is the child process
			break;
		default: // otherwise this is the parent process
			fseek($lock, 0);
			ftruncate($lock, 0);
			fwrite($lock, $pid);
			fflush($lock);
			exit;
	}
	 
	if (posix_setsid() === -1) {
		 die('could not setsid');
	}
	 
	fclose(STDIN);
	fclose(STDOUT);
	fclose(STDERR);

	$stdIn = fopen('/dev/null', 'r'); // set fd/0
	$stdOut = fopen('/dev/null', 'w'); // set fd/1
	$stdErr = fopen('php://stdout', 'w'); // a hack to duplicate fd/1 to 2

	pcntl_signal(SIGTSTP, SIG_IGN);
	pcntl_signal(SIGTTOU, SIG_IGN);
	pcntl_signal(SIGTTIN, SIG_IGN);
	pcntl_signal(SIGHUP, SIG_IGN);
// --- DEMONIZE --- //

// --- WORKER MAIN LOOP --- //
while (1) {
if ( !$mpd) {
		// <<< TODO: insert echo on log >>>
    	echo 'Error Connecting MPD Daemon';
} else {
// read SESSION data
playerSession('open',$db,'',''); 
		// check for Ramplay
		if (isset($_SESSION['ramplay']) && $_SESSION['ramplay'] == 1) {
			// fetch MPD status
			$status = _parseStatusResponse(MpdStatus($mpd));
			// store "lastsongid" in PHP SESSION
			$_SESSION['lastsongid'] = $status['songid'];
			// check ramplay delete
				// if (!rp_checkPLid($_SESSION['lastsongid'],$mpd)) {
				// rp_deleteFile($_SESSION['lastsongid'],$mpd);
				// }
			// read id nextsong and store in PHP SESSION
			$_SESSION['nextsongid'] = $status['nextsongid'];
			// check for CMediaFix
			if (isset($_SESSION['cmediafix']) && $_SESSION['cmediafix'] == 1) {
			$_SESSION['lastbitdepth'] = $status['audio'];
		}


}
		
// Unlock SESSION file
session_write_close(); 
// idle LOOP
$status = monitorMpdState($mpd);
// idle LOOP
		// CMediaFix
		if (isset($_SESSION['cmediafix']) && $_SESSION['cmediafix'] == 1 && $status['state'] == 'play' ) {
			$status['lastbitdepth'] = $_SESSION['lastbitdepth'];
				if ($_SESSION['lastbitdepth'] != $status['audio']) {
					sendMpdCommand($mpd,'cmediafix');
				}
		}
		
		// Ramplay
		if (isset($_SESSION['ramplay']) && $_SESSION['ramplay'] == 1) {
				// set consume mode ON
				// if ($status['consume'] == 0) {
				// sendMpdCommand($mpd,'consume 1');
				// $status['consume'] = 1;
				// }

			// copy track in /dev/shm
			$path = rp_copyFile($status['nextsongid'],$mpd);
			// exec update mdp locazione ramplay
			rp_updateFolder($mpd);
			// exec addandplay track
			rp_addPlay($path,$mpd,$status['playlistlength']);
		}
		
closeMpdSocket($mpd);
}
// --- WORKER MAIN LOOP --- //


		



}