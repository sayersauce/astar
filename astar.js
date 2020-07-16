/**
 * A Star Algorithm Implementation
 * Max Sayer
 * https://max.lat
 * 
 * https://briangrinstead.com/blog/astar-search-algorithm-in-javascript-updated/
 * https://brilliant.org/wiki/a-star-search/
 * https://www.redblobgames.com/pathfinding/a-star/introduction.html
 */


// Pathfinding


class Node {
    constructor(pos, wall) {
        this.pos = pos;
        this.wall = wall;
        this.closed = false;
        this.visited = false;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }
}

class Grid {
    constructor(rows, cols, walls) {
        this.rows = rows;
        this.cols = cols;
        this.nodes = [];

        for (let y = 0; y < rows; y++) {
            this.nodes[y] = [];
            for (let x = 0; x < cols; x++) {
                let wall = false;
                for (let w of walls) {
                    if (x == w.x && y == w.y) {
                        wall = true;
                        break;
                    }
                }
                this.nodes[y][x] = new Node({ x: x, y: y }, wall);
            }
        }
    }

    getNode(pos) {
        return this.nodes[pos.y][pos.x];
    }

    getNeighbours(node, diagonals) {
        const neighbours = [];
        const x = node.pos.x;
        const y = node.pos.y;

        // North
        if (this.nodes[y-1] && this.nodes[y-1][x]) {
            neighbours.push(this.nodes[y-1][x]);
        }

        // South
        if (this.nodes[y+1] && this.nodes[y+1][x]) {
            neighbours.push(this.nodes[y+1][x]);
        }

        // East
        if (this.nodes[y] && this.nodes[y][x+1]) {
            neighbours.push(this.nodes[y][x+1]);
        }

        // West
        if (this.nodes[y] && this.nodes[y][x-1]) {
            neighbours.push(this.nodes[y][x-1]);
        }

        if (diagonals) {
            // North East
            if (this.nodes[y-1] && this.nodes[y-1][x+1]) {
                neighbours.push(this.nodes[y-1][x+1]);
            }

            // North West
            if (this.nodes[y-1] && this.nodes[y-1][x-1]) {
                neighbours.push(this.nodes[y-1][x-1]);
            }

            // South East
            if (this.nodes[y+1] && this.nodes[y+1][x+1]) {
                neighbours.push(this.nodes[y+1][x+1]);
            }

            // South West
            if (this.nodes[y+1] && this.nodes[y+1][x-1]) {
                neighbours.push(this.nodes[y+1][x-1]);
            }
        }
        
        return neighbours;
    }
}

class AStar {
    constructor(grid) {
        this.grid = grid;
    }

    pathfind(start, end, diagonals) {
        // Parameters `start` and `end` are nodes
        const openList = [start];

        while (openList.length) {
            // Get node with the lowest f cost in the openList
            let lowIndex = 0;
            for (let i = 0; i < openList.length; i++) {
                if (openList[i].f < openList[lowIndex].f) {
                    lowIndex = i;
                }
            }
            let current = openList[lowIndex];

            // Check if the current node is at the end position. If so we have finished
            if (current.pos == end.pos) {
                console.log("finished")
                // Return path from start to end
                let c = current;
                const path = [c];
                while (c.parent) {
                    path.push(c.parent);
                    c = c.parent;
                }
                return path.reverse();
            }

            // If not, mark the current node as closed
            current.closed = true;
            openList.splice(lowIndex, 1);
            let neighbours = this.grid.getNeighbours(current, diagonals);

            for (let neighbour of neighbours) {
                // Check neighbour is valid
                if (neighbour.wall || neighbour.closed) {
                    continue;
                }

                // Calculating g cost, assuming initially it is diagonal     
                let g = current.g + 14;

                // Checks if the node isn't diagonal, if not it has a g cost of 10
                let north = neighbour.pos.x == current.pos.x && neighbour.pos.y == current.pos.y - 1;
                let south = neighbour.pos.x == current.pos.x && neighbour.pos.y == current.pos.y + 1;
                let east = neighbour.pos.x == current.pos.x + 1 && neighbour.pos.y == current.pos.y;
                let west = neighbour.pos.x == current.pos.x - 1 && neighbour.pos.y == current.pos.y;
                if (north || south || east || west) g = current.g + 10;
                

                // Check if the neighbour has not been visited or if it has a lower g cost than its current one
                if (!neighbour.visited || g < neighbour.g) {
                    let h = this.heuristic(neighbour.pos, end.pos);
                    let f = g + h;

                    neighbour.g = g;
                    neighbour.h = h;
                    neighbour.f = f;
                    neighbour.visited = true;
                    neighbour.parent = current;
                    openList.push(neighbour);
                }
            }
        }

        // No path
        return [];
    }

