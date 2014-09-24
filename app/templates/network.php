<div class="container">
    <h1>Network configuration</h1>
    <div class="boxed">
        <p>Configure wired and wireless connections. See below for the list of the active network interfaces as detected by the system.<br>
        If your interface is connected but does not show, then try to refresh the list forcing the detect.</p>
        <form id="network-refresh" method="post">
            <button class="btn btn-lg btn-primary" name="refresh" value="1" id="refresh"><i class="fa fa-refresh sx"></i>Refresh interfaces</button>
        </form>
    </div>    
    <h2>Network interfaces</h2>
    <p>List of active network interfaces. Click on an entry to configure the corresponding connection.</p>
    <form id="network-interface-list" class="button-list" method="post">
    <?php foreach ($this->nics as $key => $value): ?>
        <p><a href="/network/edit/<?=$key ?>" class="btn btn-lg btn-default btn-block"> <i class="fa <?php if ($value->ip !== null): ?>fa-check green<?php else: ?>fa-times red<?php endif; ?> sx"></i> <strong><?=$key ?> </strong>&nbsp;&nbsp;&nbsp;<span>[<?php if ($value->ip !== null): ?><?=$value->ip ?><?php else: ?>no IP assigned<?php endif; ?>]</span></a></p>
    <?php endforeach; ?>
    </form>
</div>