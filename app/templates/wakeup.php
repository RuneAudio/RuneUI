<div class="container">
	<h1>Alarm clock</h1>
	<form class="form-horizontal" action="" method="post" role="form">
		<fieldset>
			<legend>Global status</legend>
			<div class="form-group" >
				<label for="enable" class="col-sm-2 control-label">Enable</label>
				<div class="col-sm-10">
					<label class="switch-light well" onclick="">
						<input name="alarm[enable]" type="checkbox" value="1"<?php if($this->enabled == 1): ?> checked="checked" <?php endif ?>>
						<span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
					</label>
					<span class="help-block">Enable or disable globally the alarm clock.</span>
				</div>
			</div>
		</fieldset>
		<fieldset>
			<legend>Alarms</legend>
			<div class="form-group">
				<div class="col-sm-2 text-right hidden-xs">Day</div>
				<div class="col-xs-12 visible-xs">Day</div>
				<div class="col-sm-2 col-xs-12">Enable</div>
				<div class="col-md-2 col-md-offset-0 col-sm-7 col-sm-offset-1 col-xs-12">Time</div>
				<div class="col-md-2 col-md-offset-0 col-sm-3 col-sm-offset-2 col-xs-12">Duration</div>
				<div class="col-sm-4 col-xs-12">Playlist</div>
				<div class="clearfix visible-xs-block">&nbsp;</div>
			</div>
			<?php
			for($i = 0; $i<7; $i++)
			{
			?>
				<div class="form-group">
					<label class="col-md-2 col-sm-2 control-label"><?php echo $this->alarm[$i]['fullname']; ?></label>
					<div class="col-md-2 col-sm-2">
						<label class="switch-light well" onclick="">
							<input name="alarm[<?=$this->alarm[$i]['shortname'] ?>][enabled]" type="checkbox" <?php if($this->alarm[$i]['enabled']): ?> checked="checked" <?php endif ?>>
							<span><span>OFF</span><span>ON</span></span><a class="btn btn-primary"></a>
						</label>
					</div>
					<div class="col-md-2 col-md-offset-0 col-sm-3 col-sm-offset-1 col-xs-8">
						<input class="form-control input-lg clockpicker col-sm-2" type="text" name="alarm[<?=$this->alarm[$i]['shortname'] ?>][starttime]" value="<?=$this->alarm[$i]['starttime'] ?>" size="6" maxlength="5" readonly style="cursor: pointer">
					</div>
					<div class="clearfix visible-xs-block visible-sm-block"></div>
					<div class="col-md-2 col-md-offset-0 col-sm-3 col-sm-offset-2 col-xs-8">
						<input class="form-control input-lg touchspin" type="text" name="alarm[<?=$this->alarm[$i]['shortname'] ?>][duration]" value="<?=$this->alarm[$i]['duration'] ?>" size="3" maxlength="3" readonly style="cursor: pointer">
					</div>
					<div class="clearfix visible-xs-block"></div>
					<div class="col-md-4 col-sm-5 col-xs-8">
						<select class="form-control selectpicker" data-style="btn-default btn-lg" name="alarm[<?=$this->alarm[$i]['shortname'] ?>][playlist]">
							<option value="">n/a</option>
							<?php if ($this->playlists)
								foreach($this->playlists as $p)
								{
									$name = substr($p, 0, -4);
									$selected = $name == $this->alarm[$i]['playlist'] ? "selected" : "";
									echo "<option value='".$name."' ".$selected.">".$name."</option>";
								}
							?>
						</select>
					</div>
				</div>
			<?php
			}
			?>
			<div class="form-group form-actions">
				<div class="col-sm-offset-2 col-sm-10">
				    <button class="btn btn-primary btn-lg" value="save" name="save" type="submit">Apply</button>
				    <span class="help-block">Save alarms and enable them.<br>
				    A duration equal to 0 means no end time.<br>
				    Please be careful you have selected a playlist otherwise MPD won't wake you up !<br>
				    Furthermore, if you later remove the playlist you set here, you will understand the meaning of "to be late". 
				    </span>
				</div>
			</div>
		</fieldset>
	</form>
</div>


