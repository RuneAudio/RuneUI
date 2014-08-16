<div class="container">
    <h1>Login</h1>
    <div class="row">
        <div class="col-sm-6 offset-sm-3">
            <div class="login" id="login">
                <div class="form-group">
                    <label class="control-label col-sm-2" for="lastfm-usr">Username</label>
                    <div class="col-sm-10">
                        <input class="form-control input-lg" type="text" id="lastfm_user" name="login[user]" value="<?=$this->lastfm['user'] ?>" data-trigger="change" placeholder="user">
                        <span class="help-block">Insert your <i>username</i></span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2" for="lastfm-pasw">Password</label>
                    <div class="col-sm-10">
                        <input class="form-control input-lg" type="password" id="lastfm_pass" name="login[pass]" value="<?=$this->lastfm['pass'] ?>" placeholder="pass" autocomplete="off">
                        <span class="help-block">Insert your <i>password</i> (case sensitive)</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>