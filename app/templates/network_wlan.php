<div class="container">
    <?php if($this->addprofile === 1 OR $this->stored !== 1): ?><h1>WiFi SSID Configuration</h1><?php else: ?><h1>WiFi stored profile</h1><?php endif; ?>
    <form class="form-horizontal" action="/network/edit/<?=$this->uri(3) ?>" method="post" data-parsley-validate>
        <?php if($this->addprofile !== 1): ?>
        <fieldset>
            <?php if($this->stored === 1 && (!isset($this->nic->currentssid) || $this->nic->currentssid !== $this->{urldecode($this->uri(4))}->{'ESSID'})): ?>
             <legend><?=$this->title ?> <span class="<?php if($this->action === 'add'): ?>hide<?php endif; ?>">(<a href="#wifiprofile-delete-modal" data-toggle="modal">delete this profile</a>)</span></legend>
            <?php endif; ?>
            <div class="boxed">
                <table class="info-table">
                    <tbody>
                        <tr><th>Network SSID:</th><td><strong><?=urldecode($this->uri(4)) ?></strong></td></tr>
                        <?php if (isset($this->nic->currentssid) && $this->nic->currentssid === $this->{urldecode($this->uri(4))}->{'ESSID'}): ?>
                        <tr><th>Status:</th><td><i class="fa fa-check green sx"></i>connected</td></tr>
                        <?php endif; ?>
                        <tr>
                            <?php $signal_strength = $this->{urldecode($this->uri(4))}->{'Quality'}; ?>
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
                        <tr><th>Encryption:</th><td><?php if ($this->{urldecode($this->uri(4))}->{'Encryption key'} === 'on' && $this->{urldecode($this->uri(4))}->{'Group Cipher'} != null && strpos($this->{urldecode($this->uri(4))}->IE, 'WPA') !== FALSE OR $this->profile_{urldecode($this->uri(4))}->encryption === 'wpa'): ?><i class="fa fa-lock sx"></i>WPA / WPA2 - PSK <?php if ($this->{urldecode($this->uri(4))}->{'Group Cipher'} === 'CCMP'): ?>(AES)<?php else: ?><?=$this->{urldecode($this->uri(4))}->{'Group Cipher'} ?><?php  endif; ?><?php elseif ($this->{urldecode($this->uri(4))}->{'Encryption key'} === 'on' OR $this->profile_{urldecode($this->uri(4))}->encryption === 'wep'): ?><i class="fa fa-lock sx"></i>WEP<?php elseif ($this->{urldecode($this->uri(4))}->{'Encryption key'} === 'off'): ?><i class="fa fa-unlock-alt sx"></i>none (Open Network)<?php else: ?>unknown<?php endif; ?></td></tr>
                    </tbody>
                    <!--
                    <tfoot>
                        <tr><th><a href="/network/edit/<?=$this->uri(3) ?>"><i class="fa fa-arrow-left sx"></i> back to NIC details</a></th><td></td></tr>
                    </tfoot>
                    -->
                </table>
            </div>
        </fieldset>
        <?php if ($this->nic->currentssid === urldecode($this->uri(4))): ?>
        <fieldset>
            <div class="form-group form-actions">
                <div class="col-sm-12">
                    <a class="btn btn-default btn-lg" href="/network/edit/<?=$this->uri(3) ?>">Cancel</a>
                    <button class="btn btn-primary btn-lg" name="wifiprofile[action]" value="disconnect" type="submit">Disconnect</button>
                    <input type="hidden" name="wifiprofile[ssid]" value="<?=urldecode($this->uri(4)) ?>">
                    <input type="hidden" name="wifiprofile[nic]" value="<?=$this->uri(3) ?>">
                </div>
            </div>
        </fieldset>
        <?php endif; ?>
        <?php endif; ?>
        <?php if (!isset($this->nic->currentssid) || $this->nic->currentssid !== $this->{urldecode($this->uri(4))}->{'ESSID'}): ?>
        <fieldset>
            <?php if($this->stored !== 1): ?>
                <legend>Security parameters</legend>
                <div class="form-group <?php if(urldecode($this->uri(4)) !== 'add'): ?>hide<?php endif; ?>">
                    <label class="col-sm-2 control-label" for="nic[ssid]">SSID</label>
                    <div class="col-sm-10">
                        <input class="form-control osk-trigger input-lg" type="text" id="wifi-ssid" name="nic[ssid]" value="<?php if(urldecode($this->uri(4)) !== 'add'): ?><?=urldecode($this->uri(4)) ?><?php endif; ?>" data-trigger="change" autocomplete="off">
                        <span class="help-block">Set the SSID name of the Wi-Fi you want to connect.</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2 control-label" for="nic[encryption]">Security</label>
                    <div class="col-sm-10">
                        <select id="wifi-security" name="nic[encryption]" class="selectpicker" data-style="btn-default btn-lg">
                            <option value="none" <?php if(urldecode($this->uri(4)) !== null && strpos($this->{urldecode($this->uri(4))}->{'Encryption key'}, 'off') OR $this->profile_{urldecode($this->uri(4))}->encryption === 'open'): ?>selected<?php endif; ?>>none (Open network)</option>
                            <option value="wpa" <?php if(urldecode($this->uri(4)) !== null && strpos($this->{urldecode($this->uri(4))}->IE, 'WPA') OR $this->profile_{urldecode($this->uri(4))}->encryption === 'wpa' ): ?>selected<?php endif; ?>>WPA/WPA2 PSK</option>
                            <option value="wep" <?php if(urldecode($this->uri(4)) !== null && $this->{urldecode($this->uri(4))}->{'Encryption key'} === 'on' && !strpos($this->{urldecode($this->uri(4))}->IE, 'WPA') OR $this->profile_{urldecode($this->uri(4))}->encryption === 'wep'): ?>selected<?php endif; ?>>WEP</option>
                        </select>
                        <span class="help-block">Choose the security type of the Wi-Fi you want to connect.</span>
                    </div>
                </div>
                <div id="wifi-security-key" class="form-group hide">
                    <label class="col-sm-2 control-label" for="nic[key]">Password</label>
                    <div class="col-sm-10">
                        <input type="hidden" name="nic[action]" value="<?php if($this->stored === 1): ?>edit<?php else: ?>add<?php endif; ?>">
                        <?php if($this->addprofile !== 1 && $this->stored !== 1 OR ($this->wlan_autoconnect !== '1' && $this->stored === 1 && isset($this->{urldecode($this->uri(4))}->{'ESSID'}))): ?>
                        <input type="hidden" name="nic[connect]" value="1">
                        <?php endif; ?>
                        <?php if(isset($this->profile_{urldecode($this->uri(4))}->id)): ?>
                        <input type="hidden" name="nic[id]" value="<?=$this->profile_{urldecode($this->uri(4))}->id ?>">
                        <?php endif; ?>
                        <input class="form-control osk-trigger input-lg" type="password" id="wifi-password" name="nic[key]" value="<?=isset($this->profile_{urldecode($this->uri(4))}) ? $this->profile_{urldecode($this->uri(4))}->key : "" ?>" data-trigger="change" autocomplete="off">
                        <span class="help-block">Set the key of the Wi-Fi you want to connect.</span>
                        <div class="checkbox">
                            <label>
                                <input class="sx" type="checkbox" onchange="document.getElementById('wifi-password').type = this.checked ? 'text' : 'password'"> Show password
                            </label>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </fieldset>
        <input type="hidden" name="nic[name]" value="<?=$this->arg ?>" />
        <input type="hidden" name="nic[wireless]" value="<?=$this->nic->wireless ?>" />
        <fieldset>
            <?php if($this->stored !== 1): ?>
                <legend>Interface configuration</legend>
                <div class="form-group">
                    <label class="col-sm-2 control-label" for="nic[dhcp]">IP assignment</label>
                    <div class="col-sm-10">
                        <select id="dhcp" name="nic[dhcp]" class="selectpicker" data-style="btn-default btn-lg">
                            <option value="1" <?php if ($this->{$this->uri(3)}->dhcp === '1'): ?> selected <?php endif; ?>>DHCP</option>
                            <option value="0" <?php if ($this->{$this->uri(3)}->dhcp === '0'): ?> selected <?php endif; ?>>Static</option>
                        </select>
                        <span class="help-block">Choose between DHCP and Static configuration</span>
                    </div>
                </div>
                <div id="network-manual-config" class="hide">        
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="nic[ip]">IP address</label>
                        <div class="col-sm-10">
                            <input class="form-control osk-trigger input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="address" name="nic[ip]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->ip ?>" placeholder="<?=$this->nic_stored->ip ?><?php else: ?>value="0.0.0.0" placeholder="<?=$this->nic->ip ?>"<?php endif; ?> data-parsley-trigger="change" required />
                            <span class="help-block">Manually set the IP address.</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="nic[netmask]">Netmask</label>
                        <div class="col-sm-10">
                            <input class="form-control osk-trigger input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="netmask" name="nic[netmask]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->netmask ?>" data-parsley-trigger="change" placeholder="<?=$this->nic_stored->netmask ?>"<?php else: ?>value="0.0.0.0" data-parsley-trigger="change" placeholder="<?=$this->nic->netmask ?>"<?php endif; ?> required />
                            <span class="help-block">Manually set the network mask.</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="nic[gw]">Gateway</label>
                        <div class="col-sm-10">
                            <input class="form-control osk-trigger input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="gateway" name="nic[gw]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->gw ?>" placeholder="<?=$this->nic_stored->gw ?>" data-parsley-trigger="change"<?php else: ?>value="<?=$this->nic->gw ?>" placeholder="<?=$this->nic->gw ?>" data-parsley-trigger="change"<?php endif; ?> required />
                            <span class="help-block">Manually set the gateway.</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="nic[dns1]">Primary DNS</label>
                        <div class="col-sm-10">
                            <input class="form-control osk-trigger input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="dns1" name="nic[dns1]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->dns1 ?>" placeholder="<?=$this->nic_stored->dns1 ?>" data-parsley-trigger="change"<?php else: ?>value="<?=$this->nic->dns1 ?>" placeholder="<?=$this->nic->dns1 ?>" data-parsley-trigger="change"<?php endif; ?> >
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="nic[dns2]">Secondary DNS</label>
                        <div class="col-sm-10">
                            <input class="form-control osk-trigger input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="dns2" name="nic[dns2]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->dns2 ?>" placeholder="<?=$this->nic_stored->dns2 ?>" data-parsley-trigger="change"<?php else: ?>value="<?=$this->nic->dns2 ?>" placeholder="<?=$this->nic->dns2 ?>" data-parsley-trigger="change"<?php endif; ?> >
                            <span class="help-block">Manually set the primary and secondary DNS.</span>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </fieldset>
        <div class="form-group form-actions">
            <div class="col-sm-offset-2 col-sm-10">
                <?php if($this->stored === 1 && (!isset($this->nic->currentssid) || $this->nic->currentssid !== $this->{urldecode($this->uri(4))}->{'ESSID'})): ?>
                    <a class="btn btn-default btn-lg" href="#wifiprofile-delete-modal" data-toggle="modal">Delete</a>
                <?php endif ?>
                <a class="btn btn-default btn-lg" href="/network/edit/<?=$this->uri(3) ?>">Cancel</a>
                <?php if($this->stored === 1): ?>
                    <!-- Connect -->
                    <button type="submit" class="btn btn-primary btn-lg" name="wifiprofile[action]" value="connect">Connect</button>
                    <input type="hidden" name="wifiprofile[ssid]" value="<?=urldecode($this->uri(4)) ?>">
                    <input type="hidden" name="wifiprofile[nic]" value="<?=$this->uri(3) ?>">
                <?php elseif($this->stored === 1): ?>
                    <!-- Modify profile -->
                    <button type="submit" class="btn btn-primary btn-lg" name="nic[nic]" value="<?=$this->uri(3) ?>">Modify profile</button>
                    <input type="hidden" name="nic[currentssid]" value="<?=$this->nic->currentssid ?>">
                    <input type="hidden" name="nic[newssid]" value="<?=urldecode($this->uri(4)) ?>">
                <?php else: ?>
                    <!-- Save profile -->
                    <button type="submit" class="btn btn-primary btn-lg" name="nic[nic]" value="<?=$this->uri(3) ?>">Save profile</button>
                    <input type="hidden" name="nic[currentssid]"           value="<?=$this->nic->currentssid ?>">
                    <input type="hidden" name="nic[newssid]"               value="<?=urldecode($this->uri(4)) ?>">
                    <input type="hidden" name="nic[GroupCipher]"           value="<?=$this->{urldecode($this->uri(4))}->{'Group Cipher'} ?>">
                    <input type="hidden" name="nic[PairwiseCiphers1]"      value="<?=$this->{urldecode($this->uri(4))}->{'Pairwise Ciphers (1)'} ?>">
                    <input type="hidden" name="nic[PairwiseCiphers2]"      value="<?=$this->{urldecode($this->uri(4))}->{'Pairwise Ciphers (2)'} ?>">
                    <input type="hidden" name="nic[EncryptionKey]"         value="<?=$this->{urldecode($this->uri(4))}->{'Encryption key'} ?>">
                    <input type="hidden" name="nic[AuthenticationSuites1]" value="<?=$this->{urldecode($this->uri(4))}->{'Authentication Suites (1)'} ?>">
                    <input type="hidden" name="nic[AuthenticationSuites2]" value="<?=$this->{urldecode($this->uri(4))}->{'Authentication Suites (2)'} ?>">
                    <input type="hidden" name="nic[ie]"                    value="<?=$this->{urldecode($this->uri(4))}->{'IE'} ?>">
                <?php endif; ?>
            </div>
        </div>
        <fieldset>
            <legend>Actual interface properties</legend>
            <div class="boxed">
                <table id="nic-details" class="info-table" data-name="<?=$this->arg ?>">
                    <tbody>
                        <tr><th>Name:</th><td><strong><?=$this->arg ?></strong></td></tr>
                        <tr><th>Type:</th><td><?php if ($this->nic->wireless === 1): ?>wireless<?php else: ?>wired ethernet<?php endif ?></td></tr>
                        <tr><th>Status:</th><td><?php if ($this->nic->speed !== ' Unknown!' && $this->nic->speed !== null): ?><i class="fa fa-check green sx"></i>connected<?php else: ?><i class="fa fa-times red sx"></i>no network connected<?php endif; ?></td></tr>
                        <?php if(isset($this->nic->currentssid) && $this->nic->currentssid !== 'off/any'): ?><tr><th>Associated SSID:</th><td><strong><?=$this->nic->currentssid ?></strong></td></tr><?php endif; ?>
                        <tr><th>Assigned IP:</th><td><?php if ($this->nic->ip !== null): ?><strong><?php echo $this->nic->ip; ?></strong><?php else: ?>none<?php endif; ?></td></tr>
                        <tr><th>Speed:</th><td><?php if ($this->nic->speed !== ' Unknown!' && $this->nic->speed !== null): ?><?=$this->nic->speed ?><?php else: ?>unknown<?php endif; ?></td></tr>
                    </tbody>
                    <!--
                    <tfoot>
                        <tr><th><a href="/network"><i class="fa fa-arrow-left sx"></i> back to the list</a></th><td></td></tr>
                    </tfoot>
                    -->
                </table>
            </div>
        </fieldset>
        <?php endif; ?>
    </form>
</div>
<div id="wifiprofile-delete-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="wifiprofile-delete-modal-label" aria-hidden="true">
    <form class="form-horizontal" method="post" action="/network/edit/<?=$this->uri(3) ?>">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h3 class="modal-title" id="wifiprofile-delete-modal-label">Remove WiFi settings for SSID: <i><strong><?=urldecode($this->uri(4)) ?></strong></i></h3>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this profile?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-default btn-lg" data-dismiss="modal" aria-hidden="true">Cancel</button>
                    <button type="submit" class="btn btn-primary btn-lg" name="action" value="remove">Remove</button>
                    <input type="hidden" name="wifiprofile[action]" value="delete">
                    <input type="hidden" name="wifiprofile[ssid]" value="<?=urldecode($this->uri(4)) ?>">
                    <input type="hidden" name="wifiprofile[id]" value="<?=urldecode($this->uri(4)) ?>">
                    <input type="hidden" name="wifiprofile[nic]" value="<?=$this->uri(3) ?>">
                </div>
            </div>
        </div>
    </form>
</div>
