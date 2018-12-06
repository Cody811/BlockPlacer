var resetValues = function(){
    width = parseInt(widthSlider.value);
    height = parseInt(heightSlider.value);
    box = fillBox(width, height, box, '0');
    answer.innerText = "";
};


var initializeInputs = function()
{

    var widthSlider = new Slider(document.getElementById('widthSlider'), {

        formatter: function(value) {
            return 'Current value: ' + value;
        }
    }).on('slide', resetValues);

    var heightSlider = new Slider(document.getElementById('heightSlider'), {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    }).on('slide', resetValues);

    var blockWidthSlider = new Slider(document.getElementById('blockWidthSlider'), {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });

    var blockHeightSlider = new Slider(document.getElementById('blockHeightSlider'), {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });
};

initializeInputs();



var width = 8;
var height = 8;
var box = [];
var blocks = [[3, 3]];
var nPlaced = 0;
var moves = [];
var startTime = performance.now();

/*
Error Definitions:
Double Print Error: Thrown when you attempt to print on a cell which has already been printed to
Out Of Bounds Error: Thrown when you attempt to print to a cell not in the box
 */

var placeBlock = function(x, y, block, box, token, force){
    if(y > box.length || x > box[0].length) {return box;} //even when forced, this makes no sense

   // console.log("placing");
    for(var i = 0; i < block[0]; i++){
        for(var j = 0; j < block[1]; j++){
            if(i + x < box[0].length && j + y < box.length){
                if(box[j + y][i + x] == '0' || force){
                    box[j + y][i + x] = token;
                } else {
                    throw "Double Print Error";
                }
            } else {
                throw "Out Of Bounds Error";
            }
        }
    }
    return box;
}

var fillBox = function(x, y, box, token){
    box = [];
    for(var i = 0; i < y; i++){
        var ar = [];
        for(var j = 0; j < x; j++){
            ar[j] = token;
        }
        box[i] = ar;
    }
    return box;
};


var print = function(){
    document.getElementById("out").innerText = out;
};

var makeMove = function(x, y, blockId, box, token){
        var afterBox = placeBlock(x, y, blocks[blockId], box, token, false);
        moves.push([x, y, blockId, token]);
        return afterBox;



}

var undoMove = function(box){
    //out += "undo\n";
    if(moves.length === 0){
        throw "No Moves To Undo";
    }
    var move = moves.pop();
    box = placeBlock(move[0], move[1], blocks[move[2]], box, '0', true);
    return [move[2] + 1, box];
}

var revert = function(box){
    var result = undoMove(box);
    var nextMove = result[0];
    while(nextMove >= blocks.length){
        result = undoMove(box);
        nextMove = result[0]
    }
    return result;
};

var getNextSpot = function(box, start){
    start = start || [0,0];

    for(var i = start[1]; i < box.length; i++){
        for(var j = start[0]; j < box[0].length; j++){
            if(box[i][j] == '0'){
                return [j, i];
            }
        }
        start[0] = 0;
    }
    return "No Start Found, Full After Start";
}

var isFull = function(box){
    for(var i = 0; i < box.length; i++) {
        for (var j = 0; j < box[0].length; j++) {
            if (box[i][j] === '0') return false;
        }
    }
    return true;
}

var clearBlocks = function(){
    blocks = [];
    answer.innerText = "";
}


var getPossibleBoxes = function(box, getFirst) {
    var solutions = [];
    var spot = getNextSpot(box);
    var lim = 0;
    var backup = duplicate(box);
    var nextMove = 0;
    var looking = true;
    while (looking) {
        try {
            backup = duplicate(box);
            box = makeMove(spot[0], spot[1], nextMove, box, '' + ++nPlaced);
            nextMove = 0;
        } catch(error){
            //out += error + "\n";
            box = duplicate(backup);
            if(nextMove + 1 <= blocks.length){
                nextMove++;
            } else {
                try {
                    var result = revert(box);
                    box = result[1];
                    nextMove = result[0];
                } catch(error){
                    //console.log(error)
                    looking = false;
                }
            }
        }
        if(isFull(box)){
            console.log("solution");
            solutions.push(duplicate(box));
            if(getFirst) return solutions;
        }
        spot = getNextSpot(box);
        if(!Array.isArray(spot)){
            try {
                var result = revert(box);
                box = result[1];
                nextMove = result[0];
            } catch(error){
                //console.log(error)
                looking = false;
            }
        }


    }
    return solutions;
};

var isItPossible = function(){
    box = fillBox(width, height, box, '0');
    answer = document.getElementById("answer");
    answer.innerText = "thinking...";
    answer.innerText = getPossibleBoxes(box, true).length > 0 ? "Yes" : "No";
    displaySolution(getPossibleBoxes(box, true));
};

var addBlock = function(){
    if(blocks.length < 5){
        answer.innerText = "";
        blocks.push([parseInt(blockHeightSlider.value), parseInt(blockWidthSlider.value)]);
        blocks.sort(function(a, b){
            if((a[0] * a[1]) > (b[0] * b[1])){
                return 1;
            } else if ((a[0] * a[1]) < (b[0] * b[1])){
                return -1;
            }
            return 0;
        });
    }
};

