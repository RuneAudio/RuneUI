<!DOCTYPE html>
<html lang="en">
<?php $this->insert('header') ?>
<?php $this->insert($this->content) ?>
<?php $this->insert('footer') ?>
<?php if (isset($this->dfooter)): ?>
<div id="dfooter">
    <code>
            <?=$this->e($this->dfooter) ?>
    </code>
</div>
<?php endif ?>
</body>
</html>