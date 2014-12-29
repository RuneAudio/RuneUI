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
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // get the data that was POSTed
    $postData = file_get_contents("php://input");
    // convert to an associative array
    $json = json_decode($postData, true); 
    
    if ($json['syscmd'] === 'reboot') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'reboot'));
    if ($json['syscmd'] === 'poweroff') $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'poweroff'));
    // push backup file
    if ($json['syscmd'] === 'backup') {
        $jobID[] = wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'backup');
        pushFile($redis->hGet('w_msg', $jobID[0]));
        $redis->hDel('w_msg', $jobID[0]);
    }
    
    waitSyWrk($redis,$jobID);
};
