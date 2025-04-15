class AStar {
    constructor(maze) {
        this.maze = maze;
        this.visited = new Set();
        this.parent = new Map();
        this.gScore = new Map();
        this.fScore = new Map();
    }

    async solve(start, end, renderer) {
        this.visited.clear();
        this.parent.clear();
        this.gScore.clear();
        this.fScore.clear();

        // Priority queue implemented as array for simplicity
        const openSet = [start];
        const startStr = start.toString();

        // Initialize scores
        this.gScore.set(startStr, 0);
        this.fScore.set(startStr, this.heuristic(start, end));

        while (openSet.length > 0) {
            // Get node with lowest fScore
            const current = this.getLowestFScore(openSet, end);
            const currentStr = current.toString();

            // Visualize current exploration
            if (renderer) {
                renderer.showExplorationStep(current, 0x9C27B0);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Check if we reached the end
            if (current[0] === end[0] && current[1] === end[1]) {
                return this.reconstructPath(start, end);
            }

            // Remove current from openSet
            openSet.splice(openSet.findIndex(pos => pos[0] === current[0] && pos[1] === current[1]), 1);
            this.visited.add(currentStr);

            // Check neighbors
            const neighbors = this.getValidNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborStr = neighbor.toString();

                // Calculate tentative gScore
                const tentativeGScore = this.gScore.get(currentStr) + 1;

                if (!this.gScore.has(neighborStr) || tentativeGScore < this.gScore.get(neighborStr)) {
                    // This path is better than any previous one
                    this.parent.set(neighborStr, current);
                    this.gScore.set(neighborStr, tentativeGScore);
                    this.fScore.set(neighborStr, tentativeGScore + this.heuristic(neighbor, end));

                    if (!openSet.some(pos => pos[0] === neighbor[0] && pos[1] === neighbor[1])) {
                        openSet.push(neighbor);
                    }

                    // Visualize considering this neighbor
                    if (renderer) {
                        renderer.showExplorationStep(neighbor, 0x9C27B0, false);
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
            }
        }

        return null; // No path found
    }

    heuristic(pos, end) {
        // Manhattan distance
        return Math.abs(pos[0] - end[0]) + Math.abs(pos[1] - end[1]);
    }

    getLowestFScore(openSet, end) {
        let lowest = openSet[0];
        let lowestScore = this.fScore.get(lowest.toString());

        for (const pos of openSet) {
            const score = this.fScore.get(pos.toString());
            if (score < lowestScore) {
                lowest = pos;
                lowestScore = score;
            }
        }

        return lowest;
    }

    getValidNeighbors(position) {
        const [x, y] = position;
        const directions = [
            [0, 1],  // right
            [1, 0],  // down
            [0, -1], // left
            [-1, 0]  // up
        ];

        return directions
            .map(([dx, dy]) => [x + dx, y + dy])
            .filter(([newX, newY]) => {
                // Check bounds
                if (newX < 0 || newY < 0 ||
                    newX >= this.maze.ancho ||
                    newY >= this.maze.alto) {
                    return false;
                }
                // Check if wall exists at this position
                return !this.maze.paredes.some(([wallX, wallY]) =>
                    wallX === newX && wallY === newY
                );
            });
    }

    reconstructPath(start, end) {
        const path = [end];
        let current = end.toString();
        const startStr = start.toString();

        while (current !== startStr) {
            const parent = this.parent.get(current);
            if (!parent) break;
            path.unshift(parent);
            current = parent.toString();
        }

        return path;
    }
} 