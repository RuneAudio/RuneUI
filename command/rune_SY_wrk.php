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
 *  file: command/rune_SY_wrk.php
 *  version: 1.2
 *
 */
 
// common include
$start = microtime(true);
ini_set('display_errors', '1');
ini_set('error_reporting', 1);
ini_set('error_log','/var/log/runeaudio/rune_SY_wrk.log');
include('/var/www/inc/player_lib.php');
// reset worker logfile
sysCmd('echo "--------------- start: rune_SY_wrk.php ---------------" > /var/log/runeaudio/rune_SY_wrk.log');
runelog("WORKER rune_SY_wrk.php STARTING...",'');
$db = 'sqlite:/var/www/db/player.db';

// DEMONIZE --- //
runelog("DEMONIZE ---",'');
	$lock = fopen('/run/rune_SY_wrk.pid', 'c+');
	if (!flock($lock, LOCK_EX | LOCK_NB)) {
		die('already running');
	}
	 
	switch ($pid = pcntl_fork()) {
		case -1:
			die('unable to fork');
		case 0: // this is the child process
			break;
		default: // otherwise this is the parent process
			fseek($lock, 0);
			ftruncate($lock, 0);
			fwrite($lock, $pid);
			fflush($lock);
			exit;
	}
	 
	if (posix_setsid() === -1) {
		 die('could not setsid');
	}
	 
	fclose(STDIN);
	fclose(STDOUT);
	fclose(STDERR);

	$stdIn = fopen('/dev/null', 'r'); // set fd/0
	$stdOut = fopen('/dev/null', 'w'); // set fd/1
	$stdErr = fopen('php://stdout', 'w'); // a hack to duplicate fd/1 to 2

	pcntl_signal(SIGTSTP, SIG_IGN);
	pcntl_signal(SIGTTOU, SIG_IGN);
	pcntl_signal(SIGTTIN, SIG_IGN);
	pcntl_signal(SIGHUP, SIG_IGN);
	
runelog("--- DEMONIZE",'');
// --- DEMONIZE //

// INITIALIZE ENVIRONMENT --- //
runelog("INITIALIZE ENVIRONMENT ---",'');
// change /run and session files for correct session file locking
sysCmd('chmod 777 /run');

// reset DB permission
sysCmd('chmod -R 777 /var/www/db');

// initialize CLI session
session_save_path('/run');

// inpect session
playerSession('open',$db,'','');

// prime PHP 5.5 Opcache
wrk_opcache('prime');

// reset session file permissions
sysCmd('chmod 777 /run/sess*');

// mount all sources
wrk_sourcemount($db,'mountall');

// start MPD daemon
//sysCmd("systemctl start mpd");

// check Architecture
$arch = wrk_getHwPlatform();

if ($arch != $_SESSION['hwplatformid']) {
// reset playerID if architectureID not match. This condition "fire" another first-run process
playerSession('write',$db,'playerid','');
}

