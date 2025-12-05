import { vec3, quat } from 'gl-matrix';

export function createSphereMesh(renderer, radius, segments, color) {
	const positions = [];
	const normals = [];
	const colors = [];
	const indices = [];

	for (let lat = 0; lat <= segments; lat++) {
		const theta = (lat * Math.PI) / segments;
		const sinTheta = Math.sin(theta);
		const cosTheta = Math.cos(theta);

		for (let lon = 0; lon <= segments; lon++) {
			const phi = (lon * 2 * Math.PI) / segments;
			const x = Math.cos(phi) * sinTheta;
			const y = cosTheta;
			const z = Math.sin(phi) * sinTheta;

			positions.push(radius * x, radius * y, radius * z);
			normals.push(x, y, z);
			colors.push(color[0], color[1], color[2]);
		}
	}

	for (let lat = 0; lat < segments; lat++) {
		for (let lon = 0; lon < segments; lon++) {
			const first = lat * (segments + 1) + lon;
			const second = first + segments + 1;
			indices.push(first, second, first + 1);
			indices.push(second, second + 1, first + 1);
		}
	}

	return renderer.createMesh(positions, normals, colors, indices);
}

export function createTubeMesh(renderer, path, radius, segments, color) {
	const positions = [];
	const normals = [];
	const colors = [];
	const indices = [];

	const frames = buildRMF(path);

	for (let i = 0; i < path.length; i++) {
		const p = path[i];
		const { normal, binormal } = frames[i];

		for (let j = 0; j <= segments; j++) {
			const angle = (j * 2 * Math.PI) / segments;
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			const nx = cos * normal[0] + sin * binormal[0];
			const ny = cos * normal[1] + sin * binormal[1];
			const nz = cos * normal[2] + sin * binormal[2];

			positions.push(p[0] + radius * nx, p[1] + radius * ny, p[2] + radius * nz);
			normals.push(nx, ny, nz);
			colors.push(color[0], color[1], color[2]);
		}
	}

	for (let i = 0; i < path.length - 1; i++) {
		for (let j = 0; j < segments; j++) {
			const a = i * (segments + 1) + j;
			const b = a + segments + 1;
			indices.push(a, b, a + 1);
			indices.push(b, b + 1, a + 1);
		}
	}

	return renderer.createMesh(positions, normals, colors, indices);
}

export function buildRMF(path) {
	const frames = [];

	let tangent = vec3.sub(vec3.create(), path[1], path[0]);
	vec3.normalize(tangent, tangent);

	let normal = vec3.fromValues(0, 1, 0);
	if (Math.abs(vec3.dot(tangent, normal)) > 0.9) {
		normal = vec3.fromValues(1, 0, 0);
	}

	let binormal = vec3.cross(vec3.create(), tangent, normal);
	vec3.normalize(binormal, binormal);
	normal = vec3.cross(vec3.create(), binormal, tangent);
	vec3.normalize(normal, normal);

	frames.push({
		tangent: vec3.clone(tangent),
		normal: vec3.clone(normal),
		binormal: vec3.clone(binormal)
	});

	for (let i = 1; i < path.length; i++) {
		const prevFrame = frames[i - 1];

		if (i < path.length - 1) {
			tangent = vec3.sub(vec3.create(), path[i + 1], path[i - 1]);
		} else {
			tangent = vec3.sub(vec3.create(), path[i], path[i - 1]);
		}
		vec3.normalize(tangent, tangent);

		const axis = vec3.cross(vec3.create(), prevFrame.tangent, tangent);
		const axisLen = vec3.length(axis);

		if (axisLen > 0.0001) {
			vec3.scale(axis, axis, 1 / axisLen);
			const angle = Math.acos(
				Math.max(-1, Math.min(1, vec3.dot(prevFrame.tangent, tangent)))
			);
			const q = quat.setAxisAngle(quat.create(), axis, angle);
			normal = vec3.transformQuat(vec3.create(), prevFrame.normal, q);
			binormal = vec3.cross(vec3.create(), tangent, normal);
		} else {
			normal = vec3.clone(prevFrame.normal);
			binormal = vec3.clone(prevFrame.binormal);
		}

		vec3.normalize(normal, normal);
		vec3.normalize(binormal, binormal);

		frames.push({ tangent: vec3.clone(tangent), normal, binormal });
	}

	return frames;
}

export function createGroundMesh(renderer, size, divisions) {
	const positions = [];
	const normals = [];
	const colors = [];
	const indices = [];

	const half = size / 2;
	const step = size / divisions;

	for (let i = 0; i <= divisions; i++) {
		for (let j = 0; j <= divisions; j++) {
			const x = -half + i * step;
			const z = -half + j * step;

			positions.push(x, 0, z);
			normals.push(0, 1, 0);

			// Improved grid pattern with depth
			const distFromCenter = Math.sqrt(x * x + z * z) / half;

			// Grid lines - subtle
			const gridX = Math.abs(Math.sin(x * 0.4)) < 0.05;
			const gridZ = Math.abs(Math.sin(z * 0.4)) < 0.05;
			const isGrid = gridX || gridZ;

			// Major grid lines every 5 units
			const majorGridX = Math.abs(x % 10) < 0.3;
			const majorGridZ = Math.abs(z % 10) < 0.3;
			const isMajorGrid = majorGridX || majorGridZ;

			// Base color - darker, more contrast
			let r = 0.12;
			let g = 0.13;
			let b = 0.15;

			// Add grid pattern
			if (isMajorGrid) {
				r += 0.08;
				g += 0.09;
				b += 0.12;
			} else if (isGrid) {
				r += 0.03;
				g += 0.035;
				b += 0.05;
			}

			// Distance fade - darker at edges
			const edgeFade = 1.0 - distFromCenter * 0.6;
			r *= edgeFade;
			g *= edgeFade;
			b *= edgeFade;

			colors.push(r, g, b);
		}
	}

	for (let i = 0; i < divisions; i++) {
		for (let j = 0; j < divisions; j++) {
			const a = i * (divisions + 1) + j;
			const b = a + 1;
			const c = a + divisions + 1;
			const d = c + 1;
			// CCW winding when viewed from above (normal pointing up)
			indices.push(a, b, c);
			indices.push(b, d, c);
		}
	}

	return renderer.createMesh(positions, normals, colors, indices);
}
