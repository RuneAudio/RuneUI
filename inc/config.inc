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
 *  file: config.inc
 *  version: 1.1
 *
 */
 
// configurazione personale
// valore produzione su raspberry
define('ROOTPATH', $_SERVER['HOME'] . '/' ); // default = '/'
// valore ambiente ACX
//define('ROOTPATH', $_SERVER['DOCUMENT_ROOT'] . '/' ); // default = '/'
define('DAEMONIP', 'localhost'); // default = 'localhost'
// DEV debug parameters
//ini_set('display_errors',1);
//define('ERRORLEVEL', '-1'); // default = 'E_ALL ^ E_NOTICE'
//__production
define('ERRORLEVEL', 'E_ERROR'); // default = 'E_ALL ^ E_NOTICE'
// configurazione generale
define ('COMMENTCHAR','#');
define ('DELSTRING','');
define ('CONFPATH', ROOTPATH.'inc/mpd.conf');
define ('DEFCONFPATH', ROOTPATH.'inc/mpd.conf.default');
define ('NETCONFPATH', ROOTPATH.'inc/network/interfaces');
define ('NETCONFPATHMANUAL', ROOTPATH.'inc/network/interfaces.manual');
define ('NETCONFPATHAUTO', ROOTPATH.'inc/network/interfaces.dhcp');
define ('NETCONFPATHBOOT', ROOTPATH.'inc/network/interfaces.loadatboot');
//echo '<pre>INCPATH = '.INCPATH.'</pre>';
// datastore SQLite
$db = 'sqlite:'.$_SERVER['DOCUMENT_ROOT'].'/db/player.db';
?>