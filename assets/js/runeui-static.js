

// MITHRIL
// ----------------------------------------------------------------------------------------------------

// namespaces
var config = {};
var playback = {};

// helpers

// base 2-way binding helper
var createInput = function (container, field, config, readonly) {
    // container: for example 'mpd.vm.data.conf'
    // field: for example 'port or audio_mixer'
    // config: jQuery function to run after the item is in the DOM
    var attributes = {
        config: config,
        onchange: m.withAttr('value', function (value) { container[field] = value; }),
        value: decodeHtmlEntity(container[field])
    };

    if (readonly) {
        attributes.readonly = true;
    }

    return attributes;

};

var createInputchecked = function (container, field, config) {
    // container: for example 'mpd.vm.data.conf'
    // field: for example 'port or audio_mixer'
    // config: jQuery function to run after the item is in the DOM
    return {
        config: config,
        onchange: m.withAttr('checked', function (value) {
            if (value) {
                container[field] = "yes";
            } else {
                container[field] = "no";
            }
        }),
        checked: (function () {
            if (container[field] === "yes") {
                return true;
            } else {
                return false;
            }
        }())
    };
};

// components
var select = function () {
    var select = {};
    select.vm = {
        id: '',
        container: '',
        field: '',
        url: '',
        valueField: '',
        displayField: '',
        config: {}
    };
    select.view = function (ctrl) {
        var selectTag = 'select[data-style="btn-default btn-lg"][id="' + id + '"]';
        return m(selectTag, createInput(container, field, selectpicker),
        [container[list].map(function (item, index) {
            return m('option', { value: item[valueField] }, decodeHtmlEntity(item[displayField]));
        })
        ]);
    };
};

var createLabel = function (id, text) {
    return m('label.col-sm-2.control-label', { "for": id, }, text);
};

//      base data loading function
var getData = function (vm) {
    var url = vm.url;
    if (vm.id) {
        url += '/' + vm.id;
    }
    toggleLoader('open');
    var loaderClose = function () {
        toggleLoader('close');
    };
    var loaderCloseFail = function () {
        console.log('FAIL');
    };
    return m.request({ method: 'GET', url: url }).then(function (response) {
        vm.data = response;
        vm.originalData = JSON.parse(JSON.stringify(response)); // we need a clone of this object
    }).then(loaderClose, loaderCloseFail);
};

//      base data saving function
var postData = function (url, data) {
    console.log(url);
    console.log(data);
    toggleLoader('open');
    var loaderClose = function () {
        toggleLoader('close');
    };
    var loaderCloseFail = function () {
        console.log('FAIL');
    };
    m.request({
        method: 'POST',
        url: url,
        data: data,
        unwrapSuccess: function (response) {
            return;
        },
        unwrapError: function (response) {
            return "oops";
        },
        // PHP errors are not wrapped in Proper JSON,. breaking Mitrhil
        deserialize: function (value) { return value; }
    }).then(loaderClose, loaderCloseFail);

};

var turnoff = {
    vm: (function (data) {

        var vm = {};

        vm.off = function () {
            console.log('off');
            postData('/system', { poweroff: true });
        };

        vm.reboot = function () {
            console.log('reboot');
            postData('/system', { reboot: true });
        };

        vm.init = function () {
            $('#dialog').modal('show');
        };

        return vm;

    }()),
    controller: function () {
        turnoff.vm.init();
    },
    view: function (ctrl) {
        console.log('in turnoff.view()');
        return [m('.modal-dialog.modal-sm', [
                m('.modal-content', [
                    m('.modal-header', [
                        m('button.close[aria-hidden="true"][data-dismiss="modal"][type="button"]', '×'),
                        m('h4.modal-title[id="poweroff-modal-label"]', 'Turn off the player')
                    ]),
                    m('.modal-body.txtmid', [
                        m('button.btn.btn-primary.btn-lg.btn-block[data-dismiss="modal"][id="syscmd-poweroff"]', { onclick: turnoff.vm.off }, [m('i.fa.fa-power-off.sx'), ' Power off']),
                        m('button.btn.btn-primary.btn-lg.btn-block[data-dismiss="modal"][id="syscmd-reboot"]', { onclick: turnoff.vm.reboot }, [m('i.fa.fa-refresh.sx'), ' Reboot'])
                    ]),
                    m('.modal-footer', [
                        m('button.btn.btn-default.btn-lg[aria-hidden="true"][data-dismiss="modal"]', 'Cancel')
                    ])
                ])
        ])
        ];
    }
};

var resetmpd = {
    vm: (function (data) {

        var vm = {};

        vm.reset = function () {
            console.log('reset');
            postData('/mpd', { reset: true });
        };

        vm.init = function () {
            $('#dialog').modal('show');
        };

        return vm;

    }()),
    controller: function () {
        resetmpd.vm.init();
    },
    view: function (ctrl) {
        console.log('in resetmpd.view()');
        return [m('.modal-dialog',
            [m('.modal-content', [
                m('.modal-header', [
                    m('button.close[aria-hidden="true"][data-dismiss="modal"][type="button"]', '×'), m('h3.modal-title[id="mpd-config-defaults-label"]', 'Reset the configuration')]
                    ), m('.modal-body',
                        [m('p', ['You are going to reset the configuration to the default original values.', m('br'), ' You will lose any modification.'])]),
                        m('.modal-footer', [' ', m('input[name="reset"][type="hidden"][value="1"]'),
                        m('button.btn.btn-default.btn-lg[aria-hidden="true"][data-dismiss="modal"]', 'Cancel'),
                        m('button.btn.btn-primary.btn-lg[type="submit"]', { onclick: resetmpd.vm.reset }, 'Continue')
                        ])
            ])
            ])
        ];
    }
};

var deleteSource = {
    vm: (function (data) {

        var vm = {};

        vm.remove = function () {
            console.log('reset');
            //postData('/sources', { ???: ??? });
        };

        vm.init = function () {
            $('#dialog').modal('show');
        };

        return vm;

    }()),
    controller: function () {
        deleteSource.vm.init();
    },
    view: function () {
        return [
        m(".modal.fade[aria-hidden='true'[id='source-delete-modal'][role='dialog'][tabindex='-1']", [
            m(".modal-dialog", [
                m(".modal-content", [
                    m(".modal-header", [
                        m("button.close[aria-hidden='true'][data-dismiss='modal'][type='button']", "×"),
                        m("h3.modal-title[id='source-delete-modal-label']", "Remove the mount")
                    ]),
                    m(".modal-body", [
                        m("p", "Are you sure you want to delete this mount?")
                    ]),
                    m(".modal-footer", [
                        m("button.btn.btn-default.btn-lg[aria-hidden='true'][data-dismiss='modal']", "Cancel"),
                        m("button.btn.btn-primary.btn-lg[name='action'][type='submit'][value='delete']", { onclick: resetmpd.vm.remove }, "Remove"),
                        m("input[name='mount[id]'][type='hidden'][value='']")
                    ])
                ])
            ])
        ])
        ];
    }
};




