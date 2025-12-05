import { vec3, mat4, quat } from 'gl-matrix';
import { createSphereMesh } from './geometry.js';

/**
 * Physically accurate marble simulation with:
 * - Rigid body dynamics (moment of inertia, angular momentum)
 * - Stable contact handling (no random bouncing)
 * - Rolling and sliding friction
 * - Air resistance and Magnus effect
 */
export class Marble {
	constructor(renderer, track) {
		this.renderer = renderer;
		this.track = track;

		// Physical properties
		this.radius = 0.12;
		this.mass = 0.05; // 50 grams

		// Moment of inertia for solid sphere: I = (2/5) * m * r²
		this.momentOfInertia = (2 / 5) * this.mass * this.radius * this.radius;

		// Track geometry
		this.railRadius = 0.04;
		this.railOffset = 0.14;

		// Physics constants
		this.gravity = vec3.fromValues(0, -9.81, 0);

		// Friction coefficients
		this.kineticFriction = 0.3;
		this.rollingResistance = 0.003;

		// Air resistance
		this.dragCoefficient = 0.47;
		this.airDensity = 1.225;
		this.crossSectionArea = Math.PI * this.radius * this.radius;

		// Collision - LOW restitution to prevent bouncing
		this.restitution = 0.15; // Very low - marble should roll, not bounce
		this.wallRestitution = 0.3;

		// Velocity threshold for "impact" vs "resting" contact
		this.impactThreshold = 0.5; // Only bounce if hitting faster than this

		// Sub-stepping
		this.maxSubSteps = 8;
		this.fixedDeltaTime = 1 / 240;

		// Create mesh
		this.mesh = createSphereMesh(renderer, this.radius, 24, [0.1, 0.4, 0.15]);

		this.reset();
	}

	reset() {
		const startPos = this.track.getPositionAtDistance(0.5);
		const frame = this.track.getFrameAt(startPos.index, startPos.t);

		// Position - place marble on track surface
		this.position = vec3.clone(startPos.position);
		this.position[1] += this.railRadius + this.radius;

		// Velocity - small push along track
		vec3.normalize(frame.tangent, frame.tangent);
		this.velocity = vec3.scale(vec3.create(), frame.tangent, 0.5);

		// Angular velocity
		this.angularVelocity = vec3.create();

		// Orientation
		this.orientation = quat.create();
		this.rotation = mat4.create();

		// Track state
		this.trackDistance = 0.5;
		this.isOnTrack = false;
		this.isOnGround = false;

		// Store last valid contact normal for smooth transitions
		this.contactNormal = vec3.fromValues(0, 1, 0);
		this.lastContactNormal = vec3.fromValues(0, 1, 0);

		// Track curvature
		this.trackCurvature = 0;

		// Energy tracking
		this.initialEnergy = this.calculateTotalEnergy();

		// Accumulator
		this.accumulator = 0;
	}

	update(dt) {
		if (!isFinite(dt) || dt <= 0) {
			return { speed: 0, frame: null };
		}

		dt = Math.min(dt, 0.1);
		this.accumulator += dt;
		let steps = 0;

		while (this.accumulator >= this.fixedDeltaTime && steps < this.maxSubSteps) {
			this.physicsStep(this.fixedDeltaTime);
			this.accumulator -= this.fixedDeltaTime;
			steps++;
		}

		mat4.fromQuat(this.rotation, this.orientation);

		// Bounds check
		if (this.position[1] < -5 || !this.isValidState()) {
			this.reset();
			return { speed: 0, frame: null };
		}

		// Track end
		if (this.trackDistance >= this.track.pathLength - 1) {
			this.reset();
			return { speed: 0, frame: null };
		}

		const speed = vec3.length(this.velocity);
		return {
			speed: isFinite(speed) ? speed : 0,
			frame: this.isOnTrack ? this.getTrackFrame() : null
		};
	}

	isValidState() {
		return (
			isFinite(this.position[0]) &&
			isFinite(this.position[1]) &&
			isFinite(this.position[2]) &&
			isFinite(this.velocity[0]) &&
			isFinite(this.velocity[1]) &&
			isFinite(this.velocity[2])
		);
	}

