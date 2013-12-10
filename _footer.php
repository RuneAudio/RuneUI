<form class="form-horizontal" action="settings.php" method="post">
	<div id="poweroff-modal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="poweroff-modal-label" aria-hidden="true">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
			<h3 id="poweroff-modal-label">Turn off the player</h3>
		</div>
		<div class="modal-body">
			<button id="syscmd-poweroff" name="syscmd" value="poweroff" class="btn btn-primary btn-large btn-block"><i class="icon-power-off sx"></i> Power off</button>
			<button id="syscmd-reboot" name="syscmd" value="reboot" class="btn btn-primary btn-large btn-block"><i class="icon-refresh sx"></i> Reboot</button>
		</div>
		<div class="modal-footer">
			<button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
		</div>
	</div>
</form>
<!-- loader -->
<div id="loader"><div id="loaderbg"></div><div id="loadercontent"><i class="icon-refresh icon-spin"></i>connecting...</div></div>
<script src="js/jquery-1.8.2.min.js"></script>
<script src="js/jquery-ui-1.10.0.custom.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/bootstrap-select.min.js"></script>
<script src="js/notify.js"></script>
<script src="js/jquery.countdown.js"></script>
<script src="js/jquery.countdown-it.js"></script>
<script src="js/jquery.scrollTo.min.js"></script>
<script src="js/player_lib.js"></script>
<?php if ($sezione == 'index') { ?>
<script src="js/jquery.knob.js"></script>
<script src="js/bootstrap-contextmenu.js"></script>
<script src="js/jquery.pnotify.min.js"></script>
<script src="js/scripts-playback.js"></script>
<?php } else { ?>
<!--<script src="js/jquery.dropkick-1.0.0.js"></script>-->
<script src="js/custom_checkbox_and_radio.js"></script>
<script src="js/custom_radio.js"></script>
<script src="js/jquery.tagsinput.js"></script>
<script src="js/jquery.placeholder.js"></script>
<script src="js/parsley.min.js"></script>
<script src="js/i18n/messages.it.js" type="text/javascript"></script>
<script src="js/application.js"></script>
<script src="js/scripts-configuration.js"></script>
<script src="js/jquery.pnotify.min.js"></script>
<script src="js/bootstrap-fileupload.js"></script>
<?php } ?>
<!--[if lt IE 8]>
<script src="js/icon-font-ie7.js"></script>
<script src="js/icon-font-ie7-24.js"></script>
<![endif]-->
<?php
// write backend response on UI Notify popup
if (isset($_SESSION['notify']) && $_SESSION['notify'] != '') {
sleep(1);
ui_notify($_SESSION['notify']);
session_start();
$_SESSION['notify'] = '';
session_write_close();
}
?>
<div id="debug" <?php if ($_SESSION['hiddendebug'] == 1 OR $_SESSION['debug'] == 0) {echo "class=\"hide\"";} ?>>
	<pre>
		<?php
		debug_footer($db);
		?>
	</pre>
</div>
</body>
</html>
