class DFS {
    constructor(maze) {
        this.maze = maze;
        this.visited = new Set();
        this.parent = new Map();
        this.explorationCount = 0;
    }

    async solve(start, end, renderer) {
        this.visited.clear();
        this.parent.clear();
        this.explorationCount = 0;

        console.log('[DFS] Starting exploration from', start, 'to', end);

        // Move robot to start position
        if (renderer && renderer.robot) {
            await renderer.robot.moveTo(start);
        }

        const found = await this.dfs(start, end, renderer);
        if (found) {
            console.log('[DFS] Found path to end!');
            console.log('[DFS] Total cells explored:', this.explorationCount);
            return this.reconstructPath(start, end);
        }
        console.log('[DFS] No path found after exploring', this.explorationCount, 'cells');
        return null;
    }

    async dfs(current, end, renderer) {
        const currentStr = current.toString();
        const endStr = end.toString();
        this.explorationCount++;

        // Mark as visited and show exploration
        this.visited.add(currentStr);
        console.log(`[DFS] Exploring position ${current} (Step ${this.explorationCount})`);
        console.log(`[DFS] Visited cells: ${this.visited.size}`);

        // Move robot to current position
        if (renderer && renderer.robot) {
            await renderer.robot.moveTo(current);
        }

        if (renderer) {
            renderer.showExplorationStep(current, 0xD32F2F);
            // Add delay to see the exploration
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // If we found the end, we're done
        if (currentStr === endStr) {
            return true;
        }

        // Get valid neighbors
        const neighbors = this.getValidNeighbors(current);
        console.log(`[DFS] Found ${neighbors.length} valid neighbors at ${current}`);

        // Try each neighbor
        for (const neighbor of neighbors) {
            const neighborStr = neighbor.toString();
            if (!this.visited.has(neighborStr)) {
                this.parent.set(neighborStr, current);
                console.log(`[DFS] Exploring neighbor: ${neighbor}`);
                if (await this.dfs(neighbor, end, renderer)) {
                    return true;
                }
                // Show backtracking
                if (renderer) {
                    renderer.showExplorationStep(neighbor, 0xD32F2F, true);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                console.log(`[DFS] Backtracking from ${neighbor}`);

                // Move robot back to parent position
                if (renderer && renderer.robot) {
                    const parent = this.parent.get(neighborStr);
                    if (parent) {
                        await renderer.robot.moveTo(parent);
                    }
                }
            }
        }

        return false;
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
