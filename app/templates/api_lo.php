<?php

//add errors to the JSON
$this->error2 = error_get_last();

echo json_encode($this);

?>