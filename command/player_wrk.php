#!/usr/bin/php
<?php
/*
 * Copyright (C) 2013 RuneAudio Team
 * http://www.runeaudio.com
 *
 * RuneUI
 * copyright (C) 2013 – Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)
 *
 * RuneOS
 * copyright (C) 2013 – Carmelo San Giovanni (aka Um3ggh1U)
 *
 * RuneAudio website and logo
 * copyright (C) 2013 – ACX webdesign (Andrea Coiutti)
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
 *  file: player_wrk.php
 *  version: 1.1
 *
 */
 
// common include
include('/var/www/inc/player_lib.php');
ini_set('display_errors', '1');
ini_set('error_log','/var/log/php_errors.log');
$db = 'sqlite:/var/www/db/player.db';

// --- DEMONIZE ---
	$lock = fopen('/run/player_wrk.pid', 'c+');
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
// --- DEMONIZE --- //

// --- INITIALIZE ENVIRONMENT --- //
// change /run and session files for correct session file locking
sysCmd('chmod 777 /run');

// reset DB permission
sysCmd('chmod -R 777 /var/www/db');

// initialize CLI session
session_save_path('/run');

// inpect session
playerSession('open',$db,'','');

// reset session file permissions
sysCmd('chmod 777 /run/sess*');

// mount all sources
wrk_sourcemount($db,'mountall');

// start MPD daemon
//sysCmd("systemctl start mpd");

// check Architecture
$arch = wrk_getHwPlatform();
if ($arch != $_SESSION['hwplatformid']) {
// reset playerID if architectureID not match. This condition "fire" another first-install process
playerSession('write',$db,'playerid','');
}
// --- INITIALIZE ENVIRONMENT --- //


// --- PLAYER FIRST INSTALLATION PROCESS --- //

	if (isset($_SESSION['playerid']) && $_SESSION['playerid'] == '') {
	// register HW architectureID and playerID
	wrk_setHwPlatform($db);
	// destroy actual session
	playerSession('destroy',$db,'','');
	// reload session data
	playerSession('open',$db,'','');
	// reset ENV parameters
	wrk_sysChmod();

	// reset netconf to defaults
/*
	$value = array('ssid' => '', 'encryption' => '', 'password' => '');
	$dbh = cfgdb_connect($db);
	cfgdb_update('cfg_wifisec',$dbh,'',$value);
	$file = '/etc/network/interfaces';
	$fp = fopen($file, 'w');
	$netconf = "auto lo\n";
	$netconf .= "iface lo inet loopback\n";
	$netconf .= "\n";
	$netconf .= "auto eth0\n";
	$netconf .= "iface eth0 inet dhcp\n";
	$netconf .= "\n";
	$netconf .= "auto wlan0\n";
	$netconf .= "iface wlan0 inet dhcp\n";
	fwrite($fp, $netconf);
	fclose($fp);
*/
	// update hash
//	$hash = md5_file('/etc/network/interfaces');
//	playerSession('write',$db,'netconfhash',$hash);
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
	wrk_sourcecfg($db,'reset');
	sendMpdCommand($mpd,'update');

	// reset mpdconf to defaults
	$mpdconfdefault = cfgdb_read('',$dbh,'mpdconfdefault');
	foreach($mpdconfdefault as $element) {
		cfgdb_update('cfg_mpd',$dbh,$element['param'],$element['value_default']);
	}
		// tell worker to write new MPD config
	wrk_mpdconf('/etc',$db);
		// update hash
	$hash = md5_file('/etc/mpd.conf');
	playerSession('write',$db,'mpdconfhash',$hash);
	sysCmd('systemctl restart mpd');
	$dbh = null;

	// disable minidlna / samba / MPD startup
	sysCmd("update-rc.d -f minidlna remove");
	sysCmd("update-rc.d -f ntp remove");
	sysCmd("update-rc.d -f smbd remove");
	sysCmd("update-rc.d -f nmbd remove");
	sysCmd("update-rc.d -f mpd remove");
	sysCmd("echo 'manual' > /etc/init/minidlna.override");
	sysCmd("echo 'manual' > /etc/init/ntp.override");
	sysCmd("echo 'manual' > /etc/init/smbd.override");
	sysCmd("echo 'manual' > /etc/init/nmbd.override");
	sysCmd("echo 'manual' > /etc/init/mpd.override");
	// system ENV files check and replace
//	wrk_sysEnvCheck($arch,1);
	// stop services
	sysCmd('systemctl stop minidlna');
	sysCmd('systemctl ntp minidlna');
	sysCmd('systemctl stop samba');
	sysCmd('systemctl stop mpd');
	sysCmd('/usr/sbin/smbd -D --configfile=/var/www/_OS_SETTINGS/etc/samba/smb.conf');
	sysCmd('/usr/sbin/nmbd -D --configfile=/var/www/_OS_SETTINGS/etc/samba/smb.conf');
// --- PLAYER FIRST INSTALLATION PROCESS --- //


// --- NORMAL STARTUP --- //
} else {
	// check ENV files
	if ($arch != '--') {
//	wrk_sysOBEnvCheck($arch,0);
	}
// start samba
sysCmd('/usr/sbin/smbd -D --configfile=/var/www/_OS_SETTINGS/etc/samba/smb.conf');
sysCmd('/usr/sbin/nmbd -D --configfile=/var/www/_OS_SETTINGS/etc/samba/smb.conf');
}

