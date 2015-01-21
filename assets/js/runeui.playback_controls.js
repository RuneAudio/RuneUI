window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};
// window.playback_controls = window.playback_controls || {};

window.playback_controls = {};

playback_controls.vm = (function() {

    var vm = {};

    vm.state = m.prop('');
    
    vm.init = function() {
        // a slot to store the state
        vm.state = m.prop('');
        
        // valid states from the backend
        vm.validStates = {stop: 'stop', play: 'play', pause: 'pause'};
        
        vm.setState = function(state) {
            m.startComputation();
            playback_controls.vm.state(vm.validStates[state]);
            // console.log(vm.validStates[state]);
            m.endComputation();
            //m.redraw();
        };

        // valid commands to the backend
        vm.validCommands = {prev: 'previous', stop: 'stop', playpause: 'playpause', next: 'next'};
        
        // filter playback control commands before sending them to the backend
        vm.filterCmd = function(cmd) {
            if (vm.validCommands[cmd] === 'playpause') {
                if (playback_controls.vm.state() === 'play') {
                    vm.sendCmd('pause');
                } else if (playback_controls.vm.state() === 'stop' || playback_controls.vm.state() === 'pause') {
                    vm.sendCmd('play');
                }
            } else if (vm.validCommands[cmd] === 'stop') {
                if (vm.state() !== 'stop') {
                    vm.sendCmd('stop');
                }
            } else {
                vm.sendCmd(cmd); // check this
            }
        };
        
        // send playback control commands to the backend
        vm.sendCmd = function(cmd) {
            var request = m.request({
                background: true,
                method: 'GET',
                url: '/command/?cmd=' + cmd,
                deserialize: function(value) {return value;}
            });
        };

    };

    return vm;

}());

playback_controls.controller = function() {
    playback_controls.vm.init();
};

playback_controls.view = function(ctrl) {
    return [
        m('button.btn.btn-default[title="Previous"]',
            { onclick: function(e) { playback_controls.vm.filterCmd('previous'); }}, [
            m('i.fa.fa-step-backward', '')
        ]),'\n\n',
        m('button.btn.btn-default[title="Stop"]', { onclick: function(e) { playback_controls.vm.filterCmd('stop'); }, className: (playback_controls.vm.state() === 'stop') ? 'btn-primary' : '' }, [
            m('i.fa.fa-stop', '')
        ]),'\n\n',
        m('button.btn.btn-default[title="Play/Pause"]',
            { onclick: function(e) { playback_controls.vm.filterCmd('playpause'); },
            className: (playback_controls.vm.state() === 'play' || playback_controls.vm.state() === 'pause') ? 'btn-primary' : '' }, [
            m('i.fa', { className: (playback_controls.vm.state() === 'pause') ? 'fa-pause' : 'fa-play' }, '')
        ]),'\n\n',
        m('button.btn.btn-default[title="Next"]',
        { onclick: function(e) { playback_controls.vm.filterCmd('next'); }}, [
            m('i.fa.fa-step-forward', '')
        ])
    ];
};
