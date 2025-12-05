import { vec3 } from 'gl-matrix';

export class ParticleSystem {
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
