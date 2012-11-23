(function(){
    $(document).ready(function(){
        document.getElementById("start-button").addEventListener("click", function() {
            $('#splash-container').fadeOut("fast");
            $('#game-container').fadeIn("fast");
            var song = document.getElementById("song-picker").value;
            jcst.loadMidi('midi/' + song + '.mid.json');
        });
    });
})();

