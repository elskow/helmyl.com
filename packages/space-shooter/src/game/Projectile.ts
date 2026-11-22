import { Projectile as ProjectileType } from '../types';
import { Entity } from './Entity';
import { ShaderProgram } from '../graphics/ShaderProgram';
import { mat4 } from 'gl-matrix';
import { SvgPath } from './SvgPath';

export class Projectile extends Entity implements ProjectileType {
	damage: number = 25;
	lifeTime: number = 2;
	speed: number = 0.8;
	private shaderProgram: ShaderProgram;
	private vertices: Float32Array;
	private buffer: WebGLBuffer;

	constructor(x: number, y: number, gl: WebGLRenderingContext, shaderProgram: ShaderProgram) {
		super(x, y);
		this.velocity.y = this.speed;
		this.shaderProgram = shaderProgram;


		const projectilePath = `
            M 0 -0.03
            L -0.01 0
            L 0 0.03
            L 0.01 0
            Z
        `;

		this.vertices = SvgPath.parsePathToVertices(projectilePath, 1);

		this.buffer = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	}

	update(deltaTime: number): void {
		super.update(deltaTime);
		this.lifeTime -= deltaTime;
		if (this.lifeTime <= 0 || this.position.y > 1.2 || this.position.y < -1.2) {
			this.active = false;
		}
	}

	draw(gl: WebGLRenderingContext): void {
		this.shaderProgram.use();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		const modelMatrix = mat4.create();
		mat4.translate(modelMatrix, modelMatrix, [this.position.x, this.position.y, 0]);

		gl.uniformMatrix4fv(
			this.shaderProgram.getUniformLocation('uModelMatrix'),
			false,
			modelMatrix
		);


		if (this.velocity.y < 0) {
			gl.uniform3f(this.shaderProgram.getUniformLocation('uColor'), 1.0, 0.2, 0.2);
		} else {
			gl.uniform3f(this.shaderProgram.getUniformLocation('uColor'), 1.0, 0.9, 0.2);
		}

		gl.uniform1f(this.shaderProgram.getUniformLocation('uAlpha'), 1.0);

		const positionLocation = this.shaderProgram.getAttribLocation('aPosition');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}
