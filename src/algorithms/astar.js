class AStarAlgorithm {
    constructor(maze) {
        this.maze = maze;
        this.width = maze.ancho;
        this.height = maze.alto;
        this.walls = new Set(maze.paredes.map(wall => `${wall[0]},${wall[1]}`));
    }

    isValid(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height && !this.walls.has(`${x},${y}`);
    }

    getNeighbors(position) {
        const [x, y] = position;
        const directions = [
            [0, 1],  // right
            [1, 0],  // down
            [0, -1], // left
            [-1, 0]  // up
        ];

        return directions
            .map(([dx, dy]) => [x + dx, y + dy])
            .filter(([newX, newY]) => this.isValid(newX, newY));
    }

    heuristic(position, goal) {
        // Manhattan distance
        return Math.abs(position[0] - goal[0]) + Math.abs(position[1] - goal[1]);
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom.has(current.toString())) {
            current = cameFrom.get(current.toString());
            path.unshift(current);
        }
        return path;
    }

    async search(onVisit = null) {
        const start = this.maze.inicio;
        const end = this.maze.fin;

        // Priority queue implementation using array
        const openSet = [start];
        const cameFrom = new Map();

        // Cost from start to node
        const gScore = new Map();
        gScore.set(start.toString(), 0);

        // Estimated total cost from start to end through node
        const fScore = new Map();
        fScore.set(start.toString(), this.heuristic(start, end));

        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let lowestScore = fScore.get(current.toString());
            let lowestIndex = 0;

            for (let i = 1; i < openSet.length; i++) {
                const score = fScore.get(openSet[i].toString());
                if (score < lowestScore) {
                    current = openSet[i];
                    lowestScore = score;
                    lowestIndex = i;
                }
            }

            if (current[0] === end[0] && current[1] === end[1]) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.splice(lowestIndex, 1);

            for (const neighbor of this.getNeighbors(current)) {
                const tentativeGScore = gScore.get(current.toString()) + 1;
                const neighborStr = neighbor.toString();

                if (!gScore.has(neighborStr) || tentativeGScore < gScore.get(neighborStr)) {
                    cameFrom.set(neighborStr, current);
                    gScore.set(neighborStr, tentativeGScore);
                    fScore.set(neighborStr, tentativeGScore + this.heuristic(neighbor, end));

                    if (!openSet.some(pos => pos[0] === neighbor[0] && pos[1] === neighbor[1])) {
                        openSet.push(neighbor);
                        if (onVisit) {
                            await onVisit(neighbor);
                        }
                    }
                }
            }
        }

        return null; // No path found
    }
} 