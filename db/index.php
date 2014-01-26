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
 *  file: db/index.php
 *  version: 1.2
 *
 */
 
// common include
include('../inc/connection.php');
error_reporting(ERRORLEVEL);

if (isset($_GET['cmd']) && $_GET['cmd'] != '') {

        if ( !$mpd ) {
        echo 'Error Connecting to MPD daemon ';
		
		}  else {
				
				switch ($_GET['cmd']) {
				
				case 'filepath':
					if (isset($_POST['path']) && $_POST['path'] != '') {
					echo json_encode(searchDB($mpd,'filepath',$_POST['path']));
					} else {
					echo json_encode(searchDB($mpd,'filepath'));
					}
				break;

				case 'playlist':
				echo json_encode(getPlayQueue($mpd));
				break;

				case 'add':
					if (isset($_POST['path']) && $_POST['path'] != '') {
					echo json_encode(addQueue($mpd,$_POST['path']));
					}
				break;
				
				case 'addplay':
					if (isset($_POST['path']) && $_POST['path'] != '') {
					$status = _parseStatusResponse(MpdStatus($mpd));
					$pos = $status['playlistlength'] ;
					addQueue($mpd,$_POST['path']);
					// -- REWORK NEEDED -- tempfix for analog/hdmi out of raspberrypi (should be integrated with sendMpdCommand() function)
						if ($_SESSION['hwplatformid'] == '01' && ($_SESSION['ao'] == 2 OR $_SESSION['ao'] == 3)) {
							$cmdstr = "pause";
							sendMpdCommand($mpd,$cmdstr);
							closeMpdSocket($mpd);
							usleep(500000);
							$mpd = openMpdSocket(DAEMONIP, 6600) ;
							$cmdstr = $_GET['cmd'];
							sendMpdCommand($mpd,$cmdstr);
						} else {
							sendMpdCommand($mpd,'play '.$pos);
						}
					echo json_encode(readMpdResponse($mpd));
					}
				break;

				case 'addreplaceplay':
					if (isset($_POST['path']) && $_POST['path'] != '') {
					sendMpdCommand($mpd,'clear');
					addQueue($mpd,$_POST['path']);
					// -- REWORK NEEDED -- tempfix for analog/hdmi out of raspberrypi (should be integrated with sendMpdCommand() function)
						if ($_SESSION['hwplatformid'] == '01' && ($_SESSION['ao'] == 2 OR $_SESSION['ao'] == 3)) {
							$cmdstr = "pause";
							sendMpdCommand($mpd,$cmdstr);
							closeMpdSocket($mpd);
							usleep(500000);
							$mpd = openMpdSocket(DAEMONIP, 6600) ;
							$cmdstr = $_GET['cmd'];
							sendMpdCommand($mpd,$cmdstr);
						} else {
							sendMpdCommand($mpd,'play');
						}
					echo json_encode(readMpdResponse($mpd));
					}
				break;
				
				case 'update':
					if (isset($_POST['path']) && $_POST['path'] != '') {
					sendMpdCommand($mpd,"update \"".html_entity_decode($_POST['path'])."\"");
					echo json_encode(readMpdResponse($mpd));
					}
				break;
				
				case 'trackremove':
					if (isset($_GET['songid']) && $_GET['songid'] != '') {
					echo json_encode(remTrackQueue($mpd,$_GET['songid']));
					}
				break;
				
				case 'search':
					if (isset($_POST['query']) && $_POST['query'] != '' && isset($_GET['querytype']) && $_GET['querytype'] != '') {
					echo json_encode(searchDB($mpd,$_GET['querytype'],$_POST['query']));
					}
				break;
				}
				
		closeMpdSocket($mpd);
		}

} else {

echo 'MPD DB INTERFACE<br>';
echo 'INTERNAL USE ONLY<br>';
echo 'hosted on runeaudio.local:81';
}
?>