// modules - navigation
var navigation = {
    Page: function (data) {
        this.name = m.prop(data.name);
        this.url = m.prop(data.url);
        this.icon = m.prop(data.icon);
        this.selected = m.prop(data.selected || false);
        this.action = function () { data.action(); };
    },
    vm: (function (data) {

        var vm = {};
        vm.pages = [];

        vm.add = function (name, url, icon, action) {
            vm.pages.push(new navigation.Page({ name: name, url: url, icon: icon, action: action }));
        };

        vm.navigate = function (url) {
            for (i = 0; i < vm.pages.length - 1; i++) {
                if (vm.pages[i].url() === url) {
                    vm.pages[i].selected(true);
                } else {
                    vm.pages[i].selected(false);
                }
            }
        };

        vm.init = function () {
            this.add('Playback', '/', 'play');                  // Out of Scope
            this.add('Audio', '/audio', 'volume-up');           // TODO: Needs a controller [ao, mixer_type, sound profile from settings]
            this.add('MPD', '/mpd', 'cogs');                    //
            this.add('Settings', '/settings', 'wrench');        //
            this.add('Sources', '/sources', 'folder-open');     //
            this.add('Network', '/network', 'sitemap');         // HOLD until backend WiFi is complete
            this.add('Debug', '/debug', 'bug');                 //
            this.add('Credits', '/credits', 'trophy');          //
            this.add('Turn off', '', 'power-off', function () { m.module(document.getElementById('dialog'), turnoff); });        //
        };

        return vm;

    }()),
    controller: function () {
        navigation.vm.init();
    },
    view: function (ctrl) {
        return [m("a.dropdown-toggle[data-target='#'][data-toggle='dropdown'][href='#'][id='menu-settings'][role='button']",
                ["MENU ", m("i.fa.fa-bars.dx")]), "\n", m("ul.dropdown-menu[aria-labelledby='menu-settings'][role='menu']",
                    [navigation.vm.pages.map(function (item, index) {
                        return m('li', { classname: item.selected() ? "active" : "" },
                            item.url() ? [m('a[href="' + item.url() + '"]', { config: m.route }, [m('i.fa.fa-' + item.icon()), ' ' + item.name()])] : [m('a', { onclick: function (e) { console.log(e); item.action(); } }, [m('i.fa.fa-' + item.icon()), ' ' + item.name()])]);
                    })])];
    }
};
m.module(document.getElementById('main-menu'), navigation);

// base classes



//      base view model
var getViewModel = function (url) {
    var vm = {};

    // properties of all our viewmodels
    var urlPrefix = '/api';
    vm.url = urlPrefix + url;
    vm.validate = function () {
        return true;
    };

    // initialize the view model
    vm.init = function (id) {
        this.id = id;
        // property 'data' is defined here asnd the loading is set up
        this.data = getData(this);

        console.log("* in vm init");
        navigation.vm.navigate(this.url.replace(urlPrefix, ''));
        //return m.request({ method: 'GET', url: vm.url }).then(function (response) {
        //    vm.data = response;
        //    vm.originalData = JSON.parse(JSON.stringify(response)); // we need a clone of this object
        //});
    };

    // methods of all of view models
    vm.save = function (field) {
        if (vm.validate()) {
            if (field) {
                var d = {};
                d[field] = vm.data[field];
                postData(vm.url, d);
                console.log(d);
            } else {
                postData(vm.url, vm.data);
                console.log(vm.data);
            }

        } else {
            // validation failed
            alert('validation failed');
        }
    };

    // methods of all of view models
    vm.cancel = function (field) {
        if (field) {
            vm.data[field] = JSON.parse(JSON.stringify(vm.originalData[field]));
        } else {
            vm.data = JSON.parse(JSON.stringify(vm.originalData)); // we need a clone of this object
        }
    };

    return vm;
};

//      base controller
var getController = function (vm) {
    var controller = function () {
        this.id = m.route.param("id");
        vm.init(this.id);
        toggleLoader('close');
        console.log("* in controller");

        this.onunload = function () {

        };
    };
    return controller;
};

var createYesNo = function (id, container, field, config) {
    return m('label.switch-light.well', [
    m('input[id="' + id + '"][type="checkbox"]', createInputchecked(container, field)),
    m('span', [m('span', 'OFF'), m('span', 'ON')]),
    m('a.btn.btn-primary')
    ]);
};

// createSelectYesNo('the-field', mpd.vm.data, 'the-field', selectpicker)
var createSelectYesNo = function (id, container, field, config) {
    return m('select[data-style="btn-default btn-lg"][id="' + id + '"]',
        createInput(container, field, selectpicker),
        [m('option[value="yes"]', 'enabled'),
            m('option[value="no"]', 'disabled')]);
};

// createSelect('the-field', mpd.vm.data, 'list-field-with-oprions', selectpicker)
// createSelect('ao', mpd.vm.data, 'ao', 'acards', 'name', 'extlabel', selectpicker)
var createSelect = function (id, container, field, list, valueField, displayField, config) {
    return m('select[data-style="btn-default btn-lg"][id="' + id + '"]',
        createInput(container, field, selectpicker),
        [container[list].map(function (item, index) {
            return m('option', { value: item[valueField] }, decodeHtmlEntity(item[displayField]));
        })
        ]);
};

var RuneModule = function (url) {
    var module = {};
    module.vm = getViewModel(url);
    module.controller = getController(module.vm);
    return module;
};

// modules - config

var audio = new RuneModule('/audio');
var audio_validate = function () {
    alert('audio.vm.validate');
    // we only need to send 'conf', 'ao', 'orionprofile'

    return true;
};
audio.vm.validate = audio_validate;

var mpd = new RuneModule('/mpd');
mpd.vm.saveAudioOutput = function () {
    postData(mpd.vm.url, mpd.vm.ao);
};

// Do we want the Modules in Namespaces?
//     config.mpd = mpd;
var settings = new RuneModule('/settings');

var sources = new RuneModule('/sources');
sources.vm.updateMDP = function () {
    postData(sources.vm.url, { updatempd: true });
};
sources.vm.updateMDP = function () {
    postData(sources.vm.url, { mountall: true });
};
sources.vm.add = function () {
    console.log('source add');
    m.route('/sources/0');
};
sources.vm.edit = function (id) {
    console.log('source edit');
    m.route('/sources/' + id);
};

var source = new RuneModule('/sources');
source.Source = function (data) {
    this.nas_name = m.prop(data.nas_name || '');
};
source.vm.validate = function () {
    var d = new source.Source(source.vm.data);
    if (d.nas_name() === '') {
        alert('Nas Name is Required');
        return false;
    }
    return true;
};

var network = new RuneModule('/network');
network.vm.updateMDP = function () {
    postData(sources.vm.url, { mountall: true });
};

var credits = new RuneModule('/credits');
var debug = new RuneModule('/debug');
var dev = new RuneModule('/dev');
var error = new RuneModule('/error');



// modules - playback
var control = {};
var playlist = {};
var volume = {};

