class AStarAlgorithm {
    constructor(maze) {
        this.maze = maze;
        this.width = maze.ancho;
        this.height = maze.alto;
        this.walls = new Set(maze.paredes.map(wall => `${wall[0]},${wall[1]}`));
        console.log('[A*] Initialized with maze dimensions:', this.width, 'x', this.height);
        console.log('[A*] Wall positions:', this.walls);
    }

    isValid(x, y) {
        // Check bounds
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            console.log('[A*] Position out of bounds:', x, y);
            return false;
        }

        // Check wall collision
        const posKey = `${x},${y}`;
        const isWall = this.walls.has(posKey);
        if (isWall) {
            console.log('[A*] Wall detected at:', x, y);
        }
        return !isWall;
    }

    getNeighbors(position) {
        const [x, y] = position;
        // Define directions with costs (diagonal movements cost more)
        const directions = [
            [0, 1],   // right
            [1, 0],   // down
            [0, -1],  // left
            [-1, 0]   // up
        ];

        const validNeighbors = directions
            .map(([dx, dy]) => {
                const newX = x + dx;
                const newY = y + dy;
                if (this.isValid(newX, newY)) {
                    return [newX, newY];
                }
                return null;
            })
            .filter(pos => pos !== null);

        console.log('[A*] Valid neighbors for', position, ':', validNeighbors);
        return validNeighbors;
    }

    heuristic(position, goal) {
        // Manhattan distance
        const h = Math.abs(position[0] - goal[0]) + Math.abs(position[1] - goal[1]);
        console.log('[A*] Heuristic for', position, 'to', goal, ':', h);
        return h;
    }

    reconstructPath(cameFrom, current) {
        console.log('[A*] Reconstructing path from', current);
        const path = [current];
        while (cameFrom.has(current.toString())) {
            current = cameFrom.get(current.toString());
            path.unshift(current);
        }
        console.log('[A*] Final path:', path);
        return path;
    }

    async search(onVisit = null) {
        console.log('[A*] Starting search');
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

            console.log('[A*] Current position:', current, 'Score:', lowestScore);

            if (current[0] === end[0] && current[1] === end[1]) {
                console.log('[A*] Goal reached!');
                return this.reconstructPath(cameFrom, current);
            }

            openSet.splice(lowestIndex, 1);

            for (const neighbor of this.getNeighbors(current)) {
                const tentativeGScore = gScore.get(current.toString()) + 1;
                const neighborStr = neighbor.toString();

                if (!gScore.has(neighborStr) || tentativeGScore < gScore.get(neighborStr)) {
                    cameFrom.set(neighborStr, current);
                    gScore.set(neighborStr, tentativeGScore);
                    const estimatedScore = tentativeGScore + this.heuristic(neighbor, end);
                    fScore.set(neighborStr, estimatedScore);
                    console.log('[A*] Updated neighbor:', neighbor, 'Score:', estimatedScore);

                    if (!openSet.some(pos => pos[0] === neighbor[0] && pos[1] === neighbor[1])) {
                        openSet.push(neighbor);
                        if (onVisit) {
                            await onVisit(neighbor);
                        }
                    }
                }
            }
        }

        console.log('[A*] No path found!');
        return null; // No path found
    }
} 