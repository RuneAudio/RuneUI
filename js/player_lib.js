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
 *  file: js/player_lib.js
 *  version: 1.2
 *
 */
 
 // Initialize GUI array
 var GUI = {
    json: 0,
    cmd: 'status',
    playlist: null,
    currentsong: null,
    currentalbum: null,
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
 
// FUNZIONI
// ----------------------------------------------------------------------------------------------------

function sendCmd(inputcmd) {
	$.ajax({
		url: 'command/',
		data: { cmd: inputcmd },
		success: function(data){
			GUI.halt = 1;
			//console.log('GUI.halt (sendCmd)= ', GUI.halt);
		},
    });
}

function sendPLCmd(inputcmd) {
	$.ajax({
		type: 'GET',
		url: 'db/?cmd=' + inputcmd,
		async: true,
		cache: false,
		success: function(data){
			GUI.halt = 1;
			//console.log('GUI.halt (sendPLcmd)= ', GUI.halt);
		},
    });
}

function backendRequest(){
    $.ajax({
		type: 'GET',
		url: '_player_engine.php?state=' + GUI.state,
		async: true,
		cache: false,
		success: function(data){
			//console.log('GUI.halt (backendRequest)= ', GUI.halt);
			renderUI(data);
			GUI.currentsong = GUI.json['currentsong'];
			// GUI.halt = 1;
			backendRequest(GUI.state);
		},
		error: function(){
			setTimeout(function(){
				GUI.state = 'disconnected';
				//console.log('GUI.state = ', GUI.state);
				//console.log('GUI.halt (disconnected) = ',GUI.halt);
				$('#loader').show();
				$('#countdown-display').countdown('pause');
				window.clearInterval(GUI.currentKnob);
				backendRequest(GUI.state);
			}, 5000);
		}
    });
}

function renderUI(data) {
	// update global GUI array
	GUI.json = eval('(' + data + ')');
	GUI.state = GUI.json['state'];
	//console.log('current song = ', GUI.json['currentsong']);
	//console.log( 'GUI.state = ', GUI.state );
	updateGUI(GUI.json);
		if (GUI.state != 'disconnected') {
	$('#loader').hide();
	}
	refreshTimer(parseInt(GUI.json['elapsed']), parseInt(GUI.json['time']), GUI.json['state']);
	refreshKnob(GUI.json);
	if (GUI.json['playlist'] != GUI.playlist) {
		getPlaylist(GUI.json);
		GUI.playlist = GUI.json['playlist'];
		//console.log('playlist = ', GUI.playlist);
	}
	GUI.halt = 0;
	//console.log('GUI.halt (renderUI)= ', GUI.halt);
}

function getPlaylist(json){
    $.getJSON('db/?cmd=playlist', function(data) {
        var i = 0;
        var content = '';
        var output = '';
        for (i = 0; i < data.length; i++){
            if (json['state'] != 'stop' && i == parseInt(json['song'])) {
                content = '<li id="pl-' + (i + 1) + '" class="active clearfix">';
            } else {
                content = '<li id="pl-' + (i + 1) + '" class="clearfix">';
            }
			content += '<div class="pl-action"><a class="btn" href="#notarget" title="Remove song from playlist"><i class="icon-remove-sign"></i></a></div>';
            if (typeof data[i].Title != 'undefined') {
                content += '<div class="pl-entry">';
                content += data[i].Title + ' <em class="songtime">' + timeConvert(data[i].Time) + '</em>';
                content += ' <span>';
                content +=  data[i].Artist;
                content += ' - ';
                content +=  data[i].Album;
                content += '</span></div></li>';
                output = output + content;
            } else {
                songpath = parsePath(data[i].file);
                content += '<div class="pl-entry">';
                content += data[i].file.replace(songpath + '/', '') + ' <em class="songtime">' + timeConvert(data[i].Time) + '</em>';
                content += ' <span>';
                content += ' path \: ';
                content += songpath;
                content += '</span></div></li>';
                output = output + content;
            }
        }
        $('ul.playlist').html(output);
        var current = parseInt(json['song']);
        if (current != json && GUI.halt != 1 && $('#panel-dx').hasClass('active')) {
            customScroll('pl', current, 200); // active current song
        }
    });
}

function parsePath(str) {
	var cutpos=str.lastIndexOf("/");
	//-- verify this switch! (Orion)
	if (cutpos !=-1) {
	//console.log('cutpos = ', cutpos);
	var songpath = str.slice(0,cutpos);
	//console.log('songpath = ', songpath);
	}  else {
	songpath = '';
	}
	return songpath;
}

function parseResponse(inputArr,respType,i,inpath) {		
	switch (respType) {
		case 'playlist':		
			// code placeholder
		break;
		
		case 'db':
			//console.log('inpath= :',inpath);
			//console.log('inputArr[i].file= :',inputArr[i].file);
			if (inpath == '' && typeof inputArr[i].file != 'undefined') {
			inpath = parsePath(inputArr[i].file)
			}
			if (typeof inputArr[i].file != 'undefined') {
				//debug
				//console.log('inputArr[i].file: ', inputArr[i].file);
				//console.log('inputArr[i].Title: ', inputArr[i].Title);
				//console.log('inputArr[i].Artist: ', inputArr[i].Artist);
				//console.log('inputArr[i].Album: ', inputArr[i].Album);
				if (typeof inputArr[i].Title != 'undefined') {
					content = '<li id="db-' + (i + 1) + '" class="clearfix" data-path="';
					content += inputArr[i].file;
					content += '"><div class="db-icon db-song db-browse"><i class="icon-music sx db-browse"></i></div><div class="db-action"><a class="btn" href="#notarget" title="Actions" data-toggle="context" data-target="#context-menu"><i class="icon-reorder"></i></a></div><div class="db-entry db-song db-browse">';
					content += inputArr[i].Title + ' <em class="songtime">' + timeConvert(inputArr[i].Time) + '</em>';
					content += ' <span>';
					content +=  inputArr[i].Artist;
					content += ' - ';
					content +=  inputArr[i].Album;
					content += '</span></div></li>';

				} else {
					content = '<li id="db-' + (i + 1) + '" class="clearfix" data-path="';
					content += inputArr[i].file;
					content += '"><div class="db-icon db-song db-browse"><i class="icon-music sx db-browse"></i></div><div class="db-action"><a class="btn" href="#notarget" title="Actions" data-toggle="context" data-target="#context-menu"><i class="icon-reorder"></i></a></div><div class="db-entry db-song db-browse">';
					content += inputArr[i].file.replace(inpath + '/', '') + ' <em class="songtime">' + timeConvert(inputArr[i].Time) + '</em>';
					content += ' <span>';
					content += ' path \: ';
					content += inpath;
					content += '</span></div></li>';
				}
			} else {
			//debug
			//console.log('inputArr[i].directory: ', data[i].directory);
				content = '<li id="db-' + (i + 1) + '" class="clearfix" data-path="';
				content += inputArr[i].directory;
				if (inpath != '') {
					content += '"><div class="db-icon db-folder db-browse"><i class="icon-folder-open sx"></i></div><div class="db-action"><a class="btn" href="#notarget" title="Actions" data-toggle="context" data-target="#context-menu"><i class="icon-reorder"></i></a></div><div class="db-entry db-folder db-browse">';
				} else {
					content += '"><div class="db-icon db-folder db-browse"><i class="icon-hdd icon-root sx"></i></div><div class="db-action"><a class="btn" href="#notarget" title="Actions" data-toggle="context" data-target="#context-menu-root"><i class="icon-reorder"></i></a></div><div class="db-entry db-folder db-browse">';
				}
				content += inputArr[i].directory.replace(inpath + '/', '');
				content += '</div></li>';
			}
		break;
		
	}
	return content;
} // end parseResponse()

function getDB(cmd, path, browsemode, uplevel){
	if (cmd == 'filepath') {
		$.post('db/?cmd=filepath', { 'path': path }, function(data) {
			populateDB(data, path, uplevel);
		}, 'json');
	} else if (cmd == 'add') {
		$.post('db/?cmd=add', { 'path': path }, function(path) {
			//console.log('add= ', path);
		}, 'json');
	} else if (cmd == 'addplay') {
		$.post('db/?cmd=addplay', { 'path': path }, function(path) {
			//console.log('addplay= ',path);
		}, 'json');
	} else if (cmd == 'addreplaceplay') {
		$.post('db/?cmd=addreplaceplay', { 'path': path }, function(path) {
			//console.log('addreplaceplay= ',path);
		}, 'json');
	} else if (cmd == 'update') {
		$.post('db/?cmd=update', { 'path': path }, function(path) {
			//console.log('update= ',path);
		}, 'json');
	} else if (cmd == 'search') {
		var keyword = $('#db-search-keyword').val();
		$.post('db/?querytype=' + browsemode + '&cmd=search', { 'query': keyword }, function(data) {
			populateDB(data, path, uplevel, keyword);
		}, 'json');
	}
}

function populateDB(data, path, uplevel, keyword){
	if (path) GUI.currentpath = path;
	//console.log(' new GUI.currentpath = ', GUI.currentpath);
	var DBlist = $('ul.database');
	DBlist.html('');
	if (keyword) {
		var results = (data.length) ? data.length : '0';
		var s = (data.length == 1) ? '' : 's';
		DBlist.append('<li id="db-0" class="search-results clearfix" title="Close search results and go back to the DB"><div class="db-icon db-folder"><i class="icon-arrow-left sx"></i></div><div class="db-entry db-folder">' + results + ' result' + s + ' for "<em class="keyword">' + keyword + '</em>"</div></li>');
	} else if (path != '') {
		DBlist.append('<li id="db-0" class="clearfix"><div class="db-entry db-browse levelup"><i class="icon-arrow-left sx"></i> <em>back</em></div></li>');
	}
	var content = '';
	var i = 0;
	for (i = 0; i < data.length; i++){
		content = parseResponse(data,'db',i,path);
	 	DBlist.append(content);
	}
	$('#db-currentpath span').html(path);
	if (uplevel) {
		//console.log('PREV LEVEL');
		$('#db-' + GUI.currentDBpos[GUI.currentDBpos[10]]).addClass('active');
		customScroll('db', GUI.currentDBpos[GUI.currentDBpos[10]], 0);
	} else {
		//console.log('NEXT LEVEL');
		customScroll('db', 0, 0);
	}
	// debug
	//console.log('GUI.currentDBpos = ', GUI.currentDBpos);
	//console.log('livello = ', GUI.currentDBpos[10]);
	//console.log('elemento da illuminare = ', GUI.currentDBpos[GUI.currentDBpos[10]]);
}

// update interface
function updateGUI(json){
    // check MPD status
    refreshState(GUI.state);
    // check song update
    //console.log('A = ', json['currentsong']); console.log('B = ', GUI.currentsong);
    if (GUI.currentsong != json['currentsong']) {
        countdownRestart(0);
        if ($('#panel-dx').hasClass('active')) {
            var current = parseInt(json['song']);
            customScroll('pl', current);
        }
    }
    // common actions

	$('#volume').val((json['volume'] == '-1') ? 100 : json['volume']).trigger('change');
	$('#currentartist').html(json['currentartist']);
	$('#currentsong').html(json['currentsong']);
	$('#currentalbum').html(json['currentalbum']);
	if (json['repeat'] == 1) {
		$('#repeat').addClass('btn-primary');
	} else {
		$('#repeat').removeClass('btn-primary');
	}
	if (json['random'] == 1) {
		$('#random').addClass('btn-primary');
	} else {
		$('#random').removeClass('btn-primary');
	}
	if (json['consume'] == 1) {
		$('#consume').addClass('btn-primary');
	} else {
		$('#consume').removeClass('btn-primary');
	}
	if (json['single'] == 1) {
		$('#single').addClass('btn-primary');
	} else {
		$('#single').removeClass('btn-primary');
	}
	
    GUI.halt = 0;
    GUI.currentsong = json['currentsong'];
	var currentalbumstring = json['currentartist'] + ' - ' + json['currentalbum'];
	if (GUI.currentalbum != currentalbumstring) {
		$('#cover-art').css('background-image','url(images/cover-default.png');
		var covercachenum = Math.floor(Math.random()*1001);
		request = $.ajax({
			type: 'GET',
			url: 'inc/coverart.php?v=' + covercachenum,
			success: function(data){
				if ($.parseJSON(data) != 'NOCOVER') {
					//$('#cover-art').css('background-image','url(inc/coverart.php?v=' + covercachenum + ')');
					$('#cover-art').css('background-image','url(' + data + ')');
				}
			}
		});
	}
	GUI.currentalbum = currentalbumstring;
}

// update status on playback view
function refreshState(state) {
    if (state == 'play') {
        $('#play').addClass('btn-primary');
        $('#play i').removeClass('icon-pause').addClass('icon-play');
        $('#stop').removeClass('btn-primary');
    } else if (state == 'pause') {
        $('#playlist-position').html('Not playing');
        $('#play').addClass('btn-primary');
        $('#play i').removeClass('icon-play').addClass('icon-pause');
        $('#stop').removeClass('btn-primary');
    } else if (state == 'stop') {
        $('#play').removeClass('btn-primary');
        $('#play i').removeClass('icon-pause').addClass('icon-play');
        $('#stop').addClass('btn-primary');
        $('#countdown-display').countdown('destroy');
        $('#elapsed').html('00:00');
        $('#total').html('');
        $('#time').val(0).trigger('change');
        $('#format-bitrate').html('&nbsp;');
        $('.playlist li').removeClass('active');
    }
    if (state == 'play' || state == 'pause') {
        $('#elapsed').html(timeConvert(GUI.json['elapsed']));
        $('#total').html(timeConvert(GUI.json['time']));
        //$('#time').val(json['song_percent']).trigger('change');
        $('#playlist-position').html('Playlist position ' + (parseInt(GUI.json['song']) + 1) +'/'+GUI.json['playlistlength']);
        var fileinfo = (GUI.json['audio_channels'] && GUI.json['audio_sample_depth'] && GUI.json['audio_sample_rate']) ? (GUI.json['audio_channels'] + ', ' + GUI.json['audio_sample_depth'] + ' bit, ' + GUI.json['audio_sample_rate'] +' kHz, '+GUI.json['bitrate']+' kbps') : '&nbsp;';
        $('#format-bitrate').html(fileinfo);
        $('.playlist li').removeClass('active');
        var current = parseInt(GUI.json['song']) + 1;
        $('.playlist li:nth-child(' + current + ')').addClass('active');
    }
	
	// show UpdateDB icon
	//console.log('dbupdate = ', GUI.json['updating_db']);
	if (typeof GUI.json['updating_db'] != 'undefined') {
		$('.open-panel-sx').html('<i class="icon-refresh icon-spin"></i> Updating');
	} else {
		$('.open-panel-sx').html('<i class="icon-music sx"></i> Browse');
	}
}

// update countdown
function refreshTimer(startFrom, stopTo, state){
    //console.log('startFrom = ', startFrom);
    //console.log('state = ', state);
    if (state == 'play') {
        $('#countdown-display').countdown('destroy');
        $('#countdown-display').countdown({since: -(startFrom), compact: true, format: 'MS'});
    } else if (state == 'pause') {
        //console.log('startFrom = ', startFrom);
        $('#countdown-display').countdown('destroy');
        $('#countdown-display').countdown({since: -(startFrom), compact: true, format: 'MS'});
        $('#countdown-display').countdown('pause');
    } else if (state == 'stop') {
        $('#countdown-display').countdown('destroy');
        $('#countdown-display').countdown({since: 0, compact: true, format: 'MS'});
        $('#countdown-display').countdown('pause');
    }
}

// update playback progress knob
function refreshKnob(json){
    window.clearInterval(GUI.currentKnob)
    var initTime = parseInt(json['song_percent'])*10;
    var delta = parseInt(json['time']);
    var step = parseInt(1000/delta);
	//console.log('initTime = ' + initTime + ', delta = ' + delta + ', step = ' + step);
    $('#time').val(initTime).trigger('change');
	if (GUI.state == 'play') {
        GUI.currentKnob = setInterval(function() {
            //console.log('initTime = ', initTime);
            if (GUI.visibility == 'visible') {
                initTime = initTime + 1;
            } else {
                initTime = initTime + step;
            }
			$('#time').val(initTime).trigger('change');
            //document.title = Math.round(initTime)/10 + '% - ' + GUI.visibility;
        }, delta);
    }
}

// time conversion
function timeConvert(seconds) {
    minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    mm = (minutes < 10) ? ('0' + minutes) : minutes;
    ss = (seconds < 10) ? ('0' + seconds) : seconds;
    display = mm + ':' + ss;
    return display;
}

// reset countdown
function countdownRestart(startFrom) {
    $('#countdown-display').countdown('destroy');
    $('#countdown-display').countdown({since: -(startFrom), compact: true, format: 'MS'});
}

// set volume with knob
function setvol(val) {
    $('#volume').val(val).trigger('change');
    GUI.volume = val;
    GUI.halt = 1;
    //console.log('GUI.halt (setvol)= ', GUI.halt);
    $('#volumemute').removeClass('btn-primary');
    sendCmd('setvol ' + val);
}

// scrolling
function customScroll(list, destination, speed) {
    if (typeof(speed) === 'undefined') speed = 500;
    var entryheight = parseInt(1 + $('#' + list + '-1').height());
    var centerheight = parseInt($(window).height()/2);
    var scrolltop = $(window).scrollTop();
    if (list == 'db') {
        var scrollcalc = parseInt((destination)*entryheight - centerheight);
        var scrolloffset = scrollcalc;
    } else if (list == 'pl') {
        //var scrolloffset = parseInt((destination + 2)*entryheight - centerheight);
        var scrollcalc = parseInt((destination + 2)*entryheight - centerheight);
        if (scrollcalc > scrolltop) {
            var scrolloffset = '+=' + Math.abs(scrollcalc - scrolltop) + 'px';
        } else {
            var scrolloffset = '-=' + Math.abs(scrollcalc - scrolltop) + 'px';
        }
    }
    // debug
    //console.log('-------------------------------------------');
    //console.log('customScroll parameters = ' + list + ', ' + destination + ', ' + speed);
    //console.log('scrolltop = ', scrolltop);
    //console.log('scrollcalc = ', scrollcalc);
    //console.log('scrolloffset = ', scrolloffset);
    if (scrollcalc > 0) {
        $.scrollTo( scrolloffset , speed );
    } else {
        $.scrollTo( 0 , speed );
    }
    //$('#' + list + '-' + (destination + 1)).addClass('active');
}

function randomScrollPL() {
    var n = $(".playlist li").size();
    var random = 1 + Math.floor(Math.random() * n);
    customScroll('pl', random);
}
function randomScrollDB() {
    var n = $(".database li").size();
    var random = 1 + Math.floor(Math.random() * n);
    customScroll('db', random);
}