// inizialize worker session vars
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

// initialize OrionProfile
if ($_SESSION['dev'] == 0) {
// --- REWORK NEEDED ---
$cmd = "/var/www/command/orion_optimize.sh ".$_SESSION['orionprofile']." startup" ;
sysCmd($cmd);
}

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
// --- NORMAL STARTUP --- //

// --- WORKER MAIN LOOP --- //
while (1) {
sleep(7);
session_start();
	// monitor loop
	if ($_SESSION['w_active'] == 1 && $_SESSION['w_lock'] == 0) {
	$_SESSION['w_lock'] = 1;
	
	// switch command queue for predefined jobs
	switch($_SESSION['w_queue']) {

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
		break;
		
		case 'phprestart':
		$cmd = 'systemctl restart php-fpm';
		sysCmd($cmd);
		break;
		
		case 'workerrestart':
		$cmd = 'killall player_wrk.php';
		sysCmd($cmd);
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
		$cmd = "/var/www/command/orion_optimize.sh ".$_SESSION['w_queueargs'];
		sysCmd($cmd);
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
		wrk_mpdconf('/etc',$db);
		// update hash
		$hash = md5_file('/etc/mpd.conf');
		playerSession('write',$db,'mpdconfhash',$hash);
		sysCmd('systemctl stop mpd');
		sysCmd('systemctl start mpd');
		break;
		
		case 'mpdcfgman':
		// write mpd.conf file
		$fh = fopen('/etc/mpd.conf', 'w');
		fwrite($fh, $_SESSION['w_queueargs']);
		fclose($fh);
		sysCmd('killall mpd');
		sysCmd('systemctl start mpd');
		break;
		
		case 'sourcecfg':
		wrk_sourcecfg($db,$_SESSION['w_queueargs']);
		// rel 1.0 autoFS
		// if (sysCmd('service autofs restart')) {
		// sleep(3);
		// $mpd = openMpdSocket('localhost', 6600);
		// sendMpdCommand($mpd,'update');
		// closeMpdSocket($mpd);
		// }
		break;
		
		// rel 1.0 autoFS
		// case 'sourcecfgman':
		// if ($_SESSION['w_queueargs'] == 'sourcecfgreset') {
		// wrk_sourcecfg($db,'reset');
		// } else {
		// wrk_sourcecfg($db,'manual',$_SESSION['w_queueargs']);
		// }
		// if (sysCmd('service autofs restart')) {
		// sysCmd('service autofs restart');
		// sleep(3);
		// $mpd = openMpdSocket('localhost', 6600);
		// sendMpdCommand($mpd,'update');
		// closeMpdSocket($mpd);
		// }
		// break;
		
		case 'enableapc':
		// apc.ini
		$file = "/etc/php5/fpm/conf.d/20-apc.ini";
		$fileData = file($file);
		$newArray = array();
		foreach($fileData as $line) {
		  // find the line that starts with 'presentation_url"
		  if (substr($line, 0, 8) == 'apc.stat') {
			// replace apc.stat with selected value
			$line = "apc.stat = ".$_SESSION['w_queueargs']."\n";
		  }
		  $newArray[] = $line;
		}
		// Commit changes to /etc/php5/fpm/conf.d/20-apc.ini
		$fp = fopen($file, 'w');
		fwrite($fp, implode("",$newArray));
		fclose($fp);
		// Restart PHP service
		sysCmd('systemctl restart php-fpm');
		playerSession('write',$db,'enableapc',$_SESSION['w_queueargs']);
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
// --- WORKER MAIN LOOP --- //
?>
