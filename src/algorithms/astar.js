class AStar {
    constructor(maze) {
        this.maze = maze;
        this.visited = new Set();
        this.parent = new Map();
        this.gScore = new Map();
        this.fScore = new Map();
        this.explorationCount = 0;
    }

    async solve(start, end, renderer) {
        this.visited.clear();
        this.parent.clear();
        this.gScore.clear();
        this.fScore.clear();
        this.explorationCount = 0;

        // Priority queue implemented as array for simplicity
        const openSet = [start];
        const startStr = start.toString();

        console.log('[A*] Starting exploration from', start, 'to', end);
        console.log('[A*] Initial open set size:', 1);

        // Initialize scores
        this.gScore.set(startStr, 0);
        this.fScore.set(startStr, this.heuristic(start, end));
        console.log(`[A*] Initial f-score for start: ${this.fScore.get(startStr)}`);

        while (openSet.length > 0) {
            // Get node with lowest fScore
            const current = this.getLowestFScore(openSet, end);
            const currentStr = current.toString();
            this.explorationCount++;

            console.log(`[A*] Exploring position ${current} (Step ${this.explorationCount})`);
            console.log(`[A*] Open set size: ${openSet.length}, Visited cells: ${this.visited.size}`);
            console.log(`[A*] Current f-score: ${this.fScore.get(currentStr)}`);

            // Visualize current exploration
            if (renderer) {
                renderer.showExplorationStep(current, 0x9C27B0);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Check if we reached the end
            if (current[0] === end[0] && current[1] === end[1]) {
                console.log('[A*] Found path to end!');
                console.log('[A*] Total cells explored:', this.explorationCount);
                return this.reconstructPath(start, end);
            }

            // Remove current from openSet
            openSet.splice(openSet.findIndex(pos => pos[0] === current[0] && pos[1] === current[1]), 1);
            this.visited.add(currentStr);

            // Check neighbors
            const neighbors = this.getValidNeighbors(current);
            console.log(`[A*] Found ${neighbors.length} valid neighbors at ${current}`);

            for (const neighbor of neighbors) {
                const neighborStr = neighbor.toString();

                // Calculate tentative gScore
                const tentativeGScore = this.gScore.get(currentStr) + 1;

                if (!this.gScore.has(neighborStr) || tentativeGScore < this.gScore.get(neighborStr)) {
                    // This path is better than any previous one
                    this.parent.set(neighborStr, current);
                    this.gScore.set(neighborStr, tentativeGScore);
                    const fScore = tentativeGScore + this.heuristic(neighbor, end);
                    this.fScore.set(neighborStr, fScore);
                    console.log(`[A*] Updated scores for ${neighbor}: g=${tentativeGScore}, f=${fScore}`);

                    if (!openSet.some(pos => pos[0] === neighbor[0] && pos[1] === neighbor[1])) {
                        openSet.push(neighbor);
                        console.log(`[A*] Added new neighbor to open set: ${neighbor}`);
                    }

                    // Visualize considering this neighbor
                    if (renderer) {
                        renderer.showExplorationStep(neighbor, 0x9C27B0, false);
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
            }
        }

        console.log('[A*] No path found after exploring', this.explorationCount, 'cells');
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