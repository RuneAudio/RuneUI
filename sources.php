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
 *  file: sources.php
 *  version: 1.2
 *
 */
 
// common include
include('inc/connection.php');
playerSession('open',$db,'',''); 
?>
<?php
// handle (reset)
if (isset($_POST['reset']) && $_POST['reset'] == 1) {
	// tell worker to write new MPD config
	if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
	session_start();
	$_SESSION['w_queue'] = "sourcecfgman";
	$_SESSION['w_queueargs']  = 'sourcecfgreset';
	$_SESSION['w_active'] = 1;
	// set UI notify
	$_SESSION['notify']['title'] = 'auto.nas modified';
	$_SESSION['notify']['msg'] = 'remount shares in progress...';
	session_write_close();
	} else {
	session_start();
	$_SESSION['notify']['title'] = 'Job Failed';
	$_SESSION['notify']['msg'] = 'background worker is busy.';
	session_write_close();
	}
unset($_POST);
}

if (isset($_GET['updatempd']) && $_GET['updatempd'] == '1' ){
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
}

// handle POST
if(isset($_POST['mount']) && !empty($_POST['mount'])) {
// convert slashes for remotedir path
$_POST['mount']['remotedir'] = str_replace('\\', '/', $_POST['mount']['remotedir']);

	if ($_POST['mount']['rsize'] == '') {
	$_POST['mount']['rsize'] = 16384;
	}

	if ($_POST['mount']['wsize'] == '') {
	$_POST['mount']['wsize'] = 16384;
	}

	if ($_POST['mount']['options'] == '') {
		if ($_POST['mount']['type'] == 'cifs') {
		$_POST['mount']['options'] = "cache=strict,ro";
		} else {
		$_POST['mount']['options'] = "nfsvers=3,ro,noatime";
		}
	}
// activate worker
if (isset($_POST['delete']) && $_POST['delete'] == 1) {
// delete an existing entry
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		session_start();
		$_SESSION['w_queue'] = 'sourcecfg';
		$_POST['mount']['action'] = 'delete';
		$_SESSION['w_queueargs'] = $_POST;
		$_SESSION['w_active'] = 1;
		// set UI notify
		$_SESSION['notify']['title'] = 'mount point deleted';
		$_SESSION['notify']['msg'] = 'Update DB in progress...';
		session_write_close();
		} else {
		session_start();
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		session_write_close();
		}
	
	} else {
	
		if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		session_start();
		$_SESSION['w_queue'] = 'sourcecfg';
		$_SESSION['w_queueargs']  = $_POST;
		$_SESSION['w_active'] = 1;
		// set UI notify
		$_SESSION['notify']['title'] = 'mount point modified';
		$_SESSION['notify']['msg'] = 'Update DB in progress...';
		session_write_close();
		} else {
		session_start();
		$_SESSION['notify']['title'] = 'Job Failed';
		$_SESSION['notify']['msg'] = 'background worker is busy.';
		session_write_close();
		} 
	}
}
	
// wait for worker output if $_SESSION['w_active'] = 1
waitWorker(5,'sources');

$dbh = cfgdb_connect($db);
$source = cfgdb_read('cfg_source',$dbh);
$dbh = null;
// set normal config template
$tpl = "sources.html";
// unlock session files
playerSession('unlock',$db,'','');
foreach ($source as $mp) {
if (wrk_checkStrSysfile('/proc/mounts',$mp['name']) ) {
	$icon = "<i class='icon-ok green sx'></i>";
	} else {
	$icon = "<i class='icon-remove red sx'></i>";
	}
$_mounts .= "<p><a href=\"sources.php?p=edit&id=".$mp['id']."\" class='btn btn-large btn-block'> ".$icon." NAS/".$mp['name']."&nbsp;&nbsp;&nbsp;&nbsp;//".$mp['address']."/".$mp['remotedir']." </a></p>";
}
?>
<?php
$sezione = basename(__FILE__, '.php');
include('_header.php'); 
?>
<!-- content --!>
<?php
if (isset($_GET['p']) && !empty($_GET['p'])) {

	if (isset($_GET['id']) && !empty($_GET['id'])) {
	$_id = $_GET['id'];
		foreach ($source as $mount) {
			if ($mount['id'] == $_id) {
			$_name = $mount['name'];
			$_address = $mount['address'];
			$_remotedir = $mount['remotedir'];
			$_username = $mount['username'];
			$_password = $mount['password'];
			$_rsize = $mount['rsize'];
			$_wsize = $mount['wsize'];
			// mount type select
			$_source_select['type'] .= "<option value=\"cifs\" ".(($mount['type'] == 'cifs') ? "selected" : "")." >SMB/CIFS</option>\n";	
			$_source_select['type'] .= "<option value=\"nfs\" ".(($mount['type'] == 'nfs') ? "selected" : "")." >NFS</option>\n";
			// temp fix for BBB image
			if ($_SESSION['hwplatformid'] != '04') {
			$_source_select['charset'] .= "<option value=\"utf8\" ".(($mount['charset'] == 'utf8') ? "selected" : "")." >UTF8 (default)</option>\n";	
			}
			$_source_select['charset'] .= "<option value=\"iso8859-1\" ".(($mount['charset'] == 'iso8859-1') ? "selected" : "")." >ISO 8859-1</option>\n";
			$_source_select['smbguest1'] .= "<input type=\"radio\" name=\"smbguest\" id=\"smbguest1\" value=\"1\" ".((empty($mount['username'])) ? "checked=\"checked\"" : "").">\n";
			$_source_select['smbguest0'] .= "<input type=\"radio\" name=\"smbguest\" id=\"smbguest2\" value=\"0\" ".((!empty($mount['username'])) ? "checked=\"checked\"" : "").">\n";
			if (empty($mount['username'])) {
			$_hideauth = 'hide';
			}
			$_options = $mount['options'];
			$_error = $mount['error'];
				if (empty($_error)) {
				$_hideerror = 'hide';
				}
			}
		}
	$_title = 'Edit network mount';
	$_action = 'edit';
	} else {
	$_title = 'Add new network mount';
	$_hide = 'hide';
	$_hideerror = 'hide';
	$_action = 'add';
	$_source_select['type'] .= "<option value=\"cifs\">SMB/CIFS</option>\n";	
	$_source_select['type'] .= "<option value=\"nfs\">NFS</option>\n";
	// temp fix for BBB image
	if ($_SESSION['hwplatformid'] != '04') {
	$_source_select['charset'] .="<option value=\"utf8\">UTF8 (default)</option>\n";
	}
	$_source_select['charset'] .="<option value=\"iso8859-1\">ISO 8859-1</option>\n";
	$_source_select['smbguest1'] .= "<input type=\"radio\" name=\"smbguest\" id=\"smbguest1\" value=\"1\">\n";
	$_source_select['smbguest0'] .= "<input type=\"radio\" name=\"smbguest\" id=\"smbguest2\" value=\"0\">\n";
	}
	$tpl = 'source.html';
} 
debug($_POST);
eval("echoTemplate(\"".getTemplate("templates/$tpl")."\");");
?>
<!-- content -->
<?php include('_footer.php'); ?>