export const vertexShaderSource = `
    attribute vec3 aPosition;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    }
`;

export const fragmentShaderSource = `
    precision mediump float;

    uniform vec3 uColor;
    uniform float uAlpha;

    void main() {
        gl_FragColor = vec4(uColor, uAlpha);
    }
`;
