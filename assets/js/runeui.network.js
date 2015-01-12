window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.network = new mithril.RuneModule('/network');

network.vm.edit = function (id) {
    m.route('/network/' + id);
};

// 'Network' view
network.view = function(ctrl) {
    return [
        m('h1', 'Network configuration'),
        m('.boxed', [
            m('p', [
                'Configure wired and wireless connections. See below for the list of the active network interfaces as detected by the system.',
                m('br'),
                'If your interface is connected but does not show, then try to refresh the list forcing the detect.'
            ]),
            m('div[id="network-refresh"]', [
                m('button.btn.btn-lg.btn-primary', { onclick: function(e) { network.vm.refresh(); } }, [
                    m('i.fa.fa-refresh.sx'),
                    'Refresh interfaces'
                ])
            ])
        ]),
        m('h2', 'Network interfaces'),
        m('p', 'List of active network interfaces. Click on an entry to configure the corresponding connection.'),
        m('.button-list[id="network-interface-list"]', [
            network.vm.data.nics.map(function(item, index) {
                return m('p', [
                    m('button.btn.btn-lg.btn-default.btn-block', { onclick: function(e) { network.vm.edit(item.id); } }, [
                        ' ',
                        m('i.fa.sx', { className: (item.ip) ? 'fa-check green' : 'fa-times red' }),
                        ' ',
                        m('strong', item.id),
                        m('span', [
                            m.trust('&nbsp;&nbsp;&nbsp;&nbsp;')
                        ]),
                        m('span', (item.ip) ? '[' + item.ip + ']' : '[no IP assigned]')
                    ])
                ]);
            })
        ])
    ];
};