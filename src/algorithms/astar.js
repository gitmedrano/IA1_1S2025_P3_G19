class AStarAlgorithm {
    constructor(maze) {
        this.maze = maze;
        this.width = maze.ancho;
        this.height = maze.alto;
        this.walls = new Set(maze.paredes.map(wall => `${wall[0]},${wall[1]}`));
        console.log('[A*] Initialized with maze dimensions:', this.width, 'x', this.height);
    }

    isValid(x, y) {
        return x >= 0 && x < this.width &&
            y >= 0 && y < this.height &&
            !this.walls.has(`${x},${y}`);
    }

    getNeighbors(position) {
        const [x, y] = position;
        const directions = [
            [0, 1],   // right
            [1, 0],   // down
            [0, -1],  // left
            [-1, 0]   // up
        ];

        return directions
            .map(([dx, dy]) => [x + dx, y + dy])
            .filter(([newX, newY]) => this.isValid(newX, newY));
    }

    heuristic(position, goal) {
        return Math.abs(position[0] - goal[0]) + Math.abs(position[1] - goal[1]);
    }

    async search() {
        const start = this.maze.inicio;
        const end = this.maze.fin;

        // Priority queue for open set
        const openSet = new Set([start.toString()]);
        const openList = [start];

        // Track visited nodes and paths
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        // Initialize scores
        gScore.set(start.toString(), 0);
        fScore.set(start.toString(), this.heuristic(start, end));

        while (openList.length > 0) {
            // Find node with lowest fScore
            let currentIndex = 0;
            let lowestFScore = Infinity;

            for (let i = 0; i < openList.length; i++) {
                const nodeScore = fScore.get(openList[i].toString());
                if (nodeScore < lowestFScore) {
                    lowestFScore = nodeScore;
                    currentIndex = i;
                }
            }

            const current = openList[currentIndex];
            const currentStr = current.toString();

            // Check if we reached the goal
            if (current[0] === end[0] && current[1] === end[1]) {
                console.log('[A*] Goal reached!');
                return this.reconstructPath(cameFrom, current);
            }

            // Remove current from open set
            openList.splice(currentIndex, 1);
            openSet.delete(currentStr);

            // Process neighbors
            for (const neighbor of this.getNeighbors(current)) {
                const neighborStr = neighbor.toString();
                const tentativeGScore = gScore.get(currentStr) + 1;

                if (!gScore.has(neighborStr) || tentativeGScore < gScore.get(neighborStr)) {
                    cameFrom.set(neighborStr, current);
                    gScore.set(neighborStr, tentativeGScore);
                    fScore.set(neighborStr, tentativeGScore + this.heuristic(neighbor, end));

                    if (!openSet.has(neighborStr)) {
                        openList.push(neighbor);
                        openSet.add(neighborStr);
                    }
                }
            }
        }

        console.log('[A*] No path found');
        return null;
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentStr = current.toString();

        while (cameFrom.has(currentStr)) {
            current = cameFrom.get(currentStr);
            currentStr = current.toString();
            path.unshift(current);
        }

        console.log('[A*] Path found:', path);
        return path;
    }
} 