import { vec3, mat4 } from 'gl-matrix';
import { createTubeMesh, buildRMF } from './geometry.js';

export class Track {
	constructor(renderer) {
		this.renderer = renderer;
		this.meshes = [];
		this.buildTrack();
	}

	buildTrack() {
		const points = [];

		// Minimum height above ground
		const minHeight = 1.0;

		// === Section 1: Starting spiral (high) ===
		const startY = 14;
		for (let i = 0; i <= 80; i++) {
			const t = i / 80;
			const angle = t * Math.PI * 3;
			const radius = 4 - t * 1;
			const y = startY - t * 4;
			points.push(
				vec3.fromValues(Math.cos(angle) * radius, y, -12 + Math.sin(angle) * radius)
			);
		}

		// === Section 2: Drop into first loop ===
		let last = points[points.length - 1];
		for (let i = 1; i <= 30; i++) {
			const t = i / 30;
			points.push(vec3.fromValues(last[0] + t * 4, last[1] - t * 2, last[2] + t * 3));
		}

		// === Section 3: Vertical loop ===
		last = points[points.length - 1];
		const loopRadius = 2.5;
		const loopCenter = vec3.fromValues(last[0] + 2, last[1] + loopRadius, last[2]);

		for (let i = 1; i <= 50; i++) {
			const t = i / 50;
			const angle = -Math.PI / 2 + t * Math.PI * 2;
			points.push(
				vec3.fromValues(
					loopCenter[0],
					loopCenter[1] + Math.sin(angle) * loopRadius,
					loopCenter[2] + Math.cos(angle) * loopRadius
				)
			);
		}

		// === Section 4: Banked turn ===
		last = points[points.length - 1];
		for (let i = 1; i <= 40; i++) {
			const t = i / 40;
			const angle = t * Math.PI * 0.8;
			const bankRadius = 5;
			points.push(
				vec3.fromValues(
					last[0] + Math.sin(angle) * bankRadius,
					last[1] - t * 1.0,
					last[2] + (1 - Math.cos(angle)) * bankRadius
				)
			);
		}

		// === Section 5: Corkscrew ===
		last = points[points.length - 1];
		const corkscrewTurns = 2;
		const corkscrewRadius = 1.5;
		const corkscrewLength = 8;

		for (let i = 1; i <= 60; i++) {
			const t = i / 60;
			const angle = t * corkscrewTurns * Math.PI * 2;
			points.push(
				vec3.fromValues(
					last[0] + t * corkscrewLength,
					last[1] - t * 2 + Math.sin(angle) * corkscrewRadius,
					last[2] + Math.cos(angle) * corkscrewRadius
				)
			);
		}

		// === Section 6: Wave section ===
		last = points[points.length - 1];
		for (let i = 1; i <= 50; i++) {
			const t = i / 50;
			const wave = Math.sin(t * Math.PI * 4) * 0.4 * (1 - t * 0.5);
			points.push(
				vec3.fromValues(last[0] - t * 6, last[1] - t * 0.5 + wave, last[2] + t * 4)
			);
		}

		// === Section 7: Second loop (larger) ===
		last = points[points.length - 1];
		const loop2Radius = 3;
		const loop2Center = vec3.fromValues(last[0], last[1] + loop2Radius, last[2] + 2);

		for (let i = 1; i <= 50; i++) {
			const t = i / 50;
			const angle = -Math.PI / 2 + t * Math.PI * 2;
			points.push(
				vec3.fromValues(
					loop2Center[0] - Math.cos(angle) * loop2Radius * 0.3,
					loop2Center[1] + Math.sin(angle) * loop2Radius,
					loop2Center[2] + Math.cos(angle) * loop2Radius
				)
			);
		}

		// === Section 8: Final descent ===
		last = points[points.length - 1];
		for (let i = 1; i <= 40; i++) {
			const t = i / 40;
			const curve = Math.sin(t * Math.PI) * 3;
			points.push(
				vec3.fromValues(last[0] - t * 5 - curve, last[1] - t * 1.5, last[2] + t * 3)
			);
		}

		// === Section 9: Finish spiral ===
		last = points[points.length - 1];
		for (let i = 1; i <= 50; i++) {
			const t = i / 50;
			const angle = t * Math.PI * 1.5;
			const radius = 3 * (1 - t * 0.3);
			points.push(
				vec3.fromValues(
					last[0] + Math.sin(angle) * radius,
					last[1] - t * 1.0,
					last[2] + (1 - Math.cos(angle)) * radius
				)
			);
		}

		// Ensure all points are above minimum height
		for (let i = 0; i < points.length; i++) {
			if (points[i][1] < minHeight) {
				points[i][1] = minHeight;
			}
		}

		this.path = points;
		this.pathLength = this.calculatePathLength();
		this.frames = buildRMF(points);

		this.createTrackMeshes();
		this.createSupports();
	}

