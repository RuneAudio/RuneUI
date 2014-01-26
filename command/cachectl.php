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
 *  file: command/cachectl.php
 *  version: 1.2
 *
 */

opcache_invalidate ( '/srv/http/command/cachectl.php' );
 
if (isset($_GET['action'])) {

	switch ($_GET['action']) {
			
			case 'prime':
			opcache_compile_file ( '/srv/http/inc/player_lib.php' );
			opcache_compile_file ( '/srv/http/inc/config.inc' );
			opcache_compile_file ( '/srv/http/inc/connection.php' );
			opcache_compile_file ( '/srv/http/command/rune_SY_wrk.php' );
			opcache_compile_file ( '/srv/http/index.php' );
			opcache_compile_file ( '/srv/http/_header.php' );
			opcache_compile_file ( '/srv/http/_footer.php' );
			opcache_compile_file ( '/srv/http/_player_engine.php' );
			opcache_compile_file ( '/srv/http/db/index.php' );
			opcache_compile_file ( '/srv/http/command/index.php' );
			opcache_compile_file ( '/srv/http/inc/coverart.php' );
			opcache_compile_file ( '/srv/http/inc/Zend/Media/Flac.php' );
			opcache_compile_file ( '/srv/http/inc/Zend/Io/Reader.php' );
			opcache_compile_file ( '/srv/http/sources.php');
			opcache_compile_file ( '/srv/http/settings.php');
			opcache_compile_file ( '/srv/http/credits.php' );
			opcache_compile_file ( '/srv/http/mpd-config.php');
			opcache_compile_file ( '/srv/http/help.php');
			opcache_compile_file ( '/srv/http/command/opcache.php' );
			opcache_compile_file ( '/srv/http/dev.php' );
			break;
			
			case 'reset':
			opcache_invalidate ( '/srv/http/inc/player_lib.php' );
			opcache_invalidate ( '/srv/http/inc/config.inc' );
			opcache_invalidate ( '/srv/http/inc/connection.php' );
			opcache_invalidate ( '/srv/http/command/rune_SY_wrk.php' );
			opcache_invalidate ( '/srv/http/index.php' );
			opcache_invalidate ( '/srv/http/_header.php' );
			opcache_invalidate ( '/srv/http/_footer.php' );
			opcache_invalidate ( '/srv/http/_player_engine.php' );
			opcache_invalidate ( '/srv/http/db/index.php' );
			opcache_invalidate ( '/srv/http/command/index.php' );
			opcache_invalidate ( '/srv/http/inc/coverart.php' );
			opcache_invalidate ( '/srv/http/inc/Zend/Media/Flac.php' );
			opcache_invalidate ( '/srv/http/inc/Zend/Io/Reader.php' );
			opcache_invalidate ( '/srv/http/sources.php');
			opcache_invalidate ( '/srv/http/settings.php');
			opcache_invalidate ( '/srv/http/credits.php' );
			opcache_invalidate ( '/srv/http/mpd-config.php');
			opcache_invalidate ( '/srv/http/help.php');
			opcache_invalidate ( '/srv/http/command/opcache.php' );
			opcache_invalidate ( '/srv/http/dev.php' );
			opcache_reset();
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
?>