import { vec3, mat4 } from 'gl-matrix';
import { createSphereMesh } from './geometry.js';

export class Marble {
	constructor(renderer, track) {
		this.renderer = renderer;
		this.track = track;
		this.radius = 0.1;
		// Dark green marble - stands out against environment
		this.mesh = createSphereMesh(renderer, this.radius, 24, [0.1, 0.4, 0.15]);
		this.reset();
	}

	reset() {
		this.distance = 0;
		this.velocity = 0.5;
		this.position = vec3.clone(this.track.path[0]);
		this.rotation = mat4.create();
		this.angularVelocity = vec3.create();
	}

	update(dt) {
		const { position, index, t } = this.track.getPositionAtDistance(this.distance);
		const frame = this.track.getFrameAt(index, t);

		vec3.normalize(frame.tangent, frame.tangent);
		vec3.normalize(frame.normal, frame.normal);
		vec3.normalize(frame.binormal, frame.binormal);

		// Physics
		const gravity = 15;
		const friction = 0.015;
		const airResistance = 0.001;

		const gravityForce = -frame.tangent[1] * gravity;
		const frictionForce = -Math.sign(this.velocity) * friction * gravity;
		const airForce = -Math.sign(this.velocity) * airResistance * this.velocity * this.velocity;

		this.velocity += (gravityForce + frictionForce + airForce) * dt;

		const maxSpeed = 20;
		this.velocity = Math.max(-maxSpeed, Math.min(maxSpeed, this.velocity));

		this.distance += this.velocity * dt;

		// Track bounds
		if (this.distance < 0) {
			this.distance = 0;
			this.velocity = Math.abs(this.velocity) * 0.3;
		} else if (this.distance >= this.track.pathLength - 0.1) {
			this.distance = 0;
			this.velocity = 0.5;
		}

		// Update position
		const newPos = this.track.getPositionAtDistance(this.distance);
		const newFrame = this.track.getFrameAt(newPos.index, newPos.t);
		vec3.normalize(newFrame.normal, newFrame.normal);

		vec3.copy(this.position, newPos.position);

		const offset = this.radius + 0.02;
		this.position[0] += newFrame.normal[0] * offset;
		this.position[1] += newFrame.normal[1] * offset;
		this.position[2] += newFrame.normal[2] * offset;

		// Rolling rotation
		const rotationSpeed = this.velocity / this.radius;
		const rotAxis = newFrame.binormal;
		const rotMatrix = mat4.create();
		mat4.rotate(rotMatrix, rotMatrix, rotationSpeed * dt, rotAxis);
		mat4.multiply(this.rotation, rotMatrix, this.rotation);

		return { frame: newFrame, speed: Math.abs(this.velocity) };
	}

	draw(renderer) {
		const model = mat4.create();
		mat4.translate(model, model, this.position);
		mat4.multiply(model, model, this.rotation);
		// Glossy marble - slightly metallic for nice reflections
		renderer.drawMesh(this.mesh, model, 0.15, 0.25, true);
	}

	getSpeed() {
		return Math.abs(this.velocity);
	}
}
