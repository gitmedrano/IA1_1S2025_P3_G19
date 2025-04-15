class Robot {
    constructor(scene, startPosition, maze) {
        this.scene = scene;
        this.mesh = null;
        this.currentPosition = startPosition;
        this.targetPosition = null;
        this.isMoving = false;
        this.maze = maze; // Store maze data for collision detection
        this.walls = new Set(maze.paredes.map(wall => `${wall[0]},${wall[1]}`));
        console.log('[Robot] Initialized at position:', startPosition);
        console.log('[Robot] Walls:', this.walls);
        this.createRobotMesh();
    }

    createRobotMesh() {
        console.log('[Robot] Creating robot mesh');
        // Create robot body
        const bodyGeometry = new THREE.BoxGeometry(
            CONFIG.robot.size,
            CONFIG.robot.height,
            CONFIG.robot.size
        );
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: CONFIG.robot.color,
            shininess: 30
        });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.castShadow = true; // Enable shadow casting
        this.mesh.receiveShadow = true; // Enable shadow receiving

        // Add details to make it more robot-like
        this.addRobotDetails();

        // Set initial position
        this.updatePosition(this.currentPosition);

        // Add to scene
        this.scene.add(this.mesh);
        console.log('[Robot] Robot mesh created and added to scene');
    }

    addRobotDetails() {
        // Add eyes (two small spheres)
        const eyeGeometry = new THREE.SphereGeometry(CONFIG.robot.size * 0.1, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x444444 // Add slight glow to eyes
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(CONFIG.robot.size * 0.2, CONFIG.robot.height * 0.3, -CONFIG.robot.size * 0.3);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(-CONFIG.robot.size * 0.2, CONFIG.robot.height * 0.3, -CONFIG.robot.size * 0.3);

        this.mesh.add(leftEye);
        this.mesh.add(rightEye);

        // Add antenna
        const antennaGeometry = new THREE.CylinderGeometry(
            CONFIG.robot.size * 0.02,
            CONFIG.robot.size * 0.02,
            CONFIG.robot.size * 0.3
        );
        const antennaMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            shininess: 50
        });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(0, CONFIG.robot.height * 0.6, 0);
        this.mesh.add(antenna);

        // Add antenna ball with glow
        const antennaBallGeometry = new THREE.SphereGeometry(CONFIG.robot.size * 0.05, 8, 8);
        const antennaBallMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0x441111, // Add red glow
            shininess: 100
        });
        const antennaBall = new THREE.Mesh(antennaBallGeometry, antennaBallMaterial);
        antennaBall.position.set(0, CONFIG.robot.height * 0.75, 0);
        this.mesh.add(antennaBall);
    }

    updatePosition([x, z]) {
        this.mesh.position.x = x * CONFIG.maze.cellSize;
        this.mesh.position.z = z * CONFIG.maze.cellSize;
        this.mesh.position.y = CONFIG.robot.height / 2;
    }

    isValidMove(position) {
        const [x, z] = position;

        // Check bounds
        if (x < 0 || x >= this.maze.ancho || z < 0 || z >= this.maze.alto) {
            console.log('[Robot] Invalid move: Out of bounds', position);
            return false;
        }

        // Check wall collision
        const posKey = `${x},${z}`;
        if (this.walls.has(posKey)) {
            console.log('[Robot] Invalid move: Wall collision at', position);
            return false;
        }

        console.log('[Robot] Valid move to', position);
        return true;
    }

    async moveTo(position) {
        if (this.isMoving) {
            console.log('[Robot] Already moving, ignoring move request');
            return false;
        }

        if (!this.isValidMove(position)) {
            console.log('[Robot] Cannot move to invalid position:', position);
            return false;
        }

        console.log('[Robot] Starting movement from', this.currentPosition, 'to', position);
        this.isMoving = true;
        this.targetPosition = position;

        const startPos = new THREE.Vector3(
            this.currentPosition[0] * CONFIG.maze.cellSize,
            CONFIG.robot.height / 2,
            this.currentPosition[1] * CONFIG.maze.cellSize
        );
        const endPos = new THREE.Vector3(
            position[0] * CONFIG.maze.cellSize,
            CONFIG.robot.height / 2,
            position[1] * CONFIG.maze.cellSize
        );

        // Calculate rotation angle
        const direction = endPos.clone().sub(startPos);
        const angle = Math.atan2(direction.x, direction.z);

        // Rotate robot
        await this.rotateToAngle(angle);

        // Move robot
        await this.animateMovement(startPos, endPos);

        this.currentPosition = position;
        this.isMoving = false;
        console.log('[Robot] Movement completed to', position);
        return true;
    }

    async rotateToAngle(targetAngle) {
        console.log('[Robot] Rotating to angle:', targetAngle);
        return new Promise(resolve => {
            const startAngle = this.mesh.rotation.y;
            const angleDiff = targetAngle - startAngle;

            // Normalize angle difference to [-π, π]
            const normalizedAngleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;

            const duration = Math.abs(normalizedAngleDiff) / CONFIG.robot.rotationSpeed;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = (currentTime - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);

                this.mesh.rotation.y = startAngle + normalizedAngleDiff * progress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    console.log('[Robot] Rotation completed');
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    async animateMovement(startPos, endPos) {
        console.log('[Robot] Animating movement from', startPos, 'to', endPos);
        return new Promise(resolve => {
            const distance = startPos.distanceTo(endPos);
            const duration = distance / CONFIG.maze.cellSize * CONFIG.robot.moveSpeed;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = (currentTime - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);

                this.mesh.position.lerpVectors(startPos, endPos, progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    console.log('[Robot] Movement animation completed');
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    getPosition() {
        return this.currentPosition;
    }

    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            console.log('[Robot] Disposed and removed from scene');
        }
    }
} 