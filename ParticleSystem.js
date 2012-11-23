
function ParticleSystem(){
    this.num_particles = 0;
    this.particles = [];
    for(var i=0;i<512;i++){
        this.particles[i] = {x:0,y:0,dx:0,dy:0,t:0};
    }
}


ParticleSystem.prototype.update = function(){
    for(var i=0;i<this.num_particles;i++){
        var p = this.particles[i];
        if(p.t <= 0){
            this.num_particles--;
            var q = this.particles[this.num_particles];
            p.x = q.x;
            p.y = q.y;
            p.dx = q.dx;
            p.dy = q.dy;
            p.t = q.t;
        }else{
            p.x += p.dx;
            p.y += p.dy;
            p.dx *= 0.95;
            p.dy *= 0.95;
            p.t--;
        }
    }
}

ParticleSystem.prototype.render = function(ctx){
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for(var i=0;i<this.num_particles;i++){
        var p = this.particles[i];
        ctx.fillStyle = "rgba(255,165,0,"+Math.min(1,p.t/20)+")";
        ctx.fillRect(p.x,p.y,10,10);
    }
    ctx.restore();
}


ParticleSystem.prototype.explode = function(x,y){
    for(var i=0;i<50;i++){
        if(this.num_particles>=this.particles.length-1) return;
        this.num_particles++;
        var p = this.particles[this.num_particles];
        p.x = x;
        p.y = y;

        var length = Math.random()*10; 
        var rotation = Math.random()*Math.PI*0.5;
        p.dx = Math.cos(rotation) * length * (Math.random() < 0.5 ? 1:-1);
        p.dy = Math.sin(rotation) * length * (Math.random() < 0.5 ? 1:-1);

        p.t = 40;
    }
}
