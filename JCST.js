
function JCST(){
    this.song = {};
    this.song_progress = 0;
    this.currentEventIndex = 0;
    this.date = new Date();
    this.oldDate = this.date;
    this.dt = 0;
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.segment_width = 1;
    this.lyrics = new LyricsMachine();
    this.notes = [];
    this.cached_note_start = 0;
    this.pixels_per_second = 400;
    this.pixels_per_semitone = 20;
}


JCST.prototype.loadMidi = function(name, cb){
    var that = this;
    console.log(name);
   $.get(name, function(data){
       data = $.parseJSON(data);
       data.midi = new Midi(atob(data.midi));

        that.reset();
        that.song = data;
        that.events = that.song.midi.tracks[data.voice_track].events;
        that.render(); 
        that.lyrics.play();

        var events = that.song.midi.tracks[data.voice_track].events;

        var note_start = 0;

        var time = 0;

        for(var i=0;i<events.length;i++){
            var event = events[i];
            time += event.dt / that.song.midi.ticks_per_second;

            if(event.type == 9){
                note_start = time; 
            }
            else if(event.type == 8){
                that.notes.push({start:note_start, length: time-note_start, note_number:event.note_number});
            }
        }

        console.log("ladedd");
        that.start();

   });
}

JCST.prototype.start = function(){
    
    var that = this;
    setInterval(function(){that.render()},10);

};

JCST.prototype.reset = function(){
    clearInterval(this.interval);
    this.song_progress = -1;
    this.dt_progress = 0;
    this.notes = [];
};


JCST.prototype.getNotesBetween = function(from, to){

    var notes = [];

    var i = this.cached_note_start;

    while(this.notes[i].start <= from){
        i++;
    }


    while(this.notes[i].start < to){
        notes.push(this.notes[i]);
        i++;
    }   

    return notes;
};



JCST.prototype.render = function(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    var notes = this.getNotesBetween(0,10);

    console.log(notes.length);
    for(var i=0;i<notes.length;i++){
        var note = notes[i];
        this.ctx.fillRect(note.start*this.pixels_per_second, (80-note.note_number)*this.pixels_per_semitone, note.length*this.pixels_per_second, 1*this.pixels_per_semitone);
    }
};


JesusChristSingStar = JCST;
