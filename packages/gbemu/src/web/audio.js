const AUDIO_BUFFER_SIZE = 16384;
const CTRL_AUDIO_WRITE_POS = 2;

let audioContext = null;
let audioWorkletNode = null;
let scriptProcessorNode = null;
let audioEnabled = false;
let audioReadPos = 0;
let isMuted = false;
let menuAudioContext = null;
let speakerElement = null;

export function setSpeakerElement(element) {
	speakerElement = element;
}

export function isAudioEnabled() {
	return audioEnabled;
}

export function isAudioMuted() {
	return isMuted;
}

export function getAudioWorkletNode() {
	return audioWorkletNode;
}

export async function initAudioWorkerMode(sharedAudioSAB, sharedControlSAB) {
	if (audioContext) return;

	const sharedAudio = new Float32Array(sharedAudioSAB);
	const sharedControl = new Int32Array(sharedControlSAB);

	try {
		audioContext = new (window.AudioContext || window.webkitAudioContext)({
			sampleRate: 44100,
			latencyHint: 'interactive'
		});

		if (audioContext.audioWorklet) {
			try {
				const workletCode = `
					class GBAudioProcessor extends AudioWorkletProcessor {
						constructor(options) {
							super();
							this.sharedAudio = null;
							this.sharedControl = null;
							this.readPos = 0;
							this.bufferSize = 16384;
							this.ctrlAudioWritePos = 2;
							this.lastLeft = 0;
							this.lastRight = 0;
							
							this.port.onmessage = (e) => {
								if (e.data.type === 'set-buffers') {
									this.sharedAudio = new Float32Array(e.data.audio);
									this.sharedControl = new Int32Array(e.data.control);
									this.readPos = 0;
									this.lastLeft = 0;
									this.lastRight = 0;
								} else if (e.data.type === 'reset') {
									this.readPos = 0;
									this.lastLeft = 0;
									this.lastRight = 0;
								}
							};
						}
						
						process(inputs, outputs, parameters) {
							if (!this.sharedAudio || !this.sharedControl) return true;
							
							const output = outputs[0];
							const left = output[0];
							const right = output[1] || left;
							const writePos = Atomics.load(this.sharedControl, this.ctrlAudioWritePos);
							
							for (let i = 0; i < left.length; i++) {
								if (this.readPos !== writePos) {
									this.lastLeft = this.sharedAudio[this.readPos];
									left[i] = this.lastLeft;
									this.readPos = (this.readPos + 1) % this.bufferSize;
								} else {
									// Underrun: fade to zero to avoid pops
									this.lastLeft *= 0.95;
									left[i] = this.lastLeft;
								}
								if (this.readPos !== writePos) {
									this.lastRight = this.sharedAudio[this.readPos];
									right[i] = this.lastRight;
									this.readPos = (this.readPos + 1) % this.bufferSize;
								} else {
									// Underrun: fade to zero to avoid pops
									this.lastRight *= 0.95;
									right[i] = this.lastRight;
								}
							}
							return true;
						}
					}
					registerProcessor('gb-audio-processor', GBAudioProcessor);
				`;

				const blob = new Blob([workletCode], { type: 'application/javascript' });
				const url = URL.createObjectURL(blob);
				await audioContext.audioWorklet.addModule(url);
				URL.revokeObjectURL(url);

				audioWorkletNode = new AudioWorkletNode(audioContext, 'gb-audio-processor');
				audioWorkletNode.port.postMessage({
					type: 'set-buffers',
					audio: sharedAudioSAB,
					control: sharedControlSAB
				});
				audioWorkletNode.connect(audioContext.destination);
				audioEnabled = true;
				console.log('AudioWorklet initialized with SharedArrayBuffer');
				return;
			} catch (e) {
				console.warn('AudioWorklet failed:', e);
			}
		}

		const bufferSize = 2048;
		scriptProcessorNode = audioContext.createScriptProcessor(bufferSize, 0, 2);
		scriptProcessorNode.onaudioprocess = (event) => {
			if (!sharedAudio || !sharedControl || !audioEnabled) {
				event.outputBuffer.getChannelData(0).fill(0);
				event.outputBuffer.getChannelData(1).fill(0);
				return;
			}

			const writePos = Atomics.load(sharedControl, CTRL_AUDIO_WRITE_POS);
			const leftChannel = event.outputBuffer.getChannelData(0);
			const rightChannel = event.outputBuffer.getChannelData(1);

			for (let i = 0; i < bufferSize; i++) {
				if (audioReadPos !== writePos) {
					leftChannel[i] = sharedAudio[audioReadPos];
					audioReadPos = (audioReadPos + 1) % AUDIO_BUFFER_SIZE;
				} else {
					leftChannel[i] = 0;
				}
				if (audioReadPos !== writePos) {
					rightChannel[i] = sharedAudio[audioReadPos];
					audioReadPos = (audioReadPos + 1) % AUDIO_BUFFER_SIZE;
				} else {
					rightChannel[i] = 0;
				}
			}
		};
		scriptProcessorNode.connect(audioContext.destination);
		audioEnabled = true;
		console.log('ScriptProcessor audio initialized with SharedArrayBuffer');
	} catch (e) {
		console.error('Failed to initialize audio:', e);
	}
}

