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
 *  file: mpd_ctl.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
 if (isset($_POST)) {
     // Let's make sure we've called this with an actual POST 
     $template->AAAAAAAAA = $_SERVER['REQUEST_METHOD'];
     //if ($_SERVER['REQUEST_METHOD'] === 'POST') {
         
        // get the data that was POSTed
        $postData = file_get_contents("php://input");
        // convert to an associative array
        $json = json_decode($postData, true); 
        $template->BBBBBBBB = $json['ao'];
        $template->CCCCCCCC = isset($json['ao']);
        
        //$json = json_decode($postData);
        //$template->BBBBBBBB = $json->ao;

        // switch audio output
        if (isset($json['ao'])) {
            $jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'mpdcfg', 'action' => 'switchao', 'args' => $json['ao']));
        }
        // reset MPD configuration
        if (isset($json['reset'])) {
            $jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'mpdcfg', 'action' => 'reset'));
        }
        // update MPD configuration
        if (isset($json['conf'])) {
            $jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'mpdcfg', 'action' => 'update', 'args' => $json['conf']));
        }
        // manual MPD configuration
        if (isset($_POST['mpdconf'])) {
            $jobID = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'mpdcfgman', 'args' => $json['mpdconf']));
        }
    // }

 }
waitSyWrk($redis, $jobID);

$ao = '';
$aoValue = $redis->get('ao');


// check integrity of /etc/network/interfaces
if(!hashCFG('check_mpd', $redis)) {
    $template->mpdconf = file_get_contents('/etc/mpd.conf');
    // set manual config template
    $template->content = "mpd_manual";
} else {
    $template->conf = $redis->hGetAll('mpdconf');
    $i2smodule = $redis->get('i2smodule');
    // debug
    // echo $i2smodule."\n";
    $acards = $redis->hGetAll('acards');
    // debug
    // print_r($acards);
    foreach ($acards as $card => $data) {
        $acard_data = json_decode($data);
        // debug
        // echo $card."\n";
        // print_r($acard_data);
        if ($i2smodule !== 'none') {
            $acards_details = $redis->hGet('acards_details', $i2smodule);
        } else {
            $acards_details = $redis->hGet('acards_details', $card);
        }
        if (!empty($acards_details)) {
            $details = json_decode($acards_details);
            // debug
            // echo "acards_details\n";
            // print_r($details);
            if ($details->sysname === $card) {
                if ($details->type === 'integrated_sub') {
                    $sub_interfaces = $redis->sMembers($card);
                    foreach ($sub_interfaces as $int) {
                        $sub_int_details = json_decode($int);
                        // TODO !!! check
                        $audio_cards[] = $sub_int_details;
                    }
                }
                if ($details->extlabel !== 'none') {
                    $acard_data->extlabel = $details->extlabel;
                }
            }
        }
        if ($acard_data->name == $aoValue) {
            $ao = $acard_data->extlabel;
        }
        $audio_cards[] = $acard_data;
    }
	osort($audio_cards, 'extlabel');
    // debug
    // print_r($audio_cards);
    $template->acards = $audio_cards;
    $template->ao = $ao;
}
