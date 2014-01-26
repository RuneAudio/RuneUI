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
 *  file: settings.php
 *  version: 1.2
 *
 */
 
// common include
include('inc/connection.php');
playerSession('open',$db,'','');
playerSession('unlock',$db,'','');
?>
<?php 
if (isset($_POST['syscmd'])){
	switch ($_POST['syscmd']) {

	case 'reboot':
	
			if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
			// start / respawn session
			session_start();
			$_SESSION['w_queue'] = "reboot";
			$_SESSION['w_active'] = 1;
			// set UI notify
			$_SESSION['notify']['title'] = 'REBOOT';
			$_SESSION['notify']['msg'] = 'reboot player initiated...';
			// unlock session file
			playerSession('unlock');
			} else {
			$_SESSION['notify']['msg'] = 'background worker busy...';
			}
		// unlock session file
		playerSession('unlock');
		break;
		
	case 'poweroff':
	
			if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
			// start / respawn session
			session_start();
			$_SESSION['w_queue'] = "poweroff";
			$_SESSION['w_active'] = 1;
			// set UI notify
			$_SESSION['notify']['title'] = 'SHUTDOWN';
			$_SESSION['notify']['msg'] = 'shutdown player initiated...';
			// unlock session file
			} else {
			$_SESSION['notify']['msg'] = 'background worker busy...';
			}
		// unlock session file
		playerSession('unlock');
		break;

	case 'mpdrestart':
	
			if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
			// start / respawn session
			session_start();
			$_SESSION['w_queue'] = "mpdrestart";
			$_SESSION['w_active'] = 1;
			// set UI notify
			$_SESSION['notify']['title'] = 'MPD RESTART';
			$_SESSION['notify']['msg'] = 'restarting MPD daemon...';
			// unlock session file
			playerSession('unlock');
			} else {
			echo "background worker busy";
			}
		break;
	
	case 'backup':
			
			if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
			// start / respawn session
			session_start();
			$_SESSION['w_jobID'] = wrk_jobID();
			$_SESSION['w_queue'] = 'backup';
			$_SESSION['w_active'] = 1;
			playerSession('unlock');
				// wait worker response loop
				while (1) {
				sleep(2);
				session_start();
					if ( isset($_SESSION[$_SESSION['w_jobID']]) ) {
					// set UI notify
					$_SESSION['notify']['title'] = 'BACKUP';
					$_SESSION['notify']['msg'] = 'backup complete.';
					pushFile($_SESSION[$_SESSION['w_jobID']]);
					unset($_SESSION[$_SESSION['w_jobID']]);
					break;
					}
				session_write_close();
				}
			} else {
			session_start();
			$_SESSION['notify']['title'] = 'Job Failed';
			$_SESSION['notify']['msg'] = 'background worker is busy.';
			}
		// unlock session file
		playerSession('unlock');
		break;
	
	case 'updatempdDB':
			
			if ( !$mpd) {
				session_start();
				$_SESSION['notify']['title'] = 'Error';
				$_SESSION['notify']['msg'] = 'Cannot connect to MPD Daemon';
			} else {
				sendMpdCommand($mpd,'update');
				session_start();
				$_SESSION['notify']['title'] = 'MPD Update';
				$_SESSION['notify']['msg'] = 'database update started...';
			}
			
	break;
		
	case 'totalbackup':
		
		break;
		
	case 'restore':
		
		break;
	}

}

if (isset($_POST['orionprofile']) && $_POST['orionprofile'] != $_SESSION['orionprofile']){
	// load worker queue 
	if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
	// start / respawn session
	session_start();
	$_SESSION['w_queue'] = 'orionprofile';
	$_SESSION['w_queueargs'] = $_POST['orionprofile']." ".$_SESSION['hwplatformid'];
	// set UI notify
	$_SESSION['notify']['title'] = 'KERNEL PROFILE';
	$_SESSION['notify']['msg'] = 'orionprofile changed <br> current profile:     <strong>'.$_POST['orionprofile']."</strong>";
	// unlock session file
	playerSession('unlock');
	} else {
	echo "background worker busy";
	}
	
	// activate worker job
	if ($_SESSION['w_lock'] != 1) {
	// start / respawn session
	session_start();
	$_SESSION['w_active'] = 1;
	// save new value on SQLite datastore
	playerSession('write',$db,'orionprofile',$_POST['orionprofile']);
	// unlock session file
	playerSession('unlock');
	} else {
	return "background worker busy";
	}

}

