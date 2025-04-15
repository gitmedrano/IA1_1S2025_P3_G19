const CONFIG = {
    // Three.js settings
    scene: {
        backgroundColor: 0x87CEEB, // Sky blue
        fogColor: 0xFFFFFF,
        fogDensity: 0.001 // Reduced fog density for better visibility
    },

    // Maze settings
    maze: {
        cellSize: 1,           // Size of each cell in the maze
        wallHeight: 0.1,       // Height of the walls (you can adjust this value)
        wallThickness: 0.1,    // Thickness of the walls
        colors: {
            floor: 0x808080,    // Gray
            wall: 0x4A90E2,     // Blue
            outerWall: 0x34495e, // Dark blue for outer walls
            start: 0x2ECC71,    // Green
            end: 0xE74C3C,      // Red
            path: 0xF1C40F      // Yellow - single color for all paths
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
        fov: 45,
        near: 0.1,
        far: 1000,
        position: {
            x: 10,
            y: 25,
            z: 20
        },
        lookAt: {
            x: 7,
            y: 0,
            z: 7
        },
        controls: {
            minDistance: 5,
            maxDistance: 200,
            minPolarAngle: 0,
            maxPolarAngle: 80,
            enableDamping: true,
            dampingFactor: 0.1,
            rotateSpeed: 1.0,
            zoomSpeed: 1.2,
            panSpeed: 1.0,
            enableRotate: true,
            autoRotate: false,
            autoRotateSpeed: 2.0
        }
    },

    // Animation settings
    animation: {
        stepDelay: 500,         // milliseconds between each step
        pathShowDelay: 100      // milliseconds between showing each path segment
    }
};
