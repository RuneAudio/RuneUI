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
 *  file: file: app/coverart2_ctl.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
runelog("\n--------------------- coverart2 (start) ---------------------");
// turn off output buffering
ob_implicit_flush(0);
include('getid3/audioinfo.class.php');
// get Last.FM api-key
$lastfm_apikey = $redis->get('lastfm_apikey');
// get HTTP proxy settings
$proxy = $redis->hGetall('proxy');
// connect to MPD daemon
$mpd2 = openMpdSocket('/run/mpd.sock', 0);
// direct output bypass template system
$tplfile = 0;
// output switch
$output = 0;
// fetch MPD status
$status = _parseStatusResponse(MpdStatus($mpd2));
$curTrack = getTrackInfo($mpd2, $status['song']);
$currentpath = "/mnt/MPD/".findPLposPath($status['song'], $mpd2);
closeMpdSocket($mpd2);
// debug
runelog("MPD current path", $currentpath);
// extact song details
if (isset($curTrack[0]['Title'])) {
    $status['currentartist'] = $curTrack[0]['Artist'];
    $status['currentsong'] = $curTrack[0]['Title'];
    $status['currentalbum'] = $curTrack[0]['Album'];
    $status['fileext'] = parseFileStr($curTrack[0]['file'], '.');
}
//Extract info from current audio file
$au = new AudioInfo();
$auinfo =  $au->Info($currentpath);
// 1. try to find embedded coverart
if (!empty($auinfo['comments']['picture'][0]['data'])) {
    // debug
    runelog("coverart match: embedded");
    header('Content-Type: ' .$auinfo['comments']['picture'][0]['image_mime']);
    echo $auinfo['comments']['picture'][0]['data'];
    $output = 1;
} 
// 2. try to find local coverart
if ($output === 0) {
    $local_cover_url = 'http://localhost/covers/'.substr(substr($currentpath, 0, strrpos($currentpath, "/")), 9).'/cover.jpg';
    $local_cover_path = substr($currentpath, 0, strrpos($currentpath, "/")).'/cover.jpg';
    // debug
    runelog("coverart: local (url): ", $local_cover_url);
    runelog("coverart: local (path): ", $local_cover_path);
    if (file_exists($local_cover_path)) {
        // debug
        runelog("coverart match: cover-local");
        header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
        header('Pragma: no-cache'); // HTTP 1.0.
        header('Expires: 0'); // Proxies.
        header('Content-Type: ' .mime_content_type($local_cover_path));
        readfile($local_cover_path);
        $output = 1;
    }
}
// 3.0 try to find coverart on Last.FM (Album)
if ($output === 0) {
    $cover_url = ui_lastFM_coverart($status['currentartist'], $status['currentalbum'], $lastfm_apikey, $proxy);
    if (!empty($cover_url)) {
        // debug
        runelog("coverart match: lastfm (query 1) coverURL=", $cover_url);
        $lastfm_img = curlGet($cover_url, $proxy);
        $bufferinfo = new finfo(FILEINFO_MIME);
        $lastfm_img_mime = $bufferinfo->buffer($lastfm_img);
    } else {
        // 3.1 try to find coverart on Last.FM (Artist)
        $cover_url = ui_lastFM_coverart($status['currentartist'], '', $lastfm_apikey, $proxy);
        if (!empty($cover_url)) {
            // debug
            runelog("coverart match: lastfm (query 2) coverURL=", $cover_url);
            if (!empty($cover_url)) {
                $lastfm_img = curlGet($cover_url, $proxy);
                $lastfm_img_mime = $bufferinfo->buffer($lastfm_img);
            }
        }
    }
    if (!empty($lastfm_img)) {
        header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
        header('Pragma: no-cache'); // HTTP 1.0.
        header('Expires: 0'); // Proxies.
        header('Content-Type: '.$lastfm_img_mime);
        echo $lastfm_img;
        $output = 1;
    }
}
// 4. serve DEFAULT rune-cover image    
if ($output === 0) {
    // debug
    runelog("coverart match: cover-default");
    header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
    header('Pragma: no-cache'); // HTTP 1.0.
    header('Expires: 0'); // Proxies.
    header('Content-Type: ' .mime_content_type($_SERVER['HOME'].'/assets/img/cover-default.png'));
    readfile($_SERVER['HOME'].'/assets/img/cover-default.png');
    $output = 1;
}
runelog("\n--------------------- coverart2 (end) ---------------------");
