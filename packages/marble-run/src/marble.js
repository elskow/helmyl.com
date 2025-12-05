import { vec3, mat4 } from 'gl-matrix';
import { createSphereMesh } from './geometry.js';

export class Marble {
	constructor(renderer, track) {
		this.renderer = renderer;
		this.track = track;
		this.radius = 0.12;
		this.mesh = createSphereMesh(renderer, this.radius, 24, [0.1, 0.4, 0.15]);

		this.railRadius = 0.04;
		this.railOffset = 0.14; // Match track.js - wider track

		this.reset();
	}

	reset() {
		const startPos = this.track.getPositionAtDistance(0.5);
		const frame = this.track.getFrameAt(startPos.index, startPos.t);

		this.position = vec3.clone(startPos.position);
		this.position[1] += this.railRadius + this.radius + 0.05;

		vec3.normalize(frame.tangent, frame.tangent);

		// Initial push - start with good speed!
		this.velocity = vec3.scale(vec3.create(), frame.tangent, 0.1);

		this.rotation = mat4.create();
		this.trackDistance = 0.5;
	}

	update(dt) {
		const gravity = vec3.fromValues(0, -9.8, 0);
		const restitution = 0.3;
		const friction = 0.995; // Less friction - marble keeps rolling

		// Apply gravity
		vec3.scaleAndAdd(this.velocity, this.velocity, gravity, dt);

		// Move
		const newPos = vec3.create();
		vec3.scaleAndAdd(newPos, this.position, this.velocity, dt);

		// Check collisions with track geometry
		const collision = this.collideWithTrack(newPos);

		if (collision.hit) {
			vec3.copy(this.position, collision.position);

			const vDotN = vec3.dot(this.velocity, collision.normal);
			if (vDotN < 0) {
				vec3.scaleAndAdd(
					this.velocity,
					this.velocity,
					collision.normal,
					-vDotN * (1 + restitution)
				);
				vec3.scale(this.velocity, this.velocity, friction);
			}

			this.trackDistance = collision.trackDistance;
		} else {
			vec3.copy(this.position, newPos);
		}

		// Ground plane
		if (this.position[1] < this.radius) {
			this.position[1] = this.radius;
			if (this.velocity[1] < 0) {
				this.velocity[1] = -this.velocity[1] * restitution;
			}
		}

		// Reset if fallen
		if (this.position[1] < -5) {
			this.reset();
			return { speed: 0 };
		}

		// Reset at end
		if (this.trackDistance >= this.track.pathLength - 1) {
			this.reset();
			return { speed: 0 };
		}

		// Visual rotation
		const speed = vec3.length(this.velocity);
		if (speed > 0.01) {
			const rotationSpeed = speed / this.radius;
			const velDir = vec3.normalize(vec3.create(), this.velocity);
			const rotAxis = vec3.cross(vec3.create(), [0, 1, 0], velDir);
			if (vec3.length(rotAxis) > 0.001) {
				vec3.normalize(rotAxis, rotAxis);
				const rotMatrix = mat4.create();
				mat4.rotate(rotMatrix, rotMatrix, rotationSpeed * dt, rotAxis);
				mat4.multiply(this.rotation, rotMatrix, this.rotation);
			}
		}

		return { speed };
	}

