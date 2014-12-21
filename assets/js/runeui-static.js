// COMMON FUNCTIONS
// ----------------------------------------------------------------------------------------------------

// Bootstrap Select
function selectpicker(element, isInitialized) {
    if (!isInitialized) {
        // the first time the view is here, set up the picker
        $(element).selectpicker();
    } else {
        // we've already created the picker, need to "refresh" to show changes to value
        $(element).selectpicker('refresh');
    }
}

// encode(decode) html text into html entity
function decodeHtmlEntity(str) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
}; 


// MITHRIL
// ----------------------------------------------------------------------------------------------------

// namespaces
var config = {};
var playback = {};

// helpers

// base 2-way binding helper
var bind2 = function (container, field, config, readonly) {
    // container: for example 'mpd.vm.data.conf'
    // field: for example 'port or audio_mixer'
    // config: jQuery function to run after the item is in the DOM
    var attributes = {
        config: config,
        onchange: m.withAttr('value', function (value) { container[field] = value; }),
        value: decodeHtmlEntity(container[field])
    };

    if (readonly) {
        attributes.readonly = true;
    }

    return attributes;

};

var bind2checked = function (container, field, config) {
    // container: for example 'mpd.vm.data.conf'
    // field: for example 'port or audio_mixer'
    // config: jQuery function to run after the item is in the DOM
    return {
        config: config,
        onchange: m.withAttr('checked', function (value) {
            if (value) {
                container[field] = "yes";
            } else {
                container[field] = "no";
            }
        }),
        checked: (function () {
            if (container[field] === "yes") {
                return true;
            } else {
                return false;
            }
        }())
    };
};

// components
var select = function () {
    var select = {};
    select.vm = {
        id: '',
        container: '',
        field: '',
        url: '',
        valueField: '',
        displayField: '',
        config: {}
    };
    select.view = function (ctrl) {
        var selectTag = 'select[data-style="btn-default btn-lg"][id="' + id + '"]';
        return m(selectTag, bind2(container, field, selectpicker),
        [container[list].map(function (item, index) {
            return m('option', { value: item[valueField] }, (item[displayField]));
        })
        ]);
    };
};

var createLabel = function (id, text) {
    return m('label.col-sm-2.control-label', { "for": id, }, text);
};

// modules - navigation

var navigation = {};

navigation.Page = function (data) {
    this.name = m.prop(data.name);
    this.url = m.prop(data.url);
    this.icon = m.prop(data.icon);
    this.selected = m.prop(data.selected || false);
};

navigation.vm = (function (data) {

    var vm = {};
    vm.pages = [];

    vm.add = function (name, url, icon) {
        vm.pages.push(new navigation.Page({ name: name, url: url, icon: icon }));
    };

    vm.navigate = function (url) {
        for (i = 0; i < vm.pages.length - 1; i++) {
            if (vm.pages[i].url() === url) {
                vm.pages[i].selected(true);
            } else {
                vm.pages[i].selected(false);
            }
        }
    };

    vm.init = function () {
        this.add('Playback', '/', 'play');
        this.add('Audio', '/audio', 'volume-up');
        this.add('MPD', '/mpd', 'cogs');
        this.add('Settings', '/settings', 'wrench');
        this.add('Sources', '/sources', 'folder-open');
        this.add('Network', '/network', 'sitemap');
        this.add('Debug', '/debug', 'bug');
        this.add('Credits', '/credits', 'trophy');
        this.add('Turn off', '/power', 'power-off');
    };

    return vm;

}());

navigation.controller = function () {
    navigation.vm.init();
};

//m("li", [m("a[href='#/']", [m("i.fa.fa-play"), " Playback"])])

navigation.view = function (ctrl) {
    return [m("a.dropdown-toggle[data-target='#'][data-toggle='dropdown'][href='#'][id='menu-settings'][role='button']",
            ["MENU ", m("i.fa.fa-th-list.dx")]), "\n", m("ul.dropdown-menu[aria-labelledby='menu-settings'][role='menu']",
                [navigation.vm.pages.map(function (item, index) {
                    return m('li', { classname: item.selected() ? "active" : "" }, [m('a[href="' + item.url() + '"]', { config: m.route }, [m('i.fa.fa-' + item.icon()), ' ' + item.name()])]);
                })])];
};

m.module(document.getElementById('main-menu'), navigation);


// base classes

//      base data loading function
var getData = function (vm) {
    return m.request({ method: 'GET', url: vm.url }).then(function (response) {
        vm.data = response;
        vm.originalData = JSON.parse(JSON.stringify(response)); // we need a clone of this object
    });
};

//      base data saving function
var postData = function (data) {
    console.log(vm.url);
    console.log(data);
    m.request({
        method: 'POST',
        url: vm.url,
        data: data
    });

};

//      base view model
var getViewModel = function (url) {
    var vm = {};

    // properties of all our viewmodels
    var urlPrefix = '/api';
    vm.url = urlPrefix + url;

    // initialize the view model
    vm.init = function () {
        // property 'data' is defined here asnd the loading is set up
        this.data = getData(this);

        console.log("* in vm init");
        navigation.vm.navigate(this.url.replace(urlPrefix, ''));
        //return m.request({ method: 'GET', url: vm.url }).then(function (response) {
        //    vm.data = response;
        //    vm.originalData = JSON.parse(JSON.stringify(response)); // we need a clone of this object
        //});
    };

    // methods of all of view models
    vm.save = function () {
        postData(vm.data);
    };

    // methods of all of view models
    vm.cancel = function () {
        vm.data = JSON.parse(JSON.stringify(vm.originalData)); // we need a clone of this object
    };

    return vm;
};

//      base controller
var getController = function (vm) {
    var controller = function () {
        vm.init();

        console.log("* in controller");

        this.onunload = function () {

        };
    };
    return controller;
};





var createYesNo = function (id, container, field, config) {
    return m('label.switch-light.well', [
    m('input[id="' + id + '"][type="checkbox"]', bind2checked(container, field)),
    m('span', [m('span', 'OFF'), m('span', 'ON')]),
    m('a.btn.btn-primary')
    ]);
};

// createSelectYesNo('the-field', mpd.vm.data, 'the-field', selectpicker)
var createSelectYesNo = function (id, container, field, config) {
    return m('select[data-style="btn-default btn-lg"][id="' + id + '"]',
        bind2(container, field, selectpicker),
        [m('option[value="yes"]', 'enabled'),
            m('option[value="no"]', 'disabled')]);
};

// createSelect('the-field', mpd.vm.data, 'list-field-with-oprions', selectpicker)
// createSelect('ao', mpd.vm.data, 'ao', 'acards', 'name', 'extlabel', selectpicker)
var createSelect = function (id, container, field, list, valueField, displayField, config) {
    return m('select[data-style="btn-default btn-lg"][id="' + id + '"]',
        bind2(container, field, selectpicker),
        [container[list].map(function (item, index) {
            return m('option', { value: item[valueField] }, (item[displayField]));
        })
        ]);
};

var RuneModule = function (url) {
    var module = {};
    module.vm = getViewModel(url);
    module.controller = getController(module.vm);
    return module;
};

// modules - config


var audio = new RuneModule('/audio');

var mpd = new RuneModule('/mpd');
mpd.vm.saveAudioOutput = function () {
    postData(mpd.vm.ao);
};

// Do we want the Modules in Namespaces?
//     config.mpd = mpd;
var settings = new RuneModule('/settings');


var credits = new RuneModule('/credits');
var debug = new RuneModule('/debug');
var dev = new RuneModule('/dev');
var error = new RuneModule('/error');

var network = new RuneModule('/network');
var sources = new RuneModule('/sources');

// modules - playback
var control = {};
var playlist = {};
var volume = {};


// views


audio.view = function (ctrl) {
    return m('h1', 'Audio Configuration');
};

