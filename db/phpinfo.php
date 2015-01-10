<?php

$redis = new Redis(); 
$redis->pconnect('127.0.0.1');
$sub_interfaces = $redis->sMembers($card);

//phpinfo();
?>