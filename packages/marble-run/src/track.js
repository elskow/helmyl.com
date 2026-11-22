import { vec3, mat4 } from 'gl-matrix';
import { createTubeMesh, buildRMF, createWallMesh } from './geometry.js';

export class Track {
	constructor(renderer) {
		this.renderer = renderer;
		this.meshes = [];
		this.buildTrack();
	}

	buildTrack() {
		const controlPoints = [
			[0, 28, -12],
			[0, 26, -8],
			[0, 24, -4],
			[0, 21, 0],

			[1, 18, 4],
			[3, 15, 7],
			[6, 12, 9],
			[10, 9, 10],

			[14, 7, 9],
			[17, 5, 6],
			[18, 3.5, 2],

			[17, 2.5, -1],
			[14, 1.8, -3],

			[10, 1.0, -2],
			[6, 0.5, 0]
		];

		let points = this.catmullRomSpline(controlPoints, 15);

		points = this.smoothPath(points, 3);

		for (let i = 0; i < points.length; i++) {
			if (points[i][1] < 0.4) {
				points[i][1] = 0.4;
			}
		}

		this.path = points;
		this.pathLength = this.calculatePathLength();
		this.frames = buildRMF(points);

		this.createTrackMeshes();
		this.createSupports();
	}

	smoothPath(points, passes) {
		let result = points.map((p) => vec3.clone(p));

		for (let pass = 0; pass < passes; pass++) {
			const newPoints = [vec3.clone(result[0])];

			for (let i = 1; i < result.length - 1; i++) {
				const smoothed = vec3.create();
				vec3.scale(smoothed, result[i], 0.5);
				vec3.scaleAndAdd(smoothed, smoothed, result[i - 1], 0.25);
				vec3.scaleAndAdd(smoothed, smoothed, result[i + 1], 0.25);
				newPoints.push(smoothed);
			}

			newPoints.push(vec3.clone(result[result.length - 1]));
			result = newPoints;
		}

		return result;
	}

	catmullRomSpline(controlPoints, pointsPerSegment) {
		const result = [];

		const pts = controlPoints.map((p) => vec3.fromValues(p[0], p[1], p[2]));

		for (let i = 0; i < pts.length - 1; i++) {
			const p0 = pts[Math.max(0, i - 1)];
			const p1 = pts[i];
			const p2 = pts[Math.min(pts.length - 1, i + 1)];
			const p3 = pts[Math.min(pts.length - 1, i + 2)];

			for (let j = 0; j < pointsPerSegment; j++) {
				const t = j / pointsPerSegment;
				const point = this.catmullRomPoint(p0, p1, p2, p3, t);
				result.push(point);
			}
		}

		result.push(vec3.clone(pts[pts.length - 1]));

		return result;
	}

