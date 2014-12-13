/*
 * Copyright (C) 2013 RuneAudio Team
 * http://www.runeaudio.com
 *
 * RuneUI
 * copyright (C) 2013 – Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)
 *
 * RuneOS
 * copyright (C) 2013 – Carmelo San Giovanni (aka Um3ggh1U)
 *
 * RuneAudio website and logo
 * copyright (C) 2013 – ACX webdesign (Andrea Coiutti)
 *
 * This Program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3, or (at your option)
 * any later version.
 *
 * This Program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with RuneAudio; see the file COPYING.    If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.txt>.
 *
 *    file: runeui.js
 *    version: 1.3
 *
 */


// ====================================================================================================
// Global GUI Array
// ====================================================================================================

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



// ====================================================================================================
// FUNCTIONS
// ====================================================================================================

// send a MPD playback control command
function sendCmd(inputcmd) {
    var request = new XMLHttpRequest();
    request.open('GET', '/command/?cmd='+inputcmd, true);
    request.onreadystatechange = function() {
        if (this.readyState === 4){
        // TODO: check this
            if (this.status >= 200 && this.status < 400){
                // Success! resp = this.responseText;
            } else {
                // Error
            }
        }
    };
    request.send();
    request = null;
}

// check WebSocket support
function checkWebSocket(){
    if (window.WebSocket){
        // console.log('WebSockets supported');
        return 'websocket';
    } else {
        // console.log('WebSockets not supported');
        return 'longpolling';
    }
}

// check HTML5 Workers support
function checkWorkers(){
    if ((window.Worker && window.Blob) || (Modernizr.webworkers && Modernizr.blobconstructor)) {
        // console.log('WebWorkers supported');
        return true;
    } else {
        // console.log('WebWorkers not supported');
        return false;
    }
}

// recover the path from input string
function parsePath(str) {
    var cutpos = str && str.length? str.lastIndexOf('/'):0;
    // console.log('parsePath.cutpos', cutpos)
    //-- verify this switch! (Orion)
    var songpath = '';
    if (cutpos && cutpos !== -1){
        songpath = str.slice(0,cutpos);
    }
    return songpath;
}

// update countdown
function refreshTimer(startFrom, stopTo, state) {
    // console.log('startFrom = ', startFrom);
    // console.log('state = ', state);
    var display = $('#countdown-display');
    display.countdown('destroy');
    display.countdown({ since: ((state !== 'stop' || state !== undefined)? -(startFrom) : 0), compact: true, format: 'MS' });
    if (state !== 'play'){
        // console.log('startFrom = ', startFrom);
        display.countdown('pause');
    }
}

// update playback progress knob
function refreshKnob() {
    window.clearInterval(GUI.currentKnob);
    var initTime = parseInt(GUI.json.song_percent)*10;
    var delta = parseInt(GUI.json.time);
    var step = parseInt(1000/delta);
    // console.log('initTime = ' + initTime + ', delta = ' + delta + ', step = ' + step);
    var time = $('#time');
    time.val(initTime, false).trigger('update');
    if (GUI.state === 'play') {
        GUI.currentKnob = setInterval(function() {
            // console.log('initTime = ', initTime);
            initTime = initTime + ((GUI.visibility !== 'visible') ? step : 1);
            time.val(initTime, false).trigger('update');
            //document.title = Math.round(initTime)/10 + '% - ' + GUI.visibility;
        }, delta);
    }
}

// time conversion
function timeConvert(seconds) {
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    var mm = (minutes < 10) ? ('0' + minutes) : minutes;
    var ss = (seconds < 10) ? ('0' + seconds) : seconds;
    return mm + ':' + ss;
}
function timeConvert2(ss) {
    var hr = Math.floor(ss/3600);
    var mm = Math.floor((ss -(hr * 3600))/60);
    ss = Math.floor(ss -(hr*3600) -(mm * 60));
    if (hr > 0) {
        if (hr < 10){
            hr = '0' + hr;
        }
        hr += ':';
    } else {
        hr = '';
    }
    if (mm < 10) { mm = '0' + mm; }
    if (ss < 10) { ss = '0' + ss; }
    return hr + mm + ':' + ss;
}

// reset countdown
function countdownRestart(startFrom) {
    var display = $('#countdown-display').countdown('destroy');
    display.countdown({since: -(startFrom), compact: true, format: 'MS'});
}

// set volume with knob
function setvol(val) {
    $('#volume').val(val, false).trigger('update');
    GUI.volume = val;
    $('#volumemute').removeClass('btn-primary');
    sendCmd('setvol ' + val);
}

// stepped volume control
function volumeStepCalc(direction) {
    var i = 0;
    var way = direction;
    GUI.volume = parseInt($('#volume').val());
    var volumeStep = function volumeStepCycle(way){
        i++;
        if (direction === 'up') {
            GUI.stepVolumeDelta = parseInt(GUI.volume) + i;
        } else if (direction === 'dn') {
            GUI.stepVolumeDelta = parseInt(GUI.volume) - i;
        }
        // console.log('GUI.stepVolumeDelta = ', GUI.stepVolumeDelta);
        $('#volume').val(GUI.stepVolumeDelta).trigger('change');
    };
    volumeStep();
    // console.log('GUI.volume = ', GUI.volume);
    
    GUI.stepVolumeInt = window.setInterval(function() {
        volumeStep();
    }, 200);
}
function volumeStepSet() {
    window.clearInterval(GUI.stepVolumeInt);
    setvol(GUI.stepVolumeDelta);
    // console.log('set volume to = ', GUI.stepVolumeDelta);
}
    
// custom scrolling
function customScroll(list, destination, speed) {
    // console.log('list = ' + list + ', destination = ' + destination + ', speed = ' + speed);
    if (typeof(speed) === 'undefined') {
        speed = 500;
    }
    var entryheight = 49;
    var centerheight = parseInt($(window).height()/2);
    var scrolltop = $(window).scrollTop();
    var scrollcalc = 0;
    var scrolloffset = 0;
    if (list === 'db') {
        scrollcalc = parseInt((destination)*entryheight - centerheight);
        scrolloffset = scrollcalc;
    } else if (list === 'pl') {
        //var scrolloffset = parseInt((destination + 2)*entryheight - centerheight);
        scrollcalc = parseInt((destination + 2)*entryheight - centerheight);
        scrolloffset = Math.abs(scrollcalc - scrolltop);
        scrolloffset = (scrollcalc > scrolltop ? '+':'-') + '=' + scrolloffset + 'px';
        $('#playlist-entries').find('li').eq(destination).addClass('active');
    }
    // debug
    // console.log('-------------------------------------------');
    // console.log('customScroll parameters = ' + list + ', ' + destination + ', ' + speed);
    // console.log('scrolltop = ', scrolltop);
    // console.log('scrollcalc = ', scrollcalc);
    // console.log('scrolloffset = ', scrolloffset);
    $.scrollTo( (scrollcalc >0? scrolloffset:0), speed);
}

// [!] scrolling debug purpose only
function randomScrollPL() {
    var n = $('.playlist li').size();
    var random = 1 + Math.floor(Math.random() * n);
    customScroll('pl', random);
}
function randomScrollDB() {
    var n = $('.database li').size();
    var random = 1 + Math.floor(Math.random() * n);
    customScroll('db', random);
}

// toggle blocking loading layer (spinning arrows)
function toggleLoader(action) {
    if (action === 'close') {
        $('#loader').addClass('hide');
    } else {
        if ($('#section-dev').length) {
            $('#loader').addClass('hide');
            new PNotify({
                title: 'Warning',
                text: 'The loading layer (spinning arrows) points to a socket error',
                icon: 'fa fa-exclamation-circle'
            });
        } else {
            $('#loader').removeClass('hide');
        }
    }
}

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

// sorting commands
function sortOrder(id) {
    var pos = $('#' + id).index();
    id = parseInt(id.replace('pl-', ''));
    // console.log('id = ' + id + ', pos = ', pos);
    sendCmd('moveid ' + id + ' ' + pos);
}

// loading spinner display/hide
function loadingSpinner(section, hide) {
    if (hide === 'hide') {
        if (section === 'db') {
            $('#spinner-db').addClass('hide');
        }
        if (section === 'pl') {
            $('#spinner-pl').addClass('hide');
        }
    } else {
        if (section === 'db') {
            $('#spinner-db').removeClass('hide');
        }
        if (section === 'pl') {
            $('#spinner-pl').removeClass('hide');
        }
    }
}

// update the playback source
function setPlaybackSource() {
    var activePlayer = GUI.libraryhome.ActivePlayer;
    // update the playback section
    $('#overlay-playsource-open button').text(activePlayer);
    $('#overlay-playsource a').addClass('inactive');
    var source = activePlayer.toLowerCase();
    $('#playsource-' + source).removeClass('inactive');
    // update volume knob and control buttons
    if (activePlayer === 'Spotify' || activePlayer === 'Airplay') {
        $('#volume').trigger('configure', {'readOnly': true, 'fgColor': '#1A242F'}).css({'color': '#1A242F'});
        $('.volume button').prop('disabled', true);
        $('#single').addClass('disabled');
    } else {
        $('#volume').trigger('configure', {'readOnly': false, 'fgColor': '#0095D8'}).css({'color': '#0095D8'});
        $('.volume button').prop('disabled', false);
        $('#single').removeClass('disabled');
    }
    // style the queue
    $('#playlist-entries').removeClass(function(index, css) {
        return (css.match (/(^|\s)playlist-\S+/g) || []).join(' ');
    }).addClass('playlist-' + source);
    // toggle queue buttons
    $('#pl-manage').removeClass(function(index, css) {
        return (css.match (/(^|\s)pl-manage-\S+/g) || []).join(' ');
    }).addClass('pl-manage-' + source);
}

function chkKey(key) {
    return (key !== undefined && key !== '');
}

