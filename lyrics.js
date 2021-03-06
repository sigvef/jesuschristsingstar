function LyricsMachine() {
    var self = this;
    $.get("lyrics.txt", function(data){
        self.lyrics = data.split("\n");
    });
    this.timer;
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
LyricsMachine.prototype.play = function(interval) {
    this.updateLines(8);
    this.updateLines(8);
    var that = this;
    this.timer = setInterval(function(){that.updateLines(8)}, interval);
}
LyricsMachine.prototype.pause = function() {
    clearInterval(this.timer);
}
