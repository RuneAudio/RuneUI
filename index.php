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
 *  file: index.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
// load configuration
include($_SERVER['HOME'].'/app/config/config.php');
// main include
include($_SERVER['HOME'].'/app/libs/vendor/autoload.php');
// open session
session_start();
// plates: create new engine
$engine = new \League\Plates\Engine('/srv/http/app/templates');
// plates: load asset extension
$engine->loadExtension(new \League\Plates\Extension\Asset('/srv/http/assets', true));
// plates: load URI extension
$engine->loadExtension(new \League\Plates\Extension\URI($_SERVER['REQUEST_URI']));
// plates: create a new template
$template = new \League\Plates\Template($engine);
// set devmode
$template->dev = $devmode;
// activePlayer
$activePlayer = $redis->get('activePlayer');
// TODO: rework needed
$template->activePlayer = $activePlayer;
// allowed controllers
$controllers = array(
    'credits',
    'coverart',
    'dev',
    'debug',
    'help',
    'index',
    'login',
    'mpd',
    'network',
    'playback',
    'settings',
    'sources',
    'tun'
);
// check page
if (in_array($template->uri(1), $controllers) OR empty($template->uri(1))) {
    // decode REQUEST_URL and assing section
    if (!empty($template->uri(1)) && ($template->uri(1) !== 'playback')) {
        // decode ACTION
        if (!empty($template->uri(2))) {
        $template->action = $template->uri(2);
                // assign SUB-TEMPLATE
                if ($template->action === 'add') {
                    $subtpl = 'edit';
                } else {
                    $subtpl = $template->action;
                }
            // decode ARG
            if(!empty($template->uri(3))) {
                $template->arg = $template->uri(3);
            }
            // assign TEMPLATE
            $template->content = $template->uri(1).'_'.$subtpl;
        } else {
            // assign TEMPLATE
            $template->content = $template->uri(1);
        }
        $template->section = $template->uri(1);
        // debug
        //runelog("index: section",$template->section);
        // debug
        //runelog("index: selected controller(1)",APP.$template->uri(1));
        // load selected APP Controller
        include(APP.$template->uri(1).'_ctl.php');
        // register current controller in SESSION
        if ($template->uri(1) !== 'coverart' && $template->uri(1) !== 'coverart2') {
        $_SESSION['controller'] = $template->uri(1);
        }
    } else {
        // debug
        //runelog("index: selected controller(2)",'playback_ctl.php');
        // load playback APP Controller
        include(APP.'playback_ctl.php');
        $template->section = 'index';
        $template->content = 'playback';
        // register current controller in SESSION
        $_SESSION['controller'] = 'playback';
    }
} else {
    $template->section = 'error';
    $template->content = 'error';
    // register current controller in SESSION
    $_SESSION['controller'] = 'error';
}
// set devmode
$template->dev = $devmode;
// plates: render layout (if you want to output direct, set $tplfile = 0 into controller)
if ($tplfile !== 0) {
    echo $template->render('default_lo');
}
// close palyer backend connection
if ($activePlayer === 'MPD') {
    // close MPD connection
    closeMpdSocket($mpd);
} elseif ($activePlayer === 'Spotify') {
    // close SPOP connection
    closeSpopSocket($spop);
}
// notifications
$notifications = $redis->hGetAll('notifications');
if (!empty($notifications) &&  $tplfile !== 0) {
    foreach ($notifications as $raw_notification) {
        wrk_control($redis, 'newjob', $data = array('wrkcmd' => 'ui_notify', 'args' => $notifications, 'delay_us' => 450000));
    }
}
// close Redis connection
// $redis->close();
// close session
session_write_close();
