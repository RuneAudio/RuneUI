<div class="container credits">
    <h1>volume fade over time:</h1>

<form action="/fade/" method="post">
        <h2><b>Start Volume : </b><?php
			$startvol = shell_exec('/usr/bin/mpc  volume | sed -e "s/[^0-9]*\([0-9]*\).*/\1/" | tr -d "\n" ');
                        // $startvol = shell_exec('/usr/bin/mpc  volume | sed -e "s/[^0-9]*\([0-9]*\).*/\1/"');
                        echo "$startvol";
                        ?>
        </h2></p>
                        <p><input class="form-control" name="endvolstr" type="number" min="0" max="100" required autofocus> END VOLUME</p>
                        <p><input class="form-control" name="timestr" type="number" maxlength="4" min="10" max="3600" value="3600"> TIME (DEFAULT = 1 HOUR) </p>
			<p><button type="submit" class="btn btn-primary btn-lg" name="submit" value="save">start fade</button></p>
                </ul>
        </form>
</div>

<?php

// Open the text file
$mpc = "/var/www/mpc_fade"; 
$startvol = shell_exec('/usr/bin/mpc  volume | sed -e "s/[^0-9]*\([0-9]*\).*/\1/" | tr -d "\n" ');
$endvol = isset($_POST["endvolstr"]) ? $_POST['endvolstr'] : '';;
$time = isset($_POST["timestr"]) ? $_POST['timestr'] : '';;

// Write text
if (!empty($endvol)) {
	shell_exec(''.escapeshellarg($mpc).' '.escapeshellarg($startvol).' '.escapeshellarg($endvol).' '.escapeshellarg($time).'  > /dev/null 2>/dev/null &');
	header("refresh:0");
}

?>

</div>
