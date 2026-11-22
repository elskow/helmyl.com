import { vec3, mat4, quat } from 'gl-matrix';
import { createSphereMesh } from './geometry.js';

export class Marble {
	constructor(renderer, track) {
		this.renderer = renderer;
		this.track = track;

		this.radius = 0.12;
		this.mass = 0.05;

		this.momentOfInertia = (2 / 5) * this.mass * this.radius * this.radius;

		this.railRadius = 0.04;
		this.railOffset = 0.14;

		this.gravity = vec3.fromValues(0, -9.81, 0);

		this.staticFriction = 0.5;
		this.kineticFriction = 0.3;
		this.rollingResistance = 0.003;
		this.spinFriction = 0.001;

		this.slipThreshold = 0.05;

		this.dragCoefficient = 0.47;
		this.airDensity = 1.225;
		this.crossSectionArea = Math.PI * this.radius * this.radius;

		this.magnusCoefficient = 0.5;

		this.gyroscopicScale = 1.0;

		this.baseRestitution = 0.25;
		this.minRestitution = 0.05;
		this.restitutionVelocityScale = 0.1;
		this.wallRestitution = 0.3;

		this.spinTransferCoefficient = 0.3;

		this.impactThreshold = 0.5;

		this.centripetalScale = 1.0;

		this.bankingEnabled = true;
		this.bankingStrength = 0.8;

		this.maxSubSteps = 8;
		this.fixedDeltaTime = 1 / 240;

		this.ccdEnabled = true;
		this.ccdIterations = 4;

		this.contactCache = {
			lastFrame: null,
			lastTrackDistance: 0,
			lastNormal: vec3.fromValues(0, 1, 0),
			contactDuration: 0,
			wasInContact: false
		};

		this.mesh = createSphereMesh(renderer, this.radius, 24, [0.1, 0.4, 0.15]);

		this.reset();
	}

	reset() {
		const startPos = this.track.getPositionAtDistance(0.5);
		const frame = this.track.getFrameAt(startPos.index, startPos.t);

		this.position = vec3.clone(startPos.position);
		this.position[1] += this.railRadius + this.radius;

		vec3.normalize(frame.tangent, frame.tangent);
		this.velocity = vec3.scale(vec3.create(), frame.tangent, 0.5);

		this.angularVelocity = vec3.create();

		this.orientation = quat.create();
		this.rotation = mat4.create();

		this.trackDistance = 0.5;
		this.isOnTrack = false;
		this.isOnGround = false;

		this.contactNormal = vec3.fromValues(0, 1, 0);
		this.lastContactNormal = vec3.fromValues(0, 1, 0);

		this.trackCurvature = 0;

		this.isSlipping = false;
		this.slipVelocity = 0;

		this.initialEnergy = this.calculateTotalEnergy();

		this.accumulator = 0;
		this.prevPosition = vec3.clone(this.position);
		this.contactCache = {
			lastFrame: null,
			lastTrackDistance: 0,
			lastNormal: vec3.fromValues(0, 1, 0),
			contactDuration: 0,
			wasInContact: false
		};
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

		if (this.position[1] < -5 || !this.isValidState()) {
			this.reset();
			return { speed: 0, frame: null };
		}

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
		vec3.copy(this.prevPosition, this.position);

		const collision = this.detectCollision(this.position);

		const force = vec3.create();

		vec3.scaleAndAdd(force, force, this.gravity, this.mass);

		const speed = vec3.length(this.velocity);
		if (speed > 0.1) {
			const dragMagnitude =
				0.5 *
				this.airDensity *
				this.dragCoefficient *
				this.crossSectionArea *
				speed *
				speed;
			const dragDir = vec3.normalize(vec3.create(), this.velocity);
			vec3.scaleAndAdd(force, force, dragDir, -dragMagnitude);

			const angularSpeed = vec3.length(this.angularVelocity);
			if (angularSpeed > 0.1 && !collision.hit) {
				const magnusDir = vec3.cross(vec3.create(), this.angularVelocity, this.velocity);
				const magnusDirLen = vec3.length(magnusDir);

				if (magnusDirLen > 0.001) {
					vec3.scale(magnusDir, magnusDir, 1 / magnusDirLen);

					const magnusMagnitude =
						0.5 *
						this.magnusCoefficient *
						this.airDensity *
						this.crossSectionArea *
						this.radius *
						angularSpeed *
						speed;

					vec3.scaleAndAdd(force, force, magnusDir, magnusMagnitude);
				}
			}
		}

		this.applyGyroscopicPrecession(dt);

		if (collision.hit) {
			this.updateContactCache(collision, dt);
			this.applyCentripetalForce(collision, force, dt);
			this.handleContact(collision, force, dt);
		} else {
			const acceleration = vec3.scale(vec3.create(), force, 1 / this.mass);
			vec3.scaleAndAdd(this.velocity, this.velocity, acceleration, dt);
			this.isOnTrack = false;
			this.isSlipping = false;

			this.contactCache.wasInContact = false;
			this.contactCache.contactDuration = 0;
		}

		vec3.scaleAndAdd(this.position, this.position, this.velocity, dt);

		if (this.ccdEnabled) {
			this.performCCD(dt);
		}

		const postCollision = this.detectCollision(this.position);
		if (postCollision.hit && postCollision.penetration > 0.001) {
			vec3.copy(this.position, postCollision.position);
			this.trackDistance = postCollision.trackDistance;
		}

		this.handleGroundCollision();
		this.updateOrientation(dt);
		this.clampValues();
	}

