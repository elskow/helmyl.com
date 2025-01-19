import { ShaderProgram } from '../graphics/ShaderProgram';
import { mat4 } from 'gl-matrix';

interface Star {
	x: number;
	y: number;
	size: number;
	brightness: number;
	speed: number;
	color: { r: number; g: number; b: number };
}

export class StarField {
	private stars: Star[] = [];
	private shaderProgram: ShaderProgram;
	private gl: WebGLRenderingContext;
	private buffer: WebGLBuffer;
	private vertices: Float32Array;

	constructor(gl: WebGLRenderingContext, shaderProgram: ShaderProgram, starCount: number = 200) {
		this.gl = gl;
		this.shaderProgram = shaderProgram;

		// Create square vertices for stars
		this.vertices = new Float32Array([-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0]);

		this.buffer = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

		// Initialize stars
		for (let i = 0; i < starCount; i++) {
			this.stars.push(this.createStar());
		}
	}

	private createStar(): Star {
		const colors = [
			{ r: 1.0, g: 1.0, b: 1.0 }, // White
			{ r: 0.9, g: 0.9, b: 1.0 }, // Blue-white
			{ r: 1.0, g: 0.9, b: 0.9 }, // Red-white
			{ r: 0.4, g: 0.6, b: 1.0 }, // Blue
			{ r: 1.0, g: 0.6, b: 0.4 } // Orange
		];

		return {
			x: Math.random() * 2 - 1,
			y: Math.random() * 2 - 1,
			size: Math.random() * 0.004 + 0.001,
			brightness: Math.random() * 0.5 + 0.5,
			speed: Math.random() * 0.05 + 0.02,
			color: colors[Math.floor(Math.random() * colors.length)]
		};
	}

	update(deltaTime: number): void {
		this.stars.forEach((star) => {
			star.y -= star.speed * deltaTime;

			// Reset star position when it goes off screen
			if (star.y < -1) {
				star.y = 1;
				star.x = Math.random() * 2 - 1;
				star.size = Math.random() * 0.004 + 0.001;
				star.brightness = Math.random() * 0.5 + 0.5;
			}
		});
	}

	draw(gl: WebGLRenderingContext): void {
		this.shaderProgram.use();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		const positionLocation = this.shaderProgram.getAttribLocation('aPosition');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

		this.stars.forEach((star) => {
			const modelMatrix = mat4.create();
			mat4.translate(modelMatrix, modelMatrix, [star.x, star.y, 0]);
			mat4.scale(modelMatrix, modelMatrix, [star.size, star.size, 1]);

			gl.uniformMatrix4fv(
				this.shaderProgram.getUniformLocation('uModelMatrix'),
				false,
				modelMatrix
			);

			gl.uniform3f(
				this.shaderProgram.getUniformLocation('uColor'),
				star.color.r * star.brightness,
				star.color.g * star.brightness,
				star.color.b * star.brightness
			);
			gl.uniform1f(this.shaderProgram.getUniformLocation('uAlpha'), star.brightness);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		});
	}
}
