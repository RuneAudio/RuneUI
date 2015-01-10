<div class="container">
    <h1>WiFi SSID Configuration</h1>
    <!--<p>If you mess up with this configuration you can <a data-toggle="modal" href="#net-config-defaults">reset to default</a>.</p>-->
    <form class="form-horizontal" action="/network/edit/<?=$this->uri(3) ?>" method="post" data-parsley-validate>
        <?php if($this->addprofile !== 1): ?>
        <fieldset>
            <?php if($this->stored === 1 && $this->nic->currentssid !== $this->{$this->uri(4)}->{'ESSID'}): ?>
            <legend><?=$this->title ?> <span class="<?php if($this->action === 'add'): ?>hide<?php endif; ?>">(<a href="#wifiprofile-delete-modal" data-toggle="modal">delete this profile</a>)</span></legend>
            <?php endif; ?>
            <div class="boxed">
                <table class="info-table">
                    <tbody>
                        <tr><th>Network SSID:</th><td><strong><?=urldecode($this->uri(4)) ?></strong></td></tr>
                        <?php if ($this->nic->currentssid === $this->{$this->uri(4)}->{'ESSID'}): ?>
                        <tr><th>Status:</th><td><i class="fa fa-check green sx"></i>connected</td></tr>
                        <?php endif; ?>
                        <tr>
                            <?php $signal_strength = $this->{$this->uri(4)}->{'Quality'}; ?>
                            <?php if (!empty($signal_strength)): ?>
                            <th>Signal strength:</th>
                            <td>
    
                                <div id="wifi-signal-strength" class="progress">
                                    <div class="progress-bar" role="progressbar" aria-valuenow="<?php echo $signal_strength; ?>" aria-valuemin="0" aria-valuemax="100" style="width: <?php echo $signal_strength; ?>%;">
                                        <?php echo $signal_strength; ?>%
                                    </div>
                                </div>
                            </td>
                            <?php endif; ?>
                        </tr>
                        <tr><th>Encryption:</th><td><?php if ($this->{$this->uri(4)}->{'Encryption key'} === 'on' && $this->{$this->uri(4)}->{'Group Cipher'} != null && strpos($this->{$this->uri(4)}->IE, 'WPA') OR $this->profile_{$this->uri(4)}->encryption === 'wpa'): ?><i class="fa fa-lock sx"></i>WPA / WPA2 - PSK <?php if ($this->{$this->uri(4)}->{'Group Cipher'} === 'CCMP'): ?>(AES)<?php else: ?><?=$this->{$this->uri(4)}->{'Group Cipher'} ?><?php  endif; ?><?php elseif ($this->{$this->uri(4)}->{'Encryption key'} === 'on' OR $this->profile_{$this->uri(4)}->encryption === 'wep'): ?><i class="fa fa-lock sx"></i>WEP<?php else: ?><i class="fa fa-unlock-alt sx"></i>none (Open Network)<?php endif; ?></td></tr>
                    </tbody>
                    <!--
                    <tfoot>
                        <tr><th><a href="/network/edit/<?=$this->uri(3) ?>"><i class="fa fa-arrow-left sx"></i> back to NIC details</a></th><td></td></tr>
                    </tfoot>
                    -->
                </table>
            </div>
        </fieldset>
        <?php // if ($this->nic->currentssid === $this->{$this->uri(4)}->{'ESSID'}): ?>
        <?php if ($this->nic->currentssid === $this->uri(4)): ?>
        <fieldset>
            <div class="form-group form-actions">
                <div class="col-sm-12">
                    <a class="btn btn-default btn-lg" href="/network/edit/<?=$this->uri(3) ?>">Cancel</a>
                    <button class="btn btn-primary btn-lg" name="wifiprofile[action]" value="disconnect" type="submit">Disconnect</button>
                </div>
            </div>
        </fieldset>
        <?php endif; ?>
        <?php endif; ?>
        <?php if ($this->nic->currentssid !== $this->{$this->uri(4)}->{'ESSID'}): ?>
        <fieldset>
            <legend>Security parameters</legend>
            <div class="form-group <?php if($this->uri(4) !== 'add'): ?>hide<?php endif; ?>">
                <label class="col-sm-2 control-label" for="wifiprofile[ssid]">SSID</label>
                <div class="col-sm-10">
                    <input class="form-control input-lg" type="text" id="wifi-ssid" name="wifiprofile[ssid]" value="<?php if($this->uri(4) !== 'add'): ?><?=$this->uri(4) ?><?php endif; ?>" data-trigger="change" autocomplete="off">
                    <span class="help-block">Set the SSID name of the Wi-Fi you want to connect.</span>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label" for="wifiprofile[encryption]">Security</label>
                <div class="col-sm-10">
                    <select id="wifi-security" name="wifiprofile[encryption]" class="selectpicker" data-style="btn-default btn-lg">
                        <option value="open" <?php if($this->uri(4) !== null && strpos($this->{$this->uri(4)}->{'Encryption key'}, 'off') OR $this->profile_{$this->uri(4)}->encryption === 'open'): ?>selected<?php endif; ?>>none (Open network)</option>
                        <option value="wpa" <?php if($this->uri(4) !== null && strpos($this->{$this->uri(4)}->IE, 'WPA') OR $this->profile_{$this->uri(4)}->encryption === 'wpa' ): ?>selected<?php endif; ?>>WPA/WPA2 PSK</option>
                        <option value="wep" <?php if($this->uri(4) !== null && $this->{$this->uri(4)}->{'Encryption key'} === 'on' && !strpos($this->{$this->uri(4)}->IE, 'WPA') OR $this->profile_{$this->uri(4)}->encryption === 'wep'): ?>selected<?php endif; ?>>WEP</option>
                    </select>
                    <span class="help-block">Choose the security type of the Wi-Fi you want to connect.</span>
                </div>
            </div>
            <div id="wifi-security-key" class="form-group hide">
                <label class="col-sm-2 control-label" for="wifiprofile[key]">Password</label>
                <div class="col-sm-10">
                    <input type="hidden" name="wifiprofile[action]" value="<?php if($this->stored === 1): ?>edit<?php else: ?>add<?php endif; ?>">
                    <?php if($this->addprofile !== 1 && $this->stored !== 1 OR ($this->wlan_autoconnect !== '1' && $this->stored === 1 && isset($this->{$this->uri(4)}->{'ESSID'}))): ?>
                    <input type="hidden" name="wifiprofile[connect]" value="1">
                    <?php endif; ?>
                    <?php if(isset($this->profile_{$this->uri(4)}->id)): ?>
                    <input type="hidden" name="wifiprofile[id]" value="<?=$this->profile_{$this->uri(4)}->id ?>">
                    <?php endif; ?>
                    <input class="form-control input-lg" type="password" id="wifi-password" name="wifiprofile[key]" value="<?=$this->profile_{$this->uri(4)}->key ?>" data-trigger="change" autocomplete="off">
                    <span class="help-block">Set the key of the Wi-Fi you want to connect.</span>
                    <div class="checkbox">
                        <label>
                            <input class="sx" type="checkbox" onchange="document.getElementById('wifi-password').type = this.checked ? 'text' : 'password'"> Show password
                        </label>
                    </div>
                </div>
            </div>
        </fieldset>
        <div class="form-group form-actions">
            <div class="col-sm-offset-2 col-sm-10">
                <a class="btn btn-default btn-lg" href="/network/edit/<?=$this->uri(3) ?>">Cancel</a>
                <button type="submit" class="btn btn-primary btn-lg" name="wifiprofile[nic]" value="<?=$this->uri(3) ?>"><?php if($this->addprofile !== 1 && $this->stored !== 1 OR ($this->wlan_autoconnect !== '1' && $this->stored === 1 && isset($this->{$this->uri(4)}->{'ESSID'}))): ?>Connect<?php elseif($this->stored === 1): ?>Modify profile<?php else: ?>Save profile<?php endif; ?></button>
            </div>
        </div>
        <?php endif; ?>
    </form>
</div>
<div id="wifiprofile-delete-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="wifiprofile-delete-modal-label" aria-hidden="true">
    <form class="form-horizontal" method="post" action="/network/edit/<?=$this->uri(3) ?>">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h3 class="modal-title" id="wifiprofile-delete-modal-label">Remove WiFi settings for SSID: <i><strong><?=$this->uri(4) ?></strong></i></h3>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this profile?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-default btn-lg" data-dismiss="modal" aria-hidden="true">Cancel</button>
                    <button type="submit" class="btn btn-primary btn-lg" name="action" value="remove">Remove</button>
                    <input type="hidden" name="wifiprofile[action]" value="delete">
                    <input type="hidden" name="wifiprofile[ssid]" value="<?=$this->profile_{urldecode($this->uri(4))}->ssid ?>">
                    <input type="hidden" name="wifiprofile[id]" value="<?=$this->profile_{urldecode($this->uri(4))}->id ?>">
                </div>
            </div>
        </div>
    </form>
</div>