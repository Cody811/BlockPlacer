
var initializeInputs = function()
{

    var widthslider = new Slider(document.getElementById('widthSlider'), {

        formatter: function(value) {
            return 'Current value: ' + value;
        }
    }).on('slide', restart);

    var heightSlider = new Slider(document.getElementById('heightSlider'), {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    }).on('slide', restart);

    var speedSlider = new Slider(document.getElementById('speedSlider'), {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    }).on('slide', updateSpeed);
};

var updateSpeed = function(){
    frameRate(parseInt(speedSlider.value));
};

let width = 640;
let height = 900;
let scale = 20;
let cells = [];
let walkerX = 6;
let walkerY = 7;
let motions = [];
let canvas;

var restart = function(){
    cells = [];

    motions = [];
    width = (widthSlider.value * 20) + 40;
    height = (heightSlider.value * 20) + 40;
    for(var i = 0; i < (width / scale) - 2; i++){
        var ar = [];
        for(var j = 0; j < (height / scale) - 2; j++){
            ar.push(new cell(i, j));
        }
        cells.push(ar);
    }
    walkerX = Math.floor(Math.random() * widthSlider.value);
    walkerY = Math.floor(Math.random() * heightSlider.value);
    canvas = createCanvas(width, height);
    canvas.parent("mazeBox");
    if(parseInt(speedSlider.value) == 0) redraw();
};

function setup() {
    frameRate(5);
    restart();
    canvas = createCanvas(width, height);
    canvas.parent("mazeBox");
};

function draw() {
    background(0,0,255);
    fill(255,0,0);
    for(var i = 0; i < (width / scale) - 2; i++){
        for(var j = 0; j < (height / scale) - 2; j++){
            cells[i][j].draw();
        }
    }
    var wxp = (walkerX * scale) + scale;
    var wyp = (walkerY * scale) + scale;
    fill(255, 20, 20)

    walk();
    if(motions.length == 0){
        cells[walkerX][walkerY].deadend = true;

    } else {
        rect(wxp + 3, wyp + 3, scale - 6, scale -6);
    }
}

function walk(){
    var n = cells[walkerX][walkerY].unvisitedNeighbors();

    var next = n[Math.floor(Math.random() * n.length)];
    var cur = cells[walkerX][walkerY];
    if(!next){ //Stuck, need to back up
        var dir = motions.pop(); //Top, Right, Bottom, Left
        dir = (dir + 2) % 4
        switch(dir){
            case 0:
                cur.visit(0);
                walkerY--;
                break;
            case 1:
                cur.visit(1);
                walkerX++;
                break;
            case 2:
                cur.visit(2);
                walkerY++;
                break;
            case 3:
                cur.visit(3);
                walkerX--;
                break;
        }
        return;
    }
    if(cur.x < next.x){ // Moving Right
        next.visit(3);
        cur.visit(1);
        walkerX++;
        motions.push(1);
    } else if (cur.x > next.x){ //Moving Left
        next.visit(1);
        cur.visit(3);
        walkerX--;
        motions.push(3);
    } else if (cur.y > next.y){ //moving up
        next.visit(2);
        cur.visit(0);
        walkerY--;
        motions.push(0);
    } else if (cur.y < next.y){ //moving down
        next.visit(0);
        cur.visit(2);
        walkerY++;
        motions.push(2);
    }
}



function cell(x, y){
    this.x = x;
    this.y = y;
    this.xp = (x * scale) + scale;
    this.yp = (y * scale) + scale;
    this.walls = [true, true, true, true]; //Top, Right, Bottom, Left
    this.visited = Math.random() > 1.1;
    this.deadend = false;

    this.unvisitedNeighbors = function(){
        var n = this.getNeighbors();
        var un = [];
        for(var c in n){
            if(!n[c].visited)
                un.push(n[c]);
        }
        return un;
    };

    this.visit = function(side){ //02 and 13
        this.visited = true;
        this.walls[side] = false;
        var ns = this.unvisitedNeighbors();
        this.deadend = ns.length === 0;


    };

    this.getNeighbors = function(){
        var neighbors = [];
        if(y + 1 < cells[0].length && cells[x][y+1])
            neighbors.push(cells[x][y+1]);//Up
        if(y > 0 && cells[x][y-1])
            neighbors.push(cells[x][y-1])//Down
        if(x + 1 < cells.length && cells[x+1][y])
            neighbors.push(cells[x+1][y])//Right
        if(x > 0 && cells[x-1][y])
            neighbors.push(cells[x-1][y])//Left
        return neighbors;
    };


    this.draw = function(){
        if(this.deadend){
            fill(200, 200, 200);
        } else if(this.visited)
            fill(100, 255, 100);
        else
            fill(100, 100, 255);
        strokeWeight(0);
        rect(this.xp, this.yp, scale, scale);
        strokeWeight(5);
        fill(255,0,0);
        var w = 1; //Wall size. Larger W => smaller walls
        if(this.walls[0])
            line(this.xp + w, this.yp+w, this.xp + scale - w, this.yp +w);
        if(this.walls[3])
            line(this.xp + w, this.yp + w, this.xp +w, this.yp + scale -w);
        if(this.walls[1])
            line(this.xp + scale - w, this.yp +w, this.xp + scale -w, this.yp + scale-w);
        if(this.walls[2])
            line(this.xp +w, this.yp + scale-w, this.xp + scale-w, this.yp + scale-w);

    }
}

initializeInputs();