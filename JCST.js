
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
    this.audio = new Audio();
}


JCST.prototype.loadMidi = function(name, cb){
    var that = this;
    console.log(name);
   $.get(name, function(data){
       data = $.parseJSON(data);
       data.midi = new Midi(atob(data.midi));

        that.reset();
        that.song = data;
        that.lyrics.play();


        /* set tempo */
        for(var i=0;i<data.midi.tracks.length;i++){
        for(var j=0;j<data.midi.tracks[i].events.length;j++){
            that.song.midi.fire_event(data.midi.tracks[i].events[j]);
        }
        }

        that.audio.src = that.song.audio;

        var events = that.song.midi.tracks[data.voice_track].events;

        var note_start = 0;

        var time = 0;

        for(var i=0;i<events.length;i++){
            var event = events[i];
            time += event.dt / that.song.midi.ticks_per_second * that.song.slowness;

            if(event.type == 9){
                note_start = time; 
            }
            else if(event.type == 8){
                that.notes.push({start:note_start, length: time-note_start, note_number:event.note_number});
            }
        }

        that.start();
   });
}

JCST.prototype.start = function(){

    if(this.audio.readyState < 3){
        var that = this;
        return setTimeout(function(){that.start()}, 50);
    }
    
    var that = this;
    this.audio.play();
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

    this.ctx.fillStyle = 'black';
    var seconds_per_beat = this.song.midi.ticks_per_beat/this.song.midi.ticks_per_second;
    var now = this.audio.currentTime + this.song.timeOffset;
    var notes = this.getNotesBetween(now-4*seconds_per_beat,now+12*seconds_per_beat);

    this.ctx.fillRect(seconds_per_beat*this.pixels_per_second, 0, 1, this.canvas.height);


    for(var i=0;i<notes.length;i++){
        var note = notes[i];
        if(note.start < now && note.start+note.length > now){
            this.ctx.fillStyle = 'orange';
        }else{
            this.ctx.fillStyle = 'black';
        }
        this.ctx.fillRect((note.start-now+seconds_per_beat)*this.pixels_per_second, (90-note.note_number)*this.pixels_per_semitone, note.length*this.pixels_per_second, 1*this.pixels_per_semitone);
    }
};


JesusChristSingStar = JCST;
