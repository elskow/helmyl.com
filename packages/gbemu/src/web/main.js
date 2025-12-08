import gamesList from '../../roms/games.json';
import { SHADER_NONE, SHADER_COUNT, SHADER_NAMES } from './shaders.js';
import * as Renderer from './renderer.js';
import * as Audio from './audio.js';

let useWorkerMode = false;
let useOffscreenCanvas = false;

let worker = null;
let sharedFramebufferSAB = null;
let sharedAudioSAB = null;
let sharedControlSAB = null;
let sharedFramebuffer = null;
let sharedAudio = null;
let sharedControl = null;

let emu = null;
let offscreenCanvas = null;

const FB_SIZE = 160 * 144;
const AUDIO_BUFFER_SIZE = 16384;
const CTRL_RUNNING = 0;
const CTRL_FRAME_READY = 1;
const CTRL_BUTTONS = 3;
const CTRL_COMMAND = 4;
const CMD_NONE = 0;
const CMD_RESET = 1;
const CMD_PAUSE = 2;
const CMD_RESUME = 3;

let canvas;
let running = false;
let lastRenderedBuffer = -1;
let animationId = null;
let fpsDisplay;
let statusDisplay;
let frameCount = 0;
let fpsUpdateTime = 0;

let selectedGameIndex = 0;
let gameItems = [];
let isMenuActive = true;

let overlay;
let loadBtn;
let resetBtn;
let fullscreenBtn;
let shaderBtn;
let romInput;
let powerLed;
let speaker;
let gameboy;
let backToMenuBtn;

const keyMap = {
	KeyZ: 0,
	KeyX: 1,
	Enter: 3,
	ShiftLeft: 2,
	ShiftRight: 2,
	ArrowRight: 4,
	ArrowLeft: 5,
	ArrowUp: 6,
	ArrowDown: 7
};

const keyMapFallback = {
	KeyZ: 'BUTTON_A',
	KeyX: 'BUTTON_B',
	Enter: 'BUTTON_START',
	ShiftLeft: 'BUTTON_SELECT',
	ShiftRight: 'BUTTON_SELECT',
	ArrowRight: 'BUTTON_RIGHT',
	ArrowLeft: 'BUTTON_LEFT',
	ArrowUp: 'BUTTON_UP',
	ArrowDown: 'BUTTON_DOWN'
};

let buttonState = 0;

const screenButtonMap = {
	a: 0,
	b: 1,
	select: 2,
	start: 3,
	right: 4,
	left: 5,
	up: 6,
	down: 7
};

const screenButtonMapFallback = {
	a: 'BUTTON_A',
	b: 'BUTTON_B',
	select: 'BUTTON_SELECT',
	start: 'BUTTON_START',
	right: 'BUTTON_RIGHT',
	left: 'BUTTON_LEFT',
	up: 'BUTTON_UP',
	down: 'BUTTON_DOWN'
};

let currentShader = SHADER_NONE;

function getRomUrl(filename) {
	const path = window.location.pathname;
	if (path.startsWith('/labs/gbemu')) {
		return `/labs/gbemu/roms/${filename}`;
	}
	return `./roms/${filename}`;
}

function isSharedArrayBufferAvailable() {
	try {
		new SharedArrayBuffer(1);
		return true;
	} catch (e) {
		return false;
	}
}

function isOffscreenCanvasAvailable() {
	try {
		if (typeof OffscreenCanvas === 'undefined') return false;
		const testCanvas = document.createElement('canvas');
		if (typeof testCanvas.transferControlToOffscreen !== 'function') return false;
		const offscreen = testCanvas.transferControlToOffscreen();
		const ctx = offscreen.getContext('webgl');
		return ctx !== null;
	} catch (e) {
		return false;
	}
}

function initSharedMemory() {
	sharedFramebufferSAB = new SharedArrayBuffer(FB_SIZE * 2 * 4);
	sharedFramebuffer = new Uint32Array(sharedFramebufferSAB);
	sharedAudioSAB = new SharedArrayBuffer(AUDIO_BUFFER_SIZE * 4);
	sharedAudio = new Float32Array(sharedAudioSAB);
	sharedControlSAB = new SharedArrayBuffer(32);
	sharedControl = new Int32Array(sharedControlSAB);
}

