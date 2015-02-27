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
 *  file: app/network_ctl.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */

// inspect POST
if (isset($_POST)) {
    if (isset($_POST['nic']) && !isset($_POST['wifiprofile'])) {
        //ui_notify_async("'wrkcmd' => 'netcfg', 'action' => 'config'", $_POST['nic']);
        $redis->get($_POST['nic']['name']) === json_encode($nic) || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'netcfg', 'action' => 'config', 'args' => $_POST['nic']));        
    }
    if (isset($_POST['refresh'])) {
        //ui_notify_async("'wrkcmd' => 'netcfg', 'action' => 'refresh'", $_POST['nic']);
        $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'netcfg', 'action' => 'refresh'));
    }
    if (isset($_POST['wifiprofile'])) {
        switch ($_POST['wifiprofile']['action']) {
            case 'add':
                //ui_notify_async("'wrkcmd' => 'wificfg', 'action' => 'add'", $_POST['wifiprofile']);
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'wificfg', 'action' => 'add', 'args' => $_POST['wifiprofile']));
                break;
            case 'edit':
                //ui_notify_async("'wrkcmd' => 'wificfg', 'action' => 'edit'", $_POST['wifiprofile']);
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'wificfg', 'action' => 'edit', 'args' => $_POST['wifiprofile']));
                break;
            case 'delete':
                //ui_notify_async("'wrkcmd' => 'wificfg', 'action' => 'delete'", $_POST['wifiprofile']);
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'wificfg', 'action' => 'delete', 'args' =>  $_POST['wifiprofile']));
                break;                            
            case 'connect':
                //ui_notify_async("'wrkcmd' => 'wificfg', 'action' => 'connect'", $_POST['wifiprofile']);
                $jobID[] = wrk_control($redis, 'newjob', $data = array( 'wrkcmd' => 'wificfg', 'action' => 'connect', 'args' => $_POST['wifiprofile'] ));
                break;
            case 'disconnect':
                //ui_notify_async("'wrkcmd' => 'wificfg', 'action' => 'disconnect'", $_POST['wifiprofile']);
                $jobID[] = wrk_control($redis, 'newjob', $data = array( 'wrkcmd' => 'wificfg', 'action' => 'disconnect', 'args' => $_POST['wifiprofile'] ));
                break;
        }
    }
}

waitSyWrk($redis,$jobID);

$template->addprofile = 0;
$template->stored = 0;

$template->nics = wrk_netconfig($redis, 'getnics');
$template->wlan_autoconnect = $redis->Get('wlan_autoconnect');
if ($redis->Exists(urldecode($template->uri(4)))) $template->stored = 1;
if (isset($template->action)) {
    // check if we are into interface details (ex. http://runeaudio/network/edit/eth0)
    if (isset($template->arg)) {
        // check if there is a stored profile for current nic
        $nic_stored_profile = json_decode($redis->Get($template->uri(3)));
        // runelog('nic stored profile: ',$nic_stored_profile);
        if (!empty($nic_stored_profile)) {
            if ($nic_stored_profile->dhcp === '0') {
                // read nic stored profile
                $template->nic_stored = $nic_stored_profile;
            }
        }
        // retrieve current nic status data (detected from the system)
        $nic_connection = $redis->hGet('nics', $template->arg);
        $template->nic = json_decode($nic_connection);
        // check if we action is = 'edit' or 'wlan' (ex. http://runeaudio/network/edit/....)
        if ($template->action === 'edit') {
            // fetch current (stored) nic configuration data
            if ($redis->get($template->arg)) {
                $template->{$template->arg} = json_decode($redis->get($template->arg));
                // ok nic configuration not stored, but check if it is configured
            } else if ($nic_connection == null) {
                // last case, nonexistant nic. route to error template
                $template->content = 'error';
            } 
            // check if the current nic is wireless
            if ($template->nic->wireless === 1) {
                $template->wlans = json_decode($redis->get('wlans'));
                $template->wlan_profiles = new stdClass();
                if ($wlan_profiles = wrk_netconfig($redis, 'getstoredwlans')) {
                    foreach ($wlan_profiles as $key => $value) {
                        $template->wlan_profiles->{$key} = json_decode($value);
                    }
                } 
            }
            // we are in the wlan subtemplate (ex. http://runeaudio/network/wlan/....)
        } else {
            // check if we want to store a wifi profile, that is not in range. (ex. http://runeaudio/network/wlan/add )
            if ($template->uri(4) === 'add') {
                $template->addprofile = 1;
            } else {
                // we are connecting to a visible network
                //  /network/edit/wlan0/<Some SSID>
                
                $template->wlans = json_decode($redis->get('wlans'));
                foreach ($template->wlans->{$template->uri(3)} as $key => $value) {
                    $SSID = urldecode($template->uri(4));
                    // if we are in a stored profile, retrieve his details
                    if ($template->stored) {
                        //$template->profile_{urldecode($template->uri(4))} = json_decode($redis->hGet('wlan_profiles', urldecode($template->uri(4))));
                        //$template->profile_{$SSID} = json_decode($redis->hGet('wlan_profiles', $SSID));
                        $template->profile_{$SSID} = json_decode($redis->hGet('stored_profiles', $SSID));
                        
                    }
                    // check if we are in a connected profile
                    //if ($template->uri(4) === $value->ESSID) {
                    if ($SSID === $value->ESSID) {
                        // retrieve SSID details
                        //$template->{$template->uri(4)} =  $value;
                        $template->{$SSID} =  $value;
                    }
                }
                
                //$template->connected = (isset($this->nic->currentssid) && $this->nic->currentssid === $this->{urldecode($this->uri(4))}->{'ESSID'});
                
            }
        }
    }
} 
