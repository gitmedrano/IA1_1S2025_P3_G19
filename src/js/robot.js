class Robot {
    constructor(scene, startPosition, maze, useCube = false) {
        this.scene = scene;
        this.mesh = null;
        this.currentPosition = startPosition;
        this.targetPosition = null;
        this.isMoving = false;
        this.maze = maze;
        this.walls = new Set(maze.paredes.map(wall => `${wall[0]},${wall[1]}`));
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.useCube = useCube;
        this.actions = {
            idle: null,
            tpose: null,
            walk: null,
            run: null
        };
        this.weights = {
            idle: 0,
            walk: 0,
            run: 0
        };
        this.modelLoaded = false;
        console.log('[Robot] Initialized at position:', startPosition);
        console.log('[Robot] Walls:', this.walls);
        this.loadRobotModel();
    }

    loadRobotModel() {
        if (this.useCube) {
            // Create a cube
            const geometry = new THREE.BoxGeometry(
                CONFIG.robot.size,
                CONFIG.robot.size,
                CONFIG.robot.size
            );
            const material = new THREE.MeshPhongMaterial({
                color: CONFIG.robot.color,
                shininess: 30
            });

            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;

            // Set initial position
            this.updatePosition(this.currentPosition);
            this.scene.add(this.mesh);
            console.log('[Robot] Cube created and added to scene');
        } else {
            // Use the global THREE.GLTFLoader that's already imported in index.html
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

                    // Debug logging for animations
                    console.log('[Robot] Available animations:', animations);
                    if (animations) {
                        animations.forEach((anim, index) => {
                            console.log(`[Robot] Animation ${index}: ${anim.name}`);
                        });
                    }

                    if (animations && animations.length >= 3) {
                        // Set up all available animations
                        this.actions.idle = this.mixer.clipAction(animations[0]);
                        this.actions.tpose = this.mixer.clipAction(animations[2]);
                        this.actions.walk = this.mixer.clipAction(animations[3]);
                        this.actions.run = this.mixer.clipAction(animations[1]);

                        // Start with walk animation immediately
                        this.actions.walk.setLoop(THREE.LoopRepeat, Infinity);
                        this.actions.walk.play();
                        this.setWeight(this.actions.walk, 1);

                        // Log animation state
                        console.log('[Robot] Walk animation state:', {
                            isRunning: this.actions.walk.isRunning(),
                            weight: this.actions.walk.getEffectiveWeight(),
                            timeScale: this.actions.walk.getEffectiveTimeScale()
                        });

                        this.modelLoaded = true;
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
    }

    setWeight(action, weight) {
        if (action) {
            action.enabled = true;
            action.setEffectiveTimeScale(1);
            action.setEffectiveWeight(weight);
        }
    }

    prepareCrossFade(startAction, endAction, duration) {
        if (!this.mixer || !startAction || !endAction) return;

        // Make sure all actions are unpaused
        Object.values(this.actions).forEach(action => {
            if (action) action.paused = false;
        });

        // Set up the crossfade
        this.setWeight(endAction, 1);
        endAction.time = 0;
        startAction.crossFadeTo(endAction, duration, true);

        // Play both actions during transition
        startAction.play();
        endAction.play();
    }

    startWalking() {
        if (this.useCube) return;
        if (!this.modelLoaded) {
            console.log('[Robot] Model not loaded yet, waiting...');
            return;
        }

        console.log('[Robot] Starting walk animation');
        if (this.actions.idle && this.actions.walk) {
            console.log('[Robot] Actions available:', {
                idle: this.actions.idle.isRunning(),
                walk: this.actions.walk.isRunning()
            });
            this.prepareCrossFade(this.actions.idle, this.actions.walk, 0.2);
            this.actions.walk.setLoop(THREE.LoopRepeat, Infinity);
            this.actions.walk.play();
        } else {
            console.warn('[Robot] Missing required animations:', {
                hasIdle: !!this.actions.idle,
                hasWalk: !!this.actions.walk
            });
        }
    }

    stopWalking() {
        if (this.useCube) return;

        console.log('[Robot] Stopping walk animation');
        if (this.actions.idle && this.actions.walk) {
            console.log('[Robot] Actions available:', {
                idle: this.actions.idle.isRunning(),
                walk: this.actions.walk.isRunning()
            });
            // this.prepareCrossFade(this.actions.walk, this.actions.idle, 0.2); // Faster transition
        } else {
            console.warn('[Robot] Missing required animations:', {
                hasIdle: !!this.actions.idle,
                hasWalk: !!this.actions.walk
            });
        }
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

            // Start walking animation
            this.startWalking();

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
            console.log('[Robot] Movement completed successfully to', position);
            return true;
        } catch (error) {
            console.error('[Robot] Movement failed:', error);
            return false;
        } finally {
            this.isMoving = false;
            // Stop walking animation
            // this.stopWalking();
        }
    }

    update(delta) {
        if (this.useCube) {
            // Add spinning animation to the cube
            if (this.mesh) {
                this.mesh.rotation.x += delta * 2;
                this.mesh.rotation.y += delta * 3;
                this.mesh.rotation.z += delta * 1.5;
            }
        } else if (this.mixer) {
            // Update animation mixer
            this.mixer.update(delta);
            console.log('[Robot] Mixer updated, delta:', delta);

            // Update weights
            this.weights.idle = this.actions.idle ? this.actions.idle.getEffectiveWeight() : 0;
            this.weights.walk = this.actions.walk ? this.actions.walk.getEffectiveWeight() : 0;
            this.weights.run = this.actions.run ? this.actions.run.getEffectiveWeight() : 0;

            console.log('[Robot] Current animation weights:', {
                idle: this.weights.idle,
                walk: this.weights.walk,
                run: this.weights.run
            });
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
            if (this.useCube) {
                if (this.mesh.geometry) this.mesh.geometry.dispose();
                if (this.mesh.material) this.mesh.material.dispose();
            } else {
                this.mesh.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            }
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