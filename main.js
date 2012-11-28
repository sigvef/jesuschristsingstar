$(document).ready(function(){

    jcst = new JesusChristSingStar();

    var ctx = document.getElementById('canvas').getContext('2d');

    var context = new webkitAudioContext();  

    var pitch = new PitchAnalyzer(context.sampleRate);


    var jsnode = context.createJavaScriptNode(4096);

    var freq = 0;


    var freqs = [];
    for(var i=0;i<4;i++){
        freqs[i] = 0;
    }

    var freq_counter = 0;


    function freq_avg(){
        var total = 0;
        for(var i=0;i<freqs.length;i++){
            total += freqs[i]; 
        }
        return total / freqs.length;
    }


    jsnode.onaudioprocess = function(e){
        var data = e.inputBuffer.getChannelData(0);
        pitch.input(data);
        pitch.process();
        
        var tone = pitch.findTone();
        if(tone){
            if(tone.stabledb > -30){
                /*
                freqs[freq_counter] = tone.freq;
                freq_counter = (freq_counter + 1) % freqs.length;

                jcst.setFreq(freq_avg());
                */

                jcst.setFreq(tone.freq);
            }
        }
    };


    navigator.webkitGetUserMedia({audio: true}, function(stream) {
            console.log("Connected live audio input");
            liveSource = context.createMediaStreamSource(stream);
            liveSource.connect(jsnode);
            jsnode.connect(context.destination);
    }, function(){});

    document.getElementById("start-button").addEventListener("click", function() {
        $('#splash-container').fadeOut("fast");
        $('#game-container').fadeIn("fast");
        var song = document.getElementById("song-picker").value;
        jcst.loadMidi('midi/' + song + '.mid.json');
		
    });
	

});
