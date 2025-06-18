import { mat4 } from 'gl-matrix';
import { ShaderProgram } from '../graphics/ShaderProgram';
import { SvgPath } from './SvgPath';

export class PlayerShip {
	private vertices: Float32Array;
	private buffer: WebGLBuffer;
	private gl: WebGLRenderingContext;
	private shaderProgram: ShaderProgram;

	constructor(gl: WebGLRenderingContext, shaderProgram: ShaderProgram) {
		this.gl = gl;
		this.shaderProgram = shaderProgram;

		// Modern spaceship shape (flipped vertically)
		const shipPath = `
            M 0 0.08     // Top point
            L -0.06 -0.08  // Bottom left
            L -0.04 -0.06
            L -0.02 -0.08
            L 0 -0.06
            L 0.02 -0.08
            L 0.04 -0.06
            L 0.06 -0.08  // Bottom right
            Z
        `;

		// Create vertices from SVG path
		this.vertices = SvgPath.parsePathToVertices(shipPath, 1);

		this.buffer = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	}

	draw(gl: WebGLRenderingContext, modelMatrix: mat4): void {
		this.shaderProgram.use();

		gl.uniformMatrix4fv(
			this.shaderProgram.getUniformLocation('uModelMatrix'),
			false,
			modelMatrix
		);

		// Player ship gradient colors
		gl.uniform3f(
			this.shaderProgram.getUniformLocation('uColor'),
			0.4,
			0.6,
			1.0 // Blue-ish color
		);
		gl.uniform1f(this.shaderProgram.getUniformLocation('uAlpha'), 1.0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		const positionLocation = this.shaderProgram.getAttribLocation('aPosition');
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(positionLocation);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length / 3);
	}
}
