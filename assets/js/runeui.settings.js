window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.settings = new mithril.RuneModule('/settings');
settings.vm.validate = function(){
    console.log('Settings view');
    return true;
};

settings.timezonesSelectOptions = Array;
settings.vm.options = new settings.timezonesSelectOptions();

// retrieve the timezones
settings.timezonesSelect = function(element, isInitialized, context) {
    if (isInitialized) {
        return;
    }
    m.request({
        method: 'GET',
        url: '/api/settings/timezones/'
    }).then(function(response) {
        var options = response.timezones;
        // console.log(options);
        m.render(document.getElementById('timezone-select'), [
            m('select[data-style="btn-default btn-lg"][id="timezone"]',
                { config: helpers.selectpicker },
                options.map(function(option) {
                    return m('option[value="' + option.value + '"]', option.name);
                })
            )
        ]);
        // console.log('RENDER!');
    });
};

// 'Settings' view
settings.view = function (ctrl) {
    return [
        m('h1', 'Settings'),
        m('fieldset.form-horizontal', [
            m('legend', 'Environment'),
            m('.form-group[id="systemstatus"]', [
                m('label.control-label.col-sm-2', 'Check system status'),
                m('.col-sm-10', [
                    m('a.btn.btn-default.btn-lg[data-toggle="modal"][href="#modal-sysinfo"]', [m('i.fa.fa-info-circle.sx'), 'show status']),
                    m('span.help-block', 'See information regarding the system and its status.')
                ])
            ]),
            m('.form-group[id="environment"]', [
                m('label.control-label.col-sm-2[for="hostname"]', 'Player hostname'),
                m('.col-sm-10', [
                    m('input.form-control.input-lg[autocomplete="off"][id="hostname"][placeholder="runeaudio"][type="text"]', mithril.createInput(settings.vm.data.environment, 'hostname')),
                    m('span.help-block', 'Set the player hostname. This will change the address used to reach the RuneUI.')
                ])
            ]),
            m('.form-group', [
                m('label.control-label.col-sm-2[for="ntpserver"]', 'NTP server'),
                m('.col-sm-10', [
                    m('input.form-control.input-lg[autocomplete="off"][id="ntpserver"][placeholder="pool.ntp.org"][type="text"]', mithril.createInput(settings.vm.data.environment, 'ntpserver')),
                    m('span.help-block', ['Set your reference time sync server ', m('i', '(NTP server)'), '.'])
                ])
            ]),
            m('.form-group', [
                m('label.control-label.col-sm-2[for="timezone"]', 'Timezone'),
                m('.col-sm-10', { config: settings.timezonesSelect }, [
                    m('#timezone-select', [
                        m('.btn-group.bootstrap-select', [
                            m('.btn.btn-default.btn-lg', [
                                m('span.filter-option.pull-left', [
                                    m('i.fa.fa-spinner.fa-spin')
                                ]),
                                m('span.caret')
                            ])
                        ])
                    ]),
                    m('span.help-block', 'Set the system timezone.')
                ])
            ]),
            m('.form-group.form-actions', [
                m('.col-sm-offset-2.col-sm-10', [
                    m('button.btn.btn-default.btn-lg[type="button"]', {
                        onclick: function (e) {
                            settings.vm.cancel('environment');
                        }
                    }, 'Cancel'),
                    ' ',
                    m('button.btn.btn-primary.btn-lg[type="button"]', {
                        onclick: function (e) {
                            settings.vm.save('environment');
                        }
                    }, 'Save and apply')
                ])
            ])
        ]),
        m('fieldset.form-horizontal', [
            m('legend', 'RuneOS kernel settings'),
            m('.form-group', [
                m('label.control-label.col-sm-2[for="i2smodule"]', 'Linux Kernel'),
                m('.col-sm-10', [
                    m('select.selectpicker[data-style="btn-default btn-lg"][name="kernel"]', {
                        style: {
                            'display': ' none' // [TODO] mithril.createInput instead
                        }
                    }, [
                        m('option[selected=""][value="linux-arch-rpi_3.12.26-1-ARCH"]', 'Linux kernel 3.12.26-1   ARCH [RuneAudio v0.3-beta]'),
                        m('option[value="linux-rune-rpi_3.12.19-2-ARCH"]', 'Linux kernel 3.12.19-2   RUNE [RuneAudio v0.3-alpha]'),
                        m('option[value="linux-rune-rpi_3.6.11-18-ARCH+"]', 'Linux kernel 3.6.11-18   ARCH+ [RuneAudio v0.1-beta/v0.2-beta]'),
                        m('option[value="linux-rune-rpi_3.12.13-rt21_wosa"]', 'Linux kernel 3.12.13-rt   RUNE-RT [Wolfson Audio Card]')
                    ]),
                    m('.btn-group.bootstrap-select', [m('button.btn.dropdown-toggle.selectpicker.btn-default.btn-lg[data-toggle="dropdown"][title="Linux kernel 3.12.26-1&nbsp;&nbsp;&nbsp;ARCH&nbsp;[RuneAudio v0.3-beta]"][type="button"]', [m('span.filter-option.pull-left', 'Linux kernel 3.12.26-1   ARCH [RuneAudio v0.3-beta]'), ' ', m('span.caret')]), m('.dropdown-menu.open', [m('ul.dropdown-menu.inner.selectpicker[role="menu"]', [m('li.selected[rel="0"]', [m('a[tabindex="0"]', [m('span.text', 'Linux kernel 3.12.26-1   ARCH [RuneAudio v0.3-beta]'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="1"]', [m('a[tabindex="0"]', [m('span.text', 'Linux kernel 3.12.19-2   RUNE [RuneAudio v0.3-alpha]'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="2"]', [m('a[tabindex="0"]', [m('span.text', 'Linux kernel 3.6.11-18   ARCH+ [RuneAudio v0.1-beta/v0.2-beta]'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="3"]', [m('a[tabindex="0"]', [m('span.text', 'Linux kernel 3.12.13-rt   RUNE-RT [Wolfson Audio Card]'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])])])])]),
                    m('span.help-block', ['Switch Linux Kernel version (REBOOT REQUIRED). ', m('strong', 'Linux kernel 3.12.26-1'), ' is the default kernel in the current release, ', m('strong', 'Linux kernel 3.12.19-2'), ' is the kernel used in RuneAudio v0.3-alpha, ', m('strong', 'Linux kernel 3.6.11-18'), ' is the kernel used in RuneAudio v0.1-beta/v0.2-beta (it has no support for I²S), ', m('strong', 'Linux kernel 3.12.13-rt'), ' is an EXPERIMENTAL kernel (not suitable for all configurations), it is optimized for ', m('strong', 'Wolfson Audio Card'), ' support and it is the default option for that type of soundcard.'])
                ]),
                m('label.control-label.col-sm-2[for="i2smodule"]', 'I²S kernel modules'),
                m('.col-sm-10', [
                    m('select.selectpicker[data-style="btn-default btn-lg"][name="i2smodule"]', {
                        style: {
                            'display': ' none'// [TODO] mithril.createInput instead
                        }
                    }, [
                        m('option[value="none"]', 'I²S disabled (default)'),
                        m('option[value="berrynos"]', 'G2Labs BerryNOS'),
                        m('option[value="berrynosmini"]', 'G2Labs BerryNOS mini'),
                        m('option[value="hifiberrydac"]', 'HiFiBerry DAC'),
                        m('option[value="hifiberrydacplus"]', 'HiFiBerry DAC+'),
                        m('option[value="hifiberrydigi"]', 'HiFiBerry Digi / Digi+'),
                        m('option[value="iqaudiopidac"]', 'IQaudIO Pi-DAC / Pi-DAC+'),
                        m('option[value="raspyplay3"]', 'RaspyPlay3'),
                        m('option[value="raspyplay4"]', 'RaspyPlay4'),
                        m('option[selected=""][value="transducer"]', 'Transducer')
                    ]),
                    m('.btn-group.bootstrap-select', [m('button.btn.dropdown-toggle.selectpicker.btn-default.btn-lg[data-toggle="dropdown"][title="Transducer"][type="button"]', [m('span.filter-option.pull-left', 'Transducer'), ' ', m('span.caret')]), m('.dropdown-menu.open', [m('ul.dropdown-menu.inner.selectpicker[role="menu"]', [m('li[rel="0"]', [m('a[tabindex="0"]', [m('span.text', 'I²S disabled (default)'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="1"]', [m('a[tabindex="0"]', [m('span.text', 'G2Labs BerryNOS'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="2"]', [m('a[tabindex="0"]', [m('span.text', 'G2Labs BerryNOS mini'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="3"]', [m('a[tabindex="0"]', [m('span.text', 'HiFiBerry DAC'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="4"]', [m('a[tabindex="0"]', [m('span.text', 'HiFiBerry DAC+'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="5"]', [m('a[tabindex="0"]', [m('span.text', 'HiFiBerry Digi / Digi+'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="6"]', [m('a[tabindex="0"]', [m('span.text', 'IQaudIO Pi-DAC / Pi-DAC+'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="7"]', [m('a[tabindex="0"]', [m('span.text', 'RaspyPlay3'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="8"]', [m('a[tabindex="0"]', [m('span.text', 'RaspyPlay4'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li.selected[rel="9"]', [m('a[tabindex="0"]', [m('span.text', 'Transducer'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])])])])]),
                    m('span.help-block', ['Enable I²S output selecting one of the available sets of modules, specific for each hardware. Once set, the output interface will appear in the ', m('a[href="/mpd/"]', 'MPD configuration select menu'), ', and modules will also auto-load from the next reboot.'])
                ])
            ]),
            m('.form-group', [
                m('label.control-label.col-sm-2[for="orionprofile"]', 'Sound Signature (optimization profiles)'),
                m('.col-sm-10', [
                    m('select.selectpicker[data-style="btn-default btn-lg"][name="orionprofile"]', mithril.createInput(settings.vm.data, 'orionprofile', helpers.selectpicker), [
                        m('option[value="default"]', 'ArchLinux default'),
                        m('option[value="RuneAudio"]', 'RuneAudio'),
                        m('option[selected=""][value="ACX"]', 'ACX'),
                        m('option[value="Orion"]', 'Orion'),
                        m('option[value="OrionV2"]', 'OrionV2'),
                        m('option[value="OrionV3_berrynosmini"]', 'OrionV3 - (BerryNOS-mini)'),
                        m('option[value="OrionV3_iqaudio"]', 'OrionV3 - (IQaudioPi-DAC)'),
                        m('option[value="Um3ggh1U"]', 'Um3ggh1U')
                    ]),
                    m('span.help-block', ['These profiles include a set of performance tweaks that act on some system kernel parameters.\n It does not have anything to do with DSPs or other sound effects: the output is kept untouched (bit perfect).\n It happens that these parameters introduce an audible impact on the overall sound quality, acting on kernel latency parameters (and probably on the amount of overall \n ', m('a[href="http://www.thewelltemperedcomputer.com/KB/BitPerfectJitter.htm"][target="_blank"][title="Bit Perfect Jitter by Vincent Kars"]', 'jitter'), ').\n Sound results may vary depending on where music is listened, so choose according to your personal taste.\n (If you can"t hear any tangible differences... nevermind, just stick to the default settings.)'])
                ])
            ]),
            m('.form-group.form-actions', [
                m('.col-sm-offset-2.col-sm-10', [
                    m('button.btn.btn-primary.btn-lg[type="submit"]', 'Apply settings')
                ])
            ]),
            m('fieldset.form-horizontal[id="features-management"]', [
                m('legend', 'Features management'),
                m('p', 'Enable/disable optional modules that best suit your needs. Disabling unusued features will free system resources and might improve the overall performance.'),
                m('[id="airplayBox"]', {
                    className: settings.vm.data.features.airplay.enable ? 'boxed-group' : ''
                }, [
                    m('.form-group', [
                        m('label.control-label.col-sm-2[for="airplay"]', 'AirPlay'),
                        m('.col-sm-10', [
                            mithril.createYesNo('airplay', settings.vm.data.features.airplay, 'enable'),
                            m('span.help-block', 'Toggle the capability of receiving wireless streaming of audio via AirPlay protocol')
                        ])
                    ]),
                    m('[id="airplayName"]', {
                        className: settings.vm.data.features.airplay.enable ? '' : 'hide'
                    }, [
                        m('.form-group', [
                            m('label.control-label.col-sm-2[for="airplay-name"]', 'AirPlay name'),
                            m('.col-sm-10', [
                                m('input.form-control.input-lg[id="airplay_name"][name="features[airplay][name]"][placeholder="runeaudio"][type="text"][value="RuneAudio"]'),
                                m('span.help-block', 'AirPlay broadcast name')
                            ])
                        ])
                    ])
                ]),
                m('[id="spotifyBox"]', {
                    className: settings.vm.data.features.spotify.enable ? 'boxed-group' : ''
                }, [
                    m('.form-group', [
                        m('label.control-label.col-sm-2[for="spotify"]', 'Spotify'),
                        m('.col-sm-10', [
                            mithril.createYesNo('spotify', settings.vm.data.features.spotify, 'enable'),
                            m('span.help-block', ['Enable Spotify client [EXPERIMENTAL]. You must have a ', m('strong', [m('a[href="https://www.spotify.com/uk/premium/"][target="_blank"]', 'Spotify PREMIUM')]), ' account.'])
                        ])
                    ]),
                    m('[id="spotifyAuth"]', {
                        className: settings.vm.data.features.spotify.enable ? '' : 'hide'
                    }, [
                        m('.form-group', [
                            m('label.control-label.col-sm-2[for="spotify-usr"]', 'Username'),
                            m('.col-sm-10', [
                                m('input.form-control.input-lg[autocomplete="off"][id="spotify_user"][name="features[spotify][user]"][placeholder="user"][type="text"][value="user"]'),
                                m('span.help-block', ['Insert your Spotify ', m('i', 'username')])
                            ])
                        ]),
                        m('.form-group', [
                            m('label.control-label.col-sm-2[for="spotify-pasw"]', 'Password'),
                            m('.col-sm-10', [
                                m('input.form-control.input-lg[autocomplete="off"][id="spotify_pass"][name="features[spotify][pass]"][placeholder="pass"][type="password"][value="pass"]'),
                                m('span.help-block', ['Insert your Spotify ', m('i', 'password'), ' (case sensitive)'])
                            ])
                        ])
                    ])
                ]),
                m('[id="dlnaBox"]', {
                    className: settings.vm.data.features.dlna.enable ? 'boxed-group' : ''
                }, [
                    m('.form-group', [
                        m('label.control-label.col-sm-2[for="dlna"]', 'UPnP / DLNA'),
                        m('.col-sm-10', [
                            mithril.createYesNo('dlna', settings.vm.data.features.dlna, 'enable'),
                            m('span.help-block', 'Toggle the capability of receiving wireless streaming of audio via UPnP / DLNA protocol')
                        ])
                    ]),
                    m('[id="dlnaName"]', {
                        className: settings.vm.data.features.dlna.enable ? '' : 'hide'
                    }, [
                        m('.form-group', [
                            m('label.control-label.col-sm-2[for="dlna-name"]', 'UPnP / DLNA name'),
                            m('.col-sm-10', [
                                m('input.form-control.input-lg[id="dlna_name"][name="features[dlna][name]"][placeholder="runeaudio"][type="text"][value="RuneAudio"]'),
                                m('span.help-block', 'UPnP / DLNA broadcast name')
                            ])
                        ])
                    ])
                ]),
                m('.form-group', [
                    m('label.control-label.col-sm-2[for="udevil"]', 'USB Automount'),
                    m('.col-sm-10', [
                        mithril.createYesNo('udevil', settings.vm.data.features, 'udevil'),
                        m('span.help-block', 'Toggle automount for USB drives')
                    ])
                ]),
                m('.form-group', [
                    m('label.control-label.col-sm-2[for="coverart"]', 'Display album cover'),
                    m('.col-sm-10', [
                        mithril.createYesNo('coverart', settings.vm.data.features, 'coverart'),
                        m('span.help-block', 'Toggle the display of album art on the Playback main screen')
                    ])
                ]),
                m('[id="lastfmBox"]', {
                    className: settings.vm.data.features.lastfm.enable ? 'boxed-group' : ''
                }, [
                    m('.form-group', [
                        m('label.control-label.col-sm-2[for="lastfm"]', [m('i.fa.fa.fa-lastfm-square'), ' Last.fm']),
                        m('.col-sm-10', [
                            mithril.createYesNo('enable', settings.vm.data.features.lastfm, 'enable'),
                            m('span.help-block', 'Send to Last.fm informations about the music you are listening to (requires a Last.fm account)')
                        ])
                    ]),
                    m('[id="lastfmAuth"]', {
                        className: settings.vm.data.features.lastfm.enable ? '' : 'hide'
                    }, [
                        m('.form-group', [
                            m('label.control-label.col-sm-2[for="lastfm-usr"]', 'Username'),
                            m('.col-sm-10', [
                                m('input.form-control.input-lg[autocomplete="off"][id="lastfm_user"][name="features[lastfm][user]"][placeholder="user"][type="text"][value="user"]'),
                                m('span.help-block', ['Insert your Last.fm ', m('i', 'username')])
                            ])
                        ]),
                        m('.form-group', [
                            m('label.control-label.col-sm-2[for="lastfm-pasw"]', 'Password'),
                            m('.col-sm-10', [
                                m('input.form-control.input-lg[autocomplete="off"][id="lastfm_pass"][name="features[lastfm][pass]"][placeholder="pass"][type="password"][value="pass"]'),
                                m('span.help-block', ['Insert your Last.fm ', m('i', 'password'), ' (case sensitive)'])
                            ])
                        ])
                    ])
                ]),
                m('.form-group.form-actions', [
                    m('.col-sm-offset-2.col-sm-10', [
                        m('button.btn.btn-primary.btn-lg[name="features[submit]"][type="button"]', {
                            onclick: function (e) {
                                settings.vm.save('features');
                            }
                        }, 'apply settings')
                    ])
                ])
            ]),
            m('fieldset.form-horizontal', [
                m('legend', 'Compatibility fixes'),
                m('p', 'For people suffering problems with some receivers and DACs.'),
                m('.form-group', [
                    m('label.control-label.col-sm-2[for="cmediafix"]', 'CMedia fix'),
                    m('.col-sm-10', [
                        m('label.switch-light.well', [
                            m('input[name="cmediafix[1]"][type="checkbox"]'),
                            m('span', [m('span', 'OFF'), m('span', 'ON')]),
                            m('a.btn.btn-primary')
                        ]),
                        m('span.help-block', ['For those who have a CM6631 receiver and experiment issues (noise, crackling) between tracks with different sample rates and/or bit depth.', m('br'), ' \n                    A \'dirty\' fix that should avoid the problem, do NOT use if everything works normally.'])
                    ])
                ]),
                m('.form-group.form-actions', [
                    m('.col-sm-offset-2.col-sm-10', [
                        m('button.btn.btn-primary.btn-lg[name="cmediafix[0]"][type="submit"]', 'Apply fixes')
                    ])
                ])
            ]),
            m('fieldset.form-horizontal', [
                m('legend', 'Backup / Restore configuration'),
                m('p', 'Transfer settings between multiple RuneAudio installations, saving time during new/upgrade installations.'),
                m('.form-group', [
                    m('label.control-label.col-sm-2', 'Backup player config'),
                    m('.col-sm-10', [
                        m('input.btn.btn-primary.btn-lg[id="syscmd-backup"][name="syscmd"][type="submit"][value="backup"]'),
                        m('span.help-block', 'NOTE: restore feature will come in 0.4 release.')
                    ])
                ])
            ])
        ])
    ];
};