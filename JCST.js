window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function( callback ){
        window.setTimeout(callback, 0);
    };
})();

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
    this.note_offset = 0;
    this.particle_tracker = 0;
    this.freq = 440;
    this.last_freq = 0;
    this.points = 0;
    this.$points = $('#points');
    this.ps = new ParticleSystem();

    console.log(this.freq);
    this.ctx.fillRoundedRect = function(x, y, width, height, radius) {
      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + width - radius, y);
      this.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.lineTo(x + width, y + height - radius);
      this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      this.lineTo(x + radius, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();
      this.fill();
    }

    this.particles = [];
    for(var i=0;i<16*4*4;i++){
        this.particles[i] = {t: 0, note_number: 0};
    }

    this.particle_sprite = (function(){
        var GU = 20;
        var sprite = document.createElement('canvas');
        sprite.width = GU*2;
        sprite.height = GU*2;
        var x = sprite.getContext("2d");
        var gradient = x.createRadialGradient(GU,GU,0,GU,GU,GU);
        x.fillStyle = gradient;
        gradient.addColorStop(0,'rgba(0,100,255,1)');
        gradient.addColorStop(1,'rgba(0,100,255,0)');
        x.beginPath();
        x.arc(GU,GU, GU, 0, Math.PI*2);
        x.fill();
        return sprite;
    })();
}


JCST.prototype.loadMidi = function(name){
    var that = this;
   $.get(name, function(data){
        data = $.parseJSON(data);
       data.midi = new Midi(atob(data.midi));

        that.reset();
        that.song = data;

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

        var highest = 0;

        var lowest = 256;

        for(var i=0;i<events.length;i++){
            var event = events[i];
            time += event.dt / that.song.midi.ticks_per_second;

            if(event.type == 9){
                note_start = time; 
            }
            else if(event.type == 8){
                that.notes.push({start:note_start, length: time-note_start, note_number:event.note_number});

                if(event.note_number < lowest){
                    lowest = event.note_number;
                }

                if(event.note_number > highest){
                    highest = event.note_number;
                }
            }
        }

        that.note_offset = highest;

        that.pixels_per_semitone = that.canvas.height/(highest-lowest);

        $('#song-title').text(data.name);

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
    this.lyrics.play(this.song.midi.ticks_per_beat/this.song.midi.ticks_per_second*1000*4*2);
    this.render();

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


JCST.noteToFreq = function(note_number){
    return 440*Math.pow(2,(note_number-57)/12);
};

JCST.freqToNote = function(freq){
    return (Math.log(freq/440)/Math.LN2*12+57);
};


JCST.prototype.setFreq = function(freq){
    this.freq = freq*4;
    this.last_freq = this.audio.currentTime;
};

JCST.prototype.render = function(){
    var that = this;
    requestAnimFrame(function(){that.render()});
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
            if(Math.round(JCST.freqToNote(this.freq)) == note.note_number){
                this.points++;
                this.$points.text(this.points);
                var p = this.particles[(this.particle_tracker + this.particles.length-1) % this.particles.length];
                var x = (p.t - now+seconds_per_beat)*this.pixels_per_second;
                var y = (this.note_offset-p.note_number)*this.pixels_per_semitone;
                console.log(x,y);
                this.ps.explode(x,y);
            }
        }else{
            this.ctx.fillStyle = 'black';
        }
        this.ctx.fillRoundedRect((note.start-now+seconds_per_beat)*this.pixels_per_second, (this.note_offset-note.note_number)*this.pixels_per_semitone, note.length*this.pixels_per_second, 1*this.pixels_per_semitone, 10);

    }

    if(now - this.last_freq < 2){
        var p = this.particles[this.particle_tracker];
        this.particle_tracker = (this.particle_tracker + 1) % this.particles.length;
        p.note_number = JCST.freqToNote(this.freq);
        p.t = now;
    }
    

    this.ctx.fillStyle = 'lightblue';
    var y = (this.note_offset - JCST.freqToNote(this.freq))*this.pixels_per_semitone;
    //this.ctx.fillRect(seconds_per_beat*this.pixels_per_second, y, 20, this.pixels_per_semitone);

    for(var i=0;i<this.particles.length;i++){
        var p = this.particles[i];

        this.ctx.drawImage(this.particle_sprite, (p.t - now+seconds_per_beat)*this.pixels_per_second, (this.note_offset-p.note_number)*this.pixels_per_semitone);
    }

    this.ps.update();
    this.ps.render(this.ctx);
};


JesusChristSingStar = JCST;

    /* smoothstep interpolaties between a and b, at time t from 0 to 1 */
    function smoothstep(a, b, t) {
        console.log("smoothstep",a,b,t);
        t = Math.min(Math.max(1,t),0);
        var v = t * t * (3 - 2 * t);
            return b * v + a * (1 - v);
            };



