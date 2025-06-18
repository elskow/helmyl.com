import { mat4 } from 'gl-matrix';

export class Matrix {
	static createProjection(width: number, height: number): mat4 {
		const projection = mat4.create();
		mat4.ortho(projection, -width / 2, width / 2, -height / 2, height / 2, -1, 1);
		return projection;
	}

	static createView(): mat4 {
		return mat4.create(); // Identity matrix for 2D
	}

	static createModel(
		x: number,
		y: number,
		rotation: number,
		scaleX: number,
		scaleY: number
	): mat4 {
		const model = mat4.create();
		mat4.translate(model, model, [x, y, 0]);
		mat4.rotate(model, model, rotation, [0, 0, 1]);
		mat4.scale(model, model, [scaleX, scaleY, 1]);
		return model;
	}
}
