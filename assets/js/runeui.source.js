window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.source = new mithril.RuneModule('/sources');

source.Source = function (data) {
    this.name = m.prop(data.name || '');
    this.address = m.prop(data.remotedir || '');
};

source.vm.validate = function () {
    var d = new source.Source(source.vm.data);
    if (d.name() === '') {
        alert('The Source name is Required');
        return false;
    }
    return true;
};

source.vm.internal = {};
source.vm.internal.guest = true;
source.vm.internal.advanced = false;


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
                    m('input.form-control.input-lg[placeholder="eg: Classical"]', mithril.createInput(source.vm.data.mount, 'name')),
                    m('span.help-block', 'The name you want to give to this source. It will appear in your database tree structure')
                ])
            ]),
            m('.form-group', [
                m('label.col-sm-2.control-label[for="nas-type"]', 'Fileshare protocol'),
                m('.col-sm-10', [
                    m('select.selectpicker[data-style="btn-default btn-lg"][id="mount_type"]', mithril.createInput(source.vm.data.mount, 'type', helpers.selectpicker), [
                        m('option[value="cifs"]', 'Windows (SMB/CIFS)'),
                        m('option[value="osx"]', 'OS X (SMB/CIFS)'),
                        m('option[value="nfs"]', 'Linux / Unix (NFS)')
                    ]),
                    m('span.help-block', 'Select SMB/CIFS for connect Windows file shares or NFS for unix file shares')
                ])
            ]),
            m('.form-group', [
                m('label.col-sm-2.control-label[for="nas-ip"]', 'IP address'),
                m('.col-sm-10', [
                    m('input.form-control.input-lg[placeholder="eg: 192.168.1.250"][type="text"]', mithril.createInput(source.vm.data.mount, 'address')),
                    m('ul.parsley-errors-list[id="parsley-id-0037"]'),
                    m('span.help-block', 'Specify your NAS address')
                ])
            ]),
            m('.form-group', [
                m('label.col-sm-2.control-label[for="nas-dir"]', 'Remote directory'),
                m('.col-sm-10', [
                    m('input.form-control.input-lg[placeholder="eg: Music/Classical"][type="text"]', mithril.createInput(source.vm.data.mount, 'remotedir')),
                    m('span.help-block', 'Specify the directory name on the NAS where to scan music files (case sensitive)')
                ])
            ]),
            m('.optional[id="mount-cifs"]', [
                m('.form-group', [
                    m('label.col-sm-2.control-label[for="nas-guest"]', 'Guest access'),
                    m('.col-sm-10', [
                        mithril.createYesNo('nas-guest', source.vm.internal, 'guest'),
                        m('span.help-block', 'Log with guest account (no user/password required)')
                    ])
                ])
            ]),
            m('.optional[id="mount-auth"]', {
                className: (source.vm.internal.guest) ? 'disabled' : ''
            }, [
                m('.form-group', [
                    m('label.col-sm-2.control-label[for="nas-usr"]', 'Username'),
                    m('.col-sm-10', [
                        m('input.form-control.input-lg[placeholder="user"][type="text"]', mithril.createInput(source.vm.data.mount, 'username')),
                        m('span.help-block', 'If required, specify username to grant access to the NAS (case sensitive)')
                    ])
                ]),
                m('.form-group', [
                    m('label.col-sm-2.control-label[for="nas-pasw"]', 'Password'),
                    m('.col-sm-10', [
                        m('input.form-control.input-lg[placeholder="pass"][type="password"]', mithril.createInput(source.vm.data.mount, 'password')),
                        m('span.help-block', 'If required, specify password to grant access to the NAS (case sensitive)')
                    ])
                ]),
                m('.disabler', {
                    className: (source.vm.internal.guest) ? '' : 'hide'
                })
            ]),
            m('.disabler.hide'),
            m('.form-group', [
                m('label.col-sm-2.control-label[for="nas-advanced"]', 'Advanced options'),
                m('.col-sm-10', [
                    mithril.createYesNo('advanced', source.vm.internal, 'advanced'),
                    m('span.help-block', 'Show/hide advanced mount options')
                ])
            ])
        ]),
        m('fieldset[id="mount-advanced-config"]', {
            className: (source.vm.internal.advanced) ? '' : 'hide'
        }, [
            m('legend', 'Advanced options'),
            m('.form-group', [
                m('label.col-sm-2.control-label[for="nas-charset"]', 'Charset'),
                m('.col-sm-10', [
                    m('select.selectpicker[data-style="btn-default btn-lg"]', mithril.createInput(source.vm.data, 'charset', helpers.selectpicker), [
                        m('option[value="utf8"]', 'UTF8 (default)'),
                        m('option[value="iso8859-1"]', 'ISO 8859-1')
                    ]),
                    m('span.help-block', 'Change this settings if you experience problems with character encoding')
                ])
            ]),
            m('.form-group', [
                m('label.col-sm-2.control-label[for="nas-rsize"]', 'Rsize'),
                m('.col-sm-10', [
                    m('input.form-control.input-lg[placeholder="8192"][type="text"]', mithril.createInput(source.vm.data.mount, 'rsize')),
                    m('span.help-block', 'Change this settings if you experience problems with music playback (es: pops or clips)')
                ])
            ]),
            m('.form-group', [
                m('label.col-sm-2.control-label[for="nas-wsize"]', 'Wsize'),
                m('.col-sm-10', [
                    m('input.form-control.input-lg[placeholder="16384"][type="text"]', mithril.createInput(source.vm.data.mount, 'wsize')),
                    m('span.help-block', 'Change this settings if you experience problems with music playback (es: pops or clips)')
                ])
            ]),
            m('.form-group', [
                m('label.col-sm-2.control-label[for="options"]', 'Mount flags'),
                m('.col-sm-10', [
                    m('input.form-control.input-lg[placeholder="cache=none,ro"][type="text"]', mithril.createInput(source.vm.data.mount, 'options')),
                    m('span.help-block', 'Advanced mount flags. Don"t use this field if you don"t know what you are doing.')
                ])
            ])
        ]),
        m('.form-group.form-actions', [
            m('.col-sm-offset-2.col-sm-10', [
                m('a.btn.btn-default.btn-lg[href="/sources"]', {
                    config: m.route
                }, 'Cancel'),
                m('button.btn.btn-primary.btn-lg[type="button"]', {
                    onclick: function (e) {
                        source.vm.save();
                    }
                }, 'Save and apply')
            ])
        ])
    ];
};