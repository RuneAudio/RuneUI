<div class="container">
    <h1>Development settings</h1>
    <form class="form-horizontal" action="" method="post" role="form" data-parsley-validate>
        <fieldset>
            <legend>PHP backend control</legend>
            <p>Just some handy "tools" for PHP backend management.</p>
            <div class="form-group">
                <label class="col-sm-2 control-label">Clear PHP 5.5 OPcache</label>
                <div class="col-sm-10">
                    <a class="btn btn-default btn-lg btn-lg" type="submit" href="/clear" name="syscmd" id="syscmd-viewphpcache" target="_blank" <?php if($this->opcache === '0'): ?> disabled <?php endif ?>>clear OPcache</a>
                </div>
            </div>            
            <div class="form-group">
                <label class="col-sm-2 control-label">View PHP 5.5 OPcache status</label>
                <div class="col-sm-10">
                    <a class="btn btn-default btn-lg btn-lg" type="submit" href="/command/opcache.php" name="syscmd" id="syscmd-viewphpcache" target="_blank">php cache status</a>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Restart PHP service</label>
                <div class="col-sm-10">
                    <input class="btn btn-default btn-lg btn-lg" type="submit" name="syscmd" value="phprestart" id="syscmd-phprestart" <?php if($this->dev !== '1'): ?> disabled <?php endif ?>>
                </div>
            </div> 
        <div class="form-group">
                <label class="col-sm-2 control-label">PHP 5.5 OPcache (persistent cache)</label>
                <div class="col-sm-10">
                        <label class="switch-light well" onclick="">
                            <input id="opcache" name="opcache[enable]" type="checkbox" value="1"<?php if($this->opcache === '1'): ?> checked="checked" <?php endif ?>>
                            <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                        </label>
                    <span class="help-block">Enable PHP 5.5 OPcache persistence. This drastically speed-up page render, but you must manually clear cache (use above button) at any source code change. This is enabled by default in production environment.</span>
                </div>
            </div>
            <div class="form-group">
                <div class="col-sm-offset-2 col-sm-10">
                    <button class="btn btn-primary btn-lg" value="1" name="opcache[submit]" type="submit">Save settings</button>
                </div>
            </div>
        </fieldset>
    </form>
    <form class="form-horizontal" method="post">
        <fieldset>
            <legend>DevTeam functions</legend>
            <div class="boxed-group">
                <div class="form-group">
                    <label class="col-sm-2 control-label">PlayerID</label>
                    <div class="col-sm-10">
                        <input class="form-control input-lg" type="text" id="playerid" name="playerid" value="<?php echo $this->playerid; ?>" disabled autocomplete="off">
                        <span class="help-block">Current detected HW fingerprint.</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2 control-label">Blank playerID</label>
                    <div class="col-sm-10">
                        <input class="btn btn-default btn-lg" type="submit" name="syscmd" value="blankplayerid" id="syscmd-blankplayerid" <?php if($this->dev !== '1'): ?> disabled <?php endif ?>>
                        <span class="help-block">Reset playerID. The player will perform the configuration routine at next reboot.</span>
                    </div>
                </div>                
                <div class="form-group">
                    <label class="col-sm-2 control-label">Clear installation</label>
                    <div class="col-sm-10">
                        <input class="btn btn-default btn-lg" type="submit" name="syscmd" value="clearimg" id="syscmd-clearimg" <?php if($this->dev !== '1'): ?> disabled <?php endif ?>>
                        <span class="help-block">Clear command history, logs, reset image parameters to default settings.<br>
                        NOTE: (Dev team function) Use this function prior to public a RuneOS image.<br>
                        WARNING: Automatic system shutdown after execution!</span>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Dev Mode</label>
                <div class="col-sm-10">
                        <label class="switch-light well" onclick="">
                            <input id="opcache" name="mode[dev][enable]" type="checkbox" value="1"<?php if($this->dev === '1'): ?> checked="checked" <?php endif ?>>
                            <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                        </label>
                        <span class="help-block">Enable <i>developer mode</i>.</span>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Debug</label>
                <div class="col-sm-10">
                        <label class="switch-light well" onclick="">
                            <input id="opcache" name="mode[debug][enable]" type="checkbox" value="1"<?php if($this->debug === '1'): ?> checked="checked" <?php endif ?>>
                            <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                        </label>
                    <span class="help-block">Activate debug data collection. (You will find all log files in <strong>/var/log/runeaudio/</strong> directory).</span>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Check FS permissions</label>
                <div class="col-sm-10">
                    <input class="btn btn-default btn-lg" type="submit" name="syscmd" value="syschmod" id="syscmd-mpdrestart" <?php if($this->dev !== '1'): ?> disabled <?php endif ?>>
                    <span class="help-block">Check and restore correct FS permissions, in important system areas.</span>
                </div>
            </div>
            <div class="form-group">
                <div class="col-sm-offset-2 col-sm-10">
                    <button class="btn btn-primary btn-lg" value="1" name="mode[debug][submit]" type="submit">Save settings</button>
                </div>
            </div>
        </fieldset>
    </form>
    <form class="form-horizontal" method="post">
        <fieldset>
            <legend>System commands</legend>
            <p>Just some handy system commands, without the hassle of logging into SSH.</p>
            <div class="form-group">
                <label class="col-sm-2 control-label">Restart MPD service</label>
                <div class="col-sm-10">
                    <input class="btn btn-default btn-lg" type="submit" name="syscmd" value="mpdrestart" id="syscmd-mpdrestart" <?php if($this->dev !== '1'): ?> disabled <?php endif ?>>
                    <span class="help-block">&nbsp;</span>
                </div>
            </div>            
            <div class="form-group">
                <label class="col-sm-2 control-label">Reset NET config</label>
                <div class="col-sm-10">
                    <input class="btn btn-default btn-lg" type="submit" name="syscmd" value="netconfreset" id="syscmd-netconfreset" <?php if($this->dev !== '1'): ?> disabled <?php endif ?>>
                    <span class="help-block">&nbsp;</span>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Reset MPD config</label>
                <div class="col-sm-10">
                    <input class="btn btn-default btn-lg" type="submit" name="syscmd" value="mpdconfreset" id="syscmd-mpdconfreset" <?php if($this->dev !== '1'): ?> disabled <?php endif ?>>
                    <span class="help-block">&nbsp;</span>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Update RuneUI</label>
                <div class="col-sm-10">
                    <input class="btn btn-default btn-lg" type="submit" name="syscmd" value="gitpull" id="syscmd-gitpull" <?php if($this->dev !== '1'): ?> disabled <?php endif ?>>
                    <span class="help-block">&nbsp;</span>
                </div>
            </div>              
        </fieldset>
    </form>
    <form class="form-horizontal" method="post">
        <fieldset>
            <legend>Background WORKERS control</legend>
            <p>Just some handy "tools" for Background WORKERS management.</p>
            <div class="form-group">
                <label class="col-sm-2 control-label">RuneAudio SYSTEM Worker (rune_SY_wrk)</label>
                <div class="col-sm-10">
                    <button class="btn btn-default btn-lg" value="rune_SY_wrk" name="syscmd[wrkrestart]" type="submit">Restart rune_SY_wrk</button>
                    <span class="help-block">&nbsp;</span>
                </div>
            </div>    
            <div class="form-group">
                <label class="col-sm-2 control-label">RuneAudio PLAYBACK Worker (rune_PL_wrk)</label>
                <div class="col-sm-10">
                    <button class="btn btn-default btn-lg" value="rune_PL_wrk" name="syscmd[wrkrestart]" type="submit">Restart rune_PL_wrk</button>
                    <span class="help-block">&nbsp;</span>
                </div>
            </div>    
        </fieldset>
    </form>
