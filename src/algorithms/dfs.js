class DFSAlgorithm {
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

    async search(onVisit = null) {
        const start = this.maze.inicio;
        const end = this.maze.fin;
        const stack = [[start]];
        const visited = new Set([start.toString()]);

        while (stack.length > 0) {
            const path = stack.pop();
            const current = path[path.length - 1];

            if (current[0] === end[0] && current[1] === end[1]) {
                return path;
            }

            const neighbors = this.getNeighbors(current);
            for (const next of neighbors.reverse()) { // Reverse to maintain right-hand preference
                const nextStr = next.toString();
                if (!visited.has(nextStr)) {
                    visited.add(nextStr);
                    const newPath = [...path, next];
                    stack.push(newPath);

                    if (onVisit) {
                        await onVisit(next);
                    }
                }
            }
        }

        return null; // No path found
    }
} 