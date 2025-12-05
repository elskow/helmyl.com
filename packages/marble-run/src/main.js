import { mat4, vec3, quat } from 'gl-matrix';

// ============================================
// WebGL Renderer with improved shaders
// ============================================
class Renderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', { antialias: true, alpha: false });
		if (!this.gl) throw new Error('WebGL not supported');

		this.resize();
		window.addEventListener('resize', () => this.resize());

		this.initShaders();
		this.initMatrices();
		this.time = 0;
	}

	resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		this.canvas.width = window.innerWidth * dpr;
		this.canvas.height = window.innerHeight * dpr;
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	initShaders() {
		const gl = this.gl;

		// Main shader with better lighting
		const vsSource = `
			attribute vec3 aPosition;
			attribute vec3 aNormal;
			attribute vec3 aColor;

			uniform mat4 uProjection;
			uniform mat4 uView;
			uniform mat4 uModel;
			uniform mat4 uNormalMatrix;

			varying vec3 vNormal;
			varying vec3 vPosition;
			varying vec3 vColor;
			varying vec3 vWorldPos;

			void main() {
				vec4 worldPos = uModel * vec4(aPosition, 1.0);
				vWorldPos = worldPos.xyz;
				vPosition = (uView * worldPos).xyz;
				vNormal = normalize((uNormalMatrix * vec4(aNormal, 0.0)).xyz);
				vColor = aColor;
				gl_Position = uProjection * uView * worldPos;
			}
		`;

		const fsSource = `
			precision highp float;

			varying vec3 vNormal;
			varying vec3 vPosition;
			varying vec3 vColor;
			varying vec3 vWorldPos;

			uniform vec3 uLightPos;
			uniform vec3 uLightPos2;
			uniform vec3 uLightPos3;
			uniform vec3 uCameraPos;
			uniform float uMetallic;
			uniform float uRoughness;
			uniform float uTime;
			uniform int uIsMarble;

			// Fog - lighter and less dense
			const vec3 fogColor = vec3(0.08, 0.08, 0.12);
			const float fogDensity = 0.006;

			vec3 fresnelSchlick(float cosTheta, vec3 F0) {
				return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
			}

			void main() {
				vec3 N = normalize(vNormal);
				vec3 V = normalize(uCameraPos - vWorldPos);
				
				vec3 baseColor = vColor;
				
				// Marble swirl pattern
				if (uIsMarble == 1) {
					float swirl = sin(vWorldPos.x * 20.0 + vWorldPos.y * 15.0 + vWorldPos.z * 10.0 + uTime * 2.0) * 0.5 + 0.5;
					baseColor = mix(baseColor, vec3(1.0, 0.5, 0.3), swirl * 0.4);
					baseColor = mix(baseColor, vec3(1.0, 0.9, 0.4), pow(swirl, 3.0) * 0.3);
				}

				vec3 F0 = mix(vec3(0.04), baseColor, uMetallic);
				
				vec3 result = vec3(0.0);
				
				// Three-point lighting for better coverage
				vec3 lightPositions[3];
				lightPositions[0] = uLightPos;   // Main key light
				lightPositions[1] = uLightPos2;  // Fill light
				lightPositions[2] = uLightPos3;  // Back/rim light
				
				vec3 lightColors[3];
				lightColors[0] = vec3(1.0, 0.98, 0.95) * 2.5;  // Bright warm white
				lightColors[1] = vec3(0.6, 0.8, 1.0) * 1.5;    // Cool blue fill
				lightColors[2] = vec3(1.0, 0.9, 0.8) * 1.2;    // Warm back light

				for (int i = 0; i < 3; i++) {
					vec3 L = normalize(lightPositions[i] - vWorldPos);
					vec3 H = normalize(V + L);
					
					float distance = length(lightPositions[i] - vWorldPos);
					float attenuation = 1.0 / (1.0 + 0.005 * distance * distance);
					
					float NdotL = max(dot(N, L), 0.0);
					float NdotH = max(dot(N, H), 0.0);
					float NdotV = max(dot(N, V), 0.001);
					
					// Fresnel
					vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
					
					// Distribution (GGX)
					float a = uRoughness * uRoughness;
					float a2 = a * a;
					float denom = NdotH * NdotH * (a2 - 1.0) + 1.0;
					float D = a2 / (3.14159 * denom * denom + 0.0001);
					
					// Geometry
					float k = (uRoughness + 1.0) * (uRoughness + 1.0) / 8.0;
					float G = (NdotV / (NdotV * (1.0 - k) + k)) * (NdotL / (NdotL * (1.0 - k) + k));
					
					vec3 specular = (D * G * F) / (4.0 * NdotV * NdotL + 0.001);
					vec3 kD = (1.0 - F) * (1.0 - uMetallic);
					
					result += (kD * baseColor / 3.14159 + specular) * lightColors[i] * NdotL * attenuation;
				}
				
				// Strong ambient lighting - hemisphere style
				float heightFactor = clamp(vWorldPos.y / 15.0, 0.0, 1.0);
				vec3 skyColor = vec3(0.4, 0.5, 0.7);
				vec3 groundColor = vec3(0.2, 0.15, 0.1);
				float hemisphereBlend = dot(N, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
				vec3 ambientColor = mix(groundColor, skyColor, hemisphereBlend);
				vec3 ambient = baseColor * ambientColor * 0.4;
				result += ambient;
				
				// Rim lighting for marble - brighter
				if (uIsMarble == 1) {
					float rim = 1.0 - max(dot(V, N), 0.0);
					rim = pow(rim, 2.5);
					result += rim * vec3(1.0, 0.6, 0.3) * 0.8;
				}
				
				// Subtle rim for all objects
				float globalRim = 1.0 - max(dot(V, N), 0.0);
				globalRim = pow(globalRim, 4.0);
				result += globalRim * vec3(0.3, 0.4, 0.5) * 0.15;
				
				// Lighter fog
				float dist = length(vPosition);
				float fogFactor = 1.0 - exp(-fogDensity * dist * dist);
				result = mix(result, fogColor, fogFactor);
				
				// Tone mapping (ACES-like for better colors)
				result = (result * (2.51 * result + 0.03)) / (result * (2.43 * result + 0.59) + 0.14);
				result = pow(result, vec3(1.0/2.2));
				
				gl_FragColor = vec4(result, 1.0);
			}
		`;

		this.program = this.createProgram(vsSource, fsSource);

		this.locations = {
			aPosition: gl.getAttribLocation(this.program, 'aPosition'),
			aNormal: gl.getAttribLocation(this.program, 'aNormal'),
			aColor: gl.getAttribLocation(this.program, 'aColor'),
			uProjection: gl.getUniformLocation(this.program, 'uProjection'),
			uView: gl.getUniformLocation(this.program, 'uView'),
			uModel: gl.getUniformLocation(this.program, 'uModel'),
			uNormalMatrix: gl.getUniformLocation(this.program, 'uNormalMatrix'),
			uLightPos: gl.getUniformLocation(this.program, 'uLightPos'),
			uLightPos2: gl.getUniformLocation(this.program, 'uLightPos2'),
			uLightPos3: gl.getUniformLocation(this.program, 'uLightPos3'),
			uCameraPos: gl.getUniformLocation(this.program, 'uCameraPos'),
			uMetallic: gl.getUniformLocation(this.program, 'uMetallic'),
			uRoughness: gl.getUniformLocation(this.program, 'uRoughness'),
			uTime: gl.getUniformLocation(this.program, 'uTime'),
			uIsMarble: gl.getUniformLocation(this.program, 'uIsMarble')
		};

		// Particle shader
		const particleVS = `
			attribute vec3 aPosition;
			attribute float aSize;
			attribute float aLife;
			attribute vec3 aColor;
			
			uniform mat4 uProjection;
			uniform mat4 uView;
			
			varying float vLife;
			varying vec3 vColor;
			
			void main() {
				vLife = aLife;
				vColor = aColor;
				vec4 viewPos = uView * vec4(aPosition, 1.0);
				gl_Position = uProjection * viewPos;
				gl_PointSize = aSize * (300.0 / -viewPos.z);
			}
		`;

		const particleFS = `
			precision mediump float;
			varying float vLife;
			varying vec3 vColor;
			
			void main() {
				vec2 coord = gl_PointCoord - vec2(0.5);
				float dist = length(coord);
				if (dist > 0.5) discard;
				
				float alpha = smoothstep(0.5, 0.0, dist) * vLife;
				vec3 color = vColor * (1.0 + vLife);
				gl_FragColor = vec4(color, alpha * 0.6);
			}
		`;

		this.particleProgram = this.createProgram(particleVS, particleFS);
		this.particleLocations = {
			aPosition: gl.getAttribLocation(this.particleProgram, 'aPosition'),
			aSize: gl.getAttribLocation(this.particleProgram, 'aSize'),
			aLife: gl.getAttribLocation(this.particleProgram, 'aLife'),
			aColor: gl.getAttribLocation(this.particleProgram, 'aColor'),
			uProjection: gl.getUniformLocation(this.particleProgram, 'uProjection'),
			uView: gl.getUniformLocation(this.particleProgram, 'uView')
		};
	}

	createProgram(vsSource, fsSource) {
		const gl = this.gl;
		const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
		const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
		const program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error('Shader link error: ' + gl.getProgramInfoLog(program));
		}
		return program;
	}

	compileShader(type, source) {
		const gl = this.gl;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error('Shader error: ' + gl.getShaderInfoLog(shader));
		}
		return shader;
	}

	initMatrices() {
		this.projection = mat4.create();
		this.view = mat4.create();
		this.model = mat4.create();
		this.normalMatrix = mat4.create();
	}

	setCamera(position, target) {
		const aspect = this.canvas.width / this.canvas.height;
		mat4.perspective(this.projection, Math.PI / 4, aspect, 0.1, 200);
		mat4.lookAt(this.view, position, target, [0, 1, 0]);
		this.cameraPos = position;
	}

	clear() {
		const gl = this.gl;
		gl.clearColor(0.06, 0.06, 0.1, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
	}

	beginMainPass() {
		const gl = this.gl;
		gl.useProgram(this.program);
		gl.uniformMatrix4fv(this.locations.uProjection, false, this.projection);
		gl.uniformMatrix4fv(this.locations.uView, false, this.view);
		gl.uniform3fv(this.locations.uCameraPos, this.cameraPos);
		gl.uniform3fv(this.locations.uLightPos, [15, 25, 15]); // Key light - high and bright
		gl.uniform3fv(this.locations.uLightPos2, [-20, 15, -15]); // Fill light - opposite side
		gl.uniform3fv(this.locations.uLightPos3, [0, 5, -25]); // Back light - behind scene
		gl.uniform1f(this.locations.uTime, this.time);
	}

	drawMesh(mesh, modelMatrix, metallic = 0.0, roughness = 0.5, isMarble = false) {
		const gl = this.gl;

		mat4.copy(this.model, modelMatrix);
		mat4.invert(this.normalMatrix, this.model);
		mat4.transpose(this.normalMatrix, this.normalMatrix);

		gl.uniformMatrix4fv(this.locations.uModel, false, this.model);
		gl.uniformMatrix4fv(this.locations.uNormalMatrix, false, this.normalMatrix);
		gl.uniform1f(this.locations.uMetallic, metallic);
		gl.uniform1f(this.locations.uRoughness, roughness);
		gl.uniform1i(this.locations.uIsMarble, isMarble ? 1 : 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
		gl.enableVertexAttribArray(this.locations.aPosition);
		gl.vertexAttribPointer(this.locations.aPosition, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
		gl.enableVertexAttribArray(this.locations.aNormal);
		gl.vertexAttribPointer(this.locations.aNormal, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer);
		gl.enableVertexAttribArray(this.locations.aColor);
		gl.vertexAttribPointer(this.locations.aColor, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
		gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
	}

	createMesh(positions, normals, colors, indices) {
		const gl = this.gl;

		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

		const normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		const colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

		return {
			positionBuffer,
			normalBuffer,
			colorBuffer,
			indexBuffer,
			indexCount: indices.length
		};
	}

	updateTime(t) {
		this.time = t;
	}
}

// ============================================
// Particle System
// ============================================
class ParticleSystem {
	constructor(renderer, maxParticles = 500) {
		this.renderer = renderer;
		this.gl = renderer.gl;
		this.maxParticles = maxParticles;
		this.particles = [];

		this.positionData = new Float32Array(maxParticles * 3);
		this.sizeData = new Float32Array(maxParticles);
		this.lifeData = new Float32Array(maxParticles);
		this.colorData = new Float32Array(maxParticles * 3);

		this.positionBuffer = this.gl.createBuffer();
		this.sizeBuffer = this.gl.createBuffer();
		this.lifeBuffer = this.gl.createBuffer();
		this.colorBuffer = this.gl.createBuffer();
	}

	emit(position, velocity, count = 3) {
		for (let i = 0; i < count; i++) {
			if (this.particles.length >= this.maxParticles) {
				this.particles.shift();
			}

			const spread = 0.1;
			this.particles.push({
				position: vec3.fromValues(
					position[0] + (Math.random() - 0.5) * spread,
					position[1] + (Math.random() - 0.5) * spread,
					position[2] + (Math.random() - 0.5) * spread
				),
				velocity: vec3.fromValues(
					velocity[0] * 0.2 + (Math.random() - 0.5) * 0.5,
					velocity[1] * 0.2 + Math.random() * 0.3,
					velocity[2] * 0.2 + (Math.random() - 0.5) * 0.5
				),
				life: 1.0,
				maxLife: 0.5 + Math.random() * 0.5,
				size: 0.05 + Math.random() * 0.08,
				color: [1.0, 0.5 + Math.random() * 0.3, 0.2]
			});
		}
	}

	update(dt) {
		const gravity = -2;

		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];

			p.velocity[1] += gravity * dt;
			vec3.scaleAndAdd(p.position, p.position, p.velocity, dt);
			p.life -= dt / p.maxLife;

			if (p.life <= 0) {
				this.particles.splice(i, 1);
			}
		}
	}

	draw() {
		const gl = this.gl;
		const count = this.particles.length;
		if (count === 0) return;

		for (let i = 0; i < count; i++) {
			const p = this.particles[i];
			this.positionData[i * 3] = p.position[0];
			this.positionData[i * 3 + 1] = p.position[1];
			this.positionData[i * 3 + 2] = p.position[2];
			this.sizeData[i] = p.size * p.life;
			this.lifeData[i] = p.life;
			this.colorData[i * 3] = p.color[0];
			this.colorData[i * 3 + 1] = p.color[1];
			this.colorData[i * 3 + 2] = p.color[2];
		}

		gl.useProgram(this.renderer.particleProgram);
		const loc = this.renderer.particleLocations;

		gl.uniformMatrix4fv(loc.uProjection, false, this.renderer.projection);
		gl.uniformMatrix4fv(loc.uView, false, this.renderer.view);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.positionData.subarray(0, count * 3), gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(loc.aPosition);
		gl.vertexAttribPointer(loc.aPosition, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.sizeData.subarray(0, count), gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(loc.aSize);
		gl.vertexAttribPointer(loc.aSize, 1, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.lifeBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.lifeData.subarray(0, count), gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(loc.aLife);
		gl.vertexAttribPointer(loc.aLife, 1, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.colorData.subarray(0, count * 3), gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(loc.aColor);
		gl.vertexAttribPointer(loc.aColor, 3, gl.FLOAT, false, 0, 0);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.depthMask(false);

		gl.drawArrays(gl.POINTS, 0, count);

		gl.depthMask(true);
		gl.disable(gl.BLEND);
	}
}

// ============================================
// Mesh Generators
// ============================================
function createSphereMesh(renderer, radius, segments, color) {
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

function createTubeMesh(renderer, path, radius, segments, color) {
	const positions = [];
	const normals = [];
	const colors = [];
	const indices = [];

	// Build rotation minimizing frames
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

function buildRMF(path) {
	const frames = [];

	// First frame
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

	// Propagate frames
	for (let i = 1; i < path.length; i++) {
		const prevFrame = frames[i - 1];

		if (i < path.length - 1) {
			tangent = vec3.sub(vec3.create(), path[i + 1], path[i - 1]);
		} else {
			tangent = vec3.sub(vec3.create(), path[i], path[i - 1]);
		}
		vec3.normalize(tangent, tangent);

		// Rotate previous frame to align with new tangent
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

function createGroundMesh(renderer, size, divisions) {
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

			// Grid pattern - brighter
			const gridX = Math.abs(Math.sin(x * 0.5)) < 0.1;
			const gridZ = Math.abs(Math.sin(z * 0.5)) < 0.1;
			const isGrid = gridX || gridZ;

			const brightness = isGrid ? 0.2 : 0.1;
			colors.push(brightness * 0.9, brightness * 0.9, brightness * 1.1);
		}
	}

	for (let i = 0; i < divisions; i++) {
		for (let j = 0; j < divisions; j++) {
			const a = i * (divisions + 1) + j;
			const b = a + 1;
			const c = a + divisions + 1;
			const d = c + 1;
			indices.push(a, c, b);
			indices.push(b, c, d);
		}
	}

	return renderer.createMesh(positions, normals, colors, indices);
}

// ============================================
// Track Builder - More interesting track!
// ============================================
class Track {
	constructor(renderer) {
		this.renderer = renderer;
		this.meshes = [];
		this.buildTrack();
	}

	buildTrack() {
		const points = [];

		// === Section 1: Starting spiral (high) ===
		const startY = 12;
		for (let i = 0; i <= 80; i++) {
			const t = i / 80;
			const angle = t * Math.PI * 3; // 1.5 turns
			const radius = 4 - t * 1; // Decreasing radius
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
					last[1] - t * 1.5,
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
					last[1] - t * 3 + Math.sin(angle) * corkscrewRadius,
					last[2] + Math.cos(angle) * corkscrewRadius
				)
			);
		}

		// === Section 6: Wave section ===
		last = points[points.length - 1];
		for (let i = 1; i <= 50; i++) {
			const t = i / 50;
			const wave = Math.sin(t * Math.PI * 4) * 0.4 * (1 - t * 0.5);
			points.push(vec3.fromValues(last[0] - t * 6, last[1] - t * 1 + wave, last[2] + t * 4));
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
			points.push(vec3.fromValues(last[0] - t * 5 - curve, last[1] - t * 2, last[2] + t * 3));
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
					last[1] - t * 1.5,
					last[2] + (1 - Math.cos(angle)) * radius
				)
			);
		}

		this.path = points;
		this.pathLength = this.calculatePathLength();
		this.frames = buildRMF(points);

		// Create track meshes
		this.createTrackMeshes();
		this.createSupports();
	}

	createTrackMeshes() {
		const railOffset = 0.12;
		const leftPath = this.offsetPath(this.path, -railOffset);
		const rightPath = this.offsetPath(this.path, railOffset);

		// Main rails - shiny chrome look
		const railColor = [0.85, 0.8, 0.75];
		this.meshes.push({
			mesh: createTubeMesh(this.renderer, leftPath, 0.04, 12, railColor),
			metallic: 0.9,
			roughness: 0.2
		});
		this.meshes.push({
			mesh: createTubeMesh(this.renderer, rightPath, 0.04, 12, railColor),
			metallic: 0.9,
			roughness: 0.2
		});

		// Cross ties - warmer wood-like color
		const tieColor = [0.45, 0.35, 0.25];
		for (let i = 0; i < this.path.length; i += 4) {
			const tiePath = [leftPath[i], rightPath[i]];
			this.meshes.push({
				mesh: createTubeMesh(this.renderer, tiePath, 0.025, 6, tieColor),
				metallic: 0.05,
				roughness: 0.7
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
		const supportColor = [0.5, 0.5, 0.55];

		for (let i = 0; i < this.path.length; i += 12) {
			const p = this.path[i];
			if (p[1] > 0.3) {
				const supportPath = [
					vec3.fromValues(p[0], p[1], p[2]),
					vec3.fromValues(p[0], 0, p[2])
				];
				this.meshes.push({
					mesh: createTubeMesh(this.renderer, supportPath, 0.05, 8, supportColor),
					metallic: 0.6,
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

	draw(renderer) {
		const identity = mat4.create();
		for (const { mesh, metallic, roughness } of this.meshes) {
			renderer.drawMesh(mesh, identity, metallic, roughness, false);
		}
	}
}

// ============================================
// Marble with better physics
// ============================================
class Marble {
	constructor(renderer, track) {
		this.renderer = renderer;
		this.track = track;
		this.radius = 0.1;
		this.mesh = createSphereMesh(renderer, this.radius, 24, [1.0, 0.4, 0.25]);
		this.reset();
	}

	reset() {
		this.distance = 0;
		this.velocity = 0.5; // Small initial push
		this.position = vec3.clone(this.track.path[0]);
		this.rotation = mat4.create();
		this.angularVelocity = vec3.create();
	}

	update(dt) {
		const { position, index, t } = this.track.getPositionAtDistance(this.distance);
		const frame = this.track.getFrameAt(index, t);

		// Normalize frame vectors
		vec3.normalize(frame.tangent, frame.tangent);
		vec3.normalize(frame.normal, frame.normal);
		vec3.normalize(frame.binormal, frame.binormal);

		// Physics constants
		const gravity = 15;
		const friction = 0.015;
		const airResistance = 0.001;

		// Gravity component along track
		const gravityForce = -frame.tangent[1] * gravity;

		// Rolling friction (less when going fast)
		const frictionForce = -Math.sign(this.velocity) * friction * gravity;

		// Air resistance (quadratic)
		const airForce = -Math.sign(this.velocity) * airResistance * this.velocity * this.velocity;

		// Centripetal force check for loops (prevents falling off)
		const speed = Math.abs(this.velocity);

		// Update velocity
		this.velocity += (gravityForce + frictionForce + airForce) * dt;

		// Speed limits
		const maxSpeed = 20;
		this.velocity = Math.max(-maxSpeed, Math.min(maxSpeed, this.velocity));

		// Update distance
		this.distance += this.velocity * dt;

		// Track bounds
		if (this.distance < 0) {
			this.distance = 0;
			this.velocity = Math.abs(this.velocity) * 0.3;
		} else if (this.distance >= this.track.pathLength - 0.1) {
			this.distance = 0; // Loop back to start
			this.velocity = 0.5;
		}

		// Update position
		const newPos = this.track.getPositionAtDistance(this.distance);
		const newFrame = this.track.getFrameAt(newPos.index, newPos.t);
		vec3.normalize(newFrame.normal, newFrame.normal);

		vec3.copy(this.position, newPos.position);

		// Offset above track
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
		renderer.drawMesh(this.mesh, model, 0.3, 0.4, true);
	}

	getSpeed() {
		return Math.abs(this.velocity);
	}
}

// ============================================
// Camera with multiple modes
// ============================================
class Camera {
	constructor() {
		this.position = vec3.fromValues(0, 15, 20);
		this.target = vec3.fromValues(0, 5, 0);
		this.smoothPosition = vec3.clone(this.position);
		this.smoothTarget = vec3.clone(this.target);
		this.mode = 'follow'; // 'follow', 'orbit', 'firstPerson'
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

		// Smooth interpolation
		const smoothing = this.mode === 'firstPerson' ? 0.15 : 0.06;
		vec3.lerp(this.smoothPosition, this.smoothPosition, this.position, smoothing);
		vec3.lerp(this.smoothTarget, this.smoothTarget, this.target, smoothing);
	}

	updateFollow(marble, track) {
		const { index, t } = track.getPositionAtDistance(marble.distance);
		const frame = track.getFrameAt(index, t);

		// Camera behind and above marble
		const behind = vec3.scale(vec3.create(), frame.tangent, -6);
		const up = vec3.fromValues(0, 4, 0);

		vec3.add(this.position, marble.position, behind);
		vec3.add(this.position, this.position, up);

		// Look ahead of marble
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

		// Position slightly above marble
		vec3.copy(this.position, marble.position);
		this.position[1] += 0.3;

		// Look in direction of travel
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

// ============================================
// Main Application
// ============================================
class App {
	constructor() {
		this.canvas = document.getElementById('canvas');
		this.renderer = new Renderer(this.canvas);
		this.track = new Track(this.renderer);
		this.marble = new Marble(this.renderer, this.track);
		this.camera = new Camera();
		this.particles = new ParticleSystem(this.renderer);
		this.ground = createGroundMesh(this.renderer, 100, 50);

		this.lastTime = performance.now();
		this.totalTime = 0;
		this.speedDisplay = document.getElementById('speed');

		this.setupUI();
		this.animate();
	}

	setupUI() {
		document.getElementById('reset-btn').addEventListener('click', () => {
			this.marble.reset();
		});

		// Camera mode buttons
		const cameraContainer = document.getElementById('camera-modes');
		if (cameraContainer) {
			cameraContainer.querySelectorAll('button').forEach((btn) => {
				btn.addEventListener('click', () => {
					this.camera.setMode(btn.dataset.mode);
					cameraContainer
						.querySelectorAll('button')
						.forEach((b) => b.classList.remove('active'));
					btn.classList.add('active');
				});
			});
		}
	}

	animate() {
		const now = performance.now();
		const dt = Math.min((now - this.lastTime) / 1000, 0.05);
		this.lastTime = now;
		this.totalTime += dt;

		// Update
		const marbleData = this.marble.update(dt);
		this.camera.update(this.marble, this.track, dt);

		// Emit particles when moving fast
		if (marbleData.speed > 3) {
			const emitRate = Math.floor(marbleData.speed / 3);
			const vel = vec3.scale(vec3.create(), marbleData.frame.tangent, -this.marble.velocity);
			this.particles.emit(this.marble.position, vel, emitRate);
		}
		this.particles.update(dt);

		// Update UI
		this.speedDisplay.textContent = this.marble.getSpeed().toFixed(1);

		// Render
		this.renderer.updateTime(this.totalTime);
		this.renderer.clear();
		this.renderer.setCamera(this.camera.getPosition(), this.camera.getTarget());

		this.renderer.beginMainPass();

		// Ground
		const groundMatrix = mat4.create();
		this.renderer.drawMesh(this.ground, groundMatrix, 0.0, 0.9, false);

		// Track and marble
		this.track.draw(this.renderer);
		this.marble.draw(this.renderer);

		// Particles (after main pass)
		this.particles.draw();

		requestAnimationFrame(() => this.animate());
	}
}

// Start
new App();
