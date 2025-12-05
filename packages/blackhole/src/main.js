import { vec3 } from 'gl-matrix';
import { vertexShaderSource, fragmentShaderSource } from './shaders.js';

let gl, mainProgram, bloomProgram, compositeProgram, mainVao;
let framebuffers = {};

const camera = {
  distance: 40.0,
  theta: 0.0,
  phi: Math.PI / 2.5,
  autoRotate: true,
  rotateSpeed: 0.08
};

const mouse = { down: false, x: 0, y: 0 };

const QUALITY = {
  low:    { resolution: 0.35, maxSteps: 80,  bloomRes: 0.125, bloomPasses: 1 },
  medium: { resolution: 0.5,  maxSteps: 120, bloomRes: 0.2,   bloomPasses: 1 },
  high:   { resolution: 0.75, maxSteps: 160, bloomRes: 0.25,  bloomPasses: 2 },
  ultra:  { resolution: 1.0,  maxSteps: 200, bloomRes: 0.33,  bloomPasses: 2 }
};

const params = {
  mass: 1.0,
  spin: 0.0,
  quality: 'medium',
  bloom: true,
  bloomStrength: 0.35
};

const bloomBlurShader = `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_texture;
uniform vec2 u_direction;
uniform vec2 u_texelSize;

void main() {
  vec3 result = texture(u_texture, v_uv).rgb * 0.29;
  vec2 off1 = u_direction * u_texelSize * 1.5;
  vec2 off2 = u_direction * u_texelSize * 3.5;
  result += (texture(u_texture, v_uv + off1).rgb + texture(u_texture, v_uv - off1).rgb) * 0.23;
  result += (texture(u_texture, v_uv + off2).rgb + texture(u_texture, v_uv - off2).rgb) * 0.12;
  fragColor = vec4(result, 1.0);
}`;

const compositeShader = `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_bloomStrength;

void main() {
  vec3 scene = texture(u_scene, v_uv).rgb;
  vec3 bloom = texture(u_bloom, v_uv).rgb;
  fragColor = vec4(scene + bloom * u_bloomStrength, 1.0);
}`;

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function createProgram(vsSource, fsSource) {
  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;
  
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function createFramebuffer(width, height, useFloat = true) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  if (useFloat) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  return { framebuffer: fb, texture, width, height };
}

function init(canvas) {
  gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });
  
  if (!gl) throw new Error('WebGL2 not supported');
  gl.getExtension('EXT_color_buffer_float');

  mainProgram = createProgram(vertexShaderSource, fragmentShaderSource);
  bloomProgram = createProgram(vertexShaderSource, bloomBlurShader);
  compositeProgram = createProgram(vertexShaderSource, compositeShader);

  mainVao = gl.createVertexArray();
  gl.bindVertexArray(mainVao);
  
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  
  [mainProgram, bloomProgram, compositeProgram].forEach(prog => {
    if (prog) {
      const loc = gl.getAttribLocation(prog, 'a_position');
      if (loc >= 0) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      }
    }
  });
  
  mainProgram.u = {
    time: gl.getUniformLocation(mainProgram, 'u_time'),
    resolution: gl.getUniformLocation(mainProgram, 'u_resolution'),
    cameraPos: gl.getUniformLocation(mainProgram, 'u_cameraPos'),
    cameraMatrix: gl.getUniformLocation(mainProgram, 'u_cameraMatrix'),
    blackHoleMass: gl.getUniformLocation(mainProgram, 'u_blackHoleMass'),
    blackHoleSpin: gl.getUniformLocation(mainProgram, 'u_blackHoleSpin'),
    maxSteps: gl.getUniformLocation(mainProgram, 'u_maxSteps')
  };
}

function getCameraPosition() {
  const sp = Math.sin(camera.phi), cp = Math.cos(camera.phi);
  const st = Math.sin(camera.theta), ct = Math.cos(camera.theta);
  return [camera.distance * sp * ct, camera.distance * cp, camera.distance * sp * st];
}

