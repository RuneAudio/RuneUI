<div class="container">
    <h1>Settings</h1>
    <form class="form-horizontal" action="" method="post" role="form"> 
        <fieldset>
            <legend>Environment</legend>
			<div class="form-group" id="systemstatus">
                <label class="control-label col-sm-2">Check system status</label>
                <div class="col-sm-10">
                    <a class="btn btn-default btn-lg" href="#modal-sysinfo" data-toggle="modal"><i class="fa fa-info-circle sx"></i>show status</a>
                    <span class="help-block">See information regarding the system and its status.</span>
                </div>
            </div>
            <div class="form-group" id="environment">
                <label class="control-label col-sm-2" for="hostname">Player hostname</label>
                <div class="col-sm-10">
                    <input class="form-control input-lg" type="text" id="hostname" name="hostname" value="<?php echo $this->hostname; ?>" placeholder="runeaudio" autocomplete="off">
                    <span class="help-block">Set the player hostname. This will change the address used to reach the RuneUI.</span>
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-sm-2" for="ntpserver">NTP server</label>
                <div class="col-sm-10">
                    <input class="form-control input-lg" type="text" id="ntpserver" name="ntpserver" value="<?php echo $this->ntpserver; ?>" placeholder="pool.ntp.org" autocomplete="off">
                    <span class="help-block">Set your reference time sync server <i>(NTP server)</i>.</span>
                </div>
            </div>
            <div class="form-group">
            <label class="control-label col-sm-2" for="timezone">Timezone</label>
                <div class="col-sm-10">
                    <select class="selectpicker" name="timezone" data-style="btn-default btn-lg">
                    <?php foreach(ui_timezone() as $t): ?>
                      <option value="<?=$t['zone'] ?>" <?php if($this->timezone === $t['zone']): ?> selected <?php endif; ?>>
                        <?=$t['zone'].' - '.$t['diff_from_GMT'] ?>
                      </option>
                    <?php endforeach; ?>
                    </select>
                    <span class="help-block">Set the system timezone.</span>
                </div>
            </div>
            <!-- <div <?php if($this->proxy['enable'] === 1): ?>class="boxed-group"<?php endif ?> id="proxyBox">
                <div class="form-group">
                    <label for="proxy" class="control-label col-sm-2">HTTP Proxy server</label>
                    <div class="col-sm-10">
                        <label class="switch-light well" onclick="">
                            <input id="proxy" name="features[proxy]" type="checkbox" value="1"<?php if($this->proxy['enable'] == 1): ?> checked="checked" <?php endif ?>>
                            <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                        </label>
                    </div>
                </div>
                <div class="<?php if($this->proxy['enable'] != 1): ?>hide<?php endif ?>" id="proxyAuth">
                    <div class="form-group">
                        <label class="control-label col-sm-2" for="proxy-user">Host</label>
                        <div class="col-sm-10">
                            <input class="form-control input-lg" type="text" id="proxy_host" name="features[proxy][host]" value="<?php echo $this->proxy['host']; ?>" data-trigger="change" placeholder="<host IP or FQDN>:<port>">
                            <span class="help-block">Insert HTTP Proxy host<i> (format: proxy_address:port)</i></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label col-sm-2" for="proxy-user">Username</label>
                        <div class="col-sm-10">
                            <input class="form-control input-lg" type="text" id="proxy_user" name="features[proxy][user]" value="<?php echo $this->proxy['user']; ?>" data-trigger="change" placeholder="user">
                            <span class="help-block">Insert your HTTP Proxy <i>username</i> (leave blank for anonymous authentication)</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label col-sm-2" for="proxy-pass">Password</label>
                        <div class="col-sm-10">
                            <input class="form-control input-lg" type="password" id="proxy_pass" name="features[proxy][pass]" value="<?php echo $this->proxy['pass']; ?>" placeholder="pass" autocomplete="off">
                            <span class="help-block">Insert your HTTP Proxy <i>password</i> (case sensitive) (leave blank for anonymous authentication)</span>
                        </div>
                    </div>
                </div>
            </div> -->
            <div class="form-group form-actions">
                <div class="col-sm-offset-2 col-sm-10">
                    <button class="btn btn-primary btn-lg" value="save" name="save" type="submit">Apply settings</button>
                </div>
            </div>
        </fieldset>
    </form>
    <form class="form-horizontal" method="post" role="form">
        <fieldset>
            <legend>RuneOS kernel settings</legend>
            <?php if($this->hwplatformid === '01'): ?>
            <div class="form-group">
                <label class="control-label col-sm-2" for="i2smodule">Linux Kernel</label>
                <div class="col-sm-10">
                    <select class="selectpicker" name="kernel" data-style="btn-default btn-lg">
                        <option value="linux-arch-rpi_3.12.26-1-ARCH" <?php if($this->kernel === 'linux-arch-rpi_3.12.26-1-ARCH'): ?> selected <?php endif ?>>Linux kernel 3.12.26-1&nbsp;&nbsp;&nbsp;ARCH&nbsp;[RuneAudio v0.3-beta]</option>
                        <option value="linux-rune-rpi_3.12.19-2-ARCH" <?php if($this->kernel === 'linux-rune-rpi_3.12.19-2-ARCH'): ?> selected <?php endif ?>>Linux kernel 3.12.19-2&nbsp;&nbsp;&nbsp;RUNE&nbsp;[RuneAudio v0.3-alpha]</option>
                        <option value="linux-rune-rpi_3.6.11-18-ARCH+" <?php if($this->kernel === 'linux-rune-rpi_3.6.11-18-ARCH+'): ?> selected <?php endif ?>>Linux kernel 3.6.11-18&nbsp;&nbsp;&nbsp;ARCH+&nbsp;[RuneAudio v0.1-beta/v0.2-beta]</option>
                        <option value="linux-rune-rpi_3.12.13-rt21_wosa" <?php if($this->kernel === 'linux-rune-rpi_3.12.13-rt21_wosa'): ?> selected <?php endif ?>>Linux kernel 3.12.13-rt&nbsp;&nbsp;&nbsp;RUNE-RT&nbsp;[Wolfson Audio Card]</option>
                    </select>
                    <span class="help-block">Switch Linux Kernel version (REBOOT REQUIRED). <strong>Linux kernel 3.12.26-1</strong> is the default kernel in the current release, <strong>Linux kernel 3.12.19-2</strong> is the kernel used in RuneAudio v0.3-alpha, <strong>Linux kernel 3.6.11-18</strong> is the kernel used in RuneAudio v0.1-beta/v0.2-beta (it has no support for I&#178;S), <strong>Linux kernel 3.12.13-rt</strong> is an EXPERIMENTAL kernel (not suitable for all configurations), it is optimized for <strong>Wolfson Audio Card</strong> support and it is the default option for that type of soundcard.</span>
                </div>
                <label class="control-label col-sm-2" for="i2smodule">I&#178;S kernel modules</label>
                <div class="col-sm-10">
                    <select class="selectpicker" name="i2smodule" data-style="btn-default btn-lg" <?php if($this->kernel === 'linux-rune-rpi_3.12.13-rt21_wosa' OR $this->kernel === 'linux-rune-rpi_3.6.11-18-ARCH+'): ?>disabled<?php endif; ?>>
                        <?php if($this->kernel !== 'linux-rune-3.12.13-rt21_wosa'): ?>
                        <option value="none" <?php if($this->i2smodule === 'none'): ?> selected <?php endif ?>>I&#178;S disabled (default)</option>
                        <option value="berrynos" <?php if($this->i2smodule === 'berrynos'): ?> selected <?php endif ?>>G2Labs BerryNOS</option>
                        <option value="berrynosmini" <?php if($this->i2smodule === 'berrynosmini'): ?> selected <?php endif ?>>G2Labs BerryNOS mini</option>
                        <option value="hifiberrydac" <?php if($this->i2smodule === 'hifiberrydac'): ?> selected <?php endif ?>>HiFiBerry DAC</option>
                        <option value="hifiberrydacplus" <?php if($this->i2smodule === 'hifiberrydacplus'): ?> selected <?php endif ?>>HiFiBerry DAC+</option>
                        <option value="hifiberrydigi" <?php if($this->i2smodule === 'hifiberrydigi'): ?> selected <?php endif ?>>HiFiBerry Digi / Digi+</option>
                        <option value="iqaudiopidac" <?php if($this->i2smodule === 'iqaudiopidac'): ?> selected <?php endif ?>>IQaudIO Pi-DAC / Pi-DAC+</option>
                        <option value="raspyplay3" <?php if($this->i2smodule === 'raspyplay3'): ?> selected <?php endif ?>>RaspyPlay3</option>
                        <option value="raspyplay4" <?php if($this->i2smodule === 'raspyplay4'): ?> selected <?php endif ?>>RaspyPlay4</option>
                        <?php else: ?>
                        <option value="wolfsonaudiocard"  selected >Wolfson Audio Card</option>
                        <?php endif ?>
                    </select>
                    <span class="help-block">Enable I&#178;S output selecting one of the available sets of modules, specific for each hardware. Once set, the output interface will appear in the <a href="/mpd/">MPD configuration select menu</a>, and modules will also auto-load from the next reboot.</span>
                </div>
            </div>
            <?php endif;?>
            <div class="form-group">
                <label class="control-label col-sm-2" for="orionprofile">Sound Signature (optimization profiles)</label>
                <div class="col-sm-10">
                    <select class="selectpicker" name="orionprofile" data-style="btn-default btn-lg">
                        <option value="default" <?php if($this->orionprofile === 'default'): ?> selected <?php endif ?>>ArchLinux default</option>
                        <option value="RuneAudio" <?php if($this->orionprofile === 'RuneAudio'): ?> selected <?php endif ?>>RuneAudio</option>
                        <option value="ACX" <?php if($this->orionprofile === 'ACX'): ?> selected <?php endif ?>>ACX</option>
                        <option value="Orion" <?php if($this->orionprofile === 'Orion'): ?> selected <?php endif ?>>Orion</option>
                        <option value="OrionV2" <?php if($this->orionprofile === 'OrionV2'): ?> selected <?php endif ?>>OrionV2</option>
                        <option value="OrionV3_berrynosmini" <?php if($this->orionprofile === 'OrionV3_berrynosmini'): ?> selected <?php endif ?>>OrionV3 - (BerryNOS-mini)</option>
                        <option value="OrionV3_iqaudio" <?php if($this->orionprofile === 'OrionV3_iqaudio'): ?> selected <?php endif ?>>OrionV3 - (IQaudioPi-DAC)</option>
                        <option value="Um3ggh1U" <?php if($this->orionprofile === 'Um3ggh1U'): ?> selected <?php endif ?>>Um3ggh1U</option>
                    </select>
                    <span class="help-block">These profiles include a set of performance tweaks that act on some system kernel parameters.
                    It does not have anything to do with DSPs or other sound effects: the output is kept untouched (bit perfect).
                    It happens that these parameters introduce an audible impact on the overall sound quality, acting on kernel latency parameters (and probably on the amount of overall 
                    <a href="http://www.thewelltemperedcomputer.com/KB/BitPerfectJitter.htm" title="Bit Perfect Jitter by Vincent Kars" target="_blank">jitter</a>).
                    Sound results may vary depending on where music is listened, so choose according to your personal taste.
                    (If you can't hear any tangible differences... nevermind, just stick to the default settings.)</span>
                </div>
            </div>
            <div class="form-group form-actions">
                <div class="col-sm-offset-2 col-sm-10">
                    <button class="btn btn-primary btn-lg" value="save" name="save" type="submit">Apply settings</button>
                </div>
            </div>
        </fieldset>
    </form>
    <form class="form-horizontal" action="" method="post" role="form" data-parsley-validate>
        <fieldset id="features-management">
            <legend>Features management</legend>
            <p>Enable/disable optional modules that best suit your needs. Disabling unusued features will free system resources and might improve the overall performance.</p>
            <div <?php if($this->airplay['enable'] === '1'): ?>class="boxed-group"<?php endif ?> id="airplayBox">
                <div class="form-group">
                    <label for="airplay" class="control-label col-sm-2">AirPlay</label>
                    <div class="col-sm-10">
                        <label class="switch-light well" onclick="">
                            <input id="airplay" name="features[airplay][enable]" type="checkbox" value="1"<?php if($this->airplay['enable'] == 1): ?> checked="checked" <?php endif ?>>
                            <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                        </label>
                        <span class="help-block">Toggle the capability of receiving wireless streaming of audio via AirPlay protocol</span>
                    </div>
                </div>
                <div class="<?php if($this->airplay['enable'] != 1): ?>hide<?php endif ?>" id="airplayName">
                    <div class="form-group">
                        <label class="control-label col-sm-2" for="airplay-name">AirPlay name</label>
                        <div class="col-sm-10">
                            <input class="form-control input-lg" type="text" id="airplay_name" name="features[airplay][name]" value="<?php echo $this->airplay['name']; ?>" data-trigger="change" placeholder="runeaudio">
                            <span class="help-block">AirPlay broadcast name</span>
                        </div>
                    </div>
                </div>
            </div>
            <div <?php if($this->spotify['enable'] === '1'): ?>class="boxed-group"<?php endif ?> id="spotifyBox">
                <div class="form-group">
                    <label for="spotify" class="control-label col-sm-2">Spotify</label>
                    <div class="col-sm-10">
                        <label class="switch-light well" onclick="">
                            <input id="spotify" name="features[spotify][enable]" type="checkbox" value="1"<?php if($this->spotify['enable'] === '1'): ?> checked="checked" <?php endif ?> <?php if($this->activePlayer === 'Spotify'): ?>disabled readonly<?php endif; ?>>
                            <?php if($this->activePlayer === 'Spotify'): ?><input id="spotify" name="features[spotify][enable]" type="hidden" value="1"><?php endif; ?>
                            <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary <?php if($this->activePlayer === 'Spotify'): ?>disabled<?php endif; ?>"></a>
                        </label>
                        <span class="help-block">Enable Spotify client [EXPERIMENTAL]. You must have a <strong><a href="https://www.spotify.com/uk/premium/" target="_blank">Spotify PREMIUM</a></strong> account.</span>
                    </div>
                </div>
                <div class="<?php if($this->spotify['enable'] != 1): ?>hide<?php endif ?>" id="spotifyAuth">
                    <div class="form-group">
                        <label class="control-label col-sm-2" for="spotify-usr">Username</label>
                        <div class="col-sm-10">
                            <input class="form-control input-lg" type="text" id="spotify_user" name="features[spotify][user]" value="<?php echo $this->spotify['user']; ?>" data-trigger="change" placeholder="user" autocomplete="off">
                            <span class="help-block">Insert your Spotify <i>username</i></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label col-sm-2" for="spotify-pasw">Password</label>
                        <div class="col-sm-10">
                            <input class="form-control input-lg" type="password" id="spotify_pass" name="features[spotify][pass]" value="<?php echo $this->spotify['pass']; ?>" placeholder="pass" autocomplete="off">
                            <span class="help-block">Insert your Spotify <i>password</i> (case sensitive)</span>
                        </div>
                    </div>
                </div>
            </div>
            <div <?php if($this->dlna['enable'] === '1'): ?>class="boxed-group"<?php endif ?> id="dlnaBox">
                <div class="form-group">
                    <label for="dlna" class="control-label col-sm-2">UPnP / DLNA</label>
                    <div class="col-sm-10">
                        <label class="switch-light well" onclick="">
                            <input id="dlna" name="features[dlna][enable]" type="checkbox" value="1"<?php if($this->dlna['enable'] == 1): ?> checked="checked" <?php endif ?>>
                            <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                        </label>
                        <span class="help-block">Toggle the capability of receiving wireless streaming of audio via UPnP / DLNA protocol</span>
                    </div>
                </div>
                <div class="<?php if($this->dlna['enable'] != 1): ?>hide<?php endif ?>" id="dlnaName">
                    <div class="form-group">
                        <label class="control-label col-sm-2" for="dlna-name">UPnP / DLNA name</label>
                        <div class="col-sm-10">
                            <input class="form-control input-lg" type="text" id="dlna_name" name="features[dlna][name]" value="<?php echo $this->dlna['name']; ?>" data-trigger="change" placeholder="runeaudio">
                            <span class="help-block">UPnP / DLNA broadcast name</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="udevil" class="control-label col-sm-2">USB Automount</label>
                <div class="col-sm-10">
                    <label class="switch-light well" onclick="">
                        <input name="features[udevil]" type="checkbox" value="1"<?php if($this->udevil == 1): ?> checked="checked" <?php endif ?>>
                        <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                    </label>
                    <span class="help-block">Toggle automount for USB drives</span>
                </div>
            </div>
            <div class="form-group">
                <label for="coverart" class="control-label col-sm-2">Display album cover</label>
                <div class="col-sm-10">
                    <label class="switch-light well" onclick="">
                        <input name="features[coverart]" type="checkbox" value="1"<?php if($this->coverart == 1): ?> checked="checked" <?php endif ?>>
                        <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                    </label>
                    <span class="help-block">Toggle the display of album art on the Playback main screen</span>
                </div>
            </div>
            <!-- <div class="form-group">
                <label for="udevil" class="control-label col-sm-2">Global Random mode</label>
                <div class="col-sm-10">
                    <label class="switch-light well" onclick="">
                        <input name="features[globalrandom]" type="checkbox" value="1"<?php if($this->globalrandom == 1): ?> checked="checked" <?php endif ?>>
                        <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                    </label>
                    <span class="help-block">Toggle random playback on the whole music library [WARNING - EXPERIMENTAL]</span>
                </div>
            </div>
            <div class="form-group">
                <label for="wifiap" class="control-label col-sm-2">WiFi AccessPoint</label>
                <div class="col-sm-10">
                    <label class="switch-light well" onclick="">
                        <input name="features[wifiap]" type="checkbox" value="1"<?php if($this->wifiap == 1): ?> checked="checked" <?php endif ?>>
                        <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                    </label>
                    <span class="help-block">Toggle the AP-Mode WiFi feature (default SSID: RuneAudio)</span>
                </div>
            </div> -->
            <div <?php if($this->lastfm['enable'] === '1'): ?>class="boxed-group"<?php endif ?> id="lastfmBox">
                <div class="form-group">
                    <label for="lastfm" class="control-label col-sm-2"><i class="fa fa fa-lastfm-square"></i> Last.fm</label>
                    <div class="col-sm-10">
                        <label class="switch-light well" onclick="">
                            <input id="scrobbling-lastfm" name="features[lastfm][enable]" type="checkbox" value="1"<?php if($this->lastfm['enable'] === '1'): ?> checked="checked" <?php endif ?>>
                            <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                        </label>
                        <span class="help-block">Send to Last.fm informations about the music you are listening to (requires a Last.fm account)</span>
                    </div>
                </div>
                <div class="<?php if($this->lastfm['enable'] != 1): ?>hide<?php endif ?>" id="lastfmAuth">
                    <div class="form-group">
                        <label class="control-label col-sm-2" for="lastfm-usr">Username</label>
                        <div class="col-sm-10">
                            <input class="form-control input-lg" type="text" id="lastfm_user" name="features[lastfm][user]" value="<?php echo $this->lastfm['user']; ?>" data-trigger="change" placeholder="user" autocomplete="off">
                            <span class="help-block">Insert your Last.fm <i>username</i></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label col-sm-2" for="lastfm-pasw">Password</label>
                        <div class="col-sm-10">
                            <input class="form-control input-lg" type="password" id="lastfm_pass" name="features[lastfm][pass]" value="<?php echo $this->lastfm['pass']; ?>" placeholder="pass" autocomplete="off">
                            <span class="help-block">Insert your Last.fm <i>password</i> (case sensitive)</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group form-actions">
                <div class="col-sm-offset-2 col-sm-10">
                    <button class="btn btn-primary btn-lg" value="1" name="features[submit]" type="submit">apply settings</button>
                </div>
            </div>
        </fieldset>
    </form>
    <form class="form-horizontal" action="" method="post" role="form">
        <fieldset>
            <legend>Compatibility fixes</legend>
            <p>For people suffering problems with some receivers and DACs.</p>
            <div class="form-group">
                <label for="cmediafix" class="control-label col-sm-2">CMedia fix</label>
                <div class="col-sm-10">
                    <label class="switch-light well" onclick="">
                        <input name="cmediafix[1]" type="checkbox" value="1"<?php if($this->cmediafix == 1): ?> checked="checked" <?php endif ?>>
                        <span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
                    </label>
                    <span class="help-block">For those who have a CM6631 receiver and experiment issues (noise, crackling) between tracks with different sample rates and/or bit depth.<br> 
                    A "dirty" fix that should avoid the problem, do NOT use if everything works normally.</span>
                </div>
            </div>
            <div class="form-group form-actions">
                <div class="col-sm-offset-2 col-sm-10">
                    <button class="btn btn-primary btn-lg" value="1" name="cmediafix[0]" type="submit">Apply fixes</button>
                </div>
            </div>
        </fieldset>
    </form>
    <form class="form-horizontal" method="post">
        <fieldset>
            <legend>Backup / Restore configuration</legend>
            <p>Transfer settings between multiple RuneAudio installations, saving time during new/upgrade installations.</p>
            <div class="form-group">
                <label class="control-label col-sm-2">Backup player config</label>
                <div class="col-sm-10">
                    <input class="btn btn-primary btn-lg" type="submit" name="syscmd" value="backup" id="syscmd-backup">
					<span class="help-block">NOTE: restore feature will come in 0.4 release.</span>
                </div>
            </div>
		</fieldset>
    </form>
    <!--
    <form class="form-horizontal" method="post">
        <fieldset>
            <div class="form-group" >
                <label class="control-label col-sm-2" for="port">Configuration file</label>

                <div class="col-sm-10">
            
            <div class="fileupload fileupload-new" data-provides="fileupload">
                      <span class="btn btn-file"><span class="fileupload-new">restore</span><span class="fileupload-exists">Change</span><input type="file" /></span>
                      <span class="fileupload-preview"></span>
                      <a href="#" class="close fileupload-exists" data-dismiss="fileupload" style="float: none">×</a>
                    </div>

                </div>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary btn-lg" value="restore" name="syscmd" type="submit">Restore config</button>
            </div>
        </fieldset>
    </form>
    -->
</div>
<div id="modal-sysinfo" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modal-sysinfo-label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3 class="modal-title">System status</h3>
            </div>
            <div class="modal-body">
				<strong>Active kernel</strong>
				<p><?=$this->sysstate['kernel'] ?></p>
				<strong>System time</strong>
				<p><?=$this->sysstate['time'] ?><br>
				<em>refresh page to update</em></p>
				<strong>System uptime</strong>
				<p><?=$this->sysstate['uptime'] ?><br>
				<em>refresh page to update</em></p>
				<strong>HW platform</strong>
				<p><?=$this->sysstate['HWplatform'] ?></p>
				<strong>playerID</strong>
				<p><?=$this->sysstate['playerID'] ?></p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default btn-lg" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