//    Settings
settings.view = function (ctrl) {
    return [
         m("h1", "Settings"),
         m("form.form-horizontal[action=''][method='post'][role='form']", [
             m("fieldset", [
                 m("legend", "Environment"),
                 m(".form-group[id='systemstatus']", [
                     m("label.control-label.col-sm-2", "Check system status"),
                     m(".col-sm-10", [
                         m("a.btn.btn-default.btn-lg[data-toggle='modal'][href='#modal-sysinfo']", [m("i.fa.fa-info-circle.sx"), "show status"]),
                         m("span.help-block", "See information regarding the system and its status.")
                     ])
                 ]),
                 m(".form-group[id='environment']", [
                     m("label.control-label.col-sm-2[for='hostname']", "Player hostname"),
                     m(".col-sm-10", [
                         m("input.form-control.input-lg[autocomplete='off'][id='hostname'][name='hostname'][placeholder='runeaudio'][type='text'][value='a-cappella']"),
                         m("span.help-block", "Set the player hostname. This will change the address used to reach the RuneUI.")
                     ])
                 ]),
                 m(".form-group", [
                     m("label.control-label.col-sm-2[for='ntpserver']", "NTP server"),
                     m(".col-sm-10", [
                         m("input.form-control.input-lg[autocomplete='off'][id='ntpserver'][name='ntpserver'][placeholder='pool.ntp.org'][type='text'][value='pool.ntp.org']"),
                         m("span.help-block", ["Set your reference time sync server ", m("i", "(NTP server)"), "."])
                     ])
                 ]),
                 m(".form-group", [
                     m("label.control-label.col-sm-2[for='timezone']", "Timezone"),
                     m(".col-sm-10", [
                         m("select.selectpicker[data-style='btn-default btn-lg'][name='timezone']", { style: { "display": " none" } }, [
                             m("option[value='Africa/Abidjan']", "\n                        Africa/Abidjan - GMT +00:00                      "),
                             m("option[value='Africa/Accra']", "\n                        Africa/Accra - GMT +00:00                      "),
                             m("option[value='Africa/Addis_Ababa']", "\n                        Africa/Addis_Ababa - GMT +03:00                      "),
                             m("option[value='Africa/Algiers']", "\n                        Africa/Algiers - GMT +01:00                      "),
                             m("option[value='Africa/Asmara']", "\n                        Africa/Asmara - GMT +03:00                      "),
                             m("option[value='Africa/Bamako']", "\n                        Africa/Bamako - GMT +00:00                      "),
                             m("option[value='Africa/Bangui']", "\n                        Africa/Bangui - GMT +01:00                      "),
                             m("option[value='Africa/Banjul']", "\n                        Africa/Banjul - GMT +00:00                      "),
                             m("option[value='Africa/Bissau']", "\n                        Africa/Bissau - GMT +00:00                      "),
                             m("option[value='Africa/Blantyre']", "\n                        Africa/Blantyre - GMT +02:00                      "),
                             m("option[value='Africa/Brazzaville']", "\n                        Africa/Brazzaville - GMT +01:00                      "),
                             m("option[value='Africa/Bujumbura']", "\n                        Africa/Bujumbura - GMT +02:00                      "),
                             m("option[value='Africa/Cairo']", "\n                        Africa/Cairo - GMT +02:00                      "),
                             m("option[value='Africa/Casablanca']", "\n                        Africa/Casablanca - GMT +00:00                      "),
                             m("option[value='Africa/Ceuta']", "\n                        Africa/Ceuta - GMT +01:00                      "),
                             m("option[value='Africa/Conakry']", "\n                        Africa/Conakry - GMT +00:00                      "),
                             m("option[value='Africa/Dakar']", "\n                        Africa/Dakar - GMT +00:00                      "),
                             m("option[value='Africa/Dar_es_Salaam']", "\n                        Africa/Dar_es_Salaam - GMT +03:00                      "),
                             m("option[value='Africa/Djibouti']", "\n                        Africa/Djibouti - GMT +03:00                      "),
                             m("option[value='Africa/Douala']", "\n                        Africa/Douala - GMT +01:00                      "),
                             m("option[value='Africa/El_Aaiun']", "\n                        Africa/El_Aaiun - GMT +00:00                      "),
                             m("option[value='Africa/Freetown']", "\n                        Africa/Freetown - GMT +00:00                      "),
                             m("option[value='Africa/Gaborone']", "\n                        Africa/Gaborone - GMT +02:00                      "),
                             m("option[value='Africa/Harare']", "\n                        Africa/Harare - GMT +02:00                      "),
                             m("option[value='Africa/Johannesburg']", "\n                        Africa/Johannesburg - GMT +02:00                      "),
                             m("option[value='Africa/Juba']", "\n                        Africa/Juba - GMT +03:00                      "),
                             m("option[value='Africa/Kampala']", "\n                        Africa/Kampala - GMT +03:00                      "),
                             m("option[value='Africa/Khartoum']", "\n                        Africa/Khartoum - GMT +03:00                      "),
                             m("option[value='Africa/Kigali']", "\n                        Africa/Kigali - GMT +02:00                      "),
                             m("option[value='Africa/Kinshasa']", "\n                        Africa/Kinshasa - GMT +01:00                      "),
                             m("option[value='Africa/Lagos']", "\n                        Africa/Lagos - GMT +01:00                      "),
                             m("option[value='Africa/Libreville']", "\n                        Africa/Libreville - GMT +01:00                      "),
                             m("option[value='Africa/Lome']", "\n                        Africa/Lome - GMT +00:00                      "),
                             m("option[value='Africa/Luanda']", "\n                        Africa/Luanda - GMT +01:00                      "),
                             m("option[value='Africa/Lubumbashi']", "\n                        Africa/Lubumbashi - GMT +02:00                      "),
                             m("option[value='Africa/Lusaka']", "\n                        Africa/Lusaka - GMT +02:00                      "),
                             m("option[value='Africa/Malabo']", "\n                        Africa/Malabo - GMT +01:00                      "),
                             m("option[value='Africa/Maputo']", "\n                        Africa/Maputo - GMT +02:00                      "),
                             m("option[value='Africa/Maseru']", "\n                        Africa/Maseru - GMT +02:00                      "),
                             m("option[value='Africa/Mbabane']", "\n                        Africa/Mbabane - GMT +02:00                      "),
                             m("option[value='Africa/Mogadishu']", "\n                        Africa/Mogadishu - GMT +03:00                      "),
                             m("option[value='Africa/Monrovia']", "\n                        Africa/Monrovia - GMT +00:00                      "),
                             m("option[value='Africa/Nairobi']", "\n                        Africa/Nairobi - GMT +03:00                      "),
                             m("option[value='Africa/Ndjamena']", "\n                        Africa/Ndjamena - GMT +01:00                      "),
                             m("option[value='Africa/Niamey']", "\n                        Africa/Niamey - GMT +01:00                      "),
                             m("option[value='Africa/Nouakchott']", "\n                        Africa/Nouakchott - GMT +00:00                      "),
                             m("option[value='Africa/Ouagadougou']", "\n                        Africa/Ouagadougou - GMT +00:00                      "),
                             m("option[value='Africa/Porto-Novo']", "\n                        Africa/Porto-Novo - GMT +01:00                      "),
                             m("option[value='Africa/Sao_Tome']", "\n                        Africa/Sao_Tome - GMT +00:00                      "),
                             m("option[value='Africa/Tripoli']", "\n                        Africa/Tripoli - GMT +02:00                      "),
                             m("option[value='Africa/Tunis']", "\n                        Africa/Tunis - GMT +01:00                      "),
                             m("option[value='Africa/Windhoek']", "\n                        Africa/Windhoek - GMT +02:00                      "),
                             m("option[value='America/Adak']", "\n                        America/Adak - GMT -10:00                      "),
                             m("option[value='America/Anchorage']", "\n                        America/Anchorage - GMT -09:00                      "),
                             m("option[value='America/Anguilla']", "\n                        America/Anguilla - GMT -04:00                      "),
                             m("option[value='America/Antigua']", "\n                        America/Antigua - GMT -04:00                      "),
                             m("option[value='America/Araguaina']", "\n                        America/Araguaina - GMT -03:00                      "),
                             m("option[value='America/Argentina/Buenos_Aires']", "\n                        America/Argentina/Buenos_Aires - GMT -03:00                      "),
                             m("option[value='America/Argentina/Catamarca']", "\n                        America/Argentina/Catamarca - GMT -03:00                      "),
                             m("option[value='America/Argentina/Cordoba']", "\n                        America/Argentina/Cordoba - GMT -03:00                      "),
                             m("option[value='America/Argentina/Jujuy']", "\n                        America/Argentina/Jujuy - GMT -03:00                      "),
                             m("option[value='America/Argentina/La_Rioja']", "\n                        America/Argentina/La_Rioja - GMT -03:00                      "),
                             m("option[value='America/Argentina/Mendoza']", "\n                        America/Argentina/Mendoza - GMT -03:00                      "),
                             m("option[value='America/Argentina/Rio_Gallegos']", "\n                        America/Argentina/Rio_Gallegos - GMT -03:00                      "),
                             m("option[value='America/Argentina/Salta']", "\n                        America/Argentina/Salta - GMT -03:00                      "),
                             m("option[value='America/Argentina/San_Juan']", "\n                        America/Argentina/San_Juan - GMT -03:00                      "),
                             m("option[value='America/Argentina/San_Luis']", "\n                        America/Argentina/San_Luis - GMT -03:00                      "),
                             m("option[value='America/Argentina/Tucuman']", "\n                        America/Argentina/Tucuman - GMT -03:00                      "),
                             m("option[value='America/Argentina/Ushuaia']", "\n                        America/Argentina/Ushuaia - GMT -03:00                      "),
                             m("option[value='America/Aruba']", "\n                        America/Aruba - GMT -04:00                      "),
                             m("option[value='America/Asuncion']", "\n                        America/Asuncion - GMT -03:00                      "),
                             m("option[value='America/Atikokan']", "\n                        America/Atikokan - GMT -05:00                      "),
                             m("option[value='America/Bahia']", "\n                        America/Bahia - GMT -03:00                      "),
                             m("option[value='America/Bahia_Banderas']", "\n                        America/Bahia_Banderas - GMT -06:00                      "),
                             m("option[value='America/Barbados']", "\n                        America/Barbados - GMT -04:00                      "),
                             m("option[value='America/Belem']", "\n                        America/Belem - GMT -03:00                      "),
                             m("option[value='America/Belize']", "\n                        America/Belize - GMT -06:00                      "),
                             m("option[value='America/Blanc-Sablon']", "\n                        America/Blanc-Sablon - GMT -04:00                      "),
                             m("option[value='America/Boa_Vista']", "\n                        America/Boa_Vista - GMT -04:00                      "),
                             m("option[value='America/Bogota']", "\n                        America/Bogota - GMT -05:00                      "),
                             m("option[value='America/Boise']", "\n                        America/Boise - GMT -07:00                      "),
                             m("option[value='America/Cambridge_Bay']", "\n                        America/Cambridge_Bay - GMT -07:00                      "),
                             m("option[value='America/Campo_Grande']", "\n                        America/Campo_Grande - GMT -03:00                      "),
                             m("option[value='America/Cancun']", "\n                        America/Cancun - GMT -06:00                      "),
                             m("option[value='America/Caracas']", "\n                        America/Caracas - GMT -04:30                      "),
                             m("option[value='America/Cayenne']", "\n                        America/Cayenne - GMT -03:00                      "),
                             m("option[value='America/Cayman']", "\n                        America/Cayman - GMT -05:00                      "),
                             m("option[value='America/Chicago']", "\n                        America/Chicago - GMT -06:00                      "),
                             m("option[value='America/Chihuahua']", "\n                        America/Chihuahua - GMT -07:00                      "),
                             m("option[value='America/Costa_Rica']", "\n                        America/Costa_Rica - GMT -06:00                      "),
                             m("option[value='America/Creston']", "\n                        America/Creston - GMT -07:00                      "),
                             m("option[value='America/Cuiaba']", "\n                        America/Cuiaba - GMT -03:00                      "),
                             m("option[value='America/Curacao']", "\n                        America/Curacao - GMT -04:00                      "),
                             m("option[value='America/Danmarkshavn']", "\n                        America/Danmarkshavn - GMT +00:00                      "),
                             m("option[value='America/Dawson']", "\n                        America/Dawson - GMT -08:00                      "),
                             m("option[value='America/Dawson_Creek']", "\n                        America/Dawson_Creek - GMT -07:00                      "),
                             m("option[value='America/Denver']", "\n                        America/Denver - GMT -07:00                      "),
                             m("option[value='America/Detroit']", "\n                        America/Detroit - GMT -05:00                      "),
                             m("option[value='America/Dominica']", "\n                        America/Dominica - GMT -04:00                      "),
                             m("option[value='America/Edmonton']", "\n                        America/Edmonton - GMT -07:00                      "),
                             m("option[value='America/Eirunepe']", "\n                        America/Eirunepe - GMT -05:00                      "),
                             m("option[value='America/El_Salvador']", "\n                        America/El_Salvador - GMT -06:00                      "),
                             m("option[value='America/Fortaleza']", "\n                        America/Fortaleza - GMT -03:00                      "),
                             m("option[value='America/Glace_Bay']", "\n                        America/Glace_Bay - GMT -04:00                      "),
                             m("option[value='America/Godthab']", "\n                        America/Godthab - GMT -03:00                      "),
                             m("option[value='America/Goose_Bay']", "\n                        America/Goose_Bay - GMT -04:00                      "),
                             m("option[value='America/Grand_Turk']", "\n                        America/Grand_Turk - GMT -04:00                      "),
                             m("option[value='America/Grenada']", "\n                        America/Grenada - GMT -04:00                      "),
                             m("option[value='America/Guadeloupe']", "\n                        America/Guadeloupe - GMT -04:00                      "),
                             m("option[value='America/Guatemala']", "\n                        America/Guatemala - GMT -06:00                      "),
                             m("option[value='America/Guayaquil']", "\n                        America/Guayaquil - GMT -05:00                      "),
                             m("option[value='America/Guyana']", "\n                        America/Guyana - GMT -04:00                      "),
                             m("option[value='America/Halifax']", "\n                        America/Halifax - GMT -04:00                      "),
                             m("option[value='America/Havana']", "\n                        America/Havana - GMT -05:00                      "),
                             m("option[value='America/Hermosillo']", "\n                        America/Hermosillo - GMT -07:00                      "),
                             m("option[value='America/Indiana/Indianapolis']", "\n                        America/Indiana/Indianapolis - GMT -05:00                      "),
                             m("option[value='America/Indiana/Knox']", "\n                        America/Indiana/Knox - GMT -06:00                      "),
                             m("option[value='America/Indiana/Marengo']", "\n                        America/Indiana/Marengo - GMT -05:00                      "),
                             m("option[value='America/Indiana/Petersburg']", "\n                        America/Indiana/Petersburg - GMT -05:00                      "),
                             m("option[value='America/Indiana/Tell_City']", "\n                        America/Indiana/Tell_City - GMT -06:00                      "),
                             m("option[value='America/Indiana/Vevay']", "\n                        America/Indiana/Vevay - GMT -05:00                      "),
                             m("option[value='America/Indiana/Vincennes']", "\n                        America/Indiana/Vincennes - GMT -05:00                      "),
                             m("option[value='America/Indiana/Winamac']", "\n                        America/Indiana/Winamac - GMT -05:00                      "),
                             m("option[value='America/Inuvik']", "\n                        America/Inuvik - GMT -07:00                      "),
                             m("option[value='America/Iqaluit']", "\n                        America/Iqaluit - GMT -05:00                      "),
                             m("option[value='America/Jamaica']", "\n                        America/Jamaica - GMT -05:00                      "),
                             m("option[value='America/Juneau']", "\n                        America/Juneau - GMT -09:00                      "),
                             m("option[value='America/Kentucky/Louisville']", "\n                        America/Kentucky/Louisville - GMT -05:00                      "),
                             m("option[value='America/Kentucky/Monticello']", "\n                        America/Kentucky/Monticello - GMT -05:00                      "),
                             m("option[value='America/Kralendijk']", "\n                        America/Kralendijk - GMT -04:00                      "),
                             m("option[value='America/La_Paz']", "\n                        America/La_Paz - GMT -04:00                      "),
                             m("option[value='America/Lima']", "\n                        America/Lima - GMT -05:00                      "),
                             m("option[value='America/Los_Angeles']", "\n                        America/Los_Angeles - GMT -08:00                      "),
                             m("option[value='America/Lower_Princes']", "\n                        America/Lower_Princes - GMT -04:00                      "),
                             m("option[value='America/Maceio']", "\n                        America/Maceio - GMT -03:00                      "),
                             m("option[value='America/Managua']", "\n                        America/Managua - GMT -06:00                      "),
                             m("option[value='America/Manaus']", "\n                        America/Manaus - GMT -04:00                      "),
                             m("option[value='America/Marigot']", "\n                        America/Marigot - GMT -04:00                      "),
                             m("option[value='America/Martinique']", "\n                        America/Martinique - GMT -04:00                      "),
                             m("option[value='America/Matamoros']", "\n                        America/Matamoros - GMT -06:00                      "),
                             m("option[value='America/Mazatlan']", "\n                        America/Mazatlan - GMT -07:00                      "),
                             m("option[value='America/Menominee']", "\n                        America/Menominee - GMT -06:00                      "),
                             m("option[value='America/Merida']", "\n                        America/Merida - GMT -06:00                      "),
                             m("option[value='America/Metlakatla']", "\n                        America/Metlakatla - GMT -08:00                      "),
                             m("option[value='America/Mexico_City']", "\n                        America/Mexico_City - GMT -06:00                      "),
                             m("option[value='America/Miquelon']", "\n                        America/Miquelon - GMT -03:00                      "),
                             m("option[value='America/Moncton']", "\n                        America/Moncton - GMT -04:00                      "),
                             m("option[value='America/Monterrey']", "\n                        America/Monterrey - GMT -06:00                      "),
                             m("option[value='America/Montevideo']", "\n                        America/Montevideo - GMT -02:00                      "),
                             m("option[value='America/Montserrat']", "\n                        America/Montserrat - GMT -04:00                      "),
                             m("option[value='America/Nassau']", "\n                        America/Nassau - GMT -05:00                      "),
                             m("option[selected=''][value='America/New_York']", "\n                        America/New_York - GMT -05:00                      "),
                             m("option[value='America/Nipigon']", "\n                        America/Nipigon - GMT -05:00                      "),
                             m("option[value='America/Nome']", "\n                        America/Nome - GMT -09:00                      "),
                             m("option[value='America/Noronha']", "\n                        America/Noronha - GMT -02:00                      "),
                             m("option[value='America/North_Dakota/Beulah']", "\n                        America/North_Dakota/Beulah - GMT -06:00                      "),
                             m("option[value='America/North_Dakota/Center']", "\n                        America/North_Dakota/Center - GMT -06:00                      "),
                             m("option[value='America/North_Dakota/New_Salem']", "\n                        America/North_Dakota/New_Salem - GMT -06:00                      "),
                             m("option[value='America/Ojinaga']", "\n                        America/Ojinaga - GMT -07:00                      "),
                             m("option[value='America/Panama']", "\n                        America/Panama - GMT -05:00                      "),
                             m("option[value='America/Pangnirtung']", "\n                        America/Pangnirtung - GMT -05:00                      "),
                             m("option[value='America/Paramaribo']", "\n                        America/Paramaribo - GMT -03:00                      "),
                             m("option[value='America/Phoenix']", "\n                        America/Phoenix - GMT -07:00                      "),
                             m("option[value='America/Port-au-Prince']", "\n                        America/Port-au-Prince - GMT -05:00                      "),
                             m("option[value='America/Port_of_Spain']", "\n                        America/Port_of_Spain - GMT -04:00                      "),
                             m("option[value='America/Porto_Velho']", "\n                        America/Porto_Velho - GMT -04:00                      "),
                             m("option[value='America/Puerto_Rico']", "\n                        America/Puerto_Rico - GMT -04:00                      "),
                             m("option[value='America/Rainy_River']", "\n                        America/Rainy_River - GMT -06:00                      "),
                             m("option[value='America/Rankin_Inlet']", "\n                        America/Rankin_Inlet - GMT -06:00                      "),
                             m("option[value='America/Recife']", "\n                        America/Recife - GMT -03:00                      "),
                             m("option[value='America/Regina']", "\n                        America/Regina - GMT -06:00                      "),
                             m("option[value='America/Resolute']", "\n                        America/Resolute - GMT -06:00                      "),
                             m("option[value='America/Rio_Branco']", "\n                        America/Rio_Branco - GMT -05:00                      "),
                             m("option[value='America/Santa_Isabel']", "\n                        America/Santa_Isabel - GMT -08:00                      "),
                             m("option[value='America/Santarem']", "\n                        America/Santarem - GMT -03:00                      "),
                             m("option[value='America/Santiago']", "\n                        America/Santiago - GMT -03:00                      "),
                             m("option[value='America/Santo_Domingo']", "\n                        America/Santo_Domingo - GMT -04:00                      "),
                             m("option[value='America/Sao_Paulo']", "\n                        America/Sao_Paulo - GMT -02:00                      "),
                             m("option[value='America/Scoresbysund']", "\n                        America/Scoresbysund - GMT -01:00                      "),
                             m("option[value='America/Sitka']", "\n                        America/Sitka - GMT -09:00                      "),
                             m("option[value='America/St_Barthelemy']", "\n                        America/St_Barthelemy - GMT -04:00                      "),
                             m("option[value='America/St_Johns']", "\n                        America/St_Johns - GMT -03:30                      "),
                             m("option[value='America/St_Kitts']", "\n                        America/St_Kitts - GMT -04:00                      "),
                             m("option[value='America/St_Lucia']", "\n                        America/St_Lucia - GMT -04:00                      "),
                             m("option[value='America/St_Thomas']", "\n                        America/St_Thomas - GMT -04:00                      "),
                             m("option[value='America/St_Vincent']", "\n                        America/St_Vincent - GMT -04:00                      "),
                             m("option[value='America/Swift_Current']", "\n                        America/Swift_Current - GMT -06:00                      "),
                             m("option[value='America/Tegucigalpa']", "\n                        America/Tegucigalpa - GMT -06:00                      "),
                             m("option[value='America/Thule']", "\n                        America/Thule - GMT -04:00                      "),
                             m("option[value='America/Thunder_Bay']", "\n                        America/Thunder_Bay - GMT -05:00                      "),
                             m("option[value='America/Tijuana']", "\n                        America/Tijuana - GMT -08:00                      "),
                             m("option[value='America/Toronto']", "\n                        America/Toronto - GMT -05:00                      "),
                             m("option[value='America/Tortola']", "\n                        America/Tortola - GMT -04:00                      "),
                             m("option[value='America/Vancouver']", "\n                        America/Vancouver - GMT -08:00                      "),
                             m("option[value='America/Whitehorse']", "\n                        America/Whitehorse - GMT -08:00                      "),
                             m("option[value='America/Winnipeg']", "\n                        America/Winnipeg - GMT -06:00                      "),
                             m("option[value='America/Yakutat']", "\n                        America/Yakutat - GMT -09:00                      "),
                             m("option[value='America/Yellowknife']", "\n                        America/Yellowknife - GMT -07:00                      "),
                             m("option[value='Antarctica/Casey']", "\n                        Antarctica/Casey - GMT +08:00                      "),
                             m("option[value='Antarctica/Davis']", "\n                        Antarctica/Davis - GMT +07:00                      "),
                             m("option[value='Antarctica/DumontDUrville']", "\n                        Antarctica/DumontDUrville - GMT +10:00                      "),
                             m("option[value='Antarctica/Macquarie']", "\n                        Antarctica/Macquarie - GMT +11:00                      "),
                             m("option[value='Antarctica/Mawson']", "\n                        Antarctica/Mawson - GMT +05:00                      "),
                             m("option[value='Antarctica/McMurdo']", "\n                        Antarctica/McMurdo - GMT +13:00                      "),
                             m("option[value='Antarctica/Palmer']", "\n                        Antarctica/Palmer - GMT -03:00                      "),
                             m("option[value='Antarctica/Rothera']", "\n                        Antarctica/Rothera - GMT -03:00                      "),
                             m("option[value='Antarctica/Syowa']", "\n                        Antarctica/Syowa - GMT +03:00                      "),
                             m("option[value='Antarctica/Troll']", "\n                        Antarctica/Troll - GMT +00:00                      "),
                             m("option[value='Antarctica/Vostok']", "\n                        Antarctica/Vostok - GMT +06:00                      "),
                             m("option[value='Arctic/Longyearbyen']", "\n                        Arctic/Longyearbyen - GMT +01:00                      "),
                             m("option[value='Asia/Aden']", "\n                        Asia/Aden - GMT +03:00                      "),
                             m("option[value='Asia/Almaty']", "\n                        Asia/Almaty - GMT +06:00                      "),
                             m("option[value='Asia/Amman']", "\n                        Asia/Amman - GMT +02:00                      "),
                             m("option[value='Asia/Anadyr']", "\n                        Asia/Anadyr - GMT +12:00                      "),
                             m("option[value='Asia/Aqtau']", "\n                        Asia/Aqtau - GMT +05:00                      "),
                             m("option[value='Asia/Aqtobe']", "\n                        Asia/Aqtobe - GMT +05:00                      "),
                             m("option[value='Asia/Ashgabat']", "\n                        Asia/Ashgabat - GMT +05:00                      "),
                             m("option[value='Asia/Baghdad']", "\n                        Asia/Baghdad - GMT +03:00                      "),
                             m("option[value='Asia/Bahrain']", "\n                        Asia/Bahrain - GMT +03:00                      "),
                             m("option[value='Asia/Baku']", "\n                        Asia/Baku - GMT +04:00                      "),
                             m("option[value='Asia/Bangkok']", "\n                        Asia/Bangkok - GMT +07:00                      "),
                             m("option[value='Asia/Beirut']", "\n                        Asia/Beirut - GMT +02:00                      "),
                             m("option[value='Asia/Bishkek']", "\n                        Asia/Bishkek - GMT +06:00                      "),
                             m("option[value='Asia/Brunei']", "\n                        Asia/Brunei - GMT +08:00                      "),
                             m("option[value='Asia/Chita']", "\n                        Asia/Chita - GMT +08:00                      "),
                             m("option[value='Asia/Choibalsan']", "\n                        Asia/Choibalsan - GMT +08:00                      "),
                             m("option[value='Asia/Colombo']", "\n                        Asia/Colombo - GMT +05:30                      "),
                             m("option[value='Asia/Damascus']", "\n                        Asia/Damascus - GMT +02:00                      "),
                             m("option[value='Asia/Dhaka']", "\n                        Asia/Dhaka - GMT +06:00                      "),
                             m("option[value='Asia/Dili']", "\n                        Asia/Dili - GMT +09:00                      "),
                             m("option[value='Asia/Dubai']", "\n                        Asia/Dubai - GMT +04:00                      "),
                             m("option[value='Asia/Dushanbe']", "\n                        Asia/Dushanbe - GMT +05:00                      "),
                             m("option[value='Asia/Gaza']", "\n                        Asia/Gaza - GMT +02:00                      "),
                             m("option[value='Asia/Hebron']", "\n                        Asia/Hebron - GMT +02:00                      "),
                             m("option[value='Asia/Ho_Chi_Minh']", "\n                        Asia/Ho_Chi_Minh - GMT +07:00                      "),
                             m("option[value='Asia/Hong_Kong']", "\n                        Asia/Hong_Kong - GMT +08:00                      "),
                             m("option[value='Asia/Hovd']", "\n                        Asia/Hovd - GMT +07:00                      "),
                             m("option[value='Asia/Irkutsk']", "\n                        Asia/Irkutsk - GMT +08:00                      "),
                             m("option[value='Asia/Jakarta']", "\n                        Asia/Jakarta - GMT +07:00                      "),
                             m("option[value='Asia/Jayapura']", "\n                        Asia/Jayapura - GMT +09:00                      "),
                             m("option[value='Asia/Jerusalem']", "\n                        Asia/Jerusalem - GMT +02:00                      "),
                             m("option[value='Asia/Kabul']", "\n                        Asia/Kabul - GMT +04:30                      "),
                             m("option[value='Asia/Kamchatka']", "\n                        Asia/Kamchatka - GMT +12:00                      "),
                             m("option[value='Asia/Karachi']", "\n                        Asia/Karachi - GMT +05:00                      "),
                             m("option[value='Asia/Kathmandu']", "\n                        Asia/Kathmandu - GMT +05:45                      "),
                             m("option[value='Asia/Khandyga']", "\n                        Asia/Khandyga - GMT +09:00                      "),
                             m("option[value='Asia/Kolkata']", "\n                        Asia/Kolkata - GMT +05:30                      "),
                             m("option[value='Asia/Krasnoyarsk']", "\n                        Asia/Krasnoyarsk - GMT +07:00                      "),
                             m("option[value='Asia/Kuala_Lumpur']", "\n                        Asia/Kuala_Lumpur - GMT +08:00                      "),
                             m("option[value='Asia/Kuching']", "\n                        Asia/Kuching - GMT +08:00                      "),
                             m("option[value='Asia/Kuwait']", "\n                        Asia/Kuwait - GMT +03:00                      "),
                             m("option[value='Asia/Macau']", "\n                        Asia/Macau - GMT +08:00                      "),
                             m("option[value='Asia/Magadan']", "\n                        Asia/Magadan - GMT +10:00                      "),
                             m("option[value='Asia/Makassar']", "\n                        Asia/Makassar - GMT +08:00                      "),
                             m("option[value='Asia/Manila']", "\n                        Asia/Manila - GMT +08:00                      "),
                             m("option[value='Asia/Muscat']", "\n                        Asia/Muscat - GMT +04:00                      "),
                             m("option[value='Asia/Nicosia']", "\n                        Asia/Nicosia - GMT +02:00                      "),
                             m("option[value='Asia/Novokuznetsk']", "\n                        Asia/Novokuznetsk - GMT +07:00                      "),
                             m("option[value='Asia/Novosibirsk']", "\n                        Asia/Novosibirsk - GMT +06:00                      "),
                             m("option[value='Asia/Omsk']", "\n                        Asia/Omsk - GMT +06:00                      "),
                             m("option[value='Asia/Oral']", "\n                        Asia/Oral - GMT +05:00                      "),
                             m("option[value='Asia/Phnom_Penh']", "\n                        Asia/Phnom_Penh - GMT +07:00                      "),
                             m("option[value='Asia/Pontianak']", "\n                        Asia/Pontianak - GMT +07:00                      "),
                             m("option[value='Asia/Pyongyang']", "\n                        Asia/Pyongyang - GMT +09:00                      "),
                             m("option[value='Asia/Qatar']", "\n                        Asia/Qatar - GMT +03:00                      "),
                             m("option[value='Asia/Qyzylorda']", "\n                        Asia/Qyzylorda - GMT +06:00                      "),
                             m("option[value='Asia/Rangoon']", "\n                        Asia/Rangoon - GMT +06:30                      "),
                             m("option[value='Asia/Riyadh']", "\n                        Asia/Riyadh - GMT +03:00                      "),
                             m("option[value='Asia/Sakhalin']", "\n                        Asia/Sakhalin - GMT +10:00                      "),
                             m("option[value='Asia/Samarkand']", "\n                        Asia/Samarkand - GMT +05:00                      "),
                             m("option[value='Asia/Seoul']", "\n                        Asia/Seoul - GMT +09:00                      "),
                             m("option[value='Asia/Shanghai']", "\n                        Asia/Shanghai - GMT +08:00                      "),
                             m("option[value='Asia/Singapore']", "\n                        Asia/Singapore - GMT +08:00                      "),
                             m("option[value='Asia/Srednekolymsk']", "\n                        Asia/Srednekolymsk - GMT +11:00                      "),
                             m("option[value='Asia/Taipei']", "\n                        Asia/Taipei - GMT +08:00                      "),
                             m("option[value='Asia/Tashkent']", "\n                        Asia/Tashkent - GMT +05:00                      "),
                             m("option[value='Asia/Tbilisi']", "\n                        Asia/Tbilisi - GMT +04:00                      "),
                             m("option[value='Asia/Tehran']", "\n                        Asia/Tehran - GMT +03:30                      "),
                             m("option[value='Asia/Thimphu']", "\n                        Asia/Thimphu - GMT +06:00                      "),
                             m("option[value='Asia/Tokyo']", "\n                        Asia/Tokyo - GMT +09:00                      "),
                             m("option[value='Asia/Ulaanbaatar']", "\n                        Asia/Ulaanbaatar - GMT +08:00                      "),
                             m("option[value='Asia/Urumqi']", "\n                        Asia/Urumqi - GMT +06:00                      "),
                             m("option[value='Asia/Ust-Nera']", "\n                        Asia/Ust-Nera - GMT +10:00                      "),
                             m("option[value='Asia/Vientiane']", "\n                        Asia/Vientiane - GMT +07:00                      "),
                             m("option[value='Asia/Vladivostok']", "\n                        Asia/Vladivostok - GMT +10:00                      "),
                             m("option[value='Asia/Yakutsk']", "\n                        Asia/Yakutsk - GMT +09:00                      "),
                             m("option[value='Asia/Yekaterinburg']", "\n                        Asia/Yekaterinburg - GMT +05:00                      "),
                             m("option[value='Asia/Yerevan']", "\n                        Asia/Yerevan - GMT +04:00                      "),
                             m("option[value='Atlantic/Azores']", "\n                        Atlantic/Azores - GMT -01:00                      "),
                             m("option[value='Atlantic/Bermuda']", "\n                        Atlantic/Bermuda - GMT -04:00                      "),
                             m("option[value='Atlantic/Canary']", "\n                        Atlantic/Canary - GMT +00:00                      "),
                             m("option[value='Atlantic/Cape_Verde']", "\n                        Atlantic/Cape_Verde - GMT -01:00                      "),
                             m("option[value='Atlantic/Faroe']", "\n                        Atlantic/Faroe - GMT +00:00                      "),
                             m("option[value='Atlantic/Madeira']", "\n                        Atlantic/Madeira - GMT +00:00                      "),
                             m("option[value='Atlantic/Reykjavik']", "\n                        Atlantic/Reykjavik - GMT +00:00                      "),
                             m("option[value='Atlantic/South_Georgia']", "\n                        Atlantic/South_Georgia - GMT -02:00                      "),
                             m("option[value='Atlantic/St_Helena']", "\n                        Atlantic/St_Helena - GMT +00:00                      "),
                             m("option[value='Atlantic/Stanley']", "\n                        Atlantic/Stanley - GMT -03:00                      "),
                             m("option[value='Australia/Adelaide']", "\n                        Australia/Adelaide - GMT +10:30                      "),
                             m("option[value='Australia/Brisbane']", "\n                        Australia/Brisbane - GMT +10:00                      "),
                             m("option[value='Australia/Broken_Hill']", "\n                        Australia/Broken_Hill - GMT +10:30                      "),
                             m("option[value='Australia/Currie']", "\n                        Australia/Currie - GMT +11:00                      "),
                             m("option[value='Australia/Darwin']", "\n                        Australia/Darwin - GMT +09:30                      "),
                             m("option[value='Australia/Eucla']", "\n                        Australia/Eucla - GMT +08:45                      "),
                             m("option[value='Australia/Hobart']", "\n                        Australia/Hobart - GMT +11:00                      "),
                             m("option[value='Australia/Lindeman']", "\n                        Australia/Lindeman - GMT +10:00                      "),
                             m("option[value='Australia/Lord_Howe']", "\n                        Australia/Lord_Howe - GMT +11:00                      "),
                             m("option[value='Australia/Melbourne']", "\n                        Australia/Melbourne - GMT +11:00                      "),
                             m("option[value='Australia/Perth']", "\n                        Australia/Perth - GMT +08:00                      "),
                             m("option[value='Australia/Sydney']", "\n                        Australia/Sydney - GMT +11:00                      "),
                             m("option[value='Europe/Amsterdam']", "\n                        Europe/Amsterdam - GMT +01:00                      "),
                             m("option[value='Europe/Andorra']", "\n                        Europe/Andorra - GMT +01:00                      "),
                             m("option[value='Europe/Athens']", "\n                        Europe/Athens - GMT +02:00                      "),
                             m("option[value='Europe/Belgrade']", "\n                        Europe/Belgrade - GMT +01:00                      "),
                             m("option[value='Europe/Berlin']", "\n                        Europe/Berlin - GMT +01:00                      "),
                             m("option[value='Europe/Bratislava']", "\n                        Europe/Bratislava - GMT +01:00                      "),
                             m("option[value='Europe/Brussels']", "\n                        Europe/Brussels - GMT +01:00                      "),
                             m("option[value='Europe/Bucharest']", "\n                        Europe/Bucharest - GMT +02:00                      "),
                             m("option[value='Europe/Budapest']", "\n                        Europe/Budapest - GMT +01:00                      "),
                             m("option[value='Europe/Busingen']", "\n                        Europe/Busingen - GMT +01:00                      "),
                             m("option[value='Europe/Chisinau']", "\n                        Europe/Chisinau - GMT +02:00                      "),
                             m("option[value='Europe/Copenhagen']", "\n                        Europe/Copenhagen - GMT +01:00                      "),
                             m("option[value='Europe/Dublin']", "\n                        Europe/Dublin - GMT +00:00                      "),
                             m("option[value='Europe/Gibraltar']", "\n                        Europe/Gibraltar - GMT +01:00                      "),
                             m("option[value='Europe/Guernsey']", "\n                        Europe/Guernsey - GMT +00:00                      "),
                             m("option[value='Europe/Helsinki']", "\n                        Europe/Helsinki - GMT +02:00                      "),
                             m("option[value='Europe/Isle_of_Man']", "\n                        Europe/Isle_of_Man - GMT +00:00                      "),
                             m("option[value='Europe/Istanbul']", "\n                        Europe/Istanbul - GMT +02:00                      "),
                             m("option[value='Europe/Jersey']", "\n                        Europe/Jersey - GMT +00:00                      "),
                             m("option[value='Europe/Kaliningrad']", "\n                        Europe/Kaliningrad - GMT +02:00                      "),
                             m("option[value='Europe/Kiev']", "\n                        Europe/Kiev - GMT +02:00                      "),
                             m("option[value='Europe/Lisbon']", "\n                        Europe/Lisbon - GMT +00:00                      "),
                             m("option[value='Europe/Ljubljana']", "\n                        Europe/Ljubljana - GMT +01:00                      "),
                             m("option[value='Europe/London']", "\n                        Europe/London - GMT +00:00                      "),
                             m("option[value='Europe/Luxembourg']", "\n                        Europe/Luxembourg - GMT +01:00                      "),
                             m("option[value='Europe/Madrid']", "\n                        Europe/Madrid - GMT +01:00                      "),
                             m("option[value='Europe/Malta']", "\n                        Europe/Malta - GMT +01:00                      "),
                             m("option[value='Europe/Mariehamn']", "\n                        Europe/Mariehamn - GMT +02:00                      "),
                             m("option[value='Europe/Minsk']", "\n                        Europe/Minsk - GMT +03:00                      "),
                             m("option[value='Europe/Monaco']", "\n                        Europe/Monaco - GMT +01:00                      "),
                             m("option[value='Europe/Moscow']", "\n                        Europe/Moscow - GMT +03:00                      "),
                             m("option[value='Europe/Oslo']", "\n                        Europe/Oslo - GMT +01:00                      "),
                             m("option[value='Europe/Paris']", "\n                        Europe/Paris - GMT +01:00                      "),
                             m("option[value='Europe/Podgorica']", "\n                        Europe/Podgorica - GMT +01:00                      "),
                             m("option[value='Europe/Prague']", "\n                        Europe/Prague - GMT +01:00                      "),
                             m("option[value='Europe/Riga']", "\n                        Europe/Riga - GMT +02:00                      "),
                             m("option[value='Europe/Rome']", "\n                        Europe/Rome - GMT +01:00                      "),
                             m("option[value='Europe/Samara']", "\n                        Europe/Samara - GMT +04:00                      "),
                             m("option[value='Europe/San_Marino']", "\n                        Europe/San_Marino - GMT +01:00                      "),
                             m("option[value='Europe/Sarajevo']", "\n                        Europe/Sarajevo - GMT +01:00                      "),
                             m("option[value='Europe/Simferopol']", "\n                        Europe/Simferopol - GMT +03:00                      "),
                             m("option[value='Europe/Skopje']", "\n                        Europe/Skopje - GMT +01:00                      "),
                             m("option[value='Europe/Sofia']", "\n                        Europe/Sofia - GMT +02:00                      "),
                             m("option[value='Europe/Stockholm']", "\n                        Europe/Stockholm - GMT +01:00                      "),
                             m("option[value='Europe/Tallinn']", "\n                        Europe/Tallinn - GMT +02:00                      "),
                             m("option[value='Europe/Tirane']", "\n                        Europe/Tirane - GMT +01:00                      "),
                             m("option[value='Europe/Uzhgorod']", "\n                        Europe/Uzhgorod - GMT +02:00                      "),
                             m("option[value='Europe/Vaduz']", "\n                        Europe/Vaduz - GMT +01:00                      "),
                             m("option[value='Europe/Vatican']", "\n                        Europe/Vatican - GMT +01:00                      "),
                             m("option[value='Europe/Vienna']", "\n                        Europe/Vienna - GMT +01:00                      "),
                             m("option[value='Europe/Vilnius']", "\n                        Europe/Vilnius - GMT +02:00                      "),
                             m("option[value='Europe/Volgograd']", "\n                        Europe/Volgograd - GMT +03:00                      "),
                             m("option[value='Europe/Warsaw']", "\n                        Europe/Warsaw - GMT +01:00                      "),
                             m("option[value='Europe/Zagreb']", "\n                        Europe/Zagreb - GMT +01:00                      "),
                             m("option[value='Europe/Zaporozhye']", "\n                        Europe/Zaporozhye - GMT +02:00                      "),
                             m("option[value='Europe/Zurich']", "\n                        Europe/Zurich - GMT +01:00                      "),
                             m("option[value='Indian/Antananarivo']", "\n                        Indian/Antananarivo - GMT +03:00                      "),
                             m("option[value='Indian/Chagos']", "\n                        Indian/Chagos - GMT +06:00                      "),
                             m("option[value='Indian/Christmas']", "\n                        Indian/Christmas - GMT +07:00                      "),
                             m("option[value='Indian/Cocos']", "\n                        Indian/Cocos - GMT +06:30                      "),
                             m("option[value='Indian/Comoro']", "\n                        Indian/Comoro - GMT +03:00                      "),
                             m("option[value='Indian/Kerguelen']", "\n                        Indian/Kerguelen - GMT +05:00                      "),
                             m("option[value='Indian/Mahe']", "\n                        Indian/Mahe - GMT +04:00                      "),
                             m("option[value='Indian/Maldives']", "\n                        Indian/Maldives - GMT +05:00                      "),
                             m("option[value='Indian/Mauritius']", "\n                        Indian/Mauritius - GMT +04:00                      "),
                             m("option[value='Indian/Mayotte']", "\n                        Indian/Mayotte - GMT +03:00                      "),
                             m("option[value='Indian/Reunion']", "\n                        Indian/Reunion - GMT +04:00                      "),
                             m("option[value='Pacific/Apia']", "\n                        Pacific/Apia - GMT +14:00                      "),
                             m("option[value='Pacific/Auckland']", "\n                        Pacific/Auckland - GMT +13:00                      "),
                             m("option[value='Pacific/Chatham']", "\n                        Pacific/Chatham - GMT +13:45                      "),
                             m("option[value='Pacific/Chuuk']", "\n                        Pacific/Chuuk - GMT +10:00                      "),
                             m("option[value='Pacific/Easter']", "\n                        Pacific/Easter - GMT -05:00                      "),
                             m("option[value='Pacific/Efate']", "\n                        Pacific/Efate - GMT +11:00                      "),
                             m("option[value='Pacific/Enderbury']", "\n                        Pacific/Enderbury - GMT +13:00                      "),
                             m("option[value='Pacific/Fakaofo']", "\n                        Pacific/Fakaofo - GMT +13:00                      "),
                             m("option[value='Pacific/Fiji']", "\n                        Pacific/Fiji - GMT +13:00                      "),
                             m("option[value='Pacific/Funafuti']", "\n                        Pacific/Funafuti - GMT +12:00                      "),
                             m("option[value='Pacific/Galapagos']", "\n                        Pacific/Galapagos - GMT -06:00                      "),
                             m("option[value='Pacific/Gambier']", "\n                        Pacific/Gambier - GMT -09:00                      "),
                             m("option[value='Pacific/Guadalcanal']", "\n                        Pacific/Guadalcanal - GMT +11:00                      "),
                             m("option[value='Pacific/Guam']", "\n                        Pacific/Guam - GMT +10:00                      "),
                             m("option[value='Pacific/Honolulu']", "\n                        Pacific/Honolulu - GMT -10:00                      "),
                             m("option[value='Pacific/Johnston']", "\n                        Pacific/Johnston - GMT -10:00                      "),
                             m("option[value='Pacific/Kiritimati']", "\n                        Pacific/Kiritimati - GMT +14:00                      "),
                             m("option[value='Pacific/Kosrae']", "\n                        Pacific/Kosrae - GMT +11:00                      "),
                             m("option[value='Pacific/Kwajalein']", "\n                        Pacific/Kwajalein - GMT +12:00                      "),
                             m("option[value='Pacific/Majuro']", "\n                        Pacific/Majuro - GMT +12:00                      "),
                             m("option[value='Pacific/Marquesas']", "\n                        Pacific/Marquesas - GMT -09:30                      "),
                             m("option[value='Pacific/Midway']", "\n                        Pacific/Midway - GMT -11:00                      "),
                             m("option[value='Pacific/Nauru']", "\n                        Pacific/Nauru - GMT +12:00                      "),
                             m("option[value='Pacific/Niue']", "\n                        Pacific/Niue - GMT -11:00                      "),
                             m("option[value='Pacific/Norfolk']", "\n                        Pacific/Norfolk - GMT +11:30                      "),
                             m("option[value='Pacific/Noumea']", "\n                        Pacific/Noumea - GMT +11:00                      "),
                             m("option[value='Pacific/Pago_Pago']", "\n                        Pacific/Pago_Pago - GMT -11:00                      "),
                             m("option[value='Pacific/Palau']", "\n                        Pacific/Palau - GMT +09:00                      "),
                             m("option[value='Pacific/Pitcairn']", "\n                        Pacific/Pitcairn - GMT -08:00                      "),
                             m("option[value='Pacific/Pohnpei']", "\n                        Pacific/Pohnpei - GMT +11:00                      "),
                             m("option[value='Pacific/Port_Moresby']", "\n                        Pacific/Port_Moresby - GMT +10:00                      "),
                             m("option[value='Pacific/Rarotonga']", "\n                        Pacific/Rarotonga - GMT -10:00                      "),
                             m("option[value='Pacific/Saipan']", "\n                        Pacific/Saipan - GMT +10:00                      "),
                             m("option[value='Pacific/Tahiti']", "\n                        Pacific/Tahiti - GMT -10:00                      "),
                             m("option[value='Pacific/Tarawa']", "\n                        Pacific/Tarawa - GMT +12:00                      "),
                             m("option[value='Pacific/Tongatapu']", "\n                        Pacific/Tongatapu - GMT +13:00                      "),
                             m("option[value='Pacific/Wake']", "\n                        Pacific/Wake - GMT +12:00                      "),
                             m("option[value='Pacific/Wallis']", "\n                        Pacific/Wallis - GMT +12:00                      "),
                             m("option[value='UTC']", "\n                        UTC - GMT +00:00                      ")
                         ]),
                         m(".btn-group.bootstrap-select", [m("button.btn.dropdown-toggle.selectpicker.btn-default.btn-lg[data-toggle='dropdown'][title='America/New_York - GMT -05:00'][type='button']", [m("span.filter-option.pull-left", "\n                        America/New_York - GMT -05:00                      "), " ", m("span.caret")]), m(".dropdown-menu.open", [m("ul.dropdown-menu.inner.selectpicker[role='menu']", [m("li[rel='0']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Abidjan - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='1']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Accra - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='2']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Addis_Ababa - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='3']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Algiers - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='4']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Asmara - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='5']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Bamako - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='6']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Bangui - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='7']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Banjul - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='8']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Bissau - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='9']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Blantyre - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='10']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Brazzaville - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='11']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Bujumbura - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='12']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Cairo - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='13']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Casablanca - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='14']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Ceuta - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='15']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Conakry - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='16']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Dakar - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='17']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Dar_es_Salaam - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='18']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Djibouti - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='19']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Douala - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='20']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/El_Aaiun - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='21']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Freetown - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='22']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Gaborone - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='23']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Harare - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='24']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Johannesburg - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='25']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Juba - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='26']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Kampala - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='27']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Khartoum - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='28']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Kigali - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='29']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Kinshasa - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='30']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Lagos - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='31']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Libreville - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='32']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Lome - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='33']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Luanda - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='34']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Lubumbashi - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='35']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Lusaka - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='36']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Malabo - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='37']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Maputo - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='38']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Maseru - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='39']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Mbabane - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='40']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Mogadishu - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='41']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Monrovia - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='42']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Nairobi - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='43']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Ndjamena - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='44']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Niamey - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='45']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Nouakchott - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='46']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Ouagadougou - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='47']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Porto-Novo - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='48']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Sao_Tome - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='49']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Tripoli - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='50']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Tunis - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='51']", [m("a[tabindex='0']", [m("span.text", "\n                        Africa/Windhoek - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='52']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Adak - GMT -10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='53']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Anchorage - GMT -09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='54']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Anguilla - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='55']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Antigua - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='56']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Araguaina - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='57']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/Buenos_Aires - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='58']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/Catamarca - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='59']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/Cordoba - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='60']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/Jujuy - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='61']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/La_Rioja - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='62']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/Mendoza - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='63']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/Rio_Gallegos - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='64']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/Salta - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='65']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/San_Juan - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='66']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/San_Luis - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='67']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/Tucuman - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='68']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Argentina/Ushuaia - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='69']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Aruba - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='70']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Asuncion - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='71']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Atikokan - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='72']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Bahia - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='73']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Bahia_Banderas - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='74']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Barbados - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='75']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Belem - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='76']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Belize - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='77']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Blanc-Sablon - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='78']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Boa_Vista - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='79']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Bogota - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='80']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Boise - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='81']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Cambridge_Bay - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='82']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Campo_Grande - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='83']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Cancun - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='84']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Caracas - GMT -04:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='85']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Cayenne - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='86']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Cayman - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='87']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Chicago - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='88']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Chihuahua - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='89']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Costa_Rica - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='90']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Creston - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='91']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Cuiaba - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='92']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Curacao - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='93']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Danmarkshavn - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='94']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Dawson - GMT -08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='95']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Dawson_Creek - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='96']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Denver - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='97']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Detroit - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='98']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Dominica - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='99']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Edmonton - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='100']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Eirunepe - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='101']", [m("a[tabindex='0']", [m("span.text", "\n                        America/El_Salvador - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='102']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Fortaleza - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='103']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Glace_Bay - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='104']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Godthab - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='105']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Goose_Bay - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='106']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Grand_Turk - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='107']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Grenada - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='108']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Guadeloupe - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='109']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Guatemala - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='110']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Guayaquil - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='111']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Guyana - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='112']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Halifax - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='113']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Havana - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='114']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Hermosillo - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='115']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Indiana/Indianapolis - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='116']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Indiana/Knox - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='117']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Indiana/Marengo - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='118']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Indiana/Petersburg - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='119']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Indiana/Tell_City - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='120']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Indiana/Vevay - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='121']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Indiana/Vincennes - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='122']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Indiana/Winamac - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='123']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Inuvik - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='124']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Iqaluit - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='125']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Jamaica - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='126']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Juneau - GMT -09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='127']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Kentucky/Louisville - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='128']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Kentucky/Monticello - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='129']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Kralendijk - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='130']", [m("a[tabindex='0']", [m("span.text", "\n                        America/La_Paz - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='131']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Lima - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='132']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Los_Angeles - GMT -08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='133']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Lower_Princes - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='134']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Maceio - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='135']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Managua - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='136']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Manaus - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='137']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Marigot - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='138']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Martinique - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='139']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Matamoros - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='140']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Mazatlan - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='141']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Menominee - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='142']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Merida - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='143']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Metlakatla - GMT -08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='144']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Mexico_City - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='145']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Miquelon - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='146']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Moncton - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='147']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Monterrey - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='148']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Montevideo - GMT -02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='149']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Montserrat - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='150']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Nassau - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li.selected[rel='151']", [m("a[tabindex='0']", [m("span.text", "\n                        America/New_York - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='152']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Nipigon - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='153']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Nome - GMT -09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='154']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Noronha - GMT -02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='155']", [m("a[tabindex='0']", [m("span.text", "\n                        America/North_Dakota/Beulah - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='156']", [m("a[tabindex='0']", [m("span.text", "\n                        America/North_Dakota/Center - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='157']", [m("a[tabindex='0']", [m("span.text", "\n                        America/North_Dakota/New_Salem - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='158']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Ojinaga - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='159']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Panama - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='160']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Pangnirtung - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='161']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Paramaribo - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='162']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Phoenix - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='163']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Port-au-Prince - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='164']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Port_of_Spain - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='165']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Porto_Velho - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='166']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Puerto_Rico - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='167']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Rainy_River - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='168']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Rankin_Inlet - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='169']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Recife - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='170']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Regina - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='171']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Resolute - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='172']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Rio_Branco - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='173']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Santa_Isabel - GMT -08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='174']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Santarem - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='175']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Santiago - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='176']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Santo_Domingo - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='177']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Sao_Paulo - GMT -02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='178']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Scoresbysund - GMT -01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='179']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Sitka - GMT -09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='180']", [m("a[tabindex='0']", [m("span.text", "\n                        America/St_Barthelemy - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='181']", [m("a[tabindex='0']", [m("span.text", "\n                        America/St_Johns - GMT -03:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='182']", [m("a[tabindex='0']", [m("span.text", "\n                        America/St_Kitts - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='183']", [m("a[tabindex='0']", [m("span.text", "\n                        America/St_Lucia - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='184']", [m("a[tabindex='0']", [m("span.text", "\n                        America/St_Thomas - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='185']", [m("a[tabindex='0']", [m("span.text", "\n                        America/St_Vincent - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='186']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Swift_Current - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='187']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Tegucigalpa - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='188']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Thule - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='189']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Thunder_Bay - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='190']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Tijuana - GMT -08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='191']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Toronto - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='192']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Tortola - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='193']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Vancouver - GMT -08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='194']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Whitehorse - GMT -08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='195']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Winnipeg - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='196']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Yakutat - GMT -09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='197']", [m("a[tabindex='0']", [m("span.text", "\n                        America/Yellowknife - GMT -07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='198']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/Casey - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='199']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/Davis - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='200']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/DumontDUrville - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='201']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/Macquarie - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='202']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/Mawson - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='203']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/McMurdo - GMT +13:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='204']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/Palmer - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='205']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/Rothera - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='206']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/Syowa - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='207']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/Troll - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='208']", [m("a[tabindex='0']", [m("span.text", "\n                        Antarctica/Vostok - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='209']", [m("a[tabindex='0']", [m("span.text", "\n                        Arctic/Longyearbyen - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='210']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Aden - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='211']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Almaty - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='212']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Amman - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='213']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Anadyr - GMT +12:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='214']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Aqtau - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='215']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Aqtobe - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='216']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Ashgabat - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='217']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Baghdad - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='218']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Bahrain - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='219']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Baku - GMT +04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='220']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Bangkok - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='221']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Beirut - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='222']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Bishkek - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='223']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Brunei - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='224']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Chita - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='225']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Choibalsan - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='226']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Colombo - GMT +05:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='227']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Damascus - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='228']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Dhaka - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='229']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Dili - GMT +09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='230']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Dubai - GMT +04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='231']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Dushanbe - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='232']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Gaza - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='233']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Hebron - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='234']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Ho_Chi_Minh - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='235']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Hong_Kong - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='236']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Hovd - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='237']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Irkutsk - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='238']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Jakarta - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='239']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Jayapura - GMT +09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='240']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Jerusalem - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='241']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Kabul - GMT +04:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='242']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Kamchatka - GMT +12:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='243']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Karachi - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='244']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Kathmandu - GMT +05:45                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='245']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Khandyga - GMT +09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='246']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Kolkata - GMT +05:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='247']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Krasnoyarsk - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='248']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Kuala_Lumpur - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='249']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Kuching - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='250']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Kuwait - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='251']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Macau - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='252']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Magadan - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='253']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Makassar - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='254']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Manila - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='255']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Muscat - GMT +04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='256']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Nicosia - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='257']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Novokuznetsk - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='258']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Novosibirsk - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='259']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Omsk - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='260']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Oral - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='261']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Phnom_Penh - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='262']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Pontianak - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='263']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Pyongyang - GMT +09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='264']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Qatar - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='265']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Qyzylorda - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='266']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Rangoon - GMT +06:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='267']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Riyadh - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='268']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Sakhalin - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='269']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Samarkand - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='270']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Seoul - GMT +09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='271']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Shanghai - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='272']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Singapore - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='273']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Srednekolymsk - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='274']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Taipei - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='275']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Tashkent - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='276']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Tbilisi - GMT +04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='277']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Tehran - GMT +03:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='278']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Thimphu - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='279']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Tokyo - GMT +09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='280']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Ulaanbaatar - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='281']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Urumqi - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='282']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Ust-Nera - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='283']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Vientiane - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='284']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Vladivostok - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='285']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Yakutsk - GMT +09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='286']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Yekaterinburg - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='287']", [m("a[tabindex='0']", [m("span.text", "\n                        Asia/Yerevan - GMT +04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='288']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/Azores - GMT -01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='289']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/Bermuda - GMT -04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='290']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/Canary - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='291']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/Cape_Verde - GMT -01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='292']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/Faroe - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='293']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/Madeira - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='294']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/Reykjavik - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='295']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/South_Georgia - GMT -02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='296']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/St_Helena - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='297']", [m("a[tabindex='0']", [m("span.text", "\n                        Atlantic/Stanley - GMT -03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='298']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Adelaide - GMT +10:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='299']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Brisbane - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='300']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Broken_Hill - GMT +10:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='301']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Currie - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='302']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Darwin - GMT +09:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='303']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Eucla - GMT +08:45                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='304']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Hobart - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='305']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Lindeman - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='306']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Lord_Howe - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='307']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Melbourne - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='308']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Perth - GMT +08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='309']", [m("a[tabindex='0']", [m("span.text", "\n                        Australia/Sydney - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='310']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Amsterdam - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='311']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Andorra - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='312']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Athens - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='313']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Belgrade - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='314']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Berlin - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='315']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Bratislava - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='316']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Brussels - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='317']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Bucharest - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='318']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Budapest - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='319']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Busingen - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='320']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Chisinau - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='321']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Copenhagen - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='322']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Dublin - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='323']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Gibraltar - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='324']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Guernsey - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='325']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Helsinki - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='326']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Isle_of_Man - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='327']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Istanbul - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='328']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Jersey - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='329']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Kaliningrad - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='330']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Kiev - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='331']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Lisbon - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='332']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Ljubljana - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='333']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/London - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='334']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Luxembourg - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='335']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Madrid - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='336']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Malta - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='337']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Mariehamn - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='338']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Minsk - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='339']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Monaco - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='340']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Moscow - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='341']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Oslo - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='342']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Paris - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='343']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Podgorica - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='344']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Prague - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='345']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Riga - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='346']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Rome - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='347']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Samara - GMT +04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='348']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/San_Marino - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='349']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Sarajevo - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='350']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Simferopol - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='351']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Skopje - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='352']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Sofia - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='353']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Stockholm - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='354']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Tallinn - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='355']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Tirane - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='356']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Uzhgorod - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='357']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Vaduz - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='358']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Vatican - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='359']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Vienna - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='360']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Vilnius - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='361']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Volgograd - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='362']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Warsaw - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='363']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Zagreb - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='364']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Zaporozhye - GMT +02:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='365']", [m("a[tabindex='0']", [m("span.text", "\n                        Europe/Zurich - GMT +01:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='366']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Antananarivo - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='367']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Chagos - GMT +06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='368']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Christmas - GMT +07:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='369']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Cocos - GMT +06:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='370']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Comoro - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='371']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Kerguelen - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='372']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Mahe - GMT +04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='373']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Maldives - GMT +05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='374']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Mauritius - GMT +04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='375']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Mayotte - GMT +03:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='376']", [m("a[tabindex='0']", [m("span.text", "\n                        Indian/Reunion - GMT +04:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='377']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Apia - GMT +14:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='378']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Auckland - GMT +13:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='379']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Chatham - GMT +13:45                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='380']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Chuuk - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='381']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Easter - GMT -05:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='382']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Efate - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='383']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Enderbury - GMT +13:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='384']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Fakaofo - GMT +13:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='385']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Fiji - GMT +13:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='386']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Funafuti - GMT +12:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='387']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Galapagos - GMT -06:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='388']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Gambier - GMT -09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='389']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Guadalcanal - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='390']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Guam - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='391']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Honolulu - GMT -10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='392']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Johnston - GMT -10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='393']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Kiritimati - GMT +14:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='394']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Kosrae - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='395']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Kwajalein - GMT +12:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='396']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Majuro - GMT +12:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='397']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Marquesas - GMT -09:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='398']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Midway - GMT -11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='399']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Nauru - GMT +12:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='400']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Niue - GMT -11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='401']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Norfolk - GMT +11:30                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='402']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Noumea - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='403']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Pago_Pago - GMT -11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='404']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Palau - GMT +09:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='405']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Pitcairn - GMT -08:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='406']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Pohnpei - GMT +11:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='407']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Port_Moresby - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='408']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Rarotonga - GMT -10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='409']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Saipan - GMT +10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='410']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Tahiti - GMT -10:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='411']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Tarawa - GMT +12:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='412']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Tongatapu - GMT +13:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='413']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Wake - GMT +12:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='414']", [m("a[tabindex='0']", [m("span.text", "\n                        Pacific/Wallis - GMT +12:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='415']", [m("a[tabindex='0']", [m("span.text", "\n                        UTC - GMT +00:00                      "), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])])])])]),
                         m("span.help-block", "Set the system timezone.")
                     ])
                 ]),
                 m(".form-group.form-actions", [
                     m(".col-sm-offset-2.col-sm-10", [
                         m("button.btn.btn-primary.btn-lg[name='save'][type='submit'][value='save']", "Apply settings")
                     ])
                 ])
             ])
         ]),
         m("form.form-horizontal[method='post'][role='form']", [
             m("fieldset", [
                 m("legend", "RuneOS kernel settings"),
                 m(".form-group", [
                     m("label.control-label.col-sm-2[for='i2smodule']", "Linux Kernel"),
                     m(".col-sm-10", [
                         m("select.selectpicker[data-style='btn-default btn-lg'][name='kernel']", { style: { "display": " none" } }, [
                             m("option[selected=''][value='linux-arch-rpi_3.12.26-1-ARCH']", "Linux kernel 3.12.26-1   ARCH [RuneAudio v0.3-beta]"),
                             m("option[value='linux-rune-rpi_3.12.19-2-ARCH']", "Linux kernel 3.12.19-2   RUNE [RuneAudio v0.3-alpha]"),
                             m("option[value='linux-rune-rpi_3.6.11-18-ARCH+']", "Linux kernel 3.6.11-18   ARCH+ [RuneAudio v0.1-beta/v0.2-beta]"),
                             m("option[value='linux-rune-rpi_3.12.13-rt21_wosa']", "Linux kernel 3.12.13-rt   RUNE-RT [Wolfson Audio Card]")
                         ]),
                         m(".btn-group.bootstrap-select", [m("button.btn.dropdown-toggle.selectpicker.btn-default.btn-lg[data-toggle='dropdown'][title='Linux kernel 3.12.26-1&nbsp;&nbsp;&nbsp;ARCH&nbsp;[RuneAudio v0.3-beta]'][type='button']", [m("span.filter-option.pull-left", "Linux kernel 3.12.26-1   ARCH [RuneAudio v0.3-beta]"), " ", m("span.caret")]), m(".dropdown-menu.open", [m("ul.dropdown-menu.inner.selectpicker[role='menu']", [m("li.selected[rel='0']", [m("a[tabindex='0']", [m("span.text", "Linux kernel 3.12.26-1   ARCH [RuneAudio v0.3-beta]"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='1']", [m("a[tabindex='0']", [m("span.text", "Linux kernel 3.12.19-2   RUNE [RuneAudio v0.3-alpha]"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='2']", [m("a[tabindex='0']", [m("span.text", "Linux kernel 3.6.11-18   ARCH+ [RuneAudio v0.1-beta/v0.2-beta]"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='3']", [m("a[tabindex='0']", [m("span.text", "Linux kernel 3.12.13-rt   RUNE-RT [Wolfson Audio Card]"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])])])])]),
                         m("span.help-block", ["Switch Linux Kernel version (REBOOT REQUIRED). ", m("strong", "Linux kernel 3.12.26-1"), " is the default kernel in the current release, ", m("strong", "Linux kernel 3.12.19-2"), " is the kernel used in RuneAudio v0.3-alpha, ", m("strong", "Linux kernel 3.6.11-18"), " is the kernel used in RuneAudio v0.1-beta/v0.2-beta (it has no support for I²S), ", m("strong", "Linux kernel 3.12.13-rt"), " is an EXPERIMENTAL kernel (not suitable for all configurations), it is optimized for ", m("strong", "Wolfson Audio Card"), " support and it is the default option for that type of soundcard."])
                     ]),
                     m("label.control-label.col-sm-2[for='i2smodule']", "I²S kernel modules"),
                     m(".col-sm-10", [
                         m("select.selectpicker[data-style='btn-default btn-lg'][name='i2smodule']", { style: { "display": " none" } }, [
                             m("option[value='none']", "I²S disabled (default)"),
                             m("option[value='berrynos']", "G2Labs BerryNOS"),
                             m("option[value='berrynosmini']", "G2Labs BerryNOS mini"),
                             m("option[value='hifiberrydac']", "HiFiBerry DAC"),
                             m("option[value='hifiberrydacplus']", "HiFiBerry DAC+"),
                             m("option[value='hifiberrydigi']", "HiFiBerry Digi / Digi+"),
                             m("option[value='iqaudiopidac']", "IQaudIO Pi-DAC / Pi-DAC+"),
                             m("option[value='raspyplay3']", "RaspyPlay3"),
                             m("option[value='raspyplay4']", "RaspyPlay4"),
                             m("option[selected=''][value='transducer']", "Transducer")
                         ]),
                         m(".btn-group.bootstrap-select", [m("button.btn.dropdown-toggle.selectpicker.btn-default.btn-lg[data-toggle='dropdown'][title='Transducer'][type='button']", [m("span.filter-option.pull-left", "Transducer"), " ", m("span.caret")]), m(".dropdown-menu.open", [m("ul.dropdown-menu.inner.selectpicker[role='menu']", [m("li[rel='0']", [m("a[tabindex='0']", [m("span.text", "I²S disabled (default)"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='1']", [m("a[tabindex='0']", [m("span.text", "G2Labs BerryNOS"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='2']", [m("a[tabindex='0']", [m("span.text", "G2Labs BerryNOS mini"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='3']", [m("a[tabindex='0']", [m("span.text", "HiFiBerry DAC"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='4']", [m("a[tabindex='0']", [m("span.text", "HiFiBerry DAC+"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='5']", [m("a[tabindex='0']", [m("span.text", "HiFiBerry Digi / Digi+"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='6']", [m("a[tabindex='0']", [m("span.text", "IQaudIO Pi-DAC / Pi-DAC+"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='7']", [m("a[tabindex='0']", [m("span.text", "RaspyPlay3"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='8']", [m("a[tabindex='0']", [m("span.text", "RaspyPlay4"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li.selected[rel='9']", [m("a[tabindex='0']", [m("span.text", "Transducer"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])])])])]),
                         m("span.help-block", ["Enable I²S output selecting one of the available sets of modules, specific for each hardware. Once set, the output interface will appear in the ", m("a[href='/mpd/']", "MPD configuration select menu"), ", and modules will also auto-load from the next reboot."])
                     ])
                 ]),
                 m(".form-group", [
                     m("label.control-label.col-sm-2[for='orionprofile']", "Sound Signature (optimization profiles)"),
                     m(".col-sm-10", [
                         m("select.selectpicker[data-style='btn-default btn-lg'][name='orionprofile']", { style: { "display": " none" } }, [
                             m("option[value='default']", "ArchLinux default"),
                             m("option[value='RuneAudio']", "RuneAudio"),
                             m("option[selected=''][value='ACX']", "ACX"),
                             m("option[value='Orion']", "Orion"),
                             m("option[value='OrionV2']", "OrionV2"),
                             m("option[value='OrionV3_berrynosmini']", "OrionV3 - (BerryNOS-mini)"),
                             m("option[value='OrionV3_iqaudio']", "OrionV3 - (IQaudioPi-DAC)"),
                             m("option[value='Um3ggh1U']", "Um3ggh1U")
                         ]),
                         m(".btn-group.bootstrap-select", [m("button.btn.dropdown-toggle.selectpicker.btn-default.btn-lg[data-toggle='dropdown'][title='ACX'][type='button']", [m("span.filter-option.pull-left", "ACX"), " ", m("span.caret")]), m(".dropdown-menu.open", [m("ul.dropdown-menu.inner.selectpicker[role='menu']", [m("li[rel='0']", [m("a[tabindex='0']", [m("span.text", "ArchLinux default"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='1']", [m("a[tabindex='0']", [m("span.text", "RuneAudio"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li.selected[rel='2']", [m("a[tabindex='0']", [m("span.text", "ACX"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='3']", [m("a[tabindex='0']", [m("span.text", "Orion"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='4']", [m("a[tabindex='0']", [m("span.text", "OrionV2"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='5']", [m("a[tabindex='0']", [m("span.text", "OrionV3 - (BerryNOS-mini)"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='6']", [m("a[tabindex='0']", [m("span.text", "OrionV3 - (IQaudioPi-DAC)"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])]), m("li[rel='7']", [m("a[tabindex='0']", [m("span.text", "Um3ggh1U"), m("i.glyphicon.glyphicon-ok.icon-ok.check-mark")])])])])]),
                         m("span.help-block", ["These profiles include a set of performance tweaks that act on some system kernel parameters.\n                    It does not have anything to do with DSPs or other sound effects: the output is kept untouched (bit perfect).\n                    It happens that these parameters introduce an audible impact on the overall sound quality, acting on kernel latency parameters (and probably on the amount of overall \n                    ", m("a[href='http://www.thewelltemperedcomputer.com/KB/BitPerfectJitter.htm'][target='_blank'][title='Bit Perfect Jitter by Vincent Kars']", "jitter"), ").\n                    Sound results may vary depending on where music is listened, so choose according to your personal taste.\n                    (If you can't hear any tangible differences... nevermind, just stick to the default settings.)"])
                     ])
                 ]),
                 m(".form-group.form-actions", [
                     m(".col-sm-offset-2.col-sm-10", [
                         m("button.btn.btn-primary.btn-lg[name='save'][type='submit'][value='save']", "Apply settings")
                     ])
                 ])
             ])
         ]),
         m("form.form-horizontal[action=''][data-parsley-validate=''][method='post'][novalidate=''][role='form']", [
             m("fieldset[id='features-management']", [
                 m("legend", "Features management"),
                 m("p", "Enable/disable optional modules that best suit your needs. Disabling unusued features will free system resources and might improve the overall performance."),
                 m("[id='airplayBox']", [
                     m(".form-group", [
                         m("label.control-label.col-sm-2[for='airplay']", "AirPlay"),
                         m(".col-sm-10", [
                             //m("label.switch-light.well[onclick='']", [
                             //	m("input[data-parsley-id='0451'][data-parsley-multiple='featuresairplayenable'][id='airplay'][name='features[airplay][enable]'][type='checkbox'][value='1']"),
                             //	m("span", [m("span", "OFF"), m("span", "ON")]),
                             //	m("a.btn.btn-primary")
                             //]),
                             //m("ul.parsley-errors-list[id='parsley-id-multiple-featuresairplayenable']"),
                             m("span.help-block", "Toggle the capability of receiving wireless streaming of audio via AirPlay protocol")
                         ])
                     ]),
                     m(".hide[id='airplayName']", [
                         m(".form-group", [
                             m("label.control-label.col-sm-2[for='airplay-name']", "AirPlay name"),
                             m(".col-sm-10", [
                                 m("input.form-control.input-lg[data-parsley-id='0928'][data-trigger='change'][id='airplay_name'][name='features[airplay][name]'][placeholder='runeaudio'][type='text'][value='RuneAudio']"),
                                 m("ul.parsley-errors-list[id='parsley-id-0928']"),
                                 m("span.help-block", "AirPlay broadcast name")
                             ])
                         ])
                     ])
                 ]),
                 m("[id='spotifyBox']", [
                     m(".form-group", [
                         m("label.control-label.col-sm-2[for='spotify']", "Spotify"),
                         m(".col-sm-10", [
                             m("label.switch-light.well[onclick='']", [
                                 m("input[data-parsley-id='3701'][data-parsley-multiple='featuresspotifyenable'][id='spotify'][name='features[spotify][enable]'][type='checkbox'][value='1']"),
                                 m("span", [m("span", "OFF"), m("span", "ON")]),
                                 m("a.btn.btn-primary.")
                             ]),
                             m("ul.parsley-errors-list[id='parsley-id-multiple-featuresspotifyenable']"),
                             m("span.help-block", ["Enable Spotify client [EXPERIMENTAL]. You must have a ", m("strong", [m("a[href='https://www.spotify.com/uk/premium/'][target='_blank']", "Spotify PREMIUM")]), " account."])
                         ])
                     ]),
                     m(".hide[id='spotifyAuth']", [
                         m(".form-group", [
                             m("label.control-label.col-sm-2[for='spotify-usr']", "Username"),
                             m(".col-sm-10", [
                                 m("input.form-control.input-lg[autocomplete='off'][data-parsley-id='0174'][data-trigger='change'][id='spotify_user'][name='features[spotify][user]'][placeholder='user'][type='text'][value='user']"),
                                 m("ul.parsley-errors-list[id='parsley-id-0174']"),
                                 m("span.help-block", ["Insert your Spotify ", m("i", "username")])
                             ])
                         ]),
                         m(".form-group", [
                             m("label.control-label.col-sm-2[for='spotify-pasw']", "Password"),
                             m(".col-sm-10", [
                                 m("input.form-control.input-lg[autocomplete='off'][data-parsley-id='0985'][id='spotify_pass'][name='features[spotify][pass]'][placeholder='pass'][type='password'][value='pass']"),
                                 m("ul.parsley-errors-list[id='parsley-id-0985']"),
                                 m("span.help-block", ["Insert your Spotify ", m("i", "password"), " (case sensitive)"])
                             ])
                         ])
                     ])
                 ]),
                 m("[id='dlnaBox']", [
                     m(".form-group", [
                         m("label.control-label.col-sm-2[for='dlna']", "UPnP / DLNA"),
                         m(".col-sm-10", [
                             m("label.switch-light.well[onclick='']", [
                                 m("input[data-parsley-id='1837'][data-parsley-multiple='featuresdlnaenable'][id='dlna'][name='features[dlna][enable]'][type='checkbox'][value='1']"),
                                 m("span", [m("span", "OFF"), m("span", "ON")]),
                                 m("a.btn.btn-primary")
                             ]),
                             m("ul.parsley-errors-list[id='parsley-id-multiple-featuresdlnaenable']"),
                             m("span.help-block", "Toggle the capability of receiving wireless streaming of audio via UPnP / DLNA protocol")
                         ])
                     ]),
                     m(".hide[id='dlnaName']", [
                         m(".form-group", [
                             m("label.control-label.col-sm-2[for='dlna-name']", "UPnP / DLNA name"),
                             m(".col-sm-10", [
                                 m("input.form-control.input-lg[data-parsley-id='8193'][data-trigger='change'][id='dlna_name'][name='features[dlna][name]'][placeholder='runeaudio'][type='text'][value='RuneAudio']"),
                                 m("ul.parsley-errors-list[id='parsley-id-8193']"),
                                 m("span.help-block", "UPnP / DLNA broadcast name")
                             ])
                         ])
                     ])
                 ]),
                 m(".form-group", [
                     m("label.control-label.col-sm-2[for='udevil']", "USB Automount"),
                     m(".col-sm-10", [
                         m("label.switch-light.well[onclick='']", [
                             m("input[data-parsley-id='1024'][data-parsley-multiple='featuresudevil'][name='features[udevil]'][type='checkbox'][value='1']"),
                             m("span", [m("span", "OFF"), m("span", "ON")]),
                             m("a.btn.btn-primary")
                         ]),
                         m("ul.parsley-errors-list[id='parsley-id-multiple-featuresudevil']"),
                         m("span.help-block", "Toggle automount for USB drives")
                     ])
                 ]),
                 m(".form-group", [
                     m("label.control-label.col-sm-2[for='coverart']", "Display album cover"),
                     m(".col-sm-10", [
                         m("label.switch-light.well[onclick='']", [
                             m("input[checked='checked'][data-parsley-id='5818'][data-parsley-multiple='featurescoverart'][name='features[coverart]'][type='checkbox'][value='1']"),
                             m("span", [m("span", "OFF"), m("span", "ON")]),
                             m("a.btn.btn-primary")
                         ]),
                         m("ul.parsley-errors-list[id='parsley-id-multiple-featurescoverart']"),
                         m("span.help-block", "Toggle the display of album art on the Playback main screen")
                     ])
                 ]),
                 m("[id='lastfmBox']", [
                     m(".form-group", [
                         m("label.control-label.col-sm-2[for='lastfm']", [m("i.fa.fa.fa-lastfm-square"), " Last.fm"]),
                         m(".col-sm-10", [
                             m("label.switch-light.well[onclick='']", [
                                 m("input[data-parsley-id='6913'][data-parsley-multiple='featureslastfmenable'][id='scrobbling-lastfm'][name='features[lastfm][enable]'][type='checkbox'][value='1']"),
                                 m("span", [m("span", "OFF"), m("span", "ON")]),
                                 m("a.btn.btn-primary")
                             ]),
                             m("ul.parsley-errors-list[id='parsley-id-multiple-featureslastfmenable']"),
                             m("span.help-block", "Send to Last.fm informations about the music you are listening to (requires a Last.fm account)")
                         ])
                     ]),
                     m(".hide[id='lastfmAuth']", [
                         m(".form-group", [
                             m("label.control-label.col-sm-2[for='lastfm-usr']", "Username"),
                             m(".col-sm-10", [
                                 m("input.form-control.input-lg[autocomplete='off'][data-parsley-id='9931'][data-trigger='change'][id='lastfm_user'][name='features[lastfm][user]'][placeholder='user'][type='text'][value='user']"),
                                 m("ul.parsley-errors-list[id='parsley-id-9931']"),
                                 m("span.help-block", ["Insert your Last.fm ", m("i", "username")])
                             ])
                         ]),
                         m(".form-group", [
                             m("label.control-label.col-sm-2[for='lastfm-pasw']", "Password"),
                             m(".col-sm-10", [
                                 m("input.form-control.input-lg[autocomplete='off'][data-parsley-id='2505'][id='lastfm_pass'][name='features[lastfm][pass]'][placeholder='pass'][type='password'][value='pass']"),
                                 m("ul.parsley-errors-list[id='parsley-id-2505']"),
                                 m("span.help-block", ["Insert your Last.fm ", m("i", "password"), " (case sensitive)"])
                             ])
                         ])
                     ])
                 ]),
                 m(".form-group.form-actions", [
                     m(".col-sm-offset-2.col-sm-10", [
                         m("button.btn.btn-primary.btn-lg[name='features[submit]'][type='submit'][value='1']", "apply settings")
                     ])
                 ])
             ])
         ]),
         m("form.form-horizontal[action=''][method='post'][role='form']", [
             m("fieldset", [
                 m("legend", "Compatibility fixes"),
                 m("p", "For people suffering problems with some receivers and DACs."),
                 m(".form-group", [
                     m("label.control-label.col-sm-2[for='cmediafix']", "CMedia fix"),
                     m(".col-sm-10", [
                         m("label.switch-light.well[onclick='']", [
                             m("input[name='cmediafix[1]'][type='checkbox'][value='1']"),
                             m("span", [m("span", "OFF"), m("span", "ON")]),
                             m("a.btn.btn-primary")
                         ]),
                         m("span.help-block", ["For those who have a CM6631 receiver and experiment issues (noise, crackling) between tracks with different sample rates and/or bit depth.", m("br"), " \n                    A \"dirty\" fix that should avoid the problem, do NOT use if everything works normally."])
                     ])
                 ]),
                 m(".form-group.form-actions", [
                     m(".col-sm-offset-2.col-sm-10", [
                         m("button.btn.btn-primary.btn-lg[name='cmediafix[0]'][type='submit'][value='1']", "Apply fixes")
                     ])
                 ])
             ])
         ]),
         m("form.form-horizontal[method='post']", [
             m("fieldset", [
                 m("legend", "Backup / Restore configuration"),
                 m("p", "Transfer settings between multiple RuneAudio installations, saving time during new/upgrade installations."),
                 m(".form-group", [
                     m("label.control-label.col-sm-2", "Backup player config"),
                     m(".col-sm-10", [
                         m("input.btn.btn-primary.btn-lg[id='syscmd-backup'][name='syscmd'][type='submit'][value='backup']"),
                         m("span.help-block", "NOTE: restore feature will come in 0.4 release.")
                     ])
                 ])
             ])
         ]),
         "\n"];

};

mpd.view = function (ctrl) {
    return [m('h1', 'MPD Configuration'), '\n', m('p', ['\n    If you mess up with this configuration you can ', m('a[data-toggle="modal"][href="#mpd-config-defaults"]', 'reset to default'), '.\n']), '\n',
        m('form.form-horizontal[action=""][method="post"]', [
		m('fieldset', [
			m('legend', 'Audio Output'),
			m('.boxed-group', [
				m('.form-group', [
                    createLabel('audio-output-interface', 'Audio output interface'),
					m('.col-sm-10', [
                        //(id, container, field, list, valueField, displayField, config)
                        m('input.form-control.input-lg[data-trigger="change"][id="ao"][type="text"]', bind2(mpd.vm.data, 'ao', null, true)),
						//createSelect('audio-output-interface', mpd.vm.data, 'ao', 'acards', 'name', 'extlabel', selectpicker),
                        m('span.help-block', ['This is the current output interface. It can be ', m('a[href="/audio"]', { config: m.route }, 'configured here'), '.'])
					//]),
                    //m('.form-group.form-actions', [
                    //    m('.col-sm-offset-2.col-sm-10', [
                    //    //m('a.btn.btn-default.btn-lg[href="/mpd/"]', { config: m.route }, 'Cancel'), //TODO: Do we navigate, or re-init the data?
                    //    m('button.btn.btn-default.btn-lg[name="cancel"][value="cancel"][type="button"]', { onclick: mpd.vm.cancel }, 'Cancel'),
                    //    m('button.btn.btn-primary.btn-lg[name="save"][value="save"][type="button"]', { onclick: mpd.vm.save }, 'Save and apply')
                    //    ])
                    //])
					])
				])
			])
		])
    ]), m('form.form-horizontal[action=""][data-parsley-validate=""][method=""][id="my-form"]', [
		m('fieldset', [
			m('legend', 'Volume control'),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="mixer-type"]', 'Volume control'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="mixer-type"][name="conf__mixer_type_"]',
                        //{ config: selectpicker, onchange: m.withAttr('value', function (value) { mpd.data.conf.mixer_type = value }), value: mpd.data.conf.mixer_type }
                        bind2(mpd.vm.data.conf, 'mixer_type', selectpicker), [
						m('option[value="disabled"]', 'disabled'),
						m('option[value="software"]', 'enabled - software'),
						m('option[value="hardware"]', 'enabled - hardware')
                        ]),
					m('span.help-block', [
						m('strong', 'disabled'),
						' - Volume knob disabled. Use this option to achieve the ',
						m('strong', 'best audio quality'),
						'.\n\n                ',
						m('strong', 'software'),
						' - Volume knob enabled, controlled by ',
						m('strong', 'software mixer'),
						'. This option ',
						m('strong', 'reduces the overall sound quality'),
						'.\n\n                ',
						m('strong', 'hardware'),
						' - Volume knob enabled, controlled by ',
						m('strong', 'hardware mixer'),
						'. This option enables the volume control and let you achieve ',
						m('strong', 'very good overall sound quality'),
						'.\n\n                ',
						m('i', 'Note: hardware mixer must be supported directly from your sound card hardware.')
					])
				])
			])
		]),
		m('fieldset', [
			m('legend', 'General music daemon options'),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="port"]', 'Port'),
				m('.col-sm-10', [
					m('input.form-control.input-lg[data-trigger="change"][disabled=""][id="port"][name="conf[port]"][type="text"]', bind2(mpd.vm.data.conf, 'port')),
					m('span.help-block', 'This setting is the TCP port that is desired for the daemon to get assigned to.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="daemon-user"]', 'Daemon user : group'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="user"][name="conf[user]"]', bind2(mpd.vm.data.conf, 'user', selectpicker), [
						m('option[selected=""][value="mpd"]', 'mpd : audio (default)'),
						m('option[value="root"]', 'root : root')
					]),
					m('span.help-block', 'This specifies the system user : group that MPD will run as.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="log-level"]', 'Log level'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="log-level"][name="conf[log_level]"]', bind2(mpd.vm.data.conf, 'log_level', selectpicker), [
						m('option[selected=""][value="none"]', 'disabled'),
						m('option[value="default"]', 'default'),
						m('option[value="secure"]', 'secure'),
						m('option[value="verbose"]', 'verbose')
					]),
					m('span.help-block', 'This setting controls the type of information which is logged. Available setting arguments are \'disabled\', \'default\', \'secure\' or \'verbose\'. The \'verbose\' setting argument is recommended for troubleshooting, though can quickly stretch available resources on limited hardware storage.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="state-file"]', 'State file'),
				m('.col-sm-10', [
                    //              (id, container, field, config)
                    createYesNo('state_file', mpd.vm.data.conf, 'state_file', selectpicker),
					//m('select[data-style="btn-default btn-lg"][id="log-level"][name="conf[state_file]"]', { config: selectpicker }, [
					//	m('option[selected=""][value="yes"]', 'enabled'),
					//	m('option[value="no"]', 'disabled')
					//])
					m('span.help-block', 'This setting specifies if a state file is used. If the state file is active, the state of mpd will be saved when mpd is terminated by a TERM signal or by the \'kill\' command. When mpd is restarted, it will read the state file and restore the state of mpd (including the playlist).')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="ffmpeg"]', 'FFmpeg decoder plugin'),
				m('.col-sm-10', [
					createYesNo('ffmpeg', mpd.vm.data.conf, 'ffmpeg', selectpicker),
					m('span.help-block', 'FFmpeg decoder plugin. Enable this setting if you need AAC / ALAC support. May slow down MPD database refresh.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="gapless-mp3-playback"]', 'Gapless mp3 playback'),
				m('.col-sm-10', [
					createYesNo('gapless-mp3-playback', mpd.vm.data.conf, 'gapless_mp3_playback', selectpicker),
					m('span.help-block', 'If you have a problem with your MP3s ending abruptly it is recommended that you set this argument to \'no\' to attempt to fix the problem. If this solves the problem, it is highly recommended to fix the MP3 files with vbrfix (available as vbrfix in the debian archive), at which point gapless MP3 playback can be enabled.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="dsd-usb"]', 'DSD support'),
				m('.col-sm-10', [
					createYesNo('dsd-usb', mpd.vm.data.conf, 'dsd_usb', selectpicker),
					m('span.help-block', 'Enable DSD audio support.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="volume-normalization"]', 'Volume normalization'),
				m('.col-sm-10', [
					createYesNo('volume-normalization', mpd.vm.data.conf, 'volume_normalization', selectpicker),
					m('span.help-block', 'If yes, mpd will normalize the volume of songs as they play. The default is no')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="port"]', 'Audio buffer size'),
				m('.col-sm-10', [
					m('input.form-control.input-lg[data-trigger="change"][id="audio-buffer-size"][min="512"][name="conf[audio_buffer_size]"][type="number"]', bind2(mpd.vm.data.conf, 'audio_buffer_size')),
					m('span.help-block', 'This specifies the size of the audio buffer in kibibytes. The default is 2048, large enough for nearly 12 seconds of CD-quality audio.')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="dsd-usb"]', 'Buffer before play'),
				m('.col-sm-10', [
					m('select[data-style="btn-default btn-lg"][id="buffer-before-play"][name="conf[buffer_before_play]"]', bind2(mpd.vm.data.conf, 'buffer_before_play', selectpicker), [
						m('option[value="0%"]', 'disabled'),
						'\n                    \n\';\n                    ',
						m('option[selected=""][value="10%"]', '10%'),
						'\n                    \n\';\n                    ',
						m('option[value="20%"]', '20%'),
						'\n                    \n\';\n                    ',
						m('option[value="30%"]', '30%'),
						'\n                    \n\';\n                '
					]),
					m('span.help-block', ' This specifies how much of the audio buffer should be filled before playing a song. Try increasing this if you hear skipping when manually changing songs. The default is 10%, a little over 1 second of CD-quality audio with the default buffer size')
				])
			]),
			m('.form-group', [
				m('label.col-sm-2.control-label[for="auto-update"]', 'Auto update'),
				m('.col-sm-10', [
					createYesNo('auto-update', mpd.vm.data.conf, 'auto_update', selectpicker),
					m('span.help-block', 'This setting enables automatic update of MPD"s database when files in music_directory are changed.')
				])
			])
		]),
		m('.form-group.form-actions', [
			m('.col-sm-offset-2.col-sm-10', [
				//m('a.btn.btn-default.btn-lg[href="/mpd/"]', { config: m.route }, 'Cancel'), //TODO: Do we navigate, or re-init the data?
                m('button.btn.btn-default.btn-lg[name="cancel"][value="cancel"][type="button"]', { onclick: mpd.vm.cancel }, 'Cancel'),
				m('button.btn.btn-primary.btn-lg[name="save"][value="save"][type="button"]', { onclick: mpd.vm.save }, 'Save and apply')
			])
		])
    ])];
};

credits.view = function (ctrl) {
    return m('h1', 'Credits');
};

debug.view = function (ctrl) {
    return [m(".container.debug", [
		m("h1", "DEBUG DATA"),
		m(".boxed", [
			m("p", ["Below is displayed the raw output of RuneUI's debug section. It contains some important informations that could help to diagnosticate problems.", m("br"), "Please copy and paste it in your posts when asking for help ", m("a[href='http://www.runeaudio.com/forum/'][target='_blank'][title='RuneAudio Forum']", "in the forum"), "."]),
			m("button.btn.btn-primary.btn-lg[data-clipboard-target='clipboard_pre'][id='copy-to-clipboard']", [m("i.fa.fa-copy.sx"), " Copy data to clipboard"])
		]),
		m("br"),
		m("pre[id='clipboard_pre']"),
		"\n"
    ]), "\n", m(".modal.fade[aria-hidden='true'][aria-labelledby='poweroff-modal-label'][id='poweroff-modal'][role='dialog'][tabindex='-1']", [
		m(".modal-dialog.modal-sm", [
			m(".modal-content", [
				m(".modal-header", [
					m("button.close[aria-hidden='true'][data-dismiss='modal'][type='button']", "×"),
					m("h4.modal-title[id='poweroff-modal-label']", "Turn off the player")
				]),
				m(".modal-body.txtmid", [
					m("button.btn.btn-primary.btn-lg.btn-block[data-dismiss='modal'][id='syscmd-poweroff'][name='syscmd'][value='poweroff']", [m("i.fa.fa-power-off.sx"), " Power off"]),
					m("button.btn.btn-primary.btn-lg.btn-block[data-dismiss='modal'][id='syscmd-reboot'][name='syscmd'][value='reboot']", [m("i.fa.fa-refresh.sx"), " Reboot"])
				]),
				m(".modal-footer", [
					m("button.btn.btn-default.btn-lg[aria-hidden='true'][data-dismiss='modal']", "Cancel")
				])
			])
		]),
		"\n"
    ])];
};

dev.view = function (ctrl) {
    return m('h1', 'Dev');
};

error.view = function (ctrl) {
    return m('h1', 'Error');
};

network.view = function (ctrl) {
    return [m("h1", "Network configuration"),
        m(".boxed",
            [m("p", ["Configure wired and wireless connections. See below for the list of the active network interfaces as detected by the system.",
                m("br"), "If your interface is connected but does not show, then try to refresh the list forcing the detect."]),
                m("button.btn.btn-lg.btn-primary[id='refresh'][name='refresh'][type='button'][value='1']",
                    [m("i.fa.fa-refresh.sx"), "Refresh interfaces"])]),
                    m("h2", "Network interfaces"),
                    m("p", "List of active network interfaces. Click on an entry to configure the corresponding connection."),
                    m("p", [m("a.btn.btn-lg.btn-default.btn-block[href='/network/edit/eth0']", [" ", m("i.fa.fa-check.green.sx"),
                        " ",
                        m("strong", "eth0 "), "   ", m("span", "[10.10.10.123]")])])];
};

sources.view = function (ctrl) {
    return [m(".container", [
             m("h1", "Local sources"),
             m(".boxed", [
                 m("p", ["Your ", m("a[href='/#panel-sx']", "music library"), " is composed by two main content types: ", m("strong", "local sources"), " and streaming sources.", m("br"), "\n        This section lets you configure your local sources, telling ", m("a[href='http://www.musicpd.org/'][rel='nofollow'][target='_blank'][title='Music Player Daemon']", "MPD"), " to scan the contents of ", m("strong", "network mounts"), " and ", m("strong", "USB mounts"), "."]),
                 m("form[action=''][method='post']", [
                     m("button.btn.btn-lg.btn-primary[id='updatempddb'][name='updatempd'][type='submit'][value='1']", [m("i.fa.fa-refresh.sx"), "Rebuild MPD Library"])
                 ])
             ]),
             m("h2", "Network mounts"),
             m("p", "List of configured network mounts. Click an existing entry to edit it, or add a new one."),
             m("form.button-list[action=''][id='mount-list'][method='post']", [
                 m("p", [m("button.btn.btn-lg.btn-primary.btn-block[id='mountall'][name='mountall'][type='submit'][value='1']", [m("i.fa.fa-refresh.sx"), " Remount all sources"])]),
                 m("p", [m("a.btn.btn-lg.btn-default.btn-block[href='/sources/edit/8']", [" ", m("i.fa..fa-check.green..sx"), " Music    ", m("span", "//apps/MUSIC")])]),
                 m("p", [m("a.btn.btn-lg.btn-primary.btn-block[data-ajax='false'][href='/sources/add']", [m("i.fa.fa-plus.sx"), " Add new mount"])])
             ]),
             m("h2", "USB mounts"),
             m("p", ["List of mounted USB drives. To safe unmount a drive, click on it and confirm at the dialog prompt.", m("br"), "\n    If a drive is connected but not shown in the list, please check if ", m("a[href='/settings/#features-management']", "USB automount"), " is enabled."]),
             m(".button-list[id='usb-mount-list']", [
                 m("p", [m("button.btn.btn-lg.btn-disabled.btn-block[disabled='disabled']", "no USB mounts present")])
             ]),
             "\n"
    ])];
};

                

// Mithril routing configuration
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
    '/sources': sources
});

jQuery(document).ready(function ($) {
    'use strict';
});