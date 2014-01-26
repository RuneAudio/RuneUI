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
 *  file: _player_engine.php
 *  version: 1.2
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
				if (!empty($path)){
				$status['currentalbum'] = $path;
				} else {
				$status['currentalbum'] = "";
				}
			}
		
		// CMediaFix
		if (isset($_SESSION['cmediafix']) && $_SESSION['cmediafix'] == 1 && $status['state'] == 'play') {
			$status['lastbitdepth'] = $_SESSION['lastbitdepth'];
				if ($_SESSION['lastbitdepth'] != $status['audio']) {
					sendMpdCommand($mpd,'cmediafix');
				}
			
		}
		
		// JSON response for GUI
		echo json_encode($status);
// debug
runelog('--- [_player_engine.php] --- CLOSE MPD SOCKET <<< (0) ---','');		
closeMpdSocket($mpd);	
}
?>