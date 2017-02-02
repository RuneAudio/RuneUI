<?php
// POST Handler
if (isset($_POST['submit'])){	
	$tmpfile = fopen("/var/www/newcron", "w");
	foreach($_POST['line'] as $alarm){			
		$days = array();
		if (isset($alarm['alarmday1'])) $days[] = "1";
		if (isset($alarm['alarmday2'])) $days[] = "2";
		if (isset($alarm['alarmday3'])) $days[] = "3";
		if (isset($alarm['alarmday4'])) $days[] = "4";
		if (isset($alarm['alarmday5'])) $days[] = "5";
		if (isset($alarm['alarmday6'])) $days[] = "6";
		if (isset($alarm['alarmday7'])) $days[] = "7";
		$days = implode(',',$days);
		
		echo "###########".$alarm['alarmvolume'];
		
		if(!isset($alarm['remove'])){
			fwrite($tmpfile, $alarm['alarmmin']." ".$alarm['alarmhour']." * * ".$days." ");
			fwrite($tmpfile,"/usr/bin/mpc clear && /usr/bin/mpc volume 0 && /usr/bin/mpc load \"".$alarm['alarmplaylist']."\" && /usr/bin/mpc play && /var/www/mpc_fade 0 ".$alarm['alarmvolume']." ".$alarm['alarmfadetime']*60 ."\n");
		}
	}
	$msg =  "Alarms saved";
	
	if ($_POST['submit'] == "add"){
		$alarm = $_POST[add];
		$days = array();
		if (isset($alarm['alarmday1'])) $days[] = "1";
		if (isset($alarm['alarmday2'])) $days[] = "2";
		if (isset($alarm['alarmday3'])) $days[] = "3";
		if (isset($alarm['alarmday4'])) $days[] = "4";
		if (isset($alarm['alarmday5'])) $days[] = "5";
		if (isset($alarm['alarmday6'])) $days[] = "6";
		if (isset($alarm['alarmday7'])) $days[] = "7";
		$days = implode(',',$days);
		
		if(!isset($alarm['remove'])){
			fwrite($tmpfile, $alarm['alarmmin']." ".$alarm['alarmhour']." * * ".$days." ");
			fwrite($tmpfile,"/usr/bin/mpc clear && /usr/bin/mpc volume 0 && /usr/bin/mpc load \"".$alarm['alarmplaylist']."\" && /usr/bin/mpc play && /var/www/mpc_fade 0 ".$alarm['alarmvolume']." ".$alarm['alarmfadetime']*60 ."\n");
		}
		$msg =   "Alarm added";
	}
	fclose($tmpfile);
	
	shell_exec('crontab /var/www/newcron');
	//shell_exec('/usr/bin/rm -f /var/www/newcron');
	
	header( 'HTTP/1.1 303 See Other' );
    header( 'Location:');
}
?>

<div class="container alarm">
<h1>Alarm Clock:</h1>

<?php
	//Messages only show if header reload is removed
	if(isset($msg))	echo "<div class=\"boxed-group\" id=\"airplayBox\">$msg</div>";
?>

<form action="/alarm/" method="post">
<fieldset>
<legend>Alarms</legend>

<table class="alarmtable"><tr>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">Wake-up time:</label></td>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">Playlist to play:</label></td>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">Alarm days:</label></td>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">End volume:</label></td>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">Fade time</label></td>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px; width:200px;"><label class="alarmcat">Remove</label></td>
	</tr>

