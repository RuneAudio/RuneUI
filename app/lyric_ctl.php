<?php

// direct output bypass template system
$tplfile = 0;
runelog("\n--------------------- lyric (start) ---------------------");
// turn off output buffering
ob_implicit_flush(0);

ob_clean();
flush();
         
// --------------------- MPD ---------------------
if ($activePlayer === 'MPD' && $redis->Get('lyric')) {
    echo str_replace ( "</br>" , "\n" , sysCmd("sh /var/www/command/lyric.sh")[2]);
}
runelog("\n--------------------- lyric (end) ---------------------");