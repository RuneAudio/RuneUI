#!/usr/bin/php
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
 *  file: command/ui_notify
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
// common include
ini_set('display_errors', '1');
ini_set('error_reporting', -1);
ini_set('error_log','/var/log/runeaudio/ui_notify.log');

// ---- functions -----
// push UI update to NGiNX channel
function ui_render($channel, $data)
{
    // runelog('ui_render channel: '.$channel.', data: ',$data);
    curlPost('http://127.0.0.1/pub?id='.$channel,$data);
}

function curlPost($url,$data,$proxy = null)
{
$ch = curl_init($url);
    if (isset($proxy)) {
        $proxy['user'] === '' || curl_setopt($ch, CURLOPT_PROXYUSERPWD, $proxy['user'].':'.$proxy['pass']);
        curl_setopt($ch, CURLOPT_PROXY, $proxy['host']);
        //runelog('cURL proxy HOST: ',$proxy['host']);
        //runelog('cURL proxy USER: ',$proxy['user']);
        //runelog('cURL proxy PASS: ',$proxy['pass']);
    }
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}
// ---- end functions -----
if (isset($argv[2]) && !isset($argv[3])) {
// Connect to Redis backend
$redis = new Redis();
$redis->connect('/tmp/redis.sock');
    if (!($redis->sIsMember('w_lock', $argv[2]))) {
            usleep(800000);
    } else {
        do {
            usleep(500000);
        } while ($redis->sIsMember('w_lock', $argv[2]));
    }
    $redis->close();
} else {
    usleep(500000);
}
if (isset($argv[3]) && $argv[3] === 'simplemessage') {
    $output = json_encode(array( 'title' => $argv[1], 'text' => $argv[2], 'type' => null));
    ui_render('notify', $output);
} else {
    ui_render('notify', $argv[1]);
}
