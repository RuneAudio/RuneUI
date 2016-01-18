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
 *  file: app/libs/runeaudio.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */

// Predefined MPD & SPOP Response messages
// define("MPD_GREETING", "OK MPD 0.18.0\n");
// define("SPOP_GREETING", "spop 0.0.1\n");

function is_localhost() {
    $whitelist = array( '127.0.0.1', '::1' );
    if( in_array( $_SERVER['REMOTE_ADDR'], $whitelist) )
        return true;
}

function openMpdSocket($path, $type = null)
// connection types: 0 = normal (blocking), 1 = burst mode (blocking), 2 = burst mode 2 (non blocking)
{
    $sock = socket_create(AF_UNIX, SOCK_STREAM, 0);
    // create non blocking socket connection
    if ($type === 1 OR $type === 2) {
        if ($type === 2) {
            socket_set_nonblock($sock);
            runelog('opened **BURST MODE 2 (non blocking)** socket resource: ',$sock);
        } else {
            runelog('opened **BURST MODE (blocking)** socket resource: ',$sock);
        }
        $sock = array('resource' => $sock, 'type' => $type);
        $connection = socket_connect($sock['resource'], $path);
        if ($connection) {
            // skip MPD greeting response (first 14 bytes)
            $header = socket_read($sock['resource'], 14, PHP_NORMAL_READ);
            runelog("[open][".$sock['resource']."]\t>>>>>> OPEN MPD SOCKET <<<<<< greeting response: ".$header."<<<<<<",'');
            return $sock;
        } else {
            runelog("[error][".$sock['resource']."]\t>>>>>> MPD SOCKET ERROR: ".socket_last_error($sock['resource'])." <<<<<<",'');
            // ui_notify('MPD sock: '.$sock.'','socket error = '.socket_last_error($sock));
            return false;
        }
    // create blocking socket connection
    } else {
        runelog('opened **NORMAL MODE (blocking)** socket resource: ',$sock);
        $connection = socket_connect($sock, $path);
        if ($connection) {
            // skip MPD greeting response (first 14 bytes)
            $header = socket_read($sock, 14, PHP_NORMAL_READ);
            runelog("[open][".$sock."]\t<<<<<<<<<<<< OPEN MPD SOCKET ---- MPD greeting response: ".$header.">>>>>>>>>>>>",'');
            return $sock;
        } else {
            runelog("[error][".$sock."]\t<<<<<<<<<<<< MPD SOCKET ERROR: ".socket_strerror(socket_last_error($sock))." >>>>>>>>>>>>",'');
            // ui_notify('MPD sock: '.$sock.'','socket error = '.socket_last_error($sock));
            return false;
        }
    }
}

function closeMpdSocket($sock)
{
    if (isset($sock['resource'])) {
      $sock = $sock['resource'];
    }
    sendMpdCommand($sock, 'close');
    // socket_shutdown($sock, 2);
    // debug
    runelog("[close][".$sock."]\t<<<<<< CLOSE MPD SOCKET (".socket_strerror(socket_last_error($sock)).") >>>>>>",'');
    socket_close($sock);
}


function sendMpdCommand($sock, $cmd)
{
    if (isset($sock['resource'])) {
      $sock = $sock['resource'];
    }
    $cmd = $cmd."\n";
    socket_write($sock, $cmd, strlen($cmd));
    runelog("MPD COMMAND: (socket=".$sock.")", $cmd);
}

// detect end of MPD response
function checkEOR($chunk)
{
    if (strpos($chunk, "OK\n") !== false) {
        return true;
    } elseif (strpos($chunk, "ACK [") !== false) {
        if (preg_match("/(\[[0-9]@[0-9]\])/", $chunk) === 1) {
            return true;
        }
    } else {
        return false;
    }
}

function readMpdResponse($sock)
{
    // initialize vars
    $output = '';
    $read = '';
    $read_monitor = array();
    $write_monitor  = NULL;
    $except_monitor = NULL;
    // debug
    // socket monitoring
    // iteration counter
    // $i = 0;
    // timestamp
    // $starttime = microtime(true);
    // runelog('START timestamp:', $starttime);
    if ($sock['type'] === 2) {
        // handle burst mode 2 (nonblocking) socket session
        $buff = 1024;
        $end = 0;
        while($end === 0) {
            if (is_resource($sock['resource']) === true) {
                $read = socket_read($sock['resource'], $buff);
            } else {
                break;
            }
            if (checkEOR($read) === true) {
                ob_start();
                echo $read;
                // flush();
                ob_flush();
                ob_end_clean();
                $end = 1;
                break;
            }
            if (strpos($read, "\n")) {
                ob_start();
                echo $read;
                // flush();
                ob_flush();
                ob_end_clean();
            } else {
                continue;               
            }
            usleep(200);
        }
    } elseif ($sock['type'] === 1) {
    // handle burst mode 1 (blocking) socket session
    $read_monitor = array($sock['resource']);
    $buff = 1310720;
    // debug
    // $socket_activity = socket_select($read_monitor, $write_monitor, $except_monitor, NULL);
    // runelog('socket_activity (pre-loop):', $socket_activity);
        do {
            // debug
            // $i++;
            // $elapsed = microtime(true);
            // read data from socket
            if (is_resource($sock['resource']) === true) {
                $read = socket_read($sock['resource'], $buff);
            } else {
                break;
            }
            // debug
            // runelog('socket_read status', $read);
            if ($read === '' OR $read === false) {
                $output = socket_strerror(socket_last_error($sock));
                // debug
                runelog('socket disconnected!!!', $output);
                break; 
            }
            $output .= $read;
            // usleep(200);
            // debug
            // runelog('_1_socket_activity (in-loop): iteration='.$i.' ', $socket_activity);
            // runelog('_1_buffer length:', strlen($output));
            // runelog('_1_iteration:', $i);
            // runelog('_1_timestamp:', $elapsed);
        } while (checkEOR($read) === false);
        // debug
        // runelog('END timestamp:', $elapsed);
        // runelog('RESPONSE length:', strlen($output));
        // runelog('EXEC TIME:', $elapsed - $starttime);
        return $output;
    } else {
        // handle normal mode (blocking) socket session
        $read_monitor = array($sock);
        $buff = 4096;
        // debug
        // $socket_activity = socket_select($read_monitor, $write_monitor, $except_monitor, NULL);
        // runelog('socket_activity (pre-loop):', $socket_activity);
        do {
            // debug
            // $i++;
            // $elapsed = microtime(true);
            if (is_resource($sock) === true) {
                $read = socket_read($sock, $buff, PHP_NORMAL_READ);
            } else {
                break;
            }
            // debug
            // runelog('socket_read status', $read);
            if ($read === '' OR $read === false) {
                $output = socket_strerror(socket_last_error($sock));
                // debug
                runelog('socket disconnected!!!', $output);
                break; 
            }
            $output .= $read;
            // usleep(200);
            // debug
            // runelog('read buffer content (0 mode)', $read);
            // runelog('_0_buffer length:', strlen($output));
            // runelog('_0_iteration:', $i);
            // runelog('_0_timestamp:', $elapsed);
        } while (checkEOR($read) === false);
        // debug
        // runelog('END timestamp:', $elapsed);
        // runelog('RESPONSE length:', strlen($output));
        // runelog('EXEC TIME:', $elapsed - $starttime);
        return $output;
    }
}

function sendMpdIdle($sock)
{
    //sendMpdCommand($sock,"idle player,playlist");
    sendMpdCommand($sock,'idle');
    $response = readMpdResponse($sock);
    $response = array_map('trim', explode(":", $response));
    return $response;
}

function monitorMpdState($sock)
{
    if ($change = sendMpdIdle($sock)) {
        $status = _parseStatusResponse(MpdStatus($sock));
        $status['changed'] = substr($change[1], 0, -3);
        // runelog('monitorMpdState()', $status);
        return $status;
    }
}

function getTrackInfo($sock, $songID)
{
    // set currentsong, currentartis, currentalbum
    sendMpdCommand($sock, 'playlistinfo '.$songID);
    $track = readMpdResponse($sock);
    // runelog('+++++++++++++ getTrackInfo data +++++++++++++++', $track);
    return _parseFileListResponse($track);
}

function getPlayQueue($sock)
{
    sendMpdCommand($sock, 'playlistinfo');
    $playqueue = readMpdResponse($sock);
    //return _parseFileListResponse($playqueue);
    return $playqueue;
}

// Spotify support
function openSpopSocket($host, $port, $type = null)
// connection types: 0 = normal (blocking), 1 = burst mode (blocking), 2 = burst mode 2 (non blocking)
{
    $sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
    // create non blocking socket connection
    if ($type === 1 OR $type === 2) {
        if ($type === 2) {
            socket_set_nonblock($sock);
            runelog('opened **BURST MODE 2 (non blocking)** socket resource: ',$sock);
        } else {
            runelog('opened **BURST MODE (blocking)** socket resource: ',$sock);
        }
        $sock = array('resource' => $sock, 'type' => $type);
        $connection = socket_connect($sock['resource'], $host, $port);
        if ($connection) {
            // skip SPOP greeting response (first 14 bytes)
            $header = socket_read($sock['resource'], 11, PHP_NORMAL_READ);
            runelog("[open][".$sock['resource']."]\t>>>>>> OPEN SPOP SOCKET <<<<<< greeting response: ".$header."<<<<<<",'');
            return $sock;
        } else {
            runelog("[error][".$sock['resource']."]\t>>>>>> SPOP SOCKET ERROR: ".socket_last_error($sock['resource'])." <<<<<<",'');
            // ui_notify('SPOP sock: '.$sock.'','socket error = '.socket_last_error($sock));
            return false;
        }
    // create blocking socket connection
    } else {
        runelog('opened **NORMAL MODE (blocking)** socket resource: ',$sock);
        $connection = socket_connect($sock, $host, $port);
        if ($connection) {
            // skip SPOP greeting response (first 14 bytes)
            $header = socket_read($sock, 11, PHP_NORMAL_READ);
            runelog("[open][".$sock."]\t<<<<<<<<<<<< OPEN SPOP SOCKET ---- SPOP greeting response: ".$header.">>>>>>>>>>>>",'');
            return $sock;
        } else {
            runelog("[error][".$sock."]\t<<<<<<<<<<<< SPOP SOCKET ERROR: ".socket_strerror(socket_last_error($sock))." >>>>>>>>>>>>",'');
            // ui_notify('SPOP sock: '.$sock.'','socket error = '.socket_last_error($sock));
            return false;
        }
    }
}

function closeSpopSocket($sock)
{
    if (isset($sock['resource'])) {
      $sock = $sock['resource'];
    }
    sendSpopCommand($sock, 'bye');
    // socket_shutdown($sock, 2);
    // debug
    runelog("[close][".$sock."]\t<<<<<< CLOSE SPOP SOCKET (".socket_strerror(socket_last_error($sock)).") >>>>>>",'');
    socket_close($sock);
}


function sendSpopCommand($sock, $cmd)
{
    if (isset($sock['resource'])) {
      $sock = $sock['resource'];
    }
    $cmd = $cmd."\n";
    socket_write($sock, $cmd, strlen($cmd));
    runelog("SPOP COMMAND: (socket=".$sock.")", $cmd);
    //ui_notify('COMMAND GIVEN','CMD = '.$cmd,'','.9');
}

// detect end of SPOP response
function checkSpopEOR($chunk)
{
    if (strpos($chunk, "\n") !== false) {
        return true;
    } else {
        return false;
    }
}

function readSpopResponse($sock)
{
    // initialize vars
    $output = '';
    $read = '';
    $read_monitor = array();
    $write_monitor  = NULL;
    $except_monitor = NULL;
    // debug
    // socket monitoring
    // iteration counter
    // $i = 0;
    // timestamp
    // $starttime = microtime(true);
    // runelog('START timestamp:', $starttime);
    if ($sock['type'] === 2) {
        // handle burst mode 2 (nonblocking) socket session
        $buff = 1024;
        $end = 0;
        while($end === 0) {
            if (is_resource($sock['resource']) === true) {
                $read = socket_read($sock['resource'], $buff);
            } else {
                break;
            }
            if (checkSpopEOR($read) === true) {
                ob_start();
                echo $read;
                // flush();
                ob_flush();
                ob_end_clean();
                $end = 1;
                break;
            }
            if (strpos($read, "\n")) {
                ob_start();
                echo $read;
                // flush();
                ob_flush();
                ob_end_clean();
            } else {
                continue;               
            }
            usleep(200);
        }
    } elseif ($sock['type'] === 1) {
    // handle burst mode 1 (blocking) socket session
    $read_monitor = array($sock['resource']);
    $buff = 1310720;
    // debug
    // $socket_activity = socket_select($read_monitor, $write_monitor, $except_monitor, NULL);
    // runelog('socket_activity (pre-loop):', $socket_activity);
        do {
            // debug
            // $i++;
            // $elapsed = microtime(true);
            // read data from socket
            if (is_resource($sock['resource']) === true) {
                $read = socket_read($sock['resource'], $buff);
            } else {
                break;
            }
            // debug
            // runelog('socket_read status', $read);
            if ($read === '' OR $read === false) {
                $output = socket_strerror(socket_last_error($sock));
                // debug
                runelog('socket disconnected!!!', $output);
                break; 
            }
            $output .= $read;
            // usleep(200);
            // debug
            // runelog('_1_socket_activity (in-loop): iteration='.$i.' ', $socket_activity);
            // runelog('_1_buffer length:', strlen($output));
            // runelog('_1_iteration:', $i);
            // runelog('_1_timestamp:', $elapsed);
        } while (checkSpopEOR($read) === false);
        // debug
        // runelog('END timestamp:', $elapsed);
        // runelog('RESPONSE length:', strlen($output));
        // runelog('EXEC TIME:', $elapsed - $starttime);
        return $output;
    } else {
        // handle normal mode (blocking) socket session
        $read_monitor = array($sock);
        $buff = 4096;
        // debug
        // $socket_activity = socket_select($read_monitor, $write_monitor, $except_monitor, NULL);
        // runelog('socket_activity (pre-loop):', $socket_activity);
        do {
            // debug
            // $i++;
            // $elapsed = microtime(true);
            if (is_resource($sock) === true) {
                $read = socket_read($sock, $buff, PHP_NORMAL_READ);
            } else {
                break;
            }
            // debug
            // runelog('socket_read status', $read);
            if ($read === '' OR $read === false) {
                $output = socket_strerror(socket_last_error($sock));
                // debug
                runelog('socket disconnected!!!', $output);
                break; 
            }
            $output .= $read;
            // usleep(200);
            // debug
            // runelog('read buffer content (0 mode)', $read);
            // runelog('_0_buffer length:', strlen($output));
            // runelog('_0_iteration:', $i);
            // runelog('_0_timestamp:', $elapsed);
        } while (checkSpopEOR($read) === false);
        // debug
        // runelog('END timestamp:', $elapsed);
        // runelog('RESPONSE length:', strlen($output));
        // runelog('EXEC TIME:', $elapsed - $starttime);
        return $output;
    }
}

function sendSpopIdle($sock)
{
    sendSpopCommand($sock,'idle');
    $response = readSpopResponse($sock);
    return $response;
}

function monitorSpopState($sock)
{
    if ($change = sendSpopIdle($sock)) {
        $status = _parseSpopStatusResponse(SpopStatus($sock));
        runelog('monitorSpopState()', $status);
        return $status;
    }
}

function SpopStatus($sock)
{
    sendSpopCommand($sock, "status");
    $status = readSpopResponse($sock);
    return $status;
}

