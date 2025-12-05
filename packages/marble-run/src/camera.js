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

		// Faster smoothing for follow/FPV to keep up with marble
		const smoothing = this.mode === 'firstPerson' ? 0.25 : this.mode === 'follow' ? 0.12 : 0.06;
		vec3.lerp(this.smoothPosition, this.smoothPosition, this.position, smoothing);
		vec3.lerp(this.smoothTarget, this.smoothTarget, this.target, smoothing);
	}

	updateFollow(marble, track) {
		// Use trackDistance (the correct property name)
		const trackDist = marble.trackDistance || 0;
		const { index, t } = track.getPositionAtDistance(trackDist);
		const frame = track.getFrameAt(index, t);

		vec3.normalize(frame.tangent, frame.tangent);

		// Position camera behind and above the marble
		// Behind = opposite of tangent direction
		const behind = vec3.create();
		vec3.scale(behind, frame.tangent, -5); // 5 units behind

		const up = vec3.fromValues(0, 3, 0); // 3 units above

		vec3.add(this.position, marble.position, behind);
		vec3.add(this.position, this.position, up);

		// Look ahead on the track
		const lookAheadDist = Math.min(trackDist + 3, track.pathLength - 0.1);
		const aheadPos = track.getPositionAtDistance(lookAheadDist);
		vec3.copy(this.target, aheadPos.position);
		this.target[1] += 0.3; // Slightly above track
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
		// Use trackDistance (the correct property name)
		const trackDist = marble.trackDistance || 0;
		const { index, t } = track.getPositionAtDistance(trackDist);
		const frame = track.getFrameAt(index, t);

		vec3.normalize(frame.tangent, frame.tangent);
		vec3.normalize(frame.normal, frame.normal);

		// Position camera at marble position, slightly above
		vec3.copy(this.position, marble.position);
		// Lift camera up along track normal (so it's above the marble on the track surface)
		vec3.scaleAndAdd(this.position, this.position, frame.normal, 0.15);

		// Look ahead along track direction
		const lookAheadDist = Math.min(trackDist + 2, track.pathLength - 0.1);
		const aheadPos = track.getPositionAtDistance(lookAheadDist);
		vec3.copy(this.target, aheadPos.position);
	}

	getPosition() {
		return this.smoothPosition;
	}

	getTarget() {
		return this.smoothTarget;
	}
}