	applyGyroscopicPrecession(dt) {
		const angularSpeed = vec3.length(this.angularVelocity);
		if (angularSpeed < 0.5) return;

		const angularMomentum = vec3.scale(
			vec3.create(),
			this.angularVelocity,
			this.momentOfInertia
		);

		const gyroTorque = vec3.cross(vec3.create(), this.angularVelocity, angularMomentum);

		vec3.scale(gyroTorque, gyroTorque, this.gyroscopicScale * 0.01);

		const angularAccel = vec3.scale(vec3.create(), gyroTorque, 1 / this.momentOfInertia);
		vec3.scaleAndAdd(this.angularVelocity, this.angularVelocity, angularAccel, dt);
	}

	updateContactCache(collision, dt) {
		if (this.contactCache.wasInContact) {
			this.contactCache.contactDuration += dt;
		} else {
			this.contactCache.contactDuration = dt;
		}

		this.contactCache.wasInContact = true;
		this.contactCache.lastTrackDistance = collision.trackDistance;
		this.contactCache.lastFrame = collision.frame;

		const blendFactor = Math.min(1, this.contactCache.contactDuration * 5);
		vec3.lerp(
			this.contactCache.lastNormal,
			this.contactCache.lastNormal,
			collision.normal,
			blendFactor
		);
		vec3.normalize(this.contactCache.lastNormal, this.contactCache.lastNormal);
	}

	applyCentripetalForce(collision, force, dt) {
		const speed = vec3.length(this.velocity);
		if (speed < 0.5) return;

		const curvatureInfo = this.track.getCurvatureAtDistance(collision.trackDistance);
		const curvature = curvatureInfo.curvature;

		if (curvature < 0.01) return;

		this.trackCurvature = curvature;

		const centripetalAccel = speed * speed * curvature;
		const centripetalDir = vec3.normalize(vec3.create(), curvatureInfo.curvatureVector);
		const centripetalForce = centripetalAccel * this.mass * this.centripetalScale;
		vec3.scaleAndAdd(force, force, centripetalDir, centripetalForce);

		if (this.bankingEnabled) {
			const bankAngle = this.track.getBankingAngle(curvature, speed);

			if (Math.abs(bankAngle) > 0.01) {
				const frame = collision.frame;
				const tangent = vec3.normalize(vec3.create(), frame.tangent);

				const curveDir = vec3.dot(curvatureInfo.curvatureVector, frame.binormal);
				const bankDir = curveDir > 0 ? -1 : 1;

				const bankedNormal = this.rotateVectorAroundAxis(
					collision.normal,
					tangent,
					bankAngle * bankDir * this.bankingStrength
				);

				const bankingForce = vec3.scale(
					vec3.create(),
					bankedNormal,
					centripetalForce * Math.sin(bankAngle) * 0.5
				);
				vec3.add(force, force, bankingForce);
			}
		}
	}