	catmullRomPoint(p0, p1, p2, p3, t) {
		const t2 = t * t;
		const t3 = t2 * t;

		const result = vec3.create();

		for (let i = 0; i < 3; i++) {
			result[i] =
				0.5 *
				(2 * p1[i] +
					(-p0[i] + p2[i]) * t +
					(2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 +
					(-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3);
		}

		return result;
	}

	createTrackMeshes() {
		const railOffset = 0.14;
		const railRadius = 0.04;
		const guardHeight = 0.25;
		const guardThickness = 0.02;
		const floorThickness = 0.03;

		const leftPath = this.offsetPath(this.path, -railOffset);
		const rightPath = this.offsetPath(this.path, railOffset);

		this.leftRailPath = leftPath;
		this.rightRailPath = rightPath;
		this.railOffset = railOffset;
		this.railRadius = railRadius;
		this.guardHeight = guardHeight;

		const trackColor = [0.35, 0.35, 0.38];
		const floorColor = [0.28, 0.28, 0.3];

		const leftFloorTop = [];
		const rightFloorTop = [];
		const leftFloorBottom = [];
		const rightFloorBottom = [];
		const leftWallOuter = [];
		const rightWallOuter = [];
		const leftWallTop = [];
		const rightWallTop = [];

		for (let i = 0; i < this.path.length; i++) {
			const frame = this.frames[i];
			const center = this.path[i];

			leftFloorTop.push(
				vec3.fromValues(
					center[0] - frame.binormal[0] * railOffset + frame.normal[0] * railRadius,
					center[1] - frame.binormal[1] * railOffset + frame.normal[1] * railRadius,
					center[2] - frame.binormal[2] * railOffset + frame.normal[2] * railRadius
				)
			);
			rightFloorTop.push(
				vec3.fromValues(
					center[0] + frame.binormal[0] * railOffset + frame.normal[0] * railRadius,
					center[1] + frame.binormal[1] * railOffset + frame.normal[1] * railRadius,
					center[2] + frame.binormal[2] * railOffset + frame.normal[2] * railRadius
				)
			);

			leftFloorBottom.push(
				vec3.fromValues(
					center[0] -
						frame.binormal[0] * (railOffset + guardThickness) -
						frame.normal[0] * floorThickness,
					center[1] -
						frame.binormal[1] * (railOffset + guardThickness) -
						frame.normal[1] * floorThickness,
					center[2] -
						frame.binormal[2] * (railOffset + guardThickness) -
						frame.normal[2] * floorThickness
				)
			);
			rightFloorBottom.push(
				vec3.fromValues(
					center[0] +
						frame.binormal[0] * (railOffset + guardThickness) -
						frame.normal[0] * floorThickness,
					center[1] +
						frame.binormal[1] * (railOffset + guardThickness) -
						frame.normal[1] * floorThickness,
					center[2] +
						frame.binormal[2] * (railOffset + guardThickness) -
						frame.normal[2] * floorThickness
				)
			);

			leftWallOuter.push(
				vec3.fromValues(
					center[0] -
						frame.binormal[0] * (railOffset + guardThickness) -
						frame.normal[0] * floorThickness,
					center[1] -
						frame.binormal[1] * (railOffset + guardThickness) -
						frame.normal[1] * floorThickness,
					center[2] -
						frame.binormal[2] * (railOffset + guardThickness) -
						frame.normal[2] * floorThickness
				)
			);
			rightWallOuter.push(
				vec3.fromValues(
					center[0] +
						frame.binormal[0] * (railOffset + guardThickness) -
						frame.normal[0] * floorThickness,
					center[1] +
						frame.binormal[1] * (railOffset + guardThickness) -
						frame.normal[1] * floorThickness,
					center[2] +
						frame.binormal[2] * (railOffset + guardThickness) -
						frame.normal[2] * floorThickness
				)
			);

			leftWallTop.push(
				vec3.fromValues(
					center[0] -
						frame.binormal[0] * (railOffset + guardThickness) +
						frame.normal[0] * guardHeight,
					center[1] -
						frame.binormal[1] * (railOffset + guardThickness) +
						frame.normal[1] * guardHeight,
					center[2] -
						frame.binormal[2] * (railOffset + guardThickness) +
						frame.normal[2] * guardHeight
				)
			);
			rightWallTop.push(
				vec3.fromValues(
					center[0] +
						frame.binormal[0] * (railOffset + guardThickness) +
						frame.normal[0] * guardHeight,
					center[1] +
						frame.binormal[1] * (railOffset + guardThickness) +
						frame.normal[1] * guardHeight,
					center[2] +
						frame.binormal[2] * (railOffset + guardThickness) +
						frame.normal[2] * guardHeight
				)
			);
		}

		this.meshes.push({
			mesh: createWallMesh(this.renderer, leftFloorTop, rightFloorTop, floorColor, 1),
			metallic: 0.2,
			roughness: 0.6
		});

		this.meshes.push({
			mesh: createWallMesh(this.renderer, leftFloorBottom, rightFloorBottom, trackColor, -1),
			metallic: 0.3,
			roughness: 0.7
		});

		this.meshes.push({
			mesh: createWallMesh(this.renderer, leftWallOuter, leftWallTop, trackColor, -1),
			metallic: 0.4,
			roughness: 0.5
		});

		this.meshes.push({
			mesh: createWallMesh(this.renderer, rightWallOuter, rightWallTop, trackColor, 1),
			metallic: 0.4,
			roughness: 0.5
		});

		const leftWallInner = [];
		const rightWallInner = [];
		for (let i = 0; i < this.path.length; i++) {
			const frame = this.frames[i];
			const center = this.path[i];

			leftWallInner.push(
				vec3.fromValues(
					center[0] - frame.binormal[0] * railOffset + frame.normal[0] * railRadius,
					center[1] - frame.binormal[1] * railOffset + frame.normal[1] * railRadius,
					center[2] - frame.binormal[2] * railOffset + frame.normal[2] * railRadius
				)
			);
			rightWallInner.push(
				vec3.fromValues(
					center[0] + frame.binormal[0] * railOffset + frame.normal[0] * railRadius,
					center[1] + frame.binormal[1] * railOffset + frame.normal[1] * railRadius,
					center[2] + frame.binormal[2] * railOffset + frame.normal[2] * railRadius
				)
			);
		}

		const leftInnerTop = [];
		for (let i = 0; i < this.path.length; i++) {
			const frame = this.frames[i];
			leftInnerTop.push(
				vec3.fromValues(
					leftWallInner[i][0] + frame.normal[0] * (guardHeight - railRadius),
					leftWallInner[i][1] + frame.normal[1] * (guardHeight - railRadius),
					leftWallInner[i][2] + frame.normal[2] * (guardHeight - railRadius)
				)
			);
		}
		this.meshes.push({
			mesh: createWallMesh(this.renderer, leftWallInner, leftInnerTop, trackColor, 1),
			metallic: 0.4,
			roughness: 0.5
		});

		const rightInnerTop = [];
		for (let i = 0; i < this.path.length; i++) {
			const frame = this.frames[i];
			rightInnerTop.push(
				vec3.fromValues(
					rightWallInner[i][0] + frame.normal[0] * (guardHeight - railRadius),
					rightWallInner[i][1] + frame.normal[1] * (guardHeight - railRadius),
					rightWallInner[i][2] + frame.normal[2] * (guardHeight - railRadius)
				)
			);
		}
		this.meshes.push({
			mesh: createWallMesh(this.renderer, rightWallInner, rightInnerTop, trackColor, -1),
			metallic: 0.4,
			roughness: 0.5
		});

		this.meshes.push({
			mesh: createWallMesh(this.renderer, leftInnerTop, leftWallTop, trackColor, 1),
			metallic: 0.5,
			roughness: 0.4
		});
		this.meshes.push({
			mesh: createWallMesh(this.renderer, rightInnerTop, rightWallTop, trackColor, 1),
			metallic: 0.5,
			roughness: 0.4
		});
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
		const supportColor = [0.45, 0.45, 0.48];
		const groundLevel = 0.05;

		for (let i = 0; i < this.path.length; i += 8) {
			const p = this.path[i];
			if (p[1] > 1.2) {
				const supportPath = [
					vec3.fromValues(p[0], p[1] - 0.1, p[2]),
					vec3.fromValues(p[0], groundLevel, p[2])
				];
				this.meshes.push({
					mesh: createTubeMesh(this.renderer, supportPath, 0.06, 8, supportColor),
					metallic: 0.7,
					roughness: 0.4
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

	getCurvatureAtDistance(distance) {
		const delta = 0.1;

		const pos0 = this.getPositionAtDistance(Math.max(0, distance - delta));
		const pos1 = this.getPositionAtDistance(Math.min(this.pathLength, distance + delta));

		const frame0 = this.getFrameAt(pos0.index, pos0.t);
		const frame1 = this.getFrameAt(pos1.index, pos1.t);

		vec3.normalize(frame0.tangent, frame0.tangent);
		vec3.normalize(frame1.tangent, frame1.tangent);

		const dT = vec3.sub(vec3.create(), frame1.tangent, frame0.tangent);
		const ds = 2 * delta;

		const curvature = vec3.length(dT) / ds;

		const curvatureVector = vec3.scale(vec3.create(), dT, 1 / ds);

		const radius = curvature > 0.001 ? 1 / curvature : 1000;

		return {
			curvature,
			curvatureVector,
			radius
		};
	}

	getBankingAngle(curvature, designSpeed = 3.0) {
		if (curvature < 0.01) return 0;

		const radius = 1 / curvature;
		const g = 9.81;

		const tanTheta = (designSpeed * designSpeed) / (radius * g);

		const maxBank = Math.PI / 4;
		const angle = Math.atan(tanTheta);

		return Math.max(-maxBank, Math.min(maxBank, angle));
	}

	draw(renderer) {
		const identity = mat4.create();
		for (const { mesh, metallic, roughness } of this.meshes) {
			renderer.drawMesh(mesh, identity, metallic, roughness, false, false, true);
		}
	}
}
