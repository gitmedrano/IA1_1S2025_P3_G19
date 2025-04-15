const CONFIG = {
    // Three.js settings
    scene: {
        backgroundColor: 0x87CEEB, // Sky blue
        fogColor: 0xFFFFFF,
        fogDensity: 0.001 // Reduced fog density for better visibility
    },

    // Maze settings
    maze: {
        cellSize: 1,
        wallHeight: 1.5,
        wallThickness: 0.1,
        colors: {
            floor: 0x808080,    // Gray
            wall: 0x4A90E2,     // Blue
            outerWall: 0x34495e, // Dark blue for outer walls
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
        fov: 50, // Reduced FOV for better perspective
        near: 0.1,
        far: 1000,
        position: {
            x: 15,
            y: 20,
            z: 15
        },
        lookAt: {
            x: 5, // Look at center of maze
            y: 0,
            z: 5
        },
        controls: {
            minDistance: 2,      // Minimum zoom distance
            maxDistance: 100,    // Maximum zoom distance
            minPolarAngle: 0,    // Minimum vertical rotation (0 = top view)
            maxPolarAngle: 85,   // Maximum vertical rotation (in degrees)
            enableDamping: true, // Smooth camera movements
            dampingFactor: 0.05, // Camera movement inertia
            rotateSpeed: 0.5,    // Mouse rotation sensitivity
            zoomSpeed: 1.2,      // Mouse zoom sensitivity
            panSpeed: 0.8        // Mouse pan sensitivity
        }
    },

    // Animation settings
    animation: {
        stepDelay: 500,         // milliseconds between each step
        pathShowDelay: 100      // milliseconds between showing each path segment
    }
}; 