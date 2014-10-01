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
 *  file: command/cachectl.php
 *  version: 1.3
 *  coder: Simone De Gregori
 *
 */
// common include
include('/srv/http/app/config/config.php');
opcache_invalidate ('/srv/http/command/cachectl.php');
// insect GET['action']
if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'prime':
            OpCacheCtl('prime', '/srv/http/', $redis);
            break;
        case 'primeall':
            OpCacheCtl('primeall', '/srv/http/');
            break;
        case 'reset':
            OpCacheCtl('reset', '/srv/http/');
            opcache_reset();
            runelog('cacheCTL RESET');
            echo "PHP OPCACHE CLEARED";
            break;
        case 'debug':
            // opcache_reset();
            echo "<pre>";
            echo "OPcache status:\n";
            print_r(opcache_get_status());
            echo "OPcache configuration:\n";
            print_r(opcache_get_configuration());
            echo "</pre>";
            break;
    }
}