	physicsStep(dt) {
		// === DETECT COLLISION FIRST ===
		// Find where the marble would be and check for collision
		const collision = this.detectCollision(this.position);
		
		// === CALCULATE FORCES ===
		const force = vec3.create();

		// Gravity
		vec3.scaleAndAdd(force, force, this.gravity, this.mass);

		// Air drag (only when not in contact, or always but reduced)
		const speed = vec3.length(this.velocity);
		if (speed > 0.1) {
			const dragMagnitude =
				0.5 * this.airDensity * this.dragCoefficient * this.crossSectionArea * speed * speed;
			const dragDir = vec3.normalize(vec3.create(), this.velocity);
			vec3.scaleAndAdd(force, force, dragDir, -dragMagnitude);
		}

		// === HANDLE CONTACT OR FREE FALL ===
		if (collision.hit) {
			this.handleContact(collision, force, dt);
		} else {
			// Free fall - just apply forces
			const acceleration = vec3.scale(vec3.create(), force, 1 / this.mass);
			vec3.scaleAndAdd(this.velocity, this.velocity, acceleration, dt);
			this.isOnTrack = false;
		}

		// === UPDATE POSITION ===
		vec3.scaleAndAdd(this.position, this.position, this.velocity, dt);

		// === POST-COLLISION CORRECTION ===
		// After moving, make sure we're not penetrating
		const postCollision = this.detectCollision(this.position);
		if (postCollision.hit && postCollision.penetration > 0.001) {
			// Push out of penetration
			vec3.copy(this.position, postCollision.position);
			this.trackDistance = postCollision.trackDistance;
		}

		// Ground collision
		this.handleGroundCollision();

		// Update orientation from angular velocity
		this.updateOrientation(dt);

		// Clamp extreme values
		this.clampValues();
	}

	handleContact(collision, force, dt) {
		const N = collision.normal;
		
		// Smooth normal transition to prevent jitter
		vec3.lerp(this.contactNormal, this.lastContactNormal, N, 0.3);
		vec3.normalize(this.contactNormal, this.contactNormal);
		vec3.copy(this.lastContactNormal, this.contactNormal);

		// Use smoothed normal
		const smoothN = this.contactNormal;

		// Update track distance
		this.trackDistance = collision.trackDistance;
		this.isOnTrack = true;

		// Velocity component into surface
		const vDotN = vec3.dot(this.velocity, smoothN);

		// === IMPACT vs RESTING CONTACT ===
		if (vDotN < -this.impactThreshold) {
			// IMPACT - apply bounce impulse
			const restitution = collision.type.startsWith('wall')
				? this.wallRestitution
				: this.restitution;

			// Remove velocity into surface and add bounce
			vec3.scaleAndAdd(this.velocity, this.velocity, smoothN, -vDotN * (1 + restitution));
		} else if (vDotN < 0) {
			// SOFT CONTACT - just remove the penetrating velocity, no bounce
			vec3.scaleAndAdd(this.velocity, this.velocity, smoothN, -vDotN);
		}

		// === CONTACT FORCES ===
		// Gravity component along surface (this is what makes marble roll down)
		const gravityDotN = vec3.dot(this.gravity, smoothN);
		const gravityTangent = vec3.scaleAndAdd(
			vec3.create(),
			this.gravity,
			smoothN,
			-gravityDotN
		);

		// Apply tangential gravity (acceleration down the slope)
		vec3.scaleAndAdd(this.velocity, this.velocity, gravityTangent, dt);

		// Normal force magnitude
		const normalForce = Math.max(0, -gravityDotN * this.mass);

		// === FRICTION ===
		const tangentVel = vec3.scaleAndAdd(
			vec3.create(),
			this.velocity,
			smoothN,
			-vec3.dot(this.velocity, smoothN)
		);
		const tangentSpeed = vec3.length(tangentVel);

		if (tangentSpeed > 0.01) {
			// Rolling resistance (always present when rolling)
			const rollingForce = this.rollingResistance * normalForce;
			const frictionDecel = (rollingForce / this.mass) * dt;

			if (frictionDecel < tangentSpeed) {
				const tangentDir = vec3.scale(vec3.create(), tangentVel, 1 / tangentSpeed);
				vec3.scaleAndAdd(this.velocity, this.velocity, tangentDir, -frictionDecel);
			}

			// Enforce rolling constraint (sync angular velocity with linear)
			this.enforceRolling(smoothN, dt);
		}

		// === WALL SPECIFIC ===
		if (collision.type.startsWith('wall')) {
			// Extra friction on walls to prevent sliding up
			const wallFriction = this.kineticFriction * normalForce * 0.5;
			const wallDecel = (wallFriction / this.mass) * dt;
			
			const verticalVel = this.velocity[1];
			if (verticalVel > 0) {
				this.velocity[1] = Math.max(0, verticalVel - wallDecel);
			}
		}
	}

