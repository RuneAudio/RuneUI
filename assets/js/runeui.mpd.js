window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.mpd = new mithril.RuneModule('/mpd');

mpd.vm.saveAudioOutput = function () {
    data.postData(mpd.vm.url, mpd.vm.ao);
};


// 'MPD' view
mpd.view = function (ctrl) {
    return [m('h1', 'MPD Configuration'), '\n', m('p', ['\n    If you mess up with this configuration you can ', m('a[href="javascript:;"]', { onclick: function (e) { m.module(document.getElementById('dialog'), modal.resetmpd); } }, 'reset to default'), '.\n']), '\n',
        m('fieldset.form-horizontal', [
			m('legend', 'Audio Output'),
				m('.form-group', [
                    mithril.createLabel('ao', 'Audio output interface'),
					m('.col-sm-10', [
                        //(id, container, field, list, valueField, displayField, config)
                        m('input.form-control.input-lg[data-trigger="change"][id="ao"][type="text"]', mithril.createInput(mpd.vm.data, 'ao', null, true)),
						//createSelect('audio-output-interface', mpd.vm.data, 'ao', 'acards', 'name', 'extlabel', selectpicker),
                        m('span.help-block', ['This is the current output interface. It can be ', m('a[href="/audio"]', { config: m.route }, 'configured here'), '.'
                        ])
					])
				])
        ]),
		m('fieldset.form-horizontal', [
			m('legend', 'Volume control'),
			m('.form-group', [
				mithril.createLabel('mixer-type', 'Volume control'),
				m('.col-sm-10', [
                    m('input.form-control.input-lg[id="mixer-type"][type="text"]', mithril.createInput(mpd.vm.data.conf, 'mixer_type', null, true)),
					m('span.help-block', ['This is the current volume control setting. It can be ', m('a[href="/audio"]', { config: m.route }, 'configured here'), '.'
					])
				])
			])
		]),
		m('fieldset.form-horizontal', [
			m('legend', 'General music daemon options'),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="port"]', 'Port'),
				m('.col-sm-10', [
					m('input.form-control.input-lg[data-trigger="change"][disabled=""][id="port"][name="conf[port]"][type="text"]', mithril.createInput(mpd.vm.data.conf, 'port')),
					m('span.help-block', 'This setting is the TCP port that is desired for the daemon to get assigned to.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="daemon-user"]', 'Daemon user : group'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="user"][name="conf[user]"]', mithril.createInput(mpd.vm.data.conf, 'user', helpers.selectpicker), [
						m('option[selected=""][value="mpd"]', 'mpd : audio (default)'),
						m('option[value="root"]', 'root : root')
					]),
					m('span.help-block', 'This specifies the system user : group that MPD will run as.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="log-level"]', 'Log level'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="log-level"][name="conf[log_level]"]', mithril.createInput(mpd.vm.data.conf, 'log_level', helpers.selectpicker), [
						m('option[selected=""][value="none"]', 'disabled'),
						m('option[value="default"]', 'default'),
						m('option[value="secure"]', 'secure'),
						m('option[value="verbose"]', 'verbose')
					]),
					m('span.help-block', 'This setting controls the type of information which is logged. Available setting arguments are \'disabled\', \'default\', \'secure\' or \'verbose\'. The \'verbose\' setting argument is recommended for troubleshooting, though can quickly stretch available resources on limited hardware storage.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="state-file"]', 'State file'),
				m('.col-sm-10', [
                    // (id, container, field, config)
                    mithril.createYesNo('state_file', mpd.vm.data.conf, 'state_file'),
					m('span.help-block', 'This setting specifies if a state file is used. If the state file is active, the state of mpd will be saved when mpd is terminated by a TERM signal or by the \'kill\' command. When mpd is restarted, it will read the state file and restore the state of mpd (including the playlist).')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="ffmpeg"]', 'FFmpeg decoder plugin'),
				m('.col-sm-10', [
					mithril.createYesNo('ffmpeg', mpd.vm.data.conf, 'ffmpeg'),
					m('span.help-block', 'FFmpeg decoder plugin. Enable this setting if you need AAC / ALAC support. May slow down MPD database refresh.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="gapless-mp3-playback"]', 'Gapless mp3 playback'),
				m('.col-sm-10', [
					mithril.createYesNo('gapless-mp3-playback', mpd.vm.data.conf, 'gapless_mp3_playback'),
					m('span.help-block', 'If you have a problem with your MP3s ending abruptly it is recommended that you set this argument to \'no\' to attempt to fix the problem. If this solves the problem, it is highly recommended to fix the MP3 files with vbrfix (available as vbrfix in the debian archive), at which point gapless MP3 playback can be enabled.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="dsd-usb"]', 'DSD support'),
				m('.col-sm-10', [
					mithril.createYesNo('dsd-usb', mpd.vm.data.conf, 'dsd_usb'),
					m('span.help-block', 'Enable DSD audio support.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="volume-normalization"]', 'Volume normalization'),
				m('.col-sm-10', [
					mithril.createYesNo('volume-normalization', mpd.vm.data.conf, 'volume_normalization'),
					m('span.help-block', 'If yes, mpd will normalize the volume of songs as they play. The default is no')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="port"]', 'Audio buffer size'),
				m('.col-sm-10', [
					m('input.form-control.input-lg[data-trigger="change"][id="audio-buffer-size"][min="512"][name="conf[audio_buffer_size]"][type="number"]', mithril.createInput(mpd.vm.data.conf, 'audio_buffer_size')),
					m('span.help-block', 'This specifies the size of the audio buffer in kibibytes. The default is 2048, large enough for nearly 12 seconds of CD-quality audio.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="dsd-usb"]', 'Buffer before play'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="buffer-before-play"][name="conf[buffer_before_play]"]', mithril.createInput(mpd.vm.data.conf, 'buffer_before_play', helpers.selectpicker), [
						m('option[value="0%"]', 'disabled'),
						'\n                    \n\';\n                    ',
						m('option[selected=""][value="10%"]', '10%'),
						'\n                    \n\';\n                    ',
						m('option[value="20%"]', '20%'),
						'\n                    \n\';\n                    ',
						m('option[value="30%"]', '30%'),
						'\n                    \n\';\n                '
					]),
					m('span.help-block', ' This specifies how much of the audio buffer should be filled before playing a song. Try increasing this if you hear skipping when manually changing songs. The default is 10%, a little over 1 second of CD-quality audio with the default buffer size')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="auto-update"]', 'Auto update'),
				m('.col-sm-10', [
					mithril.createYesNo('auto-update', mpd.vm.data.conf, 'auto_update'),
					m('span.help-block', 'This setting enables automatic update of MPD"s database when files in music_directory are changed.')
				])
			])
		]),
		m('.form-group.form-actions', [
			m('.col-sm-offset-2.col-sm-10', [
                m('button.btn.btn-default.btn-lg[name="cancel"][value="cancel"][type="button"]', { onclick: function (e) { mpd.vm.cancel('conf'); } }, 'Cancel'),
				m('button.btn.btn-primary.btn-lg[name="save"][value="save"][type="button"]', { onclick: function (e) { mpd.vm.save('conf'); } }, 'Save and apply')
			])
		])
    ];
};