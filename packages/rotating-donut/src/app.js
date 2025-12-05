import { mat4 } from 'gl-matrix';

function init() {
	const canvas = document.createElement('canvas');
	canvas.width = 800;
	canvas.height = 600;
	document.getElementById('app').appendChild(canvas);

	const gl = canvas.getContext('webgl');
	if (!gl) {
		console.error('WebGL not supported');
		return;
	}

	// Vertex shader program
	const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;

        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;

	// Fragment shader program
	const fsSource = `
        varying lowp vec4 vColor;

        void main(void) {
            gl_FragColor = vColor;
        }
    `;

	// Initialize shader program
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
		}
	};

	// Create torus buffers
	const buffers = initBuffers(gl);

	let rotation = 0.0;

	// Render loop
	function render() {
		drawScene(gl, programInfo, buffers, rotation);
		rotation += 0.01;
		requestAnimationFrame(render);
	}
	render();
}

function initBuffers(gl) {
	const positions = [];
	const colors = [];
	const indices = [];

	const R = 1.0; // Major radius
	const r = 0.3; // Minor radius
	const segments = 32;
	const rings = 32;

	// Generate vertices
	for (let i = 0; i <= rings; i++) {
		const phi = (i * 2 * Math.PI) / rings;
		for (let j = 0; j <= segments; j++) {
			const theta = (j * 2 * Math.PI) / segments;

			const x = (R + r * Math.cos(theta)) * Math.cos(phi);
			const y = (R + r * Math.cos(theta)) * Math.sin(phi);
			const z = r * Math.sin(theta);

			positions.push(x, y, z);

			// Add colors (gradient)
			const color = [(Math.cos(phi) + 1) / 2, (Math.sin(theta) + 1) / 2, 0.5, 1.0];
			colors.push(...color);
		}
	}

	// Generate indices
	for (let i = 0; i < rings; i++) {
		for (let j = 0; j < segments; j++) {
			const first = i * (segments + 1) + j;
			const second = first + segments + 1;

			indices.push(first, second, first + 1);
			indices.push(second, second + 1, first + 1);
		}
	}

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	return {
		position: positionBuffer,
		color: colorBuffer,
		indices: indexBuffer,
		count: indices.length
	};
}

function drawScene(gl, programInfo, buffers, rotation) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const fieldOfView = (45 * Math.PI) / 180;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();

	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	const modelViewMatrix = mat4.create();
	mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -5.0]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 1, 0]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, rotation * 0.7, [1, 0, 0]);

	// Bind position buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

	// Bind color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
	gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

	// Bind index buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

	gl.useProgram(programInfo.program);

	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

	gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0);
}

function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.error(
			'Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram)
		);
		return null;
	}

	return shaderProgram;
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

init();