	enforceRolling(N, dt) {
		const speed = vec3.length(this.velocity);
		if (speed < 0.05) return;

		const velDir = vec3.normalize(vec3.create(), this.velocity);
		const rollAxis = vec3.cross(vec3.create(), N, velDir);
		const rollAxisLen = vec3.length(rollAxis);

		if (rollAxisLen < 0.001) return;

		vec3.scale(rollAxis, rollAxis, 1 / rollAxisLen);
		const targetAngularSpeed = speed / this.radius;
		const targetAngular = vec3.scale(vec3.create(), rollAxis, targetAngularSpeed);

		// Gradually sync angular velocity
		vec3.lerp(this.angularVelocity, this.angularVelocity, targetAngular, Math.min(1, 10 * dt));
	}

	detectCollision(pos) {
		// Find closest track point using hierarchical search
		let bestDist = Infinity;
		let bestTrackDist = this.trackDistance;

		const searchStart = Math.max(0, this.trackDistance - 2);
		const searchEnd = Math.min(this.track.pathLength, this.trackDistance + 4);

		// Coarse search
		for (let d = searchStart; d <= searchEnd; d += 0.2) {
			const tp = this.track.getPositionAtDistance(d);
			const dist = vec3.distance(pos, tp.position);
			if (dist < bestDist) {
				bestDist = dist;
				bestTrackDist = d;
			}
		}

		// Fine search
		for (let d = bestTrackDist - 0.25; d <= bestTrackDist + 0.25; d += 0.03) {
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

		// Position relative to track center
		const toMarble = vec3.sub(vec3.create(), pos, trackPoint.position);
		const lateralOffset = vec3.dot(toMarble, frame.binormal);
		const heightAboveCenter = vec3.dot(toMarble, frame.normal);

		const trackHalfWidth = this.railOffset;
		const isOverTrack = Math.abs(lateralOffset) < trackHalfWidth + this.radius;

		if (!isOverTrack) {
			return { hit: false, trackDistance: bestTrackDist, frame };
		}

		// Floor collision check
		const floorHeight = this.railRadius;
		const distToFloor = heightAboveCenter - floorHeight;

		// Check floor first
		if (distToFloor < this.radius) {
			const penetration = this.radius - distToFloor;
			const correctedPos = vec3.scaleAndAdd(vec3.create(), pos, frame.normal, penetration);

			// Also check walls while on floor
			const lateralAfterCorrection = lateralOffset; // lateral doesn't change from floor correction
			
			// Left wall
			if (lateralAfterCorrection < -trackHalfWidth + this.radius) {
				const wallPen = -trackHalfWidth + this.radius - lateralAfterCorrection;
				vec3.scaleAndAdd(correctedPos, correctedPos, frame.binormal, wallPen);
				
				// Combined floor+wall normal (corner)
				const combinedNormal = vec3.add(vec3.create(), frame.normal, frame.binormal);
				vec3.normalize(combinedNormal, combinedNormal);
				
				return {
					hit: true,
					position: correctedPos,
					normal: combinedNormal,
					tangent: vec3.clone(frame.tangent),
					trackDistance: bestTrackDist,
					penetration: Math.max(penetration, wallPen),
					type: 'corner_left',
					frame
				};
			}
			
			// Right wall
			if (lateralAfterCorrection > trackHalfWidth - this.radius) {
				const wallPen = lateralAfterCorrection - (trackHalfWidth - this.radius);
				const negBinormal = vec3.negate(vec3.create(), frame.binormal);
				vec3.scaleAndAdd(correctedPos, correctedPos, negBinormal, wallPen);
				
				const combinedNormal = vec3.add(vec3.create(), frame.normal, negBinormal);
				vec3.normalize(combinedNormal, combinedNormal);
				
				return {
					hit: true,
					position: correctedPos,
					normal: combinedNormal,
					tangent: vec3.clone(frame.tangent),
					trackDistance: bestTrackDist,
					penetration: Math.max(penetration, wallPen),
					type: 'corner_right',
					frame
				};
			}

			return {
				hit: true,
				position: correctedPos,
				normal: vec3.clone(frame.normal),
				tangent: vec3.clone(frame.tangent),
				trackDistance: bestTrackDist,
				penetration,
				type: 'floor',
				frame
			};
		}

		// Wall-only collision (marble is above floor level)
		// Left wall
		if (lateralOffset < -trackHalfWidth + this.radius) {
			const penetration = -trackHalfWidth + this.radius - lateralOffset;
			const correctedPos = vec3.scaleAndAdd(vec3.create(), pos, frame.binormal, penetration);

			return {
				hit: true,
				position: correctedPos,
				normal: vec3.clone(frame.binormal),
				tangent: vec3.clone(frame.tangent),
				trackDistance: bestTrackDist,
				penetration,
				type: 'wall_left',
				frame
			};
		}

		// Right wall
		if (lateralOffset > trackHalfWidth - this.radius) {
			const penetration = lateralOffset - (trackHalfWidth - this.radius);
			const negBinormal = vec3.negate(vec3.create(), frame.binormal);
			const correctedPos = vec3.scaleAndAdd(vec3.create(), pos, negBinormal, penetration);

			return {
				hit: true,
				position: correctedPos,
				normal: negBinormal,
				tangent: vec3.clone(frame.tangent),
				trackDistance: bestTrackDist,
				penetration,
				type: 'wall_right',
				frame
			};
		}

		return { hit: false, trackDistance: bestTrackDist, frame };
	}

	handleGroundCollision() {
		if (this.position[1] >= this.radius) {
			this.isOnGround = false;
			return;
		}

		this.position[1] = this.radius;
		this.isOnGround = true;

		// Only bounce on hard impact
		if (this.velocity[1] < -this.impactThreshold) {
			this.velocity[1] = -this.velocity[1] * 0.3;
		} else if (this.velocity[1] < 0) {
			this.velocity[1] = 0;
		}

		// Rolling friction on ground
		const hSpeed = Math.sqrt(this.velocity[0] ** 2 + this.velocity[2] ** 2);
		if (hSpeed > 0.01) {
			const friction = 0.02 * 9.81 * this.fixedDeltaTime;
			const scale = Math.max(0, 1 - friction / hSpeed);
			this.velocity[0] *= scale;
			this.velocity[2] *= scale;
		}
	}

	updateOrientation(dt) {
		const angularSpeed = vec3.length(this.angularVelocity);

		if (angularSpeed > 0.001) {
			const axis = vec3.scale(vec3.create(), this.angularVelocity, 1 / angularSpeed);
			const angle = angularSpeed * dt;

			const deltaQuat = quat.setAxisAngle(quat.create(), axis, angle);
			quat.multiply(this.orientation, deltaQuat, this.orientation);
			quat.normalize(this.orientation, this.orientation);
		}
	}

	clampValues() {
		const maxSpeed = 50;
		const maxAngular = 200;

		const speed = vec3.length(this.velocity);
		if (speed > maxSpeed) {
			vec3.scale(this.velocity, this.velocity, maxSpeed / speed);
		}

		const angSpeed = vec3.length(this.angularVelocity);
		if (angSpeed > maxAngular) {
			vec3.scale(this.angularVelocity, this.angularVelocity, maxAngular / angSpeed);
		}
	}

	getTrackFrame() {
		const trackPoint = this.track.getPositionAtDistance(this.trackDistance);
		return this.track.getFrameAt(trackPoint.index, trackPoint.t);
	}

	calculateKineticEnergy() {
		const linearKE = 0.5 * this.mass * vec3.squaredLength(this.velocity);
		const angularKE = 0.5 * this.momentOfInertia * vec3.squaredLength(this.angularVelocity);
		return linearKE + angularKE;
	}

	calculatePotentialEnergy() {
		return this.mass * 9.81 * Math.max(0, this.position[1]);
	}

	calculateTotalEnergy() {
		return this.calculateKineticEnergy() + this.calculatePotentialEnergy();
	}

	getEnergyConservation() {
		if (!this.initialEnergy || this.initialEnergy <= 0) return 1;
		const current = this.calculateTotalEnergy();
		const ratio = current / this.initialEnergy;
		return isFinite(ratio) ? Math.min(ratio, 2) : 1;
	}

	draw(renderer) {
		const model = mat4.create();
		mat4.translate(model, model, this.position);
		mat4.multiply(model, model, this.rotation);
		renderer.drawMesh(this.mesh, model, 0.15, 0.25, true);
	}

	getSpeed() {
		const speed = vec3.length(this.velocity);
		return isFinite(speed) ? speed : 0;
	}

	getDebugInfo() {
		const speed = vec3.length(this.velocity);
		const angularSpeed = vec3.length(this.angularVelocity);

		return {
			speed: isFinite(speed) ? speed : 0,
			angularSpeed: isFinite(angularSpeed) ? angularSpeed : 0,
			height: this.position[1],
			kineticEnergy: this.calculateKineticEnergy(),
			potentialEnergy: this.calculatePotentialEnergy(),
			totalEnergy: this.calculateTotalEnergy(),
			energyConservation: this.getEnergyConservation(),
			isOnTrack: this.isOnTrack,
			isOnGround: this.isOnGround,
			trackCurvature: this.trackCurvature
		};
	}
}
