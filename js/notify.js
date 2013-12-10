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
 *  file:         notify.js
 *  version:   1.1
 *
 */

function notify(command, msg) {
	switch (command) {
		case 'add':
			$.pnotify({
				title: 'Added to playlist',
				text: msg,
				icon: 'icon-ok',
				opacity: .9
			});
		break;

		case 'addreplaceplay':
			$.pnotify({
				title: 'Playlist cleared<br> Added to playlist',
				text: msg,
				icon: 'icon-remove',
				opacity: .9
			});
		break;
		
		case 'update':
			$.pnotify({
				title: 'Update path: ',
				text: msg,
				icon: 'icon-remove',
				opacity: .9
			});
		break;
		
		case 'remove':
			$.pnotify({
				title: 'Removed from playlist',
				text: msg,
				icon: 'icon-remove',
				opacity: .9
			});
		break;
	}
}