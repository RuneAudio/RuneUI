<?php 
/*
 * Copyright (C) 2013 RuneAudio Team
 * http://www.runeaudio.com
 *
 * RuneUI
 * copyright (C) 2013 – Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)
 *
 * RuneOS
 * copyright (C) 2013 – Carmelo San Giovanni (aka Um3ggh1U)
 *
 * RuneAudio website and logo
 * copyright (C) 2013 – ACX webdesign (Andrea Coiutti)
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
 *  file: _player_engine.php
 *  version: 1.1
 *
 */
 
// common include
include('inc/connection.php');
playerSession('open',$db,'',''); 
?>

<?php
// setup endless loop
//set_time_limit(0);

if ( !$mpd) {
    	echo 'Error Connecting MPD Daemon';
} else {
		// fetch MPD status
		$status = _parseStatusResponse(MpdStatus($mpd));
		
		// check for CMediaFix
		if (isset($_SESSION['cmediafix']) && $_SESSION['cmediafix'] == 1) {
		$_SESSION['lastbitdepth'] = $status['audio'];
		}
		
		// check for Ramplay
		if (isset($_SESSION['ramplay']) && $_SESSION['ramplay'] == 1) {
			// record "lastsongid" in PHP SESSION
			$_SESSION['lastsongid'] = $status['songid'];
			// controllo per cancellazione ramplay
				// if (!rp_checkPLid($_SESSION['lastsongid'],$mpd)) {
				// rp_deleteFile($_SESSION['lastsongid'],$mpd);
				// }
			// recupero id nextsong e metto in sessione
			$_SESSION['nextsongid'] = $status['nextsongid']; 
		}
// register player STATE in SESSION
$_SESSION['state'] = $status['state'];
// Unlock SESSION file
session_write_close(); 
// -----  check and compare GUI state with Backend state  ----  //
// idle LOOP
		if ($_GET['state'] == $status['state']) {
			$status = monitorMpdState($mpd);
		} 
// idle LOOP
// -----  check and compare GUI state with Backend state  ----  //

			$curTrack = getTrackInfo($mpd,$status['song']);

			if (isset($curTrack[0]['Title'])) {
			$status['currentartist'] = $curTrack[0]['Artist'];
			$status['currentsong'] = $curTrack[0]['Title'];
			$status['currentalbum'] = $curTrack[0]['Album'];
			$status['fileext'] = parseFileStr($curTrack[0]['file'],'.');
			} else {
			$path = parseFileStr($curTrack[0]['file'],'/');
			$status['fileext'] = parseFileStr($curTrack[0]['file'],'.');
			$status['currentartist'] = "";
			$status['currentsong'] = $song;
			$status['currentalbum'] = "path: ".$path;
			}
		
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

			// copio il pezzo in /dev/shm
			$path = rp_copyFile($status['nextsongid'],$mpd);
			// lancio update mdp locazione ramplay
			rp_updateFolder($mpd);
			// lancio addandplay canzone
			rp_addPlay($path,$mpd,$status['playlistlength']);
		}
		
		
		// JSON response for GUI
		echo json_encode($status);
		
closeMpdSocket($mpd);	
}