var printSolutions = function(solutions){
    console.log(solutions);
    console.log(performance.now() - startTime)
};

var duplicate = function(ar){
    var newArray = ar.map(function(arr) {
        return arr.slice();
    });
    return newArray;
};

var findAllSolutions = function(){
    box = fillBox(width, height, box, '0');
    downloadCanvas(displaySolution(getPossibleBoxes(box)));
};
/*    */
var displaySolution = function(solutions){
    var getD = function(){
        return Math.floor(Math.random() * 5);
    };

    var getAr = function(size){
        var ar = [];
        for(var i = 0; i < size; i++){
            ar.push(getD())
        }
        return ar;
    }
    var getDoubleAr = function(height, width){
        var ar = [];
        for(var i = 0; i < height; i++){
            ar.push(getAr(width))
        }
        return ar;
    }

    var getSampleOut = function(amount, height, width){
        var ar = [];
        for(var i = 0; i < amount; i++){
            ar.push(getDoubleAr(height, width))
        }
        return ar;
    }

    var colorCode = {};
    var xIndex = 0;
    var yIndex = 0;

    var scale = 3;

    var canvas = document.createElement("canvas");
    var dimension = Math.ceil(Math.sqrt(solutions.length * (solutions[0].length + 1) * (solutions[0][0].length + 1))) + 10;
    canvas.width = dimension * scale;
    canvas.height = dimension  * scale;
    const ctx = canvas.getContext('2d');

    for(var n = 0; n < solutions.length; n++){
        colorCode = {};
        sampleAr = solutions[n];


        for(var i = 0; i < sampleAr[0].length; i++){
            for (var j = 0; j < sampleAr.length; j++){
                if(!colorCode[sampleAr[j][i]]){
                    colorCode[sampleAr[j][i]] = getRandomColor(Object.values(colorCode));
                }
                ctx.fillStyle = colorCode[sampleAr[j][i]];
                ctx.fillRect((i + xIndex) * scale, (j + yIndex) * scale, 1 * scale, 1 * scale);

            }
        }
        xIndex += sampleAr[0].length + 1;
        if((xIndex + sampleAr[0].length)* scale > canvas.width){
            yIndex+= sampleAr.length + 1;
            xIndex = 0;

        }
    }

    function getRandomColor(notFromList) {
        notFromList = (notFromList || []);
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 3; i++) {
            color += letters[Math.floor(Math.random() * 16)] + '0'; //add 0 to make colors "very different"
        }
        return notFromList.includes(color) ? getRandomColor(notFromList) : color;
    }
    return canvas;
};

var downloadCanvas = function(canvas){
    var download = document.createElement('a');
    download.href = canvas.toDataURL();
    download.download = "solution";
    download.click()
}
/*  */
function setup() {
    frameRate(10);
    var a =document.getElementById("previewBox")
    canvas = createCanvas(1000, 500);
    canvas.id("previewCanvas");
    canvas.parent("previewBox");
    resetValues();
}

function draw() {
    background("#f0f0f5");
    fill(255, 0, 0);
    fill(200, 200, 200);
    scale = 12;

    /*The Text*/
    textSize(20);
    fill("#000000");
    textAlign(RIGHT, TOP);
    text("Can you fill this Box: ", 200, 100);
    text("Preview: ", 600, 10);
    text(" with these Blocks: ", 600, 100);
    text( blocks.length + " / 5 blocks ", 600, 200);

    /* The line */
    strokeWeight(3);
    line(0, 80, canvas.width, 80);

    /*The Box */
    var offsetX = 200;
    var offsetY = 100;

    for(var i = 0; i <= height; i++){
        line(offsetX ,offsetY + ((0 + i) * scale), (width * scale) + offsetX,offsetY + ((0 + i) *  scale))
    }

    for(var j = 0; j <= width; j++){
        line(offsetX + ((0 + j) * scale),  offsetY, offsetX + ((0 + j) * scale), offsetY + (height * scale))
    }

    /* The Preview */
    offsetX = 650;
    offsetY = 10;
    var preHeight = parseInt(blockHeightSlider.value);
    var preWidth = parseInt(blockWidthSlider.value);

    for(var i = 0; i <= preWidth; i++){
        line(offsetX ,offsetY + ((0 + i) * scale), (preHeight * scale) + offsetX,offsetY + ((0 + i) *  scale))
    }
    for(var i = 0; i <= preHeight; i++){
        line(offsetX + ((i) * scale),  offsetY, offsetX + ((i) * scale), offsetY + (preWidth * scale))
    }

    /*The Blocks*/
    offsetX = 650;
    offsetY = 100;
    for(var b in blocks){
        var block = blocks[b];
        for(var i = 0; i <= block[1]; i++){
            line(offsetX ,offsetY + ((0 + i) * scale), (block[0] * scale) + offsetX,offsetY + ((0 + i) *  scale))
        }
        for(var i = 0; i <= block[0]; i++){
            line(offsetX + ((i) * scale),  offsetY, offsetX + ((i) * scale), offsetY + (block[1] * scale))
        }
        offsetY += (block[1] + 1) * scale

    }


}

box = fillBox(width, height, box, '0');
printSolutions(getPossibleBoxes(box));