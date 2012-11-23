(function(){
    $(document).ready(function(){
        document.getElementById("start-button").addEventListener("click", startGame);
    });
    
    var l = new LyricsMachine();
    var lTimer;

    function startGame() {
        l.updateLines(8);
        l.updateLines(8);
        $('#splash-container').fadeOut("fast");
        $('#game-container').fadeIn("fast");
        var song = document.getElementById("song-picker").value;
        lTimer = setInterval(function(){l.updateLines(8)}, 5000);

    }
    function stopGame() {
        clearInterval(lTimer);
    }
})();

