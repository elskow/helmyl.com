import { Player } from './Player';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { ParticleSystem } from './ParticleSystem';
import { ShaderProgram } from '../graphics/ShaderProgram';
import { Matrix } from './Matrix';
import { GameObject } from '../types';
import { StarField } from './StarField';

export class Game {
	private gl: WebGLRenderingContext;
	private starField: StarField;
	private player: Player;
	private enemies: Enemy[] = [];
	private projectiles: Projectile[] = [];
	private enemyProjectiles: Projectile[] = [];
	private particles: ParticleSystem;
	private lastTime = 0;
	private gameOver = false;
	private shaderProgram: ShaderProgram;
	private running: boolean = false;
	private spawnInterval?: number;
	private score: number = 0;
	private highScore: number = 0;

	constructor(canvas: HTMLCanvasElement) {
		try {
			this.gl = canvas.getContext('webgl', {
				alpha: false,
				antialias: true,
				depth: false
			})!;

			if (!this.gl) {
				throw new Error('WebGL not supported');
			}

			this.gl.getExtension('WEBGL_lose_context');
			this.gl.getExtension('WEBGL_debug_renderer_info');

			console.log('WebGL Vendor:', this.gl.getParameter(this.gl.VENDOR));
			console.log('WebGL Renderer:', this.gl.getParameter(this.gl.RENDERER));
			console.log('WebGL Version:', this.gl.getParameter(this.gl.VERSION));

			this.loadHighScore();
			this.initGame();
		} catch (error) {
			console.error('Game initialization failed:', error);
			this.showErrorMessage();
		}
	}

