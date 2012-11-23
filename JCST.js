
function JCST(){
    this.song = {};
    this.song_progress = 0;
    this.currentEventIndex = 0;
    this.date = new Date();
    this.oldDate = this.date;
    this.dt = 0;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 32000; 
    this.canvas.height = 600;
    this.segment_width = 1;
}


JCST.prototype.loadMidi = function(name, cb){
    var that = this;
   $.get(name, function(data){
       data = $.parseJSON(data);
       data.midi = new Midi(atob(data.midi));

        that.reset();
        that.song = data;
        that.events = that.song.midi.tracks[data.voice_track].events;
        that.render(); 
   });
}

JCST.prototype.reset = function(){
    clearInterval(this.interval);
    this.song_progress = -1;
    this.dt_progress = 0;
};

JCST.prototype.render = function(){

        
    var that = this;

    this.segment_width = 1;
    var segment_height = 20;

    while(this.currentEventIndex < this.events.length-1){
        that.play_forward();

        if(that.events[that.currentEventIndex].type == 9){
        that.ctx.fillRect(this.song_progress*this.segment_width, segment_height*(90-that.events[that.currentEventIndex].note_number), this.segment_width, segment_height);
}
    }

    document.body.appendChild(this.canvas); 

};



JCST.prototype.play_forward = function(){

    this.dt_progress--;

    if(this.dt_progress < 0){
        this.currentEventIndex++;
        console.log("next event");
        this.dt_progress = (this.events[this.currentEventIndex] || {dt:0}).dt;
    }

    this.song_progress++;
};

JesusChristSingStar = JCST;
