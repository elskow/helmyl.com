import {
	SHADER_NONE,
	SHADER_COUNT,
	SHADER_NAMES,
	vertexShaderSource,
	fragmentShaders
} from './shaders.js';

const FB_SIZE = 160 * 144;

let canvas = null;
let gl = null;
let ctx = null;
let glProgram = null;
let glTexture = null;
let textureData = null;
let cachedImageData = null;
let useWebGL = true;

let currentShader = SHADER_NONE;
let uResolutionLoc = null;
let uTimeLoc = null;
let shaderStartTime = 0;

export function getRendererState() {
	return {
		canvas,
		gl,
		ctx,
		glProgram,
		glTexture,
		textureData,
		cachedImageData,
		useWebGL,
		currentShader
	};
}

export function setCanvas(canvasElement) {
	canvas = canvasElement;
}

export function getCurrentShader() {
	return currentShader;
}

export function initWebGL() {
	if (!canvas) {
		canvas = document.getElementById('screen');
	}
	gl = canvas.getContext('webgl', { antialias: false, alpha: false });

	if (!gl) {
		useWebGL = false;
		initCanvas2D();
		return false;
	}

	const savedShader = localStorage.getItem('gbemu-shader');
	if (savedShader !== null) {
		currentShader = parseInt(savedShader, 10);
		if (isNaN(currentShader) || currentShader < 0 || currentShader >= SHADER_COUNT) {
			currentShader = SHADER_NONE;
		}
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
	gl.viewport(0, 0, canvas.width, canvas.height);

	updateShaderUniforms();

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	shaderStartTime = performance.now();
	return true;
}

export function buildShaderProgram() {
	if (!gl) return;

	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);

	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		return;
	}

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaders[currentShader]);
	gl.compileShader(fragmentShader);

	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		return;
	}

	if (glProgram) {
		gl.deleteProgram(glProgram);
	}
	glProgram = gl.createProgram();
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);
	gl.linkProgram(glProgram);

	if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
		return;
	}

	gl.useProgram(glProgram);

	uResolutionLoc = gl.getUniformLocation(glProgram, 'u_resolution');
	uTimeLoc = gl.getUniformLocation(glProgram, 'u_time');

	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
}

export function setupVertexAttributes() {
	if (!gl || !glProgram) return;

	const positionLoc = gl.getAttribLocation(glProgram, 'a_position');
	const texCoordLoc = gl.getAttribLocation(glProgram, 'a_texCoord');

	gl.enableVertexAttribArray(positionLoc);
	gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(texCoordLoc);
	gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);
}

export function updateShaderUniforms() {
	if (!gl || !glProgram) return;

	if (uResolutionLoc) {
		gl.uniform2f(uResolutionLoc, 160.0, 144.0);
	}

	if (uTimeLoc) {
		const time = (performance.now() - shaderStartTime) / 1000.0;
		gl.uniform1f(uTimeLoc, time);
	}
}

export function cycleShader(worker = null, useOffscreenCanvas = false) {
	currentShader = (currentShader + 1) % SHADER_COUNT;
	localStorage.setItem('gbemu-shader', currentShader.toString());

	if (useWebGL && gl) {
		buildShaderProgram();
		setupVertexAttributes();
		updateShaderUniforms();
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
	}

	if (useOffscreenCanvas && worker) {
		worker.postMessage({ type: 'set-shader', data: { shader: currentShader } });
	}

	const shaderBtn = document.getElementById('shader-btn');
	if (shaderBtn) {
		shaderBtn.title = `Shader: ${SHADER_NAMES[currentShader]}`;
	}

	return SHADER_NAMES[currentShader];
}

export function initCanvas2D() {
	if (!canvas) {
		canvas = document.getElementById('screen');
	}
	ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = '#0f380f';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	useWebGL = false;
}

export function renderWebGLFromShared(sharedFramebuffer, offset) {
	if (!gl || !textureData) return;

	for (let i = 0, j = 0; i < FB_SIZE; i++, j += 4) {
		const color = sharedFramebuffer[offset + i];
		textureData[j] = (color >> 16) & 0xff;
		textureData[j + 1] = (color >> 8) & 0xff;
		textureData[j + 2] = color & 0xff;
		textureData[j + 3] = 255;
	}
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 160, 144, gl.RGBA, gl.UNSIGNED_BYTE, textureData);
	updateShaderUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export function renderCanvas2DFromShared(sharedFramebuffer, offset) {
	if (!ctx) return;

	if (!cachedImageData) {
		cachedImageData = ctx.createImageData(160, 144);
	}
	const data = cachedImageData.data;
	for (let i = 0, j = 0; i < FB_SIZE; i++, j += 4) {
		const color = sharedFramebuffer[offset + i];
		data[j] = (color >> 16) & 0xff;
		data[j + 1] = (color >> 8) & 0xff;
		data[j + 2] = color & 0xff;
		data[j + 3] = 255;
	}
	ctx.putImageData(cachedImageData, 0, 0);
}

export function renderFrame(fb) {
	if (!fb) return;

	if (useWebGL && gl) {
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
	} else if (ctx) {
		if (!cachedImageData) {
			cachedImageData = ctx.createImageData(160, 144);
		}
		const data = cachedImageData.data;
		for (let i = 0, j = 0; i < FB_SIZE; i++, j += 4) {
			const color = fb[i];
			data[j] = (color >> 16) & 0xff;
			data[j + 1] = (color >> 8) & 0xff;
			data[j + 2] = color & 0xff;
			data[j + 3] = 255;
		}
		ctx.putImageData(cachedImageData, 0, 0);
	}
}

export function isUsingWebGL() {
	return useWebGL && gl !== null;
}

export function getGL() {
	return gl;
}

export function getContext2D() {
	return ctx;
}
