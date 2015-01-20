window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.network_wired = new mithril.RuneModule('/network');

// 'Wired Network' view
network_wired.view = function (ctrl) {

    if (network_wired.vm.data.nic.wireless) {
        error.vm.showError('URL Error');
        return;
    }

    return [
        m('h1', 'Wired network (' + network_wired.vm.data.profile.name + ')'),
		m('input[name="nic[name]"][type="hidden"][value="eth0"]'),
		m('input[name="nic[wireless]"][type="hidden"][value="0"]'),
		m('fieldset.form-horizontal', [
			m('legend', 'Interface properties'),
			m('.boxed', [
				m('table.info-table[data-name="eth0"][id="nic-details"]', [
					m('tbody', [
						m('tr', [
                            m('th', 'Name:'),
                            m('td', [m('strong', network_wired.vm.data.profile.name)])
                        ]),
						m('tr', [
                            m('th', 'Type:'),
                            m('td', 'wired ethernet')
                        ]),
						m('tr', [
                            m('th', 'Status:'),
                            m('td', [m('i.fa.sx', { className: (network_wired.vm.data.nic.ip) ? 'fa-check green' : 'fa-times red' }), network_wired.vm.data.nic.ip ? 'connected' : 'disconnected'])
                        ]),
						m('tr', [
                            m('th', 'Assigned IP:'),
                            m('td', [m('strong', network_wired.vm.data.nic.ip ? network_wired.vm.data.nic.ip : 'none')])
                        ]),
						m('tr', [
                            m('th', 'Speed:'),
                            m('td', network_wired.vm.data.nic.ip ? network_wired.vm.data.nic.speed : 'N/A')])
					])
				])
			])
		]),
		m('fieldset.form-horizontal', [
			m('legend', 'Interface configuration'),
			m('.form-group', [
				m('label.col-sm-2.control-label', 'IP assignment'),
				m('.col-sm-10', [
					mithril.createYesNo('dhcp', network_wired.vm.data.profile, 'dhcp', null, 'DHCP', 'Static'),
					m('span.help-block', 'Choose between DHCP and Static configuration')
				])
			]),
			m('[id="network-manual-config"]', {
                className: network_wired.vm.data.profile.dhcp ? 'hide' : ''
            }, [
				m('.form-group', [
					m('label.col-sm-2.control-label]', 'IP address'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wired.vm.data.nic.ip + '"][required=""][type="text"]', mithril.createInput(network_wired.vm.data.profile, 'ip')),
						m('span.help-block', 'Manually set the IP address.')
					])
				]),
				m('.form-group', [
					m('label.col-sm-2.control-label', 'Netmask'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wired.vm.data.nic.netmask + '"][required=""][type="text"]', mithril.createInput(network_wired.vm.data.profile, 'netmask')),
						m('span.help-block', 'Manually set the network mask.')
					])
				]),
				m('.form-group', [
					m('label.col-sm-2.control-label', 'Gateway'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wired.vm.data.nic.gw + '"][required=""][type="text"]', mithril.createInput(network_wired.vm.data.profile, 'gw')),
						m('span.help-block', 'Manually set the gateway.')
					])
				]),
				m('.form-group', [
					m('label.col-sm-2.control-label]', 'Primary DNS'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wired.vm.data.nic.dns1 + '"][type="text"]', mithril.createInput(network_wired.vm.data.profile, 'dns1'))
					])
				]),
				m('.form-group', [
					m('label.col-sm-2.control-label', 'Secondary DNS'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wired.vm.data.nic.dns2 + '"][type="text"]', mithril.createInput(network_wired.vm.data.profile, 'dns2')),
						m('span.help-block', 'Manually set the primary and secondary DNS.')
					])
				])
			]),
            m('.form-group.form-actions', [
                m('.col-sm-offset-2.col-sm-10', [
                    m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function(e) { network_wired.vm.cancel(); } }, 'Cancel'), ' ',
                    m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function(e) { network_wired.vm.save(); } }, 'Save and apply')
                ])
            ])
        ])
    ];
};