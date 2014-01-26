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
 *  file: mpd-config.php
 *  version: 1.2
 *
 */
 
// common include
include('inc/connection.php');
playerSession('open',$db,'',''); 
$dbh = cfgdb_connect($db);
session_write_close();
?>
<?php
// handle (reset)
if (isset($_POST['reset']) && $_POST['reset'] == 1) {
$mpdconfdefault = cfgdb_read('',$dbh,'mpdconfdefault');
	foreach($mpdconfdefault as $element) {
		cfgdb_update('cfg_mpd',$dbh,$element['param'],$element['value_default']);
	}
	// tell worker to write new MPD config
	if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
	session_start();
	$_SESSION['w_queue'] = "mpdcfg";
	$_SESSION['w_active'] = 1;
	// set UI notify
	$_SESSION['notify']['title'] = 'Reset MPD Config';
	$_SESSION['notify']['msg'] = 'restarting MPD daemon...';
	session_write_close();
	} else {
	session_start();
	$_SESSION['notify']['title'] = 'Job Failed';
	$_SESSION['notify']['msg'] = 'background worker is busy.';
	session_write_close();
	}
unset($_POST);
}

// handle POST
if(isset($_POST['conf']) && !empty($_POST['conf'])) {
	foreach ($_POST['conf'] as $key => $value) {
		cfgdb_update('cfg_mpd',$dbh,$key,$value);
	}
	// tell worker to write new MPD config
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		session_start();
		$_SESSION['w_queue'] = "mpdcfg";
		$_SESSION['w_active'] = 1;
		// set UI notify
		$_SESSION['notify']['title'] = 'MPD Config modified';
		$_SESSION['notify']['msg'] = 'restarting MPD daemon...';
		session_write_close();
		} else {
		session_start();
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		session_write_close();
		}
}
	
// handle manual config
if(isset($_POST['mpdconf']) && !empty($_POST['mpdconf'])) {
// tell worker to write new MPD config
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		session_start();
		$_SESSION['w_queue'] = "mpdcfgman";
		$_SESSION['w_queueargs'] = $_POST['mpdconf'];
		$_SESSION['w_active'] = 1;
		// set UI notify
		$_SESSION['notify']['title'] = 'MPD Config modified';
		$_SESSION['notify']['msg'] = 'restarting MPD daemon...';
		session_write_close();
		} else {
		session_start();
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		session_write_close();
		}
}

// wait for worker output if $_SESSION['w_active'] = 1
waitWorker(1);