function getCameraMatrix() {
  const pos = getCameraPosition();
  const forward = vec3.create();
  vec3.normalize(forward, vec3.negate(forward, pos));
  
  const right = vec3.create();
  vec3.normalize(right, vec3.cross(right, forward, [0, 1, 0]));
  
  const up = vec3.create();
  vec3.cross(up, right, forward);
  
  return new Float32Array([
    right[0], right[1], right[2],
    up[0], up[1], up[2],
    forward[0], forward[1], forward[2]
  ]);
}

let lastWidth = 0, lastHeight = 0;

function resize() {
  const canvas = gl.canvas;
  const preset = QUALITY[params.quality];
  const dpr = Math.min(window.devicePixelRatio, 2) * preset.resolution;
  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);
  
  if (w !== lastWidth || h !== lastHeight) {
    canvas.width = w;
    canvas.height = h;
    lastWidth = w;
    lastHeight = h;
    
    const bloomW = Math.max(1, Math.floor(w * preset.bloomRes));
    const bloomH = Math.max(1, Math.floor(h * preset.bloomRes));
    
    framebuffers.scene = createFramebuffer(w, h);
    framebuffers.bloom1 = createFramebuffer(bloomW, bloomH, false);
    framebuffers.bloom2 = createFramebuffer(bloomW, bloomH, false);
  }
}

function render(time) {
  time *= 0.001;
  resize();

  if (camera.autoRotate) camera.theta += camera.rotateSpeed * 0.016;

  const preset = QUALITY[params.quality];
  const w = gl.canvas.width;
  const h = gl.canvas.height;

  gl.bindVertexArray(mainVao);

  const target = params.bloom ? framebuffers.scene.framebuffer : null;
  gl.bindFramebuffer(gl.FRAMEBUFFER, target);
  gl.viewport(0, 0, w, h);
  gl.useProgram(mainProgram);
  
  const u = mainProgram.u;
  gl.uniform1f(u.time, time);
  gl.uniform2f(u.resolution, w, h);
  gl.uniform3fv(u.cameraPos, getCameraPosition());
  gl.uniformMatrix3fv(u.cameraMatrix, false, getCameraMatrix());
  gl.uniform1f(u.blackHoleMass, params.mass);
  gl.uniform1f(u.blackHoleSpin, params.spin);
  gl.uniform1i(u.maxSteps, preset.maxSteps);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  if (params.bloom && bloomProgram && compositeProgram) {
    const bw = framebuffers.bloom1.width;
    const bh = framebuffers.bloom1.height;
    
    gl.useProgram(bloomProgram);
    gl.viewport(0, 0, bw, bh);
    
    const texelLoc = gl.getUniformLocation(bloomProgram, 'u_texelSize');
    const dirLoc = gl.getUniformLocation(bloomProgram, 'u_direction');
    const texLoc = gl.getUniformLocation(bloomProgram, 'u_texture');
    
    gl.uniform2f(texelLoc, 1.0 / bw, 1.0 / bh);
    gl.uniform1i(texLoc, 0);
    gl.activeTexture(gl.TEXTURE0);
    
    for (let pass = 0; pass < preset.bloomPasses; pass++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers.bloom1.framebuffer);
      gl.bindTexture(gl.TEXTURE_2D, pass === 0 ? framebuffers.scene.texture : framebuffers.bloom2.texture);
      gl.uniform2f(dirLoc, 1.0 + pass, 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers.bloom2.framebuffer);
      gl.bindTexture(gl.TEXTURE_2D, framebuffers.bloom1.texture);
      gl.uniform2f(dirLoc, 0.0, 1.0 + pass);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(compositeProgram);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, framebuffers.scene.texture);
    gl.uniform1i(gl.getUniformLocation(compositeProgram, 'u_scene'), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, framebuffers.bloom2.texture);
    gl.uniform1i(gl.getUniformLocation(compositeProgram, 'u_bloom'), 1);
    
    gl.uniform1f(gl.getUniformLocation(compositeProgram, 'u_bloomStrength'), params.bloomStrength);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  requestAnimationFrame(render);
}

