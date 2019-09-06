var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var theme = true;
var bird = new Image;
bird.src = './modi1.png';
var pipeImg = new Image;
pipeImg.src = './pipe.png';
var groundImg = new Image;
groundImg.src = './ground.png';
var bgImg = new Image;
bgImg.src = './bg.png';
var isLoaded=0;

TO_RADIANS = Math.PI/180; 
rotateAndPaintImage =  ( context, image, angleInRad , positionX, positionY, axisX, axisY )=> {
    context.translate( positionX, positionY );
    context.rotate( angleInRad );
    context.drawImage( image, -axisX, -axisY );
    context.rotate( -angleInRad );
    context.translate( -positionX, -positionY );
  }

drawRect = (x,y,w,h, color)=>{
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
}

drawText = (text, x, y, size, color = 'black')=>{
    ctx.fillStyle = color;
    ctx.font = size+"px Arial";
    ctx.fillText(text, x,y);
}

insideRect = (x,y,rect)=>{ //rect = {x,y,w,h}
    if(x<rect.x+rect.w && x>rect.x && y>rect.y && y<rect.y+rect.h)
    return true;
    return false;
}

class Bird {

    constructor(){
        this.x=100;
        this.y=0;
        this.size=30;
        this.accelaration = 0.5;
        this.velocity = 0;
        this.time = 0;
        this.yOffset = 0;
    }
    jump = ()=>{
        this.time=-20;
        this.yOffset = this.y-100;
        this.y-=100;
    }

    update = ()=>{
        this.time++;
        this.y =  this.yOffset + 0.5 * this.accelaration * (this.time**2);

        this.draw();
    }
   

    draw = ()=>{
        // ctx.drawImage(bird,this.x, this.y); 
        if(theme)
        rotateAndPaintImage ( ctx, bird, (this.time>60?60:this.time)*TO_RADIANS, this.x, this.y, 0,0 );
        else 
        drawRect(this.x, this.y, this.size, this.size, 'green');
    }
}

class Pipe {
    constructor(width, height, updateScore){
        this.pipes=[];
        this.pipeWidth = 50;
        this.width = width;
        this.height = height;
        this.score = 0;
        this.updateScore=updateScore;
        for(let i=0;i<3;i++){
            this.pipes.push({x:(width)+(250*i), y:Math.random()*(height-250) + 50})
        }
    }

    update = ()=>{
        for(let pipe of this.pipes){
            if(theme){
                ctx.drawImage(pipeImg,pipe.x, pipe.y-500); 
                rotateAndPaintImage ( ctx, pipeImg, 180*TO_RADIANS, pipe.x, 500+ pipe.y+150, 50,0 );
            }
            else {
            drawRect(pipe.x, 0, this.pipeWidth, pipe.y, 'red');
            drawRect(pipe.x, pipe.y+150, this.pipeWidth, this.height, 'red');
            }
            pipe.x-=5; 
            if(pipe.x<100 && !pipe.counted){
                pipe.counted=true;
                this.score++;
                this.updateScore(this.score)
            }
            if(pipe.x< -this.pipeWidth){
                pipe.x=this.width+250;
                pipe.y=Math.random()*(this.height-250) + 50;
                pipe.counted=false;
            }
        }
    }
}

class Board {
    constructor(birdsCount = 5){
        this.width = 500;
        this.height = 500;
        this.score=0;
        this.birdsCount = birdsCount;
        this.pipe = new Pipe(this.width, this.height, this.setScore);
        this.birds = [];
        this.gameOverFlag=false;
        for(let i=0;i<birdsCount; i++){
            this.birds.push(new Bird());
        }
        this.highScore;
    }

    setScore = (score)=>{
       this.score = score;
    }
    gameOver = ()=>{
        this.gameOverFlag=true;
        ctx.drawImage(bgImg,0, 0); 
        drawText("GAME OVER", 80, 150, 60, '#fff');
        drawText("Score:"+this.score, 170, 250, 45, '#fff');
        this.highScore = !this.highScore || this.highScore<this.score ? this.score:this.highScore;
        drawText("High Score:"+this.highScore, 160, 300, 30, '#fff');
        setTimeout(()=>{
            this.pipe = new Pipe(this.width, this.height, this.setScore);
            this.birds = [];
            for(let i=0;i<this.birdsCount; i++){
                this.birds.push(new Bird());
            }
            this.score=0;
        this.gameOverFlag=false;

        },2000)
    }

    update = ()=>{
        if(theme)
        ctx.drawImage(bgImg,0, 0); 
        for(let bird of this.birds){
            bird.update();
        }
        this.pipe.update();
        const size = 30;
        for(let pipe of this.pipe.pipes){
            // drawRect(pipe.x, 0, 50,pipe.y, 'blue')
            // drawRect(pipe.x, pipe.y+150, 50,500, 'yellow')
            if(insideRect(this.birds[0].x+size,this.birds[0].y+size,{x:pipe.x, y:0, w:50,h:pipe.y}) 
            || insideRect(this.birds[0].x+size,this.birds[0].y+size,{x:pipe.x, y:pipe.y+150, w:50,h:500})
            ||insideRect(this.birds[0].x+size,this.birds[0].y,{x:pipe.x, y:0, w:50,h:pipe.y}) 
            || insideRect(this.birds[0].x+size,this.birds[0].y,{x:pipe.x, y:pipe.y+150, w:50,h:500})
            ||this.birds[0].y>500){
                this.gameOver();
                console.log('Game Over')
            }
        }
        if(theme)
        ctx.drawImage(groundImg,0, 400); 
        if(!this.gameOverFlag)
        drawText("Score:"+this.score, 350, 550, 25, '#fff');
        if(!this.highScore)
        drawText("Press any key...", 5, 502, 15, '#000');

        
    }
}

const board = new Board(1);
let oldTime = new Date();
const FPS = 60;
const render = ()=>{
    let now = new Date();
    if( (now - oldTime) > 1000/FPS && !board.gameOverFlag ){
        // Clear screen
        drawRect(0,0,board.width, board.height,'black');
        board.update();
        oldTime = now;
    }
    if(isLoaded>=4)
    requestAnimationFrame(render);
}
bird.onload = function(){
    isLoaded++;
    render();
  };
pipeImg.onload = function(){
    isLoaded++;
    render();
};
groundImg.onload = function(){
    isLoaded++;
    render();
};

bgImg.onload = function(){
    isLoaded++;
    render();
};
addEventListener('keyup', e=>{
    board.birds[0].jump();
 })
 addEventListener('mouseup', e=>{
    board.birds[0].jump();
 })