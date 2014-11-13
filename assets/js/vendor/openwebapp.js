/* 
 Open Web App install support for Firefox browser based
 by Mte90
 */
document.addEventListener("DOMContentLoaded", function() {
    //mozApps used for the open web app and with the user agent check
    //Check with cookie if the alert was showed for not annoying the user
    if (locationbar.visible) {
        if (navigator.mozApps && document.cookie.replace(/(?:(?:^|.*;\s*)owa\s*\=\s*([^;]*).*$)|^.*$/, "$1") !== "false") {
            var customModal = $('<div id="owa-modal" class="modal fade" aria-labelledby="modal-owa" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button></div><div class="modal-body"><p>Do you want install Rune Audio as Web Apps in your device/PC?</p></div><div class="modal-footer"><button class="btn btn-default btn-lg" data-dismiss="modal" id="owa-yes">Yes</button><button class="btn btn-default btn-lg" data-dismiss="modal" id="owa-no">No</button></div></div></div></div>');
            $('body').append(customModal);
            $('#owa-modal').modal('show').on('hidden', function() {
                $('#owa-modal').remove();
            });
            
            $('#owa-yes').click(function() {
                var checkIfInstalled = navigator.mozApps.getSelf();
                checkIfInstalled.onsuccess = function() {
                    if (!checkIfInstalled.result) {
                        var m_app = navigator.mozApps.install('http://' + document.location.hostname + '/manifest.webapp');
                        var now = new Date;
                        m_app.onsuccess = function(data) {
                            console.log("Install successful");
                            now.setDate(now.getDate() + 365);
                            document.cookie = 'owa=false; expires=' + now.toGMTString() + '; path=/';
                        };
                        m_app.onerror = function() {
                            console.log("Install failed\n\n:" + m_app.error.name);
                            now.setDate(now.getDate() + 365);
                            document.cookie = 'owa=false; expires=' + now.toGMTString() + '; path=/';
                        };
                    }
                };
                checkIfInstalled.onerror = function() {
                    console.log("Check install failed\n\n:" + checkIfInstalled.error.name);
                };
            });
            
            $('#owa-no').click(function() {
                var now = new Date;
                now.setDate(now.getDate() + 30);
                document.cookie = 'owa=false; expires=' + now.toGMTString() + '; path=/';
                self.teardown();
            });
        }
    }
    if (!locationbar.visible) {
        // Click event handler
        var handleClickEvent = function(evt) {
            // Only external links allowed
            // Add target when no named target given
            var target = evt.target.getAttribute('target');
            if (!target || target.substr(0, 1) === '_') {
                evt.target.setAttribute('target', '_blank');
            }
        };
        // Delegate all clicks on document body
        // Selector matches external links, but allows https/http switching
        var _link = document.querySelectorAll("a[href^='http']:not([href*='://" + location.host + "']):not([target='_blank'])");
        for (var _i = 0; _i < _link.length; _i++) {
            _link[_i].addEventListener('click', handleClickEvent, false);
        }
    }
});