    heuristic(pos1, pos2) {
        // Using The Manhattan Distance heuristic
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
    }
}


// Page


function init() {
    // Initialise canvas and context
    const canvas = document.getElementById("canvas");
    const timeElement = document.getElementById("time");
    const diagonalElement = document.getElementById("diagonals");
    const lengthElement = document.getElementById("length");
    const ctx = canvas.getContext("2d");
    let rows = lengthElement.value * 10;
    let cols = lengthElement.value * 10;
    const nodeSize = 30;
    canvas.width = cols * nodeSize;
    canvas.height = rows * nodeSize;

    let walls = [];
    let start = { x : 0, y : 0 };
    let end = { x : 2, y : 2 };
    let rightCount = 0;
    let grid = new Grid(rows, cols, walls);
    
    // Disable right click menu
    canvas.addEventListener("contextmenu", evt => {
        evt.preventDefault();
    });

    // Placing walls and start/end nodes
    canvas.addEventListener("mousedown", evt => {
        let rect = canvas.getBoundingClientRect();
        let x = Math.floor((evt.clientX - rect.left) / nodeSize);
        let y = Math.floor((evt.clientY - rect.top) / nodeSize);
        
        if (evt.button == 0) {
            // If the wall is found, remove it
            let found = false;
            for (let i = 0; i < walls.length; i++) {
                let wall = walls[i];
                if (wall.x == x && wall.y == y) {
                    // Remove wall
                    walls.splice(i, 1);
                    found = true;
                    break;
                }
            }

            // If the wall isn't found, add it
            if (!found) {
                walls.push({ x : x, y : y });
            }
        } else if (evt.button == 2) {
            // Right click to place start and end nodes
            if (rightCount == 0) {
                start = { x : x, y : y };
                rightCount = 1;
            } else {
                end = { x : x, y : y };
                rightCount = 0;
            }
        }

        grid = new Grid(rows, cols, walls);
        drawGrid(grid, ctx, nodeSize, walls, start, end);
    });

    // Rows / Columns
    lengthElement.addEventListener("input", () => {
        cols = rows = parseInt(lengthElement.value) * 10
        canvas.width = cols * nodeSize;
        canvas.height = rows * nodeSize;
        grid = new Grid(rows, cols, walls);
        drawGrid(grid, ctx, nodeSize, walls, start, end);
    })

    // Pathfinding
    document.getElementById("start").addEventListener("click", () => {
        grid = new Grid(rows, cols, walls);
        drawGrid(grid, ctx, nodeSize, walls, start, end);
        
        let startTime = new Date().getTime();
        let astar = new AStar(grid);
        let path = astar.pathfind(grid.getNode(start), grid.getNode(end), diagonalElement.checked);
        let text = "";

        if (path.length == 0) {
            text = "Pathfinding failed in "
        } else {
            text = "Pathfinding took "
        }
        text += (new Date().getTime() - startTime) + "ms.";

        console.log(text);
        timeElement.innerText = text;

        drawPath(path, ctx, nodeSize);
    });

    drawGrid(grid, ctx, nodeSize, walls, start, end);
}

function drawGrid(grid, ctx, nodeSize, walls, start, end) {
    for (let y = 0; y < grid.rows; y++) {
        for (let x = 0; x < grid.cols; x++) {
            ctx.fillStyle = "black";
            ctx.fillRect(x * nodeSize, y * nodeSize, nodeSize, nodeSize);
            if (x == start.x && y == start.y) {
                ctx.fillStyle = "green";
            } else if (x == end.x && y == end.y) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = "white";
            }
            for (let wall of walls) {
                if (x == wall.x && y == wall.y) {
                    ctx.fillStyle = "grey";
                    break;
                }
            }
            ctx.fillRect(x * nodeSize + 1, y * nodeSize + 1, nodeSize - 2, nodeSize - 2);
            ctx.fillStyle = "black";
            ctx.fillText(`${x},${y}`, x * nodeSize + 2, y * nodeSize + nodeSize / 2, nodeSize);
        }
    }
}

function drawPath(path, ctx, nodeSize) {
    for (let node of path) {
        let x = node.pos.x;
        let y = node.pos.y;
        ctx.fillStyle = "black";
        ctx.fillRect(x * nodeSize, y * nodeSize, nodeSize, nodeSize);
        ctx.fillStyle = "purple";
        ctx.fillRect(x * nodeSize + 1, y * nodeSize + 1, nodeSize - 2, nodeSize - 2);
        ctx.fillStyle = "white";
        ctx.fillText(`${x},${y}`, x * nodeSize + 2, y * nodeSize + nodeSize / 2, nodeSize);
    }
}

init();