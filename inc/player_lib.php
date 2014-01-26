<?php
/*
 * Copyright (C) 2013-2014 RuneAudio Team
 * http://www.runeaudio.com
 *
 * RuneUI
 * copyright (C) 2013-2014 - Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)
 *
 * RuneOS
 * copyright (C) 2013-2014 - Carmelo San Giovanni (aka Um3ggh1U) & Simone De Gregori (aka Orion)
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
 *  file: player_lib.php
 *  version: 1.2
 *
 */
 
// Predefined MPD Response messages
define("MPD_RESPONSE_ERR", "ACK");
define("MPD_RESPONSE_OK",  "OK");

// v2
function openMpdSocket($host, $port) {
$sock = stream_socket_client('tcp://'.$host.':'.$port.'', $errorno, $errorstr, 30 );
$response = readMpdResponse($sock);
// debug
runelog("[1][".$sock."]\t>>>>>> OPEN MPD SOCKET <<<<<<\t\t\t",'');
return $sock;
} //end openMpdSocket()

function closeMpdSocket($sock) {
sendMpdCommand($sock,"close");
fclose($sock);
// debug
runelog("[0][".$sock."]\t<<<<<< CLOSE MPD SOCKET >>>>>>\t\t\t",'');
}

// v2
function sendMpdCommand($sock,$cmd) {
	if ($cmd == 'cmediafix') {
		$cmd = "pause\npause\n";
		fputs($sock, $cmd);
	} else {
		$cmd = $cmd."\n";
		fputs($sock, $cmd);	
	}
}

// v3
function readMpdResponse($sock) {
$output = "";
			while(!feof($sock)) {
				$response =  fgets($sock,1024);
				$output .= $response;
					if (strncmp(MPD_RESPONSE_OK,$response,strlen(MPD_RESPONSE_OK)) == 0) {
					break;
					}
					if (strncmp(MPD_RESPONSE_ERR,$response,strlen(MPD_RESPONSE_ERR)) == 0) {
					$output = "MPD error: $response";
					break;
					}
			}
return $output;
}

// v2
function sendMpdIdle($sock) {
//sendMpdCommand($sock,"idle player,playlist"); 
sendMpdCommand($sock,"idle"); 
$response = readMpdResponse($sock);
return true;
}

function monitorMpdState($sock) {
	if (sendMpdIdle($sock)) {
	$status = _parseStatusResponse(MpdStatus($sock));
	return $status;
	}
}

function getTrackInfo($sock,$songID) {
			// set currentsong, currentartis, currentalbum
			sendMpdCommand($sock,"playlistinfo ".$songID);
			$track = readMpdResponse($sock);
			return _parseFileListResponse($track);
}

function getPlayQueue($sock) {
sendMpdCommand($sock,"playlistinfo");
$playqueue = readMpdResponse($sock);
return _parseFileListResponse($playqueue);
}

function getTemplate($template) {
return str_replace("\"","\\\"",implode("",file($template)));
}

function getMpdOutputs($mpd) {
sendMpdCommand($mpd,"outputs");
$outputs= readMpdResponse($mpd);
return $outputs;
}

function getLastFMauth($db) {
$dbh = cfgdb_connect($db);
$querystr = "SELECT param,value FROM cfg_plugins WHERE name='lastfm'";
$result = sdbquery($querystr,$dbh);
$dbh = null;
$lastfm['user'] = $result[0]['value'];
$lastfm['pass'] = $result[1]['value'];
return $lastfm;
}

function setLastFMauth($db,$lastfm) {
$dbh = cfgdb_connect($db);
// set LastFM username
$value['plugin_name'] = 'lastfm';
$value['value'] = $lastfm['user'];
$key = 'username';
cfgdb_update('cfg_plugins',$dbh,$key,$value);
// set LastFM password
$value['value'] = $lastfm['pass'];
$key = 'password';
cfgdb_update('cfg_plugins',$dbh,$key,$value);
// close DB connection
$dbh = null;
}

function echoTemplate($template) {
echo $template;
}

function searchDB($sock,$querytype,$query) {
	switch ($querytype) {
	case "filepath":
		if (isset($query) && !empty($query)){
		sendMpdCommand($sock,"lsinfo \"".html_entity_decode($query)."\"");
		break;
		} else {
		sendMpdCommand($sock,"lsinfo");
		break;
		}
	case "album":
	case "artist":
	case "title":
	case "file":
		sendMpdCommand($sock,"search ".$querytype." \"".html_entity_decode($query)."\"");
		//sendMpdCommand($sock,"search any \"".html_entity_decode($query)."\"");
	break;
	
	}
	
//$response =  htmlentities(readMpdResponse($sock),ENT_XML1,'UTF-8');
//$response = htmlspecialchars(readMpdResponse($sock));
$response = readMpdResponse($sock);
return _parseFileListResponse($response);
}

function remTrackQueue($sock,$songpos) {
$datapath = findPLposPath($songpos,$sock);
sendMpdCommand($sock,"delete ".$songpos);
$response = readMpdResponse($sock);
return $datapath;
}

function addQueue($sock,$path) {
$fileext = parseFileStr($path,'.');
if ($fileext == 'm3u' OR $fileext == 'pls') {
sendMpdCommand($sock,"load \"".html_entity_decode($path)."\"");
} else {
sendMpdCommand($sock,"add \"".html_entity_decode($path)."\"");
}
$response = readMpdResponse($sock);
return $response;
}

function MpdStatus($sock) {
sendMpdCommand($sock,"status");
$status= readMpdResponse($sock);
return $status;
}

// create JS like Timestamp
function jsTimestamp() {
$timestamp = round(microtime(true) * 1000);
return $timestamp;
}

function songTime($sec) {
$minutes = sprintf('%02d', floor($sec / 60));
$seconds = sprintf(':%02d', (int) $sec % 60);
return $minutes.$seconds;
}

function phpVer() {
$version = phpversion();
return substr($version, 0, 3); 
}

function sysCmd($syscmd) {
exec($syscmd." 2>&1", $output);
runelog('sysCmd($str)',$syscmd);
runelog('sysCmd() output:',$output);
return $output;
}

function getMpdDaemonDetalis() {
$cmd = sysCmd('id -u mpd');
$details['uid'] = $cmd[0];
$cmd = sysCmd('id -g mpd');
$details['gid'] = $cmd[0];
$cmd = sysCmd('pgrep -u mpd');
$details['pid'] = $cmd[0];
return $details;
}

// format Output for "playlist"
function _parseFileListResponse($resp) {
		if ( is_null($resp) ) {
			return NULL;
		} else {
			$plistArray = array();
			$plistLine = strtok($resp,"\n");
			$plistFile = "";
			$plCounter = -1;
			while ( $plistLine ) {
				list ( $element, $value ) = explode(": ",$plistLine);
				if ( $element == "file" OR $element == "playlist") {
					$plCounter++;
					$plistFile = $value;
					$plistArray[$plCounter]["file"] = $plistFile;
					$plistArray[$plCounter]["fileext"] = parseFileStr($plistFile,'.');
				} else if ( $element == "directory") {
					$plCounter++;
					// record directory index for further processing
					$dirCounter++;
					$plistFile = $value;
					$plistArray[$plCounter]["directory"] = $plistFile;
				} else {
					$plistArray[$plCounter][$element] = $value;
					$plistArray[$plCounter]["Time2"] = songTime($plistArray[$plCounter]["Time"]);
				}

				$plistLine = strtok("\n");
			} 
				// reverse MPD list output
				if (isset($dirCounter) && isset($plistArray[0]["file"]) ) {
				$dir = array_splice($plistArray, -$dirCounter);
				$plistArray = $dir + $plistArray;
				}
		}
		return $plistArray;
	}