<?php
    // Read Alarms
	$playlists = 	explode("\n", shell_exec("/usr/bin/mpc lsplaylists"));
	array_pop($playlists); //remove empty last line
	
	$alarms = 		explode("\n", shell_exec("crontab -l"));
	array_pop($alarms); //remove empty last line
	
	$line = 1;
	foreach($alarms as $alarm){		
		$alarmdata =  explode(" ", $alarm,6);
		
		$alarmhour = $alarmdata[1];
		$alarmmin = $alarmdata[0];
		$alarmdays = explode(",", $alarmdata[4]);	
		$alarmday = array();
		if(in_array("1", $alarmdays)) $alarmday[1] = "checked"; 	
		if(in_array("2", $alarmdays)) $alarmday[2] = "checked";
		if(in_array("3", $alarmdays)) $alarmday[3] = "checked";
		if(in_array("4", $alarmdays)) $alarmday[4] = "checked";
		if(in_array("5", $alarmdays)) $alarmday[5] = "checked";
		if(in_array("6", $alarmdays)) $alarmday[6] = "checked";
		if(in_array("7", $alarmdays)) $alarmday[7] = "checked";
		
		$alarmplaylist = explode("\"",$alarmdata[5])[1];
		
		$tmp_data = explode(" ",$alarmdata[5]);
		$alarmvolume = intval($tmp_data[count($tmp_data) - 2]);
		$alarmfadetime = $tmp_data[count($tmp_data) - 1]/60;

		echo "
		<tr>
			<td class=\"alarmvalue\" style=\"border:1px solid #34495e; padding:2px 15px;\">
				<select name=\"line[$line][alarmhour]\" class=\"form-control\" style=\"visibility:visible; width:80px; display:inline;\">";
					for ($i = 0; $i <= 24; $i++){
						if (intval($alarmhour) == $i) {
							echo "<option value=\"$i\" selected>$i</option>\n";
						}else{
							echo "<option value=\"$i\">$i</option>\n";
						}
					}						
					echo "</select> : 
				<select name=\"line[$line][alarmmin]\" class=\"form-control\" style=\"visibility:visible; width:80px; display:inline;\">";
					for ($i = 0; $i <= 55; $i+=5){
						if (intval($alarmmin) == $i) {
							echo "<option value=\"$i\" selected>$i</option>\n";
						}else{
							echo "<option value=\"$i\">$i</option>\n";
						}
					}						
					echo "</select>
			</td>
			<td class=\"alarmvalue\" style=\"border:1px solid #34495e; padding:2px 15px;\">
				<select name=\"line[$line][alarmplaylist]\" id=\"playlist_wrongstyle\" class=\"form-control\"  style=\"visibility:visible; width:250px;\">";
					foreach ($playlists as $playlist){
						if ($playlist == $alarmplaylist) {
							echo "<option value=\"$playlist\" selected>$playlist</option>\n";
						}else{
							echo "<option value=\"$playlist\">$playlist</option>\n";
						}							
					}
					echo "</select>				
			</td>
			<td class=\"alarmvalue\" style=\"border:1px solid #34495e; padding:2px 15px;\">
				<input type=\"checkbox\" name=\"line[$line][alarmday1]\" id=\"alarmday1\" value=\"1\" $alarmday[1] style=\"\"><label for=\"alarmday1\">Monday </label></br>
				<input type=\"checkbox\" name=\"line[$line][alarmday2]\" id=\"alarmday2\" value=\"2\" $alarmday[2] style=\"\"><label for=\"alarmday2\">Tuesday </label></br>
				<input type=\"checkbox\" name=\"line[$line][alarmday3]\" id=\"alarmday3\" value=\"3\" $alarmday[3] style=\"\"><label for=\"alarmday3\">Wednesday </label></br>
				<input type=\"checkbox\" name=\"line[$line][alarmday4]\" id=\"alarmday4\" value=\"4\" $alarmday[4] style=\"\"><label for=\"alarmday4\">Thursday </label></br>
				<input type=\"checkbox\" name=\"line[$line][alarmday5]\" id=\"alarmday5\" value=\"5\" $alarmday[5] style=\"\"><label for=\"alarmday5\">Friday </label></br>
				<input type=\"checkbox\" name=\"line[$line][alarmday6]\" id=\"alarmday6\" value=\"6\" $alarmday[6] style=\"\"><label for=\"alarmday6\">Saturday </label></br>
				<input type=\"checkbox\" name=\"line[$line][alarmday7]\" id=\"alarmday7\" value=\"7\" $alarmday[7] style=\"\"><label for=\"alarmday7\">Sunday </label></br>
			</td>
			<td class=\"alarmvalue\" style=\"border:1px solid #34495e; padding:2px 15px;\">
				<select name=\"line[$line][alarmvolume]\" class=\"form-control\" style=\"visibility:visible; width:80px; display:inline;\">";
					for ($i = 10; $i <= 100; $i+=10){
						if (intval($alarmvolume) == $i) {
							echo "<option value=\"$i\" selected>$i</option>\n";
						}else{
							echo "<option value=\"$i\">$i</option>\n";
						}
					}						
					echo "</select> %
			</td>
			<td class=\"alarmvalue\" style=\"border:1px solid #34495e; padding:2px 15px;\">
	<select name=\"line[$line][alarmfadetime]\" class=\"form-control\" style=\"visibility:visible; width:80px; display:inline;\">";
					for ($i = 5; $i <= 30; $i+=5){
						if (intval($alarmfadetime) == $i) {
							echo "<option value=\"$i\" selected>$i</option>\n";
						}else{
							echo "<option value=\"$i\">$i</option>\n";
						}
					}						
					echo "</select> min
			</td>
			<td class=\"alarmvalue\" style=\"border:1px solid #34495e; padding:2px 15px;\">
				<label class=\"switch-light well_\" onclick=\"\">
					<input id=\"remove\" name=\"line[$line][remove]\" type=\"checkbox\" value=\"$line\">
					<span><span>keep</span><span>remove</span></span><a class=\"btn btn-primary\"></a>
					</label>

			</td>
		</tr>";		
		$line++;
	} 