// render the Library home screen
function renderLibraryHome() {
    loadingSpinner('db');
    $('#database-entries').addClass('hide');
    $('#db-level-up').addClass('hide');
    $('#db-homeSetup').removeClass('hide').removeClass('btn-primary').addClass('btn-default');
    $('#home-blocks').removeClass('hide');
    var obj = GUI.libraryhome,
        i = 0,
        content = '',
        divOpen = '<div class="col-lg-3 col-md-4 col-sm-6">',
        divClose = '</div>',
        toggleMPD = '',
        toggleSpotify = '',
        notMPD = (obj.ActivePlayer === 'Spotify' || obj.ActivePlayer === 'Airplay');
    content = '<div class="col-sm-12"><h1 class="txtmid">Browse your library</h1></div>';
    // Set active player
    setPlaybackSource();
    if (notMPD) {
        toggleMPD =  ' inactive';
    }
    // bookmarks blocks
    for (i = 0; (bookmark = obj.bookmarks[i]); i += 1) {
        content += divOpen + '<div id="home-bookmark-' + bookmark.id + '" class="home-block home-bookmark' + toggleMPD + '" data-path="' + bookmark.path + '"><i class="fa fa-star"></i><h3>' + bookmark.name + '</h3>bookmark</div>' + divClose;
    }
    if (chkKey(obj.networkMounts)) {
    // network mounts block
        if (obj.networkMounts === 0) {
            if (notMPD) {
                content += divOpen + '<div id="home-nas" class="home-block inactive"><i class="fa fa-sitemap"></i><h3>Network mounts (0)</h3>network attached storages</div>' + divClose;
            } else {
                content += divOpen + '<a class="home-block' + toggleMPD + '" href="/sources/add/"><i class="fa fa-sitemap"></i><h3>Network mounts (0)</h3>click to add some</a>' + divClose;
            }
        } else {
            content += divOpen + '<div id="home-nas" class="home-block' + toggleMPD + '" data-path="NAS"><i class="fa fa-sitemap"></i><h3>Network mounts (' + obj.networkMounts + ')</h3>network attached storages</div>' + divClose;
        }
    }
    if (chkKey(obj.localStorages)) {
    // local storages block
        if (obj.localStorages === 0) {
            content += '';
        } else {
            content += divOpen + '<div id="home-local" class="home-block' + toggleMPD + '" data-path="LocalStorage"><i class="fa fa-hdd-o"></i><h3>LocalStorage (' + obj.localStorages + ')</h3>locally stored music</div>' + divClose;
        }
    }
    if (chkKey(obj.USBMounts)) {
    // USB mounts block
        if (obj.USBMounts === 0) {
            if (notMPD) {
                content += divOpen + '<div id="home-usb" class="home-block inactive"><i class="fa fa-hdd-o"></i><h3>USB storage (0)</h3>no USB storage plugged</div>' + divClose;
            } else {
                content += divOpen + '<a id="home-usb" class="home-block' + toggleMPD + '" href="/sources"><i class="fa fa-hdd-o"></i><h3>USB storage (0)</h3>no USB storage plugged</a>' + divClose;
            }
        } else {
            content += divOpen + '<div id="home-usb" class="home-block' + toggleMPD + '" data-path="USB"><i class="fa fa-hdd-o"></i><h3>USB storage (' + obj.USBMounts + ')</h3>USB attached drives</div>' + divClose;
        }
    }
    if (chkKey(obj.webradio)) {
    // webradios block
        if (obj.webradio === 0) {
            if (notMPD) {
                content += divOpen + '<div id="home-webradio" class="home-block inactive"><i class="fa fa-microphone"></i><h3>My Webradios (0)</h3>webradio local playlists</div>' + divClose;
            } else {
                content += divOpen + '<a id="home-webradio" class="home-block' + toggleMPD + '" href="#" data-toggle="modal" data-target="#modal-webradio-add"><i class="fa fa-microphone"></i><h3>My Webradios (0)</h3>click to add some</a>' + divClose;
            }
        } else {
            content += divOpen + '<div id="home-webradio" class="home-block' + toggleMPD + '" data-path="Webradio"><i class="fa fa-microphone"></i><h3>My Webradios (' + obj.webradio + ')</h3>webradio local playlists</div>' + divClose;
        }
    }
    if (chkKey(obj.Spotify)) {
    // Spotify block
        if (obj.Spotify === '0') {
            content += divOpen + '<a id="home-spotify" class="home-block' + toggleSpotify + '" href="/settings/#features-management"><i class="fa fa-spotify"></i><h3>Spotify<span id="home-count-spotify"></span></h3>click to configure</a>' + divClose;
        } else {
            if (obj.ActivePlayer !== 'Spotify') {
                content += divOpen + '<div id="home-spotify-switch" class="home-block"><i class="fa fa-spotify"></i><h3>Spotify</h3>click to switch renderer</div>' + divClose;
            } else {
                content += divOpen + '<div id="home-spotify" class="home-block' + toggleSpotify + '" data-plugin="Spotify" data-path="Spotify"><i class="fa fa-spotify"></i><h3>Spotify</h3>music for everyone</div>' + divClose;
            }
        }
    }
    if (chkKey(obj.Dirble)) {
    // Dirble block
        content += divOpen + '<div id="home-dirble" class="home-block' + toggleMPD + '" data-plugin="Dirble" data-path="Dirble"><i class="fa fa-globe"></i><h3>Dirble <span id="home-count-dirble">(' + obj.Dirble + ')</span></h3>radio stations open directory</div>' + divClose;
    }
    // Jamendo (static)
    content += divOpen + '<div id="home-jamendo" class="home-block' + toggleMPD + '" data-plugin="Jamendo" data-path="Jamendo"><i class="fa fa-play-circle-o"></i><h3>Jamendo<span id="home-count-jamendo"></span></h3>world\'s largest platform for free music</div>' + divClose;
    // Album list (static)
    content += divOpen + '<div id="home-albums" class="home-block' + toggleMPD + '" data-path="Albums" data-browsemode="album"><i class="fa fa-dot-circle-o"></i><h3>Albums</h3>browse MPD database by album</div>' + divClose;
    // Artist list (static)
    content += divOpen + '<div id="home-artists" class="home-block' + toggleMPD + '" data-path="Artists" data-browsemode="artist"><i class="fa fa-users"></i><h3>Artists</h3>browse MPD database by artist</div>' + divClose;
    // Genre list (static)
    content += divOpen + '<div id="home-genre" class="home-block' + toggleMPD + '" data-path="Genres" data-browsemode="genre"><i class="fa fa-tags"></i><h3>Genres</h3>browse MPD database by genre</div>' + divClose;
    content += '</div>';
    document.getElementById('home-blocks').innerHTML = content;
    loadingSpinner('db', 'hide');
    $('span', '#db-currentpath').html('');
}

// update info and status on Playback tab
function refreshState() {
    var state = GUI.state;
    if (state === 'play') {
        $('#play').addClass('btn-primary');
        $('i', '#play').removeClass('fa fa-pause').addClass('fa fa-play');
        $('#stop').removeClass('btn-primary');
    } else if (state === 'pause') {
        $('#playlist-position span').html('Not playing');
        $('#play').addClass('btn-primary');
        $('i', '#play').removeClass('fa fa-play').addClass('fa fa-pause');
        $('#stop').removeClass('btn-primary');
    } else if (state === 'stop') {
        $('#play').removeClass('btn-primary');
        $('i', '#play').removeClass('fa fa-pause').addClass('fa fa-play');
        $('#stop').addClass('btn-primary');
        if ($('#section-index').length) {
            $('#countdown-display').countdown('destroy');
        }
        // if (GUI.stream === 'radio') {
            // $('#elapsed').html('&infin;');
        // } else {
            // $('#elapsed').html('00:00');
        // }
        if (GUI.stream === 'radio') {
            $('#total').html('<span>&infin;</span>');
        } else {
            $('#total').html('00:00');
        }
        $('#time').val(0, false).trigger('update');
        $('#format-bitrate').html('&nbsp;');
        $('li', '#playlist-entries').removeClass('active');
    }
    if (state !== 'stop') {
        // console.log('GUI.json.elapsed =', GUI.json.elapsed);
        // $('#elapsed').html((GUI.json.elapsed !== undefined)? timeConvert(GUI.json.elapsed) : '00:00');
        if (GUI.stream === 'radio') {
            $('#total').html('<span>&infin;</span>');
        } else {
            $('#total').html((GUI.json.time !== undefined)? timeConvert(GUI.json.time) : '00:00');
        }
        var fileinfo = (GUI.json.audio_channels && GUI.json.audio_sample_depth && GUI.json.audio_sample_rate) ? (GUI.json.audio_channels + ', ' + GUI.json.audio_sample_depth + ' bit, ' + GUI.json.audio_sample_rate +' kHz, '+GUI.json.bitrate+' kbps') : '&nbsp;';
        $('#format-bitrate').html(fileinfo);
        $('li', '#playlist-entries').removeClass('active');
        var current = parseInt(GUI.json.song);
        $('#playlist-entries').find('li').eq(current).addClass('active');
    }
    if (GUI.json.playlistlength && GUI.json.playlistlength !== '0') {
        if (GUI.json.song) {
            $('#playlist-position span').html('Playlist position ' + (parseInt(GUI.json.song) + 1) + '/' + GUI.json.playlistlength);
        } else {
            $('#playlist-position span').html('Playlist position 1/' + GUI.json.playlistlength);
        }
    } else {
        $('#playlist-position span').html('Empty queue, add some music!');
    }
    // show UpdateDB icon
    // console.log('dbupdate = ', GUI.json.updating_db);
    // if (typeof GUI.json.updating_db !== 'undefined') {
    if (GUI.json.updating_db !== undefined) {
        $('a', '#open-panel-sx').html('<i class="fa fa-refresh fa-spin"></i> Updating');
    } else {
        $('a', '#open-panel-sx').html('<i class="fa fa-music sx"></i> Library');
    }
}

// update the Playback UI
function updateGUI() {
    var volume = GUI.json.volume;
    var radioname = GUI.json.radioname;
    var currentartist = GUI.json.currentartist;
    var currentsong = GUI.json.currentsong;
    var currentalbum = GUI.json.currentalbum;
    // set radio mode if stream is present
    GUI.stream = ((radioname !== null && radioname !== undefined && radioname !== '') ? 'radio' : '');
    // check MPD status and refresh the UI info
    refreshState();
    if ($('#section-index').length) {
        // check song update
        // console.log('A = ', GUI.json.currentsong); console.log('B = ', GUI.currentsong);
        if (GUI.currentsong !== GUI.json.currentsong) {
            countdownRestart(0);
            if ($('#panel-dx').hasClass('active')) {
                var current = parseInt(GUI.json.song);
                customScroll('pl', current);
            }
        }
        // common actions
        $('#volume').val((volume === '-1') ? 100 : volume, false).trigger('update');
        // console.log('currentartist = ', GUI.json.currentartist);
        if (GUI.stream !== 'radio') {
            $('#currentartist').html((currentartist === null || currentartist === undefined || currentartist === '') ? '<span class="notag">[no artist]</span>' : currentartist);
            $('#currentsong').html((currentsong === null || currentsong === undefined || currentsong === '') ? '<span class="notag">[no title]</span>' : currentsong);
            $('#currentalbum').html((currentalbum === null || currentalbum === undefined || currentalbum === '') ? '<span class="notag">[no album]</span>' : currentalbum);
        } else {
            $('#currentartist').html((currentartist === null || currentartist === undefined || currentartist === '') ? radioname : currentartist);
            $('#currentsong').html((currentsong === null || currentsong === undefined || currentsong === '') ? radioname : currentsong);
            $('#currentalbum').html('<span class="notag">streaming</span>');
        }
        if (GUI.json.repeat === '1') {
            $('#repeat').addClass('btn-primary');
        } else {
            $('#repeat').removeClass('btn-primary');
        }
        if (GUI.json.random === '1') {
            $('#random').addClass('btn-primary');
        } else {
            $('#random').removeClass('btn-primary');
        }
        if (GUI.json.consume === '1') {
            $('#consume').addClass('btn-primary');
        } else {
            $('#consume').removeClass('btn-primary');
        }
        if (GUI.json.single === '1') {
            $('#single').addClass('btn-primary');
        } else {
            $('#single').removeClass('btn-primary');
        }
        
        GUI.currentsong = currentsong;
        var currentalbumstring = currentartist + ' - ' + currentalbum;
        if (GUI.currentalbum !== currentalbumstring) {
            if (radioname === null || radioname === undefined || radioname === '') {
                var covercachenum = Math.floor(Math.random()*1001);
                $('#cover-art').css('background-image','url("/coverart/?v=' + covercachenum + '")');
            } else {
                $('#cover-art').css('background-image','url("assets/img/cover-radio.jpg")');
            }
        }
        GUI.currentalbum = currentalbumstring;
    }
}

