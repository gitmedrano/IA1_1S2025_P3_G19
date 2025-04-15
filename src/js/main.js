class MazeApp {
    constructor() {
        this.mazeLoader = new MazeLoader();
        this.renderer = null;
        this.robot = null;
        this.currentAlgorithm = null;
        this.isSimulating = false;
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

        const startTime = performance.now();
        let steps = 0;

        // Create algorithm instance based on selection
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
                console.error('[MazeApp] Invalid algorithm selected:', this.currentAlgorithm);
                return;
        }

        // Execute search with visualization
        const onVisit = async (position) => {
            const success = await this.robot.moveTo(position);
            if (success) {
                steps++;
                const timeElapsed = (performance.now() - startTime) / 1000;
                this.updateStats(steps, timeElapsed);
            } else {
                console.warn('[MazeApp] Failed to move robot to position:', position);
            }
        };

        const path = await algorithm.search(onVisit);

        if (path) {
            console.log('[MazeApp] Path found:', path);
            // Highlight the final path
            this.renderer.highlightPath(path);
        } else {
            console.error('[MazeApp] No path found!');
            alert('No path found!');
        }

        startBtn.disabled = false;
        this.isSimulating = false;
        console.log('[MazeApp] Simulation completed');
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