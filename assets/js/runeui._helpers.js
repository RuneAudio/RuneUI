// COMMON FUNCTIONS
// ----------------------------------------------------------------------------------------------------

window.helpers = window.helpers || {};

// toggle blocking loading layer (spinning arrows)
helpers.toggleLoader = function (action) {
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