// render the playing queue from the data response 
function getPlaylistPlain(data){
    var current = parseInt(GUI.json.song) + 1;
    var state = GUI.json.state;
    var content = '', time = '', artist = '', album = '', title = '', name='', str = '', filename = '', path = '', id = 0, songid = '', bottomline = '', totaltime = '', pos = 0;
    var i, line, lines = data.split('\n'), infos=[];
    for (i = 0; (line = lines[i]); i += 1) {
        infos = line.split(': ');
        if ( 'Time' === infos[0] ) {
            time = parseInt(infos[1]);
        }
        else if ( 'Artist' === infos[0] ) {
            artist = infos[1];
        }
        else if ( 'Title' === infos[0] ) {
            title = infos[1];
        }
        else if ( 'Name' === infos[0] ) {
            name = infos[1];
        }
        else if ( 'Album' === infos[0] ) {
            album = infos[1];
        }
        else if ( 'file' === infos[0] ) {
            str = infos[1];
        }
        else if ( 'Id' === infos[0] ) {
            songid = infos[1];
            if (title === '' || album === '') {
                path = parsePath(str);
                filename = str.split('/').pop();
                title = filename;
                if (artist === '') {
                    bottomline = 'path: ' + path;
                } else {
                    bottomline = artist;
                }
            } else {
                bottomline = artist + ' - ' + album;
            }
            if (name !== '') {
                title = '<i class="fa fa-microphone"></i>' + name;
                bottomline = 'URL: ' + (path === '') ? str : path;
                totaltime = '';
            } else {
                totaltime = '<span>' + timeConvert2(time) + '</span>';
            }
            pos++;
            content += '<li id="pl-' + songid + '"' + (state !== 'stop' && pos === current ? ' class="active"' : '') + '><i class="fa fa-times-circle pl-action" title="Remove song from playlist"></i><span class="sn">' + title + totaltime + '</span><span class="bl">' + bottomline + '</span></li>';
            time = ''; artist = ''; album = ''; title = ''; name = '';
        }
    }
    $('.playlist').addClass('hide');
    $('#playlist-entries').removeClass('hide');
    //$('#playlist-entries').html(content);
    var pl_entries = document.getElementById('playlist-entries');
    if( pl_entries ){ pl_entries.innerHTML = content; }
    $('#pl-filter-results').addClass('hide').html('');
    $('#pl-filter').val('');
    $('#pl-manage').removeClass('hide');
    $('#pl-count').removeClass('hide').html(pos + ((pos !== 1) ? ' entries' : ' entry'));
}

// refresh the queue (TODO: improve in PushStream mode)
function getPlaylistCmd(){
    loadingSpinner('pl');
    $.ajax({
        url: '/db/?cmd=playlist',
        success: function(data){
            if ( data.length > 4) {
                $('.playlist').addClass('hide');
                $('#playlist-entries').removeClass('hide');
                // console.time('getPlaylistPlain timer');
                getPlaylistPlain(data);
                // console.timeEnd('getPlaylistPlain timer');
                
                var current = parseInt(GUI.json.song);
                if ($('#panel-dx').hasClass('active') && GUI.currentsong !== GUI.json.currentsong) {
                    customScroll('pl', current, 200); // highlight current song in playlist
                }
            } else {
                $('.playlist').addClass('hide');
                $('#playlist-warning').removeClass('hide');
                $('#pl-filter-results').addClass('hide').html('');
                $('#pl-count').removeClass('hide').html('0 entries');
            }
            loadingSpinner('pl', 'hide');
        }
    });
}

// launch the playing queue refresh (PushStream mode, not implemented yet)
function getPlaylist(text) {
    data = text[0];
    // console.log(data);
    if ( data.length > 4) {
        $('.playlist').addClass('hide');
        $('#playlist-entries').removeClass('hide');
        // console.time('getPlaylistPlain timer');
        getPlaylistPlain(data);
        // console.timeEnd('getPlaylistPlain timer');
        
        var current = parseInt(GUI.json.song);
        if ($('#panel-dx').hasClass('active') && GUI.currentsong !== GUI.json.currentsong) {
            customScroll('pl', current, 200); // center the scroll and highlight current song in playlist
        }
    } else {
        $('.playlist').addClass('hide');
        $('#playlist-warning').removeClass('hide');
        $('#pl-filter-results').addClass('hide').html('');
        $('#pl-count').removeClass('hide').html('0 entries');
    }
    loadingSpinner('pl', 'hide');
}

// launch the Playback UI refresh from the data response
function renderUI(text){
    toggleLoader('close');
    // update global GUI array
    GUI.json = text[0];
    GUI.state = GUI.json.state;
    // console.log('current song = ', GUI.json.currentsong);
    // console.log( 'GUI.state = ', GUI.state );
    updateGUI();
    // console.log('GUI.json.elapsed = ', GUI.json.elapsed);
    // console.log('GUI.json.time = ', GUI.json.time);
    // console.log('GUI.json.state = ', GUI.json.state);
    if ($('#section-index').length) {
        var elapsed = (GUI.json.elapsed !== '' && GUI.json.elapsed !== undefined)? GUI.json.elapsed : 0;
        var time = (GUI.json.time !== '' && GUI.json.time !== undefined && GUI.json.time !== null)? GUI.json.time : 0;
        refreshTimer(parseInt(elapsed), parseInt(time), GUI.json.state);
        if (GUI.stream !== 'radio') {
            refreshKnob();
        } else {
            $('#time').val(0, false).trigger('update');
        }
        // console.log('GUI.json.playlist = ' + GUI.json.playlist + ', GUI.playlist = ', GUI.playlist);
        if (GUI.json.playlist !== GUI.playlist) {
            getPlaylistCmd();
            GUI.playlist = GUI.json.playlist;
            // console.log('playlist = ', GUI.playlist);
        }
    }
}

// render saved playlists
function renderPlaylists(data){
    var content = '', playlistname = '';
    var i, line, lines=data.split('\n'), infos=[];
    for (i = 0; (line = lines[i]); i += 1 ) {
        infos = line.split(': ');
        if( 'playlist' === infos[0] ) {
            playlistname = infos[1];
            content += '<li class="pl-folder" data-path="' + playlistname + '"><i class="fa fa-bars pl-action" data-target="#context-menu-playlist" data-toggle="context" title="Actions"></i><span><i class="fa fa-list-ol"></i>' + playlistname + '</span></li>';
            playlistname = '';
        }
    }
    document.getElementById('playlist-entries').innerHTML = '';
    $('.playlist').addClass('hide');
    $('#pl-manage').addClass('hide');
    $('#pl-count').addClass('hide');
    $('#pl-filter-results').removeClass('hide').addClass('back-to-queue').html('<i class="fa fa-arrow-left sx"></i> to queue');
    $('#pl-currentpath').removeClass('hide');
    $('#pl-editor').removeClass('hide');
    document.getElementById('pl-editor').innerHTML = content;
    loadingSpinner('pl', 'hide');
}

// get saved playlists
function getPlaylists(){
    loadingSpinner('pl');
    $.ajax({
        url: '/command/?cmd=listplaylists',
        success: function(data){
            renderPlaylists(data);
        }
    });
}

