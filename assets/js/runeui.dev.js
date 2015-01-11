window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.dev = new mithril.RuneModule('/dev');

// 'Dev' view
dev.view = function(ctrl) {
    return m('h1', 'Dev');
};