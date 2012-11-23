function LyricsMachine() {
    var self = this;
    $.get("lyrics.txt", function(data){
        self.lyrics = data.split("\n");
        console.log(self.lyrics);
    });

};

LyricsMachine.prototype.newLine = function(length) {
    var lyricsIndex = Math.floor(Math.random()*this.lyrics.length);
    var line = this.lyrics[lyricsIndex];
    var words = line.split(" ");
    return words.slice(0,length).join(" ");
}
LyricsMachine.prototype.updateLines = function(length) {
    var line = this.newLine(length);
    document.getElementById("current-line").innerHTML = document.getElementById("next-line").innerHTML;
    document.getElementById("next-line").innerHTML = line;
}
