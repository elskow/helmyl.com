import { vertexShaderSource, fragmentShaderSource } from './Shaders';

export class ShaderProgram {
	private gl: WebGLRenderingContext;
	private program: WebGLProgram;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
		this.program = this.createProgram();
	}

	private createProgram(): WebGLProgram {
		const program = this.gl.createProgram()!;
		const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

		this.gl.attachShader(program, vertexShader);
		this.gl.attachShader(program, fragmentShader);
		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			throw new Error(this.gl.getProgramInfoLog(program)!);
		}

		return program;
	}

	private createShader(type: number, source: string): WebGLShader {
		const shader = this.gl.createShader(type)!;
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			throw new Error(this.gl.getShaderInfoLog(shader)!);
		}

		return shader;
	}

	use(): void {
		this.gl.useProgram(this.program);
	}

	getUniformLocation(name: string): WebGLUniformLocation {
		return this.gl.getUniformLocation(this.program, name)!;
	}

	getAttribLocation(name: string): number {
		return this.gl.getAttribLocation(this.program, name);
	}
}