// views
audio.view = function (ctrl) {
    return [m('h1', 'Audio Configuration'),
           m('fieldset', [
               m('legend', 'Audio Output'),
                   m('.form-group', [
                       createLabel('audio-output-interface', 'Audio output interface'),
                       m('.col-sm-10', [
                           createSelect('audio-output-interface', audio.vm.data, 'ao', 'acards', 'name', 'extlabel', selectpicker),
                           m('span.help-block', ['This is the current output interface.'
                           ])
                       ])
                   ]),
               m('.form-group.form-actions', [
                   m('.col-sm-offset-2.col-sm-10', [
                       m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function (e) { audio.vm.cancel('ao'); } }, 'Cancel'),
                       m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function (e) { audio.vm.save('ao'); } }, 'Save and apply')
                   ])
               ])
           ]),
           m('fieldset', [
               m('legend', 'Volume control'),
               m('.form-group', [
                   m('label.col-sm-2.control-label[for="mixer-type"]', 'Volume control'),
                   m('.col-sm-10', [
                       m('select[data-style="btn-default btn-lg"][id="mixer-type"]',
                           //{ config: selectpicker, onchange: m.withAttr('value', function (value) { mpd.data.conf.mixer_type = value }), value: mpd.data.conf.mixer_type }
                           createInput(audio.vm.data.conf, 'mixer_type', selectpicker), [
                           m('option[value="disabled"]', 'disabled'),
                           m('option[value="software"]', 'enabled - software'),
                           m('option[value="hardware"]', 'enabled - hardware')
                           ]),
                       m('span.help-block', [
                           m('strong', 'disabled'),
                           ' - Volume knob disabled. Use this option to achieve the ',
                           m('strong', 'best audio quality'),
                           '.\n\n                ',
                           m('strong', 'software'),
                           ' - Volume knob enabled, controlled by ',
                           m('strong', 'software mixer'),
                           '. This option ',
                           m('strong', 'reduces the overall sound quality'),
                           '.\n\n                ',
                           m('strong', 'hardware'),
                           ' - Volume knob enabled, controlled by ',
                           m('strong', 'hardware mixer'),
                           '. This option enables the volume control and let you achieve ',
                           m('strong', 'very good overall sound quality'),
                           '.\n\n                ',
                           m('i', 'Note: hardware mixer must be supported directly from your sound card hardware.')
                       ])
                   ])
               ]),
               m('.form-group.form-actions', [
                   m('.col-sm-offset-2.col-sm-10', [
                       m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function (e) { audio.vm.cancel('conf'); } }, 'Cancel'),
                       m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function (e) { audio.vm.save('conf'); } }, 'Save and apply')
                   ])
               ])
           ]),
           m('fieldset', [
               m('legend', 'Sound Signature'),
               m('.form-group', [
                     m("label.control-label.col-sm-2[for='orionprofile']", "Sound Signature (optimization profiles)"),
                     m(".col-sm-10", [
                         m("select.selectpicker[data-style='btn-default btn-lg']", createInput(audio.vm.data, 'orionprofile', selectpicker), [
                             m("option[value='default']", "ArchLinux default"),
                             m("option[value='RuneAudio']", "RuneAudio"),
                             m("option[selected=''][value='ACX']", "ACX"),
                             m("option[value='Orion']", "Orion"),
                             m("option[value='OrionV2']", "OrionV2"),
                             m("option[value='OrionV3_berrynosmini']", "OrionV3 - (BerryNOS-mini)"),
                             m("option[value='OrionV3_iqaudio']", "OrionV3 - (IQaudioPi-DAC)"),
                             m("option[value='Um3ggh1U']", "Um3ggh1U")
                         ]),
                         m("span.help-block", ["These profiles include a set of performance tweaks that act on some system kernel parameters.\n                    It does not have anything to do with DSPs or other sound effects: the output is kept untouched (bit perfect).\n                    It happens that these parameters introduce an audible impact on the overall sound quality, acting on kernel latency parameters (and probably on the amount of overall \n                    ", m("a[href='http://www.thewelltemperedcomputer.com/KB/BitPerfectJitter.htm'][target='_blank'][title='Bit Perfect Jitter by Vincent Kars']", "jitter"), ").\n                    Sound results may vary depending on where music is listened, so choose according to your personal taste.\n                    (If you can't hear any tangible differences... nevermind, just stick to the default settings.)"])
                     ])
               ])]),
               m('.form-group.form-actions', [
                   m('.col-sm-offset-2.col-sm-10', [
                       m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function (e) { audio.vm.cancel('orionprofile'); } }, 'Cancel'),
                       m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function (e) { audio.vm.save('orionprofile'); } }, 'Save and apply')
                   ])
               ])
    ];
};

