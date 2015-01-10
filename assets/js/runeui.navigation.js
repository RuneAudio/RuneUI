window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.navigation = {
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
            this.add('Turn off', '', 'power-off', function () { m.module(document.getElementById('dialog'), modal.turnoff); });        //
        };

        return vm;

    }()),
    controller: function () {
        navigation.vm.init();
    },
    view: function (ctrl) {
        return [m('a.dropdown-toggle[data-target="#"][data-toggle="dropdown"][href="#"][id="menu-settings"][role="button"]',
                ['MENU ', m('i.fa.fa-bars.dx')]), '\n', m('ul.dropdown-menu[aria-labelledby="menu-settings"][role="menu"]',
                    [navigation.vm.pages.map(function (item, index) {
                        return m('li', { className: item.selected() ? 'active' : '' },
                        item.url() ? [m('a[href="' + item.url() + '"]', { config: m.route }, [m('i.fa.fa-' + item.icon()), ' ' + item.name()])] : [m('a[href="javascript:;"]', { onclick: function (e) { item.action(); } }, [m('i.fa.fa-' + item.icon()), ' ' + item.name()])]);
        })])];
    }
};
m.module(document.getElementById('main-menu'), navigation);