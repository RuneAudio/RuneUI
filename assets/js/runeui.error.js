window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.error = new mithril.RuneModule('/error');

error.vm.showError = function (errormsg, returnto) {
    error.vm.errormsg = errormsg;
    error.vm.returnto = returnto;
    error.vm.getReturnTo = function() {
        if (error.vm.returnto) {
            return m('button.btn.btn-default.btn-lg', { onclick: function () { m.route(error.vm.returnto) } }, 'Go back');
        }
    }

    m.route('/error');
};

// 'Error' view
error.view = function(ctrl) {
    return [m('h1', 'Error'),
        m('p', error.vm.errormsg),
        error.vm.getReturnTo()
    ];
};