function initWebGL() {
	canvas = document.getElementById('screen');
	Renderer.setCanvas(canvas);
	const success = Renderer.initWebGL();
	currentShader = Renderer.getCurrentShader();
	return success;
}

function cycleShader() {
	const shaderName = Renderer.cycleShader(worker, useOffscreenCanvas);
	currentShader = Renderer.getCurrentShader();
	return shaderName;
}

function initCanvas2D() {
	canvas = document.getElementById('screen');
	Renderer.setCanvas(canvas);
	Renderer.initCanvas2D();
}

async function initAudioOffscreenMode() {
	return Audio.initAudioWorkerMode(sharedAudioSAB, sharedControlSAB);
}

function initWorkerOffscreen() {
	worker = new Worker(new URL('./workers/offscreen-worker.js', import.meta.url), {
		type: 'classic'
	});
	worker.onmessage = handleWorkerMessageOffscreen;
	worker.onerror = (e) => {
		console.error('Worker error:', e);
		statusDisplay.textContent = 'Worker error';
	};
	worker.postMessage({ type: 'init' });
}

function handleWorkerMessageOffscreen(e) {
	const { type, ...data } = e.data;

	switch (type) {
		case 'ready':
			canvas = document.getElementById('screen');
			offscreenCanvas = canvas.transferControlToOffscreen();
			worker.postMessage(
				{ type: 'set-offscreen-canvas', data: { canvas: offscreenCanvas } },
				[offscreenCanvas]
			);
			break;

		case 'offscreen-ready':
			worker.postMessage({
				type: 'set-shared-memory',
				data: {
					audio: sharedAudioSAB,
					control: sharedControlSAB,
					shader: currentShader
				}
			});
			break;

		case 'shared-memory-ready':
			statusDisplay.textContent = 'Ready';
			break;

		case 'rom-loaded':
			overlay.classList.add('hidden');
			resetBtn.disabled = false;
			powerLed.classList.add('on');
			statusDisplay.textContent = 'Running';
			running = true;
			// Reset button state to avoid stuck buttons from menu navigation
			buttonState = 0;
			if (sharedControl) Atomics.store(sharedControl, CTRL_BUTTONS, 0);
			initAudioOffscreenMode();
			Audio.resetAudioBuffer(); // Clear any stale audio to prevent latency
			Audio.resumeAudio();
			break;

		case 'fps':
			fpsDisplay.textContent = data.fps;
			break;

		case 'paused':
			running = false;
			statusDisplay.textContent = 'Paused';
			break;

		case 'resumed':
			running = true;
			statusDisplay.textContent = 'Running';
			break;

		case 'error':
			console.error('Worker error:', data.message);
			statusDisplay.textContent = data.message;
			break;
	}
}

function initSharedMemoryOffscreen() {
	sharedAudioSAB = new SharedArrayBuffer(AUDIO_BUFFER_SIZE * 4);
	sharedAudio = new Float32Array(sharedAudioSAB);
	sharedControlSAB = new SharedArrayBuffer(32);
	sharedControl = new Int32Array(sharedControlSAB);
}

function loadROMOffscreen(arrayBuffer) {
	if (!worker) return;
	worker.postMessage({ type: 'load-rom', data: { rom: arrayBuffer } });
}

function togglePauseOffscreen() {
	if (!sharedControl) return;
	Atomics.store(sharedControl, CTRL_COMMAND, running ? CMD_PAUSE : CMD_RESUME);
}

function resetEmulationOffscreen() {
	if (!sharedControl) return;
	Atomics.store(sharedControl, CTRL_COMMAND, CMD_RESET);
}

function handleKeyDownOffscreen(e) {
	if (e.code === 'KeyS') {
		e.preventDefault();
		showShaderNotification(cycleShader());
		return;
	}

	const bit = keyMap[e.code];
	if (bit !== undefined) {
		e.preventDefault();
		if (isMenuActive && !handleMenuInput(getActionFromKeyCode(e.code))) return;
		buttonState |= 1 << bit;
		if (sharedControl) Atomics.store(sharedControl, CTRL_BUTTONS, buttonState);
	}
}