	rotateVectorAroundAxis(v, axis, angle) {
		const cosA = Math.cos(angle);
		const sinA = Math.sin(angle);

		const result = vec3.create();

		vec3.scale(result, v, cosA);

		const kCrossV = vec3.cross(vec3.create(), axis, v);
		vec3.scaleAndAdd(result, result, kCrossV, sinA);

		const kDotV = vec3.dot(axis, v);
		vec3.scaleAndAdd(result, result, axis, kDotV * (1 - cosA));

		return result;
	}

	getVelocityDependentRestitution(impactVelocity) {
		const impactSpeed = Math.abs(impactVelocity);

		const restitution = this.baseRestitution - this.restitutionVelocityScale * impactSpeed;

		return Math.max(this.minRestitution, Math.min(this.baseRestitution, restitution));
	}

	handleContact(collision, force, dt) {
		const N = collision.normal;

		let smoothN;
		if (this.contactCache.wasInContact && this.contactCache.contactDuration > 0.01) {
			smoothN = vec3.clone(this.contactCache.lastNormal);
			vec3.lerp(smoothN, smoothN, N, 0.2);
			vec3.normalize(smoothN, smoothN);
		} else {
			vec3.lerp(this.contactNormal, this.lastContactNormal, N, 0.3);
			vec3.normalize(this.contactNormal, this.contactNormal);
			smoothN = this.contactNormal;
		}

		vec3.copy(this.lastContactNormal, smoothN);

		this.trackDistance = collision.trackDistance;
		this.isOnTrack = true;

		const vDotN = vec3.dot(this.velocity, smoothN);

		if (vDotN < -this.impactThreshold) {
			this.handleImpact(collision, smoothN, vDotN, dt);
		} else if (vDotN < 0) {
			vec3.scaleAndAdd(this.velocity, this.velocity, smoothN, -vDotN);
		}

		const gravityDotN = vec3.dot(this.gravity, smoothN);
		const gravityTangent = vec3.scaleAndAdd(vec3.create(), this.gravity, smoothN, -gravityDotN);
		vec3.scaleAndAdd(this.velocity, this.velocity, gravityTangent, dt);

		const normalForce = Math.max(0, -gravityDotN * this.mass);

		const slipInfo = this.calculateSlip(smoothN);
		this.isSlipping = slipInfo.isSlipping;
		this.slipVelocity = slipInfo.slipSpeed;

		this.applyFriction(smoothN, normalForce, slipInfo, dt);

		if (collision.type.startsWith('wall')) {
			const wallFriction = this.kineticFriction * normalForce * 0.5;
			const wallDecel = (wallFriction / this.mass) * dt;

			const verticalVel = this.velocity[1];
			if (verticalVel > 0) {
				this.velocity[1] = Math.max(0, verticalVel - wallDecel);
			}
		}
	}