mpd.view = function (ctrl) {
    return [m('h1', 'MPD Configuration'), '\n', m('p', ['\n    If you mess up with this configuration you can ', m('a', { onclick: function (e) { m.module(document.getElementById('dialog'), resetmpd); } }, 'reset to default'), '.\n']), '\n',
        m('fieldset', [
			m('legend', 'Audio Output'),
				m('.form-group', [
                    createLabel('ao', 'Audio output interface'),
					m('.col-sm-10', [
                        //(id, container, field, list, valueField, displayField, config)
                        m('input.form-control.input-lg[data-trigger="change"][id="ao"][type="text"]', createInput(mpd.vm.data, 'ao', null, true)),
						//createSelect('audio-output-interface', mpd.vm.data, 'ao', 'acards', 'name', 'extlabel', selectpicker),
                        m('span.help-block', ['This is the current output interface. It can be ', m('a[href="/audio"]', { config: m.route }, 'configured here'), '.'
                        ])
					])
				])
        ]),
		m('fieldset', [
			m('legend', 'Volume control'),
			m('.form-group', [
				createLabel('mixer-type', 'Volume control'),
				m('.col-sm-10', [
                    m('input.form-control.input-lg[id="mixer-type"][type="text"]', createInput(mpd.vm.data.conf, 'mixer_type', null, true)),
					m('span.help-block', ['This is the current volume control setting. It can be ', m('a[href="/audio"]', { config: m.route }, 'configured here'), '.'
					])
				])
			])
		]),
		m('fieldset', [
			m('legend', 'General music daemon options'),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="port"]', 'Port'),
				m('.col-sm-10', [
					m('input.form-control.input-lg[data-trigger="change"][disabled=""][id="port"][name="conf[port]"][type="text"]', createInput(mpd.vm.data.conf, 'port')),
					m('span.help-block', 'This setting is the TCP port that is desired for the daemon to get assigned to.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="daemon-user"]', 'Daemon user : group'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="user"][name="conf[user]"]', createInput(mpd.vm.data.conf, 'user', selectpicker), [
						m('option[selected=""][value="mpd"]', 'mpd : audio (default)'),
						m('option[value="root"]', 'root : root')
					]),
					m('span.help-block', 'This specifies the system user : group that MPD will run as.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="log-level"]', 'Log level'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="log-level"][name="conf[log_level]"]', createInput(mpd.vm.data.conf, 'log_level', selectpicker), [
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
                    //              (id, container, field, config)
                    createYesNo('state_file', mpd.vm.data.conf, 'state_file', selectpicker),
					//m('select[data-style="btn-default btn-lg"][id="log-level"][name="conf[state_file]"]', { config: selectpicker }, [
					//	m('option[selected=""][value="yes"]', 'enabled'),
					//	m('option[value="no"]', 'disabled')
					//])
					m('span.help-block', 'This setting specifies if a state file is used. If the state file is active, the state of mpd will be saved when mpd is terminated by a TERM signal or by the \'kill\' command. When mpd is restarted, it will read the state file and restore the state of mpd (including the playlist).')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="ffmpeg"]', 'FFmpeg decoder plugin'),
				m('.col-sm-10', [
					createYesNo('ffmpeg', mpd.vm.data.conf, 'ffmpeg', selectpicker),
					m('span.help-block', 'FFmpeg decoder plugin. Enable this setting if you need AAC / ALAC support. May slow down MPD database refresh.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="gapless-mp3-playback"]', 'Gapless mp3 playback'),
				m('.col-sm-10', [
					createYesNo('gapless-mp3-playback', mpd.vm.data.conf, 'gapless_mp3_playback', selectpicker),
					m('span.help-block', 'If you have a problem with your MP3s ending abruptly it is recommended that you set this argument to \'no\' to attempt to fix the problem. If this solves the problem, it is highly recommended to fix the MP3 files with vbrfix (available as vbrfix in the debian archive), at which point gapless MP3 playback can be enabled.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="dsd-usb"]', 'DSD support'),
				m('.col-sm-10', [
					createYesNo('dsd-usb', mpd.vm.data.conf, 'dsd_usb', selectpicker),
					m('span.help-block', 'Enable DSD audio support.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="volume-normalization"]', 'Volume normalization'),
				m('.col-sm-10', [
					createYesNo('volume-normalization', mpd.vm.data.conf, 'volume_normalization', selectpicker),
					m('span.help-block', 'If yes, mpd will normalize the volume of songs as they play. The default is no')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="port"]', 'Audio buffer size'),
				m('.col-sm-10', [
					m('input.form-control.input-lg[data-trigger="change"][id="audio-buffer-size"][min="512"][name="conf[audio_buffer_size]"][type="number"]', createInput(mpd.vm.data.conf, 'audio_buffer_size')),
					m('span.help-block', 'This specifies the size of the audio buffer in kibibytes. The default is 2048, large enough for nearly 12 seconds of CD-quality audio.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="dsd-usb"]', 'Buffer before play'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="buffer-before-play"][name="conf[buffer_before_play]"]', createInput(mpd.vm.data.conf, 'buffer_before_play', selectpicker), [
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
					createYesNo('auto-update', mpd.vm.data.conf, 'auto_update', selectpicker),
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

settings.view = function (ctrl) {
    return [
         m('h1', 'Settings'),
             m('fieldset', [
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
                         m('input.form-control.input-lg[autocomplete="off"][id="hostname"][placeholder="runeaudio"][type="text"]', createInput(settings.vm.data.environment, 'hostname')),
                         m('span.help-block', 'Set the player hostname. This will change the address used to reach the RuneUI.')
                     ])
                 ]),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="ntpserver"]', 'NTP server'),
                     m('.col-sm-10', [
                         m('input.form-control.input-lg[autocomplete="off"][id="ntpserver"][placeholder="pool.ntp.org"][type="text"]', createInput(settings.vm.data.environment, 'ntpserver')),
                         m('span.help-block', ['Set your reference time sync server ', m('i', '(NTP server)'), '.'])
                     ])
                 ]),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="timezone"]', 'Timezone'),
                     m('.col-sm-10', [
                         createSelect('timezone', settings.vm.data.environment, 'timezone', 'timezones', 'value', 'name', selectpicker),
                         m('span.help-block', 'Set the system timezone.')
                     ])
                 ]),
                 //m('.form-group.form-actions', [
                 //    m('.col-sm-offset-2.col-sm-10', [
                 //        m('button.btn.btn-primary.btn-lg[name="save"][type="submit"][value="save"]', 'Apply settings')
                 //    ])
                 //]),
                 m('.form-group.form-actions', [
                   m('.col-sm-offset-2.col-sm-10', [
                       m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function (e) { settings.vm.cancel('environment'); } }, 'Cancel'),
                       m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function (e) { settings.vm.save('environment'); } }, 'Save and apply')
                   ])
                 ])
             ]),
             m('fieldset', [
                 m('legend', 'RuneOS kernel settings'),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="i2smodule"]', 'Linux Kernel'),
                     m('.col-sm-10', [
                         m('select.selectpicker[data-style="btn-default btn-lg"][name="kernel"]', { style: { 'display': ' none' } }, [
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
                         m('select.selectpicker[data-style="btn-default btn-lg"][name="i2smodule"]', { style: { 'display': ' none' } }, [
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
                         m('select.selectpicker[data-style="btn-default btn-lg"][name="orionprofile"]', createInput(settings.vm.data, "orionprofile", selectpicker), [
                             m('option[value="default"]', 'ArchLinux default'),
                             m('option[value="RuneAudio"]', 'RuneAudio'),
                             m('option[selected=""][value="ACX"]', 'ACX'),
                             m('option[value="Orion"]', 'Orion'),
                             m('option[value="OrionV2"]', 'OrionV2'),
                             m('option[value="OrionV3_berrynosmini"]', 'OrionV3 - (BerryNOS-mini)'),
                             m('option[value="OrionV3_iqaudio"]', 'OrionV3 - (IQaudioPi-DAC)'),
                             m('option[value="Um3ggh1U"]', 'Um3ggh1U')
                         ]),
                         m('span.help-block', ['These profiles include a set of performance tweaks that act on some system kernel parameters.\n                    It does not have anything to do with DSPs or other sound effects: the output is kept untouched (bit perfect).\n                    It happens that these parameters introduce an audible impact on the overall sound quality, acting on kernel latency parameters (and probably on the amount of overall \n                    ', m('a[href="http://www.thewelltemperedcomputer.com/KB/BitPerfectJitter.htm"][target="_blank"][title="Bit Perfect Jitter by Vincent Kars"]', 'jitter'), ').\n                    Sound results may vary depending on where music is listened, so choose according to your personal taste.\n                    (If you can"t hear any tangible differences... nevermind, just stick to the default settings.)'])
                     ])
                 ]),
                 m('.form-group.form-actions', [
                     m('.col-sm-offset-2.col-sm-10', [
                         m('button.btn.btn-primary.btn-lg[type="submit"]', 'Apply settings')
                     ])
                 ]),
             m('fieldset[id="features-management"]', [
                 m('legend', 'Features management'),
                 m('p', 'Enable/disable optional modules that best suit your needs. Disabling unusued features will free system resources and might improve the overall performance.'),
                 m('[id="airplayBox"]', [
                     m('.form-group', [
                         m('label.control-label.col-sm-2[for="airplay"]', 'AirPlay'),
                         m('.col-sm-10', [
                             //m('label.switch-light.well[onclick=""]', [
                             //	m('input[data-parsley-id="0451"][data-parsley-multiple="featuresairplayenable"][id="airplay"][name="features[airplay][enable]"][type="checkbox"][value="1"]'),
                             //	m('span', [m('span', 'OFF'), m('span', 'ON')]),
                             //	m('a.btn.btn-primary')
                             //]),
                             //m('ul.parsley-errors-list[id="parsley-id-multiple-featuresairplayenable"]'),
                             m('span.help-block', 'Toggle the capability of receiving wireless streaming of audio via AirPlay protocol')
                         ])
                     ]),
                     m('.hide[id="airplayName"]', [
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="airplay-name"]', 'AirPlay name'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[data-parsley-id="0928"][data-trigger="change"][id="airplay_name"][name="features[airplay][name]"][placeholder="runeaudio"][type="text"][value="RuneAudio"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-0928"]'),
                                 m('span.help-block', 'AirPlay broadcast name')
                             ])
                         ])
                     ])
                 ]),
                 m('[id="spotifyBox"]', [
                     m('.form-group', [
                         m('label.control-label.col-sm-2[for="spotify"]', 'Spotify'),
                         m('.col-sm-10', [
                             m('label.switch-light.well[onclick=""]', [
                                 m('input[data-parsley-id="3701"][data-parsley-multiple="featuresspotifyenable"][id="spotify"][name="features[spotify][enable]"][type="checkbox"][value="1"]'),
                                 m('span', [m('span', 'OFF'), m('span', 'ON')]),
                                 m('a.btn.btn-primary.')
                             ]),
                             m('ul.parsley-errors-list[id="parsley-id-multiple-featuresspotifyenable"]'),
                             m('span.help-block', ['Enable Spotify client [EXPERIMENTAL]. You must have a ', m('strong', [m('a[href="https://www.spotify.com/uk/premium/"][target="_blank"]', 'Spotify PREMIUM')]), ' account.'])
                         ])
                     ]),
                     m('.hide[id="spotifyAuth"]', [
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="spotify-usr"]', 'Username'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="0174"][data-trigger="change"][id="spotify_user"][name="features[spotify][user]"][placeholder="user"][type="text"][value="user"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-0174"]'),
                                 m('span.help-block', ['Insert your Spotify ', m('i', 'username')])
                             ])
                         ]),
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="spotify-pasw"]', 'Password'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="0985"][id="spotify_pass"][name="features[spotify][pass]"][placeholder="pass"][type="password"][value="pass"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-0985"]'),
                                 m('span.help-block', ['Insert your Spotify ', m('i', 'password'), ' (case sensitive)'])
                             ])
                         ])
                     ])
                 ]),
                 m('[id="dlnaBox"]', [
                     m('.form-group', [
                         m('label.control-label.col-sm-2[for="dlna"]', 'UPnP / DLNA'),
                         m('.col-sm-10', [
                             m('label.switch-light.well[onclick=""]', [
                                 m('input[data-parsley-id="1837"][data-parsley-multiple="featuresdlnaenable"][id="dlna"][name="features[dlna][enable]"][type="checkbox"][value="1"]'),
                                 m('span', [m('span', 'OFF'), m('span', 'ON')]),
                                 m('a.btn.btn-primary')
                             ]),
                             m('ul.parsley-errors-list[id="parsley-id-multiple-featuresdlnaenable"]'),
                             m('span.help-block', 'Toggle the capability of receiving wireless streaming of audio via UPnP / DLNA protocol')
                         ])
                     ]),
                     m('.hide[id="dlnaName"]', [
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="dlna-name"]', 'UPnP / DLNA name'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[data-parsley-id="8193"][data-trigger="change"][id="dlna_name"][name="features[dlna][name]"][placeholder="runeaudio"][type="text"][value="RuneAudio"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-8193"]'),
                                 m('span.help-block', 'UPnP / DLNA broadcast name')
                             ])
                         ])
                     ])
                 ]),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="udevil"]', 'USB Automount'),
                     m('.col-sm-10', [
                         m('label.switch-light.well[onclick=""]', [
                             m('input[data-parsley-id="1024"][data-parsley-multiple="featuresudevil"][name="features[udevil]"][type="checkbox"][value="1"]'),
                             m('span', [m('span', 'OFF'), m('span', 'ON')]),
                             m('a.btn.btn-primary')
                         ]),
                         m('ul.parsley-errors-list[id="parsley-id-multiple-featuresudevil"]'),
                         m('span.help-block', 'Toggle automount for USB drives')
                     ])
                 ]),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="coverart"]', 'Display album cover'),
                     m('.col-sm-10', [
                         m('label.switch-light.well[onclick=""]', [
                             m('input[checked="checked"][data-parsley-id="5818"][data-parsley-multiple="featurescoverart"][name="features[coverart]"][type="checkbox"][value="1"]'),
                             m('span', [m('span', 'OFF'), m('span', 'ON')]),
                             m('a.btn.btn-primary')
                         ]),
                         m('ul.parsley-errors-list[id="parsley-id-multiple-featurescoverart"]'),
                         m('span.help-block', 'Toggle the display of album art on the Playback main screen')
                     ])
                 ]),
                 m('[id="lastfmBox"]', [
                     m('.form-group', [
                         m('label.control-label.col-sm-2[for="lastfm"]', [m('i.fa.fa.fa-lastfm-square'), ' Last.fm']),
                         m('.col-sm-10', [
                             m('label.switch-light.well[onclick=""]', [
                                 m('input[data-parsley-id="6913"][data-parsley-multiple="featureslastfmenable"][id="scrobbling-lastfm"][name="features[lastfm][enable]"][type="checkbox"][value="1"]'),
                                 m('span', [m('span', 'OFF'), m('span', 'ON')]),
                                 m('a.btn.btn-primary')
                             ]),
                             m('ul.parsley-errors-list[id="parsley-id-multiple-featureslastfmenable"]'),
                             m('span.help-block', 'Send to Last.fm informations about the music you are listening to (requires a Last.fm account)')
                         ])
                     ]),
                     m('.hide[id="lastfmAuth"]', [
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="lastfm-usr"]', 'Username'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="9931"][data-trigger="change"][id="lastfm_user"][name="features[lastfm][user]"][placeholder="user"][type="text"][value="user"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-9931"]'),
                                 m('span.help-block', ['Insert your Last.fm ', m('i', 'username')])
                             ])
                         ]),
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="lastfm-pasw"]', 'Password'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="2505"][id="lastfm_pass"][name="features[lastfm][pass]"][placeholder="pass"][type="password"][value="pass"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-2505"]'),
                                 m('span.help-block', ['Insert your Last.fm ', m('i', 'password'), ' (case sensitive)'])
                             ])
                         ])
                     ])
                 ]),
                 m('.form-group.form-actions', [
                     m('.col-sm-offset-2.col-sm-10', [
                         m('button.btn.btn-primary.btn-lg[name="features[submit]"][type="submit"][value="1"]', 'apply settings')
                     ])
                 ])
             ]),
             m('fieldset', [
                 m('legend', 'Compatibility fixes'),
                 m('p', 'For people suffering problems with some receivers and DACs.'),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="cmediafix"]', 'CMedia fix'),
                     m('.col-sm-10', [
                         m('label.switch-light.well[onclick=""]', [
                             m('input[name="cmediafix[1]"][type="checkbox"][value="1"]'),
                             m('span', [m('span', 'OFF'), m('span', 'ON')]),
                             m('a.btn.btn-primary')
                         ]),
                         m('span.help-block', ['For those who have a CM6631 receiver and experiment issues (noise, crackling) between tracks with different sample rates and/or bit depth.', m('br'), ' \n                    A \'dirty\' fix that should avoid the problem, do NOT use if everything works normally.'])
                     ])
                 ]),
                 m('.form-group.form-actions', [
                     m('.col-sm-offset-2.col-sm-10', [
                         m('button.btn.btn-primary.btn-lg[name="cmediafix[0]"][type="submit"][value="1"]', 'Apply fixes')
                     ])
                 ])
             ]),
             m('fieldset', [
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
             ])];
};

