const CONFIG = {
    // Three.js settings
    scene: {
        backgroundColor: 0x87CEEB, // Sky blue
        fogColor: 0xFFFFFF,
        fogDensity: 0.01
    },

    // Maze settings
    maze: {
        cellSize: 1,
        wallHeight: 1.5,
        wallThickness: 0.1,
        colors: {
            floor: 0x808080,    // Gray
            wall: 0x4A90E2,     // Blue
            start: 0x2ECC71,    // Green
            end: 0xE74C3C,      // Red
            path: 0xF1C40F      // Yellow
        }
    },

    // Robot settings
    robot: {
        size: 0.3,
        height: 0.5,
        color: 0x9B59B6,        // Purple
        moveSpeed: 0.5,         // seconds per movement
        rotationSpeed: Math.PI   // radians per second
    },

    // Camera settings
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: {
            x: 10,
            y: 15,
            z: 10
        },
        lookAt: {
            x: 0,
            y: 0,
            z: 0
        }
    },

    // Animation settings
    animation: {
        stepDelay: 500,         // milliseconds between each step
        pathShowDelay: 100      // milliseconds between showing each path segment
    }
}; 