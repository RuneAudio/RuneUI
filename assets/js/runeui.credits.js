window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.credits = new mithril.RuneModule('/credits');

// 'Credits' view
credits.view = function (ctrl) {
    return [m('.credits', [
		m('h1', 'RuneAudio project'),
		m('.row', [
			m('.col-md-8', [
				m('.alert.alert-info', ['\n                release version: ',m('strong[id="release-version"]', '0.3'),' (',m('a[href="http://www.runeaudio.com/changelog/"][target="_blank"]', 'build: beta-20141027'),')\n            ']),
				m('h2', 'RuneAudio team'),
				m('.alert.alert-info', [
					m('a[href="http://www.runeaudio.com/team/"][rel="nofollow"][target="_blank"]', [m('strong', 'Andrea Coiutti')]),
					' (aka ACX) ',
					m('span.help-block', '- RuneUI frontend design - frontend HTML/JS/CSS coding'),
					m('br'),
					m('a[href="http://www.runeaudio.com/team/"][rel="nofollow"][target="_blank"]', [m('strong', 'Simone De Gregori')]),
					' (aka Orion) ',
					m('span.help-block', '- RuneUI PHP backend coding - frontend JS coding - RuneOS distro build & optimization'),
					m('br'),
					m('a[href="http://www.runeaudio.com/team/"][rel="nofollow"][target="_blank"]', [m('strong', 'Carmelo San Giovanni')]),
					' (aka Um3ggh1U) ',
					m('span.help-block', '- RuneOS distro build & Kernel optimization'),
					m('br')
				]),
				m('h2', 'Main contributors'),
				m('a[href="https://github.com/vabatta"]', [m('strong', 'Valerio Battaglia')]),
				' ',
				m('span.help-block', '- RuneUI Javascript optimizations'),
				m('br'),
				m('a[href="https://github.com/fcasarsa"]', [m('strong', 'Francesco Casarsa')]),
				' ',
				m('span.help-block', '- Shairport patch'),
				m('br'),
				m('a[href="https://github.com/hondagx35"][rel="nofollow"][target="_blank"]', [m('strong', 'Frank Friedmann')]),
				' (aka hondagx35) ',
				m('span.help-block', '- RuneUI/RuneOS PHP backend code debug, refactoring of network management, RuneOS porting for Cubietruck'),
				m('br'),
				m('a[href="https://github.com/cristianp6"][rel="nofollow"][target="_blank"]', [m('strong', 'Cristian Pascottini')]),
				' ',
				m('span.help-block', '- RuneUI Javascript optimizations'),
				m('br'),
				m('a[href="https://github.com/GitAndrer"][rel="nofollow"][target="_blank"]', [m('strong', 'Andrea Rizzato')]),
				' (aka AandreR) ',
				m('span.help-block', '- RuneUI/RuneOS PHP backend code debug, integration of Wolfson Audio Card'),
				m('br'),
				m('a[href="http://www.runeaudio.com/forum/member275.html"][rel="nofollow"][target="_blank"]', [m('strong', 'Saman')]),
				' ',
				m('span.help-block', '- RuneOS RT Linux kernel for Wolfson Audio Card (RaspberryPi)'),
				m('br'),
				m('a[href="https://github.com/Mte90"][rel="nofollow"][target="_blank"]', [m('strong', 'Daniele Scasciafratte')]),
				' (aka Mte90) ',
				m('span.help-block', '- RuneUI Firefox integration'),
				m('br'),
				m('a[href="https://github.com/kdubious"][rel="nofollow"][target="_blank"]', [m('strong', 'Kevin Welsh')]),
				' (aka kdubious) ',
				m('span.help-block', '- RuneUI frontend development')
			]),
			m('.col-md-4', [
				m('h3.txtmid', 'Support us!'),
				m('form[action="https://www.paypal.com/cgi-bin/webscr"][id="form-paypal"][method="post"][target="_top"]', [
					m('input[name="cmd"][type="hidden"][value="_s-xclick"]'),
					m('input[name="hosted_button_id"][type="hidden"][value="AZ5L5M5PGHJNJ"]'),
					m('input[alt="PayPal - The safer, easier way to pay online!"][border="0"][name="submit"][src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"][type="image"]'),
					m('img[alt=""][border="0"][height="1"][src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"][width="1"]')
				]),
				m('h3.txtmid', 'Sharing is caring'),
				m('p.social-buttons', [
					m('a.btn.btn-default[href="https://github.com/RuneAudio"][rel="nofollow"][target="_blank"][title="RuneAudio on GitHub"]', [m('i.fa.fa-github')]),
					m('a.btn.btn-default[href="https://www.facebook.com/runeaudio"][rel="nofollow"][target="_blank"][title="RuneAudio on Facebook"]', [m('i.fa.fa-facebook')]),
					m('a.btn.btn-default[href="https://twitter.com/runeaudio"][rel="nofollow"][target="_blank"][title="RuneAudio on Twitter"]', [m('i.fa.fa-twitter')]),
					m('a.btn.btn-default[href="https://plus.google.com/+Runeaudio/"][rel="nofollow"][target="_blank"][title="RuneAudio on Google+"]', [m('i.fa.fa-google-plus')]),
					m('br'),
					m('a.btn.btn-default[href="http://www.runeaudio.com/forum/"][rel="nofollow"][target="_blank"][title="RuneAudio forum"]', [m('i.fa.fa-comments')]),
					m('a.btn.btn-default[href="http://feeds.feedburner.com/RuneAudio"][rel="nofollow"][target="_blank"][title="RSS feed"]', [m('i.fa.fa-rss')]),
					m('a.btn.btn-default[href="http://www.runeaudio.com/newsletter/"][rel="nofollow"][target="_blank"][title="RuneAudio newsletter"]', [m('i.fa.fa-envelope')])
				])
			])
		]),
		m('h2', 'License & Copyright'),
		m('.alert.alert-info[id="license"]', [
			m('p', ['This Program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation either version 3, \n        or (at your option) any later version. This Program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. \n        See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with RuneAudio; see the file COPYING. \n        If not, see ',m('a[href="http://www.gnu.org/licenses/gpl-3.0.txt"][rel="nofollow"][target="_blank"]', 'http://www.gnu.org/licenses/gpl-3.0.txt')])
		]),
		m('p', [
			m('strong', 'Copyright (C) 2013-2014 RuneAudio Team'),
			' ',
			m('span.help-block', '- Andrea Coiutti & Simone De Gregori & Carmelo San Giovanni'),
			m('br'),
			m('strong', 'RuneUI'),
			' ',
			m('span.help-block', '- copyright (C) 2013-2014 – Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)'),
			m('br'),
			m('strong', 'RuneOS'),
			m('span.help-block', '- copyright (C) 2013-2014 – Simone De Gregori (aka Orion) & Carmelo San Giovanni (aka Um3ggh1U)')
		]),
		m('h2', 'RuneUI credits'),
		m('p', [m('strong', 'PHP language v5.5'),' by ',m('a[href="http://php.net/credits.php"][rel="nofollow"][target="_blank"]', 'PHP Team'),m('br'),m('a[href="http://php.net/"][rel="nofollow"][target="_blank"]', 'http://php.net')]),
		m('p', [
			m('strong', 'NGiNX'),
			m('br'),
			m('a[href="http://nginx.org/"][rel="nofollow"][target="_blank"]', 'http://nginx.org')
		]),
		m('p', [m('strong', 'NGiNX Push Stream Module'),m('br'),m('a[href="http://wiki.nginx.org/HttpPushStreamModule"][rel="nofollow"][target="_blank"]', 'http://wiki.nginx.org/HttpPushStreamModule')]),
		m('p', [m('strong', 'Redis'),' advanced key-value store by ',m('a[href="https://twitter.com/antirez"][rel="nofollow"][target="_blank"]', 'Salvatore Sanfilippo'),' and ',m('a[href="https://twitter.com/pnoordhuis"][rel="nofollow"][target="_blank"]', ['Pieter Noordhuis',m('br')]),m('a[href="http://redis.io"][rel="nofollow"][target="_blank"][title="Redis"]', 'http://redis.io')]),
		m('p', [m('strong', 'PHP redis'),' class by ',m('a[href="https://twitter.com/alfonsojimenez"][rel="nofollow"][target="_blank"]', 'Alfonso Jimenez'),', ',m('a[href="https://twitter.com/bouafif_nasr"][rel="nofollow"][target="_blank"]', 'Nasreddine Bouafif'),' and ',m('a[href="https://twitter.com/yowgi"][rel="nofollow"][target="_blank"]', 'Nicolas Favre-Felix'),m('br'),m('a[href="https://github.com/nicolasff/phpredis"][rel="nofollow"][target="_blank"][title="PHP Redis"]', 'https://github.com/nicolasff/phpredis')]),
		m('p', [m('strong', 'PHP pthreads'),' by ',m('a[href="https://github.com/krakjoe"][rel="nofollow"][target="_blank"]', 'Joe Watkins'),m('br'),m('a[href="http://pthreads.org"][rel="nofollow"][target="_blank"][title="PHP pthreads"]', 'http://pthreads.org')]),
		m('p', [m('strong', 'getID3'),' class by ',m('a[href="https://github.com/JamesHeinrich"][rel="nofollow"][target="_blank"]', 'by James Heinrich'),m('br'),m('a[href="http://www.getid3.org"][rel="nofollow"][target="_blank"][title="getID3"]', 'http://www.getid3.org')]),
		m('p', [m('strong', 'PHP reader'),' class by ',m('a[href="http://fi.linkedin.com/in/svollbehr"][rel="nofollow"][target="_blank"]', 'Sven Vollbehr'),m('br'),m('a[href="https://code.google.com/p/php-reader/"][rel="nofollow"][target="_blank"][title="PHP Reader"]', 'https://code.google.com/p/php-reader')]),
		m('p', [m('strong', 'jQuery Knob'),' by ',m('a[href="http://anthonyterrien.com/"][rel="nofollow"][target="_blank"]', 'Anthony Terrien'),m('br'),m('a[href="https://github.com/aterrien/jQuery-Knob"][rel="nofollow"][target="_blank"]', 'https://github.com/aterrien/jQuery-Knob')]),
		m('p', [m('strong', 'jQuery Countdown'),' by ',m('a[href="http://keith-wood.name/"][rel="nofollow"][target="_blank"]', 'Keith Wood'),m('br'),m('a[href="http://keith-wood.name/countdown.html"][rel="nofollow"][target="_blank"]', 'http://keith-wood.name/countdown.html')]),
		m('p', [m('strong', 'jQuery scrollTo'),' by ',m('a[href="http://flesler.blogspot.com/"][rel="nofollow"][target="_blank"]', 'Ariel Flesler'),m('br'),m('a[href="http://flesler.blogspot.it/2007/10/jqueryscrollto.html"][rel="nofollow"][target="_blank"]', 'http://flesler.blogspot.it/2007/10/jqueryscrollto.html')]),
		m('p', [m('strong', 'PNotify'),' by SciActive',m('br'),m('a[href="http://sciactive.com/pnotify/"][rel="nofollow"][target="_blank"]', 'http://sciactive.com/pnotify')]),
		m('p', [m('strong', 'FastClick'),' by ',m('a[href="https://github.com/ftlabs"][rel="nofollow"][target="_blank"]', 'ftlabs'),m('br'),m('a[href="http://ftlabs.github.io/fastclick/"][rel="nofollow"][target="_blank"]', 'http://ftlabs.github.io/fastclick')]),
		m('p', [m('strong', '(cs)spinner'),' by ',m('a[href="https://github.com/jh3y"][rel="nofollow"][target="_blank"]', 'jhey tompkins'),m('br'),m('a[href="http://jh3y.github.io/-cs-spinner/"][rel="nofollow"][target="_blank"]', 'http://jh3y.github.io/-cs-spinner/')]),
		m('p', [m('strong', 'Twitter Bootstrap'),' by ',m('a[href="http://twitter.com/mdo"][rel="nofollow"][target="_blank"]', '@mdo'),' and ',m('a[href="http://twitter.com/fat"][rel="nofollow"][target="_blank"]', '@fat'),m('br'),m('a[href="http://getbootstrap.com/"][rel="nofollow"][target="_blank"]', 'http://getbootstrap.com')]),
		m('p', [m('strong', 'Lato-Fonts'),' by ',m('a[href="http://alfabety.pl/"][rel="nofollow"][target="_blank"]', 'Lukasz Dziedzic'),m('br'),m('a[href="http://www.latofonts.com/lato-free-fonts/"][rel="nofollow"][target="_blank"]', 'http://www.latofonts.com/lato-free-fonts')]),
		m('p', [m('strong', 'Font Awesome'),' by ',m('a[href="https://twitter.com/davegandy"][rel="nofollow"][target="_blank"]', 'Dave Gandy'),m('br'),m('a[href="http://fontawesome.io/"][rel="nofollow"][target="_blank"]', 'http://fontawesome.io')]),
		m('p', [m('strong', 'Bootstrap-select'),' by ',m('a[href="https://github.com/caseyjhol"][rel="nofollow"][target="_blank"]', 'caseyjhol'),m('br'),m('a[href="http://silviomoreto.github.io/bootstrap-select/"][rel="nofollow"][target="_blank"]', 'http://silviomoreto.github.io/bootstrap-select')]),
		m('p', [m('strong', 'Bootstrap Context Menu'),' by ',m('a[href="https://github.com/sydcanem"][rel="nofollow"][target="_blank"]', '@sydcanem'),m('br'),m('a[href="https://github.com/sydcanem/bootstrap-contextmenu"][rel="nofollow"][target="_blank"]', 'https://github.com/sydcanem/bootstrap-contextmenu')]),
		m('p', [m('strong', 'CSS Toggle Switch'),' by ',m('a[href="http://ghinda.net/"][rel="nofollow"][target="_blank"]', 'Ionuț Colceriu'),m('br'),m('a[href="https://github.com/ghinda/css-toggle-switch"][rel="nofollow"][target="_blank"]', 'https://github.com/ghinda/css-toggle-switch')]),
		m('p', [m('strong', 'ZeroClipboard'),' by ',m('a[href="https://github.com/zeroclipboard"][rel="nofollow"][target="_blank"]', 'ZeroClipboard'),m('br'),m('a[href="http://zeroclipboard.org/"][rel="nofollow"][target="_blank"]', 'http://zeroclipboard.org/')]),
		m('p', ['Also thanks to B. Carlisle (',m('strong', 'MPD-class'),' ',m('a[href="http://mpd.24oz.com/"][rel="nofollow"][target="_blank"]', 'http://mpd.24oz.com'),') for code inspiration on some data-parsing functions.']),
		m('h2', 'RuneOS credits'),
		m('p', ['ArchLinux (base distro)',m('br'),m('a[href="https://www.archlinux.org/"][rel="nofollow"][target="_blank"]', 'https://www.archlinux.org')]),
		m('p', [m('strong', 'MPD'),' – Music Player Daemon by Max Kellermann & Avuton Olrich',m('br'),m('a[href="http://www.musicpd.org/"][rel="nofollow"][target="_blank"]', 'http://www.musicpd.org')]),
		m('p', ['Shairport by James “abrasive” Laird',m('br'),m('a[href="https://github.com/abrasive/shairport"][rel="nofollow"][target="_blank"]', 'https://github.com/abrasive/shairport')]),
		m('p', ['Spop by Thomas Jost',m('br'),m('a[href="https://github.com/Schnouki/spop"][rel="nofollow"][target="_blank"]', 'https://github.com/Schnouki/spop')]),
		m('p', ['Upmpdcli by Jean-Francois Dockes',m('br'),m('a[href="http://www.lesbonscomptes.com/upmpdcli/upmpdcli.html"][rel="nofollow"][target="_blank"]', 'http://www.lesbonscomptes.com/upmpdcli/upmpdcli.html')]),
		m('p', ['MiniDLNA by Justin Maggard',m('br'),m('a[href="http://minidlna.sourceforge.net/"][rel="nofollow"][target="_blank"]', 'http://minidlna.sourceforge.net')]),
		'\n'
	]),'\n'];
};