if (isset($_SESSION['playerid']) && $_SESSION['playerid'] == '') {
// RUNEAUDIO FIRST RUN PROCESS --- //
runelog("RUNEAUDIO FIRST RUN PROCESS ---",'');

	// register HW architectureID and playerID
	runelog("register HW architectureID and playerID",'');
	wrk_setHwPlatform($db);
	// destroy actual session
	runelog("destroy actual session",'');
	playerSession('destroy',$db,'','');
	// reload session data
	playerSession('open',$db,'','');
	runelog("reload session data",'');
	// reset ENV parameters
	//runelog("reset ENV parameters",'');
	//wrk_sysChmod();

	// reset netconf to defaults
	runelog("reset netconf to defaults",'');
	$value = array('ssid' => '', 'encryption' => '', 'password' => '');
	$dbh = cfgdb_connect($db);
	cfgdb_update('cfg_wifisec',$dbh,'',$value);
	// reset eth0 netctl profile
	sysCmd('cp /var/www/_OS_SETTINGS/etc/netctl/eth0 /etc/netctl/');
	// update hash
	$hash = md5_file('/etc/netctl/eth0');
	playerSession('write',$db,'netconfhash',$hash);
	// update systemd eth0 configuration
	sysCmd('netctl disable eth0');
	sysCmd('netctl enable eth0');
	sysCmd('systemctl disable netctl@eth0');
	sysCmd('systemctl disable samba');
	// restart eth0
	runelog("restart eth0",'');
	sysCmd('netctl restart eth0');

	// restart wlan0 interface
/*
		if (strpos($netconf, 'wlan0') != false) {
		$cmd = "ip addr list wlan0 |grep \"inet \" |cut -d' ' -f6|cut -d/ -f1";
		$ip_wlan0 = sysCmd($cmd);
			if (!empty($ip_wlan0[0])) {
			$_SESSION['netconf']['wlan0']['ip'] = $ip_wlan0[0];
			} else {
				if (wrk_checkStrSysfile('/proc/net/wireless','wlan0')) {
				$_SESSION['netconf']['wlan0']['ip'] = '--- NO IP ASSIGNED ---';
				} else {
				$_SESSION['netconf']['wlan0']['ip'] = '--- NO INTERFACE PRESENT ---';
				}
			}
		}
	sysCmd('service networking restart');
*/

	// reset sourcecfg to defaults
	runelog("reset sourcecfg to defaults",'');
	wrk_sourcecfg($db,'reset');
	sendMpdCommand($mpd,'update');

	// reset mpdconf to defaults
	runelog("reset mpdconf to defaults",'');
	$mpdconfdefault = cfgdb_read('',$dbh,'mpdconfdefault');
	foreach($mpdconfdefault as $element) {
		cfgdb_update('cfg_mpd',$dbh,$element['param'],$element['value_default']);
	}
	// tell worker to write new MPD config
	wrk_mpdconf('/etc',$db);
	// update hash
	$hash = md5_file('/etc/mpd.conf');
	playerSession('write',$db,'mpdconfhash',$hash);
	runelog("restart MPD",'');
	sysCmd('systemctl restart mpd');
	// restart mpdscribble
	if ($_SESSION['scrobbling_lastfm'] == 1) {
	runelog("restart MPDSCRIBBLE",'');
	sysCmd('systemctl restart mpdscribble');
	}
	sleep(1);
	wrk_setMpdStartOut($arch);
	$dbh = null;

	// system ENV files check and replace
	// runelog("system ENV files check and replace",'');
	//	wrk_sysEnvCheck($arch,1);

runelog("--- RUNEAUDIO FIRST RUN PROCESS",'');
// invoke rune_SY_wrk.php respawn
sysCmd('systemctl restart rune_SY_wrk');
// --- RUNEAUDIO FIRST RUN PROCESS //

} else {

runelog("--- INITIALIZE ENVIRONMENT",'');
// --- INITIALIZE ENVIRONMENT //

// NORMAL STARTUP --- //
runelog('NORMAL STARTUP ---','');
// NTP sync
$start2 = microtime(true);
$firstlap = $start2-$start;
runelog("NTP sync",'');
$_SESSION['ntpserver'] = wrk_NTPsync($db);
$start3 = microtime(true);
// check HOSTNAME << TODO: integrate in wrk_sysEnvCheck >>
$hn = sysCmd('hostname');
$_SESSION['hostname'] = $hn[0]; 

	// check ENV files
	if ($arch != '--') {
//	wrk_sysOBEnvCheck($arch,0);
	}
// start samba
runelog("service: SAMBA start",'');
sysCmd('/usr/sbin/smbd -D --configfile=/var/www/_OS_SETTINGS/etc/samba/smb.conf');
sysCmd('/usr/sbin/nmbd -D --configfile=/var/www/_OS_SETTINGS/etc/samba/smb.conf');
}

// start shairport
if (isset($_SESSION['airplay']) && $_SESSION['airplay'] == 1) {
runelog("service: SHAIRPORT start",'');
sysCmd('systemctl start shairport');
}
// start udevil
if (isset($_SESSION['udevil']) && $_SESSION['udevil'] == 1) {
runelog("service: UDEVIL start",'');
sysCmd('systemctl start udevil');
}
// start mpdscribble
if ($_SESSION['scrobbling_lastfm'] == 1) {
runelog("service: MPDSCRIBBLE start",'');
sysCmd('systemctl start mpdscribble');
}

// start rpi volume switch helpers
if ($_SESSION['hwplatformid'] == '01') {
runelog("helpers: rune_rpi_oJack/rune_rpi_oHdmi start",'');
sysCmd('systemctl start rune_rpi_oJack');
sysCmd('systemctl start rune_rpi_oHdmi');
// AnalogJack / HDMI selection
	if ($_SESSION['ao'] == 2 OR $_SESSION['ao'] == 3) {
		sleep(1);
		// AnalogJack
		if ($_SESSION['ao'] == 2) {
		$aosock = openMpdSocket('127.0.0.1', 13501);
		} 
		if ($_SESSION['ao'] == 3) {
		// HDMI
		$aosock = openMpdSocket('127.0.0.1', 13502);
		}
		sendMpdCommand($aosock,"\n");
		runelog('selected Rpi jack/hdmi internal switch:',$_SESSION['ao']);
		fclose($aosock);	
	}
}