// check integrity of /etc/network/interfaces
if(!hashCFG('check_mpd',$db)) {
$_mpdconf = file_get_contents('/etc/mpd.conf');
// set manual config template
$tpl = "mpd-config-manual.html";
} else {

$mpdconf = cfgdb_read('',$dbh,'mpdconf');
// prepare array
$_mpd = array (
										'port' => '',
										'log_level' => '',
										'gapless_mp3_playback' => '',
										'auto_update' => '',
										'auto_update_depth' => '',
										'zeroconf_enabled' => '',
										'zeroconf_name' => '',
										'audio_output_format' => '',
										'mixer_type' => '',
										'audio_buffer_size' => '',
										'buffer_before_play' => '',
										'dsd_usb' => '',
										'volume_normalization' => ''
									);
//debug($mpdconf);							
// parse output for template $_mpdconf
foreach ($mpdconf as $key => $value) {
	foreach ($_mpd as $key2 => $value2) {
		if ($value['param'] == $key2) {
		$_mpd[$key2] = $value['value_player'];	
		}
	}
}

// setup select dropdown menu for template
// log_level
$_mpd_select['log_level'] .= "<option value=\"default\" ".(($_mpd['log_level'] == 'default') ? "selected" : "")." >default</option>\n";
$_mpd_select['log_level'] .= "<option value=\"secure\" ".(($_mpd['log_level'] == 'secure') ? "selected" : "")." >secure</option>\n";	
$_mpd_select['log_level'] .= "<option value=\"verbose\" ".(($_mpd['log_level'] == 'verbose') ? "selected" : "")." >verbose</option>\n";	

// gapeless_mp3_playback
$_mpd_select['gapless_mp3_playback'] .= "<option value=\"yes\" ".(($_mpd['gapless_mp3_playback'] == 'yes') ? "selected" : "")." >yes</option>\n";	
$_mpd_select['gapless_mp3_playback'] .= "<option value=\"no\" ".(($_mpd['gapless_mp3_playback'] == 'no') ? "selected" : "")." >no</option>\n";

// dsd_usb
$_mpd_select['dsd_usb'] .= "<option value=\"yes\" ".(($_mpd['dsd_usb'] == 'yes') ? "selected" : "")." >yes</option>\n";	
$_mpd_select['dsd_usb'] .= "<option value=\"no\" ".(($_mpd['dsd_usb'] == 'no') ? "selected" : "")." >no</option>\n";	

// volume_normalization
$_mpd_select['volume_normalization'] .= "<option value=\"yes\" ".(($_mpd['volume_normalization'] == 'yes') ? "selected" : "")." >yes</option>\n";	
$_mpd_select['volume_normalization'] .= "<option value=\"no\" ".(($_mpd['volume_normalization'] == 'no') ? "selected" : "")." >no</option>\n";	

// buffer_before_play
$_mpd_select['buffer_before_play'] .= "<option value=\"0%\" ".(($_mpd['buffer_before_play'] == '0%') ? "selected" : "")." >disabled</option>\n";	
$_mpd_select['buffer_before_play'] .= "<option value=\"10%\" ".(($_mpd['buffer_before_play'] == '10%') ? "selected" : "")." >10%</option>\n";	
$_mpd_select['buffer_before_play'] .= "<option value=\"20%\" ".(($_mpd['buffer_before_play'] == '20%') ? "selected" : "")." >20%</option>\n";	
$_mpd_select['buffer_before_play'] .= "<option value=\"30%\" ".(($_mpd['buffer_before_play'] == '30%') ? "selected" : "")." >30%</option>\n";	

// auto_update
$_mpd_select['auto_update'] .= "<option value=\"yes\" ".(($_mpd['auto_update'] == 'yes') ? "selected" : "").">yes</option>\n";	
$_mpd_select['auto_update'] .= "<option value=\"no\" ".(($_mpd['auto_update'] == 'no') ? "selected" : "").">no</option>\n";

// zeroconf_enabled
$_mpd_select['zeroconf_enabled'] .= "<option value=\"yes\" ".(($_mpd['zeroconf_enabled'] == 'yes') ? "selected" : "").">yes</option>\n";	
$_mpd_select['zeroconf_enabled'] .= "<option value=\"no\" ".(($_mpd['zeroconf_enabled'] == 'no') ? "selected" : "").">no</option>\n";																

// audio_output_format
$_mpd_select['audio_output_format'] .= "<option value=\"disabled\" ".(($_mpd['audio_output_format'] == 'disabled' OR $_mpd['audio_output_format'] == '') ? "selected" : "").">disabled</option>\n";
$_mpd_select['audio_output_format'] .= "<option value=\"44100:16:2\" ".(($_mpd['audio_output_format'] == '44100:16:2') ? "selected" : "").">44100:16:2</option>\n";
$_mpd_select['audio_output_format'] .= "<option value=\"96000:24:2\" ".(($_mpd['audio_output_format'] == '96000:24:2') ? "selected" : "").">96000:24:2</option>\n";

// mixer_type
$_mpd_select['mixer_type'] .= "<option value=\"disabled\" ".(($_mpd['mixer_type'] == 'none' OR $_mpd['mixer_type'] == '') ? "selected" : "").">disabled</option>\n";
$_mpd_select['mixer_type'] .= "<option value=\"software\" ".(($_mpd['mixer_type'] == 'software') ? "selected" : "").">enabled - software</option>\n";
$_mpd_select['mixer_type'] .= "<option value=\"hardware\" ".(($_mpd['mixer_type'] == 'hardware') ? "selected" : "").">enabled - hardware</option>\n";
// set normal config template
$tpl = "mpd-config.html";
}

// close DB connection
$dbh = null;
// unlock session files
playerSession('unlock',$db,'','');

// check actual active output interface
//$active_ao = _parseOutputsResponse(getMpdOutputs($mpd),1);
$active_ao = $_SESSION['ao'];
$_audioout = '';
if (wrk_checkStrSysfile('/proc/asound/cards','USB-Audio')) {
$_audioout .= "<option value=\"0\" ".(($active_ao == 0) ? "selected" : "").">USB Audio</option>\n";
}
if (($_SESSION['hwplatformid'] == '01' OR $_SESSION['hwplatformid'] == '04') && wrk_checkStrSysfile('/proc/asound/card1/pcm0p/info','bcm2835')) {
$_audioout .= "<option value=\"2\" ".(($active_ao == 2) ? "selected" : "").">Analog Out</option>\n";
$_audioout .= "<option value=\"3\" ".(($active_ao == 3) ? "selected" : "").">HDMI</option>\n";
} 
$_audioout .= "<option value=\"1\" ".(($active_ao == 1) ? "selected" : "").">Null (test output)</option>";

?>
<?php
$sezione = basename(__FILE__, '.php');
include('_header.php'); 
?>
<!-- content --!>
<?php
// wait for worker output if $_SESSION['w_active'] = 1
waitWorker(1);
eval("echoTemplate(\"".getTemplate("templates/$tpl")."\");");
?>
<!-- content -->
<?php 
debug($_POST);
?>
<?php include('_footer.php'); ?>