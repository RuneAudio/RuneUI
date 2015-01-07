window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.sources = new mithril.RuneModule('/sources');

sources.vm.updateMDP = function () {
    data.postData(sources.vm.url, { updatempd: true });
};
sources.vm.updateMDP = function () {
    data.postData(sources.vm.url, { mountall: true });
};
sources.vm.add = function () {
    console.log('source add');
    m.route('/sources/0');
};
sources.vm.edit = function (id) {
    console.log('source edit');
    m.route('/sources/' + id);
};

// 'Sources' view
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