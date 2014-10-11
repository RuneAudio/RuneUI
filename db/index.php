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
 *  file: db/index.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
// common include
include($_SERVER['HOME'].'/app/config/config.php');
ini_set('display_errors', -1);
error_reporting('E_ALL');
// check current player backend
$activePlayer = $redis->get('activePlayer');
if (isset($_GET['cmd']) && !empty($_GET['cmd'])) {
    if ( !$mpd ) {
        echo 'Error Connecting to MPD daemon ';
    }  else {
        switch ($_GET['cmd']) {
            case 'filepath':
                if (isset($_POST['path'])) {
                    echo json_encode(searchDB($mpd, 'filepath', $_POST['path']));
                } else {
                    echo json_encode(searchDB($mpd, 'filepath'));
                }
                break;
            case 'playlist':
                // open non blocking socket with mpd daemon
                // $mpd2 = openMpdSocket('/run/mpd.sock', 2);
                // getPlayQueue($mpd2);
                // closeMpdSocket($mpd2);
                if ($activePlayer === 'MPD') {
                    echo getPlayQueue($mpd);
                } elseif ($activePlayer === 'Spotify') {
                    echo getSpopQueue($spop);
                }
                break;
            case 'add':
                if (isset($_POST['path'])) {
                    addQueue($mpd, $_POST['path']);
                    // send MPD response to UI
                    ui_mpd_response($mpd, array('title' => 'Added to playlist', 'text' => $_POST['path']));
                }
                break;
            case 'addplay':
                if (isset($_POST['path'])) {
                    $status = _parseStatusResponse(MpdStatus($mpd));
                    $pos = $status['playlistlength'] ;
                    addQueue($mpd, $_POST['path'], 1, $pos);
                    // send MPD response to UI
                    ui_mpd_response($mpd, array('title' => 'Added to playlist', 'text' => $_POST['path']));
                }
                break;
            case 'addreplaceplay':
                if (isset($_POST['path'])) {
                    sendMpdCommand($mpd, 'clear');
                    addQueue($mpd, $_POST['path']);
                    sendMpdCommand($mpd, 'play');
                    // send MPD response to UI
                    ui_mpd_response($mpd, array('title' => 'Playlist cleared<br> Added to playlist', 'text' => $_POST['path']));
                }
                break;
            case 'update':
                if (isset($_POST['path'])) {
                    sendMpdCommand($mpd, "update \"".html_entity_decode($_POST['path'])."\"");
                    // send MPD response to UI
                    ui_mpd_response($mpd, array('title' => 'MPD update DB path:', 'text' => $_POST['path']));
                }
                break;
            case 'search':
                if (isset($_POST['query']) && isset($_GET['querytype'])) {
                    echo json_encode(searchDB($mpd, $_GET['querytype'], $_POST['query']));
                }
                break;
            case 'bookmark':
                if (isset($_POST['path'])) {
                    if (saveBookmark($redis, $_POST['path'])) {
                        ui_notify('Bookmark saved', $_POST['path'].' added to bookmarks');
                        ui_libraryHome($redis);
                    } else {
                        ui_notify('Error saving bookmark', 'please try again later');
                    }
                }
                if (isset($_POST['id'])) {
                    if (deleteBookmark($redis,$_POST['id'])) {
                        ui_notify('Bookmark deleted', '"' . $_POST['name'] . '" successfully removed');
                        ui_libraryHome($redis);
                    } else {
                        ui_notify('Error deleting bookmark', 'Please try again later');
                    }
                }
                break;
            case 'dirble':
            $proxy = $redis->hGetall('proxy');
            $dirblecfg = $redis->hGetAll('dirble');
                if (isset($_POST['querytype'])) {
                    // if ($_POST['querytype'] === 'amountStation') {
                    if ($_POST['querytype'] === 'amountStation') {
                        $dirble = json_decode(curlGet($dirblecfg['baseurl'].'amountStation/apikey/'.$dirblecfg['apikey'], $proxy));
                        echo $dirble->amount;
                    }
                    // Get primaryCategories
                    if ($_POST['querytype'] === 'categories' OR $_POST['querytype'] === 'primaryCategories' ) {
                        echo curlGet($dirblecfg['baseurl'].$_POST['querytype'].'/apikey/'.$dirblecfg['apikey'], $proxy);
                    }
                    // Get childCategories by primaryid
                        if ($_POST['querytype'] === 'childCategories' && isset($_POST['args'])) {
                        echo curlGet($dirblecfg['baseurl'].'childCategories/apikey/'.$dirblecfg['apikey'].'/primaryid/'.$_POST['args'], $proxy);
                    }
                    // Get station by ID
                        if ($_POST['querytype'] === 'stations' && isset($_POST['args'])) {
                        echo curlGet($dirblecfg['baseurl'].'stations/apikey/'.$dirblecfg['apikey'].'/id/'.$_POST['args'], $proxy);
                    }
                    // Search radio station
                        if ($_POST['querytype'] === 'search' && isset($_POST['args'])) {
                        echo curlGet($dirblecfg['baseurl'].'search/apikey/'.$dirblecfg['apikey'].'/search/'.$_POST['args'], $proxy);
                    }
                    // Get stations by continent
                        if ($_POST['querytype'] === 'continent' && isset($_POST['args'])) {
                        echo curlGet($dirblecfg['baseurl'].'continent/apikey'.$dirblecfg['apikey'].'/continent/'.$_POST['args'], $proxy);
                    }
                    // Get stations by country
                        if ($_POST['querytype'] === 'country' && isset($_POST['args'])) {
                        echo curlGet($dirblecfg['baseurl'].'country/apikey'.$dirblecfg['apikey'].'/country/'.$_POST['args'], $proxy);
                    }
                    // Add station
                    if ($_POST['querytype'] === 'addstation' && isset($_POST['args'])) {
                        // input array $_POST['args'] = array('name' => 'value', 'streamurl' => 'value', 'website' => 'value', 'country' => 'value', 'directory' => 'value')
                        echo curlPost($dirblecfg['baseurl'].'station/apikey/'.$dirblecfg['apikey'], $_POST['args'], $proxy);
                    }

                }
                break;
            case 'jamendo':
                $apikey = $redis->hGet('jamendo', 'clientid');
                $proxy = $redis->hGetall('proxy');
                if ($_POST['querytype'] === 'radio') {
                    $jam_channels = json_decode(curlGet('http://api.jamendo.com/v3.0/radios/?client_id='.$apikey.'&format=json&limit=200', $proxy));
                        foreach ($jam_channels->results as $station) {
                            $channel = json_decode(curlGet('http://api.jamendo.com/v3.0/radios/stream?client_id='.$apikey.'&format=json&name='.$station->name, $proxy));
                            $station->stream = $channel->results[0]->stream;
                        }
                    // TODO: add cache jamendo channels on Redis
                    // $redis->hSet('jamendo', 'ch_cache', json_encode($jam_channels));
                    // echo $redis->hGet('jamendo', 'ch_cache');
                    echo json_encode($jam_channels);
                }
                if ($_POST['querytype'] === 'radio' && !empty($_POST['args'])) {
                    echo curlGet('http://api.jamendo.com/v3.0/radios/stream?client_id='.$apikey.'&format=json&name='.$_POST['args'], $proxy);
                }
                break;
            case 'spotify':
                if (isset($_GET['plid'])) {
                    echo spopDB($spop, $_GET['plid']);
                } else {
                    echo spopDB($spop);
                }
                break;
            case 'addradio':
                // input array= $_POST['radio']['label'] $_POST['radio']['url']
                    wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'webradio', 'action' => 'add', 'args' => $_POST['radio']));
                break;
            case 'editradio':
                // input array= $_POST['radio']['label'] $_POST['radio']['newlabel'] $_POST['radio']['url']
                wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'webradio', 'action' => 'edit', 'args' => $_POST['radio']));
                break;
            case 'readradio':
                $name = parseFileStr(parseFileStr($_POST['filename'], '.', 1), '/');
                echo json_encode(array('name' => $name, 'url' => $redis->hGet('webradios', $name)));
                break;
            case 'deleteradio':
                // input array= $_POST['radio']['label']
                wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'webradio', 'action' => 'delete', 'args' => $_POST['radio']));
                break;
            case 'test':
                $proxy = $redis->hGetall('proxy');
                print_r($proxy);
                break;
        }
    }
} else {
  echo 'MPD DB INTERFACE<br>';
  echo 'INTERNAL USE ONLY<br>';
  echo 'hosted on runeaudio.local:81';
}
// close MPD connection
closeMpdSocket($mpd);
// close MPD connection
closeSpopSocket($spop);
// close Redis connection
$redis->close();
