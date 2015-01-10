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
 *  file: app/playback_ctl.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
$template->activePlayer = $redis->get('activePlayer');
if ($redis->get('coverart') == 1) {
    $template->coverart = 1;
    $template->colspan = 4;
} else {
    $template->coverart = 0;
    $template->colspan = 6;
}
if ($redis->get('volume') == 1 && $template->activePlayer !== 'Spotify') {
    $template->volume['color'] = '#0095D8';
    $template->volume['readonly'] = 'false';
} else {
    //$_volumeColor = '#002c40';
    $template->volume['color'] = '#1A242F';
    $template->volume['readonly'] = 'true';
    $template->volume['disabled'] = 1;
    $template->volume['divclass'] = 'nomixer';
}
$template->dev = $redis->get;
$template->spotify = $redis->hGet('spotify', 'enable');