function handleKeyUpOffscreen(e) {
	const bit = keyMap[e.code];
	if (bit !== undefined) {
		e.preventDefault();
		buttonState &= ~(1 << bit);
		if (sharedControl) Atomics.store(sharedControl, CTRL_BUTTONS, buttonState);
	}
}

function getActionFromKeyCode(code) {
	const actionMap = {
		ArrowUp: 'up',
		ArrowDown: 'down',
		ArrowLeft: 'left',
		ArrowRight: 'right',
		KeyZ: 'a',
		KeyX: 'b',
		Enter: 'start',
		ShiftLeft: 'select',
		ShiftRight: 'select'
	};
	return actionMap[code] || null;
}

function initWorker() {
	worker = new Worker(new URL('./workers/sab-worker.js', import.meta.url), { type: 'classic' });
	worker.onmessage = handleWorkerMessage;
	worker.onerror = (e) => {
		console.error('Worker error:', e);
		statusDisplay.textContent = 'Worker error';
	};
	worker.postMessage({ type: 'init' });
}

function handleWorkerMessage(e) {
	const { type, ...data } = e.data;

	switch (type) {
		case 'ready':
			worker.postMessage({
				type: 'set-shared-memory',
				data: {
					framebuffer: sharedFramebufferSAB,
					audio: sharedAudioSAB,
					control: sharedControlSAB
				}
			});
			statusDisplay.textContent = 'Ready';
			break;

		case 'shared-memory-ready':
			break;

		case 'rom-loaded':
			overlay.classList.add('hidden');
			resetBtn.disabled = false;
			powerLed.classList.add('on');
			statusDisplay.textContent = 'Running';
			running = true;
			// Reset button state to avoid stuck buttons from menu navigation
			buttonState = 0;
			if (sharedControl) Atomics.store(sharedControl, CTRL_BUTTONS, 0);
			Audio.initAudioWorkerMode(sharedAudioSAB, sharedControlSAB);
			Audio.resetAudioBuffer(); // Clear any stale audio to prevent latency
			Audio.resumeAudio();
			startRenderLoopWorker();
			break;

		case 'fps':
			fpsDisplay.textContent = data.fps;
			break;

		case 'paused':
			running = false;
			statusDisplay.textContent = 'Paused';
			break;

		case 'resumed':
			running = true;
			statusDisplay.textContent = 'Running';
			break;

		case 'error':
			console.error('Worker error:', data.message);
			statusDisplay.textContent = data.message;
			break;
	}
}

function renderLoopWorker() {
	if (!running) {
		animationId = requestAnimationFrame(renderLoopWorker);
		return;
	}

	const readyBuffer = Atomics.load(sharedControl, CTRL_FRAME_READY);
	if (readyBuffer !== lastRenderedBuffer) {
		const offset = readyBuffer * FB_SIZE;
		if (Renderer.isUsingWebGL()) {
			Renderer.renderWebGLFromShared(sharedFramebuffer, offset);
		} else {
			Renderer.renderCanvas2DFromShared(sharedFramebuffer, offset);
		}
		lastRenderedBuffer = readyBuffer;
	}

	animationId = requestAnimationFrame(renderLoopWorker);
}

function startRenderLoopWorker() {
	if (!animationId) {
		lastRenderedBuffer = -1;
		animationId = requestAnimationFrame(renderLoopWorker);
	}
}

function loadROMWorker(arrayBuffer) {
	if (!worker) return;
	worker.postMessage({ type: 'load-rom', data: { rom: arrayBuffer } });
}

function togglePauseWorker() {
	if (!sharedControl) return;
	Atomics.store(sharedControl, CTRL_COMMAND, running ? CMD_PAUSE : CMD_RESUME);
}

function resetEmulationWorker() {
	if (!sharedControl) return;
	Atomics.store(sharedControl, CTRL_COMMAND, CMD_RESET);
}