function getSpopPlayQueue($sock)
{
    sendSpopCommand($sock, 'qpls');
    $playqueue = readSpopResponse($sock);
    //return _parseFileListResponse($playqueue);
    return $playqueue;
}

function getSpopQueue($sock)
{
    $queue = '';
    sendSpopCommand($sock, 'qls');
    $playqueue = readSpopResponse($sock);
    //return _parseFileListResponse($playqueue);
    $pl = json_decode($playqueue);
    foreach ($pl->tracks as $track) {
        $queue .= "file: ".$track->uri."\n";
        $queue .= "Time: ".($track->duration / 1000)."\n";
        $queue .= "Track: ".$track->index."\n";
        $queue .= "Title: ".$track->title."\n";
        $queue .= "Artist: ".$track->artist."\n";
        $queue .= "AlbumArtist: ".$track->artist."\n";
        $queue .= "Album: ".$track->album."\n";
        $queue .= "Date:\n";
        $queue .= "Genre:\n";
        $queue .= "Pos: ".$track->index."\n";
        $queue .= "Id: ".$track->index."\n";
    }
    return $queue;
}

function spopDB($sock, $plid = null)
{
    if (isset($plid)) {
        sendSpopCommand($sock,"ls ".$plid);
    } else {
        sendSpopCommand($sock, 'ls');
    }
    $response = readSpopResponse($sock);
    return $response;
}

function getMpdOutputs($mpd)
{
    sendMpdCommand($mpd, 'outputs');
    $outputs= readMpdResponse($mpd);
    return $outputs;
}

function getLastFMauth($redis)
{
    $lastfmauth = $redis->hGetAll('lastfm');
    return $lastfmauth;
}

function setLastFMauth($redis, $lastfm)
{
    $redis->hSet('lastfm', 'user', $lastfm->user);
    $redis->hSet('lastfm', 'pass', $lastfm->pass);
}

function saveBookmark($redis, $path)
{
    $idx = $redis->incr('bookmarksidx');
    $name = parseFileStr($path,'/');
    $return = $redis->hSet('bookmarks', $idx, json_encode(array('name' => $name, 'path' => $path)));
    return $return;
}

function deleteBookmark($redis, $id)
{
    $return = $redis->hDel('bookmarks', $id);
    return $return;
}

function browseDB($sock,$browsemode,$query) {
    switch ($browsemode) {
        case 'file':
            if (isset($query) && !empty($query)){
                sendMpdCommand($sock,'lsinfo "'.html_entity_decode($query).'"');
            } else {
                sendMpdCommand($sock,'lsinfo');
			}
            break;
		case 'album':
            if (isset($query) && !empty($query)){
                sendMpdCommand($sock,'find "album" "'.html_entity_decode($query).'"');
            } else {
                sendMpdCommand($sock,'list "album"');
			}
            break;
		case 'artist':
            if (isset($query) && !empty($query)){
                sendMpdCommand($sock,'list "album" "'.html_entity_decode($query).'"');
            } else {
                sendMpdCommand($sock,'list "artist"');
			}
            break;
		case 'genre':
            if (isset($query) && !empty($query)){
                sendMpdCommand($sock,'list "artist" "genre" "'.html_entity_decode($query).'"');
            } else {
                sendMpdCommand($sock,'list "genre"');
			}
            break;
        case 'albumfilter':
            if (isset($query) && !empty($query)){
                sendMpdCommand($sock,'find "albumartist" "'.html_entity_decode($query).'" "album" ""');
            }
            break;
		case 'globalrandom':
            sendMpdCommand($sock,'listall');
            break;
	}
	$response = readMpdResponse($sock);
	return _parseFileListResponse($response);
}

function searchDB($sock,$querytype,$query) {
    sendMpdCommand($sock,"search ".$querytype." \"".html_entity_decode($query)."\"");
    $response = readMpdResponse($sock);
    return _parseFileListResponse($response);
}

function remTrackQueue($sock, $songpos)
{
    $datapath = findPLposPath($songpos, $sock);
    sendMpdCommand($sock, 'delete '.$songpos);
    $response = readMpdResponse($sock);
    return $datapath;
}

function addToQueue($sock, $path, $addplay = null, $pos = null, $clear = null)
{
    $fileext = parseFileStr($path,'.');
    $cmd = ($fileext == 'm3u' OR $fileext == 'pls' OR $fileext == 'cue') ? "load" : "add";    
    if (isset($addplay) || isset($clear)) {
        $cmdlist = "command_list_begin\n";
        $cmdlist .= (isset($clear)) ? "clear\n" : "";               // add clear call if needed
        $cmdlist .= $cmd." \"".html_entity_decode($path)."\"\n";
        $cmdlist .= (isset($addplay)) ? "play ".$pos."\n" : "";     // add play call if needed
        $cmdlist .= "command_list_end";
        sendMpdCommand($sock, $cmdlist);
    } else {
        sendMpdCommand($sock, $cmd." \"".html_entity_decode($path)."\"");
    }
}

function addAlbumToQueue($sock, $path, $addplay = null, $pos = null)
{
    if (isset($addplay)) {
        $cmdlist = "command_list_begin\n";
        $cmdlist .= "findadd \"album\" \"".html_entity_decode($path)."\"\n";
        $cmdlist .= "play ".$pos."\n";
        $cmdlist .= "command_list_end";
        sendMpdCommand($sock, $cmdlist);
    } else {
        sendMpdCommand($sock, "findadd \"album\" \"".html_entity_decode($path)."\"");
    }
}

/*
class globalRandom extends Thread
{
    // mpd status
    public $status;

    public function __construct($status)
    {
        $this->status = $status;
    }

    public function run()
    {
        $mpd = openMpdSocket('/run/mpd.sock');
            // if ($this->status['consume'] == 0 OR $this->status['random'] == 0) {
            if ($this->status['random'] == 0) {
                // sendMpdCommand($mpd,'consume 1');
                sendMpdCommand($mpd,'random 1');
            }
            $path = randomSelect($mpd);
            if ($path) {
                addToQueue($mpd,$path);
                runelog("global random call",$path);
                ui_notify('Global Random Mode', htmlentities($path,ENT_XML1,'UTF-8').' added to current Queue');
            }
        closeMpdSocket($mpd);
    }
}
*/

function randomSelect($sock)
{
    $songs = browseDB($sock, 'globalrandom');
    srand((float) microtime() * 10000000);
    $randkey = array_rand($songs);
    return $songs[$randkey]['file'];
}

function MpdStatus($sock)
{
    sendMpdCommand($sock, "status");
    $status = readMpdResponse($sock);
    return $status;
}

function songTime($sec)
{
    $minutes = sprintf('%02d', floor($sec / 60));
    $seconds = sprintf(':%02d', (int) $sec % 60);
    return $minutes.$seconds;
}

function sysCmd($syscmd)
{
    exec($syscmd." 2>&1", $output);
    runelog('sysCmd($str)', $syscmd);
    runelog('sysCmd() output:', $output);
    return $output;
}

function sysCmdAsync($syscmd, $waitsec = null) {
    if (isset($waitsec)) {
        $cmdstr = "/var/www/command/cmd_async ".base64_encode($syscmd);
    } else {
        $cmdstr = "/var/www/command/cmd_async ".base64_encode($syscmd);
    }
    exec($cmdstr." > /dev/null 2>&1 &", $output);
    runelog('sysCmdAsync($cmdstr) decoded', $syscmd, __FUNCTION__);
    runelog('sysCmdAsync($cmdstr) encoded', $cmdstr, __FUNCTION__);
    runelog('sysCmdAsync() output:', $output, __FUNCTION__);
    return $output;
}

function getMpdDaemonDetalis()
{
    $cmd = sysCmd('id -u mpd');
    $details['uid'] = $cmd[0];
    $cmd = sysCmd('id -g mpd');
    $details['gid'] = $cmd[0];
    $cmd = sysCmd('pgrep -u mpd');
    $details['pid'] = $cmd[0];
    return $details;
}

// using an array as needles in strpos
function strposa($haystack, $needle, $offset=0)
{
    if (!is_array($needle)) $needle = array($needle);
    foreach ($needle as $query) {
        if (strpos($haystack, $query, $offset) !== false) return true; // stop on first true result
    }
    return false;
}

// format Output for "playlist"
function _parseFileListResponse($resp)
{
    if (is_null($resp)) {
        return null;
    } else {
        // $start_time = microtime(TRUE);
        $plistArray = array();
        $plistLine = strtok($resp, "\n");
        // $plistFile = "";
        $plCounter = -1;
        $browseMode = TRUE;
        while ($plistLine) {
            if (!strpos($plistLine,'@eaDir') && !strpos($plistLine,'.Trash')) list ($element, $value) = explode(': ', $plistLine, 2);
            // $blacklist = ['@eaDir', '.Trash'];
            // if (!strposa($plistLine, $blacklist)) list ($element, $value) = explode(': ', $plistLine, 2);
            if ($element === 'file' OR $element === 'playlist') {
                $plCounter++;
                $browseMode = FALSE;
                // $plistFile = $value;
                $plistArray[$plCounter][$element] = $value;
                $plistArray[$plCounter]['fileext'] = parseFileStr($value, '.');
            } elseif ($element === 'directory') {
                $plCounter++;
                // record directory index for further processing
                $dirCounter++;
                // $plistFile = $value;
                $plistArray[$plCounter]['directory'] = $value;
            } elseif ($browseMode) {
                if ( $element === 'Album' ) {
                    $plCounter++;
                    $plistArray[$plCounter]['album'] = $value;
                } elseif ( $element === 'Artist' ) {
                    $plCounter++;
                    $plistArray[$plCounter]['artist'] = $value;
                } elseif ( $element === 'Genre' ) {
                    $plCounter++;
                    $plistArray[$plCounter]['genre'] = $value;
                }
            } else {
                $plistArray[$plCounter][$element] = $value;
                $plistArray[$plCounter]['Time2'] = songTime($plistArray[$plCounter]['Time']);
            }
            $plistLine = strtok("\n");
        }
        // $end_time = microtime(TRUE);
        // if (($end_time - $start_time) > 0.1) {
            // ui_notify_async('ELAPSED', $end_time - $start_time);
        // }
    }
    return $plistArray;
}

// format Output for "status"
function _parseStatusResponse($resp)
{
    if (is_null($resp)) {
        return null;
    } else {
        $plistArray = array();
        $plistLine = strtok($resp, "\n");
        $plistFile = "";
        $plCounter = -1;
        while ($plistLine) {
            list ($element, $value) = explode(": ", $plistLine, 2);
            $plistArray[$element] = $value;
            $plistLine = strtok("\n");
        }
        // "elapsed time song_percent" added to output array
         $time = explode(":", $plistArray['time']);
         if ($time[0] != 0) {
         $percent = round(($time[0]*100)/$time[1]);
         } else {
            $percent = 0;
         }
         $plistArray["song_percent"] = $percent;
         $plistArray["elapsed"] = $time[0];
         $plistArray["time"] = $time[1];

         // "audio format" output
        $audio_format = explode(":", $plistArray['audio']);
        switch ($audio_format[0]) {
            case '48000':
                // no break
            case '96000':
                // no break
            case '192000':
            $plistArray['audio_sample_rate'] = rtrim(rtrim(number_format($audio_format[0]), 0), ',');
                break;
            case '44100':
                // no break
            case '88200':
                // no break
            case '176400':
                // no break
            case '352800':
            $plistArray['audio_sample_rate'] = rtrim(number_format($audio_format[0], 0, ',', '.'),0);
                break;
        }
        // format "audio_sample_depth" string
        $plistArray['audio_sample_depth'] = $audio_format[1];
        // format "audio_channels" string
        if ($audio_format[2] === "2") $plistArray['audio_channels'] = "Stereo";
        if ($audio_format[2] === "1") $plistArray['audio_channels'] = "Mono";
        // if ($audio_format[2] > 2) $plistArray['audio_channels'] = "Multichannel";
    }
    return $plistArray;
}

function _parseSpopStatusResponse($resp)
{
if (is_null($resp)) {
        return null;
    } else {
        $status = array();
        $resp = json_decode($resp);
        if ($resp->status === "playing") $status['state'] = "play";
        if ($resp->status === "stopped") $status['state'] = "stop";
        if ($resp->status === "paused") $status['state'] = "pause";
        if ($resp->repeat === false) {
            $status['repeat'] = '0';
        } else {
            $status['repeat'] = '1';
        }
        if ($resp->shuffle === false) {
            $status['random'] = '0';
        } else {
            $status['random'] = '1';
        }
        $status['playlistlength'] = $resp->total_tracks;
        $status['currentartist'] = $resp->artist;
        $status['currentalbum'] = $resp->album;
        $status['currentsong'] = $resp->title;
        $status['song'] = $resp->current_track -1;
        if (isset($resp->position)) {
            $status['elapsed'] = $resp->position;
        } else {
            $status['elapsed'] = 0;
        }
        $status['time'] = $resp->duration / 1000;
        $status['volume'] = 100;
        if ($resp->status === "stopped") {
            $status['song_percent'] = 0;
        } else {
            $status['song_percent'] = round(100 - (($status['time'] - $status['elapsed']) * 100 / $status['time']));
        }
        $status['uri'] = $resp->uri;
        $status['popularity'] = $resp->popularity;        
        return $status;
    }
}

function _parseOutputsResponse($input, $active)
{
    if (is_null($input)) {
        return null;
    } else {
        $response = preg_split("/\r?\n/", $input);
        $outputs = array();
        $linenum = 0;
        $i = -1;
        foreach($response as $line) {
            if ($linenum % 3 == 0) {
                $i++;
            }
        if (!empty($line)) {
        $value = explode(':', $line);
        $outputs[$i][$value[0]] = trim($value[1]);
            if (isset($active)) {
                if ($value[0] == 'outputenabled' && $outputs[$i][$value[0]] == 1) {
                    $active = $i;
                }
            }
        } else {
            unset($outputs[$i]);
        }
            $linenum++;
        }
    }
    if (isset($active)) {
        return $active;
    } else {
        return $outputs;
    }
}

// get file extension
function parseFileStr($strFile, $delimiter, $negative = null)
{
    // runelog("parseFileStr($strFile,$delimiter)");
    $pos = strrpos($strFile, $delimiter);
    // runelog('parseFileStr (position of delimiter)',$pos);
    if (isset($negative)) {
        $str = substr($strFile, 0, -4);
    } else {
        $str = substr($strFile, $pos+1);
    }
    // runelog('parseFileStr (string)',$str);
    return $str;
}

function OpCacheCtl($action, $basepath, $redis = null)
{
    if ($action === 'prime' OR $action === 'primeall') $cmd = 'opcache_compile_file';
    if ($action === 'reset') $cmd = 'opcache_invalidate';
    if ($action === 'prime') {
        $files = $redis->sMembers('php_opcache_prime');
        foreach ($files as $file) {
            opcache_compile_file($file);
        }
    }
    if ($action === 'primeall' OR $action === 'reset') {
        if (is_file($basepath)) {
            if (parseFileStr($basepath,'.') === 'php' && $basepath !== '/srv/http/command/cachectl.php' ) $cmd ($basepath);
        }
        elseif(is_dir($basepath)) {
            $scan = glob(rtrim($basepath,'/').'/*');
            foreach($scan as $index=>$path) {
                OpCacheCtl($path,$action);
            }
        }
    }
}