function setupControls(canvas) {
  canvas.addEventListener('mousedown', e => {
    mouse.down = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    camera.autoRotate = false;
  });

  canvas.addEventListener('mousemove', e => {
    if (!mouse.down) return;
    camera.theta -= (e.clientX - mouse.x) * 0.005;
    camera.phi = Math.max(0.1, Math.min(Math.PI - 0.1, camera.phi + (e.clientY - mouse.y) * 0.005));
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  canvas.addEventListener('mouseup', () => mouse.down = false);
  canvas.addEventListener('mouseleave', () => mouse.down = false);

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    camera.distance = Math.max(8, Math.min(150, camera.distance * (1 + e.deltaY * 0.001)));
  }, { passive: false });

  let touchDist = 0;
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    camera.autoRotate = false;
    if (e.touches.length === 1) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      touchDist = Math.hypot(dx, dy);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      camera.theta -= (e.touches[0].clientX - mouse.x) * 0.005;
      camera.phi = Math.max(0.1, Math.min(Math.PI - 0.1, camera.phi + (e.touches[0].clientY - mouse.y) * 0.005));
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      camera.distance = Math.max(8, Math.min(150, camera.distance * touchDist / dist));
      touchDist = dist;
    }
  }, { passive: false });

  canvas.addEventListener('dblclick', () => {
    camera.distance = 40;
    camera.theta = 0;
    camera.phi = Math.PI / 2.5;
    camera.autoRotate = true;
  });

  window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    switch (key) {
      case ' ':
        e.preventDefault();
        camera.autoRotate = !camera.autoRotate;
        break;
      case 'arrowup':
        params.spin = Math.min(0.99, params.spin + 0.1);
        console.log(`Spin: ${(params.spin * 100).toFixed(0)}%`);
        break;
      case 'arrowdown':
        params.spin = Math.max(0, params.spin - 0.1);
        console.log(`Spin: ${(params.spin * 100).toFixed(0)}%`);
        break;
      case 'arrowright':
        params.mass = Math.min(3, params.mass + 0.2);
        console.log(`Mass: ${params.mass.toFixed(1)}M`);
        break;
      case 'arrowleft':
        params.mass = Math.max(0.5, params.mass - 0.2);
        console.log(`Mass: ${params.mass.toFixed(1)}M`);
        break;
      case '1': params.quality = 'low'; lastWidth = 0; console.log('Quality: LOW'); break;
      case '2': params.quality = 'medium'; lastWidth = 0; console.log('Quality: MEDIUM'); break;
      case '3': params.quality = 'high'; lastWidth = 0; console.log('Quality: HIGH'); break;
      case '4': params.quality = 'ultra'; lastWidth = 0; console.log('Quality: ULTRA'); break;
      case 'b':
        params.bloom = !params.bloom;
        console.log(`Bloom: ${params.bloom ? 'ON' : 'OFF'}`);
        break;
      case '=':
      case '+':
        params.bloomStrength = Math.min(1.5, params.bloomStrength + 0.1);
        console.log(`Bloom: ${params.bloomStrength.toFixed(1)}`);
        break;
      case '-':
        params.bloomStrength = Math.max(0, params.bloomStrength - 0.1);
        console.log(`Bloom: ${params.bloomStrength.toFixed(1)}`);
        break;
      case 'r':
        Object.assign(camera, { distance: 40, theta: 0, phi: Math.PI / 2.5, autoRotate: true });
        Object.assign(params, { mass: 1, spin: 0, quality: 'medium', bloom: true, bloomStrength: 0.35 });
        lastWidth = 0;
        console.log('Reset');
        break;
    }
  });
}

const canvas = document.getElementById('canvas');
try {
  init(canvas);
  setupControls(canvas);
  requestAnimationFrame(render);
  
  console.log('%c★ Black Hole ★', 'font-size:18px;font-weight:bold;color:#f80');
  console.log('Drag/Scroll: Camera | Space: Auto-rotate');
  console.log('↑/↓: Spin | ←/→: Mass | 1-4: Quality | B: Bloom | R: Reset');
} catch (e) {
  console.error('Init failed:', e);
}