sources.view = function (ctrl) {
    return [m('.container', [
             m('h1', 'Local sources'),
             m('.boxed', [
                 m('p', ['Your ', m('a[href="/#panel-sx"]', 'music library'), ' is composed by two main content types: ', m('strong', 'local sources'), ' and streaming sources.', m('br'), '\n        This section lets you configure your local sources, telling ', m('a[href="http://www.musicpd.org/"][rel="nofollow"][target="_blank"][title="Music Player Daemon"]', 'MPD'), ' to scan the contents of ', m('strong', 'network mounts'), ' and ', m('strong', 'USB mounts'), '.']),
                     m('button.btn.btn-lg.btn-primary[id="updatempddb"][type="button"]', { onclick: sources.vm.updateMDP }, [m('i.fa.fa-refresh.sx'), 'Rebuild MPD Library'])
             ]),
             m('h2', 'Network mounts'),
             m('p', 'List of configured network mounts. Click an existing entry to edit it, or add a new one.'),
                 m('p', [m('button.btn.btn-lg.btn-primary.btn-block[id="mountall"][type="button"]', { onclick: sources.vm.mountall }, [m('i.fa.fa-refresh.sx'), ' Remount all sources'])]),
                 // loop through existing mounts
                 m('p', [m('a.btn.btn-lg.btn-primary.btn-block', { onclick: sources.vm.add }, [m('i.fa.fa-plus.sx'), ' Add new mount'])]),
             m('h2', 'USB mounts'),
             m('p', ['List of mounted USB drives. To safe unmount a drive, click on it and confirm at the dialog prompt.', m('br'), '\n    If a drive is connected but not shown in the list, please check if ', m('a[href="/settings/#features-management"]', 'USB automount'), ' is enabled.']),
             m('.button-list[id="usb-mount-list"]', [
                 m('p', [m('button.btn.btn-lg.btn-disabled.btn-block[disabled="disabled"]', 'no USB mounts present')])
             ])
    ])];
};

