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


// INIT
// ----------------------------------------------------------------------------------------------------

jQuery(document).ready(function ($) {
    'use strict';
});