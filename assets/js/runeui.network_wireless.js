window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.network_wireless = new mithril.RuneModule('/network');

// 'Wired Network' view
network_wireless.view = function(ctrl) {
    return [
        m('h1', 'Wireless network (' + network_wireless.vm.data.profile.name + ')'),
        m('legend', 'Wi-Fi networks in range'),
        m('span.help-block', 'The list of available Wi-Fi networks is automatically refreshed while you are on this page (so don"t forget it open in your browser to avoid unnecessary system load).'),
        m('fieldset', [
            m('.boxed[id="wifiNetworks"]', [
                m('p', [m('div.btn.btn-lg.btn-default.btn-block', [m('i.fa.fa-cog.fa-spin.sx'),'scanning for networks...'])])
            ])
        ]),
        m('legend', 'Wi-Fi stored profiles'),
        m('fieldset', [
            m('.boxed', [
                m('label.switch-light.switch-block.well[onclick=""]', [
                    m('input[checked="checked"][id="wifiProfiles"][name="features[airplay][enable]"][type="checkbox"][value="1"]'),
                    m('span', [m('span', ['SHOW',m('i.fa.fa-chevron-down.dx')]),m('span', ['HIDE',m('i.fa.fa-chevron-up.dx')])]),
                    m('a.btn.btn-primary')
                ]),
                m('.hide[id="wifiProfilesBox"]', [
                    m('span.help-block', 'Add, edit or delete stored Wi-Fi profiles.'),
                    m('[id="wifiStored"]', [
                        m('p', [m('a.btn.btn-lg.btn-default.btn-block]', [m('i.fa.fa-check.green.sx'),m('i.fa.fa-lock.sx'),m('strong', 'Test connection')])])
                    ]),
                    m('p', [m('a.btn.btn-primary.btn-lg.btn-block[href="/network/wlan/wlan0/add"]', [m('i.fa.fa-plus.sx'),' Add new profile'])])
                ])
            ])
        ]),
		m('fieldset.form-horizontal', [
			m('legend', 'Interface properties'),
			m('.boxed', [
				m('table.info-table[data-name="eth0"][id="nic-details"]', [
					m('tbody', [
						m('tr', [
                            m('th', 'Name:'),
                            m('td', [m('strong', network_wireless.vm.data.profile.name)])
                        ]),
						m('tr', [
                            m('th', 'Type:'),
                            m('td', 'wi-fi')
                        ]),
						m('tr', [
                            m('th', 'Status:'),
                            m('td', [m('i.fa.sx', { className: (network_wireless.vm.data.nic.ip) ? 'fa-check green' : 'fa-times red' }), network_wireless.vm.data.nic.ip ? 'connected' : 'disconnected'])
                        ]),
						m('tr', [
                            m('th', 'Assigned IP:'),
                            m('td', [m('strong', network_wireless.vm.data.nic.ip ? network_wireless.vm.data.nic.ip : 'none')])
                        ]),
						m('tr', [
                            m('th', 'Speed:'),
                            m('td', network_wireless.vm.data.nic.ip ? network_wireless.vm.data.nic.speed : 'N/A')])
					])
				])
			])
		]),
		m('fieldset.form-horizontal', [
			m('legend', 'Interface configuration'),
			m('.form-group', [
				m('label.col-sm-2.control-label', 'IP assignment'),
				m('.col-sm-10', [
					mithril.createYesNo('dhcp', network_wireless.vm.data.profile, 'dhcp', null, 'DHCP', 'Static'),
					m('span.help-block', 'Choose between DHCP and Static configuration')
				])
			]),
			m('[id="network-manual-config"]', {
                className: network_wireless.vm.data.profile.dhcp ? 'hide' : ''
            }, [
				m('.form-group', [
					m('label.col-sm-2.control-label]', 'IP address'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wireless.vm.data.nic.ip + '"][required=""][type="text"]', mithril.createInput(network_wireless.vm.data.profile, 'ip')),
						m('span.help-block', 'Manually set the IP address.')
					])
				]),
				m('.form-group', [
					m('label.col-sm-2.control-label', 'Netmask'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wireless.vm.data.nic.netmask + '"][required=""][type="text"]', mithril.createInput(network_wireless.vm.data.profile, 'netmask')),
						m('span.help-block', 'Manually set the network mask.')
					])
				]),
				m('.form-group', [
					m('label.col-sm-2.control-label', 'Gateway'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wireless.vm.data.nic.gw + '"][required=""][type="text"]', mithril.createInput(network_wireless.vm.data.profile, 'gw')),
						m('span.help-block', 'Manually set the gateway.')
					])
				]),
				m('.form-group', [
					m('label.col-sm-2.control-label]', 'Primary DNS'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wireless.vm.data.nic.dns1 + '"][type="text"]', mithril.createInput(network_wireless.vm.data.profile, 'dns1'))
					])
				]),
				m('.form-group', [
					m('label.col-sm-2.control-label', 'Secondary DNS'),
					m('.col-sm-10', [
						m('input.form-control.input-lg[placeholder="' + network_wireless.vm.data.nic.dns2 + '"][type="text"]', mithril.createInput(network_wireless.vm.data.profile, 'dns2')),
						m('span.help-block', 'Manually set the primary and secondary DNS.')
					])
				])
			]),
            m('.form-group.form-actions', [
                m('.col-sm-offset-2.col-sm-10', [
                    m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function(e) { network_wireless.vm.cancel(); } }, 'Cancel'), ' ',
                    m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function(e) { network_wireless.vm.save(); } }, 'Save and apply')
                ])
            ])
        ])
    ];
};