function handleKeyDownWorker(e) {
	if (e.code === 'KeyS') {
		e.preventDefault();
		showShaderNotification(cycleShader());
		return;
	}

	const bit = keyMap[e.code];
	if (bit !== undefined) {
		e.preventDefault();
		if (isMenuActive && !handleMenuInput(getActionFromKeyCode(e.code))) return;
		buttonState |= 1 << bit;
		if (sharedControl) Atomics.store(sharedControl, CTRL_BUTTONS, buttonState);
	}
}

function handleKeyUpWorker(e) {
	const bit = keyMap[e.code];
	if (bit !== undefined) {
		e.preventDefault();
		buttonState &= ~(1 << bit);
		if (sharedControl) Atomics.store(sharedControl, CTRL_BUTTONS, buttonState);
	}
}

async function initEmulatorFallback() {
	try {
		emu = await createGBEmu();
		emu.init();
		statusDisplay.textContent = 'Ready';
	} catch (e) {
		console.error('Failed to initialize emulator:', e);
		statusDisplay.textContent = 'Failed to load';
	}
}

function emulationLoopFallback(timestamp) {
	if (!running) return;

	emu.runFrame();
	Renderer.renderFrame(emu.getFramebuffer());
	Audio.sendAudioSamples(emu);

	frameCount++;
	if (timestamp - fpsUpdateTime >= 1000) {
		fpsDisplay.textContent = frameCount;
		frameCount = 0;
		fpsUpdateTime = timestamp;
	}

	animationId = requestAnimationFrame(emulationLoopFallback);
}

function loadROMFallback(arrayBuffer) {
	if (!emu) return false;

	const data = new Uint8Array(arrayBuffer);
	const ptr = emu.allocateROMBuffer(data.length);
	if (!ptr) {
		statusDisplay.textContent = 'Memory error';
		return false;
	}

	emu.HEAPU8.set(data, ptr);

	if (emu.loadROMFromBuffer(data.length)) {
		overlay.classList.add('hidden');
		resetBtn.disabled = false;
		powerLed.classList.add('on');
		statusDisplay.textContent = 'Running';
		// Reset button state to avoid stuck buttons from menu navigation
		buttonState = 0;
		Audio.initAudioFallback(() => emu);
		startEmulationFallback();
		return true;
	} else {
		statusDisplay.textContent = 'Invalid ROM';
		return false;
	}
}

function startEmulationFallback() {
	running = true;
	fpsUpdateTime = performance.now();
	frameCount = 0;
	Audio.resumeAudio();
	animationId = requestAnimationFrame(emulationLoopFallback);
}

function pauseEmulationFallback() {
	running = false;
	if (animationId) {
		cancelAnimationFrame(animationId);
		animationId = null;
	}
	statusDisplay.textContent = 'Paused';
}

function togglePauseFallback() {
	if (running) {
		pauseEmulationFallback();
	} else {
		statusDisplay.textContent = 'Running';
		startEmulationFallback();
	}
}

function resetEmulationFallback() {
	if (emu) {
		emu.reset();
		if (!running) startEmulationFallback();
	}
}

function handleKeyDownFallback(e) {
	if (e.code === 'KeyS') {
		e.preventDefault();
		showShaderNotification(cycleShader());
		return;
	}

	if (isMenuActive) {
		const bit = keyMap[e.code];
		if (bit !== undefined) {
			e.preventDefault();
			if (!handleMenuInput(getActionFromKeyCode(e.code))) return;
		}
		return;
	}

	if (!emu || !running) return;

	const button = keyMapFallback[e.code];
	if (button) {
		e.preventDefault();
		emu.setButton(emu[button], true);
	}
}

function handleKeyUpFallback(e) {
	if (!emu) return;
	const button = keyMapFallback[e.code];
	if (button) {
		e.preventDefault();
		emu.setButton(emu[button], false);
	}
}

function showShaderNotification(shaderName) {
	statusDisplay.textContent = shaderName;
	setTimeout(() => {
		statusDisplay.textContent = running ? 'Running' : 'Ready';
	}, 1000);
}