source.view = function (ctrl) {
    return [m('h1', 'NAS mounts'),
    m('fieldset', [
        m('legend', ['Add new network mount ', m('span.hide', ['(', m('a[data-toggle="modal"][href="#source-delete-modal"]', 'remove this mount'), ')'])]),
        m('.form-group', [
            m('.alert.alert-info.hide', [
                m('i.fa.fa-times.red.sx')
            ]),
            m('label.col-sm-2.control-label[for="nas-name"]', 'Source name'),
            m('.col-sm-10', [
                m('input.form-control.input-lg[autocomplete="off"][id="nas-name"][placeholder="eg: Classical"]', createInput(source.vm.data, 'nas_name')),
                m('ul.parsley-errors-list[id="parsley-id-0754"]'),
                m('input[name="mount[id]"][type="hidden"][value=""]'),
                m('input[name="action"][type="hidden"][value="add"]'),
                m('span.help-block', 'The name you want to give to this source. It will appear in your database tree structure')
            ])
        ]),
        m('.form-group', [
            m('label.col-sm-2.control-label[for="nas-type"]', 'Fileshare protocol'),
            m('.col-sm-10', [
                m('select.selectpicker[data-style="btn-default btn-lg"][id="mount_type"]', createInput(source.vm.data, 'mount_type', selectpicker) , [
                    m('option[value="cifs"]', 'Windows (SMB/CIFS)'),
                    m('option[value="osx"]', 'OS X (SMB/CIFS)'),
                    m('option[value="nfs"]', 'Linux / Unix (NFS)')
                ]),
                m('span.help-block', 'Select SMB/CIFS for connect Windows file shares or NFS for unix file shares')
            ])]),
    m('.form-group', [
    m('label.col-sm-2.control-label[for="nas-ip"]', 'IP address'),
    m('.col-sm-10', [
        m('input.form-control.input-lg[autocomplete="off"][id="nas_ip"][placeholder="eg: 192.168.1.250"][type="text"]', createInput(source.vm.data, 'nas_ip')),
        m('ul.parsley-errors-list[id="parsley-id-0037"]'),
        m('span.help-block', 'Specify your NAS address')
    ])
    ]),
m('.form-group', [
    m('label.col-sm-2.control-label[for="nas-dir"]', 'Remote directory'),
    m('.col-sm-10', [
        m('input.form-control.input-lg[autocomplete="off"][id="nas_dir"][placeholder="eg: Music/Classical"][type="text"]', createInput(source.vm.data, 'nas_dir')),
        m('span.help-block', 'Specify the directory name on the NAS where to scan music files (case sensitive)')
    ])
]),
m('.optional[id="mount-cifs"]', [
    m('.form-group', [
        m('label.col-sm-2.control-label[for="nas-guest"]', 'Guest access'),
        m('.col-sm-10', [
            m('label.switch-light.well[onclick=""]', [
                m('input[checked="checked"][data-parsley-id="6546"][data-parsley-multiple="nas-guest"][id="nas-guest"][name="nas-guest"][type="checkbox"]'),
                m('span', [m('span', 'OFF'), m('span', 'ON')]),
                m('a.btn.btn-primary')
            ]),
            m('ul.parsley-errors-list[id="parsley-id-multiple-nas-guest"]'),
            m('span.help-block', 'Log with guest account (no user/password required)')
        ])
    ]),
    m('.optional.disabled[id="mount-auth"]', [
        m('.form-group', [
            m('label.col-sm-2.control-label[for="nas-usr"]', 'Username'),
            m('.col-sm-10', [
                m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="5061"][data-trigger="change"][id="nas-usr"][name="mount[username]"][placeholder="user"][type="text"][value=""]'),
                m('ul.parsley-errors-list[id="parsley-id-5061"]'),
                m('span.help-block', 'If required, specify username to grant access to the NAS (case sensitive)')
            ])
        ]),
        m('.form-group', [
            m('label.col-sm-2.control-label[for="nas-pasw"]', 'Password'),
            m('.col-sm-10', [
                m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="8023"][id="nas-pasw"][name="mount[password]"][placeholder="pass"][type="password"][value=""]'),
                m('ul.parsley-errors-list[id="parsley-id-8023"]'),
                m('span.help-block', 'If required, specify password to grant access to the NAS (case sensitive)')
            ])
        ]),
        m('.disabler.')
    ]),
    m('.disabler.hide')
]),
m('.form-group', [
    m('label.col-sm-2.control-label[for="nas-advanced"]', 'Advanced options'),
    m('.col-sm-10', [
        m('label.switch-light.well[onclick=""]', [
            m('input[data-parsley-id="8687"][data-parsley-multiple="nas-advanced"][id="nas-advanced"][name="nas-advanced"][type="checkbox"]'),
            m('span', [m('span', 'OFF'), m('span', 'ON')]),
            m('a.btn.btn-primary')
        ]),
        m('ul.parsley-errors-list[id="parsley-id-multiple-nas-advanced"]'),
        m('span.help-block', 'Show/hide advanced mount options')
    ])
])
    ]),
		m('fieldset.hide[id="mount-advanced-config"]', [
			m('legend', 'Advanced options'),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="nas-charset"]', 'Charset'),
				m('.col-sm-10', [
					m('select.selectpicker[data-parsley-id="6685"][data-style="btn-default btn-lg"][id="log-level"][name="mount[charset]"]', { style: { 'display': ' none' } }, [
						m('option[value="utf8"]', 'UTF8 (default)'),
						'\n\';    \n                    ',
						m('option[value="iso8859-1"]', 'ISO 8859-1')
					]),
					m('.btn-group.bootstrap-select', [m('button.btn.dropdown-toggle.selectpicker.btn-default.btn-lg[data-id="log-level"][data-toggle="dropdown"][title="UTF8 (default)"][type="button"]', [m('span.filter-option.pull-left', 'UTF8 (default)'), ' ', m('span.caret')]), m('.dropdown-menu.open', [m('ul.dropdown-menu.inner.selectpicker[role="menu"]', [m('li.selected[data-original-index="0"]', [m('a[data-normalized-text="<span class=\'text\'>UTF8 (default)</span>"][tabindex="0"]', [m('span.text', 'UTF8 (default)'), m('span.glyphicon.glyphicon-ok.check-mark')])]), m('li[data-original-index="1"]', [m('a[data-normalized-text="<span class=\'text\'>ISO 8859-1</span>"][tabindex="0"]', [m('span.text', 'ISO 8859-1'), m('span.glyphicon.glyphicon-ok.check-mark')])])])])]),
					m('ul.parsley-errors-list[id="parsley-id-6685"]'),
					m('span.help-block', 'Change this settings if you experience problems with character encoding')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="nas-rsize"]', 'Rsize'),
				m('.col-sm-10', [
					m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="9174"][data-trigger="change"][id="nas-rsize"][name="mount[rsize]"][placeholder="8192"][type="text"][value=""]'),
					m('ul.parsley-errors-list[id="parsley-id-9174"]'),
					m('span.help-block', 'Change this settings if you experience problems with music playback (es: pops or clips)')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="nas-wsize"]', 'Wsize'),
				m('.col-sm-10', [
					m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="8169"][data-trigger="change"][id="nas-wsize"][name="mount[wsize]"][placeholder="16384"][type="text"][value=""]'),
					m('ul.parsley-errors-list[id="parsley-id-8169"]'),
					m('span.help-block', 'Change this settings if you experience problems with music playback (es: pops or clips)')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="options"]', 'Mount flags'),
				m('.col-sm-10', [
					m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="9135"][data-trigger="change"][id="options"][name="mount[options]"][placeholder="cache=none,ro"][type="text"][value=""]'),
					m('ul.parsley-errors-list[id="parsley-id-9135"]'),
					m('input[name="mount[error]"][type="hidden"][value=""]'),
					m('span.help-block', 'Advanced mount flags. Don"t use this field if you don"t know what you are doing.')
				])
			])
		]),
		m('.form-group.form-actions', [
			m('.col-sm-offset-2.col-sm-10', [
				m('a.btn.btn-default.btn-lg[data-ajax="false"][href="/sources"]', 'Cancel'),
				m('button.btn.btn-primary.btn-lg[name="save"][type="submit"][value="save"]', 'Save mount')
			])
		]),
        m('.form-group.form-actions', [
                   m('.col-sm-offset-2.col-sm-10', [
                       m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function (e) { source.vm.cancel(); } }, 'Cancel'),
                       m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function (e) { source.vm.save(); } }, 'Save and apply')
                   ])
        ])

    ];
};


network.view = function (ctrl) {
    return [m('h1', 'Network configuration'),
        m('.boxed',
            [m('p', ['Configure wired and wireless connections. See below for the list of the active network interfaces as detected by the system.',
                m('br'), 'If your interface is connected but does not show, then try to refresh the list forcing the detect.']),
                m('button.btn.btn-lg.btn-primary[id="refresh"][name="refresh"][type="button"][value="1"]',
                    [m('i.fa.fa-refresh.sx'), 'Refresh interfaces'])]),
                    m('h2', 'Network interfaces'),
                    m('p', 'List of active network interfaces. Click on an entry to configure the corresponding connection.'),
                    m('p', [m('a.btn.btn-lg.btn-default.btn-block[href="/network/edit/eth0"]', [' ', m('i.fa.fa-check.green.sx'),
                        ' ',
                        m('strong', 'eth0 '), '   ', m('span', '[10.10.10.123]')])])];
};

