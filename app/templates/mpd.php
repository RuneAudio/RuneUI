<div class="container">
    <h1>MPD Configuration</h1>
    <p>If you mess up with this configuration you can <a data-toggle="modal" href="#mpd-config-defaults">reset to default</a>.</p>
    <form class="form-horizontal" action="" method="post">
        <fieldset>
            <legend>Audio Output</legend>
            <div class="boxed-group">
                <div class="form-group">
                    <label class="col-sm-2 control-label" for="audio-output-interface">Audio output interface</label>
                    <div class="col-sm-10">
                        <select id="audio-output-interface" name="conf[audio_output_interface]" class="selectpicker" data-style="btn-default btn-lg">
                            <?php foreach($this->acards as $card): ?>
                                <option value="<?=$card->name ?>" <?php if($this->ao === $card->name): ?> selected <?php endif ?>><?php if(isset($card->extlabel)):?><?=$card->extlabel ?><?php else:?><?=$card->name ?><?php endif; ?></option>
                            <?php endforeach; ?>
                        </select>
                        <span class="help-block">This switches output between audio interfaces (<strong>works on the fly</strong>).</span>
                    </div>
                </div>
            </div>
        </fieldset>
    </form>
    <form class="form-horizontal" action="" method="post" data-parsley-validate>
    <fieldset>
            <legend>Volume control</legend>
            <div class="form-group">
                <label class="col-sm-2 control-label" for="mixer-type">Volume control</label>
                <div class="col-sm-10">
                    <select id="mixer-type" name="conf[mixer_type]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="disabled" <?php if($this->conf['mixer_type'] == 'disabled'): ?> selected <?php endif ?>>disabled</option>
                        <option value="software" <?php if($this->conf['mixer_type'] == 'software'): ?> selected <?php endif ?>>enabled - software</option>
                        <option value="hardware" <?php if($this->conf['mixer_type'] == 'hardware'): ?> selected <?php endif ?>>enabled - hardware</option>
                    </select>
                    <span class="help-block">
                        <strong>disabled</strong> - Volume knob disabled. Use this option to achieve the <strong>best audio quality</strong>.<br>
                        <strong>software</strong> - Volume knob enabled, controlled by <strong>software mixer</strong>. This option <strong>reduces the overall sound quality</strong>.<br>
                        <strong>hardware</strong> - Volume knob enabled, controlled by <strong>hardware mixer</strong>. This option enables the volume control and let you achieve <strong>very good overall sound quality</strong>.<br>
                        <i>Note: hardware mixer must be supported directly from your sound card hardware.</i>
                    </span>
                </div>
            </div>
        </fieldset>
        <fieldset>
            <legend>General music daemon options</legend>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="port">Port</label>
                <div class="col-sm-10">
                    <input class="form-control input-lg" type="text" id="port" name="conf[port]" value="<?=$this->conf['port'] ?>" data-trigger="change" disabled>
                    <span class="help-block">This setting is the TCP port that is desired for the daemon to get assigned to.</span>
                </div>
            </div>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="daemon-user">Daemon user : group</label>
                <div class="col-sm-10">
                    <select id="log-level" name="conf[user]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="mpd" <?php if($this->conf['user'] == 'mpd'): ?> selected <?php endif ?>>mpd : audio (default)</option>
                        <option value="root" <?php if($this->conf['user'] == 'root'): ?> selected <?php endif ?>>root : root</option>
                    </select>         
                    <span class="help-block">This specifies the system user : group that MPD will run as.</span>
                </div>
            </div>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="log-level">Log level</label>
                <div class="col-sm-10">
                    <select id="log-level" name="conf[log_level]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="none" <?php if($this->conf['log_level'] == 'none'): ?> selected <?php endif ?>>disabled</option>
                        <option value="default" <?php if($this->conf['log_level'] == 'default'): ?> selected <?php endif ?>>default</option>
                        <option value="secure" <?php if($this->conf['log_level'] == 'secure'): ?> selected <?php endif ?>>secure</option>    
                        <option value="verbose" <?php if($this->conf['log_level'] == 'verbose'): ?> selected <?php endif ?>>verbose</option>
                    </select>         
                    <span class="help-block">This setting controls the type of information which is logged. Available setting arguments are "disabled", "default", "secure" or "verbose".
                    The "verbose" setting argument is recommended for troubleshooting, though can quickly stretch available resources on limited hardware storage.</span>
                </div>
            </div>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="state-file">State file</label>
                <div class="col-sm-10">
                    <select id="log-level" name="conf[state_file]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="yes" <?php if(isset($this->conf['state_file'])): ?> selected <?php endif ?>>enabled</option>
                        <option value="no" <?php if(!isset($this->conf['state_file'])): ?> selected <?php endif ?>>disabled</option>
                    </select>         
                    <span class="help-block">This setting specifies if a state file is used. If the  state  file is active, the state of  mpd  will  be  saved when mpd is terminated by a TERM signal or by the "kill" command.  When  mpd is  restarted, it will read the state file and restore the state of mpd (including the playlist).</span>
                </div>
            </div>                   
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="ffmpeg">FFmpeg decoder plugin</label>
                <div class="col-sm-10">
                    <select id="ffmpeg" name="conf[ffmpeg]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="yes" <?php if($this->conf['ffmpeg'] === 'yes'): ?> selected <?php endif ?>>enabled</option>
                        <option value="no" <?php if($this->conf['ffmpeg'] === 'no'): ?> selected <?php endif ?>>disabled</option>
                    </select>         
                    <span class="help-block">FFmpeg decoder plugin. Enable this setting if you need AAC / ALAC support. May slow down MPD database refresh.</span>
                </div>
            </div>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="gapless-mp3-playback">Gapless mp3 playback</label>
                <div class="col-sm-10">
                    <select id="gapless-mp3-playback" name="conf[gapless_mp3_playback]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="yes" <?php if($this->conf['gapless_mp3_playback'] == 'yes'): ?> selected <?php endif ?>>enabled</option>    
                        <option value="no" <?php if($this->conf['gapless_mp3_playback'] == 'no'): ?> selected <?php endif ?>>disabled</option>
                    </select>
                    <span class="help-block">If you have a problem with your MP3s ending abruptly it is recommended that you set this argument to "no" to attempt to fix the problem. If this solves the problem,
                    it is highly recommended to fix the MP3 files with vbrfix (available as vbrfix in the debian archive), at which point gapless MP3 playback can be enabled.</span>
                </div>
            </div>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="dsd-usb">DSD support</label>
                <div class="col-sm-10">
                    <select id="dsd-usb" name="conf[dsd_usb]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="yes" <?php if($this->conf['dsd_usb'] == 'yes'): ?> selected <?php endif ?>>enabled</option>
                        <option value="no" <?php if($this->conf['dsd_usb'] == 'no'): ?> selected <?php endif ?>>disabled</option>
                    </select>
                    <span class="help-block">Enable DSD audio support.</span>
                </div>
            </div>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="dsd-usb">Volume normalization</label>
                <div class="col-sm-10">
                    <select id="volume-normalization" name="conf[volume_normalization]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="yes" <?php if($this->conf['volume_normalization'] == 'yes'): ?> selected <?php endif ?>>enabled</option>    
                        <option value="no" <?php if($this->conf['volume_normalization'] == 'no'): ?> selected <?php endif ?>>disabled</option>
                    </select>
                    <span class="help-block">If yes, mpd will normalize the volume of songs as they play. The default is no</span>
                </div>
            </div>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="port">Audio buffer size</label>
                <div class="col-sm-10">
                    <input class="form-control input-lg" type="number" id="audio-buffer-size" name="conf[audio_buffer_size]" value="<?=$this->conf['audio_buffer_size'] ?>" data-trigger="change" min="512" />
                    <span class="help-block">This specifies the size of the audio buffer in kibibytes. The default is 2048, large enough for nearly 12 seconds of CD-quality audio.</span>
                </div>
            </div>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="dsd-usb">Buffer before play</label>
                <div class="col-sm-10">
                    <select id="buffer-before-play" name="conf[buffer_before_play]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="0%" <?php if($this->conf['buffer_before_play'] == '0%'): ?> selected <?php endif ?>>disabled</option>\n";    
                        <option value="10%" <?php if($this->conf['buffer_before_play'] == '10%'): ?> selected <?php endif ?>>10%</option>\n";    
                        <option value="20%" <?php if($this->conf['buffer_before_play'] == '20%'): ?> selected <?php endif ?>>20%</option>\n";    
                        <option value="30%" <?php if($this->conf['buffer_before_play'] == '30%'): ?> selected <?php endif ?>>30%</option>\n";                    
                    </select>
                    <span class="help-block"> This specifies how much of the audio buffer should be filled before playing a song. Try increasing this if you hear skipping when manually changing songs. The default is 10%, a little over 1 second of CD-quality audio with the default buffer size</span>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label" for="auto-update">Auto update</label>
                <div class="col-sm-10">
                    <select id="auto-update" name="conf[auto_update]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="yes" <?php if($this->conf['auto_update'] == 'yes'): ?> selected <?php endif ?>>enabled</option>    
                        <option value="no" <?php if($this->conf['auto_update'] == 'no'): ?> selected <?php endif ?>>disabled</option>                
                    </select>
                    <span class="help-block">This setting enables automatic update of MPD's database when files in music_directory are changed.</span>
                </div>
            </div>
        </fieldset>
        <div class="form-group form-actions">
            <div class="col-sm-offset-2 col-sm-10">
                <a href="/mpd/" class="btn btn-default btn-lg">Cancel</a>
                <button type="submit" class="btn btn-primary btn-lg" name="save" value="save">Save and apply</button>
            </div>
        </div>
    </form>
</div>
<div id="mpd-config-defaults" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mpd-config-defaults-label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form name="mpdconf_reset" method="post" id="mpdconf_reset">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h3 class="modal-title" id="mpd-config-defaults-label">Reset the configuration</h3>
                </div>
                <div class="modal-body">
                    <p>You are going to reset the configuration to the default original values.<br>
                    You will lose any modification.</p>
                </div>
                <div class="modal-footer">
                    <input type="hidden" name="reset" value="1">
                    <button class="btn btn-default btn-lg" data-dismiss="modal" aria-hidden="true">Cancel</button>
                    <button class="btn btn-primary btn-lg" type="submit">Continue</button>
                </div>
            </form>
        </div>
    </div>
</div>