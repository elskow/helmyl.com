import { Enemy as EnemyType, Vector2D } from '../types';
import { Entity } from './Entity';
import { ShaderProgram } from '../graphics/ShaderProgram';
import { mat4 } from 'gl-matrix';
import { Projectile } from './Projectile';
import { SvgPath } from './SvgPath';

export class Enemy extends Entity implements EnemyType {
	health: number = 100;
	type: string = 'basic';
	points: number = 10;
	fireRate: number = 1; // Shots per second
	lastFired: number = 0;
	private projectiles: Projectile[] = [];
	public shaderProgram: ShaderProgram;
	private vertices: Float32Array;
	private buffer: WebGLBuffer;
	private gl: WebGLRenderingContext;
	private movementPattern: 'sine' | 'zigzag' | 'chase' | 'circle' = 'sine';
	private movementPhase: number = Math.random() * Math.PI * 2;
	private amplitude: number = 0.3 + Math.random() * 0.3; // Random movement amplitude
	private frequency: number = 0.5 + Math.random() * 1.0; // Random movement frequency
	private centerX: number; // Original X position for circular movement
	private targetPlayer?: { position: Vector2D }; // Reference to player for chase behavior

	constructor(x: number, y: number, gl: WebGLRenderingContext, shaderProgram: ShaderProgram) {
		super(x, y);
		this.velocity.y = -0.2 - Math.random() * 0.1; // Random downward speed
		this.shaderProgram = shaderProgram;
		this.gl = gl;
		this.centerX = x;

		// Randomly select movement pattern
		const patterns: Array<'sine' | 'zigzag' | 'chase' | 'circle'> = [
			'sine',
			'zigzag',
			'chase',
			'circle'
		];
		this.movementPattern = patterns[Math.floor(Math.random() * patterns.length)];

		// Alien ship shape
		const enemyPath = `
            M 0 -0.06
            L -0.06 0
            L -0.04 0.02
            L -0.06 0.04
            L 0 0.06
            L 0.06 0.04
            L 0.04 0.02
            L 0.06 0
            Z
        `;

		this.vertices = SvgPath.parsePathToVertices(enemyPath, 1);

		this.buffer = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
		this.fireRate = 0.5 + Math.random() * 0.5;
	}

	setTarget(player: { position: Vector2D }) {
		this.targetPlayer = player;
	}

	update(deltaTime: number): void {
		super.update(deltaTime);

		// Update movement based on pattern
		switch (this.movementPattern) {
			case 'sine':
				this.moveSineWave(deltaTime);
				break;
			case 'zigzag':
				this.moveZigzag(deltaTime);
				break;
			case 'chase':
				this.moveChasePlayer(deltaTime);
				break;
			case 'circle':
				this.moveCircular(deltaTime);
				break;
		}

		// Smart shooting: Only shoot when roughly aligned with player
		if (this.targetPlayer && this.canShootPlayer()) {
			this.lastFired += deltaTime;
			if (this.lastFired >= 1 / this.fireRate) {
				this.shoot();
				this.lastFired = 0;
			}
		}

		// Check if enemy is off screen
		if (this.position.y < -1.2 || this.position.x < -1.2 || this.position.x > 1.2) {
			this.active = false;
		}
	}

	private moveSineWave(deltaTime: number): void {
		this.movementPhase += deltaTime * this.frequency;
		this.position.x = this.centerX + Math.sin(this.movementPhase) * this.amplitude;
	}

	private moveZigzag(deltaTime: number): void {
		this.movementPhase += deltaTime * this.frequency;
		this.position.x =
			this.centerX + (Math.abs((this.movementPhase % 2) - 1) * 2 - 1) * this.amplitude;
	}

	private moveChasePlayer(deltaTime: number): void {
		if (this.targetPlayer) {
			const dx = this.targetPlayer.position.x - this.position.x;
			const chaseSpeed = 0.3;
			this.position.x += Math.sign(dx) * chaseSpeed * deltaTime;
		}
	}

	private moveCircular(deltaTime: number): void {
		this.movementPhase += deltaTime * this.frequency;
		this.position.x = this.centerX + Math.cos(this.movementPhase) * this.amplitude;
		// Add slight vertical oscillation
		this.position.y += Math.sin(this.movementPhase) * deltaTime * 0.1;
	}

	private canShootPlayer(): boolean {
		if (!this.targetPlayer) return false;

		// Only shoot if roughly aligned with player and in front
		const dx = Math.abs(this.targetPlayer.position.x - this.position.x);
		const dy = this.targetPlayer.position.y - this.position.y;
		return dx < 0.1 && dy < 0; // Aligned horizontally and player is below
	}

	shoot(): Projectile {
		const projectile = new Projectile(
			this.position.x,
			this.position.y - 0.1,
			this.gl,
			this.shaderProgram
		);
		projectile.velocity.y = -0.5; // Move downward
		projectile.speed = -0.5; // Set negative speed for enemy projectiles
		return projectile;
	}

	draw(gl: WebGLRenderingContext): void {
		this.shaderProgram.use();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		const modelMatrix = mat4.create();
		mat4.translate(modelMatrix, modelMatrix, [this.position.x, this.position.y, 0]);
		mat4.rotate(modelMatrix, modelMatrix, this.rotation, [0, 0, 1]);
		mat4.scale(modelMatrix, modelMatrix, [this.scale.x, this.scale.y, 1]);

		gl.uniformMatrix4fv(this.shaderProgram.getUniformLocation('uModelMatrix'), false, modelMatrix);

		// Enemy ship gradient colors
		gl.uniform3f(
			this.shaderProgram.getUniformLocation('uColor'),
			0.8,
			0.2,
			0.2 // Red-ish color
		);
		gl.uniform1f(this.shaderProgram.getUniformLocation('uAlpha'), 1.0);

		const positionLocation = this.shaderProgram.getAttribLocation('aPosition');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length / 3);
	}

	damage(amount: number): void {
		this.health -= amount;
		if (this.health <= 0) {
			this.active = false;
		}
	}
}
