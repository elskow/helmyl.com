import { vec3 } from 'gl-matrix';

export class Camera {
	constructor() {
		this.position = vec3.fromValues(0, 15, 20);
		this.target = vec3.fromValues(0, 5, 0);
		this.smoothPosition = vec3.clone(this.position);
		this.smoothTarget = vec3.clone(this.target);
		this.mode = 'follow';
		this.orbitAngle = 0;
	}

	setMode(mode) {
		this.mode = mode;
	}

	update(marble, track, dt) {
		switch (this.mode) {
			case 'follow':
				this.updateFollow(marble, track);
				break;
			case 'orbit':
				this.updateOrbit(marble, dt);
				break;
			case 'firstPerson':
				this.updateFirstPerson(marble, track);
				break;
		}

		const smoothing = this.mode === 'firstPerson' ? 0.15 : 0.06;
		vec3.lerp(this.smoothPosition, this.smoothPosition, this.position, smoothing);
		vec3.lerp(this.smoothTarget, this.smoothTarget, this.target, smoothing);
	}

	updateFollow(marble, track) {
		const { index, t } = track.getPositionAtDistance(marble.distance);
		const frame = track.getFrameAt(index, t);

		const behind = vec3.scale(vec3.create(), frame.tangent, -6);
		const up = vec3.fromValues(0, 4, 0);

		vec3.add(this.position, marble.position, behind);
		vec3.add(this.position, this.position, up);

		const lookAhead = Math.min(marble.distance + 2, track.pathLength - 0.1);
		const aheadPos = track.getPositionAtDistance(lookAhead);
		vec3.copy(this.target, aheadPos.position);
		this.target[1] += 0.5;
	}

	updateOrbit(marble, dt) {
		this.orbitAngle += dt * 0.3;
		const radius = 12;
		const height = 8;

		this.position[0] = marble.position[0] + Math.cos(this.orbitAngle) * radius;
		this.position[1] = marble.position[1] + height;
		this.position[2] = marble.position[2] + Math.sin(this.orbitAngle) * radius;

		vec3.copy(this.target, marble.position);
	}

	updateFirstPerson(marble, track) {
		const { index, t } = track.getPositionAtDistance(marble.distance);
		const frame = track.getFrameAt(index, t);

		vec3.copy(this.position, marble.position);
		this.position[1] += 0.3;

		const lookDir = vec3.scale(vec3.create(), frame.tangent, 3);
		vec3.add(this.target, marble.position, lookDir);
	}

	getPosition() {
		return this.smoothPosition;
	}

	getTarget() {
		return this.smoothTarget;
	}
}
