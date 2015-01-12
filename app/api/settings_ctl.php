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

// Simple class for managing the items in an HTML Select
class NameValuePair {
    public $name = '';
    public $value = '';
    
   public function __construct($n, $v) {
        $this->name = $n;
        $this->value = $v;
    }
}

$environment = [];
$timezones = [];
$kernel = [];
$features = [];
$system = [];

// Check for POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // get the data that was POSTed
    $postData = file_get_contents("php://input");
    // convert to an associative array
    $json = json_decode($postData, true); 
    
    // ----- Environment Section -----
    if (isset($json['environment'])) {
        $environment = $json['environment'];

        // ----- HOSTNAME -----        
        if (empty($environment['hostname'])) {
            $args = 'runeaudio';
        } else {
            $args = $environment['hostname'];
        }
        $redis->get('hostname') == $args || $jobID[] = wrk_control($redis, 'newjob', $data = array( 'wrkcmd' => 'hostname', 'args' => $args ));        
        
        // ----- TIME SETTINGS -----
        if (empty($environment['ntpserver'])) {
            $args = 'pool.ntp.org';
        } else {
            $args = $environment['ntpserver'];
        }
        $template->ZZZZ = $redis->get('ntpserver') == $args;
        $template->XXXX = $args;
        $redis->get('ntpserver') == $args || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'ntpserver', 'args' => $args));        
        
        
        $args = $environment['timezone'];
        $redis->get('timezone') == $args || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'timezone', 'args' => $args));        
        
        $template->XXXX1 = $args;
        
    }
    
    // ----- KERNEL -----
    if (isset($json['kernel'])) {        
        // submit worker job
        if ($redis->get('kernel') !== $json['kernel']) {
            $job = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'kernelswitch', 'args' => $json['kernel']));
            $notification = new stdClass();
            $notification->title = 'Kernel switch';
            $notification->text = 'Kernel switch started...';
            wrk_notify($redis, 'startjob', $notification, $job);
            $jobID[] = $job;
        }
    }
    if (isset($json['orionprofile'])) {        
        // submit worker job
        $redis->get('orionprofile') == $json['orionprofile'] || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'orionprofile', 'args' => $json['orionprofile']));
    }
    if (isset($json['i2smodule'])) {
        // submit worker job
        if ($redis->get('i2smodule') !== $json['i2smodule']) {
            $notification = new stdClass();
            if ($json['i2smodule'] !== 'none') {
                $notification->title = 'Loading I&#178;S kernel module';
            } else {
                $notification->title = 'Unloading I&#178;S kernel module';
            }
            $job = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'i2smodule', 'args' => $json['i2smodule']));
            $notification->text = 'Please wait';
            wrk_notify($redis, 'startjob', $notification, $job);
            $jobID[] = $job;
        }
        
        // autoswitch optimized kernel profile for BerryNOS mini DAC
        if ($json['i2smodule'] === 'berrynosmini') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'orionprofile', 'args' => 'OrionV3_berrynosmini'));
        // autoswitch optimized kernel profile for IQaudIO Pi-DAC
        if ($json['i2smodule'] === 'iqaudiopidac') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'orionprofile', 'args' => 'OrionV3_iqaudio'));
    }
    // ----- FEATURES -----
    if (isset($json['features'])) {
        if ($json['features']['airplay']['enable']) {
            if (($redis->hGet('airplay','enable') === '0') OR $redis->hGet('airplay','name') !== $json['features']['airplay']['name']) {
                // create worker job (start shairport)
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'airplay', 'action' => 'start', 'args' => $json['features']['airplay']['name']));
            }
        } else {
            // create worker job (stop shairport)
            $redis->hGet('airplay','enable') === '0' || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'airplay', 'action' => 'stop', 'args' => $json['features']['airplay']['name']));
        }
        if ($json['features']['dlna']['enable'] == 1) {
            if ($redis->hGet('dlna','enable') !== $json['features']['dlna']['enable'] OR $redis->hGet('dlna','name') !== $json['features']['dlna']['name']) {
                // create worker job (start upmpdcli)
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'dlna', 'action' => 'start', 'args' => $json['features']['dlna']['name']));
            }
        } else {
            // create worker job (stop upmpdcli)
            $redis->hGet('dlna','enable') === '0' || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'dlna', 'action' => 'stop', 'args' => $json['features']['dlna']['name']));
        }
        if ($json['features']['udevil'] == 1) {
            // create worker job (start udevil)
            $redis->get('udevil') == 1 || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'udevil', 'action' => 'start'));
        } else {
            // create worker job (stop udevil)
            $redis->get('udevil') == 0 || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'udevil', 'action' => 'stop'));
        }
        if ($json['features']['coverart'] == 1) {
            $redis->get('coverart') == 1 || $redis->set('coverart', 1);
        } else {
            $redis->get('coverart') == 0 || $redis->set('coverart', 0);
        }
        if ($json['features']['globalrandom'] == 1) {
            $redis->get('globalrandom') == 1 || $redis->set('globalrandom', 1);
        } else {
            $redis->get('globalrandom') == 0 || $redis->set('globalrandom', 0);
        }
        if ($json['features']['lastfm']['enable'] == 1) {
            // create worker job (start mpdscribble)
            if (($json['features']['lastfm']['user'] != $redis->hGet('lastfm', 'user') OR $json['features']['lastfm']['pass'] != $redis->hGet('lastfm', 'pass')) OR $redis->hGet('lastfm', 'enable') != $json['features']['lastfm']['enable']) {
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'lastfm', 'action' => 'start', 'args' => $json['features']['lastfm']));
            }
        } else {
            // create worker job (stop mpdscribble)
            $redis->hGet('lastfm','enable') == 0 || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'lastfm', 'action' => 'stop'));
        }
        if ($json['features']['spotify']['enable'] == 1) {
            // create worker job (start mpdscribble)
            if (($json['features']['spotify']['user'] != $redis->hGet('spotify', 'user') OR $json['features']['spotify']['pass'] != $redis->hGet('spotify', 'pass')) OR $redis->hGet('spotify', 'enable') != $json['features']['spotify']['enable']) {
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'spotify', 'action' => 'start', 'args' => $json['features']['spotify']));
            }
        } else {
            // create worker job (stop spotify)
            $redis->hGet('spotify','enable') == 0 || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'spotify', 'action' => 'stop'));
        }
    }
    //// ----- SYSTEM COMMANDS -----
    //if (isset($json['syscmd'])){
    //    if ($json['syscmd'] === 'reboot') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'reboot'));
    //    if ($json['syscmd'] === 'poweroff') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'poweroff'));
    //    if ($json['syscmd'] === 'mpdrestart') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'mpdrestart'));
    //    if ($json['syscmd'] === 'backup') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'backup'));
    //}
    
    $template->YYYY = $jobID;
    // waitSyWrk($redis,$jobID);
   
} else {

    if (!$template->uri(3)) {
    // MAIN SECTION - /api/settings/
        
        // environment section    
        $environment['hostname'] = $redis->get('hostname');
        $environment['ntpserver'] = $redis->get('ntpserver');
        $environment['timezone'] = $redis->get('timezone');
        $template->environment = $environment;
        
        // kernel section
        $kernel['kernel'] = $redis->get('kernel');
        $kernel['i2smodule'] = $redis->get('i2smodule');
        $kernel['orionprofile'] = $redis->get('orionprofile');
        $template->kernel = $kernel;

        // features section
        $features['airplay'] = $redis->hGetAll('airplay');
        $features['airplay']['enable'] = ($features['airplay']['enable'] === '1');
        $features['dlna'] = $redis->hGetAll('dlna');
        $features['dlna']['enable'] = ($features['dlna']['enable'] === '1');
        $features['udevil'] = $redis->get('udevil');
        $features['udevil'] = ($features['udevil'] === '1');
        $features['coverart'] = $redis->get('coverart');
        $features['coverart'] = ($features['coverart'] === '1');
        $features['globalrandom'] = $redis->get('globalrandom');
        $features['globalrandom'] = ($features['globalrandom'] === '1');
        $features['lastfm'] = $redis->hGetAll('lastfm');
        $features['lastfm']['enable'] = ($features['lastfm']['enable'] === '1');
        $features['proxy'] = $redis->hGetAll('proxy');
        $features['proxy']['enable'] = ($features['proxy']['enable'] === '1');
        $features['spotify'] = $redis->hGetAll('spotify');
        $features['spotify']['enable'] = ($features['spotify']['enable'] === '1');
        $features['hwplatformid'] = $redis->get('hwplatformid');
        $template->features = $features;

    } else {
    // SUBSECTIONS

        if ($template->uri(3, 'timezones')) {
        // TIMEZONES - /api/settings/timezones/
            foreach (ui_timezone() as $t) {
                $timezones[] = new NameValuePair($t['zone'].' - '.$t['diff_from_GMT'], $t['zone']);
            }
            $template->timezones = $timezones;
        } else if ($template->uri(3, 'sysinfo')) {
        // SYSTEM INFO - /api/settings/sysinfo/
            $system['kernel'] = file_get_contents('/proc/version');
            $system['time'] = implode('\n', sysCmd('date'));
            $system['uptime'] = date('d:H:i:s', strtok(file_get_contents('/proc/uptime'), ' ' ));
            $system['HWplatform'] = $redis->get('hwplatform')." (".$redis->get('hwplatformid').")";
            $system['playerID'] = $redis->get('playerid');
            $template->system = $system;
        }
    }
}