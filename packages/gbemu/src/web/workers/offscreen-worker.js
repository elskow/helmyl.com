const workerUrl = self.location.href;
const baseUrl = workerUrl.substring(0, workerUrl.lastIndexOf('/'));
const wasmJsUrl = baseUrl.replace(/\/workers$/, '') + '/gbemu.js';
importScripts(wasmJsUrl);

let emu = null;
let running = false;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

let sharedAudio = null;
let sharedControl = null;

let audioWritePos = 0;
const AUDIO_BUFFER_SIZE = 16384;
const FB_SIZE = 160 * 144;

const CTRL_RUNNING = 0;
const CTRL_FRAME_READY = 1;
const CTRL_AUDIO_WRITE_POS = 2;
const CTRL_BUTTONS = 3;
const CTRL_COMMAND = 4;

const CMD_NONE = 0;
const CMD_RESET = 1;
const CMD_PAUSE = 2;
const CMD_RESUME = 3;

let offscreen = null;
let gl = null;
let glProgram = null;
let glTexture = null;
let textureData = null;
let uResolutionLoc = null;
let uTimeLoc = null;
let shaderStartTime = 0;

let emulationStartTime = 0;
let totalFramesRun = 0;
let frameCount = 0;
let fpsReportTime = 0;

const SHADER_NONE = 0;
const SHADER_LCD = 1;
const SHADER_CRT_SCANLINES = 2;
const SHADER_CRT_CURVED = 3;
let currentShader = SHADER_NONE;

const vertexShaderSource = `
	attribute vec2 a_position;
	attribute vec2 a_texCoord;
	varying vec2 v_texCoord;
	void main() {
		gl_Position = vec4(a_position, 0.0, 1.0);
		v_texCoord = a_texCoord;
	}
`;

const fragmentShaderNone = `
	precision mediump float;
	uniform sampler2D u_texture;
	varying vec2 v_texCoord;
	void main() {
		gl_FragColor = texture2D(u_texture, v_texCoord);
	}
`;