export async function initAudioFallback(getEmu) {
	if (audioContext) return;

	try {
		audioContext = new (window.AudioContext || window.webkitAudioContext)({
			sampleRate: 44100,
			latencyHint: 'interactive'
		});

		if (audioContext.audioWorklet) {
			try {
				const workletCode = `
					class GBAudioProcessor extends AudioWorkletProcessor {
						constructor() {
							super();
							this.bufferSize = 16384;
							this.buffer = new Float32Array(this.bufferSize);
							this.writePos = 0;
							this.readPos = 0;
							this.port.onmessage = (e) => {
								const samples = e.data;
								for (let i = 0; i < samples.length; i++) {
									this.buffer[this.writePos] = samples[i];
									this.writePos = (this.writePos + 1) % this.bufferSize;
								}
							};
						}
						process(inputs, outputs, parameters) {
							const output = outputs[0];
							const left = output[0];
							const right = output[1] || left;
							
							for (let i = 0; i < left.length; i++) {
								if (this.readPos !== this.writePos) {
									left[i] = this.buffer[this.readPos];
									this.readPos = (this.readPos + 1) % this.bufferSize;
								} else {
									left[i] = 0;
								}
								if (this.readPos !== this.writePos) {
									right[i] = this.buffer[this.readPos];
									this.readPos = (this.readPos + 1) % this.bufferSize;
								} else {
									right[i] = 0;
								}
							}
							return true;
						}
					}
					registerProcessor('gb-audio-processor', GBAudioProcessor);
				`;
				const blob = new Blob([workletCode], { type: 'application/javascript' });
				const url = URL.createObjectURL(blob);
				await audioContext.audioWorklet.addModule(url);
				URL.revokeObjectURL(url);

				audioWorkletNode = new AudioWorkletNode(audioContext, 'gb-audio-processor');
				audioWorkletNode.connect(audioContext.destination);
				audioEnabled = true;
				console.log('AudioWorklet initialized (fallback mode)');
				return;
			} catch (e) {
				console.warn('AudioWorklet failed, using ScriptProcessor:', e);
			}
		}

		const bufferSize = 2048;
		scriptProcessorNode = audioContext.createScriptProcessor(bufferSize, 0, 2);

		scriptProcessorNode.onaudioprocess = (event) => {
			const emu = getEmu();
			if (!emu || !audioEnabled) {
				event.outputBuffer.getChannelData(0).fill(0);
				event.outputBuffer.getChannelData(1).fill(0);
				return;
			}

			const sampleCount = emu.getAudioSamplesCount();
			const audioBuffer = emu.getAudioBuffer();
			const leftChannel = event.outputBuffer.getChannelData(0);
			const rightChannel = event.outputBuffer.getChannelData(1);
			const samplesToUse = Math.min(sampleCount, bufferSize);

			for (let i = 0; i < samplesToUse; i++) {
				leftChannel[i] = audioBuffer[i * 2];
				rightChannel[i] = audioBuffer[i * 2 + 1];
			}

			for (let i = samplesToUse; i < bufferSize; i++) {
				leftChannel[i] = rightChannel[i] = 0;
			}
		};

		scriptProcessorNode.connect(audioContext.destination);
		audioEnabled = true;
		console.log('ScriptProcessor audio initialized (fallback mode)');
	} catch (e) {
		console.error('Failed to initialize audio:', e);
	}
}