?>
</table>
<button type="submit" class="btn btn-primary btn-lg" name="submit" value="save">Save</button>

</br></br></br>


<legend>Add Alarm</legend>
<table class="alarmtable"><tr>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">Wake-up time:</label></td>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">Playlist to play:</label></td>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">Alarm days:</label></td>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">End volume:</label></td>
		<td class="alarmcat" style="border:1px solid #34495e; padding:2px 15px;"><label class="alarmcat">Fade time</label></td>
	</tr><tr>		
	<td class="alarmvalue" style="border:1px solid #34495e; padding:2px 15px;">
		<select name="add[alarmhour]" class="form-control" style="visibility:visible; width:80px; display:inline;">
			<?php for ($i = 0; $i <= 24; $i++){echo "<option value=\"$i\">$i</option>\n";} ?>
		</select> : 
		<select name="add[alarmmin]" class="form-control" style="visibility:visible; width:80px; display:inline;">
			<?php for ($i = 0; $i <= 55; $i+=5){echo "<option value=\"$i\">$i</option>\n";} ?>
		</select>
	</td>
	<td class="alarmvalue" style="border:1px solid #34495e; padding:2px 15px;">
		<select name="add[alarmplaylist]" id="playlist_wrongstyle" class="form-control"  style="visibility:visible; width:250px;">
			<?php foreach ($playlists as $playlist){echo "<option value=\"$playlist\">$playlist</option>\n";} ?>
		</select>
	</td>
	<td class="alarmvalue" style="border:1px solid #34495e; padding:2px 15px;">
		<input type="checkbox" name="add[alarmday1]" id="days" value="1" checked> Monday</br> 	
		<input type="checkbox" name="add[alarmday2]" id="days" value="2" checked> Tuesday</br> 
		<input type="checkbox" name="add[alarmday3]" id="days" value="3" checked> Wednesday</br>
		<input type="checkbox" name="add[alarmday4]" id="days" value="4" checked> Thursday</br> 	
		<input type="checkbox" name="add[alarmday5]" id="days" value="5" checked> Friday</br>
		<input type="checkbox" name="add[alarmday6]" id="days" value="6"> Saturday</br> 	
		<input type="checkbox" name="add[alarmday7]" id="days" value="7"> Sunday</br>
	</td>
	<td class="alarmvalue" style="border:1px solid #34495e; padding:2px 15px;">
		<select name="add[alarmvolume]" class="form-control" style="visibility:visible; width:80px; display:inline;">
			<?php for ($i = 10; $i <= 100; $i+=10){echo "<option value=\"$i\">$i</option>\n";} ?>
		</select> %
	</td>
	<td class="alarmvalue" style="border:1px solid #34495e; padding:2px 15px;">
		<select name="add[alarmfadetime]" class="form-control" style="visibility:visible; width:80px; display:inline;">
			<?php for ($i = 5; $i <= 30; $i+=5){echo "<option value=\"$i\">$i</option>\n";} ?>
		</select> min
	</td>
</tr></table>
<button type="submit" class="btn btn-primary btn-lg" name="submit" value="add">Add Alarm</button>
</fieldset>
</form>
</div>