	private showErrorMessage(): void {
		const container = document.querySelector('.game-container');
		if (container) {
			container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 20px;">
                <h2>Oops! Something went wrong</h2>
                <p>Unable to initialize the game. Please check if WebGL is supported in your browser.</p>
            </div>
        `;
		}
	}

	private loadHighScore(): void {
		const savedHighScore = localStorage.getItem('highScore');
		this.highScore = savedHighScore ? parseInt(savedHighScore, 10) : 0;
		this.updateHighScoreDisplay();
	}

	private updateHighScoreDisplay(): void {
		const highScoreElement = document.getElementById('highScoreValue');
		if (highScoreElement) {
			highScoreElement.textContent = this.highScore.toString();
		}
	}

	private updateHighScore(score: number): void {
		if (score > this.highScore) {
			this.highScore = score;
			localStorage.setItem('highScore', this.highScore.toString());
			this.updateHighScoreDisplay();
		}
	}

	private initGame() {
		// Initialize shader program
		this.shaderProgram = new ShaderProgram(this.gl);

		// Setup GL
		this.setupGL();

		// Initialize game objects
		this.starField = new StarField(this.gl, this.shaderProgram);
		this.player = new Player(0, -0.8, this.gl, this.shaderProgram);
		this.particles = new ParticleSystem(this.gl, this.shaderProgram);
		this.projectiles = [];
		this.enemies = [];
		this.gameOver = false;
		// Reset scores
		this.score = 0;
		this.updateHighScoreDisplay();

		// Show HUD
		const hud = document.querySelector('.hud-top');
		if (hud) {
			(hud as HTMLElement).style.display = 'flex';
		}

		// Hide game over screen
		const gameOverScreen = document.getElementById('gameOver');
		if (gameOverScreen) {
			gameOverScreen.classList.add('hidden');
		}

		this.lastTime = performance.now();

		// Clear any existing spawn interval
		if (this.spawnInterval) {
			clearInterval(this.spawnInterval);
		}

		// Setup event listeners
		this.setupEventListeners();

		// Start game loop
		this.running = true;
		this.gameLoop(performance.now());

		// Start spawning enemies
		this.spawnEnemies();
	}

	private setupGL(): void {
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.clearColor(0.06, 0.09, 0.16, 1.0);
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

		// Set up projection and view matrices
		const aspect = this.gl.canvas.width / this.gl.canvas.height;
		const projection = Matrix.createProjection(2 * aspect, 2);
		const view = Matrix.createView();

		this.shaderProgram.use();
		this.gl.uniformMatrix4fv(
			this.shaderProgram.getUniformLocation('uProjectionMatrix'),
			false,
			projection
		);
		this.gl.uniformMatrix4fv(this.shaderProgram.getUniformLocation('uViewMatrix'), false, view);
	}

	private setupEventListeners(): void {
		// Remove old listeners if they exist
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('keyup', this.handleKeyUp);

		// Add new listeners
		window.addEventListener('keydown', this.handleKeyDown.bind(this));
		window.addEventListener('keyup', this.handleKeyUp.bind(this));
	}

	private handleKeyDown = (e: KeyboardEvent): void => {
		if (this.gameOver) return;

		switch (
			e.code // Use e.code instead of e.key for better cross-browser support
		) {
			case 'ArrowLeft':
			case 'KeyA':
				this.player.velocity.x = -0.8;
				break;
			case 'ArrowRight':
			case 'KeyD':
				this.player.velocity.x = 0.8;
				break;
			case 'Space':
				e.preventDefault();
				this.shoot();
				break;
		}
	};

	private handleKeyUp = (e: KeyboardEvent): void => {
		switch (e.code) {
			case 'ArrowLeft':
			case 'KeyA':
				if (this.player.velocity.x < 0) this.player.velocity.x = 0;
				break;
			case 'ArrowRight':
			case 'KeyD':
				if (this.player.velocity.x > 0) this.player.velocity.x = 0;
				break;
		}
	};

	private shoot(): void {
		if (this.gameOver) return;

		// Check if player can shoot
		if (!this.player.canShoot()) return;

		// Mark the shot
		this.player.shoot();

		// Create and add projectile
		const projectile = new Projectile(
			this.player.position.x,
			this.player.position.y + 0.1,
			this.gl,
			this.shaderProgram
		);
		this.projectiles.push(projectile);
	}

	private spawnEnemies(): void {
		if (this.gameOver || !this.running) return;

		if (this.spawnInterval) {
			clearInterval(this.spawnInterval);
		}

		this.spawnInterval = window.setInterval(() => {
			if (!this.gameOver && this.running) {
				const enemy = new Enemy(
					Math.random() * 1.6 - 0.8,
					1.2,
					this.gl,
					this.shaderProgram
				);
				enemy.setTarget(this.player); // Set player as target
				this.enemies.push(enemy);
			}
		}, 2000);
	}

	update(deltaTime: number): void {
		if (this.gameOver) return;

		// Update starfield first
		this.starField.update(deltaTime);

		// Update player
		this.player.update(deltaTime);

		// Update player projectiles
		this.projectiles = this.projectiles.filter((projectile) => {
			projectile.update(deltaTime);
			return projectile.active;
		});

		// Update enemy projectiles
		this.enemyProjectiles = this.enemyProjectiles.filter((projectile) => {
			projectile.update(deltaTime);
			return projectile.active;
		});

		// Update enemies and their shooting
		this.enemies = this.enemies.filter((enemy) => {
			enemy.update(deltaTime);

			// Handle enemy shooting
			enemy.lastFired += deltaTime;
			if (enemy.lastFired >= 1 / enemy.fireRate) {
				const projectile = enemy.shoot();
				this.enemyProjectiles.push(projectile);
				enemy.lastFired = 0;
			}

			return enemy.active;
		});

		// Check collisions
		this.checkCollisions();

		// Update particles
		this.particles.update(deltaTime);

		// Update HUD
		this.updateHUD();
	}

	private checkCollisions(): void {
		// Player projectiles vs Enemies
		this.projectiles.forEach((projectile) => {
			this.enemies.forEach((enemy) => {
				if (this.checkCollision(projectile, enemy)) {
					enemy.damage(projectile.damage);
					projectile.active = false;
					if (!enemy.active) {
						this.player.score += enemy.points;
						this.particles.spawn(enemy.position.x, enemy.position.y);
					}
				}
			});
		});

		// Enemy projectiles vs Player
		this.enemyProjectiles.forEach((projectile) => {
			if (this.checkCollision(projectile, this.player)) {
				this.player.damage(25); // Damage from enemy projectile
				projectile.active = false;
				this.particles.spawn(this.player.position.x, this.player.position.y);
			}
		});

		// Enemies vs Player (collision damage)
		this.enemies.forEach((enemy) => {
			if (this.checkCollision(enemy, this.player)) {
				this.player.damage(50); // More damage for direct collision
				enemy.active = false;
				this.particles.spawn(enemy.position.x, enemy.position.y);
				this.particles.spawn(this.player.position.x, this.player.position.y);

				if (this.player.lives <= 0) {
					this.gameOver = true;
					this.showGameOver();
				}
			}
		});
	}

	private checkCollision(a: GameObject, b: GameObject): boolean {
		const dx = a.position.x - b.position.x;
		const dy = a.position.y - b.position.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance < 0.1; // Collision radius
	}

	private updateHUD(): void {
		document.getElementById('scoreValue')!.textContent = this.player.score.toString();
		document.getElementById('livesValue')!.textContent = this.player.lives.toString();
		document.getElementById('shieldValue')!.style.width = `${this.player.shield}%`;

		// Update heat indicator
		const heatElement = document.getElementById('shootCooldown');
		if (heatElement) {
			const heatPercent = this.player.getHeatPercentage();
			heatElement.style.width = `${100 - heatPercent}%`;

			// Change color based on heat level
			if (this.player.isOverheated()) {
				heatElement.style.backgroundColor = '#ef4444'; // Red for overheat
			} else if (heatPercent > 80) {
				heatElement.style.backgroundColor = '#f97316'; // Orange for high heat
			} else if (heatPercent > 50) {
				heatElement.style.backgroundColor = '#eab308'; // Yellow for medium heat
			} else {
				heatElement.style.backgroundColor = '#4f46e5'; // Blue for low heat
			}
		}
	}

	private showGameOver(): void {
		this.running = false;
		this.gameOver = true;

		if (this.spawnInterval) {
			clearInterval(this.spawnInterval);
		}

		// Update high score
		this.updateHighScore(this.player.score);

		// Hide HUD
		const hud = document.querySelector('.hud-top');
		if (hud) {
			(hud as HTMLElement).style.display = 'none';
		}

		// Show game over screen with scores
		const gameOverScreen = document.getElementById('gameOver');
		if (gameOverScreen) {
			gameOverScreen.classList.remove('hidden');
			document.getElementById('finalScore')!.textContent = this.player.score.toString();
			document.getElementById('finalHighScore')!.textContent = this.highScore.toString();
		}
		const finalScoreElement = document.getElementById('finalScore')!;
		const finalHighScoreElement = document.getElementById('finalHighScore')!;

		finalScoreElement.textContent = this.player.score.toString();
		finalHighScoreElement.textContent = this.highScore.toString();

		// Highlight new high score
		if (this.player.score === this.highScore) {
			finalScoreElement.classList.add('new-high');
			// Spawn celebration particles at multiple points
			this.particles.spawnCelebration(-0.5, 0, 25);
			this.particles.spawnCelebration(0.5, 0, 25);
			this.particles.spawnCelebration(0, 0.5, 25);

			// Add delayed spawns for continuous celebration effect
			setTimeout(() => {
				this.particles.spawnCelebration(0, 0, 50);
			}, 500);
		} else {
			finalScoreElement.classList.remove('new-high');
		}
	}

	draw(): void {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		this.starField.draw(this.gl);
		this.player.draw(this.gl);
		this.projectiles.forEach((p) => p.draw(this.gl));
		this.enemyProjectiles.forEach((p) => p.draw(this.gl)); // Draw enemy projectiles
		this.enemies.forEach((e) => e.draw(this.gl));
		this.particles.draw(this.gl);
	}

	gameLoop(currentTime: number): void {
		if (!this.running) return;

		const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap delta time
		this.lastTime = currentTime;

		this.update(deltaTime); // Pass deltaTime instead of currentTime
		this.draw();

		requestAnimationFrame((time) => this.gameLoop(time));
	}

	start(): void {
		this.gameLoop(performance.now());
	}

	public cleanup(): void {
		this.running = false;
		this.gameOver = true;
		if (this.spawnInterval) {
			clearInterval(this.spawnInterval);
			this.spawnInterval = undefined;
		}
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('keyup', this.handleKeyUp);
	}
}
