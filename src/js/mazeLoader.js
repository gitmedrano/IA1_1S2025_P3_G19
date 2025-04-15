class MazeLoader {
    constructor() {
        this.mazeData = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('mazeInput');
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                if (this.validateMazeData(jsonData)) {
                    this.mazeData = jsonData;
                    this.dispatchMazeLoadedEvent();
                }
            } catch (error) {
                console.error('Error parsing maze file:', error);
                alert('Invalid maze file format. Please check the JSON structure.');
            }
        };
        reader.readAsText(file);
    }

    validateMazeData(data) {
        // Check required properties
        const requiredProps = ['ancho', 'alto', 'inicio', 'fin', 'paredes'];
        for (const prop of requiredProps) {
            if (!(prop in data)) {
                alert(`Missing required property: ${prop}`);
                return false;
            }
        }

        // Validate dimensions
        if (!Number.isInteger(data.ancho) || !Number.isInteger(data.alto) ||
            data.ancho <= 0 || data.alto <= 0) {
            alert('Invalid maze dimensions');
            return false;
        }

        // Validate start and end positions
        if (!Array.isArray(data.inicio) || data.inicio.length !== 2 ||
            !Array.isArray(data.fin) || data.fin.length !== 2) {
            alert('Invalid start or end position format');
            return false;
        }

        // Validate start and end positions are within bounds
        const [startX, startY] = data.inicio;
        const [endX, endY] = data.fin;
        if (startX < 0 || startX >= data.ancho || startY < 0 || startY >= data.alto ||
            endX < 0 || endX >= data.ancho || endY < 0 || endY >= data.alto) {
            alert('Start or end position out of bounds');
            return false;
        }

        // Validate walls
        if (!Array.isArray(data.paredes)) {
            alert('Walls must be an array');
            return false;
        }

        for (const wall of data.paredes) {
            if (!Array.isArray(wall) || wall.length !== 2 ||
                !Number.isInteger(wall[0]) || !Number.isInteger(wall[1]) ||
                wall[0] < 0 || wall[0] >= data.ancho ||
                wall[1] < 0 || wall[1] >= data.alto) {
                alert('Invalid wall position');
                return false;
            }
        }

        return true;
    }

    dispatchMazeLoadedEvent() {
        const event = new CustomEvent('mazeLoaded', {
            detail: { maze: this.mazeData }
        });
        document.dispatchEvent(event);
    }

    getMazeData() {
        return this.mazeData;
    }
} 