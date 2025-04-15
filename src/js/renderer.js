class MazeRenderer {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.maze = null;
        this.robot = null;
        console.log('[Renderer] Initializing...');

        this.init();
        this.setupLights();
        this.setupControls();
        this.animate();
    }

    init() {
        console.log('[Renderer] Setting up scene and camera');
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.scene.backgroundColor);
        this.scene.fog = new THREE.FogExp2(CONFIG.scene.fogColor, CONFIG.scene.fogDensity);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            this.container.clientWidth / this.container.clientHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.set(
            CONFIG.camera.position.x,
            CONFIG.camera.position.y,
            CONFIG.camera.position.z
        );
        this.camera.lookAt(
            CONFIG.camera.lookAt.x,
            CONFIG.camera.lookAt.y,
            CONFIG.camera.lookAt.z
        );

        // Create renderer with improved shadows
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
        this.renderer.physicallyCorrectLights = true;
        this.container.appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        console.log('[Renderer] Scene setup completed');
    }

    setupLights() {
        console.log('[Renderer] Setting up lights');
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(15, 20, 15);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Adjust shadow properties for better quality
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.bias = -0.0001;

        // Add fill light
        const fillLight = new THREE.DirectionalLight(0x7ec0ee, 0.3); // Slight blue tint
        fillLight.position.set(-15, 10, -15);
        this.scene.add(fillLight);

        console.log('[Renderer] Lights setup completed');
    }

    setupControls() {
        console.log('[Renderer] Setting up controls');
        try {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 5;
            this.controls.maxDistance = 50;
            this.controls.maxPolarAngle = Math.PI / 2;
            console.log('[Renderer] Controls setup completed');
        } catch (error) {
            console.error('[Renderer] Error setting up OrbitControls:', error);
        }
    }

    createMaze(mazeData) {
        console.log('[Renderer] Creating maze with data:', mazeData);
        // Clear existing maze
        if (this.maze) {
            this.scene.remove(this.maze);
        }

        this.maze = new THREE.Group();

        // Create floor with improved material
        const floorGeometry = new THREE.PlaneGeometry(
            mazeData.ancho * CONFIG.maze.cellSize,
            mazeData.alto * CONFIG.maze.cellSize
        );
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.maze.colors.floor,
            roughness: 0.8,
            metalness: 0.2,
            envMapIntensity: 1.0
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(
            (mazeData.ancho * CONFIG.maze.cellSize) / 2 - CONFIG.maze.cellSize / 2,
            0,
            (mazeData.alto * CONFIG.maze.cellSize) / 2 - CONFIG.maze.cellSize / 2
        );
        floor.receiveShadow = true;
        this.maze.add(floor);

        // Create walls with improved material
        const wallGeometry = new THREE.BoxGeometry(
            CONFIG.maze.cellSize,
            CONFIG.maze.wallHeight,
            CONFIG.maze.cellSize
        );
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: CONFIG.maze.colors.wall,
            shininess: 30,
            specular: 0x444444
        });

        mazeData.paredes.forEach(([x, z]) => {
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(
                x * CONFIG.maze.cellSize,
                CONFIG.maze.wallHeight / 2,
                z * CONFIG.maze.cellSize
            );
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.maze.add(wall);
        });

        // Add start marker with glow effect
        const startMarker = this.createMarker(CONFIG.maze.colors.start);
        startMarker.position.set(
            mazeData.inicio[0] * CONFIG.maze.cellSize,
            0.01,
            mazeData.inicio[1] * CONFIG.maze.cellSize
        );
        this.maze.add(startMarker);

        // Add end marker with glow effect
        const endMarker = this.createMarker(CONFIG.maze.colors.end);
        endMarker.position.set(
            mazeData.fin[0] * CONFIG.maze.cellSize,
            0.01,
            mazeData.fin[1] * CONFIG.maze.cellSize
        );
        this.maze.add(endMarker);

        this.scene.add(this.maze);
        console.log('[Renderer] Maze creation completed');
    }

    createMarker(color) {
        // Create a group for the marker
        const markerGroup = new THREE.Group();

        // Base marker
        const markerGeometry = new THREE.CircleGeometry(CONFIG.maze.cellSize / 3, 32);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.rotation.x = -Math.PI / 2;
        markerGroup.add(marker);

        // Add glow effect
        const glowGeometry = new THREE.CircleGeometry(CONFIG.maze.cellSize / 2.5, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = 0.01;
        markerGroup.add(glow);

        return markerGroup;
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        console.log('[Renderer] Window resized');
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.controls) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
    }

    highlightPath(path, algorithm = 'astar') {
        if (!path || !path.length) return;
        console.log('[Renderer] Highlighting path for algorithm:', algorithm);

        // Get the color for the current algorithm
        const pathColor = CONFIG.maze.colors.paths[algorithm] || CONFIG.maze.colors.paths.astar;

        // Create path markers with glowing effect
        const pathGeometry = new THREE.BoxGeometry(
            CONFIG.maze.cellSize * 0.5,
            0.1,
            CONFIG.maze.cellSize * 0.5
        );

        // Create materials for the path markers
        const pathMaterial = new THREE.MeshBasicMaterial({
            color: pathColor,
            transparent: true,
            opacity: 0.7
        });

        // Create glow material
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: pathColor,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });

        path.forEach((position, index) => {
            setTimeout(() => {
                // Create path marker group
                const markerGroup = new THREE.Group();

                // Main marker
                const pathMarker = new THREE.Mesh(pathGeometry, pathMaterial);
                pathMarker.position.set(
                    position[0] * CONFIG.maze.cellSize + CONFIG.maze.cellSize / 2,
                    0.05,
                    position[1] * CONFIG.maze.cellSize + CONFIG.maze.cellSize / 2
                );
                markerGroup.add(pathMarker);

                // Glow effect
                const glowMarker = new THREE.Mesh(pathGeometry.clone(), glowMaterial);
                glowMarker.scale.set(1.2, 1, 1.2); // Make glow slightly larger
                glowMarker.position.copy(pathMarker.position);
                markerGroup.add(glowMarker);

                // Add number marker for step sequence
                if (index > 0 && index < path.length - 1) { // Don't add numbers to start and end positions
                    const stepNumber = this.createStepNumber(index, position, pathColor);
                    markerGroup.add(stepNumber);
                }

                this.maze.add(markerGroup);
                console.log('[Renderer] Added path marker at:', position);
            }, index * CONFIG.animation.pathShowDelay);
        });
    }

    createStepNumber(number, position, color) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;

        // Draw text
        context.fillStyle = '#ffffff';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(number.toString(), 32, 32);

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            color: color,
            transparent: true,
            opacity: 0.8
        });

        // Create sprite
        const sprite = new THREE.Sprite(material);
        sprite.position.set(
            position[0] * CONFIG.maze.cellSize + CONFIG.maze.cellSize / 2,
            0.3, // Slightly above the path marker
            position[1] * CONFIG.maze.cellSize + CONFIG.maze.cellSize / 2
        );
        sprite.scale.set(0.5, 0.5, 1);

        return sprite;
    }
} 