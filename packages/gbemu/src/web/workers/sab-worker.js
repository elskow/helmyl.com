const workerUrl = self.location.href;
const baseUrl = workerUrl.substring(0, workerUrl.lastIndexOf('/'));
const wasmJsUrl = baseUrl.replace(/\/workers$/, '') + '/gbemu.js';
importScripts(wasmJsUrl);

let emu = null;
let running = false;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

let sharedFramebuffer = null;
let sharedAudio = null;
let sharedControl = null;

let currentBuffer = 0;
const FB_SIZE = 160 * 144;

let audioWritePos = 0;
const AUDIO_BUFFER_SIZE = 16384;

const CTRL_RUNNING = 0;
const CTRL_FRAME_READY = 1;
const CTRL_AUDIO_WRITE_POS = 2;
const CTRL_BUTTONS = 3;
const CTRL_COMMAND = 4;

const CMD_NONE = 0;
const CMD_RESET = 1;
const CMD_PAUSE = 2;
const CMD_RESUME = 3;

let emulationStartTime = 0;
let totalFramesRun = 0;
let frameCount = 0;
let fpsReportTime = 0;

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

		if (sharedFramebuffer) {
			const fb = emu.getFramebuffer();
			const offset = currentBuffer * FB_SIZE;

			for (let i = 0; i < FB_SIZE; i++) {
				sharedFramebuffer[offset + i] = fb[i];
			}

			Atomics.store(sharedControl, CTRL_FRAME_READY, currentBuffer);
			currentBuffer = 1 - currentBuffer;
		}

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

	audioWritePos = 0;
	if (sharedControl) {
		Atomics.store(sharedControl, CTRL_AUDIO_WRITE_POS, 0);
	}

	emulationLoop();
}

function stop() {
	running = false;
}

self.onmessage = function (e) {
	const { type, data } = e.data;

	switch (type) {
		case 'init':
			init();
			break;
		case 'load-rom':
			if (loadROM(data.rom)) {
				start();
			}
			break;
		case 'set-shared-memory':
			sharedFramebuffer = new Uint32Array(data.framebuffer);
			sharedAudio = new Float32Array(data.audio);
			sharedControl = new Int32Array(data.control);
			postMessage({ type: 'shared-memory-ready' });
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