// parse the JSON response and return the formatted code
function parseResponse(options) {
    // DEFAULTS
    var inputArr = options.inputArr || '',
        respType = options.respType || '',
        i = options.i || 0,
        inpath = options.inpath || '',
        querytype = options.querytype || '',
        content = '';
        
    // DEBUG
    // console.log('parseResponse OPTIONS: inputArr = ' + inputArr + ', respType = ' + respType + ', i = ' + i + ', inpath = ' + inpath +', querytype = ' + querytype);
    // console.log(inputArr);
    
    switch (respType) {
        case 'playlist':
            // code placeholder
        break;
        
        case 'db':
        // normal MPD browsing by file
            if (GUI.browsemode === 'file') {
            // browse by file
                if (inpath === '' && inputArr.file !== undefined) {
                    inpath = parsePath(inputArr.file);
                }
                if (inputArr.file !== undefined || inpath === 'Webradio') {
                    // DEBUG
                    // console.log('inputArr.file: ', inputArr.file);
                    // console.log('inputArr.Title: ', inputArr.Title);
                    // console.log('inputArr.Artist: ', inputArr.Artist);
                    // console.log('inputArr.Album: ', inputArr.Album);
                    content = '<li id="db-' + (i + 1) + '" data-path="';
                    if (inputArr.Title !== undefined) {
                    // files
                        content += inputArr.file;
                        content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-file"></i><i class="fa fa-music db-icon"></i><span class="sn">';
                        content += inputArr.Title + ' <span>' + timeConvert(inputArr.Time) + '</span></span>';
                        content += ' <span class="bl">';
                        content +=  inputArr.Artist;
                        content += ' - ';
                        content +=  inputArr.Album;
                    } else {
                        if (inpath !== 'Webradio') {
                        // files with no tags
                            content += inputArr.file;
                            content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-file"></i><i class="fa fa-music db-icon"></i><span class="sn">';
                            content += inputArr.file.replace(inpath + '/', '') + ' <span>' + timeConvert(inputArr.Time) + '</span></span>';
                            content += '<span class="bl">';
                            content += ' path: ';
                            content += inpath;
                        } else {
                        // webradio playlists
                            content += inputArr.playlist;
                            content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-webradio"></i><i class="fa fa-microphone db-icon db-radio"></i>';
                            content += '<span class="sn">' + inputArr.playlist.replace(inpath + '/', '').replace('.' + inputArr.fileext , '');
                            content += '</span><span class="bl">webradio';
                        }
                    }
                    content += '</span></li>';
                } else if (inputArr.playlist !== undefined) {
                    if (inputArr.fileext === 'cue') {
                    // CUE files
                        content = '<li id="db-' + (i + 1) + '" data-path="';
                        content += inputArr.playlist;
                        content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-file"></i><i class="fa fa-file-text db-icon"></i><span class="sn">';
                        content += inputArr.playlist.replace(inpath + '/', '') + ' <span>[CUE file]</span></span>';
                        content += '<span class="bl">';
                        content += ' path: ';
                        content += inpath;
                        content += '</span></li>';
                    }
                } else {
                // folders
                    content = '<li id="db-' + (i + 1) + '" class="db-folder" data-path="';
                    content += inputArr.directory;
                    if (inpath !== '') {
                        content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu"></i><span><i class="fa fa-folder-open"></i>';
                    } else {
                        content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-root"></i><i class="fa fa-hdd-o icon-root"></i><span>';
                    }
                    content += inputArr.directory.replace(inpath + '/', '');
                    content += '</span></li>';
                }
            } else if (GUI.browsemode === 'album' || GUI.browsemode === 'albumfilter') {
            // browse by album
                if (inputArr.file !== undefined) {
                    content = '<li id="db-' + (i + 1) + '" data-path="';
                    content += inputArr.file;
                    content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-file"></i><i class="fa fa-music db-icon"></i><span class="sn">';
                    content += inputArr.Title + ' <span>' + timeConvert(inputArr.Time) + '</span></span>';
                    content += ' <span class="bl">';
                    content +=  inputArr.Artist;
                    content += ' - ';
                    content +=  inputArr.Album;
                    content += '</span></li>';
                } else if (inputArr.album !== '') {
                    content = '<li id="db-' + (i + 1) + '" class="db-folder db-album" data-path="';
                    content += inputArr.album.replace(/\"/g,'&quot;');
                    content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-album"></i><span><i class="fa fa-dot-circle-o"></i>';
                    content += inputArr.album;
                    content += '</span></li>';
                }
            } else if (GUI.browsemode === 'artist') {
            // browse by artist
                if (inputArr.album !== undefined) {
                    content = '<li id="db-' + (i + 1) + '" class="db-folder db-album" data-path="';
                    content += inputArr.album;
                    content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-album"></i><span><i class="fa fa-dot-circle-o"></i>';
                    content += (inputArr.album !== '') ? inputArr.album : 'Unknown album';
                    content += '</span></li>';
                } else if (inputArr.artist !== '') {
                    content = '<li id="db-' + (i + 1) + '" class="db-folder db-artist" data-path="';
                    content += inputArr.artist;
                    content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu"></i><span><i class="fa fa-user"></i>';
                    content += inputArr.artist;
                    content += '</span></li>';
                }
            } else if (GUI.browsemode === 'genre') {
            // browse by genre
                if (inputArr.artist !== undefined) {
                    content = '<li id="db-' + (i + 1) + '" class="db-folder db-artist" data-path="';
                    content += inputArr.artist;
                    content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-artist"></i><span><i class="fa fa-dot-circle-o"></i>';
                    content += (inputArr.artist !== '') ? inputArr.artist : 'Unknown artist';
                    content += '</span></li>';
                } else if (inputArr.genre !== '') {
                    content = '<li id="db-' + (i + 1) + '" class="db-folder db-genre" data-path="';
                    content += inputArr.genre;
                    content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu"></i><span><i class="fa fa-tags"></i>';
                    content += inputArr.genre;
                    content += '</span></li>';
                }
            }
        break;
        
        case 'Spotify':
        // Spotify plugin
            if (querytype === '') {
            // folders
                content = '<li id="db-' + (i + 1) + '" class="db-spotify db-folder" data-path="';
                content += inputArr.index;
                content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-spotify-pl"></i><span><i class="fa fa-folder-open"></i>';
                content += (inputArr.name !== '') ? inputArr.name : 'Favorites';
                content += ' (';
                content += inputArr.tracks;
                content += ')</span></li>';
            } else if (querytype === 'tracks') {
            // playlists
                content = '<li id="db-' + (i + 1) + '" class="db-spotify" data-path="';
                content += inputArr.index;
                content += '" data-plid="';
                content += inpath;
                content += '" data-type="spotify-track"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-spotify"></i><i class="fa fa-spotify db-icon"></i><span class="sn">';
                content += inputArr.title + ' <span>' + timeConvert(inputArr.duration/1000) + '</span></span>';
                content += ' <span class="bl">';
                content +=  inputArr.artist;
                content += ' - ';
                content +=  inputArr.album;
                content += '</span></li>';
            }
        break;
        
        case 'Dirble':
        // Dirble plugin
            if (querytype === '') {
            // folders
                content = '<li id="db-' + (i + 1) + '" class="db-dirble db-folder" data-path="';
                content += inputArr.id;
                content += '"><span><i class="fa fa-folder-open"></i>';
                content += inputArr.name;
                content += '</span></li>';
            } else if (querytype === 'stations') {
            // stations
                content = '<li id="db-' + (i + 1) + '" class="db-dirble db-radio" data-path="';
                content += inputArr.name + ' | ' + inputArr.streamurl;
                content += '"><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-dirble"></i><i class="fa fa-microphone db-icon"></i>';
                content += '<span class="sn">' + inputArr.name + ' <span>' + inputArr.bitrate + '</span></span>';
                content += '<span class="bl">';
                content += inputArr.website;
                content += '</span></li>';
            }
        break;
        
        case 'Jamendo':
        // Jamendo plugin
            // if (querytype === 'radio') {
                content = '<li id="db-' + (i + 1) + '" class="db-jamendo db-folder" data-path="';
                content += inputArr.stream;
                content += '"><img class="jamendo-cover" src="/tun/' + inputArr.image + '" alt=""><i class="fa fa-bars db-action" title="Actions" data-toggle="context" data-target="#context-menu-file"></i>';
                content += inputArr.dispname + '</div></li>';
            // }
        break;
        
    }
    return content;
} // end parseResponse()

// populate the Library view lists with entries
function populateDB(options){
    // DEFAULTS
    var data = options.data || '',
        path = options.path || '',
        uplevel = options.uplevel || 0,
        keyword = options.keyword || '',
        plugin = options.plugin || '',
        querytype = options.querytype || '',
        args = options.args || '',
        content = '',
        i = 0,
        row = [];
        
    // DEBUG
    // console.log('populateDB OPTIONS: data = ' + data + ', path = ' + path + ', uplevel = ' + uplevel + ', keyword = ' + keyword +', querytype = ' + querytype);

    if (plugin !== '') {
    // plugins
        if (plugin === 'Spotify') {
        // Spotify plugin
            $('#database-entries').removeClass('hide');
            $('#db-level-up').removeClass('hide');
            $('#home-blocks').addClass('hide');
            if (path) {
                GUI.currentpath = path;
            }
            document.getElementById('database-entries').innerHTML = '';
            data = (querytype === 'tracks') ? data.tracks : data.playlists;
            for (i = 0; (row = data[i]); i += 1) {
                content += parseResponse({
                    inputArr: row,
                    respType: 'Spotify',
                    i: i,
                    querytype: querytype,
                    inpath: args
                });
            }
            document.getElementById('database-entries').innerHTML = content;
        }
        if (plugin === 'Dirble') {
        // Dirble plugin
            $('#database-entries').removeClass('hide');
            $('#db-level-up').removeClass('hide');
            $('#home-blocks').addClass('hide');
            if (path) {
                GUI.currentpath = path;
            }
            document.getElementById('database-entries').innerHTML = '';
            // console.log(data);
            for (i = 0; (row = data[i]); i += 1) {
                content += parseResponse({
                    inputArr: row,
                    respType: 'Dirble',
                    i: i,
                    querytype: querytype
                });
            }
            document.getElementById('database-entries').innerHTML = content;
        }
        if (plugin === 'Jamendo') {
        // Jamendo plugin
            $('#database-entries').removeClass('hide');
            $('#db-level-up').removeClass('hide');
            $('#home-blocks').addClass('hide');
            if (path) {
                GUI.currentpath = path;
            }
            document.getElementById('database-entries').innerHTML = '';
            for (i = 0; (row = data[i]); i += 1) {
                content += parseResponse({
                    inputArr: row,
                    respType: 'Jamendo',
                    i: i,
                    querytype: querytype
                });
            }
            document.getElementById('database-entries').innerHTML = content;
        }
    } else {
    // normal MPD browsing
        if (path === '' && keyword === '') {
        // Library home
            renderLibraryHome();
            return;
        } else {
        // browsing
            $('#database-entries').removeClass('hide');
            $('#db-level-up').removeClass('hide');
            $('#home-blocks').addClass('hide');
            if (path) {
                GUI.currentpath = path;
            }
            // console.log(' new GUI.currentpath = ', GUI.currentpath);
            document.getElementById('database-entries').innerHTML = '';
            if (keyword !== '') {
            // search results
                var results = (data.length) ? data.length : '0';
                var s = (data.length === 1) ? '' : 's';
                $('#db-level-up').addClass('hide');
                $('#db-search-results').removeClass('hide').html('<i class="fa fa-times sx"></i><span class="visible-xs-inline">back</span><span class="hidden-xs">' + results + ' result' + s + ' for "<span class="keyword">' + keyword + '</span>"</span>');
            }
            for (i = 0; (row = data[i]); i += 1) {
                content += parseResponse({
                    inputArr: row,
                    respType: 'db',
                    i: i,
                    inpath: path
                });
            }
            if (path === 'Webradio') {
                content += '<li id="webradio-add" class="db-webradio-add"><i class="fa fa-plus-circle db-icon"></i><span class="sn"><em>add new</em></span><span class="bl">add a webradio to your library</span></li>';
            }
            document.getElementById('database-entries').innerHTML = content;
            // DEBUG
            // console.log('GUI.currentDBpos = ', GUI.currentDBpos);
            // console.log('level = ', GUI.currentDBpos[10]);
            // console.log('highlighted entry = ', GUI.currentDBpos[GUI.currentDBpos[10]]);
        }
    }
    var breadcrumb = $('span', '#db-currentpath');
    if (GUI.browsemode === 'album') {
        if (path === 'Albums') {
            breadcrumb.html(path);
        } else {
            breadcrumb.html('Albums/' + path);
        }
    } else if (GUI.browsemode === 'artist') {
        if (path === 'Artists') {
            breadcrumb.html(path);
        } else {
            breadcrumb.html('Artists/' + path);
        }
    } else if (GUI.browsemode === 'genre') {
        if (path === 'Genres') {
            breadcrumb.html(path);
        } else {
            breadcrumb.html('Genres/' + path);
        }
    } else {
        breadcrumb.html(path);
    }
    $('#db-homeSetup').addClass('hide');
    if (uplevel) {
        var position = GUI.currentDBpos[GUI.currentDBpos[10]];
        $('#db-' + position).addClass('active');
        customScroll('db', position, 0);
    } else {
        customScroll('db', 0, 0);
    }
    loadingSpinner('db', 'hide');
} // end populateDB()

// launch the right AJAX call for Library rendering
function getDB(options){
    // DEFAULTS
    var cmd = options.cmd || 'browse',
        path = options.path || '',
        browsemode = options.browsemode || 'file',
        uplevel = options.uplevel || '',
        plugin = options.plugin || '',
        querytype = options.querytype || '',
        args = options.args || '';
        
    // DEBUG
    // console.log('OPTIONS: cmd = ' + cmd + ', path = ' + path + ', browsemode = ' + browsemode + ', uplevel = ' + uplevel + ', plugin = ' + plugin);
    
    loadingSpinner('db');
    GUI.browsemode = browsemode;
    
    if (plugin !== '') {
    // plugins
        if (plugin === 'Spotify') {
        // Spotify plugin
            $.post('/db/?cmd=spotify', { 'plid': args }, function(data){
                populateDB({
                    data: data,
                    path: path,
                    plugin: plugin,
                    querytype: querytype,
                    uplevel: uplevel,
                    args: args
                });
            }, 'json');
        }
        else if (plugin === 'Dirble') {
        // Dirble plugin
            $.post('/db/?cmd=dirble', { 'querytype': (querytype === '') ? 'categories' : querytype, 'args': args }, function(data){
                populateDB({
                    data: data,
                    path: path,
                    plugin: plugin,
                    querytype: querytype,
                    uplevel: uplevel
                });
            }, 'json');
        }
        else if (plugin === 'Jamendo') {
        // Jamendo plugin
            $.post('/db/?cmd=jamendo', { 'querytype': (querytype === '') ? 'radio' : querytype, 'args': args }, function(data){
                populateDB({
                    data: data.results,
                    path: path,
                    plugin: plugin,
                    querytype: querytype
                });
            }, 'json');
        }
    } else {
    // normal browsing
        if (cmd === 'search') {
            var keyword = $('#db-search-keyword').val();
            $.post('/db/?querytype=' + GUI.browsemode + '&cmd=search', { 'query': keyword }, function(data) {
                populateDB({
                    data: data,
                    path: path,
                    uplevel: uplevel,
                    keyword: keyword
                });
            }, 'json');
        } else if (cmd === 'browse') {
            $.post('/db/?cmd=browse', { 'path': path, 'browsemode': GUI.browsemode }, function(data) {
                populateDB({
                    data: data,
                    path: path,
                    uplevel: uplevel
                });
            }, 'json');
        } else {
        // EXAMPLE: cmd === 'update', 'addplay', 'addreplaceplay', 'update'
            loadingSpinner('db', 'hide');
            $.post('/db/?cmd='+cmd, { 'path': path, 'querytype': querytype }, function(path) {
                // console.log('add= ', path);
            }, 'json');
        }
    }
} // end getDB()

// on release knob
function onreleaseKnob(value) {
    if (GUI.state !== 'stop' && GUI.state !== '') {
        if (GUI.stream !== 'radio') {
            // console.log('release percent = ', value);
            // console.log(GUI.state);
            window.clearInterval(GUI.currentKnob);
            var seekto = Math.floor((value * parseInt(GUI.json.time)) / 1000);
            sendCmd('seek ' + GUI.json.song + ' ' + seekto);
            // console.log('seekto = ', seekto);
            $('#time').val(value);
            $('#countdown-display').countdown('destroy');
            $('#countdown-display').countdown({since: -seekto, compact: true, format: 'MS'});
        } else {
            $('#time').val(0).trigger('change');
        }
    }
}

// playback command buttons
function commandButton(el) {
    var dataCmd = el.data('cmd');
    var cmd;
    // stop
    if (dataCmd === 'stop') {
        el.addClass('btn-primary');
        $('#play').removeClass('btn-primary');
        if ($('#section-index').length) {
            refreshTimer(0, 0, 'stop');
            window.clearInterval(GUI.currentKnob);
            $('.playlist').find('li').removeClass('active');
            $('#total').html('00:00');
        }
    }
    // play/pause
    else if (dataCmd === 'play') {
        var state = GUI.state;
        //if (json.currentsong != null) {
        if (state === 'play') {
            cmd = 'pause';
            if ($('#section-index').length) {
                $('#countdown-display').countdown('pause');
            }
        } else if (state === 'pause') {
            cmd = 'play';
            if ($('#section-index').length) {
                $('#countdown-display').countdown('resume');
            }
        } else if (state === 'stop') {
            cmd = 'play';
            if ($('#section-index').length) {
                $('#countdown-display').countdown({since: 0, compact: true, format: 'MS'});
            }
        }
        //$(this).find('i').toggleClass('fa fa-play').toggleClass('fa fa-pause');
        window.clearInterval(GUI.currentKnob);
        sendCmd(cmd);
        // console.log('sendCmd(' + cmd + ');');
        return;
        // } else {
            // $(this).addClass('btn-primary');
            // $('#stop').removeClass('btn-primary');
            // $('#time').val(0, false).trigger('update');
            // $('#countdown-display').countdown({since: 0, compact: true, format: 'MS'});
        // }
    }
    // previous/next
    else if (dataCmd === 'previous' || dataCmd === 'next') {
        if ($('#section-index').length) {
            $('#countdown-display').countdown('pause');
            window.clearInterval(GUI.currentKnob);
        }
    }
    // step volume control
    else if (el.hasClass('btn-volume')) {
        var vol;
        var knobvol = parseInt($('#volume').val());
        if (GUI.volume === null ) {
            GUI.volume = knobvol;
        }
        if (dataCmd === 'volumedn' && parseInt(GUI.volume) > 0) {
            vol = parseInt(GUI.volume) - 1;
            GUI.volume = vol;
            $('#volumemute').removeClass('btn-primary');
        } else if (dataCmd === 'volumeup' && parseInt(GUI.volume) < 100) {
            vol = parseInt(GUI.volume) + 1;
            GUI.volume = vol;
            $('#volumemute').removeClass('btn-primary');
        } else if (dataCmd === 'volumemute') {
            if (knobvol !== 0 ) {
                GUI.volume = knobvol;
                el.addClass('btn-primary');
                vol = 0;
            } else {
                el.removeClass('btn-primary');
                setvol(GUI.volume);
            }
        }
        // console.log('volume = ', GUI.volume);
        if ((vol >= 0) && (vol <= 100)) {
            sendCmd('setvol ' + vol);
        }
        return;
    }

    // toggle buttons
    if (el.hasClass('btn-toggle')) {
        cmd = dataCmd + (el.hasClass('btn-primary')? ' 0':' 1');
        el.toggleClass('btn-primary');
    // send command
    } else {
        cmd = dataCmd;
    }
    sendCmd(cmd);
    // console.log('sendCmd(' + cmd + ');');
}

// Library home screen
function libraryHome(text) {
    GUI.libraryhome = text[0];
    renderLibraryHome(); // TODO: do it only while in home
}

// list of in range wlans
function listWLANs(text) {
    var i = 0, content = '', inrange = '', stored = '', wlans = text[0];
    // console.log(wlans);
    $.each(wlans, function(i) {
        content += '<p><a href="/network/wlan/' + wlans[i].nic + '/' + wlans[i].ESSID + '" class="btn btn-lg btn-default btn-block" title="See network properties">';
        if (wlans[i].connected !== 0) {
            content += '<i class="fa fa-check green sx"></i>';
        }
        if (wlans[i].storedprofile === 1 && wlans[i].encryption === 'on') {
            content += '<i class="fa fa-lock sx"></i>';
        } else {
            if (wlans[i].encryption === 'on') {
                content += '<i class="fa fa-rss fa-wifi"></i><i class="fa fa-lock sx"></i>';
            } else {
                if (wlans[i].storedprofile !== 1 ) {
                content += '<i class="fa fa-rss fa-wifi sx"></i>';
                }
            }
        }
        content += '<strong>' + wlans[i].ESSID + '</strong></a></p>';
        if (wlans[i].storedprofile === 1) {
            stored += content;
        } else {
            inrange += content;
        }
        content = '';
    });
    if (inrange === '') {
        inrange = '<p><a class="btn btn-lg btn-default btn-block" href="#"><i class="fa fa-cog fa-spin sx"></i>scanning for networks...</a></p>';
    }
    document.getElementById('wifiNetworks').innerHTML = inrange;
    document.getElementById('wifiStored').innerHTML = stored;
    $.ajax({url: '/command/?cmd=wifiscan'});
}

// draw the NICs details table
function nicsDetails(text) {
    var i = 0, content = '', nics = text[0];
    // console.log(nics);
    $.each(nics, function(i) {
        if (i === $('#nic-details').data('name')) {
            content += '<tr><th>Name:</th><td><strong>' + i + '<strong></td></tr>';
            content += '<tr><th>Type:</th><td>wireless</td></tr>';
            if (nics[i].currentssid === 'off/any') {
                content += '<tr><th>Status:</th><td><i class="fa fa-times red sx"></i>no network connected</td></tr>';
            } else {
                content += '<tr><th>Status:</th><td><i class="fa fa-check green sx"></i>connected</td></tr>';
                content += '<tr><th>Associated SSID:</th><td><strong>' + nics[i].currentssid + '</strong></td></tr>';
            }
            
            content += '<tr><th>Assigned IP:</th><td>' + ((nics[i].ip !== null) ? ('<strong>' + nics[i].ip + '</strong>') : 'none') + '</td></tr>';
            content += '<tr><th>Speed:</th><td>' + ((nics[i].speed !== null) ? nics[i].speed : 'unknown') + '</td></tr>';
            // content += '<tr><th>Netmask:</th><td>' + nics[i].netmask + '</td></tr>';
            // content += '<tr><th>Gateway:</th><td>' + nics[i].gw + '</td></tr>';
            // content += '<tr><th>DNS1:</th><td>' + nics[i].dns1 + '</td></tr>';
            // content += '<tr><th>DNS2:</th><td>' + nics[i].dns2 + '</td></tr>';
        }
    });
    $('#nic-details tbody').html(content);
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
            $('#loader').addClass('hide');
            sendCmd('renderui'); // force UI rendering (backend-call)
        } else {
            // console.log('[nginx pushtream module] status change (' + status + ')');
            if (status === 0) {
                // console.log('[nginx pushtream module] status disconnected (0)');
                toggleLoader();
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
    pushstream.onmessage = getPlaylist;
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

// trigger home overlays
function overlayTrigger(overlayID) {
    // var triggerBttn = $('#overlay-social-open'),
        // overlay = $('#overlay-social'),
        // closeBttn = $('button.overlay-close');
    var overlay = $(overlayID),
        triggerBttn = $(overlayID + '-open'),
        closeBttn = $(overlayID + '-close');
        transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'msTransition': 'MSTransitionEnd',
            'transition': 'transitionend'
        };
        // transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
        // support = { transitions : Modernizr.csstransitions };
    function toggleOverlay() {
        if (overlay.hasClass('open')) {
            overlay.removeClass('open');
            overlay.addClass('closed');
            var onEndTransitionFn = function(ev) {
                if (support.transitions) {
                    if (ev.propertyName !== 'visibility') {
                        return;
                    }
                    this.removeEventListener( transEndEventName, onEndTransitionFn );
                }
                overlay.removeClass('closed');
            };
            // if (support.transitions) {
                // overlay.addEventListener( transEndEventName, onEndTransitionFn );
            // }
            // else {
                // onEndTransitionFn();
            // }
        }
        else if (overlay.hasClass('closed')) {
            overlay.addClass('open');
            if (overlayID === '#overlay-social') {
                var urlTwitter = 'https://twitter.com/home?status=Listening+to+' + GUI.json.currentsong.replace(/\s+/g, '+') + '+by+' + GUI.json.currentartist.replace(/\s+/g, '+') + '+on+%40RuneAudio+http%3A%2F%2Fwww.runeaudio.com%2F+%23nowplaying';
                var urlFacebook = 'https://www.facebook.com/sharer.php?u=http%3A%2F%2Fwww.runeaudio.com%2F&display=popup';
                var urlGooglePlus = 'https://plus.google.com/share?url=http%3A%2F%2Fwww.runeaudio.com%2F';
                $('#urlTwitter').attr('href', urlTwitter);
                $('#urlFacebook').attr('href', urlFacebook);
                $('#urlGooglePlus').attr('href', urlGooglePlus);
            }
        }
    }
    triggerBttn.click(function(){
        toggleOverlay();
    });
    closeBttn.click(function(){
        toggleOverlay();
    });
}

// check visibility of the window
function getHiddenProp(){
    var prefixes = ['webkit','moz','ms','o'];
    // if 'hidden' is natively supported just return it
    if ('hidden' in document) {
        return 'hidden';
    }
    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++){
        if ((prefixes[i] + 'Hidden') in document) {
            return prefixes[i] + 'Hidden';
        }
    }
    // otherwise it's not supported
    return null;
}
function isHidden() {
    var prop = getHiddenProp();
    if (!prop) {
        return false;
    }
    return document[prop];
}
function visChange() {
    if (isHidden()) {
        GUI.visibility = 'hidden';
        // console.log('Visibility: hidden');
    } else {
        GUI.visibility = 'visible';
        // console.log('Visibility: visible');
    }
}



if ($('#section-index').length) {

// ====================================================================================================
// PLAYBACK SECTION
// ====================================================================================================

    jQuery(document).ready(function($){ 'use strict';

        // INITIALIZATION
        // ----------------------------------------------------------------------------------------------------
        
        // check WebSocket support
        GUI.mode = checkWebSocket();
        
        // first connection with MPD daemon
        // open UI rendering channel;
        playbackChannel();
        
        // open library channel
        libraryChannel();
        // startChannel(queueChannel());
        
        // first GUI update
        // updateGUI();
        
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
        
        // use the property name to generate the prefixed event name
        var visProp = getHiddenProp();
        if (visProp) {
            var evtname = visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
            document.addEventListener(evtname, visChange);
        }

        // BUTTONS
        // ----------------------------------------------------------------------------------------------------
        
        // playback buttons
        $('.btn-cmd').click(function(){
            var el = $(this);
            commandButton(el);
        });
        
        $('#volume-step-dn').on({
            mousedown : function () {
                volumeStepCalc('dn');
            },
            mouseup : function () {
                volumeStepSet();
            }
        });
        
        $('#volume-step-up').on({
            mousedown : function () {
                volumeStepCalc('up');
            },
            mouseup : function () {
                volumeStepSet();
            }
        });
        
        
        // KNOBS
        // ----------------------------------------------------------------------------------------------------
        
        // playback knob
        $('#time').knob({
            inline: false,
            change: function (value) {
                if (GUI.state !== 'stop') {
                    window.clearInterval(GUI.currentKnob);
                } else {
                    $('#time').val(0).trigger('change');
                }
            },
            release: function (value) {
                onreleaseKnob(value);
            }
        });

        // volume knob
        $('#volume').knob({
            inline: false,
            change: function (value) {
                //setvol(value);    // disabled until perfomance issues are solved (mouse wheel is not working now)
            },
            release: function (value) {
                setvol(value);
            },
            draw: function() {
                // "tron" case
                if (this.$.data('skin') === 'tron') {
                    this.cursorExt = 0.05;
                    var a = this.arc(this.cv), pa, r = 1;
                    this.g.lineWidth = this.lineWidth;
                    if (this.o.displayPrevious) {
                        pa = this.arc(this.v);
                        this.g.beginPath();
                        this.g.strokeStyle = this.pColor;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, pa.s, pa.e, pa.d);
                        this.g.stroke();
                    }
                    this.g.beginPath();
                    this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, a.s, a.e, a.d);
                    this.g.stroke();
                    this.g.lineWidth = 2;
                    this.g.beginPath();
                    this.g.strokeStyle = this.o.fgColor;
                    this.g.arc( this.xy, this.xy, this.radius - this.lineWidth + 13 + this.lineWidth, 0, 2 * Math.PI, false);
                    this.g.stroke();
                    return false;
                }
            }
        });


        // PLAYING QUEUE
        // ----------------------------------------------------------------------------------------------------

        var playlist = $('#playlist-entries');
        
        // click on queue entry
        playlist.on('click', 'li', function(e) {
            var cmd = '';
            if ($(e.target).hasClass('pl-action')) {
                // remove queue entry
                e.preventDefault();
                // console.log($(this).parent());
                var id = $(this).attr('id');
                id = parseInt(id.replace('pl-', ''));
                cmd = 'deleteid ' + id;
                // var path = $(this).parent().data('path');
                sendCmd(cmd);
            } else {
                // play queue entry
                var pos = $('li', '#playlist-entries').index(this);
                cmd = 'play ' + pos;
                sendCmd(cmd);
                $('li.active', '#playlist-entries').removeClass('active');
                $(this).addClass('active');
            }
        });

        // on ready playlist tab
        $('a', '#open-panel-dx').click(function(){
            if ($('#open-panel-dx').hasClass('active')) {
                var current = parseInt(GUI.json.song);
                customScroll('pl', current, 500);
            }
        })
        .on('shown.bs.tab', function (e) {
            var current = parseInt(GUI.json.song);
            customScroll('pl', current, 0);
        });

        // open Library tab
        $('#open-library').click(function(){
            $('#open-panel-dx').removeClass('active');
            $('#open-panel-sx').addClass('active');
        });

        // Queue on the fly filtering
        $('#pl-filter').keyup(function(){
            $.scrollTo(0 , 500);
            var filter = $(this).val(), count = 0;
            $('li', '#playlist-entries').each(function(){
                var el = $(this);
                if (el.text().search(new RegExp(filter, 'i')) < 0) {
                    el.hide();
                } else {
                    el.show();
                    count++;
                }
            });
            var numberItems = count;
            var s = (count === 1) ? '' : 's';
            if (filter !== '') {
                $('#pl-count').addClass('hide');
                $('#pl-filter-results').removeClass('hide').html('<i class="fa fa-times sx"></i><span class="visible-xs-inline">back</span><span class="hidden-xs">' + (+count) + ' result' + s + ' for "<span class="keyword">' + filter + '</span>"</span>');
            } else {
                $('#pl-count').removeClass('hide');
                $('#pl-filter-results').addClass('hide').html('');
            }
        });
        
        // close filter results
        $('#pl-filter-results').click(function(){
            $(this).addClass('hide');
            $('#pl-count').removeClass('hide');
            if ($(this).hasClass('back-to-queue')) {
                $('.playlist').addClass('hide');
                getPlaylistCmd();
                $('#pl-currentpath').addClass('hide');
                $('#pl-manage').removeClass('hide');
            } else {
                $('li', '#playlist-entries').each(function(){
                    var el = $(this);
                    el.show();
                });
                $('#pl-currentpath').removeClass('hide');
                $('#pl-filter').val('');
            }
            customScroll('pl', parseInt(GUI.json.song), 500);
        });
        
        // playlists management
        $('#pl-manage-list').click(function(){
            getPlaylists();
        });
        
        // save current Queue to playlist
        $('#modal-pl-save-btn').click(function(){
            var playlistname = $('#pl-save-name').val();
            sendCmd('save "' + playlistname + '"');
        });
        
        // playlists management - actions context menu
        $('#pl-editor').on('click', '.pl-action', function(e) {
            e.preventDefault();
            var path = $(this).parent().attr('data-path');
            GUI.DBentry[0] = path;
        });
        
        // playlist rename action
        $('#pl-rename-button').click(function(){
            var oldname = $('#pl-rename-oldname').text();
            var newname = $('#pl-rename-name').val();
            sendCmd('rename "' + oldname + '" "' + newname + '"');
            getPlaylists();
        });
        
        // sort Queue entries
        var sortlist = document.getElementById('playlist-entries');
        new Sortable(sortlist, {
            ghostClass: 'sortable-ghost',
            onUpdate: function (evt){
                sortOrder(evt.item.getAttribute('id'));
            }
        });
        
        
        // LIBRARY
        // ----------------------------------------------------------------------------------------------------
        
        // on ready Library tab
        $('a', '#open-panel-sx').click(function(){
            if ($('#open-panel-sx').hasClass('active')) {
                customScroll('pl', parseInt(GUI.json.song), 500);
            }
        })
        .on('shown.bs.tab', function (e) {
            customScroll('db', GUI.currentDBpos[GUI.currentDBpos[10]], 0);
        });
        
        // click on Library home block
        $('#home-blocks').on('click', '.home-block', function(e) {
            if (!$(this).hasClass('inactive')) {
                if ($(this).is('#home-spotify-switch')) {
                    $('#overlay-playsource-open').trigger('click');
                } else if ($(e.target).is('span.block-remove')) {
                    var bookmarkID = $(this).attr('id');
                    bookmarkID = bookmarkID.replace('home-bookmark-', '');
                    var bookmarkName = $(this).find('h3').text();
                    $.post('/db/?cmd=bookmark', { 'id' : bookmarkID, 'name' : bookmarkName });
                } else {
                    ++GUI.currentDBpos[10];
                    getDB({
                        browsemode: $(this).data('browsemode'),
                        path: $(this).data('path'),
                        uplevel: 0,
                        plugin: $(this).data('plugin')
                    });
                }
            } else {
                $('#overlay-playsource-open').trigger('click');
            }
        });
        
        // setup Library home
        $('#db-homeSetup').click(function(){
            var editbtn = $(this);
            if (editbtn.hasClass('btn-primary')) {
                editbtn.removeClass('btn-primary').addClass('btn-default');
                $('.home-block-remove').remove();
            } else {
                editbtn.removeClass('btn-default').addClass('btn-primary');
                $('.home-block.home-bookmark').append('<div class="home-block-remove" title="Remove this bookmark"><span class="block-remove">&times;</span></div>');
            }
        });
        
        var db = $('#database-entries');
        
        // click on Library list entry
        db.on('click', 'li', function(e) {
            var path = '',
                browsemode = '';
            var el = $(this);
            if ($(e.target).hasClass('db-action')) {
            // actions context menu
                e.preventDefault();
                if (el.data('type') === 'spotify-track') {
                    path = el.data('plid') + '-' + el.data('path');
                } else {
                    path = el.data('path');
                }
                GUI.DBentry[0] = path;
                // console.log('getDB path = ', GUI.DBentry);
            } else {
            // list browsing
                $('li.active', '#database-entries').removeClass('active');
                el.addClass('active');
                if (el.hasClass('db-folder')) {
                    path = el.data('path');
                    if (el.hasClass('db-album')) {
                    // browse by album
                        if (path !== '') {
                            getDB({
                                path: path,
                                uplevel: 0,
                                browsemode: 'album'
                            });
                        } else {
                            path = GUI.currentDBpath[GUI.currentDBpos[10] - 1];
                            getDB({
                                path: path,
                                uplevel: 0,
                                browsemode: 'albumfilter'
                            });
                        }
                    } else if (el.hasClass('db-artist')) {
                    // browse by album
                        getDB({
                            path: path,
                            uplevel: 0,
                            browsemode: 'artist'
                        });
                    } else if (el.hasClass('db-genre')) {
                    // browse by genre
                        getDB({
                            path: path,
                            uplevel: 0,
                            browsemode: 'genre'
                        });
                    } else if (el.hasClass('db-spotify')) {
                    // Spotify playlists
                        path = GUI.currentpath    + '/' + el.find('span').text();
                        getDB({
                            path: path,
                            plugin: 'Spotify',
                            args: el.data('path').toString(),
                            querytype: 'tracks'
                        });
                        GUI.plugin = 'Spotify';
                    } else if (el.hasClass('db-dirble')) {
                    // Dirble folders
                        path = GUI.currentpath    + '/' + el.find('span').text();
                        getDB({
                            path: path,
                            plugin: 'Dirble',
                            querytype: 'stations',
                            args: el.data('path')
                        });
                        GUI.plugin = 'Dirble';
                    } else if (el.hasClass('db-jamendo')) {
                    // Jamendo folders
                        // path = GUI.currentpath    + '/' + el.find('span').text();
                        // var querytype = 'radio';
                        // var args = el.data('path');
                        // getDB({
                            // path: path,
                            // plugin: 'Jamendo',
                            // querytype: querytype,
                            // args : args
                        // });
                    } else {
                    // browse by file (default)
                        browsemode = el.data('browsemode');
                        //GUI.currentDBpos[GUI.currentDBpos[10]] = $('.database .db-entry').index(this);
                        getDB({
                            path: path,
                            uplevel: 0,
                            browsemode: browsemode
                        });
                    }
                    var entryID = el.attr('id');
                    entryID = entryID.replace('db-','');
                    GUI.currentDBpos[GUI.currentDBpos[10]] = entryID;
                    GUI.currentDBpath[GUI.currentDBpos[10]] = path;
                    ++GUI.currentDBpos[10];
                    // console.log('getDB path = ', path);
                } else if (el.hasClass('db-webradio-add')) {
                    $('#modal-webradio-add').modal();
                }
            }
        });
        // double click on Library list entry
        db.on('dblclick', 'li', function(e) {
            var el = $(this);
            if (!$(e.target).hasClass('db-action')) {
                $('li.active', '#database-entries').removeClass('active');
                el.addClass('active');
                var path = el.data('path');
                // console.log('doubleclicked path = ', path);
                if (el.hasClass('db-spotify')) {
                    path = el.attr('data-plid') + '-' + el.attr('data-path');
                    getDB({
                        cmd: 'spaddplay',
                        path: path,
                        querytype: 'spotify-track'
                    });
                } else {
                    path = (el.hasClass('db-dirble')) ? path.split(' | ')[1] : path;
                    getDB({
                        cmd: 'addplay',
                        path: path
                    });
                }
            }
        });

        // browse level up (back arrow)
        $('#db-level-up').click(function(){
            --GUI.currentDBpos[10];
            var path = GUI.currentpath;
            if (GUI.currentDBpos[10] === 0) {
                path = '';
            } else {
                if (GUI.browsemode === 'file') {
                    var cutpos = path.lastIndexOf('/');
                    path = (cutpos !== -1) ? path.slice(0,cutpos):'';
                } else {
                    if (GUI.browsemode === 'album') {
                        path = GUI.currentDBpath[GUI.currentDBpos[10] - 1];
                        // console.log(path);
                        if (path === '') {
                            path = 'Albums';
                        } else {
                            GUI.browsemode = 'artist';
                        }
                    } else if (GUI.browsemode === 'artist') {
                        path = GUI.currentDBpath[GUI.currentDBpos[10] - 1];
                        // console.log(path);
                        if (path === '') {
                            path = 'Artists';
                        } else {
                            GUI.browsemode = 'genre';
                        }
                    } else if (GUI.browsemode === 'genre') {
                        path = 'Genres';
                    } else if (GUI.browsemode === 'albumfilter') {
                        GUI.browsemode = 'artist';
                        path = GUI.currentDBpath[GUI.currentDBpos[10] - 1];
                    }
                }
            }
            getDB({
                browsemode: GUI.browsemode,
                path: path,
                plugin: GUI.plugin,
                uplevel: 1
            });
            GUI.plugin = '';
        });

        // close search results
        $('#db-search-results').click(function(){
            $(this).addClass('hide');
            $('#db-level-up').removeClass('hide');
            getDB({
                path: GUI.currentpath
            });
        });

        // context dropdown menu
        $('a', '.context-menu').click(function(){
            var dataCmd = $(this).data('cmd');
            var dataType = $(this).data('type');
            var path = GUI.DBentry[0];
            GUI.DBentry[0] = '';
            switch (dataCmd) {
                case 'pl-add':
                    sendCmd('load "' + path + '"');
                    break;
                    
                case 'pl-replace':
                    sendCmd('clear');
                    sendCmd('load "' + path + '"');
                    break;
                    
                case 'pl-rename':
                    $('#modal-pl-rename').modal();
                    $('#pl-rename-oldname').text(path);
                    break;
                    
                case 'pl-rm':
                    $.ajax({
                        url: '/command/?cmd=rm%20%22' + path + '%22',
                        success: function(data){
                            getPlaylists(data);
                        }
                    });
                    break;
                    
                case 'wradd':
                    path = path.split(' | ')[1];
                    getDB({
                        cmd: 'add',
                        path: path
                    });
                    break;
                    
                case 'wraddplay':
                    path = path.split(' | ')[1];
                    getDB({
                        cmd: 'addplay',
                        path: path
                    });
                    break;
                    
                case 'wraddreplaceplay':
                    path = path.split(' | ')[1];
                    getDB({
                        cmd: 'addreplaceplay',
                        path: path
                    });
                    break;
                    
                case 'wredit':
                    $('#modal-webradio-edit').modal();
                    $.post('/db/?cmd=readradio', {
                        filename: path
                    }, function(data){
                        // get parsed content of .pls file and populate the form fields
                        var name = $('#webradio-edit-name');
                        name.val(data.name);
                        name.data('file-name', data.name);
                        $('#webradio-edit-url').val(data.url);
                    }, 'json');
                    break;
                    
                case 'wrdelete':
                    $('#modal-webradio-delete').modal();
                    $('#webradio-delete-name').text(path.replace('Webradio/', ''));
                    break;
                    
                case 'wrsave':
                    var parameters = path.split(' | ');
                    $.post('/db/?cmd=addradio', { 'radio[label]' : parameters[0], 'radio[url]' : parameters[1] });
                    break;
                    
                default:
                    getDB({
                        cmd: dataCmd,
                        path: path,
                        browsemode: GUI.browsemode,
                        querytype: dataType
                    });
                    break;
            }
        });

        // add webradio
        $('#webradio-add-button').click(function(){
            var radioname = $('#webradio-add-name').val();
            var radiourl = $('#webradio-add-url').val();
            if (radioname === '' || radiourl === '') {
                renderMSG([{'title': 'Missing fields', 'text': 'Please fill both fields to continue', 'icon': 'fa fa-warning'}]);
            } else {
                $.post('/db/?cmd=addradio', { 'radio[label]' : radioname, 'radio[url]' : radiourl }, function(data){
                    // console.log('SENT');
                }, 'json');
                $('#modal-webradio-add').modal('hide');
                $('#webradio-add-name').val('');
                $('#webradio-add-url').val('');
            }
        });
        
        // edit webradio
        $('#webradio-edit-button').click(function(){
            var name = $('#webradio-edit-name');
            $.post('/db/?cmd=editradio', {
                'radio[newlabel]': name.val(),
                'radio[label]': name.data('file-name'),
                'radio[url]': $('#webradio-edit-url').val()
            }, function(data){
                // console.log('editedradio', data);
            }, 'json');
        });
        
        // delete webradio
        $('#webradio-delete-button').click(function(){
        // console.log( $('#webradio-delete-name').text() );
            var radioname = $('#webradio-delete-name').text();
            $.post('/db/?cmd=deleteradio', { 'radio[label]' : radioname }, function(data){
                // console.log('SENT');
            }, 'json');
        });
        
        
        // GENERAL
        // ----------------------------------------------------------------------------------------------------
        
        // scroll buttons
        $('#db-firstPage').click(function(){
            $.scrollTo(0 , 500);
        });
        $('#db-prevPage').click(function(){
            var scrolloffset = '-=' + $(window).height() + 'px';
            $.scrollTo(scrolloffset , 500);
        });
        $('#db-nextPage').click(function(){
            var scrolloffset = '+=' + $(window).height() + 'px';
            $.scrollTo(scrolloffset , 500);
        });
        $('#db-lastPage').click(function(){
            $.scrollTo('100%', 500);
        });

        $('#pl-firstPage').click(function(){
            $.scrollTo(0 , 500);
        });
        $('#pl-prevPage').click(function(){
            var scrollTop = $(window).scrollTop();
            var scrolloffset = scrollTop - $(window).height();
            $.scrollTo(scrolloffset , 500);
        });
        $('#pl-nextPage').click(function(){
            var scrollTop = $(window).scrollTop();
            var scrolloffset = scrollTop + $(window).height();
            $.scrollTo(scrolloffset , 500);
        });
        $('#pl-lastPage').click(function(){
            $.scrollTo('100%', 500);
        });
        
        // open tab from external link
        var url = document.location.toString();
        // console.log('url = ', url);
        if ( url.match('#') ) {
            $('#menu-bottom a[href="/#' + url.split('#')[1] + '"]').tab('show');
        }
        // do not scroll with HTML5 history API
        $('#menu-bottom a').on('shown', function(e) {
            if(history.pushState) {
                history.pushState(null, null, e.target.hash);
            } else {
                window.location.hash = e.target.hash; // Polyfill for old browsers
            }
        }).on('click', function() {
            if ($('#overlay-social').hasClass('open')) {
                $('.overlay-close').trigger('click');
            }
        });
        
        // tooltips
        if ($('.ttip').length) {
            $('.ttip').tooltip();
        }
        
        // remove the 300ms click delay on mobile browsers
        FastClick.attach(document.body);
        
        // system poweroff
        $('#syscmd-poweroff').click(function(){
            $.post('/settings/', { 'syscmd' : 'poweroff' });
            toggleLoader();
        });
        // system reboot
        $('#syscmd-reboot').click(function(){
            $.post('/settings/', { 'syscmd' : 'reboot' });
            toggleLoader();
        });
        
        // social share overlay
        overlayTrigger('#overlay-social');
        // play source overlay
        overlayTrigger('#overlay-playsource');
        // play source manual switch
        $('#playsource-mpd').click(function(){
            if ($(this).hasClass('inactive')) {
                $.ajax({url: '/command/?switchplayer=MPD'});
                // close switch buttons layer
                $('#overlay-playsource-close').trigger('click');
            }
        });
        $('#playsource-spotify').click(function(){
            if ($(this).hasClass('inactive')) {
                if (GUI.libraryhome.Spotify === '1') {
                    $.ajax({url: '/command/?switchplayer=Spotify'});
                    // close switch buttons layer
                    $('#overlay-playsource-close').trigger('click');
                } else {
                    new PNotify({
                        title: 'Spotify not enabled',
                        text: 'Enable and configure it under the Settings screen',
                        icon: 'fa fa-exclamation-circle'
                    });
                }
            }
        });
        
    });
    
} else {

// ====================================================================================================
// OTHER SECTIONS
// ====================================================================================================

    jQuery(document).ready(function($){ 'use strict';
        
        // INITIALIZATION
        // ----------------------------------------------------------------------------------------------------
         
        // check WebSocket support
        GUI.mode = checkWebSocket();
        
        // first connection with MPD daemon
        // open UI rendering channel;
        playbackChannel();
        
        // first GUI update
        // updateGUI();
        
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
        
        
        // BUTTONS
        // ----------------------------------------------------------------------------------------------------
        
        // playback buttons
        $('.btn-cmd').click(function(){
            var el = $(this);
            commandButton(el);
        });
        
        // system poweroff
        $('#syscmd-poweroff').click(function(){
            $.post('/settings/', { 'syscmd' : 'poweroff' });
            toggleLoader();
        });
        // system reboot
        $('#syscmd-reboot').click(function(){
            $.post('/settings/', { 'syscmd' : 'reboot' });
            toggleLoader();
        });
        
        
        // COMMON
        // ----------------------------------------------------------------------------------------------------
        
        // Bootstrap-select
        $('.selectpicker').selectpicker();
        

        // SOURCES
        // ----------------------------------------------------------------------------------------------------
        
        if ($('#section-sources').length) {
        
            // enable/disable CIFS auth section
            if ($('#mount-type').val() === 'nfs') {
                $('#mount-cifs').addClass('disabled').children('.disabler').removeClass('hide');
            }
            $('#mount-type').change(function(){
                if ($(this).val() === 'cifs' || $(this).val() === 'osx') {
                    $('#mount-cifs').removeClass('disabled').children('.disabler').addClass('hide');
                }
                else {
                    $('#mount-cifs').addClass('disabled').children('.disabler').removeClass('hide');
                }
            });
            
            // enable/disable CIFS user and password fields
            $('#nas-guest').change(function(){
                if ($(this).prop('checked')) {
                    //console.log('checked');
                    $('#mount-auth').addClass('disabled').children('.disabler').removeClass('hide');
                } else {
                    //console.log('unchecked');
                    $('#mount-auth').removeClass('disabled').children('.disabler').addClass('hide');
                }
            });
            
            // show advanced options
            $('#nas-advanced').change(function(){
                if ($(this).prop('checked')) {
                    $('#mount-advanced-config').removeClass('hide');
                } else {
                    $('#mount-advanced-config').addClass('hide');
                }
            });
            
            $('#show-mount-advanced-config').click(function(e){
                e.preventDefault();
                if ($(this).hasClass('active')) {
                    $('#mount-advanced-config').toggleClass('hide');
                    $(this).removeClass('active');
                    $(this).find('i').removeClass('fa fa-minus-circle').addClass('fa fa-plus-circle');
                    $(this).find('span').html('show advanced options');
                } else {
                    $('#mount-advanced-config').toggleClass('hide');
                    $(this).addClass('active');
                    $(this).find('i').removeClass('fa fa-plus-circle').addClass('fa fa-minus-circle');
                    $(this).find('span').html('hide advanced options');
                }
            });
            
            $('#usb-mount-list a').click(function(){
                var mountName = $(this).data('mount');
                $('#usb-umount-name').html(mountName);
                $('#usb-umount').val(mountName);
            });
        }
        
            
        // SETTINGS
        // ----------------------------------------------------------------------------------------------------
        
        if ($('#section-settings').length) {
            
            // show/hide AirPlay name form
            $('#airplay').change(function(){
                if ($(this).prop('checked')) {
                    $('#airplayName').removeClass('hide');
                    $('#airplayBox').addClass('boxed-group');
                } else {
                    $('#airplayName').addClass('hide');
                    $('#airplayBox').removeClass('boxed-group');
                }
            });
            
            // show/hide Last.fm auth form  
            $('#scrobbling-lastfm').change(function(){
                if ($(this).prop('checked')) {
                    $('#lastfmAuth').removeClass('hide');
                    $('#lastfmBox').addClass('boxed-group');
                } else {
                    $('#lastfmAuth').addClass('hide');
                    $('#lastfmBox').removeClass('boxed-group');
                }
            });
            
            // show/hide proxy settings form  
            $('#proxy').change(function(){
                if ($(this).prop('checked')) {
                    $('#proxyAuth').removeClass('hide');
                    $('#proxyBox').addClass('boxed-group');
                } else {
                    $('#proxyAuth').addClass('hide');
                    $('#proxyBox').removeClass('boxed-group');
                }
            });
            
            // show/hide UPnP/dlna name form
            $('#dlna').change(function(){
                if ($(this).prop('checked')) {
                    $('#dlnaName').removeClass('hide');
                    $('#dlnaBox').addClass('boxed-group');
                } else {
                    $('#dlnaName').addClass('hide');
                    $('#dlnaBox').removeClass('boxed-group');
                }
            });
            
            // show/hide Spotify auth form
            $('#spotify').change(function(){
                if ($(this).prop('checked')) {
                    $('#spotifyAuth').removeClass('hide');
                    $('#spotifyBox').addClass('boxed-group');
                } else {
                    $('#spotifyAuth').addClass('hide');
                    $('#spotifyBox').removeClass('boxed-group');
                }
            });

        }
        
        
        // NETWORK
        // ----------------------------------------------------------------------------------------------------
        
        if ($('#section-network').length) {
            
            // show/hide static network configuration based on select value
            var netManualConf = $('#network-manual-config');
            if ($('#dhcp').val() === '0') {
                netManualConf.removeClass('hide');
            }
            $('#dhcp').change(function(){
                if ($(this).val() === '0') {
                    netManualConf.removeClass('hide');
                }
                else {
                    netManualConf.addClass('hide');
                }
            });
            
            // show/hide WiFi security configuration based on select value
            var WiFiKey = $('#wifi-security-key');
            if ($('#wifi-security').val() !== 'open') {
                WiFiKey.removeClass('hide');
            }
            $('#wifi-security').change(function(){
                if ($(this).val() !== 'open') {
                    WiFiKey.removeClass('hide');
                }
                else {
                    WiFiKey.addClass('hide');
                }
            });
            
            // refresh in range Wi-Fi networks list
            if ($('#wifiNetworks').length) {
                // open wlans channel
                wlansChannel();
                
                // open nics channel
                nicsChannel();
            }
            
            // show/hide WiFi stored profile box
            $('#wifiProfiles').change(function(){
                if ($(this).prop('checked')) {
                    $('#wifiProfilesBox').addClass('hide');
                } else {
                    $('#wifiProfilesBox').removeClass('hide');
                }
            });

        }
        

        // MPD
        // ----------------------------------------------------------------------------------------------------
        
        if ($('#section-mpd').length) {
            
            // output interface select
            $('#audio-output-interface').change(function(){
                renderMSG([{'title': 'Switching audio output', 'text': 'Please wait for the config update...', 'icon': 'fa fa-cog fa-spin', 'delay': 5000 }]);
                var output = $(this).val();
                $.ajax({
                    type: 'POST',
                    url: '/mpd/',
                    data: { ao: output }
                });
            });
            
            // MPD config manual edit
            $('.manual-edit-confirm').find('.btn-primary').click(function(){
                $('#mpdconf_editor').removeClass('hide');
                $('#manual-edit-warning').addClass('hide');
            });
        }
        
        
        // DEBUG
        // ----------------------------------------------------------------------------------------------------
        
        if ($('#section-debug').length) {

            ZeroClipboard.config({swfPath: '/assets/js/vendor/ZeroClipboard.swf'});
            var client = new ZeroClipboard(document.getElementById('copy-to-clipboard'));
            client.on('ready', function(readyEvent){
                // alert('ZeroClipboard SWF is ready!');
                client.on('aftercopy', function(event){
                    // alert('Copied text to clipboard: ' + event.data['text/plain']);
                    new PNotify({
                        title: 'Copied to clipboard',
                        text: 'The debug output was copied successfully in your clipboard.',
                        icon: 'fa fa-check'
                    });
                });
            });

        }
        
    });

}
