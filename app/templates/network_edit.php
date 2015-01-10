<div class="container">
    <h1>Network interface</h1>
    <?php if ($this->nic->wireless === 1): ?>
    <legend>Wi-Fi networks in range</legend>
    <span class="help-block">The list of available Wi-Fi networks is automatically refreshed while you are on this page (so don't forget it open in your browser to avoid unnecessary system load).</span>
    <fieldset>
        <div id="wifiNetworks" class="boxed">
            <p><a class="btn btn-lg btn-default btn-block" href="#"><i class="fa fa-cog fa-spin sx"></i>scanning for networks...</a></p>
        </div>
    </fieldset>
    <legend>Wi-Fi stored profiles</legend>
    <fieldset>
        <div class="boxed">
            <label class="switch-light switch-block well" onclick="">
                <input id="wifiProfiles" name="features[airplay][enable]" type="checkbox" value="1"<?php if($this->wifiprofiles['enable'] !== 1): ?> checked="checked" <?php endif ?>>
                <span><span>SHOW<i class="fa fa-chevron-down dx"></i></span><span>HIDE<i class="fa fa-chevron-up dx"></i></span></span><a class="btn btn-primary"></a>
            </label>
            <div id="wifiProfilesBox" class="hide">
                <span class="help-block">Add, edit or delete stored Wi-Fi profiles.</span>
                <div id="wifiStored">
                <?php foreach ($this->wlan_profiles as $profile): ?>
                <p><a href="/network/wlan/<?=$this->arg ?>/<?=$profile->ssid ?>" class="btn btn-lg btn-default btn-block"><?php if ($this->nic->currentssid === $profile->ssid): ?><i class="fa fa-check green sx"></i><?php endif; ?><?php if ($profile->encryption !== 'open'): ?><i class="fa fa-lock sx"></i><?php endif; ?><strong><?=$profile->ssid ?></strong></a></p>
                <?php endforeach; ?>
                </div>
                <p><a href="/network/wlan/<?=$this->arg ?>/add" class="btn btn-primary btn-lg btn-block"><i class="fa fa-plus sx"></i> Add new profile</a></p>
            </div>
        </div>
    </fieldset>
    <?php endif ?>
    <form class="form-horizontal" action="/network" method="post" data-parsley-validate>
        <input type="hidden" name="nic[name]" value="<?=$this->arg ?>" />
        <input type="hidden" name="nic[wireless]" value="<?=$this->nic->wireless ?>" />
        <fieldset>
            <legend>Interface properties</legend>
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
        <!--
        <p>If you mess up with this configuration you can <a data-toggle="modal" href="#net-config-defaults">reset to default</a>.</p>
        -->
        <fieldset>
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
                        <input class="form-control input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="address" name="nic[ip]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->ip ?>" placeholder="<?=$this->nic_stored->ip ?><?php else: ?>value="<?=$this->nic->ip ?>" placeholder="<?=$this->nic->ip ?>"<?php endif; ?> data-parsley-trigger="change" required />
                        <span class="help-block">Manually set the IP address.</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2 control-label" for="nic[netmask]">Netmask</label>
                    <div class="col-sm-10">
                        <input class="form-control input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="netmask" name="nic[netmask]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->netmask ?>" data-parsley-trigger="change" placeholder="<?=$this->nic_stored->netmask ?>"<?php else: ?>value="<?=$this->nic->netmask ?>" data-parsley-trigger="change" placeholder="<?=$this->nic->netmask ?>"<?php endif; ?> required />
                        <span class="help-block">Manually set the network mask.</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2 control-label" for="nic[gw]">Gateway</label>
                    <div class="col-sm-10">
                        <input class="form-control input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="gateway" name="nic[gw]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->gw ?>" placeholder="<?=$this->nic_stored->gw ?>" data-parsley-trigger="change"<?php else: ?>value="<?=$this->nic->gw ?>" placeholder="<?=$this->nic->gw ?>" data-parsley-trigger="change"<?php endif; ?> required />
                        <span class="help-block">Manually set the gateway.</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2 control-label" for="nic[dns1]">Primary DNS</label>
                    <div class="col-sm-10">
                        <input class="form-control input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="dns1" name="nic[dns1]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->dns1 ?>" placeholder="<?=$this->nic_stored->dns1 ?>" data-parsley-trigger="change"<?php else: ?>value="<?=$this->nic->dns1 ?>" placeholder="<?=$this->nic->dns1 ?>" data-parsley-trigger="change"<?php endif; ?> >
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-2 control-label" for="nic[dns2]">Secondary DNS</label>
                    <div class="col-sm-10">
                        <input class="form-control input-lg" type="text" pattern="((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$" id="dns2" name="nic[dns2]" <?php if (isset($this->nic_stored)): ?>value="<?=$this->nic_stored->dns2 ?>" placeholder="<?=$this->nic_stored->dns2 ?>" data-parsley-trigger="change"<?php else: ?>value="<?=$this->nic->dns2 ?>" placeholder="<?=$this->nic->dns2 ?>" data-parsley-trigger="change"<?php endif; ?> >
                        <span class="help-block">Manually set the primary and secondary DNS.</span>
                    </div>
                </div>
            </div>
        </fieldset>
        <div class="form-group form-actions">
            <div class="col-sm-offset-2 col-sm-10">
                <a href="/network" class="btn btn-default btn-lg">Cancel</a>
                <button type="submit" class="btn btn-primary btn-lg" name="save" value="save">Save and apply</button>
            </div>
        </div>
    </form>
</div>
<div id="net-config-defaults" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="mpd-config-defaults-label" aria-hidden="true">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <form name="netconf_reset" method="post" id="netconf_reset">
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
</div>