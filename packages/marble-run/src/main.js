import { vec3, mat4 } from 'gl-matrix';
import { Renderer } from './renderer.js';
import { Track } from './track.js';
import { Marble } from './marble.js';
import { Camera } from './camera.js';
import { ParticleSystem } from './particles.js';
import { createGroundMesh } from './geometry.js';

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

		// Draw sky first
		this.renderer.drawSky();

		// Main pass for objects
		this.renderer.beginMainPass();

		// Ground (with isGround flag for contact shadows)
		const groundMatrix = mat4.create();
		this.renderer.drawMesh(this.ground, groundMatrix, 0.0, 0.85, false, true);

		// Track and marble
		this.track.draw(this.renderer);
		this.marble.draw(this.renderer);

		// Particles (after main pass with blending)
		this.particles.draw();

		requestAnimationFrame(() => this.animate());
	}
}

// Start
new App();
