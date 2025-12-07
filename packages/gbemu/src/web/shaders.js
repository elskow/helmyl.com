export const SHADER_NONE = 0;
export const SHADER_LCD = 1;
export const SHADER_CRT_SCANLINES = 2;
export const SHADER_CRT_CURVED = 3;
export const SHADER_COUNT = 4;

export const SHADER_NAMES = ['None', 'LCD Grid', 'CRT Scanlines', 'CRT Curved'];

export const vertexShaderSource = `
	attribute vec2 a_position;
	attribute vec2 a_texCoord;
	varying vec2 v_texCoord;
	void main() {
		gl_Position = vec4(a_position, 0.0, 1.0);
		v_texCoord = a_texCoord;
	}
`;

export const fragmentShaderNone = `
	precision mediump float;
	uniform sampler2D u_texture;
	varying vec2 v_texCoord;
	void main() {
		gl_FragColor = texture2D(u_texture, v_texCoord);
	}
`;

export const fragmentShaderLCD = `
	precision mediump float;
	uniform sampler2D u_texture;
	uniform vec2 u_resolution;
	varying vec2 v_texCoord;
	
	void main() {
		vec4 color = texture2D(u_texture, v_texCoord);
		vec2 pixelPos = v_texCoord * u_resolution;
		vec2 subPixel = fract(pixelPos * 3.0);
		
		float gridX = smoothstep(0.0, 0.1, subPixel.x) * smoothstep(1.0, 0.9, subPixel.x);
		float gridY = smoothstep(0.0, 0.1, subPixel.y) * smoothstep(1.0, 0.9, subPixel.y);
		float grid = gridX * gridY;
		
		vec3 subpixelMask = vec3(1.0);
		float subX = fract(pixelPos.x * 3.0);
		if (subX < 0.33) {
			subpixelMask = vec3(1.1, 0.9, 0.9);
		} else if (subX < 0.66) {
			subpixelMask = vec3(0.9, 1.1, 0.9);
		} else {
			subpixelMask = vec3(0.9, 0.9, 1.1);
		}
		
		vec3 finalColor = color.rgb * grid * 0.85 + color.rgb * 0.15;
		finalColor *= subpixelMask;
		
		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

export const fragmentShaderCRTScanlines = `
	precision mediump float;
	uniform sampler2D u_texture;
	uniform vec2 u_resolution;
	uniform float u_time;
	varying vec2 v_texCoord;
	
	void main() {
		vec2 uv = v_texCoord;
		vec4 color = texture2D(u_texture, uv);
		
		float scanline = sin(uv.y * u_resolution.y * 3.14159) * 0.5 + 0.5;
		scanline = pow(scanline, 0.3) * 0.3 + 0.7;
		
		vec2 pixelSize = 1.0 / u_resolution;
		vec4 glow = texture2D(u_texture, uv + vec2(pixelSize.x, 0.0)) * 0.25;
		glow += texture2D(u_texture, uv - vec2(pixelSize.x, 0.0)) * 0.25;
		glow += color * 0.5;
		
		vec3 finalColor = mix(color.rgb, glow.rgb, 0.2);
		finalColor *= scanline;
		
		vec2 vignetteUV = uv * (1.0 - uv.yx);
		float vignette = vignetteUV.x * vignetteUV.y * 15.0;
		vignette = pow(vignette, 0.15);
		finalColor *= vignette;
		
		finalColor *= 1.15;
		
		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

export const fragmentShaderCRTCurved = `
	precision mediump float;
	uniform sampler2D u_texture;
	uniform vec2 u_resolution;
	uniform float u_time;
	varying vec2 v_texCoord;
	
	vec2 curveUV(vec2 uv) {
		uv = uv * 2.0 - 1.0;
		vec2 offset = abs(uv.yx) / vec2(6.0, 4.0);
		uv = uv + uv * offset * offset;
		uv = uv * 0.5 + 0.5;
		return uv;
	}
	
	void main() {
		vec2 uv = curveUV(v_texCoord);
		
		if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			return;
		}
		
		vec4 color = texture2D(u_texture, uv);
		
		float aberration = length(v_texCoord - 0.5) * 0.01;
		float r = texture2D(u_texture, uv + vec2(aberration, 0.0)).r;
		float b = texture2D(u_texture, uv - vec2(aberration, 0.0)).b;
		color.r = r;
		color.b = b;
		
		float scanline = sin(uv.y * u_resolution.y * 3.14159) * 0.5 + 0.5;
		scanline = pow(scanline, 0.25) * 0.25 + 0.75;
		
		float pixelLine = sin(uv.x * u_resolution.x * 3.14159) * 0.5 + 0.5;
		pixelLine = pow(pixelLine, 0.5) * 0.1 + 0.9;
		
		vec3 finalColor = color.rgb * scanline * pixelLine;
		
		vec2 vignetteUV = uv * (1.0 - uv.yx);
		float vignette = vignetteUV.x * vignetteUV.y * 20.0;
		vignette = pow(vignette, 0.2);
		finalColor *= vignette;
		
		finalColor += color.rgb * 0.05;
		finalColor *= 1.2;
		
		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

export const fragmentShaders = [
	fragmentShaderNone,
	fragmentShaderLCD,
	fragmentShaderCRTScanlines,
	fragmentShaderCRTCurved
];
