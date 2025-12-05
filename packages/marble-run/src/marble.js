import { vec3, mat4, quat } from 'gl-matrix';
import { createSphereMesh } from './geometry.js';

/**
 * Physically accurate marble simulation with:
 * - Rigid body dynamics (moment of inertia, angular momentum)
 * - Stable contact handling (no random bouncing)
 * - Static/kinetic friction with Coulomb model
 * - Slip detection (rolling vs sliding)
 * - Air resistance and Magnus effect
 * - Angular impulse transfer on collision
 * - Continuous Collision Detection (CCD)
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

		// Friction coefficients - Static > Kinetic (Coulomb friction model)
		this.staticFriction = 0.5; // Higher friction when stationary
		this.kineticFriction = 0.3; // Lower friction when sliding
		this.rollingResistance = 0.003; // Very low for rolling
		this.spinFriction = 0.001; // Friction for spinning in place (drilling)

		// Slip threshold - velocity difference between contact point and surface
		this.slipThreshold = 0.05; // Below this, considered rolling (no slip)

		// Air resistance
		this.dragCoefficient = 0.47;
		this.airDensity = 1.225;
		this.crossSectionArea = Math.PI * this.radius * this.radius;

		// Magnus effect coefficient (lift from spin)
		this.magnusCoefficient = 0.5; // Cl for spinning sphere

		// Gyroscopic precession coefficient
		this.gyroscopicScale = 1.0; // Scale factor for gyroscopic torque

		// Collision - LOW restitution to prevent bouncing
		// Base restitution (will be modified by velocity)
		this.baseRestitution = 0.25; // Base restitution for low-speed impacts
		this.minRestitution = 0.05; // Minimum restitution for high-speed impacts
		this.restitutionVelocityScale = 0.1; // How much velocity reduces restitution
		this.wallRestitution = 0.3;

		// Angular impulse transfer coefficient (0-1, how much spin transfers on impact)
		this.spinTransferCoefficient = 0.3;

		// Velocity threshold for "impact" vs "resting" contact
		this.impactThreshold = 0.5; // Only bounce if hitting faster than this

		// Centripetal force settings
		this.centripetalScale = 1.0; // Scale factor for centripetal force

		// Track banking
		this.bankingEnabled = true;
		this.bankingStrength = 0.8; // How much banking affects normal force direction

		// Sub-stepping
		this.maxSubSteps = 8;
		this.fixedDeltaTime = 1 / 240;

		// CCD - Continuous Collision Detection
		this.ccdEnabled = true;
		this.ccdIterations = 4; // Binary search iterations for precise impact time

		// Contact caching for smoother transitions
		this.contactCache = {
			lastFrame: null,
			lastTrackDistance: 0,
			lastNormal: vec3.fromValues(0, 1, 0),
			contactDuration: 0, // How long we've been in contact
			wasInContact: false
		};

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

		// Slip state tracking
		this.isSlipping = false; // true if sliding, false if rolling
		this.slipVelocity = 0; // magnitude of slip velocity

		// Energy tracking
		this.initialEnergy = this.calculateTotalEnergy();

		// Accumulator
		this.accumulator = 0;

		// Previous position for CCD
		this.prevPosition = vec3.clone(this.position);

		// Reset contact cache
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
		// Store previous position for CCD
		vec3.copy(this.prevPosition, this.position);

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
				0.5 *
				this.airDensity *
				this.dragCoefficient *
				this.crossSectionArea *
				speed *
				speed;
			const dragDir = vec3.normalize(vec3.create(), this.velocity);
			vec3.scaleAndAdd(force, force, dragDir, -dragMagnitude);

			// === MAGNUS EFFECT ===
			// Spinning ball experiences lift perpendicular to velocity and spin axis
			// F_magnus = 0.5 * Cl * rho * A * r * |omega x v|
			const angularSpeed = vec3.length(this.angularVelocity);
			if (angularSpeed > 0.1 && !collision.hit) {
				// Magnus force direction: omega × velocity
				const magnusDir = vec3.cross(vec3.create(), this.angularVelocity, this.velocity);
				const magnusDirLen = vec3.length(magnusDir);

				if (magnusDirLen > 0.001) {
					vec3.scale(magnusDir, magnusDir, 1 / magnusDirLen);

					// Magnus force magnitude
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

		// === GYROSCOPIC PRECESSION ===
		// τ = ω × L, where L = I * ω
		// This makes spinning objects resist changes in orientation
		this.applyGyroscopicPrecession(dt);

		// === HANDLE CONTACT OR FREE FALL ===
		if (collision.hit) {
			// Update contact cache
			this.updateContactCache(collision, dt);

			// Apply centripetal force on curves
			this.applyCentripetalForce(collision, force, dt);

			this.handleContact(collision, force, dt);
		} else {
			// Free fall - just apply forces
			const acceleration = vec3.scale(vec3.create(), force, 1 / this.mass);
			vec3.scaleAndAdd(this.velocity, this.velocity, acceleration, dt);
			this.isOnTrack = false;
			this.isSlipping = false;

			// Reset contact cache
			this.contactCache.wasInContact = false;
			this.contactCache.contactDuration = 0;
		}

		// === UPDATE POSITION ===
		vec3.scaleAndAdd(this.position, this.position, this.velocity, dt);

		// === CCD - Continuous Collision Detection ===
		if (this.ccdEnabled) {
			this.performCCD(dt);
		}

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

	/**
	 * Apply gyroscopic precession torque
	 * τ = ω × L, where L = I * ω (angular momentum)
	 * This makes fast-spinning objects more stable
	 */
	applyGyroscopicPrecession(dt) {
		const angularSpeed = vec3.length(this.angularVelocity);
		if (angularSpeed < 0.5) return; // Only significant at higher spin rates

		// Angular momentum L = I * ω
		const angularMomentum = vec3.scale(
			vec3.create(),
			this.angularVelocity,
			this.momentOfInertia
		);

		// Gyroscopic torque τ = ω × L
		// For a sphere, this creates a precession effect
		const gyroTorque = vec3.cross(vec3.create(), this.angularVelocity, angularMomentum);

		// The torque magnitude is small but creates stability
		// Scale it down to avoid instability
		vec3.scale(gyroTorque, gyroTorque, this.gyroscopicScale * 0.01);

		// Apply as angular acceleration: α = τ / I
		const angularAccel = vec3.scale(vec3.create(), gyroTorque, 1 / this.momentOfInertia);
		vec3.scaleAndAdd(this.angularVelocity, this.angularVelocity, angularAccel, dt);
	}

	/**
	 * Update contact cache for smoother transitions
	 */
	updateContactCache(collision, dt) {
		if (this.contactCache.wasInContact) {
			this.contactCache.contactDuration += dt;
		} else {
			this.contactCache.contactDuration = dt;
		}

		this.contactCache.wasInContact = true;
		this.contactCache.lastTrackDistance = collision.trackDistance;
		this.contactCache.lastFrame = collision.frame;

		// Smoothly blend normal based on contact duration
		const blendFactor = Math.min(1, this.contactCache.contactDuration * 5);
		vec3.lerp(
			this.contactCache.lastNormal,
			this.contactCache.lastNormal,
			collision.normal,
			blendFactor
		);
		vec3.normalize(this.contactCache.lastNormal, this.contactCache.lastNormal);
	}

	/**
	 * Apply centripetal force on curved track sections
	 * F_centripetal = m * v² / r (pointing toward center of curvature)
	 */
	applyCentripetalForce(collision, force, dt) {
		const speed = vec3.length(this.velocity);
		if (speed < 0.5) return; // Not significant at low speeds

		// Get track curvature at current position
		const curvatureInfo = this.track.getCurvatureAtDistance(collision.trackDistance);
		const curvature = curvatureInfo.curvature;

		if (curvature < 0.01) return; // Straight section

		// Store curvature for debug display
		this.trackCurvature = curvature;

		// Centripetal acceleration = v² * κ
		const centripetalAccel = speed * speed * curvature;

		// Direction: toward center of curvature (curvature vector direction)
		const centripetalDir = vec3.normalize(vec3.create(), curvatureInfo.curvatureVector);

		// Apply centripetal force
		const centripetalForce = centripetalAccel * this.mass * this.centripetalScale;
		vec3.scaleAndAdd(force, force, centripetalDir, centripetalForce);

		// === TRACK BANKING ===
		if (this.bankingEnabled) {
			// Get banking angle for this curvature
			const bankAngle = this.track.getBankingAngle(curvature, speed);

			if (Math.abs(bankAngle) > 0.01) {
				// Rotate the contact normal by bank angle around track tangent
				// This simulates a banked track surface
				const frame = collision.frame;
				const tangent = vec3.normalize(vec3.create(), frame.tangent);

				// Determine bank direction based on curve direction
				// If curving left, bank right (and vice versa)
				const curveDir = vec3.dot(curvatureInfo.curvatureVector, frame.binormal);
				const bankDir = curveDir > 0 ? -1 : 1;

				// Create banked normal by rotating around tangent
				const bankedNormal = this.rotateVectorAroundAxis(
					collision.normal,
					tangent,
					bankAngle * bankDir * this.bankingStrength
				);

				// Apply banking effect to force distribution
				// This pushes the marble toward the inside of the curve
				const bankingForce = vec3.scale(
					vec3.create(),
					bankedNormal,
					centripetalForce * Math.sin(bankAngle) * 0.5
				);
				vec3.add(force, force, bankingForce);
			}
		}
	}

	/**
	 * Rotate a vector around an axis by a given angle (Rodrigues' rotation)
	 */
	rotateVectorAroundAxis(v, axis, angle) {
		const cosA = Math.cos(angle);
		const sinA = Math.sin(angle);

		// Rodrigues' rotation formula:
		// v_rot = v*cos(θ) + (k×v)*sin(θ) + k*(k·v)*(1-cos(θ))
		const result = vec3.create();

		// v * cos(θ)
		vec3.scale(result, v, cosA);

		// (k × v) * sin(θ)
		const kCrossV = vec3.cross(vec3.create(), axis, v);
		vec3.scaleAndAdd(result, result, kCrossV, sinA);

		// k * (k · v) * (1 - cos(θ))
		const kDotV = vec3.dot(axis, v);
		vec3.scaleAndAdd(result, result, axis, kDotV * (1 - cosA));

		return result;
	}

	/**
	 * Calculate velocity-dependent restitution
	 * Higher impact velocity = lower restitution (more energy absorbed)
	 */
	getVelocityDependentRestitution(impactVelocity) {
		const impactSpeed = Math.abs(impactVelocity);

		// Restitution decreases with impact velocity
		// e = e_base - k * v, clamped to [e_min, e_base]
		const restitution = this.baseRestitution - this.restitutionVelocityScale * impactSpeed;

		return Math.max(this.minRestitution, Math.min(this.baseRestitution, restitution));
	}

	handleContact(collision, force, dt) {
		const N = collision.normal;

		// Use contact cache for smoother normal transitions
		let smoothN;
		if (this.contactCache.wasInContact && this.contactCache.contactDuration > 0.01) {
			// Blend between cached normal and new normal for smooth transitions
			smoothN = vec3.clone(this.contactCache.lastNormal);
			vec3.lerp(smoothN, smoothN, N, 0.2);
			vec3.normalize(smoothN, smoothN);
		} else {
			// First contact or cache expired - use direct normal with light smoothing
			vec3.lerp(this.contactNormal, this.lastContactNormal, N, 0.3);
			vec3.normalize(this.contactNormal, this.contactNormal);
			smoothN = this.contactNormal;
		}

		vec3.copy(this.lastContactNormal, smoothN);

		// Update track distance
		this.trackDistance = collision.trackDistance;
		this.isOnTrack = true;

		// Velocity component into surface
		const vDotN = vec3.dot(this.velocity, smoothN);

		// === IMPACT vs RESTING CONTACT ===
		if (vDotN < -this.impactThreshold) {
			// IMPACT - apply bounce impulse with angular impulse transfer
			this.handleImpact(collision, smoothN, vDotN, dt);
		} else if (vDotN < 0) {
			// SOFT CONTACT - just remove the penetrating velocity, no bounce
			vec3.scaleAndAdd(this.velocity, this.velocity, smoothN, -vDotN);
		}

		// === CONTACT FORCES ===
		// Gravity component along surface (this is what makes marble roll down)
		const gravityDotN = vec3.dot(this.gravity, smoothN);
		const gravityTangent = vec3.scaleAndAdd(vec3.create(), this.gravity, smoothN, -gravityDotN);

		// Apply tangential gravity (acceleration down the slope)
		vec3.scaleAndAdd(this.velocity, this.velocity, gravityTangent, dt);

		// Normal force magnitude
		const normalForce = Math.max(0, -gravityDotN * this.mass);

		// === SLIP DETECTION ===
		// Calculate contact point velocity vs expected rolling velocity
		const slipInfo = this.calculateSlip(smoothN);
		this.isSlipping = slipInfo.isSlipping;
		this.slipVelocity = slipInfo.slipSpeed;

		// === FRICTION WITH STATIC/KINETIC TRANSITION ===
		this.applyFriction(smoothN, normalForce, slipInfo, dt);

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

	/**
	 * Handle impact collision with angular impulse transfer
	 * Uses velocity-dependent restitution for realistic energy absorption
	 */
	handleImpact(collision, smoothN, vDotN, dt) {
		// Get velocity-dependent restitution
		const restitution = collision.type.startsWith('wall')
			? this.wallRestitution
			: this.getVelocityDependentRestitution(vDotN);

		// === LINEAR IMPULSE ===
		// Remove velocity into surface and add bounce
		const impulseMagnitude = -vDotN * (1 + restitution) * this.mass;
		vec3.scaleAndAdd(this.velocity, this.velocity, smoothN, impulseMagnitude / this.mass);

		// === ANGULAR IMPULSE TRANSFER ===
		// When marble hits surface, friction at contact point creates torque
		// This transfers some linear momentum to angular momentum

		// Tangent velocity at impact
		const tangentVel = vec3.scaleAndAdd(
			vec3.create(),
			this.velocity,
			smoothN,
			-vec3.dot(this.velocity, smoothN)
		);
		const tangentSpeed = vec3.length(tangentVel);

		if (tangentSpeed > 0.1) {
			// Contact point velocity due to current spin
			const contactPointVel = this.getContactPointVelocity(smoothN);

			// Relative sliding velocity at contact
			const relativeVel = vec3.sub(vec3.create(), tangentVel, contactPointVel);
			const relativeSpeed = vec3.length(relativeVel);

			if (relativeSpeed > 0.01) {
				// Friction impulse at contact creates torque
				// τ = r × F, where r is from center to contact point
				const contactPoint = vec3.scale(vec3.create(), smoothN, -this.radius);

				// Friction impulse direction (opposes relative motion)
				const frictionDir = vec3.normalize(vec3.create(), relativeVel);
				vec3.negate(frictionDir, frictionDir);

				// Friction impulse magnitude (limited by impact force)
				const frictionImpulse = Math.min(
					relativeSpeed * this.mass * this.spinTransferCoefficient,
					Math.abs(vDotN) * this.mass * this.kineticFriction
				);

				// Torque = r × F
				const torqueDir = vec3.cross(vec3.create(), contactPoint, frictionDir);
				const torqueMagnitude = this.radius * frictionImpulse;

				// Angular impulse: Δω = τ * dt / I
				// But for instantaneous impact: Δω = (r × J) / I
				const angularImpulse = vec3.scale(
					vec3.create(),
					torqueDir,
					torqueMagnitude / this.momentOfInertia
				);

				vec3.add(this.angularVelocity, this.angularVelocity, angularImpulse);

				// Also reduce linear velocity slightly (momentum conservation)
				vec3.scaleAndAdd(
					this.velocity,
					this.velocity,
					frictionDir,
					(-frictionImpulse * this.spinTransferCoefficient) / this.mass
				);
			}
		}
	}

	/**
	 * Calculate slip between contact point and surface
	 * Returns { isSlipping, slipSpeed, slipDirection }
	 */
	calculateSlip(normal) {
		// Tangent velocity of marble center
		const tangentVel = vec3.scaleAndAdd(
			vec3.create(),
			this.velocity,
			normal,
			-vec3.dot(this.velocity, normal)
		);

		// Contact point velocity due to rotation
		// v_contact = ω × r, where r points from center to contact
		const contactPointVel = this.getContactPointVelocity(normal);

		// For pure rolling: tangentVel should equal contactPointVel
		// Slip velocity = tangentVel - contactPointVel
		const slipVel = vec3.sub(vec3.create(), tangentVel, contactPointVel);
		const slipSpeed = vec3.length(slipVel);

		// Normalize slip direction
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

	/**
	 * Get velocity of the contact point due to rotation
	 * v = ω × (-r * normal) where -r*normal is vector from center to contact
	 */
	getContactPointVelocity(normal) {
		const contactRadius = vec3.scale(vec3.create(), normal, -this.radius);
		return vec3.cross(vec3.create(), this.angularVelocity, contactRadius);
	}

	/**
	 * Apply friction using Coulomb model with static/kinetic transition
	 */
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
			// Nearly stopped - apply spin friction (drilling friction)
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
			// === KINETIC FRICTION (sliding) ===
			// Friction force opposes slip direction
			const frictionForce = this.kineticFriction * normalForce;
			const frictionDecel = (frictionForce / this.mass) * dt;

			// Apply friction to reduce slip
			if (frictionDecel < slipInfo.slipSpeed) {
				// Reduce linear velocity in slip direction
				vec3.scaleAndAdd(
					this.velocity,
					this.velocity,
					slipInfo.slipDirection,
					-frictionDecel * 0.7
				);

				// Also accelerate rotation to match (friction creates torque)
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
				// Slip would reverse - snap to rolling
				this.enforceRolling(normal, dt);
			}
		} else {
			// === STATIC FRICTION (rolling) ===
			// Apply rolling resistance (very small)
			const rollingForce = this.rollingResistance * normalForce;
			const frictionDecel = (rollingForce / this.mass) * dt;

			if (frictionDecel < tangentSpeed) {
				const tangentDir = vec3.scale(vec3.create(), tangentVel, 1 / tangentSpeed);
				vec3.scaleAndAdd(this.velocity, this.velocity, tangentDir, -frictionDecel);
			}

			// Enforce rolling constraint (keep angular and linear in sync)
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

		// Gradually sync angular velocity
		vec3.lerp(this.angularVelocity, this.angularVelocity, targetAngular, Math.min(1, 10 * dt));
	}

	/**
	 * Continuous Collision Detection (CCD) using swept sphere
	 * Prevents tunneling through thin surfaces at high speeds
	 */
	performCCD(dt) {
		const speed = vec3.length(this.velocity);

		// Only needed at high speeds where tunneling might occur
		if (speed < 2.0) return;

		// Displacement this frame
		const displacement = vec3.sub(vec3.create(), this.position, this.prevPosition);
		const moveDistance = vec3.length(displacement);

		// If moved less than radius, discrete collision is fine
		if (moveDistance < this.radius * 0.5) return;

		// Binary search for time of impact
		let tMin = 0;
		let tMax = 1;
		let hitFound = false;
		let hitResult = null;

		for (let i = 0; i < this.ccdIterations; i++) {
			const tMid = (tMin + tMax) / 2;

			// Interpolate position
			const testPos = vec3.create();
			vec3.lerp(testPos, this.prevPosition, this.position, tMid);

			const collision = this.detectCollision(testPos);

			if (collision.hit && collision.penetration > 0.001) {
				// Collision at this point, search earlier
				tMax = tMid;
				hitFound = true;
				hitResult = collision;
			} else {
				// No collision, search later
				tMin = tMid;
			}
		}

		if (hitFound && hitResult) {
			// Found time of impact - move to that position and resolve collision
			const toi = tMin; // Time just before impact

			// Position at time of impact
			const impactPos = vec3.create();
			vec3.lerp(impactPos, this.prevPosition, this.position, toi);

			// Move marble to impact position
			vec3.copy(this.position, impactPos);

			// Detect collision at impact point
			const impactCollision = this.detectCollision(this.position);

			if (impactCollision.hit) {
				// Resolve the collision
				const N = impactCollision.normal;
				const vDotN = vec3.dot(this.velocity, N);

				if (vDotN < 0) {
					// Apply collision response with angular impulse
					this.handleImpact(impactCollision, N, vDotN, dt * (1 - toi));
				}

				// Move to corrected position
				vec3.copy(this.position, impactCollision.position);
				this.trackDistance = impactCollision.trackDistance;
			}

			// Continue with remaining time
			const remainingTime = dt * (1 - toi);
			if (remainingTime > 0.0001) {
				vec3.scaleAndAdd(this.position, this.position, this.velocity, remainingTime);
			}
		}
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
			trackCurvature: isFinite(this.trackCurvature) ? this.trackCurvature : 0,
			isSlipping: this.isSlipping,
			slipVelocity: isFinite(this.slipVelocity) ? this.slipVelocity : 0,
			contactDuration: this.contactCache.contactDuration
		};
	}
}