export async function resumeAudio() {
	if (audioContext && audioContext.state === 'suspended') {
		await audioContext.resume();
		console.log('Audio context resumed');
	}
}

export function resetAudioBuffer() {
	// Reset the audio worklet's read position to sync with the new write position
	audioReadPos = 0;
	if (audioWorkletNode) {
		audioWorkletNode.port.postMessage({ type: 'reset' });
	}
}

export function toggleMute() {
	isMuted = !isMuted;
	audioEnabled = !isMuted;
	if (speakerElement) {
		speakerElement.classList.toggle('muted', isMuted);
	}
	console.log('Audio:', isMuted ? 'MUTED' : 'ON');
}

export function sendAudioSamples(emu) {
	if (!audioEnabled || !audioWorkletNode || !emu) return;

	const sampleCount = emu.getAudioSamplesCount();
	if (sampleCount > 0) {
		const audioBuffer = emu.getAudioBuffer();
		const samples = new Float32Array(sampleCount * 2);
		for (let i = 0; i < sampleCount * 2; i++) {
			samples[i] = audioBuffer[i];
		}
		audioWorkletNode.port.postMessage(samples);
	}
}

function getMenuAudioContext() {
	if (!menuAudioContext) {
		menuAudioContext = new (window.AudioContext || window.webkitAudioContext)();
	}
	return menuAudioContext;
}

export function playMenuNavigateSound() {
	try {
		const ctx = getMenuAudioContext();
		if (ctx.state === 'suspended') {
			ctx.resume();
		}

		const oscillator = ctx.createOscillator();
		const gainNode = ctx.createGain();

		oscillator.type = 'square';
		oscillator.frequency.setValueAtTime(880, ctx.currentTime);

		gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

		oscillator.connect(gainNode);
		gainNode.connect(ctx.destination);

		oscillator.start(ctx.currentTime);
		oscillator.stop(ctx.currentTime + 0.05);
	} catch (e) {
		// Audio not available
	}
}

export function playMenuConfirmSound() {
	try {
		const ctx = getMenuAudioContext();
		if (ctx.state === 'suspended') {
			ctx.resume();
		}

		const osc1 = ctx.createOscillator();
		const gain1 = ctx.createGain();
		osc1.type = 'square';
		osc1.frequency.setValueAtTime(660, ctx.currentTime);
		gain1.gain.setValueAtTime(0.15, ctx.currentTime);
		gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
		osc1.connect(gain1);
		gain1.connect(ctx.destination);
		osc1.start(ctx.currentTime);
		osc1.stop(ctx.currentTime + 0.06);

		const osc2 = ctx.createOscillator();
		const gain2 = ctx.createGain();
		osc2.type = 'square';
		osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.06);
		gain2.gain.setValueAtTime(0.01, ctx.currentTime);
		gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.06);
		gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
		osc2.connect(gain2);
		gain2.connect(ctx.destination);
		osc2.start(ctx.currentTime + 0.06);
		osc2.stop(ctx.currentTime + 0.12);
	} catch (e) {
		// Audio not available
	}
}

export function getAudioStatus() {
	return {
		audioContext: audioContext ? 'initialized' : 'not initialized',
		state: audioContext?.state || 'N/A',
		sampleRate: audioContext?.sampleRate || 'N/A',
		audioEnabled,
		isMuted,
		audioWorklet: audioWorkletNode ? 'active' : 'not active',
		scriptProcessor: scriptProcessorNode ? 'active' : 'not active'
	};
}
