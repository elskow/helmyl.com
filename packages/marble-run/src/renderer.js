import { mat4 } from 'gl-matrix';

// Shared shader code - enhanced environment and reflections
const COMMON_SHADER = `
	// Environment colors
	const vec3 SUN_COLOR = vec3(1.0, 0.95, 0.85);
	const vec3 SUN_DIR = normalize(vec3(0.4, 0.7, 0.3));
	const vec3 SKY_ZENITH = vec3(0.22, 0.4, 0.75);
	const vec3 SKY_HORIZON = vec3(0.55, 0.65, 0.8);
	const vec3 GROUND_COLOR = vec3(0.06, 0.05, 0.04);
	
	// Enhanced sky with clouds for better reflections
	vec3 getSkyColor(vec3 dir) {
		float y = max(dir.y, 0.0);
		
		// Multi-layer sky gradient
		vec3 sky = mix(SKY_HORIZON, SKY_ZENITH, pow(y, 0.35));
		
		// Atmospheric scattering
		float horizon = 1.0 - pow(y, 0.25);
		sky = mix(sky, vec3(0.7, 0.75, 0.85), horizon * 0.4);
		
		// Fake clouds for interesting reflections
		float cloudNoise = sin(dir.x * 3.0) * sin(dir.z * 2.5) * 0.5 + 0.5;
		cloudNoise *= sin(dir.x * 7.0 + dir.z * 5.0) * 0.5 + 0.5;
		float cloudMask = smoothstep(0.1, 0.6, y) * smoothstep(0.9, 0.5, y);
		vec3 cloudColor = vec3(0.9, 0.92, 0.95);
		sky = mix(sky, cloudColor, cloudNoise * cloudMask * 0.3);
		
		// Sun glow
		float sunDot = max(dot(dir, SUN_DIR), 0.0);
		vec3 sunGlow = SUN_COLOR * pow(sunDot, 6.0) * 0.5;
		vec3 sunCore = SUN_COLOR * pow(sunDot, 48.0) * 1.2;
		vec3 sunDisc = vec3(1.0, 0.98, 0.95) * pow(sunDot, 400.0) * 2.5;
		
		return sky + sunGlow + sunCore + sunDisc;
	}
	
	// Get environment color for reflections (includes ground)
	vec3 getEnvironmentColor(vec3 dir) {
		if (dir.y < 0.0) {
			// Ground reflection - darker with gradient
			float groundFade = smoothstep(-0.5, 0.0, dir.y);
			vec3 groundReflect = GROUND_COLOR * 0.4;
			return mix(groundReflect, SKY_HORIZON * 0.3, groundFade);
		}
		return getSkyColor(dir);
	}
	
	// Sample environment at multiple roughness levels (fake mip mapping)
	vec3 sampleEnvironmentBlurred(vec3 R, float roughness) {
		vec3 color = vec3(0.0);
		
		if (roughness < 0.1) {
			// Sharp reflection
			return getEnvironmentColor(R);
		}
		
		// Blur by sampling multiple directions
		float blur = roughness * 0.5;
		vec3 up = abs(R.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
		vec3 tangent = normalize(cross(up, R));
		vec3 bitangent = cross(R, tangent);
		
		// Sample in a cone pattern
		color += getEnvironmentColor(R) * 0.4;
		color += getEnvironmentColor(normalize(R + tangent * blur)) * 0.15;
		color += getEnvironmentColor(normalize(R - tangent * blur)) * 0.15;
		color += getEnvironmentColor(normalize(R + bitangent * blur)) * 0.15;
		color += getEnvironmentColor(normalize(R - bitangent * blur)) * 0.15;
		
		return color;
	}
	
	// Height-based shadow estimation
	float estimateShadow(vec3 worldPos) {
		float heightFade = smoothstep(0.0, 8.0, worldPos.y);
		return mix(0.35, 1.0, heightFade);
	}
	
	// Ambient occlusion approximation
	float approximateAO(vec3 N, vec3 worldPos) {
		float aoFromNormal = N.y * 0.5 + 0.5;
		aoFromNormal = pow(aoFromNormal, 0.4);
		float groundAO = smoothstep(0.0, 2.0, worldPos.y);
		groundAO = mix(0.4, 1.0, groundAO);
		return aoFromNormal * groundAO;
	}
`;