	handleImpact(collision, smoothN, vDotN, dt) {
		const restitution = collision.type.startsWith('wall')
			? this.wallRestitution
			: this.getVelocityDependentRestitution(vDotN);

		const impulseMagnitude = -vDotN * (1 + restitution) * this.mass;
		vec3.scaleAndAdd(this.velocity, this.velocity, smoothN, impulseMagnitude / this.mass);

		const tangentVel = vec3.scaleAndAdd(
			vec3.create(),
			this.velocity,
			smoothN,
			-vec3.dot(this.velocity, smoothN)
		);
		const tangentSpeed = vec3.length(tangentVel);

		if (tangentSpeed > 0.1) {
			const contactPointVel = this.getContactPointVelocity(smoothN);

			const relativeVel = vec3.sub(vec3.create(), tangentVel, contactPointVel);
			const relativeSpeed = vec3.length(relativeVel);

			if (relativeSpeed > 0.01) {
				const contactPoint = vec3.scale(vec3.create(), smoothN, -this.radius);

				const frictionDir = vec3.normalize(vec3.create(), relativeVel);
				vec3.negate(frictionDir, frictionDir);

				const frictionImpulse = Math.min(
					relativeSpeed * this.mass * this.spinTransferCoefficient,
					Math.abs(vDotN) * this.mass * this.kineticFriction
				);

				const torqueDir = vec3.cross(vec3.create(), contactPoint, frictionDir);
				const torqueMagnitude = this.radius * frictionImpulse;
				const angularImpulse = vec3.scale(
					vec3.create(),
					torqueDir,
					torqueMagnitude / this.momentOfInertia
				);

				vec3.add(this.angularVelocity, this.angularVelocity, angularImpulse);

				vec3.scaleAndAdd(
					this.velocity,
					this.velocity,
					frictionDir,
					(-frictionImpulse * this.spinTransferCoefficient) / this.mass
				);
			}
		}
	}

	calculateSlip(normal) {
		const tangentVel = vec3.scaleAndAdd(
			vec3.create(),
			this.velocity,
			normal,
			-vec3.dot(this.velocity, normal)
		);

		const contactPointVel = this.getContactPointVelocity(normal);

		const slipVel = vec3.sub(vec3.create(), tangentVel, contactPointVel);
		const slipSpeed = vec3.length(slipVel);

		const slipDir = vec3.create();
		if (slipSpeed > 0.001) {
			vec3.scale(slipDir, slipVel, 1 / slipSpeed);
		}

		return {
			isSlipping: slipSpeed > this.slipThreshold,
			slipSpeed,
			slipDirection: slipDir,
			slipVelocity: slipVel
		};
	}

	getContactPointVelocity(normal) {
		const contactRadius = vec3.scale(vec3.create(), normal, -this.radius);
		return vec3.cross(vec3.create(), this.angularVelocity, contactRadius);
	}