	createTrackMeshes() {
		const railOffset = 0.12;
		const leftPath = this.offsetPath(this.path, -railOffset);
		const rightPath = this.offsetPath(this.path, railOffset);

		// Main rails - polished chrome steel with high reflectivity
		// Slightly blue-tinted for that premium chrome look
		const railColor = [0.8, 0.8, 0.82];
		this.meshes.push({
			mesh: createTubeMesh(this.renderer, leftPath, 0.04, 12, railColor),
			metallic: 0.95,
			roughness: 0.12 // Very smooth for sharp reflections
		});
		this.meshes.push({
			mesh: createTubeMesh(this.renderer, rightPath, 0.04, 12, railColor),
			metallic: 0.95,
			roughness: 0.12
		});

		// Cross ties - dark wood/rubber
		const tieColor = [0.25, 0.18, 0.12];
		for (let i = 0; i < this.path.length; i += 4) {
			const tiePath = [leftPath[i], rightPath[i]];
			this.meshes.push({
				mesh: createTubeMesh(this.renderer, tiePath, 0.025, 6, tieColor),
				metallic: 0.0,
				roughness: 0.9
			});
		}
	}

	offsetPath(path, offset) {
		const result = [];
		for (let i = 0; i < path.length; i++) {
			const frame = this.frames[i];
			result.push(
				vec3.fromValues(
					path[i][0] + frame.binormal[0] * offset,
					path[i][1] + frame.binormal[1] * offset,
					path[i][2] + frame.binormal[2] * offset
				)
			);
		}
		return result;
	}

	createSupports() {
		// Support pillars - brushed metal
		const supportColor = [0.45, 0.45, 0.48];
		const groundLevel = 0.05; // Slightly above ground to avoid z-fighting

		for (let i = 0; i < this.path.length; i += 12) {
			const p = this.path[i];
			if (p[1] > 1.5) {
				const supportPath = [
					vec3.fromValues(p[0], p[1], p[2]),
					vec3.fromValues(p[0], groundLevel, p[2])
				];
				this.meshes.push({
					mesh: createTubeMesh(this.renderer, supportPath, 0.05, 8, supportColor),
					metallic: 0.7,
					roughness: 0.4 // Brushed finish
				});
			}
		}
	}

	calculatePathLength() {
		let length = 0;
		for (let i = 1; i < this.path.length; i++) {
			length += vec3.distance(this.path[i], this.path[i - 1]);
		}
		return length;
	}

	getPositionAtDistance(distance) {
		let accumulated = 0;
		for (let i = 1; i < this.path.length; i++) {
			const segmentLength = vec3.distance(this.path[i], this.path[i - 1]);
			if (accumulated + segmentLength >= distance) {
				const t = (distance - accumulated) / segmentLength;
				const pos = vec3.create();
				vec3.lerp(pos, this.path[i - 1], this.path[i], t);
				return { position: pos, index: i - 1, t };
			}
			accumulated += segmentLength;
		}
		return {
			position: vec3.clone(this.path[this.path.length - 1]),
			index: this.path.length - 2,
			t: 1
		};
	}

	getFrameAt(index, t) {
		const f0 = this.frames[index];
		const f1 = this.frames[Math.min(index + 1, this.frames.length - 1)];
		return {
			tangent: vec3.lerp(vec3.create(), f0.tangent, f1.tangent, t),
			normal: vec3.lerp(vec3.create(), f0.normal, f1.normal, t),
			binormal: vec3.lerp(vec3.create(), f0.binormal, f1.binormal, t)
		};
	}

	draw(renderer) {
		const identity = mat4.create();
		for (const { mesh, metallic, roughness } of this.meshes) {
			renderer.drawMesh(mesh, identity, metallic, roughness, false);
		}
	}
}