// Main object shader with enhanced PBR and reflections
const MAIN_VS = `
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
	varying vec3 vTangent;

	void main() {
		vec4 worldPos = uModel * vec4(aPosition, 1.0);
		vWorldPos = worldPos.xyz;
		vPosition = (uView * worldPos).xyz;
		vNormal = normalize((uNormalMatrix * vec4(aNormal, 0.0)).xyz);
		vColor = aColor;
		
		// Generate tangent for anisotropic shading (along track direction)
		vec3 up = vec3(0.0, 1.0, 0.0);
		vTangent = normalize(cross(vNormal, up));
		if (length(vTangent) < 0.1) {
			vTangent = normalize(cross(vNormal, vec3(1.0, 0.0, 0.0)));
		}
		
		gl_Position = uProjection * uView * worldPos;
	}
`;

const MAIN_FS = `
	precision highp float;

	varying vec3 vNormal;
	varying vec3 vPosition;
	varying vec3 vColor;
	varying vec3 vWorldPos;
	varying vec3 vTangent;

	uniform vec3 uCameraPos;
	uniform float uMetallic;
	uniform float uRoughness;
	uniform float uTime;
	uniform int uIsMarble;
	uniform int uIsGround;

	${COMMON_SHADER}

	// Fresnel with roughness consideration
	vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
		return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
	}
	
	vec3 fresnelSchlick(float cosTheta, vec3 F0) {
		return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
	}

	// GGX Distribution
	float distributionGGX(float NdotH, float roughness) {
		float a = roughness * roughness;
		float a2 = a * a;
		float denom = NdotH * NdotH * (a2 - 1.0) + 1.0;
		return a2 / (3.14159 * denom * denom + 0.0001);
	}
	
	// Anisotropic GGX for brushed metal
	float distributionGGXAnisotropic(float NdotH, float TdotH, float BdotH, float ax, float ay) {
		float d = TdotH * TdotH / (ax * ax) + BdotH * BdotH / (ay * ay) + NdotH * NdotH;
		return 1.0 / (3.14159 * ax * ay * d * d + 0.0001);
	}

	// Geometry function
	float geometrySmith(float NdotV, float NdotL, float roughness) {
		float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
		float ggx1 = NdotV / (NdotV * (1.0 - k) + k);
		float ggx2 = NdotL / (NdotL * (1.0 - k) + k);
		return ggx1 * ggx2;
	}

	void main() {
		vec3 N = normalize(vNormal);
		vec3 V = normalize(uCameraPos - vWorldPos);
		vec3 R = reflect(-V, N);
		vec3 T = normalize(vTangent);
		vec3 B = normalize(cross(N, T));
		
		vec3 baseColor = vColor;
		float metallic = uMetallic;
		float roughness = uRoughness;
		
		// Marble swirl pattern
		if (uIsMarble == 1) {
			float swirl = sin(vWorldPos.x * 25.0 + vWorldPos.y * 20.0 + vWorldPos.z * 15.0 + uTime * 2.0) * 0.5 + 0.5;
			float swirl2 = sin(vWorldPos.x * 10.0 - vWorldPos.z * 12.0 + uTime * 1.5) * 0.5 + 0.5;
			// Green marble swirl pattern
			baseColor = mix(baseColor, vec3(0.05, 0.25, 0.1), swirl * 0.35);
			baseColor = mix(baseColor, vec3(0.15, 0.5, 0.2), pow(swirl, 4.0) * 0.2);
			baseColor = mix(baseColor, vec3(0.02, 0.15, 0.05), swirl2 * 0.15);
		}

		// Metal F0 - use base color for metals
		vec3 F0 = mix(vec3(0.04), baseColor, metallic);
		
		// Shadow and AO
		float shadow = estimateShadow(vWorldPos);
		float ao = approximateAO(N, vWorldPos);
		
		// === Direct Lighting (Sun) ===
		vec3 L = SUN_DIR;
		vec3 H = normalize(V + L);
		
		float NdotL = max(dot(N, L), 0.0);
		float NdotH = max(dot(N, H), 0.0);
		float NdotV = max(dot(N, V), 0.001);
		float HdotV = max(dot(H, V), 0.0);
		
		// Anisotropic parameters for metals (brushed metal look)
		float TdotH = dot(T, H);
		float BdotH = dot(B, H);
		float anisotropy = metallic * 0.7; // More anisotropy for metals
		float ax = max(0.001, roughness * (1.0 + anisotropy));
		float ay = max(0.001, roughness * (1.0 - anisotropy * 0.5));
		
		// Use anisotropic distribution for high metallic surfaces
		float D;
		if (metallic > 0.5) {
			D = distributionGGXAnisotropic(NdotH, TdotH, BdotH, ax, ay);
		} else {
			D = distributionGGX(NdotH, roughness);
		}
		
		vec3 F = fresnelSchlick(HdotV, F0);
		float G = geometrySmith(NdotV, NdotL, roughness);
		
		vec3 specular = (D * G * F) / (4.0 * NdotV * NdotL + 0.001);
		vec3 kD = (1.0 - F) * (1.0 - metallic);
		
		vec3 sunLight = SUN_COLOR * 2.0;
		vec3 directLight = (kD * baseColor / 3.14159 + specular) * sunLight * NdotL * shadow;
		
		// === Environment Reflections (IBL approximation) ===
		vec3 F_env = fresnelSchlickRoughness(NdotV, F0, roughness);
		
		// Sample environment with roughness-based blur
		vec3 envReflection = sampleEnvironmentBlurred(R, roughness);
		
		// Metallic surfaces get more reflection
		float envStrength = mix(0.15, 0.9, metallic) * (1.0 - roughness * 0.7);
		vec3 reflectionColor = envReflection * F_env * envStrength;
		
		// Add secondary reflection bounce for extra realism on metals
		if (metallic > 0.5) {
			vec3 R2 = reflect(R, N);
			vec3 secondBounce = sampleEnvironmentBlurred(R2, roughness + 0.3) * 0.15;
			reflectionColor += secondBounce * F_env * metallic;
		}
		
		// === Fill Lights ===
		vec3 fillDir = normalize(vec3(-0.5, 0.3, -0.4));
		float fillNdotL = max(dot(N, fillDir), 0.0);
		vec3 fillLight = SKY_ZENITH * 0.2 * fillNdotL * baseColor * (1.0 - metallic * 0.5);
		
		vec3 backDir = normalize(vec3(0.0, 0.2, -1.0));
		float backNdotL = max(dot(N, backDir), 0.0);
		vec3 backLight = vec3(0.12, 0.15, 0.2) * backNdotL * baseColor;
		
		// === Ambient/Diffuse IBL ===
		float hemisphere = N.y * 0.5 + 0.5;
		vec3 ambientColor = mix(GROUND_COLOR * 0.3, SKY_ZENITH * 0.2, hemisphere);
		vec3 ambient = baseColor * ambientColor * ao * (1.0 - metallic * 0.8);
		
		// === Combine ===
		vec3 result = directLight + reflectionColor + fillLight + backLight + ambient;
		
		// Rim lighting - stronger on metals for that chrome look
		float rim = 1.0 - NdotV;
		rim = pow(rim, 3.0);
		float rimStrength = mix(0.05, 0.25, metallic);
		result += rim * getSkyColor(R) * rimStrength;
		
		// Extra rim glow for marble
		if (uIsMarble == 1) {
			result += rim * vec3(0.2, 0.5, 0.25) * 0.25;
		}
		
		// === REFLECTIVE FLOOR WITH PLATFORM ===
		if (uIsGround == 1) {
			float distFromCenter = length(vWorldPos.xz);
			float platformRadius = 40.0;
			
			// Floor material properties
			vec3 floorAlbedo = vec3(0.15, 0.15, 0.17);
			float floorMetallic = 0.0;
			float floorRoughness = 0.3;
			
			// Grid pattern modifies albedo
			float gridScale = 2.0;
			float gridLineWidth = 0.02;
			float gridX = abs(fract(vWorldPos.x / gridScale) - 0.5);
			float gridZ = abs(fract(vWorldPos.z / gridScale) - 0.5);
			float grid = 1.0 - smoothstep(gridLineWidth, gridLineWidth + 0.015, min(gridX, gridZ));
			
			float majorGridScale = 10.0;
			float majorGridX = abs(fract(vWorldPos.x / majorGridScale) - 0.5);
			float majorGridZ = abs(fract(vWorldPos.z / majorGridScale) - 0.5);
			float majorGrid = 1.0 - smoothstep(gridLineWidth * 2.0, gridLineWidth * 2.0 + 0.015, min(majorGridX, majorGridZ));
			
			vec3 gridColor = vec3(0.25, 0.27, 0.32);
			floorAlbedo = mix(floorAlbedo, gridColor, grid * 0.4 + majorGrid * 0.6);
			
			// Use same PBR lighting as other objects
			vec3 floorN = vec3(0.0, 1.0, 0.0);
			vec3 floorR = reflect(-V, floorN);
			float floorNdotV = max(dot(floorN, V), 0.0);
			float floorNdotL = max(dot(floorN, SUN_DIR), 0.0);
			vec3 floorH = normalize(V + SUN_DIR);
			float floorNdotH = max(dot(floorN, floorH), 0.0);
			
			// PBR calculations
			vec3 floorF0 = mix(vec3(0.04), floorAlbedo, floorMetallic);
			vec3 floorF = fresnelSchlickRoughness(floorNdotV, floorF0, floorRoughness);
			float floorD = distributionGGX(floorNdotH, floorRoughness);
			float floorG = geometrySmith(floorNdotV, floorNdotL, floorRoughness);
			
			// Specular
			vec3 floorSpec = (floorD * floorG * floorF) / (4.0 * floorNdotV * floorNdotL + 0.0001);
			
			// Diffuse
			vec3 floorKd = (1.0 - floorF) * (1.0 - floorMetallic);
			vec3 floorDiffuse = floorKd * floorAlbedo / 3.14159;
			
			// Direct lighting from sun
			vec3 floorDirect = (floorDiffuse + floorSpec) * SUN_COLOR * floorNdotL * 2.5;
			
			// Ambient/IBL
			vec3 floorAmbient = sampleEnvironmentBlurred(floorN, 0.8) * floorAlbedo * 0.3;
			vec3 floorReflection = sampleEnvironmentBlurred(floorR, floorRoughness);
			float floorFresnel = pow(1.0 - floorNdotV, 3.0);
			floorAmbient += floorReflection * mix(0.2, 0.7, floorFresnel);
			
			vec3 floorResult = floorDirect + floorAmbient;
			
			// Fade to dark at edges
			float edgeFade = smoothstep(platformRadius + 5.0, platformRadius - 5.0, distFromCenter);
			vec3 voidColor = vec3(0.02, 0.02, 0.025);
			floorResult = mix(voidColor, floorResult, edgeFade);
			
			// Subtle edge glow
			float edgeGlow = smoothstep(platformRadius + 1.0, platformRadius - 2.0, distFromCenter) 
			               * smoothstep(platformRadius - 8.0, platformRadius - 2.0, distFromCenter);
			floorResult += vec3(0.08, 0.12, 0.2) * edgeGlow * 0.3;
			
			result = floorResult;
		} else {
			// Apply AO only to non-ground objects
			result *= mix(0.6, 1.0, ao);
		}
		
		// Atmospheric fog (less on ground)
		float dist = length(vPosition);
		float fogFactor = 1.0 - exp(-0.0015 * dist * dist);
		vec3 fogColor = mix(SKY_HORIZON, SKY_ZENITH, 0.2) * 0.6;
		float fogAmount = (uIsGround == 1) ? 0.2 : 0.6;
		result = mix(result, fogColor, fogFactor * fogAmount);
		
		// Tone mapping (ACES)
		vec3 x = result;
		result = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
		
		// Contrast
		result = pow(result, vec3(1.08));
		
		// Gamma
		result = pow(result, vec3(1.0/2.2));
		
		// Screen vignette
		vec2 screenUV = gl_FragCoord.xy / vec2(1920.0, 1080.0);
		float screenVignette = 1.0 - dot(screenUV - 0.5, screenUV - 0.5) * 0.25;
		result *= screenVignette;
		
		gl_FragColor = vec4(result, 1.0);
	}
`;