if (isset($_POST['cmediafix']) && $_POST['cmediafix'] != $_SESSION['cmediafix']){
	// load worker queue 
	// start / respawn session
	session_start();
	// save new value on SQLite datastore
	if ($_POST['cmediafix'] == 1 OR $_POST['cmediafix'] == 0) {
	playerSession('write',$db,'cmediafix',$_POST['cmediafix']);
	}
	// set UI notify
	if ($_POST['cmediafix'] == 1) {
	$_SESSION['notify']['title'] = '';
	$_SESSION['notify']['msg'] = 'CMediaFix enabled';
	} else {
	$_SESSION['notify']['title'] = '';
	$_SESSION['notify']['msg'] = 'CMediaFix disabled';
	}
	// unlock session file
	playerSession('unlock');
}

if (isset($_POST['airplay']) && $_POST['airplay'] != $_SESSION['airplay']) {
	// start / respawn session
	session_start();
	// save new value on SQLite datastore
	if ($_POST['airplay'] == 1 OR $_POST['airplay'] == 0) {
	playerSession('write',$db,'airplay',$_POST['airplay']);
	// load worker queue
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
			// start / respawn session
			session_start();
			if ($_POST['airplay'] == 1) {
			$_SESSION['w_queue'] = "airplay";
			$_SESSION['w_queueargs'] = "start";
			// set UI notify
			$_SESSION['notify']['msg'] = 'AirPlay enabled';
			}
			if ($_POST['airplay'] == 0) {
			$_SESSION['w_queue'] = "airplay";
			$_SESSION['w_queueargs'] = "stop";
			// set UI notify
			$_SESSION['notify']['msg'] = 'AirPlay disabled';
			}
			// active worker queue
			$_SESSION['w_active'] = 1;
		} else {
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		}
	}	
	// unlock session file
	playerSession('unlock');
}

if (isset($_POST['udevil']) && $_POST['udevil'] != $_SESSION['udevil']) {
	// start / respawn session
	session_start();
	// save new value on SQLite datastore
	if ($_POST['udevil'] == 1 OR $_POST['udevil'] == 0) {
	playerSession('write',$db,'udevil',$_POST['udevil']);
	// load worker queue
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		// start / respawn session
			session_start();
			if ($_POST['udevil'] == 1) {
			$_SESSION['w_queue'] = "udevil";
			$_SESSION['w_queueargs'] = "start";
			// set UI notify
			$_SESSION['notify']['msg'] = 'USB-Automount enabled';
			}
			if ($_POST['udevil'] == 0) {
			$_SESSION['w_queue'] = "udevil";
			$_SESSION['w_queueargs'] = "stop";
			// set UI notify
			$_SESSION['notify']['msg'] = 'USB-Automount disabled';
			}
			// active worker queue
			$_SESSION['w_active'] = 1;
		} else {
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		}
	}	
	// unlock session file
	playerSession('unlock');
}

if (isset($_POST['coverart']) && $_POST['coverart'] != $_SESSION['coverart']) {
	// start / respawn session
	session_start();
	// save new value on SQLite datastore
	if ($_POST['coverart'] == 1 OR $_POST['coverart'] == 0) {
	playerSession('write',$db,'coverart',$_POST['coverart']);
		// set UI notify
		if ($_POST['coverart'] == 1) {
					$_SESSION['notify']['msg'] = 'Display album cover enabled';
		} else {
					$_SESSION['notify']['msg'] = 'Display album cover disabled';
		}
		
	}	
	// unlock session file
	playerSession('unlock');
}

// get lastfm auth ENV settings
$_lastfm = getLastFMauth($db);


