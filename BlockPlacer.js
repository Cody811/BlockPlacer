var out = "Output String\n";

var x = 15;
var y = 10;
var box = [];
var blocks = [[3,3], [1, 5], [6, 7]];
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
    console.log(box);
    return box;
}


var printBox = function(box){
    out += "-----\n";
    for(var i = 0; i < box.length; i++){
        for(var j = 0; j < box[0].length; j++){
            out = out +  "[" + box[i][j] + "]";
        }
        out += "\n";
    }
    out += "-----\n";
    print();
}


var print = function(){
    document.getElementById("out").innerText = out;
};

var makeMove = function(x, y, blockId, box, token){
    //
    // try {
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
    // if(blocks[move[2]] + 1 >= blocks.length){
    //
    //     return undoMove();
    // }
    box = placeBlock(move[0], move[1], blocks[move[2]], box, '0', true);
    // if(Array.isArray(afterBox)){
    //     moves.push(move);
    //     return afterBox;
    // }
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
}

var incrementSpot = function(spot, box){
    if(spot[0] + 1>= box[0].length){
        spot[0] = 0;
        spot[1] = spot[1] + 1;
        if(spot[1] + 1>= box.length){
            return null;
        }
        return spot
    } else {
        spot[0] += 1;
        return spot;
    }
}

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


var getPossibleBoxes = function(box) {
    var solutions = [];
    var spot = getNextSpot(box);
    var lim = 0;
    var backup = duplicate(box);
    var nextMove = 0;
    var looking = true;
    while (looking) {
        //console.log(spot);
        //printBox(box);
        try {
            backup = duplicate(box);
            box = makeMove(spot[0], spot[1], nextMove, box, '' + ++nPlaced);
            nextMove = 0;
        } catch(error){
            //out += error + "\n";
            print();
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
}

var printSolutions = function(solutions){
    out += "\n Solutions\n"
    /*for(var sol in solutions){
        printBox(solutions[sol]);
    }*/
    console.log(solutions);
    console.log(performance.now() - startTime)
}

var duplicate = function(ar){
    var newArray = ar.map(function(arr) {
        return arr.slice();
    });
    return newArray;
}

/* var newArray = currentArray.map(function(arr) {
    return arr.slice();
}); */

//Increment unit test
/*var spot = [0, 0];
while(spot != null){
print();
  out += box[spot[1]][spot[0]] + "\n";
  spot = incrementSpot(spot, box);
  console.log(spot);
} */


box = fillBox(x, y, box, '0');
//printSolutions(getPossibleBoxes(box));