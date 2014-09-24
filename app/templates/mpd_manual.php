    <div class="container">
        <h1>MPD Configuration - Manual edit</h1>
        <div id="manual-edit-warning">
            <div class="alert alert-warning">
                <strong>File /etc/mpd.conf was modified outside Player UI.</strong><br>
                You can edit it manually or reset back to default settings.
            </div>
            <div class="manual-edit-confirm">
                <a href="#mpd-config-defaults" class="btn btn-default btn-lg" data-toggle="modal">Reset MPD config</a>
                <a href="#" class="btn btn-primary btn-lg">manual edit</a>
            </div>
        </div>
        <form name="mpdconf_editor" id="mpdconf_editor" class="hide" method="post">
            <label>Edit /etc/mpd.conf</label></td></tr>
            <textarea id="mpdconf" class="form-control" name="mpdconf" rows="40"><?=$this->mpdconf ?></textarea>
            <br>
            <a class="btn btn-default btn-lg" href="/mpd/">Cancel</a>
            <button type="submit" class="btn btn-primary btn-lg" name="save" value="save">Save changes</button>
        </form>
      
        <div id="mpd-config-defaults" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mpd-config-defaults-label" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form name="mpdconf_reset" method="post" id="mpdconf_reset">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            <h3 id="mpd-config-defaults-label" class="modal-title">Reset the configuration</h3>
                        </div>
                        <div class="modal-body">
                            <p>You are going to reset the configuration to the default original values.<br>
                            You will lose any modification.</p>
                        </div>
                        <div class="modal-footer">
                            <input type="hidden" name="reset" value="1">
                            <button class="btn btn-default btn-lg" data-dismiss="modal" aria-hidden="true">Cancel</button>
                            <button type="submit" class="btn btn-primary btn-lg" >Continue</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>