// inizialize worker session vars
runelog("env: SETUP SESSION VARS",'');

//if (!isset($_SESSION['w_queue']) OR $_SESSION['w_queue'] == 'workerrestart') { $_SESSION['w_queue'] = ''; }
$_SESSION['w_queue'] = '';
$_SESSION['w_queueargs'] = '';
$_SESSION['w_lock'] = 0;
//if (!isset($_SESSION['w_active'])) { $_SESSION['w_active'] = 0; }
$_SESSION['w_active'] = 0;
$_SESSION['w_jobID'] = '';
// inizialize debug
$_SESSION['debug'] = 0;
$_SESSION['debugdata'] = '';


// check current eth0 / wlan0 IP Address
$cmd1 = "ip addr list eth0 |grep \"inet \" |cut -d' ' -f6|cut -d/ -f1";
$cmd2 = "ip addr list wlan0 |grep \"inet \" |cut -d' ' -f6|cut -d/ -f1";
$cmd3 = "ip addr list eth0:0 |grep \"inet \" |cut -d' ' -f6|cut -d/ -f1";
$ip_eth0 = sysCmd($cmd1);
$ip_wlan0 = sysCmd($cmd2);
$ip_fallback = "192.168.10.110";

// check IP for minidlna assignment.
if (isset($ip_eth0) && !empty($ip_eth0) && isset($ip_wlan0) && !empty($ip_wlan0)) {
$ip = $ip_eth0[0];
} else  if (isset($ip_eth0) && !empty($ip_eth0)) {
$ip = $ip_eth0[0];
} else if (isset($ip_wlan0) && !empty($ip_wlan0)) {
$ip = $ip_wlan0[0];
} else {
$ip = $ip_fallback;
}

// record current IP addresses in PHP session
if (!empty($ip_eth0[0])) {
$_SESSION['netconf']['eth0']['ip'] = $ip_eth0[0];
}
if (!empty($ip_wlan0[0])) {
$_SESSION['netconf']['wlan0']['ip'] = $ip_wlan0[0];
}

// Copy /etc/minidlna.conf to /run/minidlna.conf
copy('/etc/minidlna.conf', '/run/minidlna.conf');
// minidlna.conf
$file = '/run/minidlna.conf';
$fileData = file($file);
$newArray = array();
foreach($fileData as $line) {
  // find the line that starts with 'presentation_url"
  if (substr($line, 0, 16) == 'presentation_url' OR substr($line, 1, 16) == 'presentation_url') {
	// replace presentation_url with current IP address
	$line = "presentation_url=http://".$ip.":80\n";
  }
  $newArray[] = $line;
}
// Commit changes to /run/minidlna.conf
$fp = fopen($file, 'w');
fwrite($fp, implode("",$newArray));
fclose($fp);
// Start minidlna service
sysCmd('/usr/bin/minidlna -f /run/minidlna.conf');

// check /etc/network/interfaces integrity
hashCFG('check_net',$db);
// check /etc/mpd.conf integrity
hashCFG('check_mpd',$db);
// check /etc/auto.nas integrity
// hashCFG('check_source',$db);

// unlock session files
playerSession('unlock',$db,'','');

// Cmediafix startup check
if (isset($_SESSION['cmediafix']) && $_SESSION['cmediafix'] == 1) {
	$mpd = openMpdSocket('localhost', 6600) ;
	sendMpdCommand($mpd,'cmediafix');
	closeMpdSocket($mpd);
}

// initialize OrionProfile
if ($_SESSION['dev'] == 0 OR empty($_SESSION['dev'])) {
// --- REWORK NEEDED ---
runelog("env: SET KERNEL PROFILE",$_SESSION['orionprofile']);
$cmd = "/var/www/command/orion_optimize.sh ".$_SESSION['orionprofile']." ".$_SESSION['hwplatformid'] ;
sysCmd($cmd);
}
 
runelog("--- NORMAL STARTUP",'');
// --- NORMAL STARTUP //

