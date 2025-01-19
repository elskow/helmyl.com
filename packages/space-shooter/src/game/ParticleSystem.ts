import { Particle } from '../types';
import { ShaderProgram } from '../graphics/ShaderProgram';
import { mat4 } from 'gl-matrix';

export class ParticleSystem {
	private particles: Particle[] = [];
	private shaderProgram: ShaderProgram;
	private gl: WebGLRenderingContext;

	private vertices: Float32Array;
	private buffer: WebGLBuffer;

	constructor(gl: WebGLRenderingContext, shaderProgram: ShaderProgram) {
		this.gl = gl;
		this.shaderProgram = shaderProgram;

		// Create square vertices for particles
		this.vertices = new Float32Array([
			-1,
			1,
			0, // top left
			-1,
			-1,
			0, // bottom left
			1,
			1,
			0, // top right
			1,
			-1,
			0 // bottom right
		]);

		this.buffer = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	}

	spawn(x: number, y: number, count: number = 10): void {
		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 0.2 + 0.1;
			this.particles.push({
				position: { x, y },
				velocity: {
					x: Math.cos(angle) * speed,
					y: Math.sin(angle) * speed
				},
				rotation: Math.random() * Math.PI * 2,
				scale: { x: 1, y: 1 },
				active: true,
				color: '#ffeb3b',
				size: Math.random() * 0.02 + 0.01,
				life: 1.0,
				maxLife: 1.0
			});
		}
	}

	update(deltaTime: number): void {
		this.particles = this.particles.filter((particle) => {
			particle.life -= deltaTime;
			if (particle.life <= 0) return false;

			particle.position.x += particle.velocity.x * deltaTime;
			particle.position.y += particle.velocity.y * deltaTime;
			particle.velocity.y += 0.5 * deltaTime; // Gravity
			return true;
		});
	}

	draw(gl: WebGLRenderingContext): void {
		if (this.particles.length === 0) return;

		this.shaderProgram.use();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		const positionLocation = this.shaderProgram.getAttribLocation('aPosition');
		gl.enableVertexAttribArray(positionLocation);

		this.particles.forEach((particle) => {
			const modelMatrix = mat4.create();
			mat4.translate(modelMatrix, modelMatrix, [particle.position.x, particle.position.y, 0]);
			mat4.scale(modelMatrix, modelMatrix, [particle.size, particle.size, 1]);
			mat4.rotate(modelMatrix, modelMatrix, particle.rotation, [0, 0, 1]); // Add rotation

			gl.uniformMatrix4fv(
				this.shaderProgram.getUniformLocation('uModelMatrix'),
				false,
				modelMatrix
			);

			const alpha = particle.life / particle.maxLife;

			// Use different colors for celebration particles
			const brightness = 0.5 + alpha * 0.5; // Fade out smoothly
			gl.uniform3f(
				this.shaderProgram.getUniformLocation('uColor'),
				1.0 * brightness,
				0.9 * brightness,
				0.2 * brightness
			);
			gl.uniform1f(this.shaderProgram.getUniformLocation('uAlpha'), alpha);

			gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		});
	}

	spawnCelebration(x: number, y: number, count: number = 50): void {
		const colors = [
			{ r: 1.0, g: 0.8, b: 0.0 }, // Gold
			{ r: 1.0, g: 0.6, b: 0.0 }, // Orange
			{ r: 1.0, g: 0.4, b: 0.0 }, // Dark Orange
			{ r: 0.8, g: 0.8, b: 1.0 }, // Light Blue
			{ r: 1.0, g: 1.0, b: 1.0 } // White
		];

		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 0.5 + 0.2; // Faster than normal particles
			const color = colors[Math.floor(Math.random() * colors.length)];

			this.particles.push({
				position: { x, y },
				velocity: {
					x: Math.cos(angle) * speed,
					y: Math.sin(angle) * speed
				},
				rotation: Math.random() * Math.PI * 2,
				scale: { x: 1, y: 1 },
				active: true,
				color: '#ffeb3b',
				size: Math.random() * 0.03 + 0.02, // Bigger than normal particles
				life: 2.0, // Longer life than normal particles
				maxLife: 2.0
			});
		}
	}
}
