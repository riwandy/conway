var SIZE = 20
var socket = io.connect('http://localhost:8000');

var color = '#000000';

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var grid = null;
var COLS = 0;
var ROWS = 0;

function draw(grid) {
    clearCanvas();
    for(let x=0; x<grid.length; x++) {
        for(let y=0; y<grid[0].length; y++) {
            if(grid[x][y] != 0) {
                ctx.fillStyle = grid[x][y];
                ctx.fillRect(x*(SIZE+2),y*(SIZE+2),SIZE,SIZE);
            }
            else {
                ctx.fillStyle = "#E6E6E6";
                ctx.fillRect(x*(SIZE+2),y*(SIZE+2),SIZE,SIZE);
            }
        }
    }
}

// Clean the grid
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Initialize variables
socket.on("init", function(data) {
    color = data.color;
    if(document.documentElement.clientWidth - 150 / data.cols > (document.documentElement.clientHeight - 110)/ data.rows) {
        SIZE = (document.documentElement.clientHeight - 110)/data.rows-2;
    }
    else {
        SIZE = (document.documentElement.clientWidth - 150)/data.cols-2;
    }
    if(SIZE > 30) {
        SIZE = 30
    }

    COLS = data.cols
    ROWS = data.rows

    canvas.width = data.cols*(SIZE+2);
    canvas.height = data.rows*(SIZE+2);
})

// Draw received grid
socket.on("grid", function(data) {
    grid = data.grid;
    draw(grid)
    let number = data.remaining;
    let interval = setInterval(()=>{
        number -= 0.1
        document.getElementById('progress').style.width = number +"%";
        if(number<=0) {
            clearInterval(interval);
        }
    },5)
})

// Respond to click on grid
canvas.onclick = (e) => {
    let x = Math.ceil(e.layerX/(SIZE+2));
    let y = Math.ceil(e.layerY/(SIZE+2));d
    
    if(grid[x-1][y-1] == 0) {
        book_cell(x-1,y-1);
        send_click(x,y)
    }
    draw(grid);
}

// Send clicked coordinate to server
function send_click(x,y) {
    socket.emit("click", {
        x : x,
        y : y,
        color : color
    })
}

// Highlight clicked cell
function book_cell(x,y) {
    grid[x-1][y-1] = "grey";
}

// Generate preset pattern and put it randomly
function draw_preset(grid,num,x,y) {
    if(num == 1) {
        if(grid[x][y] == 0 && grid[x+1][y] == 0 && grid[x+1][y+1] == 0 && grid[x][y+1] == 0) {
            send_click(x,y); book_cell(x,y);
            send_click(x+1,y); book_cell(x+1,y);
            send_click(x+1,y+1); book_cell(x+1,y+1);
            send_click(x,y+1); book_cell(x,y+1);
            draw(grid);
            return true;
        }
        else {
            return false;
        }
    }
    else if(num == 2) {
        if(grid[x][y] == 0 && grid[x][y+1] == 0 && grid[x][y+2] == 0) {
            send_click(x,y); book_cell(x,y);
            send_click(x,y+1); book_cell(x,y+1);
            send_click(x,y+2); book_cell(x,y+2);
            draw(grid);
            return true;
        }
        else {
            return false;
        }
    }
    else if(num == 3) {
        if(grid[x][y+1] == 0 && grid[x][y-1] == 0 && grid[x-1][y] == 0 && grid[x+1][y] == 0) {
            send_click(x+1,y); book_cell(x+1,y);
            send_click(x-1,y); book_cell(x-1,y);
            send_click(x,y+1); book_cell(x,y+1);
            send_click(x,y-1); book_cell(x,y-1);
            draw(grid);
            return true;
        }
        else {
            return false;
        }
    }
}


document.getElementById("preset1").onclick = () => {
    let x_rand = Math.floor(Math.random() * COLS + 3)
    let y_rand = Math.floor(Math.random() * ROWS + 3)

    while(!draw_preset(grid,1,x_rand,y_rand)) {
        x_rand = Math.floor(Math.random() * COLS + 3)
        y_rand = Math.floor(Math.random() * ROWS + 3)
    }
}

document.getElementById("preset2").onclick = () => {
    let x_rand = Math.floor(Math.random() * COLS + 3)
    let y_rand = Math.floor(Math.random() * ROWS + 3)

    while(!draw_preset(grid,2,x_rand,y_rand)) {
        x_rand = Math.floor(Math.random() * COLS + 3)
        y_rand = Math.floor(Math.random() * ROWS + 3)
    }
}

document.getElementById("preset3").onclick = () => {
    let x_rand = Math.floor(Math.random() * COLS + 3)
    let y_rand = Math.floor(Math.random() * ROWS + 3)

    while(!draw_preset(grid,3,x_rand,y_rand)) {
        x_rand = Math.floor(Math.random() * COLS + 3)
        y_rand = Math.floor(Math.random() * ROWS + 3)
    }
}