function netMounts($redis, $action, $data = null)
{
    // mountpoint input format
    // $data = array( 'name' => '', 'type' => '', 'address' => '', 'remotedir' => '', 'username' => '', 'password' => '', 'charset' => '', 'rsize' => '', 'wsize' => '', 'options' => '', 'error' => '' );
    switch ($action) {
        case 'list':
            $mp = $redis->Keys('mount_*');
            runelog('keys list: ', $mp);
            break;
        case 'read':
            if (isset($data)) {
                $mp = $redis->hGetAll($data);
            } else {
                $mp = array();
                $mounts = netMounts($redis, 'list');
                foreach ($mounts as $mount) {
                    $mp[] = netMounts($redis, 'read', $mount);
                }
            }
            break;
        case 'write':
            $redis->hSet('mount_'.$data['name'], 'name', $data['name']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'type', $data['type']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'address', $data['address']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'remotedir', $data['remotedir']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'username', $data['username']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'password', $data['password']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'charset', $data['charset']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'rsize', $data['rsize']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'wsize', $data['wsize']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'options', $data['options']) || $mp = 0;
            $redis->hSet('mount_'.$data['name'], 'error', $data['error']) || $mp = 0;
            if (!isset($mp)) {
                $mp = 1;
            } else {
                $redis->Del('mount_'.$data['name']);
            }
            break;
        case 'delete':
            if (isset($data)) {
                $mp = $redis->Del('mount_'.$data['name']);
            } else {
                $mp = sysCmd('redis-cli KEYS "mount_*" | xargs redis-cli DEL');
            }
            break;
    }
    return $mp;
}

// Ramplay functions
function rp_checkPLid($id, $mpd)
{
    $_SESSION['DEBUG'] .= "rp_checkPLid:$id |";
    sendMpdCommand($mpd,'playlistid '.$id);
    $response = readMpdResponse($mpd);
    echo "<br>debug__".$response;
    echo "<br>debug__".stripos($response,'MPD error');
    if (stripos($response,'OK')) {
        return true;
    } else {
        return false;
    }
}

//<< TODO: join with findPLposPath
function rp_findPath($id, $mpd)
{
    sendMpdCommand($mpd, 'playlistid '.$id);
    $idinfo = _parseFileListResponse(readMpdResponse($mpd));
    $path = $idinfo[0]['file'];
    return $path;
}

//<< TODO: join with rp_findPath()
function findPLposPath($songpos, $mpd)
{
    sendMpdCommand($mpd, 'playlistinfo '.$songpos);
    $idinfo = _parseFileListResponse(readMpdResponse($mpd));
    $path = $idinfo[0]['file'];
    return $path;
}

function rp_deleteFile($id, $mpd)
{
    $_SESSION['DEBUG'] .= "rp_deleteFile:$id |";
    if (unlink(rp_findPath($id, $mpd))) {
        return true;
    } else {
        return false;
    }
}

function rp_copyFile($id, $mpd)
{
    $_SESSION['DEBUG'] .= "rp_copyFile: $id|";
    $path = rp_findPath($id, $mpd);
    $song = parseFileStr($path, "/");
    $realpath = "/mnt/".$path;
    $ramplaypath = "/dev/shm/".$song;
    $_SESSION['DEBUG'] .= "rp_copyFilePATH: $path $ramplaypath|";
    if (copy($realpath, $ramplaypath)) {
        $_SESSION['DEBUG'] .= "rp_addPlay:$id $song $path $pos|";
        return $path;
    } else {
        return false;
    }
}

function rp_updateFolder($mpd)
{
    $_SESSION['DEBUG'] .= "rp_updateFolder: |";
    sendMpdCommand($mpd, "update ramplay");
}

function rp_addPlay($path, $mpd, $pos)
{
    $song = parseFileStr($path,"/");
    $ramplaypath = "ramplay/".$song;
    $_SESSION['DEBUG'] .= "rp_addPlay:$id $song $path $pos|";
    addToQueue($mpd, $ramplaypath);
    sendMpdCommand($mpd, 'play '.$pos);
}

function rp_clean()
{
    $_SESSION['DEBUG'] .= "rp_clean: |";
    recursiveDelete('/dev/shm/');
}

function recursiveDelete($str)
{
    if(is_file($str)) {
        return @unlink($str);
        // TODO: add search path in playlist and remove from playlist
    }
    elseif(is_dir($str)) {
        $scan = glob(rtrim($str, '/').'/*');
        foreach($scan as $index=>$path) {
            recursiveDelete($path);
        }
    }
}

function pushFile($filepath)
{
runelog('pushFile(): filepath', $filepath);
    if (file_exists($filepath)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename='.basename($filepath));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: '.filesize($filepath));
        ob_clean();
        flush();
        readfile($filepath);
        return true;
    } else {
        return false;
    }
}

// check if mpd.conf or interfaces was modified outside
function hashCFG($action, $redis)
{
    switch ($action) {
        case 'check_net':
            // --- CODE REWORK NEEDED ---
            $hash = md5_file('/etc/netctl/eth0');
            if ($redis->get('netconfhash') !== $hash) {
                $redis->set('netconf_advanced', 1);
                return false;
            } else {
                $redis->set('netconf_advanced', 0);
            }
            break;
        case 'check_mpd':
            $hash = md5_file('/etc/mpd.conf');
            if ($redis->get('mpdconfhash') !== $hash) {
                $redis->set('mpdconf_advanced', 1);
                return false;
            } else {
                $redis->set('mpdconf_advanced', 0);
            }
            break;
    }
    return true;
}


function runelog($title, $data = null, $function_name = null)
{
// Connect to Redis backend
    $store = new Redis();
    $store->connect('127.0.0.1', 6379);
    $debug_level = $store->get('debug');
    if (isset($function_name)) {
        $function_name = '['.$function_name.'] ';
    } else {
        $function_name = '';
    }
    if ($debug_level !== '0') {
        if(is_array($data) OR is_object($data)) {
            if (is_array($data)) error_log($function_name.'### '.$title.' ### $data type = array',0);
            if (is_object($data)) error_log($function_name.'### '.$title.' ### $data type = object',0);
            foreach($data as $key => $value) {
                error_log($function_name.'### '.$title.' ###  [\''.$key.'\'] => '.$value,0);
            }
        } else {
            error_log($function_name.'### '.$title.' ###  '.$data,0);
        }
    }
    $store->close();
}

function waitSyWrk($redis, $jobID)
{
    if (is_array($jobID)) {
        foreach ($jobID as $job) {
            do {
                usleep(650000);
            } while ($redis->sIsMember('w_lock', $job));
        }
    } elseif (!empty($jobID)) {
        do {
            usleep(650000);
        } while ($redis->sIsMember('w_lock', $jobID));
    }
}

function getmac($nicname)
{
    $mac = file_get_contents('/sys/class/net/'.$nicname.'/address');
    $mac = strtolower($mac);
    runelog('getmac('.$nicname.'): ', $mac);
    return trim($mac);
}

function wrk_avahiconfig($hostname)
{
    if (!file_exists('/etc/avahi/services/runeaudio.service')) {
        runelog('avahi service descriptor not present, initializing...');
        sysCmd('/usr/bin/cp /var/www/app/config/defaults/avahi_runeaudio.service /etc/avahi/services/runeaudio.service');
    }
    $file = '/etc/avahi/services/runeaudio.service';
    $newArray = wrk_replaceTextLine($file, [],'replace-wildcards', '<name replace-wildcards="yes">RuneAudio ['.$hostname.'] ['.getmac('eth0').']</name>');
    // Commit changes to /etc/avahi/services/runeaudio.service
    $fp = fopen($file, 'w');
    fwrite($fp, implode("", $newArray));
    fclose($fp);
}

function wrk_control($redis, $action, $data)
{
    $jobID = "";
    // accept $data['action'] $data['args'] from controller
    switch ($action) {
        case 'newjob':
            // generate random jobid
            $jobID = wrk_jobID();
            $wjob = array(
                'wrkcmd' => (isset($data['wrkcmd'])? $data['wrkcmd'] : NULL),
                'action' => (isset($data['action'])? $data['action'] : NULL),
                'args' => (isset($data['args'])? $data['args'] : NULL)
            );
            $redis->hSet('w_queue', $jobID, json_encode($wjob));
            runelog('wrk_control data:', $redis->hGet('w_queue', $jobID));
            break;
    }
    // debug
    runelog('[wrk] wrk_control($redis,'.$action.',$data) jobID='.$jobID, $data, 'wrk_control');
    return $jobID;
}

// search a string in a file and replace with another string the whole line.
function wrk_replaceTextLine($file, $inputArray, $strfind, $strrepl, $linelabel = null, $lineoffset = null)
{
    runelog('wrk_replaceTextLine($file, $inputArray, $strfind, $strrepl, $linelabel, $lineoffset)','');
    runelog('wrk_replaceTextLine $file', $file);
    runelog('wrk_replaceTextLine $strfind', $strfind);
    runelog('wrk_replaceTextLine $strrepl', $strrepl);
    runelog('wrk_replaceTextLine $linelabel', $linelabel);
    runelog('wrk_replaceTextLine $lineoffset', $lineoffset);
    if (!empty($file)) {
        $fileData = file($file);
    } else {
        $fileData = $inputArray;
    }
    $newArray = array();
    if (isset($linelabel) && isset($lineoffset)) {
        $linenum = 0;
    }
    foreach($fileData as $line) {
        if (isset($linelabel) && isset($lineoffset)) {
            $linenum++;
            if (preg_match('/'.$linelabel.'/', $line)) {
                $lineindex = $linenum;
                runelog('line index match! $line', $lineindex);
            }
            if ((($lineindex+$lineoffset)-$linenum)==0) {
                if (preg_match('/'.$strfind.'/', $line)) {
                    $line = $strrepl."\n";
                    runelog('internal loop $line', $line);
                }
            }
        } else {
          if (preg_match('/'.$strfind.'/', $line)) {
            $line = $strrepl."\n";
            runelog('replaceall $line', $line);
          }
        }
      $newArray[] = $line;
    }
    return $newArray;
}

// make device TOTALBACKUP (with switch DEV copy all /etc)
function wrk_backup($bktype)
{
    if ($bktype === 'dev') {
        $filepath = "/run/totalbackup_".date('Y-m-d').".tar.gz";
        $cmdstring = "tar -czf ".$filepath." /var/lib/mpd /boot/cmdline.txt /var/www /etc /var/lib/redis/rune.rdb";
    } else {
        $filepath = "/run/backup_".date('Y-m-d').".tar.gz";
        $cmdstring = "tar -czf ".$filepath." /var/lib/mpd /etc/mpd.conf /var/lib/redis/rune.rdb /etc/netctl /etc/mpdscribble.conf /etc/spop";
    }
    sysCmd($cmdstring);
    return $filepath;
}


function wrk_opcache($action, $redis)
{
// debug
runelog('wrk_opcache ', $action);
    switch ($action) {
        case 'prime':
            opcache_reset();
            if ($redis->get('opcache') == 1) sysCmd('curl http://127.0.0.1/command/cachectl.php?action=prime');
            break;
        case 'forceprime':
            opcache_reset();
            sysCmd('curl http://127.0.0.1/command/cachectl.php?action=prime');
            break;
        case 'reset':
            // sysCmd('curl http://127.0.0.1/clear');
            // reset cache
            OpCacheCtl('reset', '/srv/http/');
            opcache_reset();
            break;
        case 'enable':
            // opcache.ini
            $file = '/etc/php/conf.d/opcache.ini';
            $newArray = wrk_replaceTextLine($file, '', 'opcache.enable', 'opcache.enable=1', 'zend_extension', 1);
            // Commit changes to /etc/php/conf.d/opcache.ini
            $fp = fopen($file, 'w');
            fwrite($fp, implode("", $newArray));
            fclose($fp);
            $redis->set('opcache', 1);
            break;
        case 'disable':
            // opcache.ini
            // -- REWORK NEEDED --
            $file = '/etc/php/conf.d/opcache.ini';
            $newArray = wrk_replaceTextLine($file, '', 'opcache.enable', 'opcache.enable=0', 'zend_extension', 1);
            // Commit changes to /etc/php/conf.d/opcache.ini
            $fp = fopen($file, 'w');
            fwrite($fp, implode("", $newArray));
            fclose($fp);
            $redis->set('opcache', 0);
            break;
    }
}

// KEW
// takes a netmask and returns the CIDR notation
// in: net_NetmaskToCidr("255.255.255.0");
// out: 24
function net_NetmaskToCidr($netmask) {
    $bits = 0;
    $chunks = explode(".", $netmask);
    foreach($chunks as $octect) {
        $bits += strlen(str_replace("0", "", decbin($octect)));
    }
    return $bits;
}

// KEW
// takes CIDR notation and returns the netmask string
// in: net_CidrToNetmask(24);
// out: "255.255.255.0"
function net_CidrToNetmask($cidr) {
    $netmask = str_split(str_pad(str_pad('', $cidr, '1'), 32, '0'), 8);
    foreach ($netmask as &$element) {
        $element = bindec($element);
    }
    return join('.', $netmask);
}

