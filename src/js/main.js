class MazeApp {
    constructor() {
        this.mazeLoader = new MazeLoader();
        this.renderer = null;
        this.robot = null;
        this.currentAlgorithm = null;
        this.isSimulating = false;
        this.currentPath = null;
        this.currentPathIndex = 0;
        console.log('[MazeApp] Initializing application');

        this.setupEventListeners();
    }

    setupEventListeners() {
        console.log('[MazeApp] Setting up event listeners');
        document.addEventListener('mazeLoaded', (e) => this.onMazeLoaded(e.detail.maze));

        document.getElementById('startBtn').addEventListener('click', () => this.startSimulation());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSimulation());

        document.getElementById('algorithm').addEventListener('change', (e) => {
            this.currentAlgorithm = e.target.value;
            console.log('[MazeApp] Algorithm changed to:', this.currentAlgorithm);
        });

        // Set default algorithm
        this.currentAlgorithm = document.getElementById('algorithm').value;
        console.log('[MazeApp] Default algorithm set to:', this.currentAlgorithm);
    }

    onMazeLoaded(mazeData) {
        console.log('[MazeApp] Loading new maze:', mazeData);
        const container = document.getElementById('mazeContainer');

        // Clear previous simulation
        if (this.renderer) {
            console.log('[MazeApp] Clearing previous simulation');
            container.innerHTML = '';
            this.renderer = null;
            this.robot = null;
        }

        // Initialize new renderer
        this.renderer = new MazeRenderer(container);
        this.renderer.createMaze(mazeData);

        // Create robot at start position with maze data for collision detection
        this.robot = new Robot(this.renderer.scene, mazeData.inicio, mazeData);

        // Reset stats
        this.updateStats(0, 0);
        console.log('[MazeApp] Maze loaded and initialized');
    }

    async startSimulation() {
        if (this.isSimulating || !this.renderer || !this.robot) {
            console.log('[MazeApp] Cannot start simulation: already running or not initialized');
            return;
        }

        console.log('[MazeApp] Starting simulation with algorithm:', this.currentAlgorithm);
        this.isSimulating = true;
        const startBtn = document.getElementById('startBtn');
        startBtn.disabled = true;

        try {
            const startTime = performance.now();
            let steps = 0;

            // Create algorithm instance
            let algorithm;
            const mazeData = this.mazeLoader.getMazeData();

            switch (this.currentAlgorithm) {
                case 'bfs':
                    algorithm = new BFSAlgorithm(mazeData);
                    break;
                case 'dfs':
                    algorithm = new DFSAlgorithm(mazeData);
                    break;
                case 'astar':
                    algorithm = new AStarAlgorithm(mazeData);
                    break;
                default:
                    throw new Error('Invalid algorithm selected');
            }

            // Find path first
            this.currentPath = await algorithm.search();

            if (!this.currentPath) {
                alert('No path found!');
                return;
            }

            console.log('[MazeApp] Path found:', this.currentPath);

            // Follow path step by step
            for (let i = 1; i < this.currentPath.length; i++) {
                const success = await this.robot.moveTo(this.currentPath[i]);
                if (!success) {
                    console.error('[MazeApp] Failed to move robot to position:', this.currentPath[i]);
                    break;
                }
                steps++;
                const timeElapsed = (performance.now() - startTime) / 1000;
                this.updateStats(steps, timeElapsed);
                // Add small delay between moves
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Highlight the complete path with the current algorithm's color
            this.renderer.highlightPath(this.currentPath, this.currentAlgorithm);
            console.log('[MazeApp] Simulation completed');

        } catch (error) {
            console.error('[MazeApp] Simulation error:', error);
            alert('An error occurred during simulation');
        } finally {
            this.isSimulating = false;
            startBtn.disabled = false;
        }
    }

    resetSimulation() {
        if (this.isSimulating) {
            console.log('[MazeApp] Cannot reset: simulation in progress');
            return;
        }

        console.log('[MazeApp] Resetting simulation');
        const mazeData = this.mazeLoader.getMazeData();
        if (mazeData) {
            this.onMazeLoaded(mazeData);
        }
    }

    updateStats(steps, time) {
        document.getElementById('stepCount').textContent = steps;
        document.getElementById('timeElapsed').textContent = time.toFixed(2) + 's';
        console.log('[MazeApp] Stats updated - Steps:', steps, 'Time:', time.toFixed(2) + 's');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[MazeApp] DOM loaded, creating application instance');
    new MazeApp();
}); 