// Sky shader
const SKY_VS = `
	attribute vec3 aPosition;
	varying vec3 vDirection;
	uniform mat4 uProjection;
	uniform mat4 uView;
	
	void main() {
		vDirection = aPosition;
		mat4 viewNoTranslation = uView;
		viewNoTranslation[3] = vec4(0.0, 0.0, 0.0, 1.0);
		vec4 pos = uProjection * viewNoTranslation * vec4(aPosition * 100.0, 1.0);
		gl_Position = pos.xyww;
	}
`;

const SKY_FS = `
	precision highp float;
	varying vec3 vDirection;
	uniform float uTime;
	
	${COMMON_SHADER}
	
	void main() {
		vec3 dir = normalize(vDirection);
		vec3 color;
		
		if (dir.y < 0.0) {
			// Below horizon
			vec3 groundReflect = GROUND_COLOR * 0.25;
			color = mix(SKY_HORIZON * 0.35, groundReflect, smoothstep(0.0, -0.5, dir.y));
		} else {
			color = getSkyColor(dir);
		}
		
		// Subtle noise
		float noise = fract(sin(dot(dir.xy, vec2(12.9898, 78.233))) * 43758.5453);
		color += (noise - 0.5) * 0.012;
		
		// Tone mapping
		color = (color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14);
		color = pow(color, vec3(1.0/2.2));
		
		gl_FragColor = vec4(color, 1.0);
	}
`;