function wrk_netconfig($redis, $action, $args = null, $configonly = null)
{
	$return = array();
    // nics blacklist
    $excluded_nics = array('ifb0', 'ifb1', 'p2p0', 'bridge');
    $updateh = 0;
    switch ($action) {
        case 'setnics':
            // flush nics Redis hash table
            $transaction = $redis->multi();
            $transaction->del('nics');
            $interfaces = sysCmd("ip addr |grep \"BROADCAST,\" |cut -d':' -f1-2 |cut -d' ' -f2");
            $interfaces = array_diff($interfaces, $excluded_nics);
            foreach ($interfaces as $interface) {
                $ip = sysCmd("ip addr list ".$interface." |grep \"inet \" |cut -d' ' -f6|cut -d/ -f1");
                //***
                // KEW: Do we need to assume this may be CIDR & may be Netmask notatation?
                $netmask = sysCmd("ip addr list ".$interface." |grep \"inet \" |cut -d' ' -f6|cut -d/ -f2");
                if (isset($netmask[0])) {
                    $netmask = netmask($netmask[0]);
                } else {
                    unset($netmask);
                }
                $gw = sysCmd("route -n |grep \"0.0.0.0\" |grep \"UG\" |cut -d' ' -f10");
                $dns = sysCmd("cat /etc/resolv.conf |grep \"nameserver\" |cut -d' ' -f2");
                $type = sysCmd("iwconfig ".$interface." 2>&1 | grep \"no wireless\"");
                runelog('interface type', (isset($type[0]) ? $type[0] : NULL));
                // if (empty(sysCmd("iwlist ".$interface." scan 2>&1 | grep \"Interface doesn't support scanning\""))) {
                if (empty($type[0])) {
                    $speed = sysCmd("iwconfig ".$interface." 2>&1 | grep 'Bit Rate' | cut -d '=' -f 2 | cut -d ' ' -f 1-2");
                    $currentSSID = sysCmd("iwconfig ".$interface." | grep 'ESSID' | cut -d ':' -f 2 | cut -d '\"' -f 2");
                    $currentSSID = sysCmd("iwconfig ".$interface." | grep 'ESSID' | cut -d ':' -f 2 | cut -d '\"' -f 2");
                    $transaction->hSet('nics',
						$interface,
						json_encode(array(
							'ip' => $ip[0],
							'netmask' => $netmask,
							'gw' => (isset($gw[0]) ? $gw[0] : null),
							'dns1' => (isset($dns[0]) ? $dns[0] : null),
							'dns2' => (isset($dns[1]) ? $dns[1] : null),
							'speed' => (isset($speed[0]) ? $speed[0] : null),
							'wireless' => 1,
							'currentssid' => $currentSSID[0])));
                    //// $scanwifi = 1;
                } else {
                    $speed = sysCmd("ethtool ".$interface." 2>&1 | grep -i speed | cut -d':' -f2");
                    $transaction->hSet('nics',
						$interface,
						json_encode(array(
							'ip' => $ip[0],
							'netmask' => $netmask,
							'gw' => (isset($gw[0]) ? $gw[0] : null),
							'dns1' => (isset($dns[0]) ? $dns[0] : null),
							'dns2' => (isset($dns[1]) ? $dns[1] : null),
							'speed' => (isset($speed[0]) ? $speed[0] : null),
							'wireless' => 0)));
                }
            }
            $transaction->exec();
            break;
        case 'getnics':
		    $gw = array();
			$dns = array();
			$speed = array();
		
		    $interfaces = sysCmd("ip addr |grep \"BROADCAST,\" |cut -d':' -f1-2 |cut -d' ' -f2");
            $interfaces = array_diff($interfaces, $excluded_nics);
            foreach ($interfaces as $interface) {
                $ip = sysCmd("ip addr list ".$interface." |grep \"inet \" |cut -d' ' -f6|cut -d/ -f1");
                $netmask = sysCmd("ip addr list ".$interface." |grep \"inet \" |cut -d' ' -f6|cut -d/ -f2");
                if (isset($netmask[0]) && isset($ip[0])) {
                    $netmask = "255.255.255.0";//netmask($netmask[0]);
                } else {
                    unset($netmask);
                }
                if (isset($netmask[0])) {
                    $gw = sysCmd("route -n |grep \"0.0.0.0\" |grep \"UG\" |cut -d' ' -f10");
                    $dns = sysCmd("cat /etc/resolv.conf |grep \"nameserver\" |cut -d' ' -f2");
                }
                $type = sysCmd("iwconfig ".$interface." 2>&1 | grep \"no wireless\"");
                if (empty($type[0])) {
                    $speed = sysCmd("iwconfig ".$interface." 2>&1 | grep 'Bit Rate' | cut -d ':' -f 2 | cut -d ' ' -f 1-2");
                    $currentSSID = sysCmd("iwconfig ".$interface." | grep 'ESSID' | cut -d ':' -f 2 | cut -d '\"' -f 2");
                    $actinterfaces[$interface] = (object) [
						'ip' => (isset($ip[0]) ? $ip[0] : null),
                        'netmask' => (isset($netmask) ? $netmask : null),
                        'gw' => (isset($gw[0]) ? $gw[0] : null),
                        'dns1' => (isset($dns[0]) ? $dns[0] : null),
                        'dns2' => (isset($dns[1]) ? $dns[1] : null),
                        'speed' => (isset($speed[0]) ? $speed[0] : null),
                        'wireless' => 1,
                        'currentssid' => (isset($currentSSID[0]) ? $currentSSID[0] : null)
						];
                    
                    $redis->hSet('nics', $interface,
						json_encode(array(
							'ip' => (isset($ip[0]) ? $ip[0] : null),
							'netmask' => (isset($netmask) ? $netmask : null),
							'gw' => (isset($gw[0]) ? $gw[0] : null),
							'dns1' => (isset($dns[0]) ? $dns[0] : null),
							'dns2' => (isset($dns[1]) ? $dns[1] : null),
							'speed' => (isset($speed[0]) ? $speed[0] : null),
							'wireless' => 1,
							'currentssid' => (isset($currentSSID[0]) ? $currentSSID[0] : null)
							)));
                } else {
                    $speed = sysCmd("ethtool ".$interface." 2>&1 | grep -i speed | cut -d':' -f2");
                    $actinterfaces[$interface] = (object) ['ip' => $ip[0], 'netmask' => $netmask, 'gw' => $gw[0], 'dns1' => $dns[0], 'dns2' => $dns[1], 'speed' => $speed[0], 'wireless' => 0];
                    $redis->hSet('nics', $interface , json_encode(array('ip' => $ip[0], 'netmask' => $netmask, 'gw' => $gw[0], 'dns1' => $dns[0], 'dns2' => $dns[1], 'speed' => $speed[0],'wireless' => 0)));
                }
            }
            return $actinterfaces;
            break;
		case 'getstoredwlans':
			$wlans = array();
			$connected = 0;
			sysCmd('/www/command/refresh_nics');
			$wlans_profiles = json_decode($redis->Get('stored_profiles'));
			foreach ($wlans_profiles as $profile) {
				runelog('  Get stored wlan profiles:'.$profile);
				
                 //*** Does this work? where do we get $nicdetail??   https://github.com/RuneAudio/RuneUI/blob/dev/app/libs/runeaudio.php#L1460
                 //if ($nicdetail->currentssid === $profile) {
                 //    $connected = 1;
                 //} else {
                 //    $connected = 0;
                 //}
                $wlans[] = json_encode(array('ssid' => $profile, 'encryption' => 'on', 'connected' => $connected, 'storedprofile' => 1));
            }
            return $wlans;
            //break;
        case 'writecfg':
            // ArchLinux netctl config for wired ethernet
                $nic = "Description='".$args->name." connection'\n";
                $nic .= "Interface=".$args->name."\n";
            if ($args->wireless === '1') {
                // Wireless configuration
                $nic .= "Connection=wireless\n";
                $nic .= "Security=wpa-configsection\n";
            } else {
                // Wired configuration
                $nic .= "ForceConnect=yes\n";
                $nic .= "SkipNoCarrier=yes\n";
                $nic .= "Connection=ethernet\n";
            }
            if ($args->dhcp === '1') {
                // DHCP configuration
                $nic .= "IP=dhcp\n";
                // Prepare data object for Redis record
                $dhcpargs = array( 'name' => $args->name, 'dhcp' => $args->dhcp );
                $dhcpargs = (object) $args;
            } else {
                // STATIC configuration
                $nic .= "AutoWired=yes\n";
                $nic .= "ExcludeAuto=no\n";
                $nic .= "IP=static\n";
                // KEW
                // Need address in CIDR notation 0.0.0.0/0
                $cidr = net_NetmaskToCidr($args->netmask);
                $nic .= "Address=('".$args->ip."/".$cidr."')\n";
                
                $nic .= "Gateway='".$args->gw."'\n";
                if (!empty($args->dns2)) {
                    $nic .= "DNS=('".$args->dns1."' '".$args->dns2."')\n";
                } else {
                    $nic .= "DNS=('".$args->dns1."')\n";
                }
            }
            if ($args->wireless === '1') {
                $nic .= "WPAConfigSection=(\n";
                if ($args->newssid === "add") {
                    $nic .= "    'ssid=\"".$args->ssid."\"'\n";
                    $nic .= "    'scan_ssid=1'\n";
                } else {
                    $nic .= "    'ssid=\"".$args->newssid."\"'\n";
                }
                //$key = $args->key;
                switch ($args->encryption) {
                    case 'none':
                        $nic .= "    'key_mgmt=NONE'\n";
                        break;
                    case 'wep':
                        $nic .= "    'key_mgmt=NONE'\n";
                        $nic .= "    'wep_tx_keyidx=0'\n";
                        $wepkey = $args->key;
                        if (ctype_xdigit($wepkey) && (strlen($wepkey) == 10 OR strlen($wepkey) == 26 OR strlen($wepkey) == 32)) {
                            $nic .= "    'wep_key0=".$wepkey."'\n";
                        } elseif (strlen($wepkey) <= 16) {
                            $nic .= "    'wep_key0=\"".$wepkey."\"'\n";
                        } else {
                            $nic .= "    'wep_key0=\"* wrong wepkey *\"'\n";
                            ui_notify_async('WIFI-Config ERROR', "You entered a wrong key!\n");
                            return '';
                       }
                        //            auth_alg=SHARED
                        break;
                    case 'wpa':
                        $wpakey = $args->key;
                        if (ctype_xdigit($wpakey) && strlen($wpakey) == 64) {
                            $nic .= "    'psk=".$wpakey."'\n";
                        } elseif (strlen($wpakey) >= 8 && strlen($wpakey) <= 63) {
                            $nic .= "    'psk=\"".$wpakey."\"'\n";
                        } else {
                            $nic .= "    'psk=\"* wrong wepkey *\"'\n";
                            ui_notify_async('WIFI-Config ERROR', "You entered a wrong key!\n");
                            return '';
                        }
                        $nic .= "    'key_mgmt=WPA-PSK'\n";
                        if (strpos($args->ie, "WPA2") !== false) {
                            $nic .= "    'proto=RSN'\n";
                        } else {
                            $nic .= "    'proto=WPA'\n";
                        }
                        if (strpos($args->GroupCipher, "CCMP") !== false) {
                            $nic .= "    'group=CCMP'\n";
                        } else {
                            $nic .= "    'group=TKIP'\n";
                        }           
                        if (strpos($args->PairwiseCiphers1, "CCMP") !== false OR strpos($args->PairwiseCiphers2, "CCMP") !== false) {
                            $nic .= "    'pairwise=CCMP'\n";
                        } else {
                            $nic .= "    'pairwise=TKIP'\n";
                        }
                }
                $nic .= "    'priority=3'\n";
                $nic .= ")\n";
            }

            // set advanced DNS options
            $newArray = wrk_replaceTextLine('/etc/resolvconf.conf', '', 'resolv_conf_options=', "resolv_conf_options=('timeout:".$redis->hGet('resolvconf', 'timeout')." attempts:".$redis->hGet('resolvconf', 'attempts')."')", '#name_servers=127.0.0.1', 1);
            // Commit changes to /etc/resolvconf.conf
            $fp = fopen('/etc/resolvconf.conf', 'w');
            fwrite($fp, implode("", $newArray));
            fclose($fp);
            // tell the system to update /etc/resolv.conf
            sysCmd('resolvconf -u');

            // write current network config
            runelog("wireless = ".$args->wireless);
            if ($args->wireless === '1') {
                // wireless
                runelog("save as wireless");
                if ($args->newssid === "add") {
                    $redis->Set($args->ssid, json_encode($args));
                    $fp = fopen('/etc/netctl/'.$args->ssid, 'w');
                } else {
                    $redis->Set($args->newssid, json_encode($args));
                    $fp = fopen('/etc/netctl/'.$args->newssid, 'w');
                }
            } else {
                // wired
                runelog("save as wired");
                $redis->Set($args->name, json_encode($args));
                $fp = fopen('/etc/netctl/'.$args->name, 'w');
            }
            fwrite($fp, $nic);
            fclose($fp);
            if (!isset($configonly)) $updateh = 1;
            //$updateh = 1;
            break;
        case 'manual':
            $file = '/etc/netctl/'.$args['name'];
            $fp = fopen($file, 'w');
            fwrite($fp, $args['config']);
            fclose($fp);
            $updateh = 1;
            break;
        case 'reset':
            wrk_netconfig($redis, 'setnics');
            $args = new stdClass;
            $args->dhcp = '1';
            $args->name = 'eth0';
            wrk_netconfig($redis, 'writecfg', $args);
            $updateh = 1;
            break;
    }
    if ($updateh === 1) {
        sysCmd('mpc pause');
        //sysCmd('systemctl stop mpd');
        // activate configuration (RuneOS)
        runelog("wireless = ".$args->wireless);
        if ($args->wireless !== '1') {
            sysCmd('systemctl reenable netctl-ifplugd@'.$args->name);
            if ($args->reboot === '1') {
                runelog('**** reboot requested ****', $args->name);
                $return = 'reboot';
            } else {
                runelog('**** no reboot requested ****', $args->name);
                sysCmd('systemctl restart netctl-ifplugd@'.$args->name);
                $return[] = '';
            }
        } else {
            sysCmd('systemctl reenable netctl-auto@'.$args->name);
            sysCmd('systemctl restart netctl-auto@'.$args->name);
            sysCmd('netctl-auto enable '.$args->newssid);
            sysCmd('netctl-auto switch-to '.$args->newssid);
            runelog('**** wireless => do not reboot ****', $args->name);
            $return[] = '';
        }
    }
    // update hash if necessary
    $updateh === 0 || $redis->set($args->name.'_hash', md5_file('/etc/netctl/'.$args->name));
    if (wrk_mpdPlaybackStatus($redis, 'laststate') === 'playing') sysCmd('mpc play');
    return $return;
}

function wrk_wifiprofile($redis, $action, $args)
{
    switch ($action) {
        case 'add':
            runelog('**** wrk_wifiprofile ADD ****', $args->ssid);
            wrk_wifiprofile($redis, 'connect', $args);
            break;
        case 'edit':
            runelog('**** wrk_wifiprofile EDIT ****', $args->ssid);
            wrk_wifiprofile($redis, 'connect', $args);
            break;
        case 'delete':
            runelog('**** wrk_wifiprofile DELETE ****', $args->ssid);
            wrk_wifiprofile($redis, 'disconnect', $args);
            $redis->Del($args->ssid);
            $redis->Del('stored_profiles');
            sysCmd("rm /etc/netctl/".escapeshellarg($args->ssid));
            sysCmdAsync("systemctl restart netctl-auto@".$args->nic);
            $return = 1;
            break;
        case 'connect':
            runelog('**** wrk_wifiprofile CONNECT ****', $args->ssid);
            sysCmdAsync("netctl-auto switch-to ".escapeshellarg($args->ssid));
            $redis->Set('wlan_autoconnect', 1);
            $return = 1;
            break;
        case 'disconnect':
            runelog('**** wrk_wifiprofile DISCONNECT ****', $args->ssid);
            sysCmdAsync("netctl-auto disable ".escapeshellarg($args->ssid));
            $redis->Set('wlan_autoconnect', 0);
            $return = 1;
            break;
    }
    return $return;
}

function wrk_restore($backupfile)
{
    $path = "/run/".$backupfile;
    $cmdstring = "tar xzf ".$path." --overwrite --directory /";
    if (sysCmd($cmdstring)) {
        recursiveDelete($path);
    }
}

function wrk_jobID()
{
    $jobID = md5(uniqid(rand(), true));
    return $jobID;
}

function wrk_checkStrSysfile($sysfile, $searchstr)
{
    $file = stripcslashes(file_get_contents($sysfile));
    // debug
    runelog('wrk_checkStrSysfile('.$sysfile.','.$searchstr.')', $searchstr);
    if (strpos($file, $searchstr)) {
        return true;
    } else {
        return false;
    }
}

function wrk_checkMount($mpname)
{
    $check_mp = sysCmd('cat /proc/mounts | grep "/mnt/MPD/NAS/'.$mpname.'"');
    if (!empty($check_mp)) {
        return true;
    } else {
        return false;
    }
}

function wrk_cleanDistro($redis)
{
    runelog('function CLEAN DISTRO invoked!!!','');
    // remove mpd.db
    sysCmd('systemctl stop mpd');
    sysCmd('systemctl stop spopd');
    sleep(1);
    sysCmd('rm -f /var/lib/mpd/mpd.db');
    sysCmd('rm -f /var/lib/mpd/mpdstate');
    // reset /var/log/*
    sysCmd('rm -f /var/log/*');
    // reset /root/ logs
    sysCmd('rm -rf /root/.*');
    // reset /var/www/test
    sysCmd('rm -rf /var/www/test');
    // blank git user/email
    sysCmd("git config -f /var/www/.git/config user.name \"\"");
    sysCmd("git config -f /var/www/.git/config user.email \"\"");
    // reset libao config file
    sysCmd('cp /var/www/app/config/defaults/libao.conf /etc/libao.conf');
    // reset shairport starter script
    sysCmd('cp /var/www/app/config/defaults/shairport.service /usr/lib/systemd/system/shairport.service');
    // reset spop config file
    sysCmd('cp /var/www/app/config/defaults/spopd.conf /etc/spop/spopd.conf');
    // reset mpdscribble config file
    sysCmd('cp /var/www/app/config/defaults/mpdscribble.conf /etc/mpdscribble.conf');
    // reset wpa_supplicant config file
    sysCmd('cp /var/www/app/config/defaults/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf');
    // reset netctl profiles
    sysCmd('rm -f /etc/netctl/*');
    sysCmd('cp /var/www/app/config/defaults/eth0 /etc/netctl/eth0');
    // reset Redis datastore
    sysCmdAsync('/srv/http/db/redis_datastore_setup reset');
    // reset /var/log/runeaudio/*
    sysCmdAsync('rm -f /var/log/runeaudio/*');
    sysCmd('/var/www/command/rune_shutdown');
    // reset /mnt/MPD/NAS/*
    sysCmd('rm -rf /mnt/MPD/NAS/*');
    sysCmd('poweroff');
}

