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
include('getid3/audioinfo.class.php');
$lastfm_apikey = $redis->get('lastfm_apikey');
$proxy = $redis->hGetall('proxy');
$mpd2 = openMpdSocket('/run/mpd.sock');
// direct output bypass template system
$tplfile = 0;
// fetch MPD status
$status = _parseStatusResponse(MpdStatus($mpd2));
$curTrack = getTrackInfo($mpd2, $status['song']);
if (isset($curTrack[0]['Title'])) {
    $status['currentartist'] = $curTrack[0]['Artist'];
    $status['currentsong'] = $curTrack[0]['Title'];
    $status['currentalbum'] = $curTrack[0]['Album'];
    $status['fileext'] = parseFileStr($curTrack[0]['file'], '.');
}
$currentpath = "/mnt/MPD/".findPLposPath($status['song'], $mpd2);
// debug
runelog("MPD current path", $currentpath);
//Extract info from current file
$au = new AudioInfo();
$auinfo =  $au->Info($currentpath);
if (!empty($auinfo['comments']['picture'][0]['data'])) {
    // debug
    runelog("coverart match: embedded",'');
    header('Content-Type: ' .$auinfo['comments']['picture'][0]['image_mime']);
    echo $auinfo['comments']['picture'][0]['data'];
} else {
	$cover_url = ui_lastFM_coverart($status['currentartist'], $status['currentalbum'], $lastfm_apikey, $proxy);
	// debug
	runelog("coverart match: lastfm (query 1) coverURL=", $cover_url);
	// $ch = curl_init($cover_url);
	// curl_setopt($ch, CURLOPT_HEADER, 0);
	// curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	// $lastfm_img = curl_exec($ch);
	// curl_close($ch);
	$lastfm_img = curlGet($cover_url, $proxy);
	$bufferinfo = new finfo(FILEINFO_MIME);
	$lastfm_img_mime = $bufferinfo->buffer($lastfm_img);
	if (empty($cover_url)) {
        // fetch artist image
        $cover_url = ui_lastFM_coverart($status['currentartist'], '', $lastfm_apikey, $proxy);
        // debug
        runelog("coverart match: lastfm (query 2) coverURL=", $cover_url);
        // $ch = null;
        // $ch = curl_init($cover_url);
        // curl_setopt($ch, CURLOPT_HEADER, 0);
        // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // $lastfm_img = curl_exec($ch);
        // curl_close($ch);
        $lastfm_img = curlGet($cover_url, $proxy);
        $lastfm_img_mime = $bufferinfo->buffer($lastfm_img);  
        if (!empty($lastfm_img)) {
            header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
            header('Pragma: no-cache'); // HTTP 1.0.
            header('Expires: 0'); // Proxies.
            header('Content-Type: '.$lastfm_img_mime);
            echo $lastfm_img;
        } else {
            // debug
            runelog("coverart match: cover-default",'');
            header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
            header('Pragma: no-cache'); // HTTP 1.0.
            header('Expires: 0'); // Proxies.
            header('Content-Type: ' .mime_content_type($_SERVER['HOME'].'/assets/img/cover-default.png'));
            readfile($_SERVER['HOME'].'/assets/img/cover-default.png');
        }
	} else {
			// debug
			runelog("coverart match: lastfm",'');
			header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
			header('Pragma: no-cache'); // HTTP 1.0.
			header('Expires: 0'); // Proxies.
			header('Content-Type: '.$lastfm_img_mime);
			echo $lastfm_img;
	}
} 
closeMpdSocket($mpd2);
