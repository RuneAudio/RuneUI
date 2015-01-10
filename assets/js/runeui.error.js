window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.error = new mithril.RuneModule('/error');

// 'Error' view
error.view = function (ctrl) {
    return m('h1', 'Error');
};