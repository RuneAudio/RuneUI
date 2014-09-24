<?php
session_start();
session_write_close();
// session_destroy();

echo "<pre>\n";
echo "sessionID: ".session_id()."\n";
print_r($_SESSION);
echo "</pre>\n";
