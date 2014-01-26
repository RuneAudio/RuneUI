<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>RuneAudio - RuneUI</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0 user-scalable=no">
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/flat-ui.css" rel="stylesheet">
    <link href="css/bootstrap-select.css" rel="stylesheet">
	<link href="css/bootstrap-fileupload.css" rel="stylesheet">
    <link href="css/font-awesome.min.css" rel="stylesheet">
	<!--[if lte IE 7]>
		<link href="css/font-awesome-ie7.min.css" rel="stylesheet">
	<![endif]-->
	<?php if ($sezione == 'index') { ?>
	<link href="css/jquery.countdown.css" rel="stylesheet">
	<?php } ?>
	<!--<link rel="stylesheet" href="css/jquery.mobile.custom.structure.min.css">-->
	<link href="css/jquery.pnotify.default.css" rel="stylesheet">
	<link rel="stylesheet" href="css/runeui.css">
	<link rel="stylesheet" href="templates/skins/default/skin.css">
    <link rel="shortcut icon" href="images/favicon.ico">
    <!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
    <!--[if lt IE 9]>
      <script src="js/html5shiv.js"></script>
    <![endif]-->
</head>
<body class="<?php echo $sezione ?>">
<!--
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
 * file: _header.php
 * RuneOS version: 0.2-beta
 * RuneUI version: 1.2
 */
-->
<div id="menu-top" class="ui-header ui-bar-f ui-header-fixed slidedown" data-position="fixed" data-role="header" role="banner">
	<div class="dropdown">
		<a class="dropdown-toggle" id="menu-settings" role="button" data-toggle="dropdown" data-target="#" href="<?php echo $sezione ?>.php">MENU <i class="icon-th-list dx"></i></a>
		<ul class="dropdown-menu" role="menu" aria-labelledby="menu-settings">
			<li class="<?php ami('index'); ?>"><a href="index.php"><i class="icon-play sx"></i> Playback</a></li>
			<li class="<?php ami('sources'); ?>"><a href="sources.php"><i class="icon-folder-open sx"></i> Database</a></li>
			<li class="<?php ami('mpd-config'); ?>"><a href="mpd-config.php"><i class="icon-cogs sx"></i> MPD</a></li>
			<li class="<?php ami('net-config'); ?>"><a href="net-config.php"><i class="icon-sitemap sx"></i> Network</a></li>
			<li class="<?php ami('settings'); ?>"><a href="settings.php"><i class="icon-wrench sx"></i> Settings</a></li>
			<li class="<?php ami('help'); ?>"><a href="help.php"><i class="icon-question-sign sx"></i> Help</a></li>
			<li class="<?php ami('credits'); ?>"><a href="credits.php"><i class="icon-trophy sx"></i> Credits</a></li>
			<li><a href="#poweroff-modal" data-toggle="modal"><i class="icon-power-off sx"></i> Turn off</a></li>
		</ul>
	</div>
	<div class="playback-controls">	
		<button id="previous" class="btn btn-cmd" title="Previous"><i class="icon-step-backward"></i></button>
		<button id="stop" class="btn btn-cmd" title="Stop"><i class="icon-stop"></i></button>
		<button id="play" class="btn btn-cmd" title="Play/Pause"><i class="icon-play"></i></button>
		<button id="next" class="btn btn-cmd" title="Next"><i class="icon-step-forward"></i></button>
	</div>
	<a class="home" href="index.php"><img src="images/logo.png" class="logo" alt="RuneAudio"></a>
</div>
<div id="menu-bottom" class="ui-footer ui-bar-f ui-footer-fixed slidedown" data-position="fixed" data-role="footer"  role="banner">
	<ul>
		<?php if ($sezione == 'index') { ?>
		<li id="open-panel-sx"><a href="#panel-sx" class="open-panel-sx" data-toggle="tab"><i class="icon-music sx"></i> Browse</a></li>
		<li id="open-playback" class="active"><a href="#playback" class="close-panels" data-toggle="tab"><i class="icon-play sx"></i> Playback</a></li>
		<li id="open-panel-dx"><a href="#panel-dx" class="open-panel-dx" data-toggle="tab"><i class="icon-list sx"></i> Playlist</a></li>
		<?php } else { ?>
		<li id="open-panel-sx"><a href="index.php#panel-sx" class="open-panel-sx"><i class="icon-music sx"></i> Browse</a></li>
		<li id="open-playback"><a href="index.php#playback" class="close-panels"><i class="icon-play sx"></i> Playback</a></li>
		<li id="open-panel-dx"><a href="index.php#panel-dx" class="open-panel-dx"><i class="icon-list sx"></i> Playlist</a></li>
		<?php } ?>
	</ul>
</div>