	applyFriction(normal, normalForce, slipInfo, dt) {
		if (normalForce <= 0) return;

		const tangentVel = vec3.scaleAndAdd(
			vec3.create(),
			this.velocity,
			normal,
			-vec3.dot(this.velocity, normal)
		);
		const tangentSpeed = vec3.length(tangentVel);

		if (tangentSpeed < 0.001) {
			const angularSpeed = vec3.length(this.angularVelocity);
			if (angularSpeed > 0.01) {
				const spinTorque = this.spinFriction * normalForce * this.radius;
				const spinDecel = (spinTorque / this.momentOfInertia) * dt;
				const scale = Math.max(0, 1 - spinDecel / angularSpeed);
				vec3.scale(this.angularVelocity, this.angularVelocity, scale);
			}
			return;
		}

		if (slipInfo.isSlipping) {
			const frictionForce = this.kineticFriction * normalForce;
			const frictionDecel = (frictionForce / this.mass) * dt;

			if (frictionDecel < slipInfo.slipSpeed) {
				vec3.scaleAndAdd(
					this.velocity,
					this.velocity,
					slipInfo.slipDirection,
					-frictionDecel * 0.7
				);

				const contactPoint = vec3.scale(vec3.create(), normal, -this.radius);
				const torqueDir = vec3.cross(vec3.create(), contactPoint, slipInfo.slipDirection);
				const torqueMag = frictionForce * this.radius;
				const angularAccel = torqueMag / this.momentOfInertia;
				vec3.scaleAndAdd(
					this.angularVelocity,
					this.angularVelocity,
					torqueDir,
					-angularAccel * dt
				);
			} else {
				this.enforceRolling(normal, dt);
			}
		} else {
			const rollingForce = this.rollingResistance * normalForce;
			const frictionDecel = (rollingForce / this.mass) * dt;

			if (frictionDecel < tangentSpeed) {
				const tangentDir = vec3.scale(vec3.create(), tangentVel, 1 / tangentSpeed);
				vec3.scaleAndAdd(this.velocity, this.velocity, tangentDir, -frictionDecel);
			}

			this.enforceRolling(normal, dt);
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

		vec3.lerp(this.angularVelocity, this.angularVelocity, targetAngular, Math.min(1, 10 * dt));
	}

	performCCD(dt) {
		const speed = vec3.length(this.velocity);

		if (speed < 2.0) return;

		const displacement = vec3.sub(vec3.create(), this.position, this.prevPosition);
		const moveDistance = vec3.length(displacement);

		if (moveDistance < this.radius * 0.5) return;

		let tMin = 0;
		let tMax = 1;
		let hitFound = false;
		let hitResult = null;

		for (let i = 0; i < this.ccdIterations; i++) {
			const tMid = (tMin + tMax) / 2;

			const testPos = vec3.create();
			vec3.lerp(testPos, this.prevPosition, this.position, tMid);

			const collision = this.detectCollision(testPos);

			if (collision.hit && collision.penetration > 0.001) {
				tMax = tMid;
				hitFound = true;
				hitResult = collision;
			} else {
				tMin = tMid;
			}
		}

		if (hitFound && hitResult) {
			const toi = tMin;

			const impactPos = vec3.create();
			vec3.lerp(impactPos, this.prevPosition, this.position, toi);
			vec3.copy(this.position, impactPos);

			const impactCollision = this.detectCollision(this.position);

			if (impactCollision.hit) {
				const N = impactCollision.normal;
				const vDotN = vec3.dot(this.velocity, N);

				if (vDotN < 0) {
					this.handleImpact(impactCollision, N, vDotN, dt * (1 - toi));
				}

				vec3.copy(this.position, impactCollision.position);
				this.trackDistance = impactCollision.trackDistance;
			}

			const remainingTime = dt * (1 - toi);
			if (remainingTime > 0.0001) {
				vec3.scaleAndAdd(this.position, this.position, this.velocity, remainingTime);
			}
		}
	}

	detectCollision(pos) {
		let bestDist = Infinity;
		let bestTrackDist = this.trackDistance;

		const searchStart = Math.max(0, this.trackDistance - 2);
		const searchEnd = Math.min(this.track.pathLength, this.trackDistance + 4);

		for (let d = searchStart; d <= searchEnd; d += 0.2) {
			const tp = this.track.getPositionAtDistance(d);
			const dist = vec3.distance(pos, tp.position);
			if (dist < bestDist) {
				bestDist = dist;
				bestTrackDist = d;
			}
		}

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

		const toMarble = vec3.sub(vec3.create(), pos, trackPoint.position);
		const lateralOffset = vec3.dot(toMarble, frame.binormal);
		const heightAboveCenter = vec3.dot(toMarble, frame.normal);

		const trackHalfWidth = this.railOffset;
		const isOverTrack = Math.abs(lateralOffset) < trackHalfWidth + this.radius;

		if (!isOverTrack) {
			return { hit: false, trackDistance: bestTrackDist, frame };
		}

		const floorHeight = this.railRadius;
		const distToFloor = heightAboveCenter - floorHeight;

		if (distToFloor < this.radius) {
			const penetration = this.radius - distToFloor;
			const correctedPos = vec3.scaleAndAdd(vec3.create(), pos, frame.normal, penetration);

			const lateralAfterCorrection = lateralOffset;

			if (lateralAfterCorrection < -trackHalfWidth + this.radius) {
				const wallPen = -trackHalfWidth + this.radius - lateralAfterCorrection;
				vec3.scaleAndAdd(correctedPos, correctedPos, frame.binormal, wallPen);

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

		if (this.velocity[1] < -this.impactThreshold) {
			this.velocity[1] = -this.velocity[1] * 0.3;
		} else if (this.velocity[1] < 0) {
			this.velocity[1] = 0;
		}

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
			trackCurvature: isFinite(this.trackCurvature) ? this.trackCurvature : 0,
			isSlipping: this.isSlipping,
			slipVelocity: isFinite(this.slipVelocity) ? this.slipVelocity : 0,
			contactDuration: this.contactCache.contactDuration
		};
	}
}
