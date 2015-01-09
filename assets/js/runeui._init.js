// window.playback_controls = window.playback_controls || {};

var GUI = {
    DBentry: ['','',''],
    DBupdate: 0,
    activePlayer: '',
    browsemode: 'file',
    currentDBpos: [0,0,0,0,0,0,0,0,0,0,0],
    currentDBpath: ['','','','','','','','','','',''],
    currentalbum: null,
    currentknob: null,
    currentpath: '',
    currentsong: null,
    currentqueuepos: 0,
    json: 0,
    libraryhome: '',
    mode: 'websocket',
    noticeUI: {},
    playlist: null,
    plugin: '',
    state: '',
    stepVolumeDelta: 0,
    stepVolumeInt: 0,
    stream: '',
    visibility: 'visible',
    volume: null
};



// ROUTING
// ----------------------------------------------------------------------------------------------------

m.route.mode = 'hash';
m.route(document.getElementById('app'), '/', {
    '/audio': audio,
    '/settings': settings,
    '/mpd': mpd,
    '/credits': credits,
    '/debug': debug,
    '/dev': dev,
    '/error': error,
    '/network': network,
    '/sources/:id': source,
    '/sources': sources
});



// NGINX PUSHSTREAM MODULE CHANNELS
// ----------------------------------------------------------------------------------------------------

// custom complex notifies
function customNotify(notify) {
    if (notify.custom === 'kernelswitch') {
        if (GUI.noticeUI.kernelswitch !== undefined) {
            GUI.noticeUI.kernelswitch.remove();
        }
        GUI.noticeUI.kernelswitch = new PNotify({
            title: ('title' in notify) ? notify.title : '[missing title]',
            text: ('text' in notify) ? notify.text : '[missing text]',
            icon: 'fa fa-refresh',
            hide: false,
            confirm: {
                confirm: true,
                buttons: [{
                    text: notify.btntext,
                    addClass: 'btn-default btn-block  uppercase',
                    click: function() {
                        $.post('/settings/', { 'syscmd' : 'reboot' });
                        toggleLoader();
                    }
                },
                {
                    text: 'Cancel',
                    addClass: 'hide'
                }]
            },
            buttons: {
                closer: false,
                sticker: false
            }
        });
    }
}

// notify messages rendering
function renderMSG(text) {
    // console.log(text);
    var notify = text[0];
    if ('custom' in notify && notify.custom !== null) {
        customNotify(notify);
        return;
    }
    var noticeOptions = {
        title: ('title' in notify) ? notify.title : '[missing title]',
        text: ('text' in notify) ? notify.text : '[missing text]',
        icon: (notify.icon === undefined) ? 'fa fa-check' : notify.icon,
        opacity: (notify.opacity === undefined) ? 0.9 : notify.opacity,
        hide: (notify.hide === undefined && notify.permanotice === undefined),
        buttons: {
            closer: (notify.permanotice === undefined),
            sticker: (notify.permanotice === undefined)
        },
        delay: (notify.delay === undefined) ? 8000 : notify.delay,
        mouse_reset: false
    };
    if ('permanotice' in notify) {
        if (GUI.noticeUI[notify.permanotice] === undefined) {
            GUI.noticeUI[notify.permanotice] = new PNotify(noticeOptions);
        } else {
            if ('permaremove' in notify) {
                GUI.noticeUI[notify.permanotice].remove();
                GUI.noticeUI[notify.permanotice] = undefined;
            } else {
                GUI.noticeUI[notify.permanotice].open();
            }
        }
    } else {
        new PNotify(noticeOptions);
    }
}

// process the status update data
function renderUI(text){
    var status = text[0];
    playback_controls.vm.setState(status.state);
}

// open the Playback UI refresh channel
function playbackChannel(){
    var pushstream = new PushStream({
        host: window.location.hostname,
        port: window.location.port,
        modes: GUI.mode,
        reconnectOnChannelUnavailableInterval: 5000
    });
    pushstream.onmessage = renderUI;
    pushstream.onstatuschange = function(status) {
        // console.log('[nginx pushtream module] status = ', status);
        if (status === 2) {
            // $('#loader').addClass('hide');
            sendCmd('renderui'); // force UI rendering (backend-call)
        } else {
            // console.log('[nginx pushtream module] status change (' + status + ')');
            if (status === 0) {
                // console.log('[nginx pushtream module] status disconnected (0)');
                // toggleLoader();
            }
        }
    };
    // pushstream.onerror = function() {
        // toggleLoader();
        // console.log('[nginx pushtream module] error');
    // };
    pushstream.addChannel('playback');
    pushstream.connect();
}

// open the playing queue channel
function queueChannel(){
    var pushstream = new PushStream({
        host: window.location.hostname,
        port: window.location.port,
        modes: GUI.mode
    });
    pushstream.onmessage = renderQueue;
    // pushstream.onstatuschange = function(status) {
    // force queue rendering (backend-call)
        // if (status === 2) sendCmd('renderpl');
    // };
    pushstream.addChannel('queue');
    pushstream.connect();
}

// open the library channel
function libraryChannel(){
    var pushstream = new PushStream({
        host: window.location.hostname,
        port: window.location.port,
        modes: GUI.mode
    });
    pushstream.onmessage = libraryHome;
    pushstream.addChannel('library');
    pushstream.connect();
}

// open the notify messages channel
function notifyChannel(){
    var pushstream = new PushStream({
        host: window.location.hostname,
        port: window.location.port,
        modes: GUI.mode
    });
    pushstream.onmessage = renderMSG;
    pushstream.addChannel('notify');
    pushstream.connect();
}

// open the in range Wi-Fi networks list channel
function wlansChannel(){
    var pushstream = new PushStream({
        host: window.location.hostname,
        port: window.location.port,
        modes: GUI.mode
    });
    pushstream.onmessage = listWLANs;
    pushstream.addChannel('wlans');
    pushstream.connect();
    $.ajax({url: '/command/?cmd=wifiscan'});
}

// open the NIC details channel
function nicsChannel(){
    var pushstream = new PushStream({
        host: window.location.hostname,
        port: window.location.port,
        modes: GUI.mode
    });
    pushstream.onmessage = nicsDetails;
    pushstream.addChannel('nics');
    pushstream.connect();
}



// INIT
// ----------------------------------------------------------------------------------------------------

jQuery(document).ready(function ($) { 'use strict';

    // check WebSocket support
    GUI.mode = helpers.checkWebSocket();
    
    // first connection with MPD daemon
    // open UI rendering channel;
    playbackChannel();
    
    // PNotify init options
    PNotify.prototype.options.styling = 'fontawesome';
    PNotify.prototype.options.stack.dir1 = 'up';
    PNotify.prototype.options.stack.dir2 = 'left';
    PNotify.prototype.options.stack.firstpos1 = 90;
    PNotify.prototype.options.stack.firstpos2 = 50;
    PNotify.prototype.options.stack.spacing1 = 10;
    PNotify.prototype.options.stack.spacing2 = 10;
    // open notify channel
    notifyChannel();

});