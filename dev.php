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
 *  file: dev.php
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
			echo "background worker busy";
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
			playerSession('unlock');
			} else {
			echo "background worker busy";
			}
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
		
	case 'phprestart':
			if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
			// start / respawn session
			session_start();
			$_SESSION['w_queue'] = "phprestart";
			$_SESSION['w_active'] = 1;
			// unlock session file
			playerSession('unlock');
			} else {
			echo "background worker busy";
			}
		// set UI notify
		$_SESSION['notify']['title'] = 'PHP RESTART';
		$_SESSION['notify']['msg'] = 'restarting php backend...';
		// unlock session file
		playerSession('unlock');
		break;
	
	case 'syschmod':
			if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
			// start / respawn session
			session_start();
			$_SESSION['w_queue'] = "syschmod";
			$_SESSION['w_active'] = 1;
			$_SESSION['notify']['title'] = 'Setup filesystem';
			$_SESSION['notify']['msg'] = 'Permission reconstruced.';
			// unlock session file
			playerSession('unlock');
			} else {
			$_SESSION['notify']['msg'] = 'Background worker busy....';
			}
		// unlock session file
		playerSession('unlock');
		break;
	
	case 'blankplayerid':
		session_start();
		playerSession('write',$db,'playerid','');
		playerSession('write',$db,'hwplatform','');
		playerSession('write',$db,'hwplatformid','');
		playerSession('unlock');
		break;
		
	case 'phpclearcache':
		wrk_opcache('reset');
		session_start();
		$_SESSION['notify']['title'] = '';
		$_SESSION['notify']['msg'] = 'PHP 5.5 OPCache cleared';
		playerSession('unlock');
		break;
	
	case 'clearimg':
		session_start();
		$_SESSION['w_queue'] = "clearimg";
		$_SESSION['w_active'] = 1;
		$_SESSION['notify']['title'] = '';
		$_SESSION['notify']['msg'] = 'SD Image logs cleared';
		playerSession('unlock');
		break;
	
	case 'workerrestart':
			// reset worker status
			session_start();
			$_SESSION['w_queue'] = '';
			$_SESSION['w_queueargs'] = '';
			$_SESSION['w_active'] = 0;
			$_SESSION['w_lock'] = 0;
			$_SESSION['w_jobID'] = '';
			// queue worker job
			$_SESSION['w_queue'] = "workerrestart";
			$_SESSION['w_active'] = 1;
			$_SESSION['notify']['title'] = 'Worker reset';
			$_SESSION['notify']['msg'] = 'rune_SY_wrk.php restarted...';
		// unlock session file
		playerSession('unlock');
		break;
	
	case 'workersessionreset':
		session_start();
		$_SESSION['w_queue'] = '';
		$_SESSION['w_queueargs'] = '';
		$_SESSION['w_lock'] = '';
		$_SESSION['w_active'] = '';
		$_SESSION['w_jobID'] = '';
		$_SESSION['notify']['title'] = '';
		$_SESSION['notify']['msg'] = 'PHP worker Session DATA cleared';
		playerSession('unlock');
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
		
	case 'totalbackup':
		
		break;
		
	case 'restore':
		
		break;
	}

}

if (isset($_POST['save'])){
	session_start();
	// commit debug levels and settings
	if ($_POST['dev'] != $_SESSION['dev']) {
	playerSession('write',$db,'dev',$_POST['dev']);
	}
	if ($_POST['debug'] != $_SESSION['debug']) {
	playerSession('write',$db,'debug',$_POST['debug']);
	}
	if ($_POST['hiddendebug'] != $_SESSION['hiddendebug']) {
	playerSession('write',$db,'hiddendebug',$_POST['hiddendebug']);
	}
	// set UI notify
	$_SESSION['notify']['title'] = 'Debug settings changed';
	$_SESSION['notify']['msg'] = '';
	// unlock session file
	playerSession('unlock');
}

