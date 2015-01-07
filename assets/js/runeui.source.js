window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.source = new mithril.RuneModule('/sources');

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

// single source view
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
                m('input.form-control.input-lg[autocomplete="off"][id="nas-name"][placeholder="eg: Classical"]', mithril.bind2(source.vm.data, 'nas_name')),
                m('ul.parsley-errors-list[id="parsley-id-0754"]'),
                m('input[name="mount[id]"][type="hidden"][value=""]'),
                m('input[name="action"][type="hidden"][value="add"]'),
                m('span.help-block', 'The name you want to give to this source. It will appear in your database tree structure')
            ])
        ]),
        m('.form-group', [
            m('label.col-sm-2.control-label[for="nas-type"]', 'Fileshare protocol'),
            m('.col-sm-10', [
                m('select.selectpicker[data-style="btn-default btn-lg"][id="mount_type"]', mithril.bind2(source.vm.data, 'mount_type', helpers.selectpicker), [
                    m('option[value="cifs"]', 'Windows (SMB/CIFS)'),
                    m('option[value="osx"]', 'OS X (SMB/CIFS)'),
                    m('option[value="nfs"]', 'Linux / Unix (NFS)')
                ]),
                m('span.help-block', 'Select SMB/CIFS for connect Windows file shares or NFS for unix file shares')
            ])]),
    m('.form-group', [
    m('label.col-sm-2.control-label[for="nas-ip"]', 'IP address'),
    m('.col-sm-10', [
        m('input.form-control.input-lg[autocomplete="off"][id="nas_ip"][placeholder="eg: 192.168.1.250"][type="text"]', mithril.bind2(source.vm.data, 'nas_ip')),
        m('ul.parsley-errors-list[id="parsley-id-0037"]'),
        m('span.help-block', 'Specify your NAS address')
    ])
    ]),
    m('.form-group', [
        m('label.col-sm-2.control-label[for="nas-dir"]', 'Remote directory'),
        m('.col-sm-10', [
            m('input.form-control.input-lg[autocomplete="off"][id="nas_dir"][placeholder="eg: Music/Classical"][type="text"]', mithril.bind2(source.vm.data, 'nas_dir')),
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