$start4 = microtime(true);
$starttime = ($start4-$start3)+$firstlap;
runelog("WORKER rune_SY_wrk.php STARTED in ".$starttime." seconds.",'');

runelog("WORKER MAIN LOOP ---",'');
// WORKER MAIN LOOP --- //
while (1) {
sleep(7);
session_start();
	// monitor loop
	if ($_SESSION['w_active'] == 1 && $_SESSION['w_lock'] == 0) {
	$_SESSION['w_lock'] = 1;
	
	// switch command queue for predefined jobs
	switch($_SESSION['w_queue']) {
	
		case 'hostname':
		wrk_changeHostname($db,$_SESSION['w_queueargs']);
		$hn = sysCmd('hostname');
		$_SESSION['hostname'] = $hn[0];
		// update hash
		$hash = md5_file('/etc/mpd.conf');
		playerSession('write',$db,'mpdconfhash',$hash);
		break;
		
		case 'ntpserver':
		$_SESSION['ntpserver'] = wrk_NTPsync($db,$_SESSION['w_queueargs']);
		break;

		case 'reboot':
		$cmd = 'systemctl --force reboot';
		sysCmd($cmd);
		break;
		
		case 'poweroff':
		$cmd = '/usr/local/sbin/unmountcifs.sh';
		sysCmd($cmd);
		$cmd = 'sync';
		sysCmd($cmd);
		$cmd = 'systemctl --force poweroff';
		sysCmd($cmd);
		break;
		
		case 'mpdrestart':
		sysCmd('systemctl stop mpd');
		sleep(1);
		sysCmd('systemctl start mpd');
		// restart mpdscribble
		if ($_SESSION['scrobbling_lastfm'] == 1) {
		sysCmd('systemctl restart mpdscribble');
		}
		break;
		
		case 'phprestart':
		$cmd = 'systemctl restart php-fpm';
		sysCmd($cmd);
		break;
		
		case 'workerrestart':
		$cmd = 'systemctl restart rune_SY_wrk';
		sysCmd($cmd);
		break;
		
		case 'clearimg':
		// Clean IMG
		runelog('Clean IMG','');
		// enable OPcache
		wrk_opcache('enable');
		wrk_cleanDistro();
		break;
		
		case 'syschmod':
		wrk_syschmod();
		break;

		case 'backup':
		$_SESSION[$_SESSION['w_jobID']] = wrk_backup();
		break;

		case 'totalbackup':
		$_SESSION[$_SESSION['w_jobID']] = wrk_backup('dev');
		break;
		
		case 'restore':
		$path = "/run/".$_SESSION['w_queueargs'];
		wrk_restore($path);
		break;
		
		case 'orionprofile':
		if ($_SESSION['dev'] == 1) {
		$_SESSION['w_queueargs'] = 'dev';
		}
		runelog("env: SET KERNEL PROFILE",$_SESSION['orionprofile']);
		$cmd = "/var/www/command/orion_optimize.sh ".$_SESSION['w_queueargs'];
		sysCmd($cmd);
		break;
		
		case 'airplay':
		if ($_SESSION['w_queueargs'] == 'start') {
		runelog("service: SHAIRPORT start",'');
		sysCmd('systemctl start shairport');
		}
		if ($_SESSION['w_queueargs'] == 'stop') {
		runelog("service: SHAIRPORT stop",'');
		sysCmd('systemctl stop shairport');
		}
		break;

		case 'udevil':
		if ($_SESSION['w_queueargs'] == 'start') {
		runelog("service: UDEVIL start",'');
		sysCmd('systemctl start udevil');
		}
		if ($_SESSION['w_queueargs'] == 'stop') {
		runelog("service: UDEVIL stop",'');
		sysCmd('systemctl stop udevil');
		}
		break;

		case 'scrobbling_lastfm':
		if ($_SESSION['w_queueargs']['action'] == 'start') {
			if (isset($_SESSION['w_queueargs']['lastfm'])) {
			// mpdscribble.conf
			$file = '/etc/mpdscribble.conf';
			$newArray = wrk_replaceTextLine($file,'','username =','username = '.$_SESSION['w_queueargs']['lastfm']['user'],'last.fm',2);
			$newArray = wrk_replaceTextLine('',$newArray,'password =','password = '.$_SESSION['w_queueargs']['lastfm']['pass'],'last.fm',3);
			// Commit changes to /etc/mpdscribble.conf
			$fp = fopen($file, 'w');
			fwrite($fp, implode("",$newArray));
			fclose($fp);
			// write LastFM auth data to SQLite datastore
			setLastFMauth($db,$_SESSION['w_queueargs']['lastfm']);
			}
		sysCmd('systemctl stop mpdscribble');
		runelog("service: MPDSCRIBBLE start",'');
		sysCmd('systemctl start mpdscribble');
		}
		if ($_SESSION['w_queueargs']['action'] == 'stop') {
		runelog("service: MPDSCRIBBLE stop",'');
		sysCmd('systemctl stop mpdscribble');
		}
		break;
		
		case 'netcfg':
		$file = '/etc/netctl/eth0';
		$fp = fopen($file, 'w');
		$netconf = $_SESSION['w_queueargs'];
		fwrite($fp, $netconf);
		fclose($fp);
		// update hash
		$hash = md5_file('/etc/netctl/eth0');
		playerSession('write',$db,'netconfhash',$hash);
		// update systemd eth0 configuration
		sysCmd('netctl reenable eth0');
		// restart eth0
		sysCmd('netctl restart eth0');
		// --- CODE REWORK NEEDED ---
			if (strpos($netconf, 'wlan0') != false) {
			$cmd = "ip addr list wlan0 |grep \"inet \" |cut -d' ' -f6|cut -d/ -f1";
			$ip_wlan0 = sysCmd($cmd);
				if (!empty($ip_wlan0[0])) {
				$_SESSION['netconf']['wlan0']['ip'] = $ip_wlan0[0];
				} else {
					if (wrk_checkStrSysfile('/proc/net/wireless','wlan0')) {
					$_SESSION['netconf']['wlan0']['ip'] = '--- NO IP ASSIGNED ---';
					} else {
					$_SESSION['netconf']['wlan0']['ip'] = '--- NO INTERFACE PRESENT ---';
					}
				}
			}
		// --- CODE REWORK NEEDED ---
		break;
		
		case 'netcfgman':
		$file = '/etc/network/interfaces';
		$fp = fopen($file, 'w');
		fwrite($fp, $_SESSION['w_queueargs']);
		fclose($fp);
		//-- valutare inserimento reboot device o restart network
		break;
		
		case 'mpdcfg':
		runelog('Stop MPD daemon','');
		sysCmd('systemctl stop mpd');
		runelog('Reset MPD configuration','');
		wrk_mpdconf('/etc',$db);
		// update hash
		$hash = md5_file('/etc/mpd.conf');
		runelog('Start MPD daemon','');
		sysCmd('systemctl start mpd');
		playerSession('write',$db,'mpdconfhash',$hash);
		// restart mpdscribble
		if ($_SESSION['scrobbling_lastfm'] == 1) {
		sysCmd('systemctl restart mpdscribble');
		}
		runelog('wrk_setMpdStartOut($archID)',$_SESSION['hwplatformid']);
		sleep(1);
		wrk_setMpdStartOut($_SESSION['hwplatformid']);
		break;
		
		case 'mpdcfgman':
		// write mpd.conf file
		sysCmd('systemctl stop mpd');
		$fh = fopen('/etc/mpd.conf', 'w');
		fwrite($fh, $_SESSION['w_queueargs']);
		fclose($fh);
		sysCmd('systemctl start mpd');
		// restart mpdscribble
		if ($_SESSION['scrobbling_lastfm'] == 1) {
		sysCmd('systemctl restart mpdscribble');
		}
		break;
		
		case 'sourcecfg':
		wrk_sourcecfg($db,$_SESSION['w_queueargs']);
		break;
		
		case 'opcache':
		// Restart PHP service
		if ($_SESSION['w_queueargs'] == 1) {
		wrk_opcache('enable');
		runelog('PHP 5.5 OPcache enabled','');
		sysCmd('systemctl restart php-fpm');
		wrk_opcache('forceprime');
		} else {
		wrk_opcache('disable');
		runelog('PHP 5.5 OPcache disabled','');
		sysCmd('systemctl restart php-fpm');
		}
		playerSession('write',$db,'opcache',$_SESSION['w_queueargs']);
		break;
		
	}
	// reset locking and command queue
	$_SESSION['w_queue'] = '';
	$_SESSION['w_queueargs'] = '';
	$_SESSION['w_jobID'] = '';
	$_SESSION['w_active'] = 0;
	$_SESSION['w_lock'] = 0;
	}
session_write_close();
}
runelog("--- WORKER MAIN LOOP",'');
// --- WORKER MAIN LOOP //
?>
