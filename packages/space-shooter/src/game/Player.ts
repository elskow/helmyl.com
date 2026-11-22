import { Player as PlayerType } from '../types';
import { Entity } from './Entity';
import { ShaderProgram } from '../graphics/ShaderProgram';
import { PlayerShip } from './PlayerShip';
import { mat4 } from 'gl-matrix';

export class Player extends Entity implements PlayerType {
	lives: number = 3;
	shield: number = 100;
	invulnerable: boolean = false;
	score: number = 0;
	private model: PlayerShip;
	private shaderProgram: ShaderProgram;
	private modelMatrix: mat4;

	private readonly SCREEN_LEFT = -0.95;
	private readonly SCREEN_RIGHT = 0.95;

	private heatLevel: number = 0;
	private maxHeat: number = 100;
	private heatPerShot: number = 10;
	private coolingRate: number = 40;
	private overheatCooldown: boolean = false;
	private overheatCooldownTime: number = 1500;
	private lastTimeShot: number = 0;
	private rapidFireThreshold: number = 200;

	constructor(x: number, y: number, gl: WebGLRenderingContext, shaderProgram: ShaderProgram) {
		super(x, y);
		this.shaderProgram = shaderProgram;
		this.model = new PlayerShip(gl, shaderProgram);
		this.modelMatrix = mat4.create();
	}

	update(deltaTime: number): void {
		super.update(deltaTime);

		const nextX = this.position.x + this.velocity.x * deltaTime;

		if (nextX <= this.SCREEN_LEFT) {
			this.position.x = this.SCREEN_LEFT;
			this.velocity.x = 0;
		} else if (nextX >= this.SCREEN_RIGHT) {
			this.position.x = this.SCREEN_RIGHT;
			this.velocity.x = 0;
		} else {
			this.position.x = nextX;
		}


		if (this.shield < 100) {
			this.shield += deltaTime * 5;
			if (this.shield > 100) this.shield = 100;
		}


		if (!this.overheatCooldown) {
			const coolingAmount = this.coolingRate * deltaTime;
			const timeSinceLastShot = performance.now() - this.lastTimeShot;
			const coolingMultiplier = timeSinceLastShot > 1000 ? 2 : 1;
			this.heatLevel = Math.max(0, this.heatLevel - coolingAmount * coolingMultiplier);
		}
	}

	draw(gl: WebGLRenderingContext): void {
		mat4.identity(this.modelMatrix);
		mat4.translate(this.modelMatrix, this.modelMatrix, [this.position.x, this.position.y, 0]);
		mat4.rotate(this.modelMatrix, this.modelMatrix, this.rotation, [0, 0, 1]);
		mat4.scale(this.modelMatrix, this.modelMatrix, [this.scale.x, this.scale.y, 1]);

		this.model.draw(gl, this.modelMatrix);
	}

	canShoot(): boolean {
		if (this.overheatCooldown) return false;

		const currentTime = performance.now();
		const timeSinceLastShot = currentTime - this.lastTimeShot;


		if (timeSinceLastShot < this.rapidFireThreshold) {
			this.heatLevel += 10;
		}

		return this.heatLevel < this.maxHeat;
	}

	shoot(): void {
		const currentTime = performance.now();
		this.lastTimeShot = currentTime;

		this.heatLevel += this.heatPerShot;

		if (this.heatLevel >= this.maxHeat) {
			this.overheatCooldown = true;
			this.heatLevel = this.maxHeat;


			setTimeout(() => {
				this.overheatCooldown = false;
				this.heatLevel = this.maxHeat * 0.6;
			}, this.overheatCooldownTime);
		}
	}

	getHeatPercentage(): number {
		return (this.heatLevel / this.maxHeat) * 100;
	}

	isOverheated(): boolean {
		return this.overheatCooldown;
	}

	damage(amount: number): void {
		if (this.invulnerable) return;

		if (this.shield > 0) {
			this.shield -= amount;
			if (this.shield < 0) {
				this.lives--;
				this.shield = 100;
				this.invulnerable = true;
				setTimeout(() => (this.invulnerable = false), 2000);
			}
		} else {
			this.lives--;
			if (this.lives > 0) {
				this.shield = 100;
				this.invulnerable = true;
				setTimeout(() => (this.invulnerable = false), 2000);
			}
		}
	}
}
