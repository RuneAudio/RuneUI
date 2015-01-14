<div id="poweroff-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="poweroff-modal-label" aria-hidden="true">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title" id="poweroff-modal-label">Turn off the player</h4>
            </div>
            <div class="modal-body txtmid">
                <button id="syscmd-poweroff" name="syscmd" value="poweroff" class="btn btn-primary btn-lg btn-block" data-dismiss="modal"><i class="fa fa-power-off sx"></i> Power off</button>
                &nbsp;
                <button id="syscmd-reboot" name="syscmd" value="reboot" class="btn btn-primary btn-lg btn-block" data-dismiss="modal"><i class="fa fa-refresh sx"></i> Reboot</button>
            </div>
            <div class="modal-footer">
                <button class="btn btn-default btn-lg" data-dismiss="modal" aria-hidden="true">Cancel</button>
            </div>
        </div>
    </div>
</div>
<?php if ($this->section !== 'config'): ?>
<!-- loader -->
<div id="loader"<?php if ($this->section == 'dev') { ?> class="hide"<?php } ?>><div id="loaderbg"></div><div id="loadercontent"><i class="fa fa-refresh fa-spin"></i>connecting...</div></div>
<?php endif; ?>
<script src="<?=$this->asset('/js/vendor/jquery-2.1.0.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/pushstream.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/bootstrap.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/mithril.js')?>"></script>
<?php if ($this->section == 'debug'): ?>
<script src="<?=$this->asset('/js/vendor/ZeroClipboard.min.js')?>"></script>
<?php endif ?>
<?php if ($this->section == 'index'): ?>
<script src="<?=$this->asset('/js/vendor/jquery.plugin.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/jquery.countdown.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/jquery.knob.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/bootstrap-contextmenu.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/jquery.scrollTo.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/Sortable.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/fastclick.min.js')?>"></script>
<?php else: ?>
<script src="<?=$this->asset('/js/vendor/bootstrap-select.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/parsley.min.js')?>"></script>
<?php endif ?>
<?php if ($this->section !== 'config'): ?>
<?php if ($this->dev === '0'):?>
<script src="<?=$this->asset('/js/runeui.min.js')?>"></script>
<?php else: ?>
<!-- DEV mode ACTIVE -->
<script src="<?=$this->asset('/js/runeui.js')?>"></script>
<?php endif; ?>
<?php else: ?>
<script src="<?=$this->asset('/js/runeui._data.js')?>"></script>
<script src="<?=$this->asset('/js/runeui._helpers.js')?>"></script>
<script src="<?=$this->asset('/js/runeui._mithril.js')?>"></script>
<script src="<?=$this->asset('/js/runeui._modal.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.playback_controls.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.audio.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.credits.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.debug.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.dev.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.error.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.mpd.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.navigation.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.network.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.network_wired.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.network_wireless.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.settings.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.source.js')?>"></script>
<script src="<?=$this->asset('/js/runeui.sources.js')?>"></script>
<script src="<?=$this->asset('/js/runeui._init.js')?>"></script>
<?php endif; ?>
<script src="<?=$this->asset('/js/vendor/pnotify.custom.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/modernizr-2.6.2-respond-1.1.0.min.js')?>"></script>
<script src="<?=$this->asset('/js/vendor/openwebapp.js')?>"></script>