const fragmentShaderLCD = `
	precision mediump float;
	uniform sampler2D u_texture;
	uniform vec2 u_resolution;
	varying vec2 v_texCoord;
	
	void main() {
		vec4 color = texture2D(u_texture, v_texCoord);
		vec2 pixelPos = v_texCoord * u_resolution;
		vec2 subPixel = fract(pixelPos * 3.0);
		float gridX = smoothstep(0.0, 0.1, subPixel.x) * smoothstep(1.0, 0.9, subPixel.x);
		float gridY = smoothstep(0.0, 0.1, subPixel.y) * smoothstep(1.0, 0.9, subPixel.y);
		float grid = gridX * gridY;
		vec3 subpixelMask = vec3(1.0);
		float subX = fract(pixelPos.x * 3.0);
		if (subX < 0.33) {
			subpixelMask = vec3(1.1, 0.9, 0.9);
		} else if (subX < 0.66) {
			subpixelMask = vec3(0.9, 1.1, 0.9);
		} else {
			subpixelMask = vec3(0.9, 0.9, 1.1);
		}
		vec3 finalColor = color.rgb * grid * 0.85 + color.rgb * 0.15;
		finalColor *= subpixelMask;
		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

const fragmentShaderCRTScanlines = `
	precision mediump float;
	uniform sampler2D u_texture;
	uniform vec2 u_resolution;
	uniform float u_time;
	varying vec2 v_texCoord;
	
	void main() {
		vec2 uv = v_texCoord;
		vec4 color = texture2D(u_texture, uv);
		float scanline = sin(uv.y * u_resolution.y * 3.14159) * 0.5 + 0.5;
		scanline = pow(scanline, 0.3) * 0.3 + 0.7;
		vec2 pixelSize = 1.0 / u_resolution;
		vec4 glow = texture2D(u_texture, uv + vec2(pixelSize.x, 0.0)) * 0.25;
		glow += texture2D(u_texture, uv - vec2(pixelSize.x, 0.0)) * 0.25;
		glow += color * 0.5;
		vec3 finalColor = mix(color.rgb, glow.rgb, 0.2);
		finalColor *= scanline;
		vec2 vignetteUV = uv * (1.0 - uv.yx);
		float vignette = vignetteUV.x * vignetteUV.y * 15.0;
		vignette = pow(vignette, 0.15);
		finalColor *= vignette;
		finalColor *= 1.15;
		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

const fragmentShaderCRTCurved = `
	precision mediump float;
	uniform sampler2D u_texture;
	uniform vec2 u_resolution;
	uniform float u_time;
	varying vec2 v_texCoord;
	
	vec2 curveUV(vec2 uv) {
		uv = uv * 2.0 - 1.0;
		vec2 offset = abs(uv.yx) / vec2(6.0, 4.0);
		uv = uv + uv * offset * offset;
		uv = uv * 0.5 + 0.5;
		return uv;
	}
	
	void main() {
		vec2 uv = curveUV(v_texCoord);
		if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			return;
		}
		vec4 color = texture2D(u_texture, uv);
		float aberration = length(v_texCoord - 0.5) * 0.01;
		float r = texture2D(u_texture, uv + vec2(aberration, 0.0)).r;
		float b = texture2D(u_texture, uv - vec2(aberration, 0.0)).b;
		color.r = r;
		color.b = b;
		float scanline = sin(uv.y * u_resolution.y * 3.14159) * 0.5 + 0.5;
		scanline = pow(scanline, 0.25) * 0.25 + 0.75;
		float pixelLine = sin(uv.x * u_resolution.x * 3.14159) * 0.5 + 0.5;
		pixelLine = pow(pixelLine, 0.5) * 0.1 + 0.9;
		vec3 finalColor = color.rgb * scanline * pixelLine;
		vec2 vignetteUV = uv * (1.0 - uv.yx);
		float vignette = vignetteUV.x * vignetteUV.y * 20.0;
		vignette = pow(vignette, 0.2);
		finalColor *= vignette;
		finalColor += color.rgb * 0.05;
		finalColor *= 1.2;
		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

const fragmentShaders = [
	fragmentShaderNone,
	fragmentShaderLCD,
	fragmentShaderCRTScanlines,
	fragmentShaderCRTCurved
];

function buildShaderProgram() {
	if (!gl) return;

	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaders[currentShader]);
	gl.compileShader(fragmentShader);

	if (glProgram) {
		gl.deleteProgram(glProgram);
	}
	glProgram = gl.createProgram();
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);
	gl.linkProgram(glProgram);
	gl.useProgram(glProgram);

	uResolutionLoc = gl.getUniformLocation(glProgram, 'u_resolution');
	uTimeLoc = gl.getUniformLocation(glProgram, 'u_time');

	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
}

function setupVertexAttributes() {
	if (!gl || !glProgram) return;
	const positionLoc = gl.getAttribLocation(glProgram, 'a_position');
	const texCoordLoc = gl.getAttribLocation(glProgram, 'a_texCoord');
	gl.enableVertexAttribArray(positionLoc);
	gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(texCoordLoc);
	gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);
}

function updateShaderUniforms() {
	if (!gl || !glProgram) return;
	if (uResolutionLoc) {
		gl.uniform2f(uResolutionLoc, 160.0, 144.0);
	}
	if (uTimeLoc) {
		const time = (performance.now() - shaderStartTime) / 1000.0;
		gl.uniform1f(uTimeLoc, time);
	}
}

function initWebGL(canvas) {
	offscreen = canvas;
	gl = offscreen.getContext('webgl', { antialias: false, alpha: false });

	if (!gl) {
		postMessage({ type: 'error', message: 'WebGL not available in worker' });
		return false;
	}

	buildShaderProgram();

	const positions = new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0]);
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

	setupVertexAttributes();

	glTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, glTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	textureData = new Uint8Array(160 * 144 * 4);
	for (let i = 0; i < 160 * 144; i++) {
		textureData[i * 4] = 0x0f;
		textureData[i * 4 + 1] = 0x38;
		textureData[i * 4 + 2] = 0x0f;
		textureData[i * 4 + 3] = 255;
	}
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 160, 144, 0, gl.RGBA, gl.UNSIGNED_BYTE, textureData);
	gl.viewport(0, 0, offscreen.width, offscreen.height);
	updateShaderUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	shaderStartTime = performance.now();
	return true;
}

function renderFrame(fb) {
	if (!gl || !fb) return;

	for (let i = 0, j = 0; i < FB_SIZE; i++, j += 4) {
		const color = fb[i];
		textureData[j] = (color >> 16) & 0xff;
		textureData[j + 1] = (color >> 8) & 0xff;
		textureData[j + 2] = color & 0xff;
		textureData[j + 3] = 255;
	}
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 160, 144, gl.RGBA, gl.UNSIGNED_BYTE, textureData);
	updateShaderUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

async function init() {
	try {
		emu = await createGBEmu();
		emu.init();
		postMessage({ type: 'ready' });
	} catch (e) {
		postMessage({ type: 'error', message: 'Failed to initialize WASM: ' + e.message });
	}
}

function loadROM(romData) {
	if (!emu) {
		postMessage({ type: 'error', message: 'Emulator not initialized' });
		return false;
	}

	const data = new Uint8Array(romData);
	const size = data.length;

	const ptr = emu.allocateROMBuffer(size);
	if (!ptr) {
		postMessage({ type: 'error', message: 'Failed to allocate ROM buffer' });
		return false;
	}

	emu.HEAPU8.set(data, ptr);

	if (emu.loadROMFromBuffer(size)) {
		postMessage({ type: 'rom-loaded', size: size });
		return true;
	} else {
		postMessage({ type: 'error', message: 'Invalid ROM' });
		return false;
	}
}

function emulationLoop() {
	if (!running || !emu) return;

	const now = performance.now();
	const expectedFrames = Math.floor((now - emulationStartTime) / frameInterval);

	if (sharedControl) {
		const cmd = Atomics.load(sharedControl, CTRL_COMMAND);
		if (cmd !== CMD_NONE) {
			Atomics.store(sharedControl, CTRL_COMMAND, CMD_NONE);
			handleCommand(cmd);
			if (!running) return;
		}

		const buttons = Atomics.load(sharedControl, CTRL_BUTTONS);
		updateButtons(buttons);
	}

	if (totalFramesRun < expectedFrames) {
		emu.runFrame();
		totalFramesRun++;

		const fb = emu.getFramebuffer();
		renderFrame(fb);

		if (sharedAudio) {
			const sampleCount = emu.getAudioSamplesCount();
			if (sampleCount > 0) {
				const audioBuffer = emu.getAudioBuffer();
				const samplesToWrite = sampleCount * 2;

				for (let i = 0; i < samplesToWrite; i++) {
					sharedAudio[audioWritePos] = audioBuffer[i];
					audioWritePos = (audioWritePos + 1) % AUDIO_BUFFER_SIZE;
				}

				Atomics.store(sharedControl, CTRL_AUDIO_WRITE_POS, audioWritePos);
			}
		}

		frameCount++;
		if (now - fpsReportTime >= 1000) {
			postMessage({ type: 'fps', fps: frameCount });
			frameCount = 0;
			fpsReportTime = now;
		}
	}

	const nextFrameTime = emulationStartTime + (totalFramesRun + 1) * frameInterval;
	const delay = Math.max(1, nextFrameTime - performance.now());
	setTimeout(emulationLoop, delay);
}

function handleCommand(cmd) {
	switch (cmd) {
		case CMD_RESET:
			if (emu) emu.reset();
			break;
		case CMD_PAUSE:
			running = false;
			postMessage({ type: 'paused' });
			break;
		case CMD_RESUME:
			if (!running) {
				running = true;
				emulationStartTime = performance.now();
				totalFramesRun = 0;
				emulationLoop();
				postMessage({ type: 'resumed' });
			}
			break;
	}
}

function updateButtons(bitmask) {
	if (!emu) return;

	const buttons = [
		emu.BUTTON_A,
		emu.BUTTON_B,
		emu.BUTTON_SELECT,
		emu.BUTTON_START,
		emu.BUTTON_RIGHT,
		emu.BUTTON_LEFT,
		emu.BUTTON_UP,
		emu.BUTTON_DOWN
	];

	for (let i = 0; i < 8; i++) {
		emu.setButton(buttons[i], (bitmask & (1 << i)) !== 0);
	}
}

function start() {
	if (running) return;
	running = true;
	emulationStartTime = performance.now();
	totalFramesRun = 0;
	fpsReportTime = emulationStartTime;
	frameCount = 0;

	// Reset audio write position to prevent latency from stale buffer data
	audioWritePos = 0;
	if (sharedControl) {
		Atomics.store(sharedControl, CTRL_AUDIO_WRITE_POS, 0);
	}

	emulationLoop();
}

function stop() {
	running = false;
}

function setShader(shaderIndex) {
	currentShader = shaderIndex;
	if (gl) {
		buildShaderProgram();
		setupVertexAttributes();
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		updateShaderUniforms();
	}
}

self.onmessage = function (e) {
	const { type, data } = e.data;

	switch (type) {
		case 'init':
			init();
			break;
		case 'set-offscreen-canvas':
			if (initWebGL(data.canvas)) {
				postMessage({ type: 'offscreen-ready' });
			}
			break;
		case 'load-rom':
			if (loadROM(data.rom)) {
				start();
			}
			break;
		case 'set-shared-memory':
			sharedAudio = new Float32Array(data.audio);
			sharedControl = new Int32Array(data.control);
			if (data.shader !== undefined) {
				currentShader = data.shader;
			}
			postMessage({ type: 'shared-memory-ready' });
			break;
		case 'set-shader':
			setShader(data.shader);
			break;
		case 'start':
			start();
			break;
		case 'stop':
			stop();
			break;
		case 'reset':
			if (emu) {
				emu.reset();
				postMessage({ type: 'reset-complete' });
			}
			break;
		case 'get-cpu-state':
			if (emu) {
				postMessage({ type: 'cpu-state', state: emu.getCPUState() });
			}
			break;
	}
};
