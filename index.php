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
 *  file: index.php
 *  version: 1.2
 *
 */
 
// common include
include('inc/connection.php');
playerSession('open',$db,'',''); 
playerSession('unlock',$db,'','');

// set template
$tpl = "indextpl.html";
?>
<?php
$sezione = basename(__FILE__, '.php');
$_section = $sezione;
include('_header.php'); 
?>
<!-- content -->
<?php
if ($_SESSION['coverart'] == 1) {
$_index['colspan'] = '4';
$_index['coverart'] = "<div class=\"span4 coverart\">\n";
$_index['coverart'] .= "<img id=\"cover-art\" src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\">\n";
$_index['coverart'] .= "</div>\n";
} else {
$_index['colspan'] = '6';
}
if ($_SESSION['volume'] == 1) {
$_volume['color'] = '#0095D8';
$_volume['readonly'] = 'false';
$_volume['disabled'] = '';
$_volume['divclass'] = '';
} else {
//$_volumeColor = '#002c40';
$_volume['color'] = '#1A242F';
$_volume['readonly'] = 'true';
$_volume['disabled'] = 'disabled="disabled"';
$_volume['divclass'] = 'nomixer';
}
eval("echoTemplate(\"".getTemplate("templates/$tpl")."\");");
?>
<!-- content -->
<?php 
// debug($_POST);
?>
<?php include('_footer.php'); ?>