function wrk_audioOutput($redis, $action, $args = null)
{
    switch ($action) {
        case 'refresh':
            $redis->Del('acards');
            // $redis->Save();
            // $acards = sysCmd("cat /proc/asound/cards | grep : | cut -d '[' -f 2 | cut -d ']' -f 1");
            // $acards = sysCmd("cat /proc/asound/cards | grep : | cut -d '[' -f 2 | cut -d ':' -f 2");
            $acards = sysCmd("cat /proc/asound/cards | grep : | cut -b 1-3,21-");
            $i2smodule = $redis->Get('i2smodule');
            // check if i2smodule is enabled and read card details
            if ($i2smodule !== 'none') {
                $i2smodule_details = $redis->hGet('acards_details', $i2smodule);
            }
            runelog('/proc/asound/cards', $acards);
            foreach ($acards as $card) {
                unset($sub_interfaces);
                unset($data);
                $card_index = explode(' : ', $card);
                $card_index = trim($card_index[0]);
                // acards loop
                runelog('>>--------------------------- card: '.$card.' index: '.$card_index.' (start) --------------------------->>');
                $card = explode(' - ', $card);
                $card = trim($card[1]);
                // $description = sysCmd("cat /proc/asound/cards | grep : | cut -d ':' -f 2 | cut -d ' ' -f 4-20");
                // debug
                runelog('wrk_audioOutput card string: ', $card);
                $description = sysCmd("aplay -l -v | grep \"\[".$card."\]\"");
                $desc = array();
                $subdeviceid = explode(':', $description[0]);
                $subdeviceid = explode(',', trim($subdeviceid[1]));
                $subdeviceid = explode(' ', trim($subdeviceid[1]));
                $data['device'] = 'hw:'.$card_index.','.$subdeviceid[1];
                    if ($i2smodule !== 'none' && $i2smodule_details->sysname === $card) {
                        $acards_details = $i2smodule_details;
                    } else {
                        unset($acards_details);
                        $acards_details = $redis->hGet('acards_details', $card);
                    }
                if ($acards_details !== '') {
                    // debug
                    runelog('wrk_audioOutput: in loop: acards_details for: '.$card, $acards_details);
                    $details = new stdClass();
                    $details = json_decode($acards_details);
                    // debug
                    runelog('wrk_audioOutput: in loop: (decoded) acards_details for: '.$card, $details);
                    if (isset($details->mixer_control)) {
                        $volsteps = sysCmd("amixer -c ".$card_index." get \"".$details->mixer_control."\" | grep Limits | cut -d ':' -f 2 | cut -d ' ' -f 4,6");
                        $volsteps = explode(' ',$volsteps[0]);
                        if (isset($volsteps[0])) $data['volmin'] = $volsteps[0];
                        if (isset($volsteps[1])) $data['volmax'] = $volsteps[1];
                        // $data['mixer_device'] = "hw:".$details->mixer_numid;
                        $data['mixer_device'] = "hw:".$card_index;
                        $data['mixer_control'] = $details->mixer_control;
                    }
                    if (isset($details->sysname) && $details->sysname === $card) {
                        if ($details->type === 'integrated_sub') {
                            $sub_interfaces = $redis->sMembers($card);
                            // debug
                            runelog('line 1400: (sub_interfaces loop) card: '.$card, $sub_interfaces);
                            foreach ($sub_interfaces as $sub_interface) {
								runelog('line 1402: (sub_interfaces foreach) card: '.$card, $sub_interface);
                                $sub_int_details = new stdClass();
                                $sub_int_details = json_decode($sub_interface);
                                runelog('line 1405: (sub_interfaces foreach json_decode) card: '.$card, $sub_int_details);
                                $sub_int_details->device = $data['device'];
                                $sub_int_details->name = $card.'_'.$sub_int_details->id;
                                $sub_int_details->type = 'alsa';
                                $sub_int_details->integrated_sub = 1;
                                // prepare data for real_interface record
                                $data['name'] = $card;
                                $data['type'] = 'alsa';
                                $data['system'] = trim($description[0]);
                                // write real_interface json (use this to create the real MPD output)
                                $sub_int_details->real_interface = json_encode($data);
                                // replace index string in route command
                                if (isset($sub_int_details->route_cmd)) $sub_int_details->route_cmd = str_replace("*CARDID*", $card_index, $sub_int_details->route_cmd);
                                // debug
                                runelog('::::::sub interface record array:::::: ',$sub_int_details);
                                $redis->hSet('acards', $card.'_'.$sub_int_details->id, json_encode($sub_int_details));
                            }
                        }
                        // if ($details->extlabel !== 'none') $data['extlabel'] = $details->extlabel;
                        if (isset($details->extlabel) && $details->extlabel !== 'none') {
                            runelog('::::::acard extlabel:::::: ', $details->extlabel);
                            $data['extlabel'] = $details->extlabel;
                        }
                    }
                    // debug
                    if (isset($data['extlabel'])) runelog('wrk_audioOutput: in loop: extlabel for: '.$card, $data['extlabel']);
                    // test if there is an option for mpd.conf set
                    // for example ODROID C1 needs "card_option":"buffer_time\t\"0\""
                    if (isset($details->card_option)) {
                        $data['card_option'] = $details->card_option; 
                    }
                }
                if (!isset($sub_interfaces)) {
                $data['name'] = $card;
                $data['type'] = 'alsa';
                $data['system'] = trim($description[0]);
                // debug
                runelog('::::::acard record array::::::', $data);
                $redis->hSet('acards', $card, json_encode($data));
                }
                // acards loop
                runelog('<<--------------------------- card: '.$card.' index: '.$card_index.' (finish) ---------------------------<<');
            }
            // $redis->Save();
            break;
        case 'setdetails':
            $redis->hSet('acards_details', $args['card'], json_encode($args['details']));
            break;
    }
}

function wrk_i2smodule($redis, $args)
{
    if (wrk_mpdPlaybackStatus() === 'playing') {
        $mpd = openMpdSocket('/run/mpd.sock');
        sendMpdCommand($mpd, 'kill');
        closeMpdSocket($mpd);
    }
    switch ($args) {
        case 'none':
            sysCmd('rmmod snd_soc_iqaudio_dac').usleep(300000);
            sysCmd('rmmod snd_soc_hifiberry_digi').usleep(300000);
            sysCmd('rmmod snd_soc_hifiberry_dac').usleep(300000);
            sysCmd('rmmod snd_soc_hifiberry_dacplus').usleep(300000);
            sysCmd('rmmod snd_soc_wm8804').usleep(300000);
            sysCmd('rmmod snd_soc_pcm512x').usleep(300000);
            sysCmd('rmmod snd_soc_pcm5102a');
            break;
        case 'berrynos':
            sysCmd('modprobe bcm2708_dmaengine').usleep(300000);
            sysCmd('modprobe snd_soc_wm8804').usleep(300000);
            sysCmd('modprobe snd_soc_bcm2708_i2s').usleep(300000);
            sysCmd('modprobe snd_soc_pcm5102a').usleep(300000);
            sysCmd('modprobe snd_soc_hifiberry_dac');
            break;
        case 'berrynosmini':
            sysCmd('modprobe bcm2708_dmaengine').usleep(300000);
            sysCmd('modprobe snd_soc_wm8804').usleep(300000);
            sysCmd('modprobe snd_soc_bcm2708_i2s').usleep(300000);
            sysCmd('modprobe snd_soc_pcm5102a').usleep(300000);
            sysCmd('modprobe snd_soc_hifiberry_dac');
            break;
        case 'hifiberrydac':
            sysCmd('modprobe bcm2708_dmaengine').usleep(300000);
            sysCmd('modprobe snd_soc_wm8804').usleep(300000);
            sysCmd('modprobe snd_soc_bcm2708_i2s').usleep(300000);
            sysCmd('modprobe snd_soc_pcm5102a').usleep(300000);
            sysCmd('modprobe snd_soc_hifiberry_dac');
            break;
        case 'hifiberrydacplus':
            sysCmd('modprobe bcm2708_dmaengine').usleep(300000);
            sysCmd('modprobe snd_soc_wm8804').usleep(300000);
            sysCmd('modprobe snd_soc_bcm2708_i2s').usleep(300000);
            sysCmd('modprobe snd_soc_pcm512x').usleep(300000);
            sysCmd('modprobe snd_soc_hifiberry_dacplus');
            break;
        case 'hifiberrydigi':
            sysCmd('modprobe bcm2708_dmaengine').usleep(300000);
            sysCmd('modprobe snd_soc_wm8804').usleep(300000);
            sysCmd('modprobe snd_soc_bcm2708_i2s').usleep(300000);
            sysCmd('modprobe snd_soc_pcm5102a').usleep(300000);
            sysCmd('modprobe snd_soc_hifiberry_digi');
            break;
        case 'iqaudiopidac':
            sysCmd('modprobe bcm2708_dmaengine').usleep(300000);
            sysCmd('modprobe snd_soc_wm8804').usleep(300000);
            sysCmd('modprobe snd_soc_bcm2708_i2s').usleep(300000);
            sysCmd('modprobe snd_soc_pcm512x').usleep(300000);
            sysCmd('modprobe snd_soc_iqaudio_dac');
            break;
        case 'raspyplay3':
            sysCmd('modprobe bcm2708_dmaengine').usleep(300000);
            sysCmd('modprobe snd_soc_wm8804').usleep(300000);
            sysCmd('modprobe snd_soc_bcm2708_i2s').usleep(300000);
            sysCmd('modprobe snd_soc_pcm5102a').usleep(300000);
            sysCmd('modprobe snd_soc_hifiberry_dac');
            break;
        case 'raspyplay4':
            sysCmd('modprobe bcm2708_dmaengine').usleep(300000);
            sysCmd('modprobe snd_soc_wm8804').usleep(300000);
            sysCmd('modprobe snd_soc_bcm2708_i2s').usleep(300000);
            sysCmd('modprobe snd_soc_pcm512x').usleep(300000);
            sysCmd('modprobe snd_soc_iqaudio_dac');
            break;
    }
    $redis->set('i2smodule', $args);
    wrk_mpdconf($redis, 'refresh');
}

function wrk_kernelswitch($redis, $args)
{
    $redis->set('i2smodule', 'none');
    $file = '/boot/config.txt';
    $newArray = wrk_replaceTextLine($file, '', 'kernel=', 'kernel='.$args.'.img');
    // Commit changes to /boot/config.txt
    $fp = fopen($file, 'w');
    $return = fwrite($fp, implode("", $newArray));
    fclose($fp);
    $file = '/boot/config.txt';
    $newArray = wrk_replaceTextLine($file, '', 'cmdline=', 'cmdline=cmdline_'.$args.'.txt');
    // Commit changes to /boot/config.txt
    $fp = fopen($file, 'w');
    $return = fwrite($fp, implode("", $newArray));
    fclose($fp);

    if ($return) {
        $redis->set('kernel', $args);
        $redis->save();
    }
    return $return;
}