credits.view = function (ctrl) {
    return [m('.container.credits', [' ', m('h1', 'RuneAudio project'), ' ', m('.row', [' ', m('.col-md-8', [' ', m('.alert.alert-info', [' release version: ', m('strong[id="release-version"]', '0.3'), ' (', m('a[href="http://www.runeaudio.com/changelog/"][target="_blank"]', 'build: beta-20141027'), ') ']), ' ', m('h2', 'RuneAudio team'), ' ', m('.alert.alert-info', [' ', m('a[href="http://www.runeaudio.com/team/"][rel="nofollow"][target="_blank"]', [m('strong', 'Andrea Coiutti')]), ' (aka ACX) ', m('span.help-block', '- RuneUI frontend design - frontend HTML/JS/CSS coding'), m('br'), ' ', m('a[href="http://www.runeaudio.com/team/"][rel="nofollow"][target="_blank"]', [m('strong', 'Simone De Gregori')]), ' (aka Orion) ', m('span.help-block', '- RuneUI PHP backend coding - frontend JS coding - RuneOS distro build & optimization'), m('br'), ' ', m('a[href="http://www.runeaudio.com/team/"][rel="nofollow"][target="_blank"]', [m('strong', 'Carmelo San Giovanni')]), ' (aka Um3ggh1U) ', m('span.help-block', '- RuneOS distro build & Kernel optimization'), m('br'), ' ']), ' ', m('h2', 'Main contributors'), ' ', m('strong', 'Cristian Pascottini'), ' ', m('span.help-block', '- RuneUI Javascript optimizations'), m('br'), ' ', m('strong', 'Valerio Battaglia'), ' ', m('span.help-block', '- RuneUI Javascript optimizations'), m('br'), ' ', m('strong', 'Francesco Casarsa'), ' ', m('span.help-block', '- Shairport patch'), m('br'), ' ', m('strong', 'Frank Friedmann'), ' ', m('span.help-block', '- RuneOS porting for Cubietruck'), m('br'), ' ', m('strong', 'Saman'), ' ', m('span.help-block', '- RuneOS RT Linux kernel for Wolfson Audio Card (RaspberryPi)'), ' ']), ' ', m('.col-md-4', [' ', m('h3.txtmid', 'Support us!'), ' ', m('form[action="https://www.paypal.com/cgi-bin/webscr"][id="form-paypal"][method="post"][target="_top"]', [' ', m('input[name="cmd"][type="hidden"][value="_s-xclick"]'), ' ', m('input[name="hosted_button_id"][type="hidden"][value="AZ5L5M5PGHJNJ"]'), ' ', m('input[alt="PayPal - The safer, easier way to pay online!"][border="0"][name="submit"][src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"][type="image"]'), ' ', m('img[alt=""][border="0"][height="1"][src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"][width="1"]'), ' ']), ' ', m('h3.txtmid', 'Sharing is caring'), ' ', m('p.social-buttons', [' ', m('a.btn.btn-default[href="https://github.com/RuneAudio"][rel="nofollow"][target="_blank"][title="RuneAudio on GitHub"]', [m('i.fa.fa-github')]), ' ', m('a.btn.btn-default[href="https://www.facebook.com/runeaudio"][rel="nofollow"][target="_blank"][title="RuneAudio on Facebook"]', [m('i.fa.fa-facebook')]), ' ', m('a.btn.btn-default[href="https://twitter.com/runeaudio"][rel="nofollow"][target="_blank"][title="RuneAudio on Twitter"]', [m('i.fa.fa-twitter')]), ' ', m('a.btn.btn-default[href="https://plus.google.com/+Runeaudio/"][rel="nofollow"][target="_blank"][title="RuneAudio on Google+"]', [m('i.fa.fa-google-plus')]), ' ', m('br'), ' ', m('a.btn.btn-default[href="http://www.runeaudio.com/forum/"][rel="nofollow"][target="_blank"][title="RuneAudio forum"]', [m('i.fa.fa-comments')]), ' ', m('a.btn.btn-default[href="http://feeds.feedburner.com/RuneAudio"][rel="nofollow"][target="_blank"][title="RSS feed"]', [m('i.fa.fa-rss')]), ' ', m('a.btn.btn-default[href="http://www.runeaudio.com/newsletter/"][rel="nofollow"][target="_blank"][title="RuneAudio newsletter"]', [m('i.fa.fa-envelope')]), ' ']), ' ']), ' ']), ' ', m('h2', 'License & Copyright'), ' ', m('.alert.alert-info[id="license"]', [' ', m('p', ['This Program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation either version 3, or (at your option) any later version. This Program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with RuneAudio; see the file COPYING. If not, see ', m('a[href="http://www.gnu.org/licenses/gpl-3.0.txt"][rel="nofollow"][target="_blank"]', 'http://www.gnu.org/licenses/gpl-3.0.txt')]), ' ']), ' ', m('p', [
			m('strong', 'Copyright (C) 2013-2014 RuneAudio Team'),
			' ',
			m('span.help-block', '- Andrea Coiutti & Simone De Gregori & Carmelo San Giovanni'),
			m('br'),
			' ',
			m('strong', 'RuneUI'),
			' ',
			m('span.help-block', '- copyright (C) 2013-2014 – Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)'),
			m('br'),
			' ',
			m('strong', 'RuneOS'),
			m('span.help-block', '- copyright (C) 2013-2014 – Simone De Gregori (aka Orion) & Carmelo San Giovanni (aka Um3ggh1U)')
    ]), ' ', m('h2', 'RuneUI credits'), ' ', m('p', [m('strong', 'PHP language v5.5'), ' by ', m('a[href="http://php.net/credits.php"][rel="nofollow"][target="_blank"]', 'PHP Team'), m('br'), m('a[href="http://php.net/"][rel="nofollow"][target="_blank"]', 'http://php.net')]), ' ', m('p', [m('strong', 'NGiNX'), m('br'), ' ', m('a[href="http://nginx.org/"][rel="nofollow"][target="_blank"]', 'http://nginx.org')]), ' ', m('p', [m('strong', 'NGiNX Push Stream Module'), m('br'), m('a[href="http://wiki.nginx.org/HttpPushStreamModule"][rel="nofollow"][target="_blank"]', 'http://wiki.nginx.org/HttpPushStreamModule')]), ' ', m('p', [m('strong', 'Redis'), ' advanced key-value store by ', m('a[href="https://twitter.com/antirez"][rel="nofollow"][target="_blank"]', 'Salvatore Sanfilippo'), ' and ', m('a[href="https://twitter.com/pnoordhuis"][rel="nofollow"][target="_blank"]', ['Pieter Noordhuis', m('br')]), m('a[href="http://redis.io"][rel="nofollow"][target="_blank"][title="Redis"]', 'http://redis.io')]), ' ', m('p', [m('strong', 'PHP redis'), ' class by ', m('a[href="https://twitter.com/alfonsojimenez"][rel="nofollow"][target="_blank"]', 'Alfonso Jimenez'), ', ', m('a[href="https://twitter.com/bouafif_nasr"][rel="nofollow"][target="_blank"]', 'Nasreddine Bouafif'), ' and ', m('a[href="https://twitter.com/yowgi"][rel="nofollow"][target="_blank"]', 'Nicolas Favre-Felix'), m('br'), m('a[href="https://github.com/nicolasff/phpredis"][rel="nofollow"][target="_blank"][title="PHP Redis"]', 'https://github.com/nicolasff/phpredis')]), ' ', m('p', [m('strong', 'PHP pthreads'), ' by ', m('a[href="https://github.com/krakjoe"][rel="nofollow"][target="_blank"]', 'Joe Watkins'), m('br'), m('a[href="http://pthreads.org"][rel="nofollow"][target="_blank"][title="PHP pthreads"]', 'http://pthreads.org')]), ' ', m('p', [m('strong', 'getID3'), ' class by ', m('a[href="https://github.com/JamesHeinrich"][rel="nofollow"][target="_blank"]', 'by James Heinrich'), m('br'), m('a[href="http://www.getid3.org"][rel="nofollow"][target="_blank"][title="getID3"]', 'http://www.getid3.org')]), ' ', m('p', [m('strong', 'PHP reader'), ' class by ', m('a[href="http://fi.linkedin.com/in/svollbehr"][rel="nofollow"][target="_blank"]', 'Sven Vollbehr'), m('br'), m('a[href="https://code.google.com/p/php-reader/"][rel="nofollow"][target="_blank"][title="PHP Reader"]', 'https://code.google.com/p/php-reader')]), ' ', m('p', [m('strong', 'jQuery Knob'), ' by ', m('a[href="http://anthonyterrien.com/"][rel="nofollow"][target="_blank"]', 'Anthony Terrien'), m('br'), m('a[href="https://github.com/aterrien/jQuery-Knob"][rel="nofollow"][target="_blank"]', 'https://github.com/aterrien/jQuery-Knob')]), ' ', m('p', [m('strong', 'jQuery Countdown'), ' by ', m('a[href="http://keith-wood.name/"][rel="nofollow"][target="_blank"]', 'Keith Wood'), m('br'), m('a[href="http://keith-wood.name/countdown.html"][rel="nofollow"][target="_blank"]', 'http://keith-wood.name/countdown.html')]), ' ', m('p', [m('strong', 'jQuery scrollTo'), ' by ', m('a[href="http://flesler.blogspot.com/"][rel="nofollow"][target="_blank"]', 'Ariel Flesler'), m('br'), m('a[href="http://flesler.blogspot.it/2007/10/jqueryscrollto.html"][rel="nofollow"][target="_blank"]', 'http://flesler.blogspot.it/2007/10/jqueryscrollto.html')]), ' ', m('p', [m('strong', 'PNotify'), ' by SciActive', m('br'), m('a[href="http://sciactive.com/pnotify/"][rel="nofollow"][target="_blank"]', 'http://sciactive.com/pnotify')]), ' ', m('p', [m('strong', 'FastClick'), ' by ', m('a[href="https://github.com/ftlabs"][rel="nofollow"][target="_blank"]', 'ftlabs'), m('br'), m('a[href="http://ftlabs.github.io/fastclick/"][rel="nofollow"][target="_blank"]', 'http://ftlabs.github.io/fastclick')]), ' ', m('p', [m('strong', '(cs)spinner'), ' by ', m('a[href="https://github.com/jh3y"][rel="nofollow"][target="_blank"]', 'jhey tompkins'), m('br'), m('a[href="http://jh3y.github.io/-cs-spinner/"][rel="nofollow"][target="_blank"]', 'http://jh3y.github.io/-cs-spinner/')]), ' ', m('p', [m('strong', 'Twitter Bootstrap'), ' by ', m('a[href="http://twitter.com/mdo"][rel="nofollow"][target="_blank"]', '@mdo'), ' and ', m('a[href="http://twitter.com/fat"][rel="nofollow"][target="_blank"]', '@fat'), m('br'), m('a[href="http://getbootstrap.com/"][rel="nofollow"][target="_blank"]', 'http://getbootstrap.com')]), ' ', m('p', [m('strong', 'Lato-Fonts'), ' by ', m('a[href="http://alfabety.pl/"][rel="nofollow"][target="_blank"]', 'Lukasz Dziedzic'), m('br'), m('a[href="http://www.latofonts.com/lato-free-fonts/"][rel="nofollow"][target="_blank"]', 'http://www.latofonts.com/lato-free-fonts')]), ' ', m('p', [m('strong', 'Font Awesome'), ' by ', m('a[href="https://twitter.com/davegandy"][rel="nofollow"][target="_blank"]', 'Dave Gandy'), m('br'), m('a[href="http://fontawesome.io/"][rel="nofollow"][target="_blank"]', 'http://fontawesome.io')]), ' ', m('p', [m('strong', 'Bootstrap-select'), ' by ', m('a[href="https://github.com/caseyjhol"][rel="nofollow"][target="_blank"]', 'caseyjhol'), m('br'), m('a[href="http://silviomoreto.github.io/bootstrap-select/"][rel="nofollow"][target="_blank"]', 'http://silviomoreto.github.io/bootstrap-select')]), ' ', m('p', [m('strong', 'Bootstrap Context Menu'), ' by ', m('a[href="https://github.com/sydcanem"][rel="nofollow"][target="_blank"]', '@sydcanem'), m('br'), m('a[href="https://github.com/sydcanem/bootstrap-contextmenu"][rel="nofollow"][target="_blank"]', 'https://github.com/sydcanem/bootstrap-contextmenu')]), ' ', m('p', [m('strong', 'CSS Toggle Switch'), ' by ', m('a[href="http://ghinda.net/"][rel="nofollow"][target="_blank"]', 'Ionuț Colceriu'), m('br'), m('a[href="https://github.com/ghinda/css-toggle-switch"][rel="nofollow"][target="_blank"]', 'https://github.com/ghinda/css-toggle-switch')]), ' ', m('p', [m('strong', 'ZeroClipboard'), ' by ', m('a[href="https://github.com/zeroclipboard"][rel="nofollow"][target="_blank"]', 'ZeroClipboard'), m('br'), m('a[href="http://zeroclipboard.org/"][rel="nofollow"][target="_blank"]', 'http://zeroclipboard.org/')]), ' ', m('p', ['Also thanks to B. Carlisle (', m('strong', 'MPD-class'), ' ', m('a[href="http://mpd.24oz.com/"][rel="nofollow"][target="_blank"]', 'http://mpd.24oz.com'), ') for code inspiration on some data-parsing functions.']), ' ', m('h2', 'RuneOS credits'), ' ', m('p', ['ArchLinux (base distro)', m('br'), m('a[href="https://www.archlinux.org/"][rel="nofollow"][target="_blank"]', 'https://www.archlinux.org')]), ' ', m('p', [m('strong', 'MPD'), ' – Music Player Daemon by Max Kellermann & Avuton Olrich', m('br'), m('a[href="http://www.musicpd.org/"][rel="nofollow"][target="_blank"]', 'http://www.musicpd.org')]), ' ', m('p', ['Shairport by James “abrasive” Laird', m('br'), m('a[href="https://github.com/abrasive/shairport"][rel="nofollow"][target="_blank"]', 'https://github.com/abrasive/shairport')]), ' ', m('p', ['Spop by Thomas Jost', m('br'), m('a[href="https://github.com/Schnouki/spop"][rel="nofollow"][target="_blank"]', 'https://github.com/Schnouki/spop')]), ' ', m('p', ['Upmpdcli by Jean-Francois Dockes', m('br'), m('a[href="http://www.lesbonscomptes.com/upmpdcli/upmpdcli.html"][rel="nofollow"][target="_blank"]', 'http://www.lesbonscomptes.com/upmpdcli/upmpdcli.html')]), ' ', m('p', ['MiniDLNA by Justin Maggard', m('br'), m('a[href="http://minidlna.sourceforge.net/"][rel="nofollow"][target="_blank"]', 'http://minidlna.sourceforge.net')]), ' '])];
};

