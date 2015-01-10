window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.network = new mithril.RuneModule('/network');

network.vm.updateMDP = function () {
    postData(sources.vm.url, { mountall: true });
};

// 'Network' view
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