	<div class="container">
		<h1>Network Configuration - Manual edit</h1>
		<div class="alert alert-warning">
			<strong>File /etc/network/interfaces was modified outside Player UI.</strong><br>
			You can edit it manually or reset back to default settings.
		</div>
		<div class="manual-edit-confirm">
			<a href="#mpd-config-defaults" class="btn btn-large" data-toggle="modal">Reset Network Config</a>
			<a href="#" class="btn btn-large btn-primary">manual edit</a>
		</div>
		<form name="mpdconf_editor" id="mpdconf_editor" class="hide" method="post">
		<label>Edit /etc/network/interfaces</label></td></tr>
		<textarea id="mpdconf" class="input-block-level" name="netconf" rows="25">$_netconf</textarea>
		<div class="form-actions">
			<button type="submit" class="btn btn-large btn-primary" name="save" value="save">Save changes</button>
		</div>
	</form>
	  
		<div id="mpd-config-defaults" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="mpd-config-defaults-label" aria-hidden="true">
		  <form name="mpdconf_reset" method="post" id="mpdconf_reset">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h3 id="mpd-config-defaults-label">Reset the configuration</h3>
			</div>
			<div class="modal-body">
				<p>You are going to reset the configuration to the default original values.<br>
				You will lose any modification.</p>
			</div>
			<div class="modal-footer">
			<input type="hidden" name="reset" value="1">
				<button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
				<button type="submit" class="btn btn-primary" >Continue</button>
			</div>
		  </form>
		</div>
	</div>