	collideWithTrack(pos) {
		// Find closest point on track centerline
		let bestDist = Infinity;
		let bestTrackDist = this.trackDistance;

		const searchStart = Math.max(0, this.trackDistance - 3);
		const searchEnd = Math.min(this.track.pathLength, this.trackDistance + 6);

		for (let d = searchStart; d <= searchEnd; d += 0.1) {
			const tp = this.track.getPositionAtDistance(d);
			const dist = vec3.distance(pos, tp.position);
			if (dist < bestDist) {
				bestDist = dist;
				bestTrackDist = d;
			}
		}

		// Fine search
		for (let d = bestTrackDist - 0.15; d <= bestTrackDist + 0.15; d += 0.02) {
			if (d < 0 || d > this.track.pathLength) continue;
			const tp = this.track.getPositionAtDistance(d);
			const dist = vec3.distance(pos, tp.position);
			if (dist < bestDist) {
				bestDist = dist;
				bestTrackDist = d;
			}
		}

		const trackPoint = this.track.getPositionAtDistance(bestTrackDist);
		const frame = this.track.getFrameAt(trackPoint.index, trackPoint.t);
		vec3.normalize(frame.tangent, frame.tangent);
		vec3.normalize(frame.normal, frame.normal);
		vec3.normalize(frame.binormal, frame.binormal);

		// Get marble's position relative to track center
		const toMarble = vec3.sub(vec3.create(), pos, trackPoint.position);
		const lateralOffset = vec3.dot(toMarble, frame.binormal); // How far left/right
		const heightAboveCenter = vec3.dot(toMarble, frame.normal); // How far above track center

		// Check if marble is within track width (between the inner walls)
		const trackHalfWidth = this.railOffset + 0.02; // Inner wall + small margin
		const isOverTrack = Math.abs(lateralOffset) < trackHalfWidth;

		if (!isOverTrack) {
			// Marble is outside track bounds - no floor collision
			return { hit: false, trackDistance: bestTrackDist };
		}

		// Floor is at railRadius height above center
		const floorHeight = this.railRadius;
		const distToFloor = heightAboveCenter - floorHeight;
		const floorBuffer = 0.003; // Small buffer to prevent z-fighting

		if (distToFloor < this.radius + floorBuffer) {
			// Collision with floor
			const penetration = this.radius + floorBuffer - distToFloor;
			const correctedPos = vec3.scaleAndAdd(vec3.create(), pos, frame.normal, penetration);

			// Also check wall collisions while on the floor
			const wallResult = this.checkWallCollision(
				correctedPos,
				lateralOffset,
				frame,
				bestTrackDist
			);
			if (wallResult.hit) {
				return wallResult;
			}

			return {
				hit: true,
				position: correctedPos,
				normal: vec3.clone(frame.normal),
				trackDistance: bestTrackDist
			};
		}

		return { hit: false, trackDistance: bestTrackDist };
	}

	checkWallCollision(pos, lateralOffset, frame, trackDistance) {
		// Inner walls are at railOffset from center (where marble actually collides)
		const wallDistance = this.railOffset;
		const buffer = 0.005; // Small buffer to prevent z-fighting

		// Left wall collision (negative lateral = left side)
		// Wall is at -wallDistance, marble center must be at -wallDistance + radius + buffer
		if (lateralOffset < -wallDistance + this.radius + buffer) {
			// Push marble to the right (positive binormal direction)
			const targetLateral = -wallDistance + this.radius + buffer;
			const correction = targetLateral - lateralOffset;
			const correctedPos = vec3.scaleAndAdd(vec3.create(), pos, frame.binormal, correction);
			return {
				hit: true,
				position: correctedPos,
				normal: vec3.clone(frame.binormal), // Wall normal points right
				trackDistance
			};
		}

		// Right wall collision (positive lateral = right side)
		// Wall is at +wallDistance, marble center must be at +wallDistance - radius - buffer
		if (lateralOffset > wallDistance - this.radius - buffer) {
			// Push marble to the left (negative binormal direction)
			const targetLateral = wallDistance - this.radius - buffer;
			const correction = targetLateral - lateralOffset; // This will be negative
			const correctedPos = vec3.scaleAndAdd(vec3.create(), pos, frame.binormal, correction);
			const negBinormal = vec3.negate(vec3.create(), frame.binormal);
			return {
				hit: true,
				position: correctedPos,
				normal: negBinormal, // Wall normal points left
				trackDistance
			};
		}

		return { hit: false };
	}

	draw(renderer) {
		const model = mat4.create();
		mat4.translate(model, model, this.position);
		mat4.multiply(model, model, this.rotation);
		renderer.drawMesh(this.mesh, model, 0.15, 0.25, true);
	}

	getSpeed() {
		return vec3.length(this.velocity);
	}
}