// format Output for "status"
function _parseStatusResponse($resp) {
		if ( is_null($resp) ) {
			return NULL;
		} else {
			$plistArray = array();
			$plistLine = strtok($resp,"\n");
			$plistFile = "";
			$plCounter = -1;
			while ( $plistLine ) {
				list ( $element, $value ) = explode(": ",$plistLine);
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
					case '96000':
					case '192000':
					$plistArray['audio_sample_rate'] = rtrim(rtrim(number_format($audio_format[0]),0),',');
					break;
					
					case '44100':
					case '88200':
					case '176400':
					case '352800':
					$plistArray['audio_sample_rate'] = rtrim(number_format($audio_format[0],0,',','.'),0);
					break;
				}
			 // format "audio_sample_depth" string
			 	$plistArray['audio_sample_depth'] = $audio_format[1];
			 // format "audio_channels" string
			 	if ($audio_format[2] == "2") $plistArray['audio_channels'] = "Stereo";
			 	if ($audio_format[2] == "1") $plistArray['audio_channels'] = "Mono";
			 	if ($audio_format[2] > 2) $plistArray['audio_channels'] = "Multichannel";

		}
		return $plistArray;
	}

function _parseOutputsResponse($input,$active) {
		if ( is_null($input) ) {
				return NULL;
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
			$value = explode(':',$line);
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
function parseFileStr($strFile,$delimiter) {
$pos = strrpos($strFile, $delimiter);
$str = substr($strFile, $pos+1);
return $str;
}

// cfg engine and session management
function playerSession($action,$db,$var,$value) {
$status = session_status();	
	// open new PHP SESSION
	if ($action == 'open') {
		// check the PHP SESSION status
		if($status != 2) {
			// check presence of sessionID into SQLite datastore
			//debug
			// echo "<br>---------- READ SESSION -------------<br>";
			$sessionid = playerSession('getsessionid',$db);
			if (!empty($sessionid)) {
				// echo "<br>---------- SET SESSION ID-------------<br>";
				session_id($sessionid);
				session_start();
			} else {
				session_start();
				// echo "<br>---------- STORE SESSION -------------<br>";
				playerSession('storesessionid',$db);
			}
		}
		$dbh  = cfgdb_connect($db);
		// scan cfg_engine and store values in the new session
		$params = cfgdb_read('cfg_engine',$dbh);
		foreach ($params as $row) {
		$_SESSION[$row['param']] = $row['value'];
		}
		//debug
		//print_r($_SESSION);
	// close SQLite handle
	$dbh  = null;
	}

	// unlock PHP SESSION file
	if ($action == 'unlock') {
	session_write_close();
		// if (session_write_close()) {
			// return true;
		// }
	}
	
	// unset and destroy current PHP SESSION
	if ($action == 'destroy') {
	session_unset();
		if (session_destroy()) {
		$dbh  = cfgdb_connect($db);
			if (cfgdb_update('cfg_engine',$dbh,'sessionid','')) {
			$dbh = null;
			return true;
			} else {
			echo "cannot reset session on SQLite datastore";
			return false;
			}
		}
	}
	
	// store a value in the cfgdb and in current PHP SESSION
	if ($action == 'write') {
	$_SESSION[$var] = $value;
	$dbh  = cfgdb_connect($db);
	cfgdb_update('cfg_engine',$dbh,$var,$value);
	$dbh = null;
	}
	
	// record actual PHP Session ID in SQLite datastore
	if ($action == 'storesessionid') {
	$sessionid = session_id();
	playerSession('write',$db,'sessionid',$sessionid);
	}
	
	// read PHP SESSION ID stored in SQLite datastore and use it to "attatch" the same SESSION (used in worker)
	if ($action == 'getsessionid') {
	$dbh  = cfgdb_connect($db);
	$result = cfgdb_read('cfg_engine',$dbh,'sessionid');
	$dbh = null;
	return $result['0']['value'];
	}
	
}

function cfgdb_connect($dbpath) {
	if ($dbh  = new PDO($dbpath)) {
	return $dbh;
	} else {
		echo "cannot open the database";
	return false;
 }
}

function cfgdb_read($table,$dbh,$param,$id) {
	if(!isset($param)) {
	$querystr = "SELECT * FROM ".$table;
	} else if (isset($id)) {
	$querystr = "SELECT * FROM ".$table." WHERE id='".$id."'";
	} else if ($param == 'mpdconf'){
	$querystr = "SELECT param,value_player FROM cfg_mpd WHERE value_player!=''";
	} else if ($param == 'mpdconfdefault') {
	$querystr = "SELECT param,value_default FROM cfg_mpd WHERE value_default!=''";
	} else if ($table == 'cfg_plugins') {
	$querystr = "SELECT * FROM ".$table." WHERE name='".$param['plugin_name']."' AND param='".$param['plugin_param']."'";
	} else {
	$querystr = 'SELECT value from '.$table.' WHERE param="'.$param.'"';
	}
//debug
runelog('cfgdb_read('.$table.',dbh,'.$param.','.$id.')',$querystr);
$result = sdbquery($querystr,$dbh);
return $result;
}

function cfgdb_update($table,$dbh,$key,$value) {
switch ($table) {
	case 'cfg_engine':
	$querystr = "UPDATE ".$table." SET value='".$value."' where param='".$key."'";
	break;
	
	case 'cfg_lan':
	$querystr = "UPDATE ".$table." SET dhcp='".$value['dhcp']."', ip='".$value['ip']."', netmask='".$value['netmask']."', gw='".$value['gw']."', dns1='".$value['dns1']."', dns2='".$value['dns2']."' where name='".$value['name']."'";
	break;
	
	case 'cfg_mpd':
	$querystr = "UPDATE ".$table." set value_player='".$value."' where param='".$key."'";
	break;
	
	case 'cfg_wifisec':
	$querystr = "UPDATE ".$table." SET ssid='".$value['ssid']."', security='".$value['encryption']."', password='".$value['password']."' where id=1";
	break;
	
	case 'cfg_source':
	$querystr = "UPDATE ".$table." SET name='".$value['name']."', type='".$value['type']."', address='".$value['address']."', remotedir='".$value['remotedir']."', username='".$value['username']."', password='".$value['password']."', charset='".$value['charset']."', rsize='".$value['rsize']."', wsize='".$value['wsize']."', options='".$value['options']."', error='".$value['error']."' where id=".$value['id'];
	break;
	
	case 'cfg_plugins':
	$querystr = "UPDATE ".$table." SET value='".$value['value']."' where param='".$key."' AND name='".$value['plugin_name']."'";
	break;
}
//debug
runelog('cfgdb_update('.$table.',dbh,'.$key.','.$value.')',$querystr);
	if (sdbquery($querystr,$dbh)) {
	return true;
	} else {
	return false;
	}
}

function cfgdb_write($table,$dbh,$values) {
$querystr = "INSERT INTO ".$table." VALUES (NULL, ".$values.")";
//debug
runelog('cfgdb_write('.$table.',dbh,'.$values.')',$querystr);
	if (sdbquery($querystr,$dbh)) {
	return true;
	} else {
	return false;
	}
}

function cfgdb_delete($table,$dbh,$id) {
if (!isset($id)) {
$querystr = "DELETE FROM ".$table;
} else {
$querystr = "DELETE FROM ".$table." WHERE id=".$id;
}
//debug
runelog('cfgdb_delete('.$table.',dbh,'.$id.')',$querystr);
	if (sdbquery($querystr,$dbh)) {
	return true;
	} else {
	return false;
	}
}

function sdbquery($querystr,$dbh) {
	$query = $dbh->prepare($querystr);
	if ($query->execute()) {
			$result = array();
			  $i = 0;
				  foreach ($query as $value) {
					$result[$i] = $value;
					$i++;
				  }
		$dbh = null;
		if (empty($result)) {
		return true;
		} else {
		return $result;
		}
	} else {
	 return false;
	}
}

// Ramplay functions
function rp_checkPLid($id,$mpd) {
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
function rp_findPath($id,$mpd) {
//$_SESSION['DEBUG'] .= "rp_findPath:$id |";
sendMpdCommand($mpd,'playlistid '.$id);
$idinfo = _parseFileListResponse(readMpdResponse($mpd));
$path = $idinfo[0]['file'];
//$_SESSION['DEBUG'] .= "Path:$path |";
return $path;
}

//<< TODO: join with rp_findPath()
function findPLposPath($songpos,$mpd) {
//$_SESSION['DEBUG'] .= "rp_findPath:$id |";
sendMpdCommand($mpd,'playlistinfo '.$songpos);
$idinfo = _parseFileListResponse(readMpdResponse($mpd));
$path = $idinfo[0]['file'];
//$_SESSION['DEBUG'] .= "Path:$path |";
return $path;
}

function rp_deleteFile($id,$mpd) {
$_SESSION['DEBUG'] .= "rp_deleteFile:$id |";
	if (unlink(rp_findPath($id,$mpd))) {
	return true;
	} else {
	return false;
	}
}

function rp_copyFile($id,$mpd) {
$_SESSION['DEBUG'] .= "rp_copyFile: $id|";
$path = rp_findPath($id,$mpd);
$song = parseFileStr($path,"/");
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

function rp_updateFolder($mpd) {
$_SESSION['DEBUG'] .= "rp_updateFolder: |";
sendMpdCommand($mpd,"update ramplay");
}

function rp_addPlay($path,$mpd,$pos) {
$song = parseFileStr($path,"/");
$ramplaypath = "ramplay/".$song;
$_SESSION['DEBUG'] .= "rp_addPlay:$id $song $path $pos|";
addQueue($mpd,$ramplaypath);
sendMpdCommand($mpd,'play '.$pos);
}

function rp_clean() {
$_SESSION['DEBUG'] .= "rp_clean: |";
recursiveDelete('/dev/shm/');
}

function recursiveDelete($str){
	if(is_file($str)){
		return @unlink($str);
		// aggiungere ricerca path in playlist e conseguente remove from playlist
	}
	elseif(is_dir($str)){
		$scan = glob(rtrim($str,'/').'/*');
		foreach($scan as $index=>$path){
			recursiveDelete($path);
		}
	}
}

function pushFile($filepath) {
	if (file_exists($filepath)) {
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename='.basename($filepath));
		header('Content-Transfer-Encoding: binary');
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($filepath));
		ob_clean();
		flush();
		readfile($filepath);
		return true;
	} else {
		return false;
	}
}

// check if mpd.conf or interfaces was modified outside
function hashCFG($action,$db) {
playerSession('open',$db);
	switch ($action) {
		
		case 'check_net':
		// --- CODE REWORK NEEDED ---
		$hash = md5_file('/etc/netctl/eth0');
		if ($hash != $_SESSION['netconfhash']) {
			if ($_SESSION['netconf_advanced'] != 1) {
			playerSession('write',$db,'netconf_advanced',1); 
			}
		return false;
		} else {
			if ($_SESSION['netconf_advanced'] != 0) {
			playerSession('write',$db,'netconf_advanced',0);
			}
		}
		break;
		
		case 'check_mpd':
		$hash = md5_file('/etc/mpd.conf');
		if ($hash != $_SESSION['mpdconfhash']) {
			if ($_SESSION['mpdconf_advanced'] != 1) {
			playerSession('write',$db,'mpdconf_advanced',1); 
			}
		return false;
		} else {
			if ($_SESSION['mpdconf_advanced'] != 0) {
			playerSession('write',$db,'mpdconf_advanced',0); 
			}
		}
		break;
		
		case 'check_source':
		$hash = md5_file('/etc/auto.nas');
		if ($hash != $_SESSION['sourceconfhash']) {
			if ($_SESSION['sourceconf_advanced'] != 1) {
			playerSession('write',$db,'sourceconf_advanced',1); 
			}
		return false;
		} else {
			if ($_SESSION['sourceconf_advanced'] != 0) {
			playerSession('write',$db,'sourceconf_advanced',0); 
			}
		}
		break;
		
		case 'hash_net':
		$hash = md5_file('/etc/network/interfaces');
		playerSession('write',$db,'netconfhash',$hash); 
		break;
		
		case 'hash_mpd':
		$hash = md5_file('/etc/mpd.conf');
		playerSession('write',$db,'mpdconfhash',$hash); 
		break;
		
		case 'hash_source':
		$hash = md5_file('/etc/auto.nas');
		playerSession('write',$db,'sourceconfhash',$hash); 
		break;
	} 
playerSession('unlock');
return true;
}

// log & debug functions
function debug($input) {
session_start();
	// if $input = 1 clear SESSION debug data else load debug data into session
	if (isset($input) && $input == 1) {
	$_SESSION['debugdata'] = '';
	} else {
	$_SESSION['debugdata'] = $input;
	}
session_write_close();
}

function runelog($title,$data) {
	if ($_SESSION['debug'] > 0) {
	    if(is_array($data)) {
		foreach($data as $line) {
		error_log('[debug='.$_SESSION['debug'].'] ### '.$title.' ###  '.$line,0);
		}
	    } else {
	    error_log('[debug='.$_SESSION['debug'].'] ### '.$title.' ###  '.$data,0);
	    }
	}
}


function debug_footer($db) {
		if ($_SESSION['debug'] > 0) {
		debug_output();
		debug(1);
		echo "\n";
		echo "###### System info ######\n";
		echo  file_get_contents('/proc/version');
		echo "\n";
		echo  "system load:\t".file_get_contents('/proc/loadavg');
		echo "\n";
		echo "HW platform:\t".$_SESSION['hwplatform']." (".$_SESSION['hwplatformid'].")\n";
		echo "\n";
		echo "playerID:\t".$_SESSION['playerid']."\n";
		echo "\n";
		echo "\n";
		echo "###### Audio backend ######\n";
		echo  file_get_contents('/proc/asound/version');
		echo "\n";
		echo "Card list: (/proc/asound/cards)\n";
		echo "--------------------------------------------------\n";
		echo  file_get_contents('/proc/asound/cards');
		echo "\n";
		echo "ALSA interface #0: (/proc/asound/card0/pcm0p/info)\n";
		echo "--------------------------------------------------\n";
		echo  file_get_contents('/proc/asound/card0/pcm0p/info');
		echo "\n";
		echo "ALSA interface #1: (/proc/asound/card1/pcm0p/info)\n";
		echo "--------------------------------------------------\n";
		echo  file_get_contents('/proc/asound/card1/pcm0p/info');
		echo "\n";
		echo "interface #0 stream status: (/proc/asound/card0/stream0)\n";
		echo "--------------------------------------------------------\n";
		$streaminfo = file_get_contents('/proc/asound/card0/stream0');
		if (empty($streaminfo)) {
		echo "no stream present\n";
		} else {
		echo $streaminfo;
		}
		echo "\n";
		echo "interface #1 stream status: (/proc/asound/card1/stream0)\n";
		echo "--------------------------------------------------------\n";
		$streaminfo = file_get_contents('/proc/asound/card1/stream0');
		if (empty($streaminfo)) {
		echo "no stream present\n";
		} else {
		echo $streaminfo;
		}
		echo "\n";
		echo "\n";
		echo "###### Kernel module snd_usb_audio settings ######\n";
		echo "\n";
		$sndusbinfo = sysCmd('systool -v -m snd_usb_audio');
		echo implode("\n",$sndusbinfo)."\n\n";
		echo "###### Kernel optimization parameters ######\n";
		echo "\n";
		echo "hardware platform:\t".$_SESSION['hwplatform']."\n";
		echo "current orionprofile:\t".$_SESSION['orionprofile']."\n";
		echo "\n";
		// 		echo  "kernel scheduler for mmcblk0:\t\t".((empty(file_get_contents('/sys/block/mmcblk0/queue/scheduler'))) ? "\n" : file_get_contents('/sys/block/mmcblk0/queue/scheduler'));
		echo  "kernel scheduler for mmcblk0:\t\t".file_get_contents('/sys/block/mmcblk0/queue/scheduler');
		echo  "/proc/sys/vm/swappiness:\t\t".file_get_contents('/proc/sys/vm/swappiness');
		echo  "/proc/sys/kernel/sched_latency_ns:\t".file_get_contents('/proc/sys/kernel/sched_latency_ns');
		#echo  "/proc/sys/kernel/sched_rt_period_us:\t".file_get_contents('/proc/sys/kernel/sched_rt_period_us');
		#echo  "/proc/sys/kernel/sched_rt_runtime_us:\t".file_get_contents('/proc/sys/kernel/sched_rt_runtime_us');
		echo "\n";
		echo "\n";
		echo "###### Filesystem mounts ######\n";
		echo "\n";
		echo  file_get_contents('/proc/mounts');
		echo "\n";
		echo "\n";
		echo "###### mpd.conf ######\n";
		echo "\n";
		echo file_get_contents('/etc/mpd.conf');
		echo "\n";
		}
		if ($_SESSION['debug'] > 1) {
		echo "\n";
		echo "\n";
		echo "###### PHP backend ######\n";
		echo "\n";
		echo "php version:\t".phpVer()."\n";
		echo "debug level:\t".$_SESSION['debug']."\n";
		echo "\n";
		echo "\n";
		echo "###### SESSION ######\n";
		echo "\n";
		echo "STATUS:\t\t".session_status()."\n";
		echo "ID:\t\t".session_id()."\n"; 
		echo "SAVE PATH:\t".session_save_path()."\n";
		echo "\n";
		echo "\n";
		echo "###### SESSION DATA ######\n";
		echo "\n";
		print_r($_SESSION);
		}
		if ($_SESSION['debug'] > 2) {
		$connection = new pdo($db);
		$querystr="SELECT * FROM cfg_engine";
		$data['cfg_engine'] = sdbquery($querystr,$connection);
		$querystr="SELECT * FROM cfg_lan";
		$data['cfg_lan'] = sdbquery($querystr,$connection);
		$querystr="SELECT * FROM cfg_wifisec";
		$data['cfg_wifisec'] = sdbquery($querystr,$connection);
		$querystr="SELECT * FROM cfg_mpd";
		$data['cfg_mpd'] = sdbquery($querystr,$connection);
		$querystr="SELECT * FROM cfg_source";
		$data['cfg_source'] = sdbquery($querystr,$connection);
		$querystr="SELECT * FROM cfg_plugins";
		$data['cfg_plugins'] = sdbquery($querystr,$connection);
		$connection = null;
		echo "\n";
		echo "\n";
		echo "###### SQLite datastore ######\n";
		echo "\n";
		echo "\n";
		echo "### table CFG_ENGINE ###\n";
		print_r($data['cfg_engine']);
		echo "\n";
		echo "\n";
		echo "### table CFG_LAN ###\n";
		print_r($data['cfg_lan']);
		echo "\n";
		echo "\n";
		echo "### table CFG_WIFISEC ###\n";
		print_r($data['cfg_wifisec']);
		echo "\n";
		echo "\n";
		echo "### table CFG_SOURCE ###\n";
		print_r($data['cfg_source']);
		echo "\n";
		echo "\n";
		echo "### table CFG_PLUGINS ###\n";
		print_r($data['cfg_plugins']);
		echo "\n";
		echo "\n";
		echo "### table CFG_MPD ###\n";
		print_r($data['cfg_mpd']);
		echo "\n";
		}
		if ($_SESSION['debug'] > 0) {
		echo "\n";
		printf("Page created in %.5f seconds.", (microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']));
		echo "\n";
		echo "\n";
		}
}

function debug_output($clear) {
	if (!empty($_SESSION['debugdata'])) {
	$output = print_r($_SESSION['debugdata']);
	}
echo $output;
}

function waitWorker($sleeptime,$section) {
	if ($_SESSION['w_active'] == 1) {
		do {
			sleep($sleeptime);
			session_start();
			session_write_close();
		} while ($_SESSION['w_active'] != 0);

		switch ($section) {
			case 'sources':
			$mpd = openMpdSocket('localhost', 6600);
			sendMpdCommand($mpd,'update');
			closeMpdSocket($mpd);
			break;
		}
	}
} 

// search a string in a file and replace with another string the whole line.
function wrk_replaceTextLine($file,$inputArray,$strfind,$strrepl,$linelabel,$lineoffset) {
	runelog('wrk_replaceTextLine($file,$inputArray,$strfind,$strrepl,$linelabel,$lineoffset)','');
	runelog('wrk_replaceTextLine $file',$file);
	runelog('wrk_replaceTextLine $strfind',$strfind);
	runelog('wrk_replaceTextLine $strrepl',$strrepl);
	runelog('wrk_replaceTextLine $linelabel',$linelabel);
	runelog('wrk_replaceTextLine $lineoffset',$lineoffset);
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
			runelog('line index match! $line',$lineindex);
			}
			if ((($lineindex+$lineoffset)-$linenum)==0) {
			  if (preg_match('/'.$strfind.'/', $line)) {
				$line = $strrepl."\n";
				runelog('internal loop $line',$line);
			  }
			}
		} else {
		  if (preg_match('/'.$strfind.'/', $line)) {
			$line = $strrepl."\n";
			runelog('replaceall $line',$line);
		  }
		}
	  $newArray[] = $line;
	}
	return $newArray;
}

// make device TOTALBACKUP (with switch DEV copy all /etc)
function wrk_backup($bktype) {
	if ($bktype == 'dev') {
	$filepath = "/run/totalbackup_".date('Y-m-d').".tar.gz";
	$cmdstring = "tar -czf ".$filepath." /var/lib/mpd /boot/cmdline.txt /var/www /etc";
	} else {
	$filepath = "/run/backup_".date('Y-m-d').".tar.gz";
	$cmdstring = "tar -czf ".$filepath." /var/lib/mpd /etc/mpd.conf /var/www/db/player.db";
	}
	
sysCmd($cmdstring);
return $filepath;
}


function wrk_opcache($action) {
	switch ($action) {
		case 'prime':
			if ($_SESSION['opcache'] == 1) {
			$ch = curl_init('http://localhost/command/cachectl.php?action=prime');
			curl_exec($ch);
			curl_close($ch);
			}
		break;
		
		case 'forceprime':
			$ch = curl_init('http://localhost/command/cachectl.php?action=prime');
			curl_exec($ch);
			curl_close($ch);
		break;
		
		case 'reset':
			$ch = curl_init('http://localhost/command/cachectl.php?action=reset');
			curl_exec($ch);
			curl_close($ch);
		break;
		
		case 'enable':
		wrk_opcache('reset');
		// opcache.ini
		$file = '/etc/php/conf.d/opcache.ini';
		$newArray = wrk_replaceTextLine($file,'','opcache.enable','opcache.enable=1','zend_extension',1);
		// Commit changes to /etc/php/conf.d/opcache.ini
		$fp = fopen($file, 'w');
		fwrite($fp, implode("",$newArray));
		fclose($fp);
		break;
		
		case 'disable':
		wrk_opcache('reset');
		// opcache.ini
		// -- REWORK NEEDED --
		$file = '/etc/php/conf.d/opcache.ini';
		$newArray = wrk_replaceTextLine($file,'','opcache.enable','opcache.enable=0','zend_extension',1);
		// Commit changes to /etc/php/conf.d/opcache.ini
		$fp = fopen($file, 'w');
		fwrite($fp, implode("",$newArray));
		fclose($fp);
		break;
	}
}


function wrk_restore($backupfile) {
$path = "/run/".$backupfile;
$cmdstring = "tar xzf ".$path." --overwrite --directory /";
	if (sysCmd($cmdstring)) {
		recursiveDelete($path);
	}
}

function wrk_jobID() {
$jobID = md5(uniqid(rand(), true));
return "job_".$jobID;
}

function wrk_checkStrSysfile($sysfile,$searchstr) {
$file = stripcslashes(file_get_contents($sysfile));
// debug
runelog('wrk_checkStrSysfile('.$sysfile.','.$searchstr.')',$searchstr);
	if (strpos($file, $searchstr)) {
	return true;
	} else {
	return false;
	}
}

function wrk_cleanDistro($db) {
runelog('function CLEAN DISTRO invoked!!!','');
// remove mpd.db
sysCmd('systemctl stop mpd');
sleep(1);
sysCmd('rm /var/lib/mpd/mpd.db');
sysCmd('rm /var/lib/mpd/mpdstate');
// reset /var/log/*
sysCmd('rm -f /var/log/*');
// reset /var/log/nginx/*
sysCmd('rm -f /var/log/nginx/*');
// reset /var/log/atop/*
sysCmd('rm -f /var/log/atop/*');
// reset /var/log/old/*
sysCmd('rm -f /var/log/old/*');
// reset /var/log/samba/*
sysCmd('rm -rf /var/log/samba/*');
// reset /root/ logs
sysCmd('rm -rf /root/.*');
// delete .git folder
sysCmd('rm -rf /var/www/.git');
// switch smb.conf to 'production' state
sysCmd('rm /var/www/_OS_SETTINGS/etc/samba/smb.conf');
sysCmd('ln -s /var/www/_OS_SETTINGS/etc/samba/smb-prod.conf /var/www/_OS_SETTINGS/etc/samba/smb.conf');
// switch nginx.conf to 'production' state
sysCmd('systemctl stop nginx');
sysCmd('rm /etc/nginx/nginx.conf');
sysCmd('ln -s /var/www/_OS_SETTINGS/etc/nginx/nginx-prod.conf /etc/nginx/nginx.conf');
sysCmd('systemctl start nginx');
// reset /var/log/runeaudio/*
sysCmd('rm -f /var/log/runeaudio/*');
// rest mpd.conf
sysCmd('cp /var/www/_OS_SETTINGS/mpd.conf /etc/mpd.conf');
sysCmd('chown mpd.audio /etc/mpd.conf');
// restore default player.db
sysCmd('cp /var/www/db/player.db.default /var/www/db/player.db');
sysCmd('chmod 777 /var/www/db/player.db');
sysCmd('poweroff');
}

function wrk_mpdconf($outpath,$db) {
// extract mpd.conf from SQLite datastore
	$dbh = cfgdb_connect($db);
	$query_cfg = "SELECT param,value_player FROM cfg_mpd WHERE value_player!=''";
	$mpdcfg = sdbquery($query_cfg,$dbh);
	$dbh = null;

// set mpd.conf file header
	$output = "###################################\n";
	$output .= "# Auto generated mpd.conf file\n";
	$output .= "# please DO NOT edit it manually!\n";
	$output .= "# Use RuneUI MPD config section\n";
	$output .= "###################################\n";
	$output .= "\n";

// parse DB output
	foreach ($mpdcfg as $cfg) {
		if ($cfg['param'] == 'audio_output_format' && $cfg['value_player'] == 'disabled'){
		$output .= '';
		} else if ($cfg['param'] == 'dsd_usb') {
		$dsd = $cfg['value_player'];
		// $output .= '';
		} else if ($cfg['param'] == 'mixer_type' && $cfg['value_player'] == 'hardware' ) { 
		// $hwmixer['device'] = 'hw:0';
		$hwmixer['control'] = alsa_findHwMixerControl(0);
		// $hwmixer['index'] = '1';
		playerSession('write',$db,'volume',1);
		} else if ($cfg['param'] == 'mixer_type' && $cfg['value_player'] == 'software') {
		// --- REWORK NEEDED ---
		playerSession('write',$db,'volume',1);
		$output .= $cfg['param']." \t\"".$cfg['value_player']."\"\n";
		} else if ($cfg['param'] == 'mixer_type' && $cfg['value_player'] == 'disabled') {
		// --- REWORK NEEDED ---
		playerSession('write',$db,'volume',0);
		$output .= $cfg['param']." \t\"".$cfg['value_player']."\"\n";
		} else {
		$output .= $cfg['param']." \t\"".$cfg['value_player']."\"\n";
		}
	}
	
	if (wrk_checkStrSysfile('/proc/asound/cards','USB-Audio')) {
	$usbout = 'yes';
	$jackout = 'no';
	$hdmiout = 'no';
	$nullout = 'yes';
	} else if ($_SESSION['hwplatformid'] == '01' OR $_SESSION['hwplatformid'] == '02') {
	$usbout = 'no';
	$jackout = 'yes';
	$hdmiout = 'no';
	$nullout = 'no';
	} else if ($_SESSION['hwplatformid'] == '03' OR $_SESSION['hwplatformid'] == '04') {
	$usbout = 'no';
	$jackout = 'no';
	$hdmiout = 'no';
	$nullout = 'yes';
	} else {
	$usbout = 'no';
	$jackout = 'no';
	$hdmiout = 'no';
	$nullout = 'yes';
	}
	
	// format audio input / output interfaces
	$output .= "max_connections \"20\"\n";
	$output .= "\n";
	$output .= "decoder {\n";
	$output .= "\t\tplugin \"ffmpeg\"\n";
	$output .= "\t\tenabled \"no\"\n";
	$output .= "}\n";
	$output .= "\n";
	$output .= "input {\n";
	$output .= "\t\tplugin \"curl\"\n";
	$output .= "}\n";
	$output .= "\n";
	
	// Output #index: 0 (USB-Audio)
	$output .= "audio_output {\n";
	$output .= "enabled\t\t\"".$usbout."\"\n";
	$output .= "type\t\t\"alsa\"\n";
	$output .= "name\t\t\"USB-Audio\"\n";
	$output .= "device\t\t\"hw:0,0\"\n";
	if (isset($hwmixer)) {
	// $output .= "\t\t mixer_device \t\"".$hwmixer['device']."\"\n";
	$output .= "mixer_control\t\"".$hwmixer['control']."\"\n";
	// $output .= "\t\t mixer_index \t\"".$hwmixer['index']."\"\n";
	}
	$output .= "dsd_usb\t\t\"".$dsd."\"\n";
	$output .= "}\n\n";
	
	// Output #index: 1 (Null)
	$output .= "audio_output {\n";
	$output .= "enabled\t\t\"".$nullout."\"\n";
	$output .= "type\t\t\"null\"\n";
	$output .= "name\t\t\"Null\"\n";
	$output .= "}\n\n";
	
	if ($_SESSION['hwplatformid'] == '01' OR $_SESSION['hwplatformid'] == '02') {
	// Output #index: 2 (AnalogJack/HDMI)
	$output .= "audio_output {\n";
	$output .= "enabled\t\t\"".$jackout."\"\n";
	$output .= "type\t\t\"alsa\"\n";
	$output .= "device\t\t\"hw:1,0\"\n";
	$output .= "name\t\t\"AnalogJack/HDMI\"\n";
	$output .= "}\n\n";

	// Output #index: 3 (HDMI)
	//$output .= "audio_output {\n";
	//$output .= "enabled\t\t\"".$hdmiout."\"\n";
	//$output .= "type\t\t\"alsa\"\n";
	//$output .= "device\t\t\"hw:1,1\"\n";
	//$output .= "name\t\t\"HDMI\"\n";
	//$output .= "}\n\n";
	}
	
// write mpd.conf file
	$fh = fopen($outpath."/mpd.conf", 'w');
	fwrite($fh, $output);
	fclose($fh);
}

function wrk_setMpdStartOut($archID) {
// -- REWORK NEEDED --
	if (wrk_checkStrSysfile('/proc/asound/cards','USB-Audio')) {
	sysCmd("mpc enable only USB-Audio");
	} else if ($archID == '01' OR $archID == '02') {
	sysCmd("mpc enable only 'AnalogJack/HDMI'");
	} else if ($archID == '03' OR $archID == '04') {
	sysCmd("mpc enable only 'Null Output'");
	} else {
	sysCmd("mpc enable only 'Null Output'");
	}
}

function wrk_sourcemount($db,$action,$id) {
	switch ($action) {
		
		case 'mount':
			$dbh = cfgdb_connect($db);
			$mp = cfgdb_read('cfg_source',$dbh,'',$id);
			$mpdproc = getMpdDaemonDetalis();
			sysCmd("mkdir \"/mnt/MPD/".$mp[0]['name']."\"");
			if ($mp[0]['type'] == 'cifs') {
			// smb/cifs mount
			$auth = 'guest';
			if (!empty($mp[0]['username'])) {
			$auth = "username=".$mp[0]['username'].",password=".$mp[0]['password'];
			}
			$mountstr = "mount -t cifs \"//".$mp[0]['address']."/".$mp[0]['remotedir']."\" -o ".$auth.",sec=ntlm,uid=".$mpdproc['uid'].",gid=".$mpdproc['gid'].",rsize=".$mp[0]['rsize'].",wsize=".$mp[0]['wsize'].",iocharset=".$mp[0]['charset'].",".$mp[0]['options']." \"/mnt/MPD/".$mp[0]['name']."\"";
			} else {
			// nfs mount
			$mountstr = "mount -t nfs -o rsize=".$mp[0]['rsize'].",wsize=".$mp[0]['wsize'].",".$mp[0]['options']." \"".$mp[0]['address'].":/".$mp[0]['remotedir']."\" \"/mnt/MPD/".$mp[0]['name']."\"";
			}
			// debug
			runelog('mount string',$mountstr);
			$sysoutput = sysCmd($mountstr);
			// -- REWORK NEEDED --
			runelog('system response',var_dump($sysoutput));
			if (empty($sysoutput)) {
				if (!empty($mp[0]['error'])) {
				$mp[0]['error'] = '';
				cfgdb_update('cfg_source',$dbh,'',$mp[0]);
				}
			$return = 1;
			} else {
			sysCmd("rmdir \"/mnt/MPD/".$mp[0]['name']."\"");
			$mp[0]['error'] = implode("\n",$sysoutput);
			cfgdb_update('cfg_source',$dbh,'',$mp[0]);
			$return = 0;
			}	
		break;
		
		case 'mountall':
		$dbh = cfgdb_connect($db);
		$mounts = cfgdb_read('cfg_source',$dbh);
		foreach ($mounts as $mp) {
			if (!wrk_checkStrSysfile('/proc/mounts',$mp['name']) ) {
			$return = wrk_sourcemount($db,'mount',$mp['id']);
			}
		}
		$dbh = null;
		break;
		
	}
return $return;
}

function wrk_sourcecfg($db,$queueargs) {
if (isset($queueargs['mount']['action'])) {
$action = $queueargs['mount']['action'];
unset($queueargs['mount']['action']);
} else {
$action = $queueargs;
}
runelog('wrk_sourcecfg($db,'.$queueargs.')',$action);
	switch ($action) {

		case 'reset': 
		$dbh = cfgdb_connect($db);
		$source = cfgdb_read('cfg_source',$dbh);
			foreach ($source as $mp) {
			runelog('wrk_sourcecfg() internal loop $mp[name]',$mp['name']);
			sysCmd("umount -f \"/mnt/MPD/".$mp['name']."\"");
			sysCmd("rmdir \"/mnt/MPD/".$mp['name']."\"");
			}
		if (cfgdb_delete('cfg_source',$dbh)) {
		$return = 1;
		} else {
		$return = 0;
		}
		$dbh = null;
		break;

		case 'add':
		$dbh = cfgdb_connect($db);
		// debug
		runelog('wrk_sourcecfg($db,$queueargs) $queueargs',var_dump($queueargs));
		unset($queueargs['mount']['id']);
		// format values string
		$values = null;
		foreach ($queueargs['mount'] as $key => $value) {
			if ($key == 'error') {
			$values .= "'".SQLite3::escapeString($value)."'";
			// debug
			runelog('wrk_sourcecfg($db,$queueargs) case ADD scan $values',$values);
			} else {
			$values .= "'".SQLite3::escapeString($value)."',";
			// debug
			runelog('wrk_sourcecfg($db,$queueargs) case ADD scan $values',$values);
			}
		}
		// debug
		runelog('wrk_sourcecfg($db,$queueargs) complete $values string',$values);
		// write new entry
		cfgdb_write('cfg_source',$dbh,$values);
		$newmountID = $dbh->lastInsertId();
		$dbh = null;
		if (wrk_sourcemount($db,'mount',$newmountID)) {
		$return = 1;
		} else {
		$return = 0;
		}
		break;
		
		case 'edit':
		$dbh = cfgdb_connect($db);
		$mp = cfgdb_read('cfg_source',$dbh,'',$queueargs['mount']['id']);
		cfgdb_update('cfg_source',$dbh,'',$queueargs['mount']);	
		sysCmd("umount -f \"/mnt/MPD/".$mp[0]['name']."\"");
			if ($mp[0]['name'] != $queueargs['mount']['name']) {
			sysCmd("rmdir \"/mnt/MPD/".$mp[0]['name']."\"");
			sysCmd("mkdir \"/mnt/MPD/".$queueargs['mount']['name']."\"");
			}
		if (wrk_sourcemount($db,'mount',$queueargs['mount']['id'])) {
		$return = 1;
		} else {
		$return = 0;
		}
		runelog('wrk_sourcecfg(edit) exit status',$return);
		$dbh = null;
		break;
		
		case 'delete':
		$dbh = cfgdb_connect($db);
		$mp = cfgdb_read('cfg_source',$dbh,'',$queueargs['mount']['id']);
		sysCmd("umount -f \"/mnt/MPD/".$mp[0]['name']."\"");
		sleep(3);
		sysCmd("rmdir \"/mnt/MPD/".$mp[0]['name']."\"");
		if (cfgdb_delete('cfg_source',$dbh,$queueargs['mount']['id'])) {
		$return = 1;
		} else {
		$return = 0;
		}
		$dbh = null;
		break;
	}

return $return;
}

function wrk_getHwPlatform() {
$file = '/proc/cpuinfo';
	$fileData = file($file);
	foreach($fileData as $line) {
		if (substr($line, 0, 8) == 'Hardware') {
			$arch = trim(substr($line, 11, 50));
			// debug
			runelog('wrk_getHwPlatform() /proc/cpu string',$arch);
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
					$arch = '03';
					break;
					
					// BeagleBone Black
					case 'Generic AM33XX (Flattened Device Tree)':
					$arch = '04';
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

function wrk_setHwPlatform($db) {
$arch = wrk_getHwPlatform();
$playerid = wrk_playerID($arch);
// register playerID into database
playerSession('write',$db,'playerid',$playerid);
// register platform into database
	switch($arch) {
		case '01':
		playerSession('write',$db,'hwplatform','RaspberryPi');
		playerSession('write',$db,'hwplatformid',$arch);
		break;
		
		case '02':
		playerSession('write',$db,'hwplatform','UDOO');
		playerSession('write',$db,'hwplatformid',$arch);
		break;
		
		case '03':
		playerSession('write',$db,'hwplatform','CuBox');
		playerSession('write',$db,'hwplatformid',$arch);
		break;
		
		case '04':
		playerSession('write',$db,'hwplatform','BeagleBone Black');
		playerSession('write',$db,'hwplatformid',$arch);
		break;
		
		default:
		playerSession('write',$db,'hwplatform','unknown');
		playerSession('write',$db,'hwplatformid',$arch);

	}
}

function wrk_playerID($arch) {
// $playerid = $arch.md5(uniqid(rand(), true)).md5(uniqid(rand(), true));
$playerid = $arch.md5_file('/sys/class/net/eth0/address');
return $playerid;
}

function wrk_sysChmod() {
sysCmd('chmod -R 777 /var/www/db');
sysCmd('chmod a+x /var/www/command/orion_optimize.sh');
sysCmd('chmod 777 /run');
sysCmd('chmod 777 /run/sess*');
sysCmd('chmod a+rw /etc/mpd.conf');
sysCmd('chmod a+rw /etc/mpdscribble.conf');
}

function wrk_sysEnvCheck($arch,$install) {
	if ($arch == '01' OR $arch == '02' OR $arch == '03' OR $arch == '04' ) {
	 // /etc/rc.local
	 $a = '/etc/rc.local';
	 $b = '/var/www/_OS_SETTINGS/etc/rc.local';
	 if (md5_file($a) != md5_file($b)) {
	 sysCmd('cp '.$b.' '.$a);
	 }
	 
	 // /etc/samba/smb.conf
	 $a = '/etc/samba/smb.conf';
	 $b = '/var/www/_OS_SETTINGS/etc/samba/smb.conf';
	 if (md5_file($a) != md5_file($b)) {
	 sysCmd('cp '.$b.' '.$a.' ');
	 }
	 // /etc/nginx.conf
	 $a = '/etc/nginx/nginx.conf';
	 $b = '/var/www/_OS_SETTINGS/etc/nginx/nginx.conf';
	 if (md5_file($a) != md5_file($b)) {
	 sysCmd('cp '.$b.' '.$a.' ');
	 // stop nginx
	 sysCmd('killall -9 nginx');
	 // start nginx
	 sysCmd('nginx');
	 }
	 // /etc/php5/cli/php.ini
	 $a = '/etc/php5/cli/php.ini';
	 $b = '/var/www/_OS_SETTINGS/etc/php5/cli/php.ini';
	 if (md5_file($a) != md5_file($b)) {
	 sysCmd('cp '.$b.' '.$a.' ');
	 $restartphp = 1;
	 }
	 // /etc/php5/fpm/php-fpm.conf
	 $a = '/etc/php5/fpm/php-fpm.conf';
	 $b = '/var/www/_OS_SETTINGS/etc/php5/fpm/php-fpm.conf';
	 if (md5_file($a) != md5_file($b)) {
	 sysCmd('cp '.$b.' '.$a.' ');
	 $restartphp = 1;
	 }
	 // /etc/php5/fpm/php.ini
	 $a = '/etc/php5/fpm/php.ini';
	 $b = '/var/www/_OS_SETTINGS/etc/php5/fpm/php.ini';
	 if (md5_file($a) != md5_file($b)) {
	 sysCmd('cp '.$b.' '.$a.' ');
	 $restartphp = 1;
	 }
	 
		if ($install == 1) {
		 // remove autoFS for NAS mount
		 sysCmd('cp /var/www/_OS_SETTINGS/etc/auto.master /etc/auto.master');
		 sysCmd('rm /etc/auto.nas');
		 sysCmd('systemctl restart autofs');
		 // /etc/php5/mods-available/apc.ini
		 sysCmd('cp /var/www/_OS_SETTINGS/etc/php5/mods-available/apc.ini /etc/php5/mods-available/apc.ini');
		 // /etc/php5/fpm/pool.d/ erase
		 sysCmd('rm /etc/php5/fpm/pool.d/*');
		 // /etc/php5/fpm/pool.d/ copy
		 sysCmd('cp /var/www/_OS_SETTINGS/etc/php5/fpm/pool.d/* /etc/php5/fpm/pool.d/');
		 $restartphp = 1;
		}
		
	 // /etc/php5/fpm/pool.d/command.conf
	 $a = '/etc/php5/fpm/pool.d/command.conf';
	 $b = '/var/www/_OS_SETTINGS/etc/php5/fpm/pool.d/command.conf';
	 if (md5_file($a) != md5_file($b)) {
	 sysCmd('cp '.$b.' '.$a.' ');
	 $restartphp = 1;
	 }
	 // /etc/php5/fpm/pool.d/db.conf
	 $a = '/etc/php5/fpm/pool.d/db.conf';
	 $b = '/var/www/_OS_SETTINGS/etc/php5/fpm/pool.d/db.conf';
	 if (md5_file($a) != md5_file($b)) {
	 sysCmd('cp '.$b.' '.$a.' ');
	 $restartphp = 1;
	 }
	 // /etc/php5/fpm/pool.d/display.conf
	 $a = '/etc/php5/fpm/pool.d/display.conf';
	 $b = '/var/www/_OS_SETTINGS/etc/php5/fpm/pool.d/display.conf';
	 if (md5_file($a) != md5_file($b)) {
	 sysCmd('cp '.$b.' '.$a.' ');
	 $restartphp = 1;
	 }
		// (RaspberryPi arch)
		if ($arch == '01') {
			$a = '/boot/cmdline.txt';
			$b = '/var/www/_OS_SETTINGS/boot/cmdline.txt';
			if (md5_file($a) != md5_file($b)) {
			sysCmd('cp '.$b.' '.$a.' ');
			// /etc/fstab
			$a = '/etc/fstab';
			$b = '/var/www/_OS_SETTINGS/etc/fstab_raspberry';
			if (md5_file($a) != md5_file($b)) {
				sysCmd('cp '.$b.' '.$a.' ');
				$reboot = 1;
				}
			}
		}
		if (isset($restartphp) && $restartphp == 1) {
		sysCmd('service php5-fpm restart');
		}
		if (isset($reboot) && $reboot == 1) {
		sysCmd('reboot');
		}
	}	
}

function wrk_NTPsync($db,$newserver) {
$dbh = cfgdb_connect($db);
// update NTP server in SQLite datastore
	if (!empty($newserver)){
			$key = 'server';
			$value['value'] = $newserver ;
			$value['plugin_name'] = 'ntp';
			cfgdb_update('cfg_plugins',$dbh,$key,$value);
	}
$param['plugin_name'] = 'ntp';
$param['plugin_param'] = 'server'; 
$ntp = cfgdb_read('cfg_plugins',$dbh,$param);
$dbh = null;
// debug
runelog('NTP SERVER',$ntp[0]['value']);
	if (sysCmd('ntpdate '.$ntp[0]['value'])) {
		return $ntp[0]['value'];
	} else {
		return false;
	}
}

function wrk_changeHostname($db,$newhostname) {
// change system hostname
sysCmd('hostnamectl set-hostname '.$newhostname);
// restart avahi-daemon
sysCmd('systemctl restart avahi-daemon');
// reconfigure MPD
sysCmd('systemctl stop mpd');
$dbh = cfgdb_connect($db);
cfgdb_update('cfg_mpd',$dbh,'zeroconf_name',$newhostname);
$dbh = null;
wrk_mpdconf('/etc',$db);
// restart MPD
sysCmd('systemctl start mpd');
// restart SAMBA << TODO: use systemd!!!
sysCmd('killall -HUP smbd && killall -HUP nmbd');
// restart MiniDLNA
}

function alsa_findHwMixerControl($cardID) {
$cmd = "amixer -c ".$cardID." |grep \"mixer control\"";
$str = sysCmd($cmd);
$hwmixerdev = substr(substr($str[0], 0, -(strlen($str[0]) - strrpos($str[0], "'"))), strpos($str[0], "'")+1);
return $hwmixerdev;
}

function ui_notify($notify) {
$output .= "<script>";
$output .= "jQuery(document).ready(function() {";
$output .= "$.pnotify.defaults.history = false;";
$output .= "$.pnotify({";
$output .= "title: '".$notify['title']."',";
$output .= "text: '".$notify['msg']."',";
$output .= "icon: 'icon-ok',";
$output .= "opacity: .9});";
$output .= "});";
$output .= "</script>";
echo $output;
}

function ui_lastFM_coverart($artist,$album,$lastfm_apikey) {
$url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=".$lastfm_apikey."&artist=".urlencode($artist)."&album=".urlencode($album)."&format=json";
// debug
//echo $url;
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$output = curl_exec($ch);
$output = json_decode($output,true);
curl_close($ch);

// debug
runelog('lastfm query URL',$url);
// -- REWORK NEEDED --
// runelog('lastfm response','');
// foreach($output as $line) {
// runelog('',var_dump($line));
// }

// key [3] == extralarge last.fm image
// key [4] == mega last.fm image
return $output['album']['image'][3]['#text'];
}

// ACX Functions
function sezione() {
	echo '<pre><strong>sezione</strong> = '.$GLOBALS['sezione'].'</pre>';
}

function ami($sz=null) {
	switch ($sz) {
		case 'index':
			echo (in_array($GLOBALS['sezione'], array(
				'index'
				))?'active':'');
			break;
		case 'sources':
			echo (in_array($GLOBALS['sezione'], array(
				'sources', 'sources-add', 'sources-edit'
				))?'active':'');
			break;
		case 'mpd-config':
			echo (in_array($GLOBALS['sezione'], array(
				'mpd-config'
				))?'active':'');
			break;
		case 'mpd-config-network':
			echo (in_array($GLOBALS['sezione'], array(
				'mpd-config-network'
				))?'active':'');
			break;
		case 'system':
			echo (in_array($GLOBALS['sezione'], array(
				'system'
				))?'active':'');
			break;
		case 'help':
			echo (in_array($GLOBALS['sezione'], array(
				'help'
				))?'active':'');
			break;
		case 'credits':
			echo (in_array($GLOBALS['sezione'], array(
				'credits'
				))?'active':'');
			break;
	}	
}

function current_item($sez=null) {
	echo (($GLOBALS['sezione'] == $sez)?' class="current"':'');
}
// end ACX Functions
