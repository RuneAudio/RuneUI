/*
 * Copyright (C) 2013-2014 RuneAudio Team
 * http://www.runeaudio.com
 *
 * RuneUI
 * copyright (C) 2013-2014 - Andrea Coiutti (aka ACX) & Simone De Gregori (aka Orion)
 *
 * RuneOS
 * copyright (C) 2013-2014 - Carmelo San Giovanni (aka Um3ggh1U) & Simone De Gregori (aka Orion)
 *
 * RuneAudio website and logo
 * copyright (C) 2013-2014 - ACX webdesign (Andrea Coiutti)
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
 * along with RuneAudio; see the file COPYING.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.txt>.
 *
 *  file:         js/scripts-playback.js
 *  version:   1.2
 *
 */
 
// Global GUI Array
// ----------------------------------------------------------------------------------------------------
var GUI = {
    json: 0,
    cmd: 'status',
    playlist: null,
    currentsong: null,
    currentknob: null,
    state: '',
    currentpath: '',
    halt: 0,
    volume: null,
    currentDBpos: new Array(0,0,0,0,0,0,0,0,0,0,0),
    browsemode: 'file',
    DBentry: new Array('', '', ''),
    visibility: 'visible',
	DBupdate: 0
};

jQuery(document).ready(function($){ 'use strict';

    // INITIALIZATION
    // ----------------------------------------------------------------------------------------------------
   
	// first connection with MPD daemon
    backendRequest(GUI.state);

    // first GUI update
    updateGUI(GUI.json);
    getDB('filepath', GUI.currentpath, GUI.browsemode);
    $.pnotify.defaults.history = false;

	// hide "connecting" layer
    if (GUI.state != 'disconnected') {
    $('#loader').hide();
    }

	
    // BUTTONS
    // ----------------------------------------------------------------------------------------------------
    
	// playback
    $('.btn-cmd').click(function(){
        var cmd;
        // stop
        if ($(this).attr('id') == 'stop') {
            $(this).addClass('btn-primary');
            $('#play').removeClass('btn-primary');
            refreshTimer(0, 0, 'stop')
			window.clearInterval(GUI.currentKnob);
            $('.playlist li').removeClass('active');
            $('#total').html('');
        }
        // play/pause
        else if ($(this).attr('id') == 'play') {
            //if (json['currentsong'] != null) {
                if (GUI.state == 'play') {
                    cmd = 'pause';
                    $('#countdown-display').countdown('pause');
                } else if (GUI.state == 'pause') {
                    cmd = 'play';
                    $('#countdown-display').countdown('resume');
                } else if (GUI.state == 'stop') {
                    cmd = 'play';
                    $('#countdown-display').countdown({since: 0, compact: true, format: 'MS'});
                }
                //$(this).find('i').toggleClass('icon-play').toggleClass('icon-pause');
                window.clearInterval(GUI.currentKnob);
                sendCmd(cmd);
                //console.log('sendCmd(' + cmd + ');');
                return;
            // } else {
                // $(this).addClass('btn-primary');
                // $('#stop').removeClass('btn-primary');
                // $('#time').val(0).trigger('change');
                // $('#countdown-display').countdown({since: 0, compact: true, format: 'MS'});
            // }
        }
        // previous/next
        else if ($(this).attr('id') == 'previous' || $(this).attr('id') == 'next') {
            GUI.halt = 1;
            //console.log('GUI.halt (next/prev)= ', GUI.halt);
			$('#countdown-display').countdown('pause');
			window.clearInterval(GUI.currentKnob);
        }
        // step volume control
//        else if ($(this).hasClass('btn-volume')) {
//        if (!$(this).prop('disabled')) {
//            if ($(this).attr('id') == 'volumedn') {
//                var vol = parseInt(GUI.volume) - 1;
//                GUI.volume = vol;
//                $('#volumemute').removeClass('btn-primary');
//            } else if ($(this).attr('id') == 'volumeup') {
//                var vol = parseInt(GUI.volume) + 1;
//                GUI.volume = vol;
//                $('#volumemute').removeClass('btn-primary');
//            } else if ($(this).attr('id') == 'volumemute') {
//                if ($('#volume').val() != 0 ) {
//                    GUI.volume = $('#volume').val();
//                    $(this).addClass('btn-primary');
//                    var vol = 0;
//                } else {
//                    $(this).removeClass('btn-primary');
//                    var vol = GUI.volume;
//                }
//            }
            //console.log('volume = ', GUI.volume);
//            sendCmd('setvol ' + vol);
//            return;
//        }
//        }

        // step volume control
        else if ($(this).hasClass('btn-volume')) {
			if ($(this).prop('disabled', false)) {
				if ($(this).attr('id') == 'volumedn') {
					var vol = parseInt(GUI.volume) - 1;
					GUI.volume = vol;
					$('#volumemute').removeClass('btn-primary');
				} else if ($(this).attr('id') == 'volumeup') {
					var vol = parseInt(GUI.volume) + 1;
					GUI.volume = vol;
					$('#volumemute').removeClass('btn-primary');
				} else if ($(this).attr('id') == 'volumemute') {
					if ($('#volume').val() != 0 ) {
						GUI.volume = $('#volume').val();
						$(this).addClass('btn-primary');
						var vol = 0;
					} else {
						$(this).removeClass('btn-primary');
						var vol = GUI.volume;
					}
				}
				//console.log('volume = ', GUI.volume);
				sendCmd('setvol ' + vol);
				return;
			}
        }


        // toggle buttons
        if ($(this).hasClass('btn-toggle')) {
            if ($(this).hasClass('btn-primary')) {
                cmd = $(this).attr('id') + ' 0';
            } else {
                cmd = $(this).attr('id') + ' 1';
            }
            $(this).toggleClass('btn-primary');
        // send command
        } else {
            cmd = $(this).attr('id');
        }
        sendCmd(cmd);
        //console.log('sendCmd(' + cmd + ');');
    });

	
    // KNOBS
    // ----------------------------------------------------------------------------------------------------
    
	// playback progressing
    $('.playbackknob').knob({
        inline: false,
		change : function (value) {
            if (GUI.state != 'stop') {
				//console.log('GUI.halt (Knobs)= ', GUI.halt);
				window.clearInterval(GUI.currentKnob)
				//$('#time').val(value);
				// console.log('click percent = ', value);
				// add command
			} else $('#time').val(0);
        },
        release : function (value) {
			if (GUI.state != 'stop') {
				//console.log('release percent = ', value);
				GUI.halt = 1;
				//console.log('GUI.halt (Knobs2)= ', GUI.halt);
				window.clearInterval(GUI.currentKnob);
				var seekto = Math.floor((value * parseInt(GUI.json['time'])) / 1000);
				sendCmd('seek ' + GUI.json['song'] + ' ' + seekto);
				//console.log('seekto = ', seekto);
				$('#time').val(value);
				$('#countdown-display').countdown('destroy');
				$('#countdown-display').countdown({since: -seekto, compact: true, format: 'MS'});
			}
        },
        cancel : function () {
            //console.log('cancel : ', this);
        },
        draw : function () {}
    });

    // volume knob
    $('.volumeknob').knob({
        change : function (value) {
            //setvol(value);  // disabled until perfomance issues are solved (mouse wheel is not working now)
        },
        release : function (value) {
            setvol(value);
        },
        cancel : function () {
            //console.log('cancel : ', this);
        },
        draw : function () {
            // "tron" case
            if(this.$.data('skin') == 'tron') {

                var a = this.angle(this.cv)  // Angle
                    , sa = this.startAngle          // Previous start angle
                    , sat = this.startAngle         // Start angle
                    , ea                            // Previous end angle
                    , eat = sat + a                 // End angle
                    , r = true;

                this.g.lineWidth = this.lineWidth;

                this.o.cursor
                    && (sat = eat - 0.05)
                    && (eat = eat + 0.05);

                if (this.o.displayPrevious) {
                    ea = this.startAngle + this.angle(this.value);
                    this.o.cursor
                        && (sa = ea - 0.1)
                        && (ea = ea + 0.1);
                    this.g.beginPath();
                    this.g.strokeStyle = this.previousColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                    this.g.stroke();
                }

                this.g.beginPath();
                this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                this.g.stroke();

                this.g.lineWidth = 2;
                this.g.beginPath();
                this.g.strokeStyle = this.o.fgColor;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 10 + this.lineWidth * 2 / 3, 0, 20 * Math.PI, false);
                this.g.stroke();

                return false;
            }
        }
    });


    // PLAYLIST
    // ----------------------------------------------------------------------------------------------------

    // click on playlist entry
    $('.playlist').on('click', '.pl-entry', function() {
        var pos = $('.playlist .pl-entry').index(this);
        var cmd = 'play ' + pos;
        sendCmd(cmd);
        GUI.halt = 1;
        //console.log('GUI.halt (playlist)= ', GUI.halt);
        $('.playlist li').removeClass('active');
        $(this).parent().addClass('active');
    });

    // click on playlist actions
    $('.playlist').on('click', '.pl-action', function(event) {
        event.preventDefault();
        var pos = $('.playlist .pl-action').index(this);
        var cmd = 'trackremove&songid=' + pos;
        var path = $(this).parent().data('path');
        // recover datapath
		notify('remove', '');
        sendPLCmd(cmd);
    });

	// on ready playlist tab
    $('#open-panel-dx a').on('shown.bs.tab', function (e) {
        var current = parseInt(GUI.json['song']);
        customScroll('pl', current, 0);
    });

    // click on playback tab
    $('#open-playback a').click(function(){
        // do something
        //console.log('JSON = ', GUI.json);
    });


    // DATABASE
    // ----------------------------------------------------------------------------------------------------
	
	// on ready database tab
    $('#open-panel-sx a').on('shown.bs.tab', function (e) {
		customScroll('db', GUI.currentDBpos[GUI.currentDBpos[10]], 0);
    });
	
    // click on database entry
    $('.database').on('click', '.db-browse', function() {
        $('.database li').removeClass('active');
        $(this).parent().addClass('active');
        if (!$(this).hasClass('sx')) {
            var path = $(this).parent().data('path');
            if ($(this).hasClass('levelup')) {
                --GUI.currentDBpos[10];
                var path = GUI.currentpath;
                var cutpos=path.lastIndexOf("/");
                if (cutpos !=-1) {
                //console.log('cutpos = ', cutpos);
                var path = path.slice(0,cutpos);
                //console.log('oldpath = ', path);
                }  else {
                path = '';
                }
                getDB('filepath', path, GUI.browsemode, 1);
            }
            else if ($(this).hasClass('db-folder')) {
                //GUI.currentDBpos[GUI.currentDBpos[10]] = $('.database .db-entry').index(this);
                var entryID = $(this).parent().attr('id');
                entryID = entryID.replace('db-','');
                GUI.currentDBpos[GUI.currentDBpos[10]] = entryID;
                ++GUI.currentDBpos[10];
                //console.log('getDB path = ', path);
                getDB('filepath', path, GUI.browsemode, 0);
            }
        }
    });

    $('.database').on('dblclick', '.db-song', function() {
        $('.database li').removeClass('active');
        $(this).parent().addClass('active');
        var path = $(this).parent().data('path');
        //console.log('doubleclicked path = ', path);
        getDB('addplay', path);
        notify('add', path);
    });

    // click on ADD button
    $('.database').on('click', '.db-action', function() {
        var path = $(this).parent().attr('data-path');
        GUI.DBentry[0] = path;
        //console.log('getDB path = ', GUI.DBentry);
    });

    // close search results in DB
    $('.database').on('click', '.search-results', function() {
        getDB('filepath', GUI.currentpath);
    });

    $('.context-menu a').click(function(){
        var path = GUI.DBentry[0];
        GUI.DBentry[0] = '';
        if ($(this).data('cmd') == 'add') {
            getDB('add', path);
            notify('add', path);
        }
        if ($(this).data('cmd') == 'addplay') {
            getDB('addplay', path);
            notify('add', path);
        }
        if ($(this).data('cmd') == 'addreplaceplay') {
            getDB('addreplaceplay', path);
            notify('addreplaceplay', path);
        }
        if ($(this).data('cmd') == 'update') {
            getDB('update', path);
            notify('update', path);
        }
    });

    // browse mode menu
    $('.browse-mode a').click(function(){
        $('.browse-mode').removeClass('active');
        $(this).parent().addClass('active').closest('.dropdown').removeClass('open');
        var browsemode = $(this).find('span').html();
        GUI.browsemode = browsemode.slice(0,-1);
        $('#browse-mode-current').html(GUI.browsemode);
        getDB('filepath', '', GUI.browsemode);
        //console.log('Browse mode set to: ', GUI.browsemode);
    });

    // scroll buttons
    $('.db-firstPage').click(function(){
        $.scrollTo(0 , 500);
    });
    $('.db-prevPage').click(function(){
        var scrolloffset = '-=' + $(window).height() + 'px';
        $.scrollTo(scrolloffset , 500);
    });
    $('.db-nextPage').click(function(){
        var scrolloffset = '+=' + $(window).height() + 'px';
        $.scrollTo(scrolloffset , 500);
    });
    $('.db-lastPage').click(function(){
        $.scrollTo('100%', 500);
    });

    $('.pl-firstPage').click(function(){
        $.scrollTo(0 , 500);
    });
    $('.pl-prevPage').click(function(){
        var scrollTop = $(window).scrollTop();
        var scrolloffset = scrollTop - $(window).height();
        $.scrollTo(scrolloffset , 500);
    });
    $('.pl-nextPage').click(function(){
        var scrollTop = $(window).scrollTop();
        var scrolloffset = scrollTop + $(window).height();
        $.scrollTo(scrolloffset , 500);
    });
    $('.pl-lastPage').click(function(){
        $.scrollTo('100%', 500);
    });

    // multipurpose debug buttons
    $('#db-debug-btn').click(function(){
        var scrollTop = $(window).scrollTop();
        //console.log('scrollTop = ', scrollTop);
    });
    $('#pl-debug-btn').click(function(){
        randomScrollPL();
    });

    // open tab from external link
    var url = document.location.toString();
    if (url.match('#')) {
        $('#menu-bottom a[href=#'+url.split('#')[1]+']').tab('show') ;
    }
    // do not scroll with HTML5 history API
    $('#menu-bottom a').on('shown', function (e) {
        if(history.pushState) {
            history.pushState(null, null, e.target.hash);
        } else {
            window.location.hash = e.target.hash; //Polyfill for old browsers
        }
    });

    // playlist search
    $("#pl-filter").keyup(function(){
        $.scrollTo(0 , 500);
        var filter = $(this).val(), count = 0;
        $(".playlist li").each(function(){
            if ($(this).text().search(new RegExp(filter, "i")) < 0) {
                $(this).hide();
            } else {
                $(this).show();
                count++;
            }
        });
        var numberItems = count;
        var s = (count == 1) ? '' : 's';
        if (filter != '') {
            $('#pl-filter-results').html('<i class="icon-search sx"></i> ' + (+count) + ' result' + s + ' for "<em class="keyword">' + filter + '</em>"');
        } else {
            $('#pl-filter-results').html('');
        }
    });

    // tooltips
    if( $('.ttip').length ){
        $('.ttip').tooltip();
    }

});


// check active tab
(function() {
    hidden = 'hidden';
    // Standards:
    if (hidden in document)
        document.addEventListener('visibilitychange', onchange);
    else if ((hidden = 'mozHidden') in document)
        document.addEventListener('mozvisibilitychange', onchange);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener('webkitvisibilitychange', onchange);
    else if ((hidden = "msHidden") in document)
        document.addEventListener('msvisibilitychange', onchange);
    // IE 9 and lower:
    else if ('onfocusin' in document)
        document.onfocusin = document.onfocusout = onchange;
    // All others:
    else
        window.onpageshow = window.onpagehide
            = window.onfocus = window.onblur = onchange;

    function onchange (evt) {
        var v = 'visible', h = 'hidden',
            evtMap = {
                focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
            };

        evt = evt || window.event;
        if (evt.type in evtMap) {
            document.body.className = evtMap[evt.type];
            //console.log('boh? = ', evtMap[evt.type]);
        } else {
            document.body.className = this[hidden] ? 'hidden' : 'visible';
            if (this[hidden]) {
                GUI.visibility = 'hidden';
                //console.log('focus = hidden');
            } else {
                GUI.visibility = 'visible';
                //console.log('focus = visible');
            }
        }
    }
})();
