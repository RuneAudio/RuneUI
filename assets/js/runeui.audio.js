window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};

window.audio = new mithril.RuneModule('/audio');

// 'Audio' view
audio.view = function (ctrl) {
    return [m('h1', 'Audio Configuration'),
   m('fieldset', [
       m('legend', 'Audio Output'),
           m('.form-group', [
               mithril.createLabel('audio-output-interface', 'Audio output interface'),
               m('.col-sm-10', [
                   mithril.createSelect('audio-output-interface', audio.vm.data, 'ao', 'acards', 'name', 'extlabel', helpers.selectpicker),
                   m('span.help-block', ['This is the current output interface.'
                   ])
               ])
           ]),
       m('.form-group.form-actions', [
           m('.col-sm-offset-2.col-sm-10', [
               m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function (e) { audio.vm.cancel('ao'); } }, 'Cancel'),
               m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function (e) { audio.vm.save('ao'); } }, 'Save and apply')
           ])
       ])
   ]),
   m('fieldset', [
       m('legend', 'Volume control'),
       m('.form-group', [
           m('label.col-sm-2.control-label[for="mixer-type"]', 'Volume control'),
           m('.col-sm-10', [
               m('select[data-style="btn-default btn-lg"][id="mixer-type"]',
                   //{ config: helpers.selectpicker, onchange: m.withAttr('value', function (value) { mpd.data.conf.mixer_type = value }), value: mpd.data.conf.mixer_type }
                   mithril.createInput(audio.vm.data.conf, 'mixer_type', helpers.selectpicker), [
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
       ]),
       m('.form-group.form-actions', [
           m('.col-sm-offset-2.col-sm-10', [
               m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function (e) { audio.vm.cancel('conf'); } }, 'Cancel'),
               m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function (e) { audio.vm.save('conf'); } }, 'Save and apply')
           ])
       ])
   ]),
   m('fieldset', [
       m('legend', 'Sound Signature'),
       m('.form-group', [
             m('label.control-label.col-sm-2[for="orionprofile"]', 'Sound Signature (optimization profiles)'),
             m('.col-sm-10', [
                 m('select.selectpicker[data-style="btn-default btn-lg"]', mithril.createInput(audio.vm.data, "orionprofile", helpers.selectpicker), [
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
       ])]),
        m('.form-group.form-actions', [
            m('.col-sm-offset-2.col-sm-10', [
                m('button.btn.btn-default.btn-lg[type="button"]', { onclick: function (e) { audio.vm.cancel('orionprofile'); } }, 'Cancel'),
                m('button.btn.btn-primary.btn-lg[type="button"]', { onclick: function (e) { audio.vm.save('orionprofile'); } }, 'Save and apply')
            ])
        ])
    ];
};