if (isset($_POST['opcache']) && $_POST['opcache'] != $_SESSION['opcache']) {
// start / respawn session
session_start();
	if ($_SESSION['w_lock'] != 1 && $_SESSION['w_queue'] == '') {
		if ($_POST['opcache'] == 1) {
		$_SESSION['notify']['msg'] = 'Persistent cache enabled.';
		} else {
		$_SESSION['notify']['msg'] = 'Persistent cache disabled.';
		}
	$_SESSION['w_queue'] = "opcache";
	$_SESSION['w_queueargs'] =  $_POST['opcache'];
	$_SESSION['w_active'] = 1;
	} else {
	$_SESSION['notify']['msg'] = 'background worker busy...retry later...';
	}
// set UI notify
$_SESSION['notify']['title'] = 'PHP 5.5 OPcache';

// unlock session file
playerSession('unlock');
}
// wait for worker output if $_SESSION['w_active'] = 1
waitWorker(1);
?>
<?php 
$sezione = basename(__FILE__, '.php');
include('_header.php'); 
?>
<div class="container">
	<h1>Development settings</h1>
		<form class="form-horizontal" method="post">
		<fieldset>
			<legend>PHP backend control</legend>
			<p>Just some handy "tools" for PHP backend management.</p>
			<div class="control-group">
				<label class="control-label">Clear PHP 5.5 OPcache</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="phpclearcache" id="syscmd-phpclearcache">
				</div>
			</div>			
			<div class="control-group">
				<label class="control-label">View PHP 5.5 OPcache status</label>
				<div class="controls">
					<a class="btn" type="submit" href="command/opcache.php" name="syscmd" id="syscmd-viewphpcache" target="_blank">php cache status</a>
				</div>
			</div>
			<div class="control-group">
				<label class="control-label">Restart PHP service</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="phprestart" id="syscmd-phprestart">
				</div>
			</div> 
		<div class="control-group">
				<label class="control-label">PHP 5.5 OPcache (persistent cache)</label>
				<div class="controls">
					<div class="toggle">
						<label class="toggle-radio" for="toggleOption5" >ON</label>
						<input type="radio" name="opcache" id="toggleOption6" value="1" <?php if ($_SESSION['opcache'] == 1) echo "checked=\"checked\""; ?>>
						<label class="toggle-radio" for="toggleOption6">OFF</label>
						<input type="radio" name="opcache" id="toggleOption5" value="0" <?php if ($_SESSION['opcache'] == 0) echo "checked=\"checked\""; ?>>
					</div>
					<span class="help-block">Enable PHP 5.5 OPcache persistence. This drastically speed-up page render, but you must manually clear cache (use above button) at any source code change. This is enabled by default in production environment.</span>
				</div>
			</div>
			<div class="form-actions">
				<button class="btn btn-primary btn-large" value="apply" name="apply" type="submit">Save settings</button>
			</div>
		</fieldset>
	</form>
	<form class="form-horizontal" method="post">
		<fieldset>
			<legend>Debug level</legend>
			<p>
				We provide different debug levels:<br><br>
				<span class="help-block">defcon[0]: no debug output (default) </span>
				<span class="help-block">defcon[1]: output system stats and some informations about Audio backend</span> 
				<span class="help-block">defcon[2]: output same as defcon[1] and UI PHP SESSION status</span> 
				<span class="help-block">defcon[3]: output ALL debug info (add SQLite datastore content)</span> 
			</p>
			<div class="control-group">
				<label class="control-label">Debug level</label>
				<div class="controls">
					<select class="input-large" name="debug">
						<option value="0" <?php if ($_SESSION['debug'] == '0') echo "selected"; ?>>defcon [0] (default)</option>
						<option value="1" <?php if ($_SESSION['debug'] == '1') echo "selected"; ?>>defcon [1] (sys+MPD)</option>
						<option value="2" <?php if ($_SESSION['debug'] == '2') echo "selected"; ?>>defcon [2] (sys+MPD+PHP)</option>
						<option value="3" <?php if ($_SESSION['debug'] == '3') echo "selected"; ?>>defcon [3] (sys+MPD+PHP+SQL)</option>
					</select>
				</div>
			</div>
			<!--<div class="control-group">
				<label class="control-label">VM RuneAudio DEV</label>
				<div class="controls">
					<div class="toggle">
						<label class="toggle-radio" for="toggleOption2" >ON</label>
						<input type="radio" name="dev" id="toggleOption1" value="1" <?php if ($_SESSION['dev'] == 1) echo "checked=\"checked\""; ?>>
						<label class="toggle-radio" for="toggleOption1">OFF</label>
						<input type="radio" name="dev" id="toggleOption2" value="0" <?php if ($_SESSION['dev'] == 0) echo "checked=\"checked\""; ?>>
					</div>
					<span class="help-block">Enable this setting if you are using RuneAudio Development Virtual Machine</span>
				</div>
			</div> -->
			<div class="control-group">
				<label class="control-label">Hide debug informations</label>
				<div class="controls">
					<div class="toggle">
						<label class="toggle-radio" for="toggleOption4" >ON</label>
						<input type="radio" name="hiddendebug" id="toggleOption3" value="1" <?php if ($_SESSION['hiddendebug'] == 1) echo "checked=\"checked\""; ?>>
						<label class="toggle-radio" for="toggleOption3">OFF</label>
						<input type="radio" name="hiddendebug" id="toggleOption4" value="0" <?php if ($_SESSION['hiddendebug'] == 0) echo "checked=\"checked\""; ?>>
					</div>
					<span class="help-block">Enable this setting if you want hide debug information (use "show page source" Browser function to view debug data)</span>
				</div>
			</div>
			<div class="form-actions">
				<button class="btn btn-primary btn-large" value="save" name="save" type="submit">Save settings</button>
			</div>
		</fieldset>
	</form>
	<form class="form-horizontal" method="post">
		<fieldset>
			<legend>System commands</legend>
			<p>Just some handy system commands, without the hassle of logging into SSH.</p>
			<div class="control-group">
				<label class="control-label">System reboot</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="reboot" id="syscmd-reboot">
				</div>
			</div>
			<div class="control-group">
				<label class="control-label">System poweroff</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="poweroff" id="syscmd-poweroff">
				</div>
			</div>
			<!--<div class="control-group">
				<label class="control-label">Setup FS permissions</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="syschmod" id="syscmd-syschmod">
				</div>
			</div> -->
			<div class="control-group">
				<label class="control-label">Restart MPD service</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="mpdrestart" id="syscmd-mpdrestart">
				</div>
			</div>			
			<div class="control-group">
				<label class="control-label">reset NET config</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="netconfreset" id="syscmd-netconfreset">
				</div>
			</div>
			<div class="control-group">
				<label class="control-label">reset MPD config</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="mpdconfreset" id="syscmd-mpdconfreset">
				</div>
			</div>
			<div class="control-group">
				<label class="control-label">blank playerID</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="blankplayerid" id="syscmd-blankplayerid">
					<span class="help-block">Actual playerID: <?php echo $_SESSION['playerid'];?></span>
				</div>
			</div>
			<div class="control-group">
				<label class="control-label">clear installation</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="clearimg" id="syscmd-clearimg">
					<span class="help-block">Clear command history, logs, reset image parameters to default settings.</span>
					<span class="help-block">NOTE: (Dev team function) Use this function prior to public a RuneOS image.</span>
					<span class="help-block">WARNING: Automatic system shutdown after execution!</span>
				</div>
			</div>
		</fieldset>
	</form>
	<form class="form-horizontal" method="post">
		<fieldset>
			<legend>Background WORKER control</legend>
			<p>Just some handy "tools" for Background WORKER management.</p>
			<div class="control-group">
				<label class="control-label">restart WORKER</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="workerrestart" id="syscmd-workerrestart">
				</div>
			</div>	
			<div class="control-group">
				<label class="control-label">reset WORKER session</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="workersessionreset" id="syscmd-workersessionreset">
				</div>
			</div>	
		</fieldset>
	</form>
<!-- <form class="form-horizontal" method="post">
		<fieldset>
			<legend>Backup / Restore configuration</legend>
			<p>&nbsp;</p>
			<div class="control-group">
				<label class="control-label">Backup player config</label>
				<div class="controls">
					<input class="btn" type="submit" name="syscmd" value="backup" id="syscmd-backup">
				</div>
			</div>
					</fieldset>
	</form>
	<form class="form-horizontal" method="post">
		<fieldset>
			<div class="control-group" >
				<label class="control-label" for="port">Configuration file</label>
				<div class="controls">
					<div class="fileupload fileupload-new" data-provides="fileupload">
					  <span class="btn btn-file"><span class="fileupload-new">restore</span><span class="fileupload-exists">Change</span><input type="file" /></span>
					  <span class="fileupload-preview"></span>
					  <a href="#" class="close fileupload-exists" data-dismiss="fileupload" style="float: none">×</a>
					</div>			
				</div>
			</div>
			<div class="form-actions">
				<button class="btn btn-primary btn-large" value="restore" name="syscmd" type="submit">Restore config</button>
			</div>
		</fieldset>
	</form> -->
</div>
<?php include('_footer.php'); ?>