if (!empty($_POST['scrobbling_lastfm']) && $_POST['scrobbling_lastfm'] == 1 && ($_POST['scrobbling_lastfm'] != $_SESSION['scrobbling_lastfm'] OR ($_POST['lastfm']['pass'] != $_lastfm['pass'] && !empty($_POST['lastfm']['pass'])) OR $_POST['lastfm']['user'] != $_lastfm['user'] && !empty($_POST['lastfm']['user'])) ) {
// start / respawn session
session_start();
// save new value on SQLite datastore
playerSession('write',$db,'scrobbling_lastfm',1);

	if (($_POST['lastfm']['user'] != $_lastfm['user'] && !empty($_POST['lastfm']['user'])) OR ($_POST['lastfm']['pass'] != $_lastfm['pass'] && !empty($_POST['lastfm']['pass']))) {
	$_SESSION['w_queueargs']['lastfm'] = $_POST['lastfm'];
	$_SESSION['notify']['msg'] = '\nLast.FM auth data updated\n';
	}
	
	// active worker queue
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		$_SESSION['w_queue'] = 'scrobbling_lastfm';
		$_SESSION['w_queueargs']['action'] = 'start';
		// set UI notify
		$_SESSION['notify']['msg'] .= 'Last.FM scrobbling enabled';
		$_SESSION['w_active'] = 1;
		} else {
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		}
// unlock session file
playerSession('unlock');

} else {
	if (isset($_POST['scrobbling_lastfm']) && $_POST['scrobbling_lastfm'] != $_SESSION['scrobbling_lastfm']) {
	// start / respawn session
	session_start();
	// save new value on SQLite datastore
	playerSession('write',$db,'scrobbling_lastfm',0);
		// active worker queue
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		// disable LastFM scrobbling
		$_SESSION['w_queue'] = 'scrobbling_lastfm';
		$_SESSION['w_queueargs']['action'] = 'stop';
		// set UI notify
		$_SESSION['notify']['msg'] = 'Last.FM scrobbling disabled';
		$_SESSION['w_active'] = 1;
		} else {
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		}
	// unlock session file
	playerSession('unlock');
	}
}


if (isset($_POST['hostname']) && $_POST['hostname'] != $_SESSION['hostname']) {
	// start / respawn session
	session_start();
	if (empty($_POST['hostname'])) {	
	$_POST['hostname'] = 'runeaudio';
	}
	// load worker queue
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		// start / respawn session
		session_start();
		$_SESSION['w_queue'] = "hostname";
		$_SESSION['w_queueargs'] = $_POST['hostname'];
		// set UI notify
		$_SESSION['notify']['title'] = 'Hostname changed';
		$_SESSION['notify']['msg'] = 'new hostname: '.$_POST['hostname'];
		// active worker queue
		$_SESSION['w_active'] = 1;
		} else {
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		}

	// unlock session file
	playerSession('unlock');
}

if (isset($_POST['ntpserver']) && $_POST['ntpserver'] != $_SESSION['ntpserver']) {
	// start / respawn session
	session_start();
	if (empty($_POST['ntpserver'])) {	
	$_POST['ntpserver'] = 'ntp.inrim.it';
	}
	// load worker queue
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		// start / respawn session
		session_start();
		$_SESSION['w_queue'] = "ntpserver";
		$_SESSION['w_queueargs'] = $_POST['ntpserver'];
		// set UI notify
		$_SESSION['notify']['title'] = 'NTP server changed';
		$_SESSION['notify']['msg'] = 'new NTP server: '.$_POST['ntpserver'];
		// active worker queue
		$_SESSION['w_active'] = 1;
		} else {
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		}

	// unlock session file
	playerSession('unlock');
}

