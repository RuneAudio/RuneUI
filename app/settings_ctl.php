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
        $redis->get('hostname') == $_POST['hostname'] || $jobID[] = wrk_control($redis, 'newjob', $data = array( 'wrkcmd' => 'hostname', 'args' => $args ));        
    }
    // ----- TIME SETTINGS -----
    if (isset($_POST['ntpserver'])) {
        if (empty($_POST['ntpserver'])) {
        $args = 'pool.ntp.org';
        } else {
        $args = $_POST['ntpserver'];
        }
        $redis->get('ntpserver') == $args || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'ntpserver', 'args' => $args));        
    }
    if (isset($_POST['timezone'])) {      
        $args = $_POST['timezone'];
        $redis->get('timezone') == $args || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'timezone', 'args' => $args));        
    }
    // ----- KERNEL -----
    if (isset($_POST['kernel'])) {        
        // submit worker job
        if ($redis->get('kernel') !== $_POST['kernel']) {
            $job = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'kernelswitch', 'args' => $_POST['kernel']));
            $notification = new stdClass();
            $notification->title = 'Kernel switch';
            $notification->text = 'Kernel switch started...';
            wrk_notify($redis, 'startjob', $notification, $job);
            $jobID[] = $job;
        }
    }
    if (isset($_POST['orionprofile'])) {        
        // submit worker job
        $redis->get('orionprofile') == $_POST['orionprofile'] || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'orionprofile', 'args' => $_POST['orionprofile']));
    }
    if (isset($_POST['i2smodule'])) {
        // submit worker job
        if ($redis->get('i2smodule') !== $_POST['i2smodule']) {
            $notification = new stdClass();
            if ($_POST['i2smodule'] !== 'none') {
                $notification->title = 'Loading I&#178;S kernel module';
            } else {
                $notification->title = 'Unloading I&#178;S kernel module';
            }
            $job = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'i2smodule', 'args' => $_POST['i2smodule']));
            $notification->text = 'Please wait';
            wrk_notify($redis, 'startjob', $notification, $job);
            $jobID[] = $job;
        }
        
        // autoswitch optimized kernel profile for BerryNOS mini DAC
        if ($_POST['i2smodule'] === 'berrynosmini') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'orionprofile', 'args' => 'OrionV3_berrynosmini'));
        // autoswitch optimized kernel profile for IQaudIO Pi-DAC
        if ($_POST['i2smodule'] === 'iqaudiopidac') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'orionprofile', 'args' => 'OrionV3_iqaudio'));
    }
    // ----- FEATURES -----
    if (isset($_POST['features'])) {
        if ($_POST['features']['airplay']['enable'] == 1) {
            if ($redis->hGet('airplay','enable') !== $_POST['features']['airplay']['enable'] OR $redis->hGet('airplay','name') !== $_POST['features']['airplay']['name']) {
                // create worker job (start shairport)
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'airplay', 'action' => 'start', 'args' => $_POST['features']['airplay']['name']));
            }
        } else {
            // create worker job (stop shairport)
            $redis->hGet('airplay','enable') === '0' || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'airplay', 'action' => 'stop', 'args' => $_POST['features']['airplay']['name']));
        }
        if ($_POST['features']['dlna']['enable'] == 1) {
            if ($redis->hGet('dlna','enable') !== $_POST['features']['dlna']['enable'] OR $redis->hGet('dlna','name') !== $_POST['features']['dlna']['name']) {
                // create worker job (start upmpdcli)
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'dlna', 'action' => 'start', 'args' => $_POST['features']['dlna']['name']));
            }
        } else {
            // create worker job (stop upmpdcli)
            $redis->hGet('dlna','enable') === '0' || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'dlna', 'action' => 'stop', 'args' => $_POST['features']['dlna']['name']));
        }
        if ($_POST['features']['udevil'] == 1) {
            // create worker job (start udevil)
            $redis->get('udevil') == 1 || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'udevil', 'action' => 'start'));
        } else {
            // create worker job (stop udevil)
            $redis->get('udevil') == 0 || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'udevil', 'action' => 'stop'));
        }
        if ($_POST['features']['coverart'] == 1) {
            $redis->get('coverart') == 1 || $redis->set('coverart', 1);
        } else {
            $redis->get('coverart') == 0 || $redis->set('coverart', 0);
        }
        if ($_POST['features']['globalrandom'] == 1) {
            $redis->get('globalrandom') == 1 || $redis->set('globalrandom', 1);
        } else {
            $redis->get('globalrandom') == 0 || $redis->set('globalrandom', 0);
        }
        if ($_POST['features']['lastfm']['enable'] == 1) {
            // create worker job (start mpdscribble)
            if (($_POST['features']['lastfm']['user'] != $redis->hGet('lastfm', 'user') OR $_POST['features']['lastfm']['pass'] != $redis->hGet('lastfm', 'pass')) OR $redis->hGet('lastfm', 'enable') != $_POST['features']['lastfm']['enable']) {
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'lastfm', 'action' => 'start', 'args' => $_POST['features']['lastfm']));
            }
        } else {
            // create worker job (stop mpdscribble)
            $redis->hGet('lastfm','enable') == 0 || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'lastfm', 'action' => 'stop'));
        }
        if ($_POST['features']['spotify']['enable'] == 1) {
            // create worker job (start mpdscribble)
            if (($_POST['features']['spotify']['user'] != $redis->hGet('spotify', 'user') OR $_POST['features']['spotify']['pass'] != $redis->hGet('spotify', 'pass')) OR $redis->hGet('spotify', 'enable') != $_POST['features']['spotify']['enable']) {
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'spotify', 'action' => 'start', 'args' => $_POST['features']['spotify']));
            }
        } else {
            // create worker job (stop spotify)
            $redis->hGet('spotify','enable') == 0 || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'spotify', 'action' => 'stop'));
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
        if ($_POST['syscmd'] === 'reboot') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'reboot'));
        if ($_POST['syscmd'] === 'poweroff') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'poweroff'));
        if ($_POST['syscmd'] === 'mpdrestart') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'mpdrestart'));
        if ($_POST['syscmd'] === 'backup') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'backup'));
    }
}
waitSyWrk($redis,$jobID);
// push backup file
if ($_POST['syscmd'] === 'backup') {
    pushFile($redis->hGet('w_msg', $jobID[0]));
    $redis->hDel('w_msg', $jobID[0]);
}
// collect system status
$template->sysstate['kernel'] = file_get_contents('/proc/version');
$template->sysstate['time'] = implode('\n', sysCmd('date'));
$template->sysstate['uptime'] = date('d:H:i:s', strtok(file_get_contents('/proc/uptime'), ' ' ));
$template->sysstate['HWplatform'] = $redis->get('hwplatform')." (".$redis->get('hwplatformid').")";
$template->sysstate['playerID'] = $redis->get('playerid');
$template->hostname = $redis->get('hostname');
$template->ntpserver = $redis->get('ntpserver');
$template->timezone = $redis->get('timezone');
$template->orionprofile = $redis->get('orionprofile');
$template->airplay = $redis->hGetAll('airplay');
$template->dlna = $redis->hGetAll('dlna');
$template->udevil = $redis->get('udevil');
$template->coverart = $redis->get('coverart');
$template->globalrandom = $redis->get('globalrandom');
$template->lastfm = $redis->hGetAll('lastfm');
$template->cmediafix = $redis->get('cmediafix');
$template->proxy = $redis->hGetAll('proxy');
$template->spotify = $redis->hGetAll('spotify');
$template->hwplatformid = $redis->get('hwplatformid');
$template->i2smodule = $redis->get('i2smodule');
$template->kernel = $redis->get('kernel');
