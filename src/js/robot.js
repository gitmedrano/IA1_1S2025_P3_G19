class Robot {
    constructor(scene, startPosition, maze) {
        this.scene = scene;
        this.mesh = null;
        this.currentPosition = startPosition;
        this.targetPosition = null;
        this.isMoving = false;
        this.maze = maze;
        this.walls = new Set(maze.paredes.map(wall => `${wall[0]},${wall[1]}`));
        this.mixer = null;
        this.animations = {
            idle: null,
            walk: null
        };
        this.isWalking = false;
        this.clock = new THREE.Clock();
        console.log('[Robot] Initialized at position:', startPosition);
        console.log('[Robot] Walls:', this.walls);
        this.loadRobotModel();
    }

    loadRobotModel() {
        // Use the global THREE.GLTFLoader that's already imported in index.html
        const loader = new THREE.GLTFLoader();
        loader.load(
            '.././src/models/Soldier.glb',  // Updated path to be relative to the js directory
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
                    this.animations.idle = this.mixer.clipAction(animations[0]);
                    this.animations.walk = this.mixer.clipAction(animations[1]);
                    this.animations.idle.play();
                } else {
                    console.warn('Robot model has insufficient animations');
                }

                // Set initial position
                this.updatePosition(this.currentPosition);
                this.scene.add(this.mesh);
                console.log('[Robot] Robot model loaded and added to scene');
            },
            (xhr) => {
                console.log(`Loading robot model: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
            },
            (error) => {
                console.error('Error loading robot model:', error);
            }
        );
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

        // Calculate movement delta
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);

        // Only allow single-step orthogonal movements
        if (dx + dy !== 1) {
            console.log('[Robot] Invalid movement - must be single step orthogonal:', fromPos, 'to', toPos);
            return false;
        }

        return true;
    }

    async moveTo(position) {
        if (this.isMoving) {
            console.log('[Robot] Already moving, ignoring move request');
            return false;
        }

        if (!this.isValidMove(this.currentPosition, position)) {
            console.log('[Robot] Invalid move requested from', this.currentPosition, 'to', position);
            return false;
        }

        try {
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

            const direction = endPos.clone().sub(startPos);
            const angle = Math.atan2(direction.x, direction.z);

            await this.rotateToAngle(angle);
            this.startWalking();
            await this.animateMovement(startPos, endPos);
            this.stopWalking();

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

    startWalking() {
        if (this.animations.idle && this.animations.walk) {
            this.isWalking = true;
            this.animations.idle.crossFadeTo(this.animations.walk, 0.5, false);
            this.animations.walk.play();
        }
    }

    stopWalking() {
        if (this.animations.idle && this.animations.walk) {
            this.isWalking = false;
            this.animations.walk.crossFadeTo(this.animations.idle, 0.5, false);
        }
    }

    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
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

    updatePosition([x, z]) {
        const worldX = x * CONFIG.maze.cellSize;
        const worldZ = z * CONFIG.maze.cellSize;
        if (this.mesh) {
            this.mesh.position.set(worldX, CONFIG.robot.height / 2, worldZ);
        }
    }
} 