<!-- <form class="form-horizontal" method="post">
        <fieldset>
            <legend>Backup / Restore configuration</legend>
            <p>&nbsp;</p>
            <div class="form-group">
                <label class="col-sm-2 control-label">Backup player config</label>
                <div class="col-sm-10">
                    <input class="btn btn-default btn-lg" type="submit" name="syscmd" value="backup" id="syscmd-backup">
                </div>
            </div>
                    </fieldset>
    </form>
    <form class="form-horizontal" method="post">
        <fieldset>
            <div class="form-group" >
                <label class="col-sm-2 control-label" for="port">Configuration file</label>
                <div class="col-sm-10">
                    <div class="fileupload fileupload-new" data-provides="fileupload">
                      <span class="btn btn-file"><span class="fileupload-new">restore</span><span class="fileupload-exists">Change</span><input type="file" /></span>
                      <span class="fileupload-preview"></span>
                      <a href="#" class="close fileupload-exists" data-dismiss="fileupload" style="float: none">×</a>
                    </div>            
                </div>
            </div>
            <div class="form-group">
                <div class="col-sm-offset-2 col-sm-10">
                    <button class="btn btn-primary btn-lg" value="restore" name="syscmd" type="submit">Restore config</button>
                </div>
            </div>
        </fieldset>
    </form> -->
</div>