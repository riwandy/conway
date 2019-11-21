var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/'));

function generateColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function makeGrid(row, col) {
    let arr = new Array(col)
    for(let i=0; i<col; i++) {
        arr[i] = new Array(row);
    }  

    // Initialize grid
    for(let m=0; m<arr.length; m++) {
        for(let n=0; n<arr[0].length; n++) {
            arr[m][n] = 0;
        }
    }

    return arr;
}

function countNeighbour(grid, x, y) {
    let total = 0;
    let list = [];
    for(let j=x-1; j<x+2; j++) {
        for(let i=y-1; i<y+2; i++) {
            if(i >= 0 && j >= 0 && i != grid[0].length && j != grid.length && grid[j][i] != 0 && grid[j][i] != 'grey') {
                total++;
                if(list[grid[j][i]] == null){
                    list[grid[j][i]] = 1;
                }
                else {
                    list[grid[j][i]]++;
                }
            }
        }
    }

    if(grid[x][y] != 0) {
        total--;
        list[grid[x][y]]--;
    }
    
    return {total : total, list : list}
}

const ROWS = 40
const COLS = 60
let grid = makeGrid(ROWS, COLS);
let clients = []

server.listen(8000);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    let color = generateColor()
    clients.push({
        socket : socket, 
        color : color
    });

    socket.emit('init', {
        color : color,
        cols : COLS,
        rows : ROWS
    })

    socket.emit('grid', {
        grid : grid,
        remaining : progress
    })

    socket.on('click',(data)=>{
        if(grid[data.x-1][data.y-1] == 0) {
            grid[data.x-1][data.y-1] = data.color;
        }
    })

    socket.once('disconnect', function() {
        let index = null;
        for(let i=0; i<clients.length; i++) {
            if(clients[i].socket == socket) {
                index = i
            }
        }
        console.log("DISCONNECT : ",clients[index].color);
        
        for(let x=0; x<grid.length; x++) {
            for(let y=0; y<grid[0].length; y++) {
                if(grid[x][y] == clients[index].color) {
                    grid[x][y] = 0;
                }
            }
        }
        
        clients.splice(index, 1);
    });
})

let progress = 100;
setInterval(()=>{
    progress -= 0.1;
},5)

setInterval(function() {
    progress = 100
    let count = null;
    if(grid != null) {
        count = makeGrid(grid[0].length,grid.length)
        for(let x=0; x<grid.length; x++) {
            for(let y=0; y<grid[0].length; y++) {
                count[x][y] = countNeighbour(grid,x,y);
            }
        }

        for(let x=0; x<grid.length; x++) {
            for(let y=0; y<grid[0].length; y++) {
                if(count[x][y].total > 3 || count[x][y].total < 2) {
                    grid[x][y] = 0;
                }
                if(count[x][y].total == 3) {
                    let largest = 0;
                    let largestIndex = null; 
                    for(let key in count[x][y].list) {
                        if((count[x][y].list)[key]>largest) {
                            largestIndex = key;
                        }
                    }
                    grid[x][y] = largestIndex;
                }
            }
        }
    }
    io.sockets.emit('grid', {
        grid : grid,
        remaining : progress
    })
}, 5000)