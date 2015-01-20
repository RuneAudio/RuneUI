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
 *  file: network_ctl.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
 
$segments = explode('/', $template->uri());
$count = count($segments);
$lastsegment = strlen($segments[$count - 1]);
if ($lastsegment===0) {
	$count = $count -1;
}
$uri_length =  $count;

//  /api/network = 3
//  /api/network/ = 3
//  /api/network/eth0 = 4
//  /api/network/eth0/ = 4


		
// Check for POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // get the data that was POSTed
    $postData = file_get_contents("php://input");
    // convert to an associative array
    $json = json_decode($postData, true); 

    if (isset($json['nic'])) {
        $redis->get($json['nic']['name']) == json_encode($nic) || $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'netcfg', 'action' => 'config', 'args' => $json['nic']));        
    }
    if (isset($json['refresh'])) {
        $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'netcfg', 'action' => 'refresh'));
    }
    if (isset($json['wifiprofile'])) {
        switch ($json['wifiprofile']['action']) {
            case 'add':
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'wificfg', 'action' => 'add', 'args' => $json['wifiprofile']));
                break;
            case 'edit':
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'wificfg', 'action' => 'edit', 'args' => $json['wifiprofile']));
                break;
            case 'delete':
                $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'wificfg', 'action' => 'delete', 'args' =>  $json['wifiprofile']));
                break;                            
            case 'disconnect':
                $jobID[] = wrk_control($redis, 'newjob', $data = array( 'wrkcmd' => 'wificfg', 'action' => 'disconnect', 'args' => $json['wifiprofile'] ));
                break;
        }
    }
    // if (isset($json['wifidelete'])) {
        // $jobID[] = wrk_control($redis,'newjob', $data = array( 'wrkcmd' => 'wificfg', 'action' => 'delete', 'args' =>  $json['wifidelete'] ));
    // }
    if (isset($json['wpa_cli'])) {
        $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'wificfg', 'action' => 'wpa_cli', 'args' =>  $json['wpa_cli']));
    }

} else {
	// GET
		
	if ($uri_length == 4) {
		// INTERFACE SETUP - /api/network/eth0/ or /api/network/wlan0/
		$nicID = $template->uri(3); // i.e. 'eth0' or 'wlan0'
        // retrieve current nic status data (detected from the system)
        $nic_connection = $redis->hGet('nics', $nicID);
        $template->nic = json_decode($nic_connection);
        $template->nic->wireless = ($template->nic->wireless == 1);
        $template->nic->dns2 = ($template->nic->dns2 == null) ? '' : $template->nic->dns2;
        // fetch current (stored) nic configuration data
        if ($redis->get($nicID)) {
            $template->profile = json_decode($redis->get($nicID));
            $template->profile->dhcp = ($template->profile->dhcp == 1);
            // ok nic configuration not stored, but check if it is configured
        } else if ($nic_connection == null) {
            // last case, nic not found. return an error
			$msg = 'Oops. Looks like you are trying to edit a card that no longer exists. The broken url is: '.$template->uri();
            $template->errormsg = $msg;
			http_response_code(400); // HTTP : Bad Request
        }

        $prof = json_decode($redis->get($nicID));
        $nic = json_decode($nic_connection);
        // return:

        // SSID
        // UNAME
        // PASS
        // ENCR

        // DHCP
        // IP
        // GW
        // DNS1
        // DNS2

        $return->dhcp = $nic->dhcp;
        // $return->connected = true; // boolean to tell if I'm actually connected
        $return->ip = $nic->ip; // Get the IP from the NIC, or the Assigned Static IP if none on NIC, or "" if DHCP & No Connection
        $return->mask = $nic->mask; // Get the IP from the NIC, or the Assigned Static IP if none on NIC, or "" if DHCP & No Connection
        $return->gw = $nic->ip;
        $return->dns1 = $nic->ip;
        $return->dns2 = $nic->ip;

        // on client
        // placeholder = oldData.ip
        // value = data.ip
	} else if ($uri_length == 3) {
		// MAIN SECTION - /api/network/
		$nics = [];
		$nics2 = [];
        foreach ($redis->hGetAll('nics') as $interface => $details) {
            $nic = json_decode($details);
            $nic->wireless = ($nic->wireless == '1');
            $nic->id = $interface;
            $nics[] = $nic;
        }
        $template->nics = $nics;
				
	}
	
}