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
 *  file: wakeup_ctl.php
 *  version: 1.0
 *  coder: Jean-Baptiste Pillot
 *
 */
$template->al_notif = false;
if (isset($_POST)) {
	if (isset($_POST['alarm'])) {
		$cron = null;
		$cronline = "{minute}	{hour}	*	*	{weekday}	/var/www/command/{command} \"{playlist}\"\n";
		$alarmcfg = null;
		$globalenable = $_POST['alarm']['enable'] == 1 ? true : false;
		$alarmcfg['enable'] = $globalenable;
		$alarmcfg['alarms'] = array();
		$arr = array("mo", "tu", "we", "th", "fr", "sa", "su");
		foreach($arr as $value)
		{
			$line = $cronline;
			$startline = null;
			$stopline = null;
			
			$enable = $_POST['alarm'][$value]['enabled'] == "on" ? true : false;
			$starttime = $_POST['alarm'][$value]['starttime'];
			$duration = $_POST['alarm'][$value]['duration'];
			$playlist = $_POST['alarm'][$value]['playlist'];
			
			$starthour = explode(":", $starttime)[0];
			$startminute = explode(":", $starttime)[1];
			
			$now = new DateTime('NOW');
			$now->setTime($starthour, $startminute)->add(new DateInterval('PT'.$duration.'M'));
			
			$stophour = $now->format('H');
			$stopminute = $now->format('i');
				
			switch($value)
			{
				case "mo":
					$alarm['fullname'] = "Monday";
					$line = str_replace("{weekday}", "1", $line);
					break;
				case "tu":
					$alarm['fullname'] = "Tuesday";
					$line = str_replace("{weekday}", "2", $line);
					break;
				case "we":
					$alarm['fullname'] = "Wednesday";
					$line = str_replace("{weekday}", "3", $line);
					break;
				case "th":
					$alarm['fullname'] = "Thursday"; 
					$line = str_replace("{weekday}", "4", $line);
					break;
				case "fr": 
					$alarm['fullname'] = "Friday";
					$line = str_replace("{weekday}", "5", $line);
					break;
				case "sa":
					$alarm['fullname'] = "Saturday";
					$line = str_replace("{weekday}", "6", $line);
					break;
				case "su":
					$alarm['fullname'] = "Sunday";
					$line = str_replace("{weekday}", "0", $line);
					break;
			}
			
			$line = str_replace("{playlist}", $playlist, $line);
			
			$startline = str_replace("{command}", "play", $line);
			$startline = str_replace("{minute}", $startminute, $startline);
			$startline = str_replace("{hour}", $starthour, $startline);
			
			$stopline = str_replace("{command}", "stop", $line);
			$stopline = str_replace("{minute}", $stopminute, $stopline);
			$stopline = str_replace("{hour}", $stophour, $stopline);
				
			$alarm['shortname'] = $value;
			$alarm['enabled'] = $enable;
			$alarm['starttime'] = $starttime;
			$alarm['duration'] = $duration;
			$alarm['playlist'] = $playlist;
			array_push($alarmcfg['alarms'], $alarm);
			
			if($globalenable && $enable)
			{
				$cron .= $startline;
				//only add a stop if the end time is greater than start time
				if($starthour <= $stophour && $startminute < $stopminute)
				{
					$cron .= $stopline;
				}
			}
		}
		$content = json_encode($alarmcfg);
		
		file_put_contents('/var/www/command/wakeup', $content);
		file_put_contents('/var/www/command/wakeup.cron', $cron);
		//Override current cron
		sysCmd("cat /var/www/command/wakeup.cron | crontab -");
    }
}
waitSyWrk($redis, $jobID);
$alarmcfg = file_get_contents('/var/www/command/wakeup');
if(!$alarmcfg)
{
	//default values
	$template->enabled = false;
	$template->alarm = json_decode('[{"fullname": "Monday", "shortname": "mo", "enabled": false, "starttime": "06:50", "duration":60, "playlist":null},
{"fullname": "Tuesday", "shortname": "tu", "enabled": false, "starttime": "06:50", "duration":60, "playlist":null},
{"fullname": "Wednesday", "shortname":"we", "enabled": false, "starttime": "06:50", "duration":60, "playlist":null},
{"fullname": "Thursday", "shortname": "th", "enabled": false, "starttime": "06:50", "duration":60, "playlist":null},
{"fullname": "Friday", "shortname": "fr", "enabled": false, "starttime": "06:50", "duration":60, "playlist":null},
{"fullname": "Saturday", "shortname": "sa", "enabled": false, "starttime": "06:50", "duration":60, "playlist":null},
{"fullname": "Sunday", "shortname": "su", "enabled": false, "starttime": "06:50", "duration":60, "playlist":null}]', true);  
}
else{
	$_alarm = json_decode($alarmcfg, true);
	$template->enabled = $_alarm['enable'];
	$template->alarm = $_alarm['alarms'];
}
$template->playlists = array_slice(scandir('/var/lib/mpd/playlists/'), 2);