function wrk_mpdconf($redis, $action, $args = null, $jobID = null)
{
// check if we are in "advanced mode" (manual edit mode)
if ($action === 'reset') {
    $redis->set('mpdconf_advanced', 0);
    $mpdconf_advanced = 0;
} else {
    $mpdconf_advanced = $redis->get('mpdconf_advanced');
}
    // set mpd.conf file header
    $header = "###################################\n";
    $header .= "# Auto generated mpd.conf file\n";
    $header .= "# please DO NOT edit it manually!\n";
    $header .= "# Use RuneUI MPD config section\n";
    $header .= "###################################\n";
    $header .= "\n";
    switch ($action) {
        case 'reset':
            // default MPD config
            $redis->hSet('mpdconf', 'zeroconf_enabled', 'yes');
            $redis->hSet('mpdconf', 'zeroconf_name', 'runeaudio');
            $redis->hSet('mpdconf', 'log_level', 'none');
            $redis->hSet('mpdconf', 'bind_to_address', 'any');
            $redis->hSet('mpdconf', 'port', '6600');
            $redis->hSet('mpdconf', 'max_connections', '20');
            $redis->hSet('mpdconf', 'user', 'mpd');
            $redis->hSet('mpdconf', 'db_file', '/var/lib/mpd/mpd.db');
            $redis->hSet('mpdconf', 'sticker_file', '/var/lib/mpd/sticker.sql');
            $redis->hSet('mpdconf', 'pid_file', '/var/run/mpd/pid');
            $redis->hSet('mpdconf', 'music_directory', '/mnt/MPD');
            $redis->hSet('mpdconf', 'playlist_directory', '/var/lib/mpd/playlists');
            $redis->hSet('mpdconf', 'state_file', '/var/lib/mpd/mpdstate');
            $redis->hSet('mpdconf', 'follow_outside_symlinks', 'yes');
            $redis->hSet('mpdconf', 'follow_inside_symlinks', 'yes');
            $redis->hSet('mpdconf', 'auto_update', 'no');
            $redis->hSet('mpdconf', 'filesystem_charset', 'UTF-8');
            $redis->hSet('mpdconf', 'id3v1_encoding', 'UTF-8');
            $redis->hSet('mpdconf', 'volume_normalization', 'no');
            $redis->hSet('mpdconf', 'audio_buffer_size', '2048');
            $redis->hSet('mpdconf', 'buffer_before_play', '10%');
            $redis->hSet('mpdconf', 'gapless_mp3_playback', 'yes');
            $redis->hSet('mpdconf', 'mixer_type', 'software');
            $redis->hSet('mpdconf', 'curl', 'yes');
            $redis->hSet('mpdconf', 'ffmpeg', 'yes');
            $redis->hSet('mpdconf', 'log_file', '/var/log/runeaudio/mpd.log');
            wrk_mpdconf($redis, 'writecfg');
            break;
        case 'writecfg':
            $mpdcfg = $redis->hGetAll('mpdconf');
            $current_out = $redis->Get('ao');
            // if (!$redis->hExists('acards', $current_out)) {
            if (!$redis->hExists('acards', $current_out) && ($redis->Get('i2smodule') === 'none')) {
                $stored_acards = $redis->hKeys('acards');
                // debug
                runelog('force audio output', $stored_acards[0]);
                // force first output available if the current interface does not exists
                $redis->Set('ao', $stored_acards[0]);
                $redis->Save();
            }
            $output = null;
            // --- log settings ---
            if ($mpdcfg['log_level'] === 'none') {
                $redis->hDel('mpdconf', 'log_file');
            } else {
                $output .= "log_level\t\"".$mpdcfg['log_level']."\"\n";
                $output .= "log_file\t\"/var/log/runeaudio/mpd.log\"\n";
                $redis->hSet('mpdconf', 'log_file', '/var/log/runeaudio/mpd.log');
            }
            unset($mpdcfg['log_level']);
            unset($mpdcfg['log_file']);
            // --- state file ---
            if ($mpdcfg['state_file'] === 'no') {
                $redis->hDel('mpdconf', 'state_file');
            } else {
                $output .= "state_file\t\"/var/lib/mpd/mpdstate\"\n";
                $redis->hSet('mpdconf', 'state_file', '/var/lib/mpd/mpdstate');
            }
            unset($mpdcfg['state_file']);
            // --- general settings ---
            foreach ($mpdcfg as $param => $value) {
                if ($param === 'audio_output_interface' OR $param === 'dsd_usb') {
                    continue;
                }
                if ($param === 'mixer_type') {
                    if ($value === 'software' OR $value === 'hardware') {
                        $redis->set('volume', 1);
                        if ($value === 'hardware') {
                            $hwmixer = 1;
                            continue;
                        }
                    } else {
                        $redis->set('volume', 0);
                    }
                }                
                if ($param === 'user' && $value === 'mpd') {
                    $output .= $param." \t\"".$value."\"\n";
                    $output .= "group \t\"audio\"\n";
                    continue;
                }
                if ($param === 'user' && $value === 'root') {
                    $output .= $param." \t\"".$value."\"\n";
                    $output .= "group \t\"root\"\n";
                    continue;
                }
                if ($param === 'bind_to_address') {
                    $output .= "bind_to_address \"/run/mpd.sock\"\n";
                }
                if ($param === 'ffmpeg') {
                    // --- decoder plugin ---
                    $output .="\n";
                    $output .="decoder {\n";
                    $output .="\tplugin \t\"ffmpeg\"\n";
                    $output .="\tenabled \"".$value."\"\n";
                    $output .="}\n";
                    continue;
                }
                if ($param === 'curl') {
                    // --- input plugin ---
                    $output .="\n";
                    $output .="input {\n";
                    $output .="\tplugin \t\"curl\"\n";
                        if ($redis->hget('proxy','enable') === '1') {
                            $output .="\tproxy \t\"".($redis->hget('proxy', 'host'))."\"\n";
                            if ($redis->hget('proxy','user') !== '') {
                                $output .="\tproxy_user \t\"".($redis->hget('proxy', 'user'))."\"\n";
                                $output .="\tproxy_password \t\"".($redis->hget('proxy', 'pass'))."\"\n";
                            }
                        }
                    $output .="}\n";
                continue;
                }
                $output .= $param." \t\"".$value."\"\n";
            }
            $output = $header.$output;
            // --- audio output ---
            $acards = $redis->hGetAll('acards');
            // debug
            runelog('detected ACARDS ', $acards, __FUNCTION__);
            $ao = $redis->Get('ao');
            $sub_count = 0;
            foreach ($acards as $main_acard_name => $main_acard_details) {
                $card_decoded = new stdClass();
                $card_decoded = json_decode($main_acard_details);
                // debug
                runelog('decoded ACARD '.$card_decoded->name, $card_decoded, __FUNCTION__);
                // handle sub-interfaces
                if (isset($card_decoded->integrated_sub) && $card_decoded->integrated_sub === 1) {
                    // record UI audio output name
                    $current_card = $card_decoded->name;
                    // if ($sub_count >= 1) continue;
                    // $card_decoded = json_decode($card_decoded->real_interface);
                    runelog('current AO ---->  ', $ao, __FUNCTION__);
                    // var_dump($ao);
                    runelog('current card_name ---->  ', $card_decoded->name, __FUNCTION__);
                    // var_dump($card_decoded->name);
                    // var_dump(strpos($ao, $card_decoded->name));
                    if (strpos($ao,$card_decoded->name) === true OR strpos($ao, $card_decoded->name) === 0) $sub_interface_selected = 1;
                    // debug
                    if (isset($sub_interface_selected)) runelog('sub_card_selected ? >>>> '.$sub_interface_selected);
                    // debug
                    runelog('this is a sub_interface', __FUNCTION__);
                    $sub_interface = 1;
                    // debug
                    $sub_count++;
                    runelog('sub_count', $sub_count, __FUNCTION__);
                }
                $output .="\n";
                $output .="audio_output {\n";
                // $output .="name \t\t\"".$card_decoded->name."\"\n";
                if (isset($sub_interface)) {
                    $output .="\tname \t\t\"".$card_decoded->name."\"\n";
                } else {
                    $output .="\tname \t\t\"".$main_acard_name."\"\n";
                }
                $output .="\ttype \t\t\"".$card_decoded->type."\"\n";
                $output .="\tdevice \t\t\"".$card_decoded->device."\"\n";
                if (isset($hwmixer)) {
                     if (isset($card_decoded->mixer_control)) {
                        $output .="\tmixer_control \t\"".$card_decoded->mixer_control."\"\n";
                        $output .="\tmixer_type \t\"hardware\"\n";
                        $output .="\tmixer_device \t\"".substr($card_decoded->device, 0, 4)."\"\n";
                    } else {
                        if (!isset($sub_interface)) {
                            $output .="\tmixer_control \t\"".alsa_findHwMixerControl(substr($card_decoded->device, 5, 1))."\"\n";
                        }
                    }
                    // $output .="\tmixer_index \t\"0\"\n";"\t\t  \t\"0\"\n";
                }
                // test if there is an option for mpd.conf set
                // for example ODROID C1 needs "card_option":"buffer_time\t\"0\""
                if (isset($card_decoded->card_option)) {
                    $output .= "\t".$card_decoded->card_option."\n";
                }                
                if ($mpdcfg['dsd_usb'] === 'yes') $output .="\tdsd_usb \t\"yes\"\n";
                $output .="\tauto_resample \t\"no\"\n";
                $output .="\tauto_format \t\"no\"\n";
                if ($ao === $main_acard_name) $output .="\tenabled \t\"yes\"\n";
                $output .="}\n";
                unset($sub_interface);
            // debug
            // runelog('conf output (in loop)', $output, __FUNCTION__);
            }
            $output .="\n";
            // debug
            // runelog('raw mpd.conf', $output, __FUNCTION__);
            // check if mpd.conf was modified outside RuneUI (advanced mode)
            runelog('mpd.conf advanced state', $mpdconf_advanced);
            if ($mpdconf_advanced !== '1' OR $mpdconf_advanced === '') {
                if ($mpdconf_advanced !== '') {
                    runelog('mpd.conf advanced mode OFF');
                } else {
                    runelog('mpd.conf advanced mode RESET STATE');
                }
                // write mpd.conf file
                $fh = fopen('/etc/mpd.conf', 'w');
                fwrite($fh, $output);
                fclose($fh);
                // update hash
                $redis->set('mpdconfhash', md5_file('/etc/mpd.conf'));
            } else {
                runelog('mpd.conf advanced mode ON');
            }
            break;
        case 'update':
            foreach ($args as $param => $value) {
                $redis->hSet('mpdconf', $param, $value);
            }
            wrk_mpdconf($redis, 'writecfg');
            break;
        case 'switchao':
            // record current interface selection
            $redis->set('ao', $args);
            $mpdout = $args;
            // get interface details
            $interface_details = $redis->hGet('acards', $args);
            $interface_details = json_decode($interface_details);
            // check for "special" sub_interfaces
            if (isset($interface_details->integrated_sub)) {
                // execute special internal route command
                sysCmd($interface_details->route_cmd);
                // TODO: improove this function
                sysCmd('amixer -c 0 set PCM unmute');
                // $mpdout = $interface_details->sysname;
            }
        	wrk_mpdconf($redis, 'writecfg');
            wrk_shairport($redis, $args);
            // toggle playback state
            if (wrk_mpdPlaybackStatus() === 'playing') {
                syscmd('mpc toggle');
                $recover_state = 1;
                // debug
                runelog('switchao (set recover state):', $recover_state);
            }
            // switch interface
            // debug
            runelog('switchao (switch AO):', $mpdout);
            syscmd('mpc enable only "'.$mpdout.'"');
            // restore playback state
            if (isset($recover_state)) {
                // debug
                runelog('switchao (RECOVER STATE!)');
                syscmd('mpc toggle');
            }
            // set notify label
            if (isset($interface_details->extlabel)) { $interface_label = $interface_details->extlabel; } else { $interface_label = $args; }
            // notify UI
            ui_notify_async('Audio output switched', "Current active output:\n".$interface_label, $jobID);
            break;
        case 'refresh':
            wrk_audioOutput($redis, 'refresh');
            wrk_mpdconf($redis, 'writecfg');
            wrk_mpdconf($redis, 'restart');
            break;
        case 'start':
            $activePlayer = $redis->get('activePlayer');
            if ($activePlayer === 'MPD') {
                sysCmd('systemctl start mpd');
                if ($redis->get('mpd_playback_status') === 'playing') {
                    syscmd('mpc play');
                }
                // restart mpdscribble
                if ($redis->hGet('lastfm', 'enable') === '1') {
                    sysCmd('systemctl restart mpdscribble');
                }
                // restart upmpdcli
                if ($redis->hGet('dlna', 'enable') === '1') {
                    sysCmd('systemctl restart upmpdcli');
                }
                // set process priority
                sysCmdAsync('sleep 1 && rune_prio nice');
            }
            break;
        case 'stop':
            $redis->set('mpd_playback_status', wrk_mpdPlaybackStatus());
            $mpd = openMpdSocket('/run/mpd.sock');
            sendMpdCommand($mpd, 'kill');
            closeMpdSocket($mpd);
            sleep(1);
            sysCmd('systemctl stop mpd');
            break;
        case 'restart':
            wrk_mpdconf($redis, 'stop');
            sleep(1);
            wrk_mpdconf($redis, 'start');
            break;
    }
}

function wrk_mpdPlaybackStatus($redis = null, $action = null)
{
    if (isset($action)) {
        switch ($action) {
            case 'record':
                return $redis->set('mpd_playback_laststate', wrk_mpdPlaybackStatus());
                break;
            case 'laststate':
                $mpdlaststate = $redis->get('mpd_playback_laststate');
                $redis->set('mpd_playback_laststate', '');
                return $mpdlaststate;
                break;
        }
    } else {
        $status = sysCmd("mpc status | grep '\[' | cut -d '[' -f 2 | cut -d ']' -f 1");
        // debug
        if (!empty($status[0])) {
            runelog('wrk_mpdPlaybackStatus (current state):', $status[0]);
            return $status[0];
        } else {
            return false;
        }
    }
}

function wrk_shairport($redis, $ao, $name = null)
{
    if (!isset($name)) {
        $name = $redis->hGet('airplay', 'name');
    }
    $acard = json_decode($redis->hget('acards', $ao));
    runelog('acard details: ', $acard);
    $file = '/usr/lib/systemd/system/shairport.service';
    $newArray = wrk_replaceTextLine($file, '', 'ExecStart=', 'ExecStart=/usr/bin/shairport -w --name='.$name.' --on-start=$ON --on-stop=$OFF --meta-dir=/var/run/shairport -o alsa -- -d '.$acard->device);
    runelog('shairport.service :', $newArray);
    // Commit changes to /usr/lib/systemd/system/shairport.service
    $fp = fopen($file, 'w');
    fwrite($fp, implode("", $newArray));
    fclose($fp);
    // update libao.conf
    $file = '/etc/libao.conf';
    $newArray = wrk_replaceTextLine($file, '', 'dev=', 'dev='.$acard->device);
    // Commit changes to /etc/libao.conf
    $fp = fopen($file, 'w');
    fwrite($fp, implode("", $newArray));
    fclose($fp);
    if ($redis->get('activePlayer') === 'Spotify') {
        runelog('restart spopd');
        sysCmd('systemctl restart spopd');
    }
    // update systemd
    sysCmd('systemctl daemon-reload');
    if ($redis->hGet('airplay','enable') === '1') {
        runelog('restart shairport');
        sysCmd('systemctl restart shairport');
    }
    // set process priority
    sysCmdAsync('sleep 1 && rune_prio nice');
}

function wrk_sourcemount($redis, $action, $id = null)
{
    switch ($action) {
        case 'mount':
            $mp = $redis->hGetAll('mount_'.$id);
            $mpdproc = getMpdDaemonDetalis();
            sysCmd("mkdir \"/mnt/MPD/NAS/".$mp['name']."\"");
            if ($mp['type'] === 'cifs' OR $mp['type'] === 'osx') {
            // smb/cifs mount
            $auth = 'guest';
                if (!empty($mp['username'])) {
                    $auth = "username=".$mp['username'].",password=".$mp['password'];
                }
                if ($mp['type'] === 'cifs') {
                    $mountstr = "mount -t cifs \"//".$mp['address']."/".$mp['remotedir']."\" -o ".$auth.",sec=ntlm,soft,uid=".$mpdproc['uid'].",gid=".$mpdproc['gid'].",rsize=".$mp['rsize'].",wsize=".$mp['wsize'].",iocharset=".$mp['charset'].",".$mp['options']." \"/mnt/MPD/NAS/".$mp['name']."\"";
                } else {
                    $mountstr = "mount -t cifs \"//".$mp['address']."/".$mp['remotedir']."\" -o ".$auth.",nounix,sec=ntlmssp,soft,uid=".$mpdproc['uid'].",gid=".$mpdproc['gid'].",rsize=".$mp['rsize'].",wsize=".$mp['wsize'].",iocharset=".$mp['charset'].",".$mp['options']." \"/mnt/MPD/NAS/".$mp['name']."\"";
                }
            } elseif ($mp['type'] === 'nfs') {
                // nfs mount
                $mountstr = "mount -t nfs -o soft,retry=0,actimeo=1,retrans=2,timeo=50,nofsc,noatime,rsize=".$mp['rsize'].",wsize=".$mp['wsize'].",".$mp['options']." \"".$mp['address'].":/".$mp['remotedir']."\" \"/mnt/MPD/NAS/".$mp['name']."\"";
                // $mountstr = "mount -t nfs -o soft,retry=1,noatime,rsize=".$mp['rsize'].",wsize=".$mp['wsize'].",".$mp['options']." \"".$mp['address'].":/".$mp['remotedir']."\" \"/mnt/MPD/NAS/".$mp['name']."\"";
            }
            // debug
            runelog('mount string', $mountstr);
            $sysoutput = sysCmd($mountstr);
            // -- REWORK NEEDED --
            runelog('system response',var_dump($sysoutput));
            if (empty($sysoutput)) {
                if (!empty($mp['error'])) {
                $mp['error'] = '';
                $redis->hMSet('mount_'.$id, $mp);
                }
                $return = 1;
            } else {
                if(!empty($mp['name'])) sysCmd("rmdir \"/mnt/MPD/NAS/".$mp['name']."\"");
                $mp['error'] = implode("\n", $sysoutput);
                $redis->hMSet('mount_'.$id, $mp);
                $return = 0;
            }
            break;
        case 'mountall':
            $test = 1;
            $mounts = $redis->keys('mount_*');
            foreach ($mounts as $key) {
                $mp = $redis->hGetAll($key);
                if (!wrk_checkMount($mp['name'])) {
                    if (wrk_sourcemount($redis, 'mount', $mp['id']) === 0) {
                        $test = 0;
                    }
                }
            }
            $return = $test;
            break;
    }
    return $return;
}

