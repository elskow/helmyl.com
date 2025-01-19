import { GameObject, Vector2D } from '../types';

export class Entity implements GameObject {
	position: Vector2D;
	velocity: Vector2D;
	rotation: number;
	scale: Vector2D;
	active: boolean;

	constructor(x: number, y: number) {
		this.position = { x, y };
		this.velocity = { x: 0, y: 0 };
		this.rotation = 0;
		this.scale = { x: 1, y: 1 };
		this.active = true;
	}

	update(deltaTime: number): void {
		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;
	}

	draw(ctx: WebGLRenderingContext): void {
		// Base draw method - to be overridden
	}
}
