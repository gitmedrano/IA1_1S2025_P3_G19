class RobotTest {
    constructor(scene, startPosition, maze) {
        this.scene = scene;
        this.mesh = null;
        this.currentPosition = startPosition;
        this.targetPosition = null;
        this.isMoving = false;
        this.maze = maze;
        this.walls = new Set(maze.paredes.map(wall => `${wall[0]},${wall[1]}`));
        this.mixer = null;
        this.idleAction = null;
        this.walkAction = null;
        this.isWalking = false;
        this.isReady = false;
        this.clock = new THREE.Clock();
        console.log('[RobotTest] Initialized at position:', startPosition);
    }

    async init() {
        await this.loadRobotModel();
        return this;
    }

    loadRobotModel() {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                '.././src/models/Soldier.glb',
                (gltf) => {
                    this.mesh = gltf.scene;
                    this.mesh.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    // Setup animations
                    this.mixer = new THREE.AnimationMixer(this.mesh);
                    const animations = gltf.animations;

                    if (animations && animations.length >= 2) {
                        this.idleAction = this.mixer.clipAction(animations[0]);
                        this.walkAction = this.mixer.clipAction(animations[3]);
                        this.idleAction.play();
                    }

                    // Set initial position
                    this.updatePosition(this.currentPosition);
                    this.scene.add(this.mesh);
                    this.isReady = true;
                    resolve(this);
                },
                undefined,
                (error) => {
                    console.error('Error loading robot model:', error);
                    reject(error);
                }
            );
        });
    }

    startWalking() {
        if (!this.isReady) {
            console.warn('[RobotTest] Cannot start walking: robot not ready');
            return;
        }
        if (this.idleAction && this.walkAction) {
            this.isWalking = true;
            this.idleAction.crossFadeTo(this.walkAction, 0.5, false);
            this.walkAction.play();
        }
    }

    stopWalking() {
        if (this.idleAction && this.walkAction) {
            this.isWalking = false;
            this.walkAction.crossFadeTo(this.idleAction, 0.5, false);
        }
    }

    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Move the robot forward when walking
        if (this.isWalking && this.mesh) {
            this.mesh.translateZ(-0.05);
        }
    }

    async moveTo(position) {
        if (this.isMoving) {
            console.log('[RobotTest] Already moving, ignoring move request');
            return false;
        }

        if (!this.isValidMove(this.currentPosition, position)) {
            console.log('[RobotTest] Invalid move requested from', this.currentPosition, 'to', position);
            return false;
        }

        try {
            console.log('[RobotTest] Starting movement from', this.currentPosition, 'to', position);
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

            const direction = endPos.clone().sub(startPos);
            const angle = Math.atan2(direction.x, direction.z);

            await this.rotateToAngle(angle);
            await this.animateMovement(startPos, endPos);

            this.currentPosition = position;
            console.log('[RobotTest] Movement completed successfully to', position);
            return true;
        } catch (error) {
            console.error('[RobotTest] Movement failed:', error);
            return false;
        } finally {
            this.isMoving = false;
        }
    }

    isValidMove(fromPos, toPos) {
        const [fromX, fromY] = fromPos;
        const [toX, toY] = toPos;

        // Check if target position is within bounds
        if (toX < 0 || toX >= this.maze.ancho || toY < 0 || toY >= this.maze.alto) {
            return false;
        }

        // Check if target position is a wall
        if (this.walls.has(`${toX},${toY}`)) {
            return false;
        }

        // Calculate movement delta
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);

        // Only allow single-step orthogonal movements
        if (dx + dy !== 1) {
            return false;
        }

        return true;
    }

    async rotateToAngle(targetAngle) {
        return new Promise(resolve => {
            const startAngle = this.mesh.rotation.y;
            const angleDiff = targetAngle - startAngle;
            const normalizedAngleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
            const duration = Math.abs(normalizedAngleDiff) / 0.05;
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
            const duration = distance / CONFIG.maze.cellSize * 0.5;
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

    updatePosition([x, z]) {
        const worldX = x * CONFIG.maze.cellSize;
        const worldZ = z * CONFIG.maze.cellSize;
        if (this.mesh) {
            this.mesh.position.set(worldX, CONFIG.robot.height / 2, worldZ);
        }
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