// Particle shader
const PARTICLE_VS = `
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

const PARTICLE_FS = `
	precision mediump float;
	varying float vLife;
	varying vec3 vColor;
	
	void main() {
		vec2 coord = gl_PointCoord - vec2(0.5);
		float dist = length(coord);
		if (dist > 0.5) discard;
		
		float alpha = smoothstep(0.5, 0.1, dist) * vLife;
		vec3 color = vColor * (1.0 + vLife * 0.3);
		gl_FragColor = vec4(color, alpha * 0.6);
	}
`;

export class Renderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', { antialias: true, alpha: false });
		if (!this.gl) throw new Error('WebGL not supported');

		this.resize();
		window.addEventListener('resize', () => this.resize());

		this.initShaders();
		this.initMatrices();
		this.initSkybox();
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

		// Main program
		this.program = this.createProgram(MAIN_VS, MAIN_FS);
		this.locations = {
			aPosition: gl.getAttribLocation(this.program, 'aPosition'),
			aNormal: gl.getAttribLocation(this.program, 'aNormal'),
			aColor: gl.getAttribLocation(this.program, 'aColor'),
			uProjection: gl.getUniformLocation(this.program, 'uProjection'),
			uView: gl.getUniformLocation(this.program, 'uView'),
			uModel: gl.getUniformLocation(this.program, 'uModel'),
			uNormalMatrix: gl.getUniformLocation(this.program, 'uNormalMatrix'),
			uCameraPos: gl.getUniformLocation(this.program, 'uCameraPos'),
			uMetallic: gl.getUniformLocation(this.program, 'uMetallic'),
			uRoughness: gl.getUniformLocation(this.program, 'uRoughness'),
			uTime: gl.getUniformLocation(this.program, 'uTime'),
			uIsMarble: gl.getUniformLocation(this.program, 'uIsMarble'),
			uIsGround: gl.getUniformLocation(this.program, 'uIsGround')
		};

		// Sky program
		this.skyProgram = this.createProgram(SKY_VS, SKY_FS);
		this.skyLocations = {
			aPosition: gl.getAttribLocation(this.skyProgram, 'aPosition'),
			uProjection: gl.getUniformLocation(this.skyProgram, 'uProjection'),
			uView: gl.getUniformLocation(this.skyProgram, 'uView'),
			uTime: gl.getUniformLocation(this.skyProgram, 'uTime')
		};

		// Particle program
		this.particleProgram = this.createProgram(PARTICLE_VS, PARTICLE_FS);
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
			console.error('Shader link error:', gl.getProgramInfoLog(program));
			throw new Error('Shader link error');
		}
		return program;
	}

	compileShader(type, source) {
		const gl = this.gl;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error('Shader error:', gl.getShaderInfoLog(shader));
			throw new Error('Shader compile error');
		}
		return shader;
	}

	initMatrices() {
		this.projection = mat4.create();
		this.view = mat4.create();
		this.model = mat4.create();
		this.normalMatrix = mat4.create();
	}

	initSkybox() {
		const gl = this.gl;

		const positions = new Float32Array([
			-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1,
			1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, -1, -1,
			-1, -1, -1, 1, -1, 1, 1, -1, 1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1
		]);

		const indices = new Uint16Array([
			0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 8, 10, 9, 8, 11, 10, 12, 13, 14, 12, 14, 15, 16, 17,
			18, 16, 18, 19, 20, 22, 21, 20, 23, 22
		]);

		this.skyboxPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.skyboxPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

		this.skyboxIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyboxIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	}

	setCamera(position, target) {
		const aspect = this.canvas.width / this.canvas.height;
		mat4.perspective(this.projection, Math.PI / 4, aspect, 0.1, 500);
		mat4.lookAt(this.view, position, target, [0, 1, 0]);
		this.cameraPos = position;
	}

	clear() {
		const gl = this.gl;
		gl.clearColor(0.22, 0.4, 0.75, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
	}

	drawSky() {
		const gl = this.gl;

		gl.useProgram(this.skyProgram);
		gl.depthFunc(gl.LEQUAL);
		gl.disable(gl.CULL_FACE);

		gl.uniformMatrix4fv(this.skyLocations.uProjection, false, this.projection);
		gl.uniformMatrix4fv(this.skyLocations.uView, false, this.view);
		gl.uniform1f(this.skyLocations.uTime, this.time);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.skyboxPositionBuffer);
		gl.enableVertexAttribArray(this.skyLocations.aPosition);
		gl.vertexAttribPointer(this.skyLocations.aPosition, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyboxIndexBuffer);
		gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

		gl.depthFunc(gl.LESS);
		gl.enable(gl.CULL_FACE);
	}

	beginMainPass() {
		const gl = this.gl;
		gl.useProgram(this.program);
		gl.uniformMatrix4fv(this.locations.uProjection, false, this.projection);
		gl.uniformMatrix4fv(this.locations.uView, false, this.view);
		gl.uniform3fv(this.locations.uCameraPos, this.cameraPos);
		gl.uniform1f(this.locations.uTime, this.time);
	}

	drawMesh(
		mesh,
		modelMatrix,
		metallic = 0.0,
		roughness = 0.5,
		isMarble = false,
		isGround = false
	) {
		const gl = this.gl;

		mat4.copy(this.model, modelMatrix);
		mat4.invert(this.normalMatrix, this.model);
		mat4.transpose(this.normalMatrix, this.normalMatrix);

		gl.uniformMatrix4fv(this.locations.uModel, false, this.model);
		gl.uniformMatrix4fv(this.locations.uNormalMatrix, false, this.normalMatrix);
		gl.uniform1f(this.locations.uMetallic, metallic);
		gl.uniform1f(this.locations.uRoughness, roughness);
		gl.uniform1i(this.locations.uIsMarble, isMarble ? 1 : 0);
		gl.uniform1i(this.locations.uIsGround, isGround ? 1 : 0);

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