function toggleFullscreen() {
	if (!document.fullscreenElement) {
		gameboy.requestFullscreen().catch((err) => console.error('Fullscreen error:', err));
	} else {
		document.exitFullscreen();
	}
}

function handleDragOver(e) {
	e.preventDefault();
	overlay.classList.add('dragover');
}

function handleDragLeave(e) {
	e.preventDefault();
	overlay.classList.remove('dragover');
}

function handleDrop(e) {
	e.preventDefault();
	overlay.classList.remove('dragover');
	loadROMFromFile(e.dataTransfer.files[0]);
}

function handleFileSelect(e) {
	loadROMFromFile(e.target.files[0]);
}

function handleScreenTap(e) {
	if (!isMenuActive && running && e.target === document.getElementById('screen')) {
		showGameMenu();
	}
}

function handleScreenTapTouch(e) {
	if (!isMenuActive && running && e.changedTouches.length === 1) {
		const touch = e.changedTouches[0];
		if (
			document.elementFromPoint(touch.clientX, touch.clientY) ===
			document.getElementById('screen')
		) {
			showGameMenu();
		}
	}
}

function showGameMenu() {
	overlay.classList.remove('hidden');
	if (backToMenuBtn) backToMenuBtn.classList.add('hidden');
	isMenuActive = true;
	selectedGameIndex = 0;
	setupGameLibraryNavigation();
	Audio.playMenuNavigateSound();
}

function hideGameMenu() {
	overlay.classList.add('hidden');
	if (backToMenuBtn) backToMenuBtn.classList.remove('hidden');
	isMenuActive = false;
}

function loadROMFromFile(file) {
	if (!file) return;
	const reader = new FileReader();
	reader.onload = () => {
		if (useOffscreenCanvas) {
			loadROMOffscreen(reader.result);
		} else if (useWorkerMode) {
			loadROMWorker(reader.result);
		} else {
			loadROMFallback(reader.result);
		}
	};
	reader.readAsArrayBuffer(file);
}

