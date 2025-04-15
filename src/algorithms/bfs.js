class BFS {
    constructor(maze) {
        this.maze = maze;
        this.visited = new Set();
        this.queue = [];
        this.parent = new Map();
    }

    async solve(start, end, renderer) {
        this.visited.clear();
        this.queue = [];
        this.parent.clear();

        // Convert start and end to strings for comparison
        const startStr = start.toString();
        const endStr = end.toString();

        // Initialize with start position
        this.queue.push(start);
        this.visited.add(startStr);

        while (this.queue.length > 0) {
            const current = this.queue.shift();
            const currentStr = current.toString();

            // Visualize current exploration
            if (renderer) {
                renderer.showExplorationStep(current, 0x4CAF50);
                // Add delay to see the exploration
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // If we reached the end, reconstruct and return the path
            if (currentStr === endStr) {
                return this.reconstructPath(start, end);
            }

            // Get valid neighbors
            const neighbors = this.getValidNeighbors(current);

            for (const neighbor of neighbors) {
                const neighborStr = neighbor.toString();
                if (!this.visited.has(neighborStr)) {
                    this.visited.add(neighborStr);
                    this.parent.set(neighborStr, current);
                    this.queue.push(neighbor);
                }
            }
        }

        return null; // No path found
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