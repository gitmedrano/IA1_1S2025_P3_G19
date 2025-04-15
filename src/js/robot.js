class Robot {
    constructor(scene, startPosition, maze) {
        this.scene = scene;
        this.mesh = null;
        this.currentPosition = startPosition;
        this.targetPosition = null;
        this.isMoving = false;
        this.maze = maze;
        this.walls = new Set(maze.paredes.map(wall => `${wall[0]},${wall[1]}`));
        console.log('[Robot] Initialized at position:', startPosition);
        console.log('[Robot] Walls:', this.walls);
        this.createRobotMesh();
    }

    isValidMove(fromPos, toPos) {
        const [fromX, fromY] = fromPos;
        const [toX, toY] = toPos;

        // Check if target position is within bounds
        if (toX < 0 || toX >= this.maze.ancho || toY < 0 || toY >= this.maze.alto) {
            console.log('[Robot] Target position out of bounds:', toPos);
            return false;
        }

        // Check if target position is a wall
        if (this.walls.has(`${toX},${toY}`)) {
            console.log('[Robot] Target position is a wall:', toPos);
            return false;
        }

        // Check if movement is diagonal
        if (Math.abs(toX - fromX) + Math.abs(toY - fromY) > 1) {
            console.log('[Robot] Diagonal movement not allowed:', fromPos, 'to', toPos);
            return false;
        }

        // Check for wall collision along the path
        if (fromX === toX) { // Vertical movement
            const minY = Math.min(fromY, toY);
            const maxY = Math.max(fromY, toY);
            for (let y = minY; y <= maxY; y++) {
                if (this.walls.has(`${fromX},${y}`)) {
                    console.log('[Robot] Wall collision detected at:', [fromX, y]);
                    return false;
                }
            }
        } else if (fromY === toY) { // Horizontal movement
            const minX = Math.min(fromX, toX);
            const maxX = Math.max(fromX, toX);
            for (let x = minX; x <= maxX; x++) {
                if (this.walls.has(`${x},${fromY}`)) {
                    console.log('[Robot] Wall collision detected at:', [x, fromY]);
                    return false;
                }
            }
        }

        console.log('[Robot] Move validated from', fromPos, 'to', toPos);
        return true;
    }

    async moveTo(position) {
        if (this.isMoving) {
            console.log('[Robot] Already moving, ignoring move request');
            return false;
        }

        // Validate the movement
        if (!this.isValidMove(this.currentPosition, position)) {
            console.log('[Robot] Invalid move requested from', this.currentPosition, 'to', position);
            return false;
        }

        console.log('[Robot] Starting movement from', this.currentPosition, 'to', position);
        this.isMoving = true;
        this.targetPosition = position;

        try {
            // Calculate world positions
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
            console.log('[Robot] Movement completed successfully to', position);
            return true;
        } catch (error) {
            console.error('[Robot] Movement failed:', error);
            return false;
        } finally {
            this.isMoving = false;
        }
    }

    createRobotMesh() {
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
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Add collision box (for visualization during development)
        const collisionBoxGeometry = new THREE.BoxGeometry(
            CONFIG.maze.cellSize * 0.8,
            CONFIG.robot.height,
            CONFIG.maze.cellSize * 0.8
        );
        const collisionBoxMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true,
            visible: false // Set to true for debugging collisions
        });
        this.collisionBox = new THREE.Mesh(collisionBoxGeometry, collisionBoxMaterial);
        this.mesh.add(this.collisionBox);

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
            emissive: 0x444444
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(CONFIG.robot.size * 0.2, CONFIG.robot.height * 0.3, -CONFIG.robot.size * 0.3);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(-CONFIG.robot.size * 0.2, CONFIG.robot.height * 0.3, -CONFIG.robot.size * 0.3);

        this.mesh.add(leftEye);
        this.mesh.add(rightEye);

        // Add direction indicator (arrow)
        const arrowGeometry = new THREE.ConeGeometry(CONFIG.robot.size * 0.1, CONFIG.robot.size * 0.2, 8);
        const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.rotation.x = -Math.PI / 2;
        arrow.position.set(0, CONFIG.robot.height * 0.5, -CONFIG.robot.size * 0.4);
        this.mesh.add(arrow);
    }

    updatePosition([x, z]) {
        const worldX = x * CONFIG.maze.cellSize;
        const worldZ = z * CONFIG.maze.cellSize;
        this.mesh.position.set(worldX, CONFIG.robot.height / 2, worldZ);

        // Update collision box position
        if (this.collisionBox) {
            this.collisionBox.position.set(0, 0, 0);
        }
    }

    async rotateToAngle(targetAngle) {
        return new Promise(resolve => {
            const startAngle = this.mesh.rotation.y;
            const angleDiff = targetAngle - startAngle;
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
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    async animateMovement(startPos, endPos) {
        return new Promise((resolve, reject) => {
            const distance = startPos.distanceTo(endPos);
            const duration = distance / CONFIG.maze.cellSize * CONFIG.robot.moveSpeed;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = (currentTime - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);

                // Use smooth easing
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : -1 + (4 - 2 * progress) * progress;

                this.mesh.position.lerpVectors(startPos, endPos, easeProgress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
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
            this.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
} 