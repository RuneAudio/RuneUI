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
 *  file: app/settings_ctl.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */

// inspect POST
if (isset($_POST)) {
	
	// ----- HOSTNAME -----
	if (isset($_POST['hostname'])) {
		if (empty($_POST['hostname'])) {
		$args = 'runeaudio';
		} else {
		$args = $_POST['hostname'];
		}
		$redis->get('hostname') == $_POST['hostname'] || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'hostname', 'args' => $args ));		
	} 			
	
	// ----- NTP SERVER -----
	if (isset($_POST['ntpserver'])) {
		if (empty($_POST['ntpserver'])) {
		$args = 'pool.ntp.org';
		} else {
		$args = $_POST['ntpserver'];
		}
		$redis->get('ntpserver') == $args || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'ntpserver', 'args' => $args ));		
	} 
	
	// ----- KERNEL -----
	if (isset($_POST['kernel'])) {		
		// submit worker job
		$redis->get('kernel') == $_POST['kernel'] || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'kernelswitch', 'args' => $_POST['kernel'] ));	
	}
	
	if (isset($_POST['orionprofile'])) {		
		// submit worker job
		$redis->get('orionprofile') == $_POST['orionprofile'] || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'orionprofile', 'args' => $_POST['orionprofile'] ));		
	} 
	
	if (isset($_POST['i2smodule'])) {		
		// submit worker job
		$redis->get('i2smodule') == $_POST['i2smodule'] || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'i2smodule', 'args' => $_POST['i2smodule'] ));
		// autoswitch optimized kernel profile for BerryNOS mini DAC
		if ($_POST['i2smodule'] === 'berrynosmini') $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'orionprofile', 'args' => 'OrionV3_berrynosmini' ));
		// autoswitch optimized kernel profile for IQaudIO Pi-DAC
		if ($_POST['i2smodule'] === 'iqaudiopidac') $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'orionprofile', 'args' => 'OrionV3_iqaudio' ));
	} 
	
	// ----- FEATURES -----
	if (isset($_POST['features'])) {

			if ($_POST['features']['airplay']['enable'] == 1) {
				if ($redis->hGet('airplay','enable') !== $_POST['features']['airplay']['enable'] OR $redis->hGet('airplay','name') !== $_POST['features']['airplay']['name']) {
					// create worker job (start shairport)
					$jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'airplay', 'action' => 'start', 'args' => $_POST['features']['airplay']['name'] ));
				}
			} else {
				// create worker job (stop shairport)
				$redis->hGet('airplay','enable') === '0' || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'airplay', 'action' => 'stop', 'args' => $_POST['features']['airplay']['name'] ));
			}

			if ($_POST['features']['udevil'] == 1) {
				// create worker job (start udevil)
				$redis->get('udevil') == 1 || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'udevil', 'action' => 'start' ));
			} else {
				// create worker job (stop udevil)
				$redis->get('udevil') == 0 || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'udevil', 'action' => 'stop' ));
			}	

			if ($_POST['features']['coverart'] == 1 ) {
				$redis->get('coverart') == 1 || $redis->set('coverart', 1);
			} else {
				$redis->get('coverart') == 0 || $redis->set('coverart', 0);
			}			
			
			if ($_POST['features']['globalrandom'] == 1 ) {
				$redis->get('globalrandom') == 1 || $redis->set('globalrandom', 1);
			} else {
				$redis->get('globalrandom') == 0 || $redis->set('globalrandom', 0);
			}

			if ($_POST['features']['scrobbling_lastfm'] == 1) {
				// create worker job (start shairport)
				// $redis->get('scrobbling_lastfm') == 1 && $_POST['features']['lastfm']['user'] != $redis->hGet('lastfm','user') && $_POST['features']['lastfm']['pass'] != $redis->hGet('lastfm','pass') || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'scrobbling_lastfm', 'action' => 'start', 'args' => $_POST['features']['lastfm']));
				if (($_POST['features']['lastfm']['user'] != $redis->hGet('lastfm','user') OR $_POST['features']['lastfm']['pass'] != $redis->hGet('lastfm','pass')) OR $redis->get('scrobbling_lastfm') != $_POST['features']['scrobbling_lastfm']) {
					$jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'scrobbling_lastfm', 'action' => 'start', 'args' => $_POST['features']['lastfm']));
				}
			} else {
				// create worker job (stop shairport)
				$redis->get('scrobbling_lastfm') == 0 || $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'scrobbling_lastfm', 'action' => 'stop' ));
			}
			
	}
	
	// ----- C-MEDIA FIX -----
	if (isset($_POST['cmediafix'][1])){
		$redis->get('cmediafix') == 1 || $redis->set('cmediafix', 1);
	} else {
		$redis->get('cmediafix') == 0 || $redis->set('cmediafix', 0);
	}
	
	// ----- SYSTEM COMMANDS -----
	if (isset($_POST['syscmd'])){
		if ($_POST['syscmd'] == 'reboot') $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'reboot' ));
		if ($_POST['syscmd'] == 'poweroff') $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'poweroff' ));
		if ($_POST['syscmd'] == 'mpdrestart') $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'mpdrestart' ));
	}
			
}
waitSyWrk($redis,$jobID);
$template->hostname = $redis->get('hostname');
$template->ntpserver = $redis->get('ntpserver');
$template->orionprofile = $redis->get('orionprofile');
$template->airplay = $redis->hGetAll('airplay');
$template->udevil = $redis->get('udevil');
$template->coverart = $redis->get('coverart');
$template->globalrandom = $redis->get('globalrandom');
$template->scrobbling_lastfm = $redis->get('scrobbling_lastfm');
$template->lastfm = getLastFMauth($redis);
$template->cmediafix = $redis->get('cmediafix');
$template->proxy = $redis->hGetall('proxy');
$template->hwplatformid = $redis->get('hwplatformid');
$template->i2smodule = $redis->get('i2smodule');
$template->kernel = $redis->get('kernel');
