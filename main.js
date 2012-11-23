(function(){
    $(document).ready(function(){
        document.getElementById("start-button").addEventListener("click", startGame);
    });

    function startGame() {
        $('#splash-container').fadeOut("fast");
        $('#game-container').show();
    }
})();

