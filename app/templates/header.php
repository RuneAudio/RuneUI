<head>
    <meta charset="utf-8">
    <title>RuneAudio - RuneUI</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="msapplication-tap-highlight" content="no" />
    <link rel="stylesheet" href="<?=$this->asset('/css/runeui.css')?>">
    <link rel="shortcut icon" href="<?=$this->asset('/img/favicon.ico')?>">
    <link rel="apple-touch-icon" sizes="57x57" href="<?=$this->asset('/img/apple-touch-icon-57x57.png')?>">
    <link rel="apple-touch-icon" sizes="114x114" href="<?=$this->asset('/img/apple-touch-icon-114x114.png')?>">
    <link rel="apple-touch-icon" sizes="72x72" href="<?=$this->asset('/img/apple-touch-icon-72x72.png')?>">
    <link rel="apple-touch-icon" sizes="144x144" href="<?=$this->asset('/img/apple-touch-icon-144x144.png')?>">
    <link rel="apple-touch-icon" sizes="60x60" href="<?=$this->asset('/img/apple-touch-icon-60x60.png')?>">
    <link rel="apple-touch-icon" sizes="120x120" href="<?=$this->asset('/img/apple-touch-icon-120x120.png')?>">
    <link rel="apple-touch-icon" sizes="76x76" href="<?=$this->asset('/img/apple-touch-icon-76x76.png')?>">
    <link rel="apple-touch-icon" sizes="152x152" href="<?=$this->asset('/img/apple-touch-icon-152x152.png')?>">
    <link rel="apple-touch-icon" sizes="180x180" href="<?=$this->asset('/img/apple-touch-icon-180x180.png')?>">
    <meta name="apple-mobile-web-app-title" content="RuneAudio">
    <link rel="icon" type="image/png" href="<?=$this->asset('/img/favicon-192x192.png')?>" sizes="192x192">
    <link rel="icon" type="image/png" href="<?=$this->asset('/img/favicon-160x160.png')?>" sizes="160x160">
    <link rel="icon" type="image/png" href="<?=$this->asset('/img/favicon-96x96.png')?>" sizes="96x96">
    <link rel="icon" type="image/png" href="<?=$this->asset('/img/favicon-16x16.png')?>" sizes="16x16">
    <link rel="icon" type="image/png" href="<?=$this->asset('/img/favicon-32x32.png')?>" sizes="32x32">
    <meta name="msapplication-TileColor" content="#000000">
    <meta name="msapplication-TileImage" content="/img/mstile-144x144.png">
    <meta name="msapplication-config" content="/img/browserconfig.xml">
    <meta name="application-name" content="RuneAudio">
</head>
<?php if (empty($this->uri(1)) OR ($this->uri(1) == 'playback')): ?>
<body id="section-index">
<?php else: ?>
<body id="section-<?=$this->section?>">
<?php endif ?>
<!--
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
 * RuneUI version: 1.3
 * RuneOS version: 0.3-beta
 *
 */
-->
<div id="menu-top">
    <div class="dropdown">
        <a id="menu-settings" class="dropdown-toggle" role="button" data-toggle="dropdown" data-target="#" href="#">MENU <i class="fa fa-bars dx"></i></a>
        <ul class="dropdown-menu" role="menu" aria-labelledby="menu-settings">
            <li class="<?=$this->uri(1, '', 'active')?>"><a href="/"><i class="fa fa-play"></i> Playback</a></li>
            <li class="<?=$this->uri(1, 'sources', 'active')?>"><a href="/sources/"><i class="fa fa-folder-open"></i> Sources</a></li>
            <li class="<?=$this->uri(1, 'mpd', 'active')?>"><a href="/mpd/"><i class="fa fa-cogs"></i> MPD</a></li>
            <li class="<?=$this->uri(1, 'settings', 'active')?>"><a href="/settings/"><i class="fa fa-wrench"></i> Settings</a></li>
            <li class="<?=$this->uri(1, 'network', 'active')?>"><a href="/network/"><i class="fa fa-sitemap"></i> Network</a></li>
            <li class="<?=$this->uri(1, 'debug', 'active')?>"><a href="/debug/"><i class="fa fa-bug"></i> Debug</a></li>
            <li class="<?=$this->uri(1, 'credits', 'active')?>"><a href="/credits/"><i class="fa fa-trophy"></i> Credits</a></li>
            <li><a href="#poweroff-modal" data-toggle="modal"><i class="fa fa-power-off"></i> Turn off</a></li>
        </ul>
    </div>
    <div class="playback-controls">    
        <button id="previous" class="btn btn-default btn-cmd" title="Previous" data-cmd="previous"><i class="fa fa-step-backward"></i></button>
        <button id="stop" class="btn btn-default btn-cmd" title="Stop" data-cmd="stop"><i class="fa fa-stop"></i></button>
        <button id="play" class="btn btn-default btn-cmd" title="Play/Pause" data-cmd="play"><i class="fa fa-play"></i></button>
        <button id="next" class="btn btn-default btn-cmd" title="Next" data-cmd="next"><i class="fa fa-step-forward"></i></button>
    </div>
    <a class="home" href="/"><img src="<?=$this->asset('/img/logo.png')?>" class="logo" alt="RuneAudio"></a>
</div>
<div id="menu-bottom">
    <ul>
        <li id="open-panel-sx"><a href="/#panel-sx"<?=$this->uri(1, '', ' class="open-panel-sx" data-toggle="tab"')?>><i class="fa fa-music"></i> Library</a></li>
        <li id="open-playback"<?=$this->uri(1, '', ' class="active"')?>><a href="/#playback"<?=$this->uri(1, '', ' data-toggle="tab"')?>><i class="fa fa-play"></i> Playback</a></li>
        <li id="open-panel-dx"><a href="/#panel-dx"<?=$this->uri(1, '', ' class="open-panel-dx" data-toggle="tab"')?>><i class="fa fa-list"></i> Queue</a></li>
    </ul>
</div>
