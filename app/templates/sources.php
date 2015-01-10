<div class="container">
    <h1>Local sources</h1>
    <div class="boxed">
        <p>Your <a href="/#panel-sx">music library</a> is composed by two main content types: <strong>local sources</strong> and streaming sources.<br>
        This section lets you configure your local sources, telling <a href="http://www.musicpd.org/" title="Music Player Daemon" rel="nofollow" target="_blank">MPD</a> to scan the contents of <strong>network mounts</strong> and <strong>USB mounts</strong>.</p>
        <form action="" method="post">
            <button class="btn btn-lg btn-primary" type="submit" name="updatempd" value="1" id="updatempddb"><i class="fa fa-refresh sx"></i>Rebuild MPD Library</button>
        </form>
    </div>
    
    <h2>Network mounts</h2>
    <p>List of configured network mounts. Click an existing entry to edit it, or add a new one.</p>
    <form id="mount-list" class="button-list" action="" method="post">
        <?php if( !empty($this->mounts) ): ?>
        <p><button class="btn btn-lg btn-primary btn-block" type="submit" name="mountall" value="1" id="mountall"><i class="fa fa-refresh sx"></i> Remount all sources</button></p>
        <?php foreach($this->mounts as $mount): ?>
        <p><a href="/sources/edit/<?php echo $mount['id']; ?>" class="btn btn-lg btn-default btn-block"> <i class="fa <?php if ($mount['status'] == 1): ?> fa-check green <?php else: ?> fa-times red <?php endif ?> sx"></i> <?php echo $mount['name']; ?>&nbsp;&nbsp;&nbsp;&nbsp;<span>//<?php echo $mount['address']; ?>/<?php echo $mount['remotedir']; ?></span></a></p>
        <?php endforeach; endif; ?>
        <p><a href="/sources/add" class="btn btn-lg btn-primary btn-block" data-ajax="false"><i class="fa fa-plus sx"></i> Add new mount</a></p>
    </form>
    
    <h2>USB mounts</h2>
    <p>List of mounted USB drives. To safe unmount a drive, click on it and confirm at the dialog prompt.<br>
    If a drive is connected but not shown in the list, please check if <a href="/settings/#features-management">USB automount</a> is enabled.</p>
    <div id="usb-mount-list" class="button-list">    
    <?php if( $this->usbmounts !== null ): foreach($this->usbmounts as $usbmount): ?>
        <p><a class="btn btn-lg btn-default btn-block" href="#umount-modal" data-toggle="modal" data-mount="<?=$usbmount->device ?>"><i class="fa fa-check green sx"></i><?=$usbmount->device ?>&nbsp;&nbsp;&nbsp;&nbsp;<?=$usbmount->name ?>&nbsp;&nbsp;&nbsp;&nbsp;<?php if (!empty($usbmount->size)): ?><span>(size:&nbsp;<?=$usbmount->size ?>B,&nbsp&nbsp;<?=$usbmount->use ?>&nbsp;in use)</span><?php endif; ?></a></p>
    <?php endforeach; ?>
        <form action="" method="post">
            <div id="umount-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="umount-modal-label" aria-hidden="true">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            <h4 class="modal-title" id="umount-modal-label">Safe USB unmount</h4>
                        </div>
                        <div class="modal-body">
                            <p>Mount point:</p>
                            <pre><span id="usb-umount-name"></span></pre>
                            <p>Do you really want to safe unmount it?</p>
                            <input id="usb-umount" class="form-control" type="hidden" value="" name="usb-umount">
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-default btn-lg" type="button" data-dismiss="modal" aria-hidden="true">Cancel</button>
                            <button class="btn btn-primary btn-lg" type="submit" value="umount"><i class="fa fa-times sx"></i>Unmount</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    <?php else: ?>
        <p><button class="btn btn-lg btn-disabled btn-block" disabled="disabled">no USB mounts present</button></p>
    <?php endif; ?>
    </div>
</div>