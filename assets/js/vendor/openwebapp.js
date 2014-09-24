/* 
 Open Web App install support for Firefox browser based
 by Mte90
 */ 

document.addEventListener("DOMContentLoaded", function() {
	//mozApps used for the open web app and with the user agent check
	if (navigator.mozApps) {
		var checkIfInstalled = navigator.mozApps.getSelf();
		checkIfInstalled.onsuccess = function() {
			if (!checkIfInstalled.result) {
				var m_app = navigator.mozApps.install('http://' + document.location.hostname + '/manifest.webapp');
				m_app.onsuccess = function(data) {
					console.log("Install successful");
				};
				m_app.onerror = function() {
					console.log("Install failed\n\n:" + m_app.error.name);
				};
			}
		};
		checkIfInstalled.onerror = function() {
			console.log("Check install failed\n\n:" + checkIfInstalled.error.name);
		};
	}
});