function wrk_sourcecfg($redis, $action, $args)
{
    runelog('function wrk_sourcecfg('.$action.')', $args);
    switch ($action) {
        case 'add':
            // unset($args->id);
            $args->id = $redis->incr('mountidx');
            $args = (array) $args;
            $redis->hMset('mount_'.$args['id'], $args);
            $return = wrk_sourcemount($redis, 'mount', $args['id']);
            break;
        case 'edit':
            $mp = $redis->hGetAll('mount_'.$args->id);
            $args = (array) $args;
            $redis->hMset('mount_'.$args['id'], $args);
            sysCmd('mpc stop');
            usleep(500000);
            sysCmd("umount -f \"/mnt/MPD/NAS/".$mp['name']."\"");
                if ($mp['name'] != $args['name']) {
                sysCmd("rmdir \"/mnt/MPD/NAS/".$mp['name']."\"");
                sysCmd("mkdir \"/mnt/MPD/NAS/".$args['name']."\"");
                }
            $return = wrk_sourcemount($redis, 'mount', $args['id']);
            runelog('wrk_sourcecfg(edit) exit status', $return);
            break;
        case 'delete':
            $mp = $redis->hGetAll('mount_'.$args->id);
            sysCmd('mpc stop');
            usleep(500000);
            sysCmd("umount -f \"/mnt/MPD/NAS/".$mp['name']."\"");
            sleep(3);
            if (!empty($mp['name'])) sysCmd("rmdir \"/mnt/MPD/NAS/".$mp['name']."\"");
            $return = $redis->del('mount_'.$args->id);
            break;
        case 'reset':
            $source = $redis->keys('mount_*');
            sysCmd('systemctl stop mpd');
            usleep(500000);
                foreach ($source as $key) {
                    $mp = $redis->hGetAll($key);
                    runelog('wrk_sourcecfg() internal loop $mp[name]',$mp['name']);
                    sysCmd("umount -f \"/mnt/MPD/NAS/".$mp['name']."\"");
                    sysCmd("rmdir \"/mnt/MPD/NAS/".$mp['name']."\"");
                    $return = $redis->del($key);
                }
            // reset mount index
            if ($return) $redis->del('mountidx');
            sysCmd('systemctl start mpd');
            // set process priority
            sysCmdAsync('sleep 1 && rune_prio nice');
            break;
        case 'mountall':
            $return = wrk_sourcemount($redis, 'mountall');
            break;
        case 'umountusb':
            $return = sysCmd('udevil umount '.$args);
            break;
    }
    return $return;
}

function wrk_getHwPlatform()
{
    $file = '/proc/cpuinfo';
    $fileData = file($file);
    foreach($fileData as $line) {
        if (substr($line, 0, 8) == 'Hardware') {
            $arch = trim(substr($line, 11, 50));
            // debug
            runelog('wrk_getHwPlatform() /proc/cpu string', $arch);
            switch($arch) {
                // RaspberryPi
                case 'BCM2708':
                    $arch = '01';
                    break;
                // UDOO
                case 'SECO i.Mx6 UDOO Board':
                    $arch = '02';
                    break;
                // CuBox
                case 'Marvell Dove (Flattened Device Tree)':
                case 'SolidRun CuBox':
                    $arch = '03';
                    break;
                // BeagleBone Black
                case 'Generic AM33XX (Flattened Device Tree)':
                    $arch = '04';
                    break;
                // Utilite Standard
                case 'Compulab CM-FX6':
                    $arch = '05';
                    break;
                // Cubietruck
                case 'sun7i':
                    $arch = '06';
                    break;
                // Cubox-i
                case 'Freescale i.MX6 Quad/DualLite (Device Tree)':
                    $arch = '07';
                    break;
                // RaspberryPi
                case 'BCM2709':
                    $arch = '08';
                    break;
                // ODROID C1
                case 'ODROIDC':
                    $arch = '09';
                    break;                    
                default:
                    $arch = '--';
                    break;
            }
        }
    }
    if (!isset($arch)) {
        $arch = '--';
    }
    return $arch;
}

function wrk_setHwPlatform($redis)
{
    $arch = wrk_getHwPlatform();
    runelog('arch= ', $arch);
    $playerid = wrk_playerID($arch);
    $redis->set('playerid', $playerid);
    runelog('playerid= ', $playerid);
    // register platform into database
    switch($arch) {
        case '01':
            $redis->set('hwplatform', 'RaspberryPi');
            $redis->set('hwplatformid', $arch);
            break;
        case '02':
            $redis->set('hwplatform', 'UDOO');
            $redis->set('hwplatformid',$arch);
            break;
        case '03':
            $redis->set('hwplatform', 'CuBox');
            $redis->set('hwplatformid',$arch);
            break;
        case '04':
            $redis->set('hwplatform', 'BeagleBone Black');
            $redis->set('hwplatformid', $arch);
            break;
        case '05':
            $redis->set('hwplatform', 'Utilite Standard');
            $redis->set('hwplatformid', $arch);
            break;
        case '06':
            $redis->set('hwplatform', 'Cubietruck');
            $redis->set('hwplatformid', $arch);
            break;
        case '08':
            $redis->set('hwplatform', 'RaspberryPi2');
            $redis->set('hwplatformid', $arch);
            break;
        case '09':
            $redis->set('hwplatform', 'ODROID-C1');
            $redis->set('hwplatformid', $arch);
            break;
        default:
            $redis->set('hwplatform', 'unknown');
            $redis->set('hwplatformid', $arch);
    }
}

// this can be removed in next version, because it's replaced by wrk_startAirplay($redis) and wrk_stopAirplay($redis)
function wrk_togglePlayback($redis, $activePlayer)
{
$stoppedPlayer = $redis->get('stoppedPlayer');
// debug
runelog('stoppedPlayer = ', $stoppedPlayer);
runelog('activePlayer = ', $activePlayer);
    if ($stoppedPlayer !== '') {
        if ($stoppedPlayer === 'MPD') {
            // connect to MPD daemon
            $sock = openMpdSocket('/run/mpd.sock', 0);
            $status = _parseStatusResponse(MpdStatus($sock));
            runelog('MPD status', $status);
            if ($status['state'] === 'pause') {
                $redis->set('stoppedPlayer', '');
            } 
            sendMpdCommand($sock, 'pause');
            closeMpdSocket($sock);
            // debug
            runelog('sendMpdCommand', 'pause');
        } elseif ($stoppedPlayer === 'Spotify') {
            // connect to SPOPD daemon
            $sock = openSpopSocket('localhost', 6602, 1);
            $status = _parseSpopStatusResponse(SpopStatus($sock));
            runelog('SPOP status', $status);
            if ($status['state'] === 'pause') {
                $redis->set('stoppedPlayer', '');
            }
            sendSpopCommand($sock, 'toggle');
            closeSpopSocket($sock);
            // debug
            runelog('sendSpopCommand', 'toggle');
        }
        $redis->set('activePlayer', $stoppedPlayer);        
    } else {
        $redis->set('stoppedPlayer', $activePlayer);
        wrk_togglePlayback($redis, $activePlayer);
    }
runelog('endFunction!!!', $stoppedPlayer);
}

function wrk_startAirplay($redis)
{
    $activePlayer = $redis->get('activePlayer');
    if ($activePlayer != 'Airplay') {
        $redis->set('stoppedPlayer', $activePlayer);
        if ($activePlayer === 'MPD') {
            // connect to MPD daemon
            $sock = openMpdSocket('/run/mpd.sock', 0);
            $status = _parseStatusResponse(MpdStatus($sock));
            runelog('MPD status', $status);
            // to get MPD out of its idle-loop we discribe to a channel
            sendMpdCommand($sock, 'subscribe Airplay');
            sendMpdCommand($sock, 'unsubscribe Airplay');
            if ($status['state'] === 'play') {
                // pause playback
                sendMpdCommand($sock, 'pause');
                // debug
                runelog('sendMpdCommand', 'pause');
            }
            closeMpdSocket($sock);
        } elseif ($activePlayer === 'Spotify') {
            // connect to SPOPD daemon
            $sock = openSpopSocket('localhost', 6602, 1);
            // to get SPOP out of its idle-loop
            sendSpopCommand($sock, 'notify');
            sleep(1);
            $status = _parseSpopStatusResponse(SpopStatus($sock));
            runelog('SPOP status', $status);
            if ($status['state'] === 'play') {
                sendSpopCommand($sock, 'toggle');
                // debug
                runelog('sendSpopCommand', 'toggle');
            }
            closeSpopSocket($sock);
        }
        $redis->set('activePlayer', 'Airplay');
        ui_render('playback', "{\"currentartist\":\"<unknown>\",\"currentsong\":\"Airplay\",\"currentalbum\":\"<unknown>\",\"artwork\":\"\",\"genre\":\"\",\"comment\":\"\"}");
        sysCmd('curl -s -X GET http://localhost/command/?cmd=renderui');
    }
}

function wrk_stopAirplay($redis)
{
    $activePlayer = $redis->get('activePlayer');
    if ($activePlayer == 'Airplay') {

        $stoppedPlayer = $redis->get('stoppedPlayer');
        runelog('stoppedPlayer = ', $stoppedPlayer);

        if ($stoppedPlayer !== '') {
            // we previously stopped playback of one player to use the Airport Stream
            if ($stoppedPlayer === 'MPD') {
                // connect to MPD daemon
                $sock = openMpdSocket('/run/mpd.sock', 0);
                $status = _parseStatusResponse(MpdStatus($sock));
                runelog('MPD status', $status);
                if ($status['state'] === 'pause') {
                    // clear the stopped player if we left MPD paused
                    $redis->set('stoppedPlayer', '');
                }
                //sendMpdCommand($sock, 'pause');
                // to get MPD out of its idle-loop we discribe to a channel
                sendMpdCommand($sock, 'subscribe Airplay');
                sendMpdCommand($sock, 'unsubscribe Airplay');
                closeMpdSocket($sock);
                // debug
                //runelog('sendMpdCommand', 'pause');
            } elseif ($stoppedPlayer === 'Spotify') {
                // connect to SPOPD daemon
                $sock = openSpopSocket('localhost', 6602, 1);
                $status = _parseSpopStatusResponse(SpopStatus($sock));
                runelog('SPOP status', $status);
                if ($status['state'] === 'pause') {
                    // clear the stopped player if we left SPOP paused
                    $redis->set('stoppedPlayer', '');
                }
                // to get SPOP out of its idle-loop
                sendSpopCommand($sock, 'notify');
                //sendSpopCommand($sock, 'toggle');
                closeSpopSocket($sock);
                // debug
                //runelog('sendSpopCommand', 'toggle');
            }
            // set the active player back to the one we stopped
            $redis->set('activePlayer', $stoppedPlayer);

            //delete all files in shairport folder except "now_playing"
            $dir = '/var/run/shairport/';
            $leave_files = array('now_playing');
            foreach( glob("$dir/*") as $file ) {
            if( !in_array(basename($file), $leave_files) )
                unlink($file);
            }
        }
        runelog('endFunction!!!', $stoppedPlayer);
        sysCmd('curl -s -X GET http://localhost/command/?cmd=renderui');
    }
}

function wrk_playerID($arch)
{
    // $playerid = $arch.md5(uniqid(rand(), true)).md5(uniqid(rand(), true));
    $playerid = $arch.md5_file('/sys/class/net/eth0/address');
    return $playerid;
}

function wrk_switchplayer($redis, $playerengine)
{
    switch ($playerengine) {
        case 'MPD':
            $return = sysCmd('systemctl start mpd');
            usleep(500000);
            if ($redis->hGet('lastfm','enable') === '1') sysCmd('systemctl start mpdscribble');
            if ($redis->hGet('dlna','enable') === '1') sysCmd('systemctl start upmpdcli');
            $redis->set('activePlayer', 'MPD');
            $return = sysCmd('systemctl stop spopd');
            $return = sysCmd('curl -s -X GET http://localhost/command/?cmd=renderui');
            // set process priority
            sysCmdAsync('rune_prio nice');
            break;
        
        case 'Spotify':
            $return = sysCmd('systemctl start spopd');
            usleep(500000);
            if ($redis->hGet('lastfm','enable') === '1') sysCmd('systemctl stop mpdscribble');
            if ($redis->hGet('dlna','enable') === '1') sysCmd('systemctl stop upmpdcli');
            $redis->set('activePlayer', 'Spotify');
            $return = sysCmd('systemctl stop mpd');
            $redis->set('mpd_playback_status', 'stop');
            $return = sysCmd('curl -s -X GET http://localhost/command/?cmd=renderui');
            // set process priority
            sysCmdAsync('rune_prio nice');
            break;
    }
    return $return;
}

function wrk_sysAcl()
{
    sysCmd('chown -R http.http /srv/http/');
    sysCmd('chmod 777 /run');
    sysCmd('chmod 644 $(find /srv/http/ -type f)');
    sysCmd('chmod 755 $(find /srv/http/ -type d)');
    sysCmd('chmod 755 /srv/http/command/*');
    sysCmd('chmod 755 /srv/http/db/redis_datastore_setup');
    sysCmd('chmod 755 /srv/http/db/redis_acards_details');
    sysCmd('chown -R mpd.audio /var/lib/mpd');
}

function wrk_NTPsync($ntpserver)
{
    //debug
    runelog('NTP SERVER', $ntpserver);
    // if (sysCmd('ntpdate '.$ntpserver)) {
    if (sysCmdAsync('ntpdate '.$ntpserver)) {
        return $ntpserver;
    } else {
        return false;
    }
}

function wrk_changeHostname($redis, $newhostname)
{
    $hn = sysCmd('hostname');
    runelog('current hostname', $hn[0]);
    // change system hostname
    sysCmd('hostnamectl set-hostname '.$newhostname);
    // restart avahi-daemon
    sysCmd('systemctl restart avahi-daemon');
    // reconfigure MPD
    sysCmd('systemctl stop mpd');
    // update zeroconfname in MPD configuration
    $redis->hMset('mpdconf','zeroconf_name', $newhostname);
    // update airplayname
    if ($redis->hGet('airplay','name') === $hn[0]) {
        $redis->hSet('airplay','name', $newhostname);
        if ($redis->hGet('airplay','enable') === '1') sysCmd('systemctl restart shairport');
    }
    // update AVAHI serice data
    wrk_avahiconfig($newhostname);
    // rewrite mpd.conf file
    wrk_mpdconf('/etc', $redis);
    // restart MPD
    sysCmd('systemctl start mpd');
    // restart SAMBA << TODO: use systemd!!!
    sysCmd('killall -HUP smbd && killall -HUP nmbd');
    // TODO: restart MiniDLNA
    // set process priority
    sysCmdAsync('sleep 1 && rune_prio nice');
}

function wrk_upmpdcli($redis, $name = null)
{
    if (!isset($name)) {
        $name = $redis->hGet('dlna', 'name');
    }
    $file = '/usr/lib/systemd/system/upmpdcli.service';
    $newArray = wrk_replaceTextLine($file, '', 'ExecStart', 'ExecStart=/usr/bin/upmpdcli -d '.$redis->hGet('dlna', 'logfile').' -l '.$redis->hGet('dlna', 'loglevel').' -f '.$name);
    runelog('upmpdcli.service :', $newArray);
    // Commit changes to /usr/lib/systemd/system/upmpdcli.service
    $fp = fopen($file, 'w');
    fwrite($fp, implode("", $newArray));
    fclose($fp);
    // update systemd
    sysCmd('systemctl daemon-reload');
    if ($redis->hGet('dlna','enable') === '1') {
        runelog('restart upmpdcli');
        sysCmd('systemctl restart upmpdcli');
    }
    // set process priority
    sysCmdAsync('sleep 1 && rune_prio nice');
}

function alsa_findHwMixerControl($cardID)
{
    $cmd = "amixer -c ".$cardID." |grep \"mixer control\"";
    $str = sysCmd($cmd);
    $hwmixerdev = substr(substr($str[0], 0, -(strlen($str[0]) - strrpos($str[0], "'"))), strpos($str[0], "'")+1);
    runelog('Try to find HwMixer control (str): ', $str);
    runelog('Try to find HwMixer control: (output)', $hwmixerdev);
    return $hwmixerdev;
}

