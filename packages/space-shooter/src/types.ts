export interface Vector2D {
	x: number;
	y: number;
}

export interface GameObject {
	position: Vector2D;
	velocity: Vector2D;
	rotation: number;
	scale: Vector2D;
	active: boolean;
}

export interface Player extends GameObject {
	lives: number;
	shield: number;
	invulnerable: boolean;
	score: number;
}

export interface Projectile extends GameObject {
	damage: number;
	lifeTime: number;
	speed: number;
}

export interface Enemy extends GameObject {
	health: number;
	type: string;
	points: number;
	fireRate: number;
	lastFired: number;
}

export interface Powerup extends GameObject {
	type: 'shield' | 'weapon' | 'life';
	duration: number;
}

export interface Particle extends GameObject {
	color: string;
	size: number;
	life: number;
	maxLife: number;
}