// configure html select elements
$_system_select['orionprofile'] .= "<option value=\"default\" ".(($_SESSION['orionprofile'] == 'default') ? "selected" : "").">ArchLinux default</option>\n";
$_system_select['orionprofile'] .= "<option value=\"RuneAudio\" ".(($_SESSION['orionprofile'] == 'RuneAudio') ? "selected" : "").">RuneAudio</option>\n";
$_system_select['orionprofile'] .= "<option value=\"ACX\" ".(($_SESSION['orionprofile'] == 'ACX') ? "selected" : "").">ACX</option>\n";
$_system_select['orionprofile'] .= "<option value=\"Orion\" ".(($_SESSION['orionprofile'] == 'Orion') ? "selected" : "").">Orion</option>\n";
$_system_select['orionprofile'] .= "<option value=\"OrionV2\" ".(($_SESSION['orionprofile'] == 'OrionV2') ? "selected" : "").">OrionV2</option>\n";
$_system_select['orionprofile'] .= "<option value=\"Um3ggh1U\" ".(($_SESSION['orionprofile'] == 'Um3ggh1U') ? "selected" : "").">Um3ggh1U</option>\n";
$_system_select['cmediafix1'] .= "<input type=\"radio\" name=\"cmediafix\" id=\"toggleOption1\" value=\"1\" ".(($_SESSION['cmediafix'] == 1) ? "checked=\"checked\"" : "").">\n";
$_system_select['cmediafix0'] .= "<input type=\"radio\" name=\"cmediafix\" id=\"toggleOption2\" value=\"0\" ".(($_SESSION['cmediafix'] == 0) ? "checked=\"checked\"" : "").">\n";
$_system_select['airplay1'] .= "<input type=\"radio\" name=\"airplay\" id=\"toggleAirplay1\" value=\"1\" ".(($_SESSION['airplay'] == 1) ? "checked=\"checked\"" : "").">\n";
$_system_select['airplay0'] .= "<input type=\"radio\" name=\"airplay\" id=\"toggleAirplay2\" value=\"0\" ".(($_SESSION['airplay'] == 0) ? "checked=\"checked\"" : "").">\n";
$_system_select['scrobbling_lastfm1'] .= "<input type=\"radio\" name=\"scrobbling_lastfm\" id=\"toggleScrobblingLastfm1\" value=\"1\" ".(($_SESSION['scrobbling_lastfm'] == 1) ? "checked=\"checked\"" : "").">\n";
$_system_select['scrobbling_lastfm0'] .= "<input type=\"radio\" name=\"scrobbling_lastfm\" id=\"toggleScrobblingLastfm2\" value=\"0\" ".(($_SESSION['scrobbling_lastfm'] == 0) ? "checked=\"checked\"" : "").">\n";
$_system_select['udevil1'] .= "<input type=\"radio\" name=\"udevil\" id=\"toggleUdevil1\" value=\"1\" ".(($_SESSION['udevil'] == 1) ? "checked=\"checked\"" : "").">\n";
$_system_select['udevil0'] .= "<input type=\"radio\" name=\"udevil\" id=\"toggleUdevil2\" value=\"0\" ".(($_SESSION['udevil'] == 0) ? "checked=\"checked\"" : "").">\n";
$_system_select['coverart1'] .= "<input type=\"radio\" name=\"coverart\" id=\"toggleCoverart1\" value=\"1\" ".(($_SESSION['coverart'] == 1) ? "checked=\"checked\"" : "").">\n";
$_system_select['coverart0'] .= "<input type=\"radio\" name=\"coverart\" id=\"toggleCoverart2\" value=\"0\" ".(($_SESSION['coverart'] == 0) ? "checked=\"checked\"" : "").">\n";
$_hostname = $_SESSION['hostname'];
$_ntpserver = $_SESSION['ntpserver'];
// hide lastFM auth fields if disabled 
if ($_SESSION['scrobbling_lastfm'] != 1) {
$_lastfm_hide = 'hide';
}
// set template
$tpl = "settings.html";
?>
<?php
$sezione = basename(__FILE__, '.php');
include('_header.php'); 
?>
<!-- content --!>
<?php
// wait for worker output if $_SESSION['w_active'] = 1
waitWorker(1);
if (isset($_POST['hostname'])) {
$_hostname = $_POST['hostname'];
}
if (isset($_POST['ntpserver'])) {
$_ntpserver = $_POST['ntpserver'];
}
if (isset($_POST['lastfm'])) {
$_lastfm = $_POST['lastfm'];
}
eval("echoTemplate(\"".getTemplate("templates/$tpl")."\");");
?>
<!-- content -->
<?php 
debug($_POST);
?>
<?php include('_footer.php'); ?>