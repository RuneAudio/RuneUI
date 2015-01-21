window.channels = window.channels || {};

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


// NAVIGATION & ROUTING
// ----------------------------------------------------------------------------------------------------
m.module(document.getElementById('main-menu'), navigation);

m.route.mode = 'hash';
m.route(document.getElementById('app'), '/', {
    '/audio': audio,
    '/settings': settings,
    '/mpd': mpd,
    '/credits': credits,
    '/debug': debug,
    '/dev': dev,
    '/error': error,
    '/network/wired/:id': network_wired,
    '/network/wireless/:id': network_wireless,
    '/network': network,
    '/sources/:id': source,
    '/sources': sources
});


// COMMON MODULES
// ----------------------------------------------------------------------------------------------------
m.module(document.getElementById('playback-controls'), playback_controls);


function RuneChannel(name, onmessage, onstatuschange) {
    var channel = {};
    channel.pushstream = new PushStream({
        host: window.location.hostname,
        port: window.location.port,
        modes: GUI.mode,
        reconnectOnChannelUnavailableInterval: 5000
    });
    channel.pushstream.onmessage = onmessage;
    channel.pushstream.onstatuschange = onstatuschange;
    channel.pushstream.addChannel(name);
    channel.pushstream.connect();
    return channel;
}


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

// INIT
// ----------------------------------------------------------------------------------------------------

helpers.toggleLoader('close', 'blocking');

jQuery(document).ready(function($) { 'use strict';

    // check WebSocket support
    GUI.mode = helpers.checkWebSocket();
       
    // PNotify init options
    PNotify.prototype.options.styling = 'fontawesome';
    PNotify.prototype.options.stack.dir1 = 'up';
    PNotify.prototype.options.stack.dir2 = 'left';
    PNotify.prototype.options.stack.firstpos1 = 90;
    PNotify.prototype.options.stack.firstpos2 = 50;
    PNotify.prototype.options.stack.spacing1 = 10;
    PNotify.prototype.options.stack.spacing2 = 10;

    // first connection with MPD daemon
    // open UI rendering channel;
    //var playbackStatus = function (status) {
    //    if (status === 2) {
    //        sendCmd('renderui'); // force UI rendering (backend-call)
    //    }
    //};
    channels.playbackChannel = new RuneChannel('playback', renderUI); //, playbackStatus);

    // open channels
    channels.notifyChannel = new RuneChannel('notify', renderMSG);
    //channels.nicsChannel = new RuneChannel('nics', nicsDetails);
    //channels.wlansChannel = new RuneChannel('wlans', listWLANs); // $.ajax({url: '/command/?cmd=wifiscan'});
    //channels.libraryChannel = new RuneChannel('library', libraryHome);
    //channels.queueChannel = new RuneChannel('queue', renderQueue);

    // remove 300ms delay from Mobile Browsers
    //    FastClick.attach(document.body);

    sendCmd('renderui');

});