// webradio management (via .pls files)
function addRadio($mpd, $redis, $data)
{
    if ($data->label !== '' && $data->url !== '') {
        //debug
        runelog('addRadio (data)', $data);
        // store webradio record in redis
        $redis->hSet('webradios', $data->label, $data->url);
        // create new file
        // $file = '/mnt/MPD/Webradio/'.$data['label'].'.pls';
        $file = '/mnt/MPD/Webradio/'.$data->label.'.pls';
        $newpls = "[playlist]\n";
        $newpls .= "NumberOfEntries=1\n";
        $newpls .= "File1=".$data->url."\n";
        $newpls .= "Title1=".$data->label;
        // Commit changes to .pls file
        $fp = fopen($file, 'w');
        $return = fwrite($fp, $newpls);
        fclose($fp);
        if ($return) sendMpdCommand($mpd, 'update Webradio');
    } else {
        $return = false;
    }
    return $return;
}

function editRadio($mpd,$redis,$data)
{
    if ($data->label !== '' && $data->url !== '') {
        //debug
        runelog('editRadio (data)', $data);
        // edit webradio URL in .pls file
        $file = '/mnt/MPD/Webradio/'.$data->label.'.pls';
        if ($data->label !== $data->newlabel) {
            unlink($file);
            // delete old webradio record in redis
            $redis->hDel('webradios', $data->label);
            // store new webradio record in redis
            $data->label = $data->newlabel;
            $data->newlabel = null;
            $return = addRadio($mpd, $redis, $data);
        } else {
            $redis->hSet('webradios',$data->label,$data->url);
            $newArray = wrk_replaceTextLine($file, '', 'File1=', 'File1='.$data->url, 'NumberOfEntries=1',1);
            // Commit changes to .pls file
            $fp = fopen($file, 'w');
            $return = fwrite($fp, implode("", $newArray));
            fclose($fp);
        }
        if ($return) sendMpdCommand($mpd, 'update Webradio');
    } else {
        $return = false;
    }
    return $return;
}

function deleteRadio($mpd,$redis,$data)
{
    if ($data->label !== '') {
        //debug
        runelog('deleteRadio (data)', $data);
        // delete .pls file
        $file = '/mnt/MPD/Webradio/'.$data->label;
        $label = parseFileStr($data->label, '.', 1);
        runelog('deleteRadio (label)', $label);
        $return = unlink($file);
        if ($return) {
            // delete webradio record in redis
            $redis->hDel('webradios', $label);
            sendMpdCommand($mpd, 'update Webradio');
        }
    } else {
        $return = false;
    }
    return $return;
}

function ui_notify($title = null, $text, $type = null, $permanotice = null)
{
    if (is_object($permanotice)) {
        $output = array('title' => $title, 'permanotice' => '', 'permaremove' => '');
    } else {
        if ($permanotice === 1) {
            $output = array('title' => $title, 'text' => $text, 'permanotice' => '');
        } else {
            $output = array('title' => $title, 'text' => $text);
        }
    }
    ui_render('notify', json_encode($output));
}

function ui_notify_async($title = null, $text, $type = null, $permanotice = null)
{
    if (is_object($permanotice)) {
        $output = array('title' => $title, 'permanotice' => '', 'permaremove' => '');
    } else {
        if ($permanotice === 1) {
            $output = array('title' => $title, 'text' => $text, 'permanotice' => '');
        } else {
            $output = array('title' => $title, 'text' => $text);
        }
    }
    $output = json_encode($output);
    runelog('notify (async) JSON string: ', $output);
    sysCmdAsync('/var/www/command/ui_notify.php \''.$output);
}

function wrk_notify($redis, $action, $notification, $jobID = null)
{
    switch ($action) {
        case 'raw':
            // debug
            runelog('wrk_notify (raw)', $notification);
            break;
        case 'startjob':
            if (!empty($notification)) {
                if (is_object($notification)) {
                    $notification = json_encode(array('title' => $notification->title, 'text' => $notification->text, 'icon' => 'fa fa-cog fa-spin', 'permanotice' => $jobID));
                    // debug
                    runelog('wrk_notify (startjob) jobID='.$jobID, $notification);
                }
                if (wrk_notify_check($notification)) {
                    if (empty($redis->hGet('notifications', $jobID)) && empty($redis->hGet('notifications', 'permanotice_'.$jobID))) {
                        $redis->hSet('notifications', $jobID, $notification);
                    }
                }
            }
            break;
        case 'endjob':
            $notification = $redis->hGet('notifications', $jobID);
            if (!empty($notification)) {
                $notification = json_decode($notification);
                $notification = json_encode(array('title' => $notification->title, 'text' => '', 'permanotice' => $jobID, 'permaremove' => $jobID));
                // debug
                runelog('wrk_notify (endjob) jobID='.$jobID, $notification);
                $redis->hDel('notifications', $jobID);
            }
            break;
        case 'kernelswitch':
            // debug
            runelog('wrk_notify (kernelswitch) jobID='.$jobID, $notification);
            if (!empty($notification)) {
                $notification = json_encode(array('title' => $notification->title, 'text' => $notification->text, 'custom' => 'kernelswitch'));
                if (wrk_notify_check($notification)) {
                    // if (empty($redis->hGet('notifications', $jobID)) && empty($redis->hGet('notifications', 'permanotice_'.$jobID))) {
                        $redis->hSet('notifications', 'permanotice_kernelswitch', $notification);
                    // }
                }
            }
            break;
    }
    if (wrk_notify_check($notification)) ui_render('notify', $notification);
}

function wrk_notify_check($notification)
{
    if (json_decode($notification) !== null) {
        $notification = json_decode($notification);
        if (isset($notification->title) && isset($notification->text)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

class ui_renderQueue
{
    public function __construct($socket)
    {
        $this->socket = $socket;
    }
    public function output()
    {
        $queue = getPlayQueue($this->socket);
        ui_render('queue', json_encode($queue));
    }
}

function ui_status($mpd, $status)
{
    $curTrack = getTrackInfo($mpd, $status['song']);
    if (isset($curTrack[0]['Title'])) {
        $status['currentartist'] = $curTrack[0]['Artist'];
        $status['currentsong'] = htmlentities($curTrack[0]['Title'], ENT_XML1, 'UTF-8');
        $status['currentalbum'] = $curTrack[0]['Album'];
        $status['fileext'] = parseFileStr($curTrack[0]['file'], '.');
    } else {
        $path = parseFileStr($curTrack[0]['file'], '/');
        $status['fileext'] = parseFileStr($curTrack[0]['file'], '.');
        $status['currentartist'] = "";
        // $status['currentsong'] = $song;
        if (!empty($path)) {
            $status['currentalbum'] = $path;
        } else {
            $status['currentalbum'] = '';
        }
    }
    $status['radioname'] = $curTrack[0]['Name'];
    return $status;
}

function ui_libraryHome($redis)
{
    // LocalStorage
    $localStorages = countDirs('/mnt/MPD/LocalStorage');
    // runelog('networkmounts: ',$networkmounts);
    // Network mounts
    $networkmounts = countDirs('/mnt/MPD/NAS');
    // runelog('networkmounts: ',$networkmounts);
    // USB mounts
    $usbmounts = countDirs('/mnt/MPD/USB');
    // runelog('usbmounts: ',$usbmounts);
    // Webradios
    $webradios = count($redis->hKeys('webradios'));
    // runelog('webradios: ',$webradios);
    // Dirble
    $proxy = $redis->hGetall('proxy');
    $dirblecfg = $redis->hGetAll('dirble');
    $dirble = json_decode(curlGet($dirblecfg['baseurl'].'amountStation/apikey/'.$dirblecfg['apikey'], $proxy));
    // runelog('dirble: ',$dirble);
    // Spotify
    $spotify = $redis->hGet('spotify', 'enable');
    // Check current player backend
    $activePlayer = $redis->get('activePlayer');
    // Bookmarks
    $redis_bookmarks = $redis->hGetAll('bookmarks');
    $bookmarks = array();
    foreach ($redis_bookmarks as $key => $data) {
        $bookmark = json_decode($data);
        runelog('bookmark details', $data);
        // $bookmarks[] = array('bookmark' => $key, 'name' => $bookmark->name, 'path' => $bookmark->path);
        $bookmarks[] = array('id' => $key, 'name' => $bookmark->name, 'path' => $bookmark->path);
    }
    // runelog('bookmarks: ',$bookmarks);
    // $jsonHome = json_encode(array_merge($bookmarks, array(0 => array('networkMounts' => $networkmounts)), array(0 => array('USBMounts' => $usbmounts)), array(0 => array('webradio' => $webradios)), array(0 => array('Dirble' => $dirble->amount)), array(0 => array('ActivePlayer' => $activePlayer))));
    // $jsonHome = json_encode(array_merge($bookmarks, array(0 => array('networkMounts' => $networkmounts)), array(0 => array('USBMounts' => $usbmounts)), array(0 => array('webradio' => $webradios)), array(0 => array('Spotify' => $spotify)), array(0 => array('Dirble' => $dirble->amount)), array(0 => array('ActivePlayer' => $activePlayer))));
    $jsonHome = json_encode(array('bookmarks' => $bookmarks, 'localStorages' => $localStorages, 'networkMounts' => $networkmounts, 'USBMounts' => $usbmounts, 'webradio' => $webradios, 'Spotify' => $spotify, 'Dirble' => $dirble->amount, 'ActivePlayer' => $activePlayer));
    // Encode UI response
    runelog('libraryHome JSON: ', $jsonHome);
    ui_render('library', $jsonHome);
}

function ui_lastFM_coverart($artist, $album, $lastfm_apikey, $proxy)
{
    if (!empty($album)) {
        $url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=".$lastfm_apikey."&artist=".urlencode($artist)."&album=".urlencode($album)."&format=json";
        unset($artist);
    } else {
        $url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=".$lastfm_apikey."&artist=".urlencode($artist)."&format=json";
        $artist = 1;
    }
    // debug
    //echo $url;
    $output = json_decode(curlGet($url, $proxy), true);
    // debug
    runelog('coverart lastfm query URL', $url);
    // debug++
    // echo "<pre>";
    // print_r($output);
    // echo "</pre>";

    // key [3] == extralarge last.fm image
    // key [4] == mega last.fm image
    if(isset($artist)) {
        runelog('coverart lastfm query URL', $output['artist']['image'][3]['#text']);
        return $output['artist']['image'][3]['#text'];
    } else {
        runelog('coverart lastfm query URL', $output['album']['image'][3]['#text']);
        return $output['album']['image'][3]['#text'];
    }
}

// populate queue with similiar tracks suggested by Last.fm
function ui_lastFM_similar($artist, $track, $lastfm_apikey, $proxy)
{
	runelog('similar lastfm artist', $artist);
	runelog('similar lastfm track', $track);
	runelog('similar lastfm name', $proxy);
	runelog('similar lastfm lastfm_api', $lastfm_api);
	// This makes the call to Last.fm. The limit parameter can be adjusted to the number of tracks you want returned. 
	// [TODO] adjustable amount of tracks in settings screen
    $url = "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&limit=1000&api_key=".$lastfm_apikey."&artist=".urlencode($artist)."&track=".urlencode($track)."&format=json";
    runelog('similar lastfm query URL', $url);
	// debug
    //echo $url;
	// This call does not work
    //$output = json_decode(curlGet($url, $proxy), true);
	// But these 2 lines do
	$content = file_get_contents($url);
	$output = json_decode($content,true);
    // debug
    // debug++
    // echo "<pre>";
    // print_r($output);
    // echo "</pre>";
	foreach($output['similartracks']['track'] as $similar) {
		$simtrack = $similar['name'];
		$simartist = $similar['artist']['name'];
		if (strlen($simtrack)>0 and strlen($simartist)>0) {
			// If we have a track and an artist then make a call to mpd to add it. If it doesn't exist then it doesn't
			// matter
			$status = sysCmd("mpc search artist '".$simartist."' title '".$simtrack. "' | head -n1 | mpc add");
		}
	}
}

// push UI update to NGiNX channel
function ui_render($channel, $data)
{
    curlPost('http://127.0.0.1/pub?id='.$channel, $data);
}

function ui_timezone() {
  $zones_array = array();
  $timestamp = time();
  foreach(timezone_identifiers_list() as $key => $zone) {
    date_default_timezone_set($zone);
    $zones_array[$key]['zone'] = $zone;
    $zones_array[$key]['diff_from_GMT'] = 'GMT ' . date('P', $timestamp);
  }
  return $zones_array;
}

function ui_update($redis ,$sock)
{
    ui_libraryHome($redis);
    switch ($redis->get('activePlayer')) {
        case 'MPD':
            if ($redis->get('pl_length') !== '0') {
                sendMpdCommand($sock, 'swap 0 0');
            } else {
                sendMpdCommand($sock, 'clear');
            }
            // return MPD response
            return readMpdResponse($sock);
            break;
        case 'Spotify':
            sendSpopCommand($sock, 'repeat');
            sendSpopCommand($sock, 'repeat');
             // return SPOP response
            return readSpopResponse($sock);
            break;
    } 
}

function ui_mpd_response($mpd, $notify = null)
{
    runelog('ui_mpd_response invoked');
    $response = json_encode(readMpdResponse($mpd));
    // --- TODO: check this condition
    if (strpos($response, "OK") && isset($notify)) {
        runelog('send UI notify: ', $notify);
        ui_notify($notify['title'], $notify['text']);
    }
    echo $response;
}

function curlPost($url, $data, $proxy = null)
{
    $ch = curl_init($url);
    @curl_setopt($curl, CURLOPT_HTTPHEADER, array("Connection: close"));
    @curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
    @curl_setopt($curl, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    if (isset($proxy)) {
        if ($proxy['enable'] === '1') {
            $proxy['user'] === '' || @curl_setopt($ch, CURLOPT_PROXYUSERPWD, $proxy['user'].':'.$proxy['pass']);
            @curl_setopt($ch, CURLOPT_PROXY, $proxy['host']);
            //runelog('cURL proxy HOST: ',$proxy['host']);
            //runelog('cURL proxy USER: ',$proxy['user']);
            //runelog('cURL proxy PASS: ',$proxy['pass']);
        }
    }
    @curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS, 400);
    @curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    @curl_setopt($ch, CURLOPT_POST, 1);
    @curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    @curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    @curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
    @curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

function curlGet($url, $proxy = null)
{
    $ch = curl_init($url);
    @curl_setopt($curl, CURLOPT_HTTPHEADER, array("Connection: close"));
    @curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
    @curl_setopt($curl, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    if (isset($proxy)) {
        if ($proxy['enable'] === '1') {
            $proxy['user'] === '' || @curl_setopt($ch, CURLOPT_PROXYUSERPWD, $proxy['user'].':'.$proxy['pass']);
            @curl_setopt($ch, CURLOPT_PROXY, $proxy['host']);
            // runelog('cURL proxy HOST: ',$proxy['host']);
            // runelog('cURL proxy USER: ',$proxy['user']);
            // runelog('cURL proxy PASS: ',$proxy['pass']);
        }
    }
    @curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS, 400);
    @curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    @curl_setopt($ch, CURLOPT_HEADER, 0);
    @curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

function countDirs($basepath)
{
    $scandir = scandir($basepath."/", SCANDIR_SORT_NONE);
    $count = count(array_diff($scandir, array('..', '.')));
    return $count;
}

function netmask($bitcount)
{
    $netmask = str_split(str_pad(str_pad('', $bitcount, '1'), 32, '0'), 8);
    foreach ($netmask as &$element) $element = bindec($element);
    return join('.', $netmask);
}

// sort multi-dimensional array by key
function osort(&$array, $key)
{
    usort($array, function($a, $b) use ($key) {
        return $a->$key > $b->$key ? 1 : -1;
    });	
}
