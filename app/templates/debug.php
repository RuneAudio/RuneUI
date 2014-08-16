<div class="container debug">
    <h1>DEBUG DATA</h1>
    <div class="boxed">
        <p>Below is displayed the raw output of RuneUI's debug section. It contains some important informations that could help to diagnosticate problems.<br> 
        Please copy and paste it in your posts when asking for help <a href="http://www.runeaudio.com/forum/" title="RuneAudio Forum" target="_blank">in the forum</a>.</p>
        <button id="copy-to-clipboard" class="btn btn-primary btn-lg" data-clipboard-target="clipboard_pre"><i class="fa fa-copy sx"></i> Copy data to clipboard</button>
    </div>
    <br>
    <pre id="clipboard_pre">
        <?=$this->debug ?>
    </pre>
</div>