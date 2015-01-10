// COMMON FUNCTIONS
// ----------------------------------------------------------------------------------------------------

window.helpers = window.helpers || {};

// toggle loading layers (spinning arrows and circle)
helpers.toggleLoader = function(action, type) {
    console.log(type);
    var div, style;
    if (type === 'blocking') {
        div = '#loader';
        style = 'hide';
    } else {
        div = '#loader-spinner';
        style = 'hide';
    }
    if (action === 'close') {
        $(div).addClass('hide');
    } else {
        if ($('#section-dev').length) {
            $(div).addClass('hide');
            new PNotify({
                title: 'Warning',
                text: 'The loading layer (spinning arrows) points to a socket error',
                icon: 'fa fa-exclamation-circle'
            });
        } else {
            $(div).removeClass('hide');
        }
    }
};

// converts an HTML element into a Bootstrap Select
helpers.selectpicker = function (element, isInitialized) {
    if (!isInitialized) {
        // the first time the view is here, set up the picker
        $(element).selectpicker();
    } else {
        // we've already created the picker, need to "refresh" to show changes to value
        $(element).selectpicker('refresh');
    }
};

// decode html text into html entity
helpers.decodeHtmlEntity = function (str) {
    if (str) {
        return str.replace(/&#(\d+);/g, function (match, dec) {
            return String.fromCharCode(dec);
        });
    } else {
        return str;
    }
};

// encode html text into html entity
helpers.encodeHtmlEntity = function (str) {
    var buf = [];
    for (var i = str.length - 1; i >= 0; i--) {
        buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
    }
    return buf.join('');
};

// check WebSocket support
helpers.checkWebSocket = function () {
    if (window.WebSocket) {
        // console.log('WebSockets supported');
        return 'websocket';
    } else {
        // console.log('WebSockets not supported');
        return 'longpolling';
    }
};

// check HTML5 Workers support
helpers.checkWorkers = function () {
    if ((window.Worker && window.Blob) || (Modernizr.webworkers && Modernizr.blobconstructor)) {
        // console.log('WebWorkers supported');
        return true;
    } else {
        // console.log('WebWorkers not supported');
        return false;
    }
};

// send playback control commands to the backend
function sendCmd(cmd) {
    var request = m.request({
        method: 'GET',
        url: '/command/?cmd=' + cmd,
        deserialize: function(value) {return value;}
    });
}