debug.view = function (ctrl) {
    return [m('.container.debug', [
		m('h1', 'DEBUG DATA'),
		m('.boxed', [
			m('p', ['Below is displayed the raw output of RuneUI"s debug section. It contains some important informations that could help to diagnosticate problems.', m('br'), 'Please copy and paste it in your posts when asking for help ', m('a[href="http://www.runeaudio.com/forum/"][target="_blank"][title="RuneAudio Forum"]', 'in the forum'), '.']),
			m('button.btn.btn-primary.btn-lg[data-clipboard-target="clipboard_pre"][id="copy-to-clipboard"]', [m('i.fa.fa-copy.sx'), ' Copy data to clipboard'])
		]),
		m('br'),
		m('pre[id="clipboard_pre"]', debug.vm.data.debug)])
    ];
};

dev.view = function (ctrl) {
    return m('h1', 'Dev');
};

error.view = function (ctrl) {
    return m('h1', 'Error');
};





// Mithril routing configuration
m.route.mode = 'hash';
m.route(document.getElementById('app'), '/', {
    '/audio': audio,
    '/settings': settings,
    '/mpd': mpd,
    '/credits': credits,
    '/debug': debug,
    '/dev': dev,
    '/error': error,
    '/network': network,
    '/sources/:id': source,
    '/sources': sources
});

jQuery(document).ready(function ($) {
    'use strict';
});