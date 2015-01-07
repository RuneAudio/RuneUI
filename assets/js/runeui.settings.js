window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.settings = new mithril.RuneModule('/settings');

// 'Settings' view
settings.view = function (ctrl) {
    return [
         m('h1', 'Settings'),
             m('fieldset.form-horizontal', [
                 m('legend', 'Environment'),
                 m('.form-group[id="systemstatus"]', [
                     m('label.control-label.col-sm-2', 'Check system status'),
                     m('.col-sm-10', [
                         m('a.btn.btn-default.btn-lg[data-toggle="modal"][href="#modal-sysinfo"]', [m('i.fa.fa-info-circle.sx'), 'show status']),
                         m('span.help-block', 'See information regarding the system and its status.')
                     ])
                 ]),
                 m('.form-group[id="environment"]', [
                     m('label.control-label.col-sm-2[for="hostname"]', 'Player hostname'),
                     m('.col-sm-10', [
                         m('input.form-control.input-lg[autocomplete="off"][id="hostname"][placeholder="runeaudio"][type="text"]', mithril.bind2(settings.vm.data.environment, 'hostname')),
                         m('span.help-block', 'Set the player hostname. This will change the address used to reach the RuneUI.')
                     ])
                 ]),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="ntpserver"]', 'NTP server'),
                     m('.col-sm-10', [
                         m('input.form-control.input-lg[autocomplete="off"][id="ntpserver"][placeholder="pool.ntp.org"][type="text"]', mithril.bind2(settings.vm.data.environment, 'ntpserver')),
                         m('span.help-block', ['Set your reference time sync server ', m('i', '(NTP server)'), '.'])
                     ])
                 ]),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="timezone"]', 'Timezone'),
                     m('.col-sm-10', [
                        m('select[data-style="btn-default btn-lg"][id="timezone"]', { config: helpers.selectpicker }, [m('option[value="Africa/Abidjan"]', 'Africa/Abidjan - GMT +00:00'), m('option[value="Africa/Accra"]', 'Africa/Accra - GMT +00:00'), m('option[value="Africa/Addis_Ababa"]', 'Africa/Addis_Ababa - GMT +03:00'), m('option[value="Africa/Algiers"]', 'Africa/Algiers - GMT +00:00'), m('option[value="Africa/Asmara"]', 'Africa/Asmara - GMT +03:00'), m('option[value="Africa/Bamako"]', 'Africa/Bamako - GMT +00:00'), m('option[value="Africa/Bangui"]', 'Africa/Bangui - GMT +01:00'), m('option[value="Africa/Banjul"]', 'Africa/Banjul - GMT +00:00'), m('option[value="Africa/Bissau"]', 'Africa/Bissau - GMT -01:00'), m('option[value="Africa/Blantyre"]', 'Africa/Blantyre - GMT +02:00'), m('option[value="Africa/Brazzaville"]', 'Africa/Brazzaville - GMT +01:00'), m('option[value="Africa/Bujumbura"]', 'Africa/Bujumbura - GMT +02:00'), m('option[value="Africa/Cairo"]', 'Africa/Cairo - GMT +02:00'), m('option[value="Africa/Casablanca"]', 'Africa/Casablanca - GMT +00:00'), m('option[value="Africa/Ceuta"]', 'Africa/Ceuta - GMT +00:00'), m('option[value="Africa/Conakry"]', 'Africa/Conakry - GMT +00:00'), m('option[value="Africa/Dakar"]', 'Africa/Dakar - GMT +00:00'), m('option[value="Africa/Dar_es_Salaam"]', 'Africa/Dar_es_Salaam - GMT +03:00'), m('option[value="Africa/Djibouti"]', 'Africa/Djibouti - GMT +03:00'), m('option[value="Africa/Douala"]', 'Africa/Douala - GMT +01:00'), m('option[value="Africa/El_Aaiun"]', 'Africa/El_Aaiun - GMT -01:00'), m('option[value="Africa/Freetown"]', 'Africa/Freetown - GMT +00:00'), m('option[value="Africa/Gaborone"]', 'Africa/Gaborone - GMT +02:00'), m('option[value="Africa/Harare"]', 'Africa/Harare - GMT +02:00'), m('option[value="Africa/Johannesburg"]', 'Africa/Johannesburg - GMT +02:00'), m('option[value="Africa/Juba"]', 'Africa/Juba - GMT +02:00'), m('option[value="Africa/Kampala"]', 'Africa/Kampala - GMT +03:00'), m('option[value="Africa/Khartoum"]', 'Africa/Khartoum - GMT +02:00'), m('option[value="Africa/Kigali"]', 'Africa/Kigali - GMT +02:00'), m('option[value="Africa/Kinshasa"]', 'Africa/Kinshasa - GMT +01:00'), m('option[value="Africa/Lagos"]', 'Africa/Lagos - GMT +01:00'), m('option[value="Africa/Libreville"]', 'Africa/Libreville - GMT +01:00'), m('option[value="Africa/Lome"]', 'Africa/Lome - GMT +00:00'), m('option[value="Africa/Luanda"]', 'Africa/Luanda - GMT +01:00'), m('option[value="Africa/Lubumbashi"]', 'Africa/Lubumbashi - GMT +02:00'), m('option[value="Africa/Lusaka"]', 'Africa/Lusaka - GMT +02:00'), m('option[value="Africa/Malabo"]', 'Africa/Malabo - GMT +01:00'), m('option[value="Africa/Maputo"]', 'Africa/Maputo - GMT +02:00'), m('option[value="Africa/Maseru"]', 'Africa/Maseru - GMT +02:00'), m('option[value="Africa/Mbabane"]', 'Africa/Mbabane - GMT +02:00'), m('option[value="Africa/Mogadishu"]', 'Africa/Mogadishu - GMT +03:00'), m('option[value="Africa/Monrovia"]', 'Africa/Monrovia - GMT -00:44'), m('option[value="Africa/Nairobi"]', 'Africa/Nairobi - GMT +03:00'), m('option[value="Africa/Ndjamena"]', 'Africa/Ndjamena - GMT +01:00'), m('option[value="Africa/Niamey"]', 'Africa/Niamey - GMT +01:00'), m('option[value="Africa/Nouakchott"]', 'Africa/Nouakchott - GMT +00:00'), m('option[value="Africa/Ouagadougou"]', 'Africa/Ouagadougou - GMT +00:00'), m('option[value="Africa/Porto-Novo"]', 'Africa/Porto-Novo - GMT +01:00'), m('option[value="Africa/Sao_Tome"]', 'Africa/Sao_Tome - GMT +00:00'), m('option[value="Africa/Tripoli"]', 'Africa/Tripoli - GMT +02:00'), m('option[value="Africa/Tunis"]', 'Africa/Tunis - GMT +01:00'), m('option[value="Africa/Windhoek"]', 'Africa/Windhoek - GMT +02:00'), m('option[value="America/Adak"]', 'America/Adak - GMT -11:00'), m('option[value="America/Anchorage"]', 'America/Anchorage - GMT -10:00'), m('option[value="America/Anguilla"]', 'America/Anguilla - GMT -04:00'), m('option[value="America/Antigua"]', 'America/Antigua - GMT -04:00'), m('option[value="America/Araguaina"]', 'America/Araguaina - GMT -03:00'), m('option[value="America/Argentina/Buenos_Aires"]', 'America/Argentina/Buenos_Aires - GMT -03:00'), m('option[value="America/Argentina/Catamarca"]', 'America/Argentina/Catamarca - GMT -03:00'), m('option[value="America/Argentina/Cordoba"]', 'America/Argentina/Cordoba - GMT -03:00'), m('option[value="America/Argentina/Jujuy"]', 'America/Argentina/Jujuy - GMT -03:00'), m('option[value="America/Argentina/La_Rioja"]', 'America/Argentina/La_Rioja - GMT -03:00'), m('option[value="America/Argentina/Mendoza"]', 'America/Argentina/Mendoza - GMT -03:00'), m('option[value="America/Argentina/Rio_Gallegos"]', 'America/Argentina/Rio_Gallegos - GMT -03:00'), m('option[value="America/Argentina/Salta"]', 'America/Argentina/Salta - GMT -03:00'), m('option[value="America/Argentina/San_Juan"]', 'America/Argentina/San_Juan - GMT -03:00'), m('option[value="America/Argentina/San_Luis"]', 'America/Argentina/San_Luis - GMT -03:00'), m('option[value="America/Argentina/Tucuman"]', 'America/Argentina/Tucuman - GMT -03:00'), m('option[value="America/Argentina/Ushuaia"]', 'America/Argentina/Ushuaia - GMT -03:00'), m('option[value="America/Aruba"]', 'America/Aruba - GMT -04:00'), m('option[value="America/Asuncion"]', 'America/Asuncion - GMT -04:00'), m('option[value="America/Atikokan"]', 'America/Atikokan - GMT -05:00'), m('option[value="America/Bahia"]', 'America/Bahia - GMT -03:00'), m('option[value="America/Bahia_Banderas"]', 'America/Bahia_Banderas - GMT -07:00'), m('option[value="America/Barbados"]', 'America/Barbados - GMT -04:00'), m('option[value="America/Belem"]', 'America/Belem - GMT -03:00'), m('option[value="America/Belize"]', 'America/Belize - GMT -06:00'), m('option[value="America/Blanc-Sablon"]', 'America/Blanc-Sablon - GMT -04:00'), m('option[value="America/Boa_Vista"]', 'America/Boa_Vista - GMT -04:00'), m('option[value="America/Bogota"]', 'America/Bogota - GMT -05:00'), m('option[value="America/Boise"]', 'America/Boise - GMT -07:00'), m('option[value="America/Cambridge_Bay"]', 'America/Cambridge_Bay - GMT -07:00'), m('option[value="America/Campo_Grande"]', 'America/Campo_Grande - GMT -04:00'), m('option[value="America/Cancun"]', 'America/Cancun - GMT -06:00'), m('option[value="America/Caracas"]', 'America/Caracas - GMT -04:00'), m('option[value="America/Cayenne"]', 'America/Cayenne - GMT -03:00'), m('option[value="America/Cayman"]', 'America/Cayman - GMT -05:00'), m('option[value="America/Chicago"]', 'America/Chicago - GMT -06:00'), m('option[value="America/Chihuahua"]', 'America/Chihuahua - GMT -06:00'), m('option[value="America/Costa_Rica"]', 'America/Costa_Rica - GMT -06:00'), m('option[value="America/Creston"]', 'America/Creston - GMT -07:00'), m('option[value="America/Cuiaba"]', 'America/Cuiaba - GMT -04:00'), m('option[value="America/Curacao"]', 'America/Curacao - GMT -04:00'), m('option[value="America/Danmarkshavn"]', 'America/Danmarkshavn - GMT -03:00'), m('option[value="America/Dawson"]', 'America/Dawson - GMT -09:00'), m('option[value="America/Dawson_Creek"]', 'America/Dawson_Creek - GMT -08:00'), m('option[value="America/Denver"]', 'America/Denver - GMT -07:00'), m('option[value="America/Detroit"]', 'America/Detroit - GMT -05:00'), m('option[value="America/Dominica"]', 'America/Dominica - GMT -04:00'), m('option[value="America/Edmonton"]', 'America/Edmonton - GMT -07:00'), m('option[value="America/Eirunepe"]', 'America/Eirunepe - GMT -05:00'), m('option[value="America/El_Salvador"]', 'America/El_Salvador - GMT -06:00'), m('option[value="America/Fortaleza"]', 'America/Fortaleza - GMT -03:00'), m('option[value="America/Glace_Bay"]', 'America/Glace_Bay - GMT -04:00'), m('option[value="America/Godthab"]', 'America/Godthab - GMT -03:00'), m('option[value="America/Goose_Bay"]', 'America/Goose_Bay - GMT -04:00'), m('option[value="America/Grand_Turk"]', 'America/Grand_Turk - GMT -05:00'), m('option[value="America/Grenada"]', 'America/Grenada - GMT -04:00'), m('option[value="America/Guadeloupe"]', 'America/Guadeloupe - GMT -04:00'), m('option[value="America/Guatemala"]', 'America/Guatemala - GMT -06:00'), m('option[value="America/Guayaquil"]', 'America/Guayaquil - GMT -05:00'), m('option[value="America/Guyana"]', 'America/Guyana - GMT -03:45'), m('option[value="America/Halifax"]', 'America/Halifax - GMT -04:00'), m('option[value="America/Havana"]', 'America/Havana - GMT -05:00'), m('option[value="America/Hermosillo"]', 'America/Hermosillo - GMT -07:00'), m('option[value="America/Indiana/Indianapolis"]', 'America/Indiana/Indianapolis - GMT -05:00'), m('option[value="America/Indiana/Knox"]', 'America/Indiana/Knox - GMT -06:00'), m('option[value="America/Indiana/Marengo"]', 'America/Indiana/Marengo - GMT -05:00'), m('option[value="America/Indiana/Petersburg"]', 'America/Indiana/Petersburg - GMT -06:00'), m('option[value="America/Indiana/Tell_City"]', 'America/Indiana/Tell_City - GMT -05:00'), m('option[value="America/Indiana/Vevay"]', 'America/Indiana/Vevay - GMT -05:00'), m('option[value="America/Indiana/Vincennes"]', 'America/Indiana/Vincennes - GMT -05:00'), m('option[value="America/Indiana/Winamac"]', 'America/Indiana/Winamac - GMT -05:00'), m('option[value="America/Inuvik"]', 'America/Inuvik - GMT -08:00'), m('option[value="America/Iqaluit"]', 'America/Iqaluit - GMT -05:00'), m('option[value="America/Jamaica"]', 'America/Jamaica - GMT -05:00'), m('option[value="America/Juneau"]', 'America/Juneau - GMT -08:00'), m('option[value="America/Kentucky/Louisville"]', 'America/Kentucky/Louisville - GMT -05:00'), m('option[value="America/Kentucky/Monticello"]', 'America/Kentucky/Monticello - GMT -06:00'), m('option[value="America/Kralendijk"]', 'America/Kralendijk - GMT -04:00'), m('option[value="America/La_Paz"]', 'America/La_Paz - GMT -04:00'), m('option[value="America/Lima"]', 'America/Lima - GMT -05:00'), m('option[value="America/Los_Angeles"]', 'America/Los_Angeles - GMT -08:00'), m('option[value="America/Lower_Princes"]', 'America/Lower_Princes - GMT -04:00'), m('option[value="America/Maceio"]', 'America/Maceio - GMT -03:00'), m('option[value="America/Managua"]', 'America/Managua - GMT -06:00'), m('option[value="America/Manaus"]', 'America/Manaus - GMT -04:00'), m('option[value="America/Marigot"]', 'America/Marigot - GMT -04:00'), m('option[value="America/Martinique"]', 'America/Martinique - GMT -04:00'), m('option[value="America/Matamoros"]', 'America/Matamoros - GMT -06:00'), m('option[value="America/Mazatlan"]', 'America/Mazatlan - GMT -07:00'), m('option[value="America/Menominee"]', 'America/Menominee - GMT -05:00'), m('option[value="America/Merida"]', 'America/Merida - GMT -06:00'), m('option[value="America/Metlakatla"]', 'America/Metlakatla - GMT -08:00'), m('option[value="America/Mexico_City"]', 'America/Mexico_City - GMT -06:00'), m('option[value="America/Miquelon"]', 'America/Miquelon - GMT -04:00'), m('option[value="America/Moncton"]', 'America/Moncton - GMT -04:00'), m('option[value="America/Monterrey"]', 'America/Monterrey - GMT -06:00'), m('option[value="America/Montevideo"]', 'America/Montevideo - GMT -03:00'), m('option[value="America/Montserrat"]', 'America/Montserrat - GMT -04:00'), m('option[value="America/Nassau"]', 'America/Nassau - GMT -05:00'), m('option[value="America/New_York"]', 'America/New_York - GMT -05:00'), m('option[value="America/Nipigon"]', 'America/Nipigon - GMT -05:00'), m('option[value="America/Nome"]', 'America/Nome - GMT -11:00'), m('option[value="America/Noronha"]', 'America/Noronha - GMT -02:00'), m('option[value="America/North_Dakota/Beulah"]', 'America/North_Dakota/Beulah - GMT -07:00'), m('option[value="America/North_Dakota/Center"]', 'America/North_Dakota/Center - GMT -07:00'), m('option[value="America/North_Dakota/New_Salem"]', 'America/North_Dakota/New_Salem - GMT -07:00'), m('option[value="America/Ojinaga"]', 'America/Ojinaga - GMT -06:00'), m('option[value="America/Panama"]', 'America/Panama - GMT -05:00'), m('option[value="America/Pangnirtung"]', 'America/Pangnirtung - GMT -04:00'), m('option[value="America/Paramaribo"]', 'America/Paramaribo - GMT -03:30'), m('option[value="America/Phoenix"]', 'America/Phoenix - GMT -07:00'), m('option[value="America/Port-au-Prince"]', 'America/Port-au-Prince - GMT -05:00'), m('option[value="America/Port_of_Spain"]', 'America/Port_of_Spain - GMT -04:00'), m('option[value="America/Porto_Velho"]', 'America/Porto_Velho - GMT -04:00'), m('option[value="America/Puerto_Rico"]', 'America/Puerto_Rico - GMT -04:00'), m('option[value="America/Rainy_River"]', 'America/Rainy_River - GMT -06:00'), m('option[value="America/Rankin_Inlet"]', 'America/Rankin_Inlet - GMT -06:00'), m('option[value="America/Recife"]', 'America/Recife - GMT -03:00'), m('option[value="America/Regina"]', 'America/Regina - GMT -06:00'), m('option[value="America/Resolute"]', 'America/Resolute - GMT -06:00'), m('option[value="America/Rio_Branco"]', 'America/Rio_Branco - GMT -05:00'), m('option[value="America/Santa_Isabel"]', 'America/Santa_Isabel - GMT -08:00'), m('option[value="America/Santarem"]', 'America/Santarem - GMT -04:00'), m('option[value="America/Santiago"]', 'America/Santiago - GMT -03:00'), m('option[value="America/Santo_Domingo"]', 'America/Santo_Domingo - GMT -04:30'), m('option[value="America/Sao_Paulo"]', 'America/Sao_Paulo - GMT -03:00'), m('option[value="America/Scoresbysund"]', 'America/Scoresbysund - GMT -02:00'), m('option[value="America/Sitka"]', 'America/Sitka - GMT -08:00'), m('option[value="America/St_Barthelemy"]', 'America/St_Barthelemy - GMT -04:00'), m('option[value="America/St_Johns"]', 'America/St_Johns - GMT -03:30'), m('option[value="America/St_Kitts"]', 'America/St_Kitts - GMT -04:00'), m('option[value="America/St_Lucia"]', 'America/St_Lucia - GMT -04:00'), m('option[value="America/St_Thomas"]', 'America/St_Thomas - GMT -04:00'), m('option[value="America/St_Vincent"]', 'America/St_Vincent - GMT -04:00'), m('option[value="America/Swift_Current"]', 'America/Swift_Current - GMT -07:00'), m('option[value="America/Tegucigalpa"]', 'America/Tegucigalpa - GMT -06:00'), m('option[value="America/Thule"]', 'America/Thule - GMT -04:00'), m('option[value="America/Thunder_Bay"]', 'America/Thunder_Bay - GMT -05:00'), m('option[value="America/Tijuana"]', 'America/Tijuana - GMT -08:00'), m('option[value="America/Toronto"]', 'America/Toronto - GMT -05:00'), m('option[value="America/Tortola"]', 'America/Tortola - GMT -04:00'), m('option[value="America/Vancouver"]', 'America/Vancouver - GMT -08:00'), m('option[value="America/Whitehorse"]', 'America/Whitehorse - GMT -08:00'), m('option[value="America/Winnipeg"]', 'America/Winnipeg - GMT -06:00'), m('option[value="America/Yakutat"]', 'America/Yakutat - GMT -09:00'), m('option[value="America/Yellowknife"]', 'America/Yellowknife - GMT -07:00'), m('option[value="Antarctica/Casey"]', 'Antarctica/Casey - GMT +08:00'), m('option[value="Antarctica/Davis"]', 'Antarctica/Davis - GMT +07:00'), m('option[value="Antarctica/DumontDUrville"]', 'Antarctica/DumontDUrville - GMT +10:00'), m('option[value="Antarctica/Macquarie"]', 'Antarctica/Macquarie - GMT +11:00'), m('option[value="Antarctica/Mawson"]', 'Antarctica/Mawson - GMT +06:00'), m('option[value="Antarctica/McMurdo"]', 'Antarctica/McMurdo - GMT +12:00'), m('option[value="Antarctica/Palmer"]', 'Antarctica/Palmer - GMT -03:00'), m('option[value="Antarctica/Rothera"]', 'Antarctica/Rothera - GMT +00:00'), m('option[value="Antarctica/Syowa"]', 'Antarctica/Syowa - GMT +03:00'), m('option[value="Antarctica/Troll"]', 'Antarctica/Troll - GMT +00:00'), m('option[value="Antarctica/Vostok"]', 'Antarctica/Vostok - GMT +06:00'), m('option[value="Arctic/Longyearbyen"]', 'Arctic/Longyearbyen - GMT +01:00'), m('option[value="Asia/Aden"]', 'Asia/Aden - GMT +03:00'), m('option[value="Asia/Almaty"]', 'Asia/Almaty - GMT +06:00'), m('option[value="Asia/Amman"]', 'Asia/Amman - GMT +02:00'), m('option[value="Asia/Anadyr"]', 'Asia/Anadyr - GMT +13:00'), m('option[value="Asia/Aqtau"]', 'Asia/Aqtau - GMT +05:00'), m('option[value="Asia/Aqtobe"]', 'Asia/Aqtobe - GMT +05:00'), m('option[value="Asia/Ashgabat"]', 'Asia/Ashgabat - GMT +05:00'), m('option[value="Asia/Baghdad"]', 'Asia/Baghdad - GMT +03:00'), m('option[value="Asia/Bahrain"]', 'Asia/Bahrain - GMT +04:00'), m('option[value="Asia/Baku"]', 'Asia/Baku - GMT +04:00'), m('option[value="Asia/Bangkok"]', 'Asia/Bangkok - GMT +07:00'), m('option[value="Asia/Beirut"]', 'Asia/Beirut - GMT +02:00'), m('option[value="Asia/Bishkek"]', 'Asia/Bishkek - GMT +06:00'), m('option[value="Asia/Brunei"]', 'Asia/Brunei - GMT +08:00'), m('option[value="Asia/Chita"]', 'Asia/Chita - GMT +09:00'), m('option[value="Asia/Choibalsan"]', 'Asia/Choibalsan - GMT +07:00'), m('option[value="Asia/Colombo"]', 'Asia/Colombo - GMT +05:30'), m('option[value="Asia/Damascus"]', 'Asia/Damascus - GMT +02:00'), m('option[value="Asia/Dhaka"]', 'Asia/Dhaka - GMT +06:00'), m('option[value="Asia/Dili"]', 'Asia/Dili - GMT +09:00'), m('option[value="Asia/Dubai"]', 'Asia/Dubai - GMT +04:00'), m('option[value="Asia/Dushanbe"]', 'Asia/Dushanbe - GMT +06:00'), m('option[value="Asia/Gaza"]', 'Asia/Gaza - GMT +02:00'), m('option[value="Asia/Hebron"]', 'Asia/Hebron - GMT +02:00'), m('option[value="Asia/Ho_Chi_Minh"]', 'Asia/Ho_Chi_Minh - GMT +07:00'), m('option[value="Asia/Hong_Kong"]', 'Asia/Hong_Kong - GMT +08:00'), m('option[value="Asia/Hovd"]', 'Asia/Hovd - GMT +06:00'), m('option[value="Asia/Irkutsk"]', 'Asia/Irkutsk - GMT +08:00'), m('option[value="Asia/Jakarta"]', 'Asia/Jakarta - GMT +07:00'), m('option[value="Asia/Jayapura"]', 'Asia/Jayapura - GMT +09:00'), m('option[value="Asia/Jerusalem"]', 'Asia/Jerusalem - GMT +02:00'), m('option[value="Asia/Kabul"]', 'Asia/Kabul - GMT +04:30'), m('option[value="Asia/Kamchatka"]', 'Asia/Kamchatka - GMT +12:00'), m('option[value="Asia/Karachi"]', 'Asia/Karachi - GMT +05:00'), m('option[value="Asia/Kathmandu"]', 'Asia/Kathmandu - GMT +05:30'), m('option[value="Asia/Khandyga"]', 'Asia/Khandyga - GMT +09:00'), m('option[value="Asia/Kolkata"]', 'Asia/Kolkata - GMT +05:30'), m('option[value="Asia/Krasnoyarsk"]', 'Asia/Krasnoyarsk - GMT +07:00'), m('option[value="Asia/Kuala_Lumpur"]', 'Asia/Kuala_Lumpur - GMT +07:30'), m('option[value="Asia/Kuching"]', 'Asia/Kuching - GMT +08:00'), m('option[value="Asia/Kuwait"]', 'Asia/Kuwait - GMT +03:00'), m('option[value="Asia/Macau"]', 'Asia/Macau - GMT +08:00'), m('option[value="Asia/Magadan"]', 'Asia/Magadan - GMT +11:00'), m('option[value="Asia/Makassar"]', 'Asia/Makassar - GMT +08:00'), m('option[value="Asia/Manila"]', 'Asia/Manila - GMT +08:00'), m('option[value="Asia/Muscat"]', 'Asia/Muscat - GMT +04:00'), m('option[value="Asia/Nicosia"]', 'Asia/Nicosia - GMT +02:00'), m('option[value="Asia/Novokuznetsk"]', 'Asia/Novokuznetsk - GMT +07:00'), m('option[value="Asia/Novosibirsk"]', 'Asia/Novosibirsk - GMT +07:00'), m('option[value="Asia/Omsk"]', 'Asia/Omsk - GMT +06:00'), m('option[value="Asia/Oral"]', 'Asia/Oral - GMT +05:00'), m('option[value="Asia/Phnom_Penh"]', 'Asia/Phnom_Penh - GMT +07:00'), m('option[value="Asia/Pontianak"]', 'Asia/Pontianak - GMT +08:00'), m('option[value="Asia/Pyongyang"]', 'Asia/Pyongyang - GMT +09:00'), m('option[value="Asia/Qatar"]', 'Asia/Qatar - GMT +04:00'), m('option[value="Asia/Qyzylorda"]', 'Asia/Qyzylorda - GMT +05:00'), m('option[value="Asia/Rangoon"]', 'Asia/Rangoon - GMT +06:30'), m('option[value="Asia/Riyadh"]', 'Asia/Riyadh - GMT +03:00'), m('option[value="Asia/Sakhalin"]', 'Asia/Sakhalin - GMT +11:00'), m('option[value="Asia/Samarkand"]', 'Asia/Samarkand - GMT +05:00'), m('option[value="Asia/Seoul"]', 'Asia/Seoul - GMT +09:00'), m('option[value="Asia/Shanghai"]', 'Asia/Shanghai - GMT +08:00'), m('option[value="Asia/Singapore"]', 'Asia/Singapore - GMT +07:30'), m('option[value="Asia/Srednekolymsk"]', 'Asia/Srednekolymsk - GMT +11:00'), m('option[value="Asia/Taipei"]', 'Asia/Taipei - GMT +08:00'), m('option[value="Asia/Tashkent"]', 'Asia/Tashkent - GMT +06:00'), m('option[value="Asia/Tbilisi"]', 'Asia/Tbilisi - GMT +04:00'), m('option[value="Asia/Tehran"]', 'Asia/Tehran - GMT +03:30'), m('option[value="Asia/Thimphu"]', 'Asia/Thimphu - GMT +05:30'), m('option[value="Asia/Tokyo"]', 'Asia/Tokyo - GMT +09:00'), m('option[value="Asia/Ulaanbaatar"]', 'Asia/Ulaanbaatar - GMT +07:00'), m('option[value="Asia/Urumqi"]', 'Asia/Urumqi - GMT +06:00'), m('option[value="Asia/Ust-Nera"]', 'Asia/Ust-Nera - GMT +09:00'), m('option[value="Asia/Vientiane"]', 'Asia/Vientiane - GMT +07:00'), m('option[value="Asia/Vladivostok"]', 'Asia/Vladivostok - GMT +10:00'), m('option[value="Asia/Yakutsk"]', 'Asia/Yakutsk - GMT +09:00'), m('option[value="Asia/Yekaterinburg"]', 'Asia/Yekaterinburg - GMT +05:00'), m('option[value="Asia/Yerevan"]', 'Asia/Yerevan - GMT +04:00'), m('option[value="Atlantic/Azores"]', 'Atlantic/Azores - GMT -01:00'), m('option[value="Atlantic/Bermuda"]', 'Atlantic/Bermuda - GMT -04:00'), m('option[value="Atlantic/Canary"]', 'Atlantic/Canary - GMT +00:00'), m('option[value="Atlantic/Cape_Verde"]', 'Atlantic/Cape_Verde - GMT -02:00'), m('option[value="Atlantic/Faroe"]', 'Atlantic/Faroe - GMT +00:00'), m('option[value="Atlantic/Madeira"]', 'Atlantic/Madeira - GMT +00:00'), m('option[value="Atlantic/Reykjavik"]', 'Atlantic/Reykjavik - GMT +00:00'), m('option[value="Atlantic/South_Georgia"]', 'Atlantic/South_Georgia - GMT -02:00'), m('option[value="Atlantic/St_Helena"]', 'Atlantic/St_Helena - GMT +00:00'), m('option[value="Atlantic/Stanley"]', 'Atlantic/Stanley - GMT -04:00'), m('option[value="Australia/Adelaide"]', 'Australia/Adelaide - GMT +09:30'), m('option[value="Australia/Brisbane"]', 'Australia/Brisbane - GMT +10:00'), m('option[value="Australia/Broken_Hill"]', 'Australia/Broken_Hill - GMT +09:30'), m('option[value="Australia/Currie"]', 'Australia/Currie - GMT +10:00'), m('option[value="Australia/Darwin"]', 'Australia/Darwin - GMT +09:30'), m('option[value="Australia/Eucla"]', 'Australia/Eucla - GMT +08:45'), m('option[value="Australia/Hobart"]', 'Australia/Hobart - GMT +11:00'), m('option[value="Australia/Lindeman"]', 'Australia/Lindeman - GMT +10:00'), m('option[value="Australia/Lord_Howe"]', 'Australia/Lord_Howe - GMT +10:00'), m('option[value="Australia/Melbourne"]', 'Australia/Melbourne - GMT +10:00'), m('option[value="Australia/Perth"]', 'Australia/Perth - GMT +08:00'), m('option[value="Australia/Sydney"]', 'Australia/Sydney - GMT +10:00'), m('option[value="Europe/Amsterdam"]', 'Europe/Amsterdam - GMT +01:00'), m('option[value="Europe/Andorra"]', 'Europe/Andorra - GMT +01:00'), m('option[value="Europe/Athens"]', 'Europe/Athens - GMT +02:00'), m('option[value="Europe/Belgrade"]', 'Europe/Belgrade - GMT +01:00'), m('option[value="Europe/Berlin"]', 'Europe/Berlin - GMT +01:00'), m('option[value="Europe/Bratislava"]', 'Europe/Bratislava - GMT +01:00'), m('option[value="Europe/Brussels"]', 'Europe/Brussels - GMT +01:00'), m('option[value="Europe/Bucharest"]', 'Europe/Bucharest - GMT +02:00'), m('option[value="Europe/Budapest"]', 'Europe/Budapest - GMT +01:00'), m('option[value="Europe/Busingen"]', 'Europe/Busingen - GMT +01:00'), m('option[value="Europe/Chisinau"]', 'Europe/Chisinau - GMT +03:00'), m('option[value="Europe/Copenhagen"]', 'Europe/Copenhagen - GMT +01:00'), m('option[value="Europe/Dublin"]', 'Europe/Dublin - GMT +01:00'), m('option[value="Europe/Gibraltar"]', 'Europe/Gibraltar - GMT +01:00'), m('option[value="Europe/Guernsey"]', 'Europe/Guernsey - GMT +01:00'), m('option[value="Europe/Helsinki"]', 'Europe/Helsinki - GMT +02:00'), m('option[value="Europe/Isle_of_Man"]', 'Europe/Isle_of_Man - GMT +01:00'), m('option[value="Europe/Istanbul"]', 'Europe/Istanbul - GMT +02:00'), m('option[value="Europe/Jersey"]', 'Europe/Jersey - GMT +01:00'), m('option[value="Europe/Kaliningrad"]', 'Europe/Kaliningrad - GMT +03:00'), m('option[value="Europe/Kiev"]', 'Europe/Kiev - GMT +03:00'), m('option[value="Europe/Lisbon"]', 'Europe/Lisbon - GMT +01:00'), m('option[value="Europe/Ljubljana"]', 'Europe/Ljubljana - GMT +01:00'), m('option[value="Europe/London"]', 'Europe/London - GMT +01:00'), m('option[value="Europe/Luxembourg"]', 'Europe/Luxembourg - GMT +01:00'), m('option[value="Europe/Madrid"]', 'Europe/Madrid - GMT +01:00'), m('option[value="Europe/Malta"]', 'Europe/Malta - GMT +01:00'), m('option[value="Europe/Mariehamn"]', 'Europe/Mariehamn - GMT +02:00'), m('option[value="Europe/Minsk"]', 'Europe/Minsk - GMT +03:00'), m('option[value="Europe/Monaco"]', 'Europe/Monaco - GMT +01:00'), m('option[value="Europe/Moscow"]', 'Europe/Moscow - GMT +03:00'), m('option[value="Europe/Oslo"]', 'Europe/Oslo - GMT +01:00'), m('option[value="Europe/Paris"]', 'Europe/Paris - GMT +01:00'), m('option[value="Europe/Podgorica"]', 'Europe/Podgorica - GMT +01:00'), m('option[value="Europe/Prague"]', 'Europe/Prague - GMT +01:00'), m('option[value="Europe/Riga"]', 'Europe/Riga - GMT +03:00'), m('option[value="Europe/Rome"]', 'Europe/Rome - GMT +01:00'), m('option[value="Europe/Samara"]', 'Europe/Samara - GMT +04:00'), m('option[value="Europe/San_Marino"]', 'Europe/San_Marino - GMT +01:00'), m('option[value="Europe/Sarajevo"]', 'Europe/Sarajevo - GMT +01:00'), m('option[value="Europe/Simferopol"]', 'Europe/Simferopol - GMT +03:00'), m('option[value="Europe/Skopje"]', 'Europe/Skopje - GMT +01:00'), m('option[value="Europe/Sofia"]', 'Europe/Sofia - GMT +02:00'), m('option[value="Europe/Stockholm"]', 'Europe/Stockholm - GMT +01:00'), m('option[value="Europe/Tallinn"]', 'Europe/Tallinn - GMT +03:00'), m('option[value="Europe/Tirane"]', 'Europe/Tirane - GMT +01:00'), m('option[value="Europe/Uzhgorod"]', 'Europe/Uzhgorod - GMT +03:00'), m('option[value="Europe/Vaduz"]', 'Europe/Vaduz - GMT +01:00'), m('option[value="Europe/Vatican"]', 'Europe/Vatican - GMT +01:00'), m('option[value="Europe/Vienna"]', 'Europe/Vienna - GMT +01:00'), m('option[value="Europe/Vilnius"]', 'Europe/Vilnius - GMT +03:00'), m('option[value="Europe/Volgograd"]', 'Europe/Volgograd - GMT +04:00'), m('option[value="Europe/Warsaw"]', 'Europe/Warsaw - GMT +01:00'), m('option[value="Europe/Zagreb"]', 'Europe/Zagreb - GMT +01:00'), m('option[value="Europe/Zaporozhye"]', 'Europe/Zaporozhye - GMT +03:00'), m('option[value="Europe/Zurich"]', 'Europe/Zurich - GMT +01:00'), m('option[value="Indian/Antananarivo"]', 'Indian/Antananarivo - GMT +03:00'), m('option[value="Indian/Chagos"]', 'Indian/Chagos - GMT +05:00'), m('option[value="Indian/Christmas"]', 'Indian/Christmas - GMT +07:00'), m('option[value="Indian/Cocos"]', 'Indian/Cocos - GMT +06:30'), m('option[value="Indian/Comoro"]', 'Indian/Comoro - GMT +03:00'), m('option[value="Indian/Kerguelen"]', 'Indian/Kerguelen - GMT +05:00'), m('option[value="Indian/Mahe"]', 'Indian/Mahe - GMT +04:00'), m('option[value="Indian/Maldives"]', 'Indian/Maldives - GMT +05:00'), m('option[value="Indian/Mauritius"]', 'Indian/Mauritius - GMT +04:00'), m('option[value="Indian/Mayotte"]', 'Indian/Mayotte - GMT +03:00'), m('option[value="Indian/Reunion"]', 'Indian/Reunion - GMT +04:00'), m('option[value="Pacific/Apia"]', 'Pacific/Apia - GMT -11:00'), m('option[value="Pacific/Auckland"]', 'Pacific/Auckland - GMT +12:00'), m('option[value="Pacific/Chatham"]', 'Pacific/Chatham - GMT +12:45'), m('option[value="Pacific/Chuuk"]', 'Pacific/Chuuk - GMT +10:00'), m('option[value="Pacific/Easter"]', 'Pacific/Easter - GMT -06:00'), m('option[value="Pacific/Efate"]', 'Pacific/Efate - GMT +11:00'), m('option[value="Pacific/Enderbury"]', 'Pacific/Enderbury - GMT -12:00'), m('option[value="Pacific/Fakaofo"]', 'Pacific/Fakaofo - GMT -11:00'), m('option[value="Pacific/Fiji"]', 'Pacific/Fiji - GMT +12:00'), m('option[value="Pacific/Funafuti"]', 'Pacific/Funafuti - GMT +12:00'), m('option[value="Pacific/Galapagos"]', 'Pacific/Galapagos - GMT -05:00'), m('option[value="Pacific/Gambier"]', 'Pacific/Gambier - GMT -09:00'), m('option[value="Pacific/Guadalcanal"]', 'Pacific/Guadalcanal - GMT +11:00'), m('option[value="Pacific/Guam"]', 'Pacific/Guam - GMT +10:00'), m('option[value="Pacific/Honolulu"]', 'Pacific/Honolulu - GMT -10:00'), m('option[value="Pacific/Johnston"]', 'Pacific/Johnston - GMT -10:00'), m('option[value="Pacific/Kiritimati"]', 'Pacific/Kiritimati - GMT -10:40'), m('option[value="Pacific/Kosrae"]', 'Pacific/Kosrae - GMT +12:00'), m('option[value="Pacific/Kwajalein"]', 'Pacific/Kwajalein - GMT -12:00'), m('option[value="Pacific/Majuro"]', 'Pacific/Majuro - GMT +12:00'), m('option[value="Pacific/Marquesas"]', 'Pacific/Marquesas - GMT -09:30'), m('option[value="Pacific/Midway"]', 'Pacific/Midway - GMT -11:00'), m('option[value="Pacific/Nauru"]', 'Pacific/Nauru - GMT +11:30'), m('option[value="Pacific/Niue"]', 'Pacific/Niue - GMT -11:30'), m('option[value="Pacific/Norfolk"]', 'Pacific/Norfolk - GMT +11:30'), m('option[value="Pacific/Noumea"]', 'Pacific/Noumea - GMT +11:00'), m('option[value="Pacific/Pago_Pago"]', 'Pacific/Pago_Pago - GMT -11:00'), m('option[value="Pacific/Palau"]', 'Pacific/Palau - GMT +09:00'), m('option[value="Pacific/Pitcairn"]', 'Pacific/Pitcairn - GMT -08:30'), m('option[value="Pacific/Pohnpei"]', 'Pacific/Pohnpei - GMT +11:00'), m('option[value="Pacific/Port_Moresby"]', 'Pacific/Port_Moresby - GMT +10:00'), m('option[value="Pacific/Rarotonga"]', 'Pacific/Rarotonga - GMT -10:30'), m('option[value="Pacific/Saipan"]', 'Pacific/Saipan - GMT +10:00'), m('option[value="Pacific/Tahiti"]', 'Pacific/Tahiti - GMT -10:00'), m('option[value="Pacific/Tarawa"]', 'Pacific/Tarawa - GMT +12:00'), m('option[value="Pacific/Tongatapu"]', 'Pacific/Tongatapu - GMT +13:00'), m('option[value="Pacific/Wake"]', 'Pacific/Wake - GMT +12:00'), m('option[value="Pacific/Wallis"]', 'Pacific/Wallis - GMT +12:00'), m('option[value="UTC"]', 'UTC - GMT +00:00')]),
                        m('span.help-block', 'Set the system timezone.')
                     ])
                 ]),
                 //m('.form-group.form-actions', [
                 //    m('.col-sm-offset-2.col-sm-10', [
                 //        m('button.btn.btn-primary.btn-lg[name="save"][type="submit"][value="save"]', 'Apply settings')
                 //    ])
                 //]),
                 m('.form-group.form-actions', [
                   m('.col-sm-offset-2.col-sm-10', [
                       m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function (e) { settings.vm.cancel('environment'); } }, 'Cancel'),
                       m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function (e) { settings.vm.save('environment'); } }, 'Save and apply')
                   ])
                 ])
             ]),
             m('fieldset.form-horizontal', [
                 m('legend', 'RuneOS kernel settings'),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="i2smodule"]', 'Linux Kernel'),
                     m('.col-sm-10', [
                         m('select.selectpicker[data-style="btn-default btn-lg"][name="kernel"]', { style: { 'display': ' none' } }, [
                             m('option[selected=""][value="linux-arch-rpi_3.12.26-1-ARCH"]', 'Linux kernel 3.12.26-1   ARCH [RuneAudio v0.3-beta]'),
                             m('option[value="linux-rune-rpi_3.12.19-2-ARCH"]', 'Linux kernel 3.12.19-2   RUNE [RuneAudio v0.3-alpha]'),
                             m('option[value="linux-rune-rpi_3.6.11-18-ARCH+"]', 'Linux kernel 3.6.11-18   ARCH+ [RuneAudio v0.1-beta/v0.2-beta]'),
                             m('option[value="linux-rune-rpi_3.12.13-rt21_wosa"]', 'Linux kernel 3.12.13-rt   RUNE-RT [Wolfson Audio Card]')
                         ]),
                         m('.btn-group.bootstrap-select', [m('button.btn.dropdown-toggle.selectpicker.btn-default.btn-lg[data-toggle="dropdown"][title="Linux kernel 3.12.26-1&nbsp;&nbsp;&nbsp;ARCH&nbsp;[RuneAudio v0.3-beta]"][type="button"]', [m('span.filter-option.pull-left', 'Linux kernel 3.12.26-1   ARCH [RuneAudio v0.3-beta]'), ' ', m('span.caret')]), m('.dropdown-menu.open', [m('ul.dropdown-menu.inner.selectpicker[role="menu"]', [m('li.selected[rel="0"]', [m('a[tabindex="0"]', [m('span.text', 'Linux kernel 3.12.26-1   ARCH [RuneAudio v0.3-beta]'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="1"]', [m('a[tabindex="0"]', [m('span.text', 'Linux kernel 3.12.19-2   RUNE [RuneAudio v0.3-alpha]'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="2"]', [m('a[tabindex="0"]', [m('span.text', 'Linux kernel 3.6.11-18   ARCH+ [RuneAudio v0.1-beta/v0.2-beta]'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="3"]', [m('a[tabindex="0"]', [m('span.text', 'Linux kernel 3.12.13-rt   RUNE-RT [Wolfson Audio Card]'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])])])])]),
                         m('span.help-block', ['Switch Linux Kernel version (REBOOT REQUIRED). ', m('strong', 'Linux kernel 3.12.26-1'), ' is the default kernel in the current release, ', m('strong', 'Linux kernel 3.12.19-2'), ' is the kernel used in RuneAudio v0.3-alpha, ', m('strong', 'Linux kernel 3.6.11-18'), ' is the kernel used in RuneAudio v0.1-beta/v0.2-beta (it has no support for I²S), ', m('strong', 'Linux kernel 3.12.13-rt'), ' is an EXPERIMENTAL kernel (not suitable for all configurations), it is optimized for ', m('strong', 'Wolfson Audio Card'), ' support and it is the default option for that type of soundcard.'])
                     ]),
                     m('label.control-label.col-sm-2[for="i2smodule"]', 'I²S kernel modules'),
                     m('.col-sm-10', [
                         m('select.selectpicker[data-style="btn-default btn-lg"][name="i2smodule"]', { style: { 'display': ' none' } }, [
                             m('option[value="none"]', 'I²S disabled (default)'),
                             m('option[value="berrynos"]', 'G2Labs BerryNOS'),
                             m('option[value="berrynosmini"]', 'G2Labs BerryNOS mini'),
                             m('option[value="hifiberrydac"]', 'HiFiBerry DAC'),
                             m('option[value="hifiberrydacplus"]', 'HiFiBerry DAC+'),
                             m('option[value="hifiberrydigi"]', 'HiFiBerry Digi / Digi+'),
                             m('option[value="iqaudiopidac"]', 'IQaudIO Pi-DAC / Pi-DAC+'),
                             m('option[value="raspyplay3"]', 'RaspyPlay3'),
                             m('option[value="raspyplay4"]', 'RaspyPlay4'),
                             m('option[selected=""][value="transducer"]', 'Transducer')
                         ]),
                         m('.btn-group.bootstrap-select', [m('button.btn.dropdown-toggle.selectpicker.btn-default.btn-lg[data-toggle="dropdown"][title="Transducer"][type="button"]', [m('span.filter-option.pull-left', 'Transducer'), ' ', m('span.caret')]), m('.dropdown-menu.open', [m('ul.dropdown-menu.inner.selectpicker[role="menu"]', [m('li[rel="0"]', [m('a[tabindex="0"]', [m('span.text', 'I²S disabled (default)'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="1"]', [m('a[tabindex="0"]', [m('span.text', 'G2Labs BerryNOS'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="2"]', [m('a[tabindex="0"]', [m('span.text', 'G2Labs BerryNOS mini'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="3"]', [m('a[tabindex="0"]', [m('span.text', 'HiFiBerry DAC'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="4"]', [m('a[tabindex="0"]', [m('span.text', 'HiFiBerry DAC+'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="5"]', [m('a[tabindex="0"]', [m('span.text', 'HiFiBerry Digi / Digi+'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="6"]', [m('a[tabindex="0"]', [m('span.text', 'IQaudIO Pi-DAC / Pi-DAC+'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="7"]', [m('a[tabindex="0"]', [m('span.text', 'RaspyPlay3'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li[rel="8"]', [m('a[tabindex="0"]', [m('span.text', 'RaspyPlay4'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])]), m('li.selected[rel="9"]', [m('a[tabindex="0"]', [m('span.text', 'Transducer'), m('i.glyphicon.glyphicon-ok.icon-ok.check-mark')])])])])]),
                         m('span.help-block', ['Enable I²S output selecting one of the available sets of modules, specific for each hardware. Once set, the output interface will appear in the ', m('a[href="/mpd/"]', 'MPD configuration select menu'), ', and modules will also auto-load from the next reboot.'])
                     ])
                 ]),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="orionprofile"]', 'Sound Signature (optimization profiles)'),
                     m('.col-sm-10', [
                         m('select.selectpicker[data-style="btn-default btn-lg"][name="orionprofile"]', mithril.bind2(settings.vm.data, "orionprofile", helpers.selectpicker), [
                             m('option[value="default"]', 'ArchLinux default'),
                             m('option[value="RuneAudio"]', 'RuneAudio'),
                             m('option[selected=""][value="ACX"]', 'ACX'),
                             m('option[value="Orion"]', 'Orion'),
                             m('option[value="OrionV2"]', 'OrionV2'),
                             m('option[value="OrionV3_berrynosmini"]', 'OrionV3 - (BerryNOS-mini)'),
                             m('option[value="OrionV3_iqaudio"]', 'OrionV3 - (IQaudioPi-DAC)'),
                             m('option[value="Um3ggh1U"]', 'Um3ggh1U')
                         ]),
                         m('span.help-block', ['These profiles include a set of performance tweaks that act on some system kernel parameters.\n                    It does not have anything to do with DSPs or other sound effects: the output is kept untouched (bit perfect).\n                    It happens that these parameters introduce an audible impact on the overall sound quality, acting on kernel latency parameters (and probably on the amount of overall \n                    ', m('a[href="http://www.thewelltemperedcomputer.com/KB/BitPerfectJitter.htm"][target="_blank"][title="Bit Perfect Jitter by Vincent Kars"]', 'jitter'), ').\n                    Sound results may vary depending on where music is listened, so choose according to your personal taste.\n                    (If you can"t hear any tangible differences... nevermind, just stick to the default settings.)'])
                     ])
                 ]),
                 m('.form-group.form-actions', [
                     m('.col-sm-offset-2.col-sm-10', [
                         m('button.btn.btn-primary.btn-lg[type="submit"]', 'Apply settings')
                     ])
                 ]),
             m('fieldset.form-horizontal[id="features-management"]', [
                 m('legend', 'Features management'),
                 m('p', 'Enable/disable optional modules that best suit your needs. Disabling unusued features will free system resources and might improve the overall performance.'),
                 m('[id="airplayBox"]', [
                     m('.form-group', [
                         m('label.control-label.col-sm-2[for="airplay"]', 'AirPlay'),
                         m('.col-sm-10', [
                             //m('label.switch-light.well[onclick=""]', [
                             //	m('input[data-parsley-id="0451"][data-parsley-multiple="featuresairplayenable"][id="airplay"][name="features[airplay][enable]"][type="checkbox"][value="1"]'),
                             //	m('span', [m('span', 'OFF'), m('span', 'ON')]),
                             //	m('a.btn.btn-primary')
                             //]),
                             //m('ul.parsley-errors-list[id="parsley-id-multiple-featuresairplayenable"]'),
                             m('span.help-block', 'Toggle the capability of receiving wireless streaming of audio via AirPlay protocol')
                         ])
                     ]),
                     m('.hide[id="airplayName"]', [
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="airplay-name"]', 'AirPlay name'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[data-parsley-id="0928"][data-trigger="change"][id="airplay_name"][name="features[airplay][name]"][placeholder="runeaudio"][type="text"][value="RuneAudio"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-0928"]'),
                                 m('span.help-block', 'AirPlay broadcast name')
                             ])
                         ])
                     ])
                 ]),
                 m('[id="spotifyBox"]', [
                     m('.form-group', [
                         m('label.control-label.col-sm-2[for="spotify"]', 'Spotify'),
                         m('.col-sm-10', [
                             m('label.switch-light.well[onclick=""]', [
                                 m('input[data-parsley-id="3701"][data-parsley-multiple="featuresspotifyenable"][id="spotify"][name="features[spotify][enable]"][type="checkbox"][value="1"]'),
                                 m('span', [m('span', 'OFF'), m('span', 'ON')]),
                                 m('a.btn.btn-primary.')
                             ]),
                             m('ul.parsley-errors-list[id="parsley-id-multiple-featuresspotifyenable"]'),
                             m('span.help-block', ['Enable Spotify client [EXPERIMENTAL]. You must have a ', m('strong', [m('a[href="https://www.spotify.com/uk/premium/"][target="_blank"]', 'Spotify PREMIUM')]), ' account.'])
                         ])
                     ]),
                     m('.hide[id="spotifyAuth"]', [
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="spotify-usr"]', 'Username'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="0174"][data-trigger="change"][id="spotify_user"][name="features[spotify][user]"][placeholder="user"][type="text"][value="user"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-0174"]'),
                                 m('span.help-block', ['Insert your Spotify ', m('i', 'username')])
                             ])
                         ]),
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="spotify-pasw"]', 'Password'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="0985"][id="spotify_pass"][name="features[spotify][pass]"][placeholder="pass"][type="password"][value="pass"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-0985"]'),
                                 m('span.help-block', ['Insert your Spotify ', m('i', 'password'), ' (case sensitive)'])
                             ])
                         ])
                     ])
                 ]),
                 m('[id="dlnaBox"]', [
                     m('.form-group', [
                         m('label.control-label.col-sm-2[for="dlna"]', 'UPnP / DLNA'),
                         m('.col-sm-10', [
                             m('label.switch-light.well[onclick=""]', [
                                 m('input[data-parsley-id="1837"][data-parsley-multiple="featuresdlnaenable"][id="dlna"][name="features[dlna][enable]"][type="checkbox"][value="1"]'),
                                 m('span', [m('span', 'OFF'), m('span', 'ON')]),
                                 m('a.btn.btn-primary')
                             ]),
                             m('ul.parsley-errors-list[id="parsley-id-multiple-featuresdlnaenable"]'),
                             m('span.help-block', 'Toggle the capability of receiving wireless streaming of audio via UPnP / DLNA protocol')
                         ])
                     ]),
                     m('.hide[id="dlnaName"]', [
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="dlna-name"]', 'UPnP / DLNA name'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[data-parsley-id="8193"][data-trigger="change"][id="dlna_name"][name="features[dlna][name]"][placeholder="runeaudio"][type="text"][value="RuneAudio"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-8193"]'),
                                 m('span.help-block', 'UPnP / DLNA broadcast name')
                             ])
                         ])
                     ])
                 ]),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="udevil"]', 'USB Automount'),
                     m('.col-sm-10', [
                         m('label.switch-light.well[onclick=""]', [
                             m('input[data-parsley-id="1024"][data-parsley-multiple="featuresudevil"][name="features[udevil]"][type="checkbox"][value="1"]'),
                             m('span', [m('span', 'OFF'), m('span', 'ON')]),
                             m('a.btn.btn-primary')
                         ]),
                         m('ul.parsley-errors-list[id="parsley-id-multiple-featuresudevil"]'),
                         m('span.help-block', 'Toggle automount for USB drives')
                     ])
                 ]),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="coverart"]', 'Display album cover'),
                     m('.col-sm-10', [
                         m('label.switch-light.well[onclick=""]', [
                             m('input[checked="checked"][data-parsley-id="5818"][data-parsley-multiple="featurescoverart"][name="features[coverart]"][type="checkbox"][value="1"]'),
                             m('span', [m('span', 'OFF'), m('span', 'ON')]),
                             m('a.btn.btn-primary')
                         ]),
                         m('ul.parsley-errors-list[id="parsley-id-multiple-featurescoverart"]'),
                         m('span.help-block', 'Toggle the display of album art on the Playback main screen')
                     ])
                 ]),
                 m('[id="lastfmBox"]', [
                     m('.form-group', [
                         m('label.control-label.col-sm-2[for="lastfm"]', [m('i.fa.fa.fa-lastfm-square'), ' Last.fm']),
                         m('.col-sm-10', [
                             m('label.switch-light.well[onclick=""]', [
                                 m('input[data-parsley-id="6913"][data-parsley-multiple="featureslastfmenable"][id="scrobbling-lastfm"][name="features[lastfm][enable]"][type="checkbox"][value="1"]'),
                                 m('span', [m('span', 'OFF'), m('span', 'ON')]),
                                 m('a.btn.btn-primary')
                             ]),
                             m('ul.parsley-errors-list[id="parsley-id-multiple-featureslastfmenable"]'),
                             m('span.help-block', 'Send to Last.fm informations about the music you are listening to (requires a Last.fm account)')
                         ])
                     ]),
                     m('.hide[id="lastfmAuth"]', [
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="lastfm-usr"]', 'Username'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="9931"][data-trigger="change"][id="lastfm_user"][name="features[lastfm][user]"][placeholder="user"][type="text"][value="user"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-9931"]'),
                                 m('span.help-block', ['Insert your Last.fm ', m('i', 'username')])
                             ])
                         ]),
                         m('.form-group', [
                             m('label.control-label.col-sm-2[for="lastfm-pasw"]', 'Password'),
                             m('.col-sm-10', [
                                 m('input.form-control.input-lg[autocomplete="off"][data-parsley-id="2505"][id="lastfm_pass"][name="features[lastfm][pass]"][placeholder="pass"][type="password"][value="pass"]'),
                                 m('ul.parsley-errors-list[id="parsley-id-2505"]'),
                                 m('span.help-block', ['Insert your Last.fm ', m('i', 'password'), ' (case sensitive)'])
                             ])
                         ])
                     ])
                 ]),
                 m('.form-group.form-actions', [
                     m('.col-sm-offset-2.col-sm-10', [
                         m('button.btn.btn-primary.btn-lg[name="features[submit]"][type="submit"][value="1"]', 'apply settings')
                     ])
                 ])
             ]),
             m('fieldset.form-horizontal', [
                 m('legend', 'Compatibility fixes'),
                 m('p', 'For people suffering problems with some receivers and DACs.'),
                 m('.form-group', [
                     m('label.control-label.col-sm-2[for="cmediafix"]', 'CMedia fix'),
                     m('.col-sm-10', [
                         m('label.switch-light.well[onclick=""]', [
                             m('input[name="cmediafix[1]"][type="checkbox"][value="1"]'),
                             m('span', [m('span', 'OFF'), m('span', 'ON')]),
                             m('a.btn.btn-primary')
                         ]),
                         m('span.help-block', ['For those who have a CM6631 receiver and experiment issues (noise, crackling) between tracks with different sample rates and/or bit depth.', m('br'), ' \n                    A \'dirty\' fix that should avoid the problem, do NOT use if everything works normally.'])
                     ])
                 ]),
                 m('.form-group.form-actions', [
                     m('.col-sm-offset-2.col-sm-10', [
                         m('button.btn.btn-primary.btn-lg[name="cmediafix[0]"][type="submit"][value="1"]', 'Apply fixes')
                     ])
                 ])
             ]),
             m('fieldset.form-horizontal', [
                 m('legend', 'Backup / Restore configuration'),
                 m('p', 'Transfer settings between multiple RuneAudio installations, saving time during new/upgrade installations.'),
                 m('.form-group', [
                     m('label.control-label.col-sm-2', 'Backup player config'),
                     m('.col-sm-10', [
                         m('input.btn.btn-primary.btn-lg[id="syscmd-backup"][name="syscmd"][type="submit"][value="backup"]'),
                         m('span.help-block', 'NOTE: restore feature will come in 0.4 release.')
                     ])
                 ])
             ])
             ])];
};