window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.debug = new mithril.RuneModule('/debug');

// 'Debug' view
debug.view = function(ctrl) {
    return [m('.container.debug', [
		m('h1', 'DEBUG DATA'),
		m('.boxed', [
			m('p', ['Below is displayed the raw output of RuneUI"s debug section. It contains some important informations that could help to diagnosticate problems.', m('br'), 'Please copy and paste it in your posts when asking for help ', m('a[href="http://www.runeaudio.com/forum/"][target="_blank"][title="RuneAudio Forum"]', 'in the forum'), '.']),
			m('button.btn.btn-primary.btn-lg[data-clipboard-target="clipboard_pre"][id="copy-to-clipboard"]', [m('i.fa.fa-copy.sx'), ' Copy data to clipboard'])
		]),
		m('br'),
		m('pre[id="clipboard_pre"]', debug.vm.data.debug)])
    ];
};