async function loadROMFromURL(url, gameName) {
	statusDisplay.textContent = 'Loading...';
	hideGameMenu();

	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Failed to fetch ROM: ${response.status}`);

		const arrayBuffer = await response.arrayBuffer();

		if (useOffscreenCanvas) {
			loadROMOffscreen(arrayBuffer);
		} else if (useWorkerMode) {
			loadROMWorker(arrayBuffer);
		} else {
			loadROMFallback(arrayBuffer);
		}
	} catch (e) {
		console.error('Failed to load ROM:', e);
		statusDisplay.textContent = 'Load failed';
		showGameMenu();
	}
}

async function loadGameList() {
	const gameListEl = document.getElementById('game-list');

	try {
		gameListEl.innerHTML = '';

		gamesList.forEach((game) => {
			const button = document.createElement('button');
			button.className = 'game-item';
			button.dataset.rom = game.file;
			button.innerHTML = `
				<span class="game-name">${game.name}</span>
				<span class="game-genre">${game.genre}</span>
			`;
			gameListEl.appendChild(button);
		});

		const uploadBtn = document.createElement('button');
		uploadBtn.className = 'game-item game-item-upload';
		uploadBtn.dataset.action = 'upload';
		uploadBtn.innerHTML = `
			<span class="game-name">Load your own ROM</span>
			<span class="game-genre">Browse files...</span>
		`;
		gameListEl.appendChild(uploadBtn);

		setupGameLibraryNavigation();
	} catch (e) {
		console.error('Failed to load game list:', e);
		gameListEl.innerHTML = '<div class="game-list-error">Failed to load games</div>';
	}
}

function setupGameLibraryNavigation() {
	gameItems = Array.from(document.querySelectorAll('.game-item'));
	if (gameItems.length > 0) updateGameSelection(0);

	gameItems.forEach((item) => {
		item.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
		});
		item.addEventListener(
			'touchstart',
			(e) => {
				e.preventDefault();
				e.stopPropagation();
			},
			{ passive: false }
		);
	});
}

function updateGameSelection(newIndex) {
	if (gameItems[selectedGameIndex]) {
		gameItems[selectedGameIndex].classList.remove('selected');
	}
	selectedGameIndex = Math.max(0, Math.min(newIndex, gameItems.length - 1));
	if (gameItems[selectedGameIndex]) {
		gameItems[selectedGameIndex].classList.add('selected');
		gameItems[selectedGameIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	}
}

function menuNavigateUp() {
	if (!isMenuActive || gameItems.length === 0) return;
	if (selectedGameIndex > 0) {
		Audio.playMenuNavigateSound();
		updateGameSelection(selectedGameIndex - 1);
	}
}

function menuNavigateDown() {
	if (!isMenuActive || gameItems.length === 0) return;
	if (selectedGameIndex < gameItems.length - 1) {
		Audio.playMenuNavigateSound();
		updateGameSelection(selectedGameIndex + 1);
	}
}

function confirmGameSelection() {
	if (!isMenuActive || gameItems.length === 0) return;

	const selectedItem = gameItems[selectedGameIndex];
	if (selectedItem) {
		Audio.playMenuConfirmSound();

		if (selectedItem.dataset.action === 'upload') {
			romInput.click();
			return;
		}

		const romFile = selectedItem.dataset.rom;
		const gameName = selectedItem.querySelector('.game-name').textContent;
		loadROMFromURL(getRomUrl(romFile), gameName);
	}
}

function handleMenuInput(action) {
	if (!isMenuActive) return true;

	switch (action) {
		case 'up':
			menuNavigateUp();
			return false;
		case 'down':
			menuNavigateDown();
			return false;
		case 'a':
		case 'start':
			confirmGameSelection();
			return false;
		default:
			return true;
	}
}

function handleScreenButtonDown(btnName) {
	if (isMenuActive && !handleMenuInput(btnName)) return;

	if (useOffscreenCanvas || useWorkerMode) {
		const bit = screenButtonMap[btnName];
		if (bit !== undefined) {
			buttonState |= 1 << bit;
			if (sharedControl) Atomics.store(sharedControl, CTRL_BUTTONS, buttonState);
		}
	} else if (emu) {
		const button = screenButtonMapFallback[btnName];
		if (button) emu.setButton(emu[button], true);
	}
}

function handleScreenButtonUp(btnName) {
	if (useOffscreenCanvas || useWorkerMode) {
		const bit = screenButtonMap[btnName];
		if (bit !== undefined) {
			buttonState &= ~(1 << bit);
			if (sharedControl) Atomics.store(sharedControl, CTRL_BUTTONS, buttonState);
		}
	} else if (emu) {
		const button = screenButtonMapFallback[btnName];
		if (button) emu.setButton(emu[button], false);
	}
}

function setupScreenButtons() {
	const buttons = document.querySelectorAll('[data-btn]');

	buttons.forEach((btn) => {
		const btnName = btn.dataset.btn;

		btn.addEventListener('mousedown', (e) => {
			e.preventDefault();
			btn.classList.add('pressed');
			handleScreenButtonDown(btnName);
		});

		btn.addEventListener('mouseup', (e) => {
			e.preventDefault();
			btn.classList.remove('pressed');
			handleScreenButtonUp(btnName);
		});

		btn.addEventListener('mouseleave', () => {
			btn.classList.remove('pressed');
			handleScreenButtonUp(btnName);
		});

		btn.addEventListener(
			'touchstart',
			(e) => {
				e.preventDefault();
				btn.classList.add('pressed');
				handleScreenButtonDown(btnName);
			},
			{ passive: false }
		);

		btn.addEventListener(
			'touchend',
			(e) => {
				e.preventDefault();
				btn.classList.remove('pressed');
				handleScreenButtonUp(btnName);
			},
			{ passive: false }
		);

		btn.addEventListener('touchcancel', () => {
			btn.classList.remove('pressed');
			handleScreenButtonUp(btnName);
		});
	});
}

document.addEventListener('DOMContentLoaded', () => {
	fpsDisplay = document.getElementById('fps');
	statusDisplay = document.getElementById('status');
	overlay = document.getElementById('overlay');
	loadBtn = document.getElementById('load-btn');
	resetBtn = document.getElementById('reset-btn');
	fullscreenBtn = document.getElementById('fullscreen-btn');
	shaderBtn = document.getElementById('shader-btn');
	romInput = document.getElementById('rom-input');
	powerLed = document.getElementById('power-led');
	speaker = document.getElementById('speaker');
	gameboy = document.querySelector('.gameboy');
	backToMenuBtn = document.getElementById('back-to-menu');

	Audio.setSpeakerElement(speaker);

	const hasSAB = isSharedArrayBufferAvailable();
	const hasOffscreen = isOffscreenCanvasAvailable();

	if (hasSAB && hasOffscreen) {
		useOffscreenCanvas = true;
		useWorkerMode = true;
	} else if (hasSAB) {
		useOffscreenCanvas = false;
		useWorkerMode = true;
	} else {
		useOffscreenCanvas = false;
		useWorkerMode = false;
	}

	const savedShader = localStorage.getItem('gbemu-shader');
	if (savedShader !== null) {
		currentShader = parseInt(savedShader, 10);
		if (isNaN(currentShader) || currentShader < 0 || currentShader >= SHADER_COUNT) {
			currentShader = SHADER_NONE;
		}
	}
	if (shaderBtn) shaderBtn.title = `Shader: ${SHADER_NAMES[currentShader]}`;

	if (!useOffscreenCanvas) {
		if (!initWebGL()) initCanvas2D();
	}

	loadBtn.addEventListener('click', () => romInput.click());
	romInput.addEventListener('change', handleFileSelect);
	fullscreenBtn.addEventListener('click', toggleFullscreen);
	shaderBtn.addEventListener('click', () => showShaderNotification(cycleShader()));
	speaker.addEventListener('click', Audio.toggleMute);
	backToMenuBtn.addEventListener('click', showGameMenu);

	loadGameList();

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay || e.target.classList.contains('game-library')) {
			// Let users interact with game items
		}
	});

	setupScreenButtons();

	const screenInner = document.querySelector('.gb-screen-inner');
	screenInner.addEventListener('dragover', handleDragOver);
	screenInner.addEventListener('dragleave', handleDragLeave);
	screenInner.addEventListener('drop', handleDrop);
	screenInner.addEventListener('click', handleScreenTap);
	screenInner.addEventListener('touchend', handleScreenTapTouch, { passive: true });

	if (useOffscreenCanvas) {
		initSharedMemoryOffscreen();
		initWorkerOffscreen();
		resetBtn.addEventListener('click', resetEmulationOffscreen);
		document.addEventListener('keydown', handleKeyDownOffscreen);
		document.addEventListener('keyup', handleKeyUpOffscreen);
	} else if (useWorkerMode) {
		initSharedMemory();
		initWorker();
		resetBtn.addEventListener('click', resetEmulationWorker);
		document.addEventListener('keydown', handleKeyDownWorker);
		document.addEventListener('keyup', handleKeyUpWorker);
	} else {
		if (typeof createGBEmu === 'undefined') {
			statusDisplay.textContent = 'WASM not found';
			return;
		}
		initEmulatorFallback();
		resetBtn.addEventListener('click', resetEmulationFallback);
		document.addEventListener('keydown', handleKeyDownFallback);
		document.addEventListener('keyup', handleKeyUpFallback);
	}
});

window.getMode = () => {
	if (useOffscreenCanvas) return 'OffscreenCanvas mode';
	if (useWorkerMode) return 'Worker mode';
	return 'Fallback mode';
};

window.toggleAudio = () => {
	Audio.toggleMute();
	return Audio.isAudioEnabled();
};

window.audioStatus = () => {
	const status = Audio.getAudioStatus();
	console.log('Audio Status:', status);
};

window.getCapabilities = () => ({
	SharedArrayBuffer: isSharedArrayBufferAvailable(),
	OffscreenCanvas: isOffscreenCanvasAvailable(),
	AudioWorklet: !!(window.AudioContext && AudioContext.prototype.audioWorklet),
	WebGL: !!document.createElement('canvas').getContext('webgl')
});
