export const vertexShaderSource = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_cameraPos;
uniform mat3 u_cameraMatrix;
uniform float u_blackHoleMass;
uniform float u_blackHoleSpin;
uniform int u_maxSteps;

const float PI = 3.14159265359;

float hash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

vec3 starfield(vec3 rd) {
  vec3 col = vec3(0.015, 0.01, 0.025);
  col += vec3(0.12, 0.1, 0.15) * exp(-abs(rd.y) * 3.0) * 0.12;
  
  for (int layer = 0; layer < 2; layer++) {
    float scale = 90.0 + float(layer) * 70.0;
    vec3 p = rd * scale;
    vec3 id = floor(p);
    vec3 f = fract(p) - 0.5;
    float h = hash(id + float(layer) * 100.0);
    
    if (h > 0.92) {
      float brightness = (h - 0.92) * 12.5;
      float star = exp(-dot(f, f) * 80.0);
      vec3 starCol = mix(vec3(1.0, 0.8, 0.6), vec3(0.7, 0.85, 1.0), hash(id + 50.0));
      col += star * brightness * starCol;
    }
  }
  return col;
}

vec3 blackbodyColor(float t) {
  // Attempt to approximate planck's law for black body radiation
  // Higher t = hotter = bluer, lower t = cooler = redder
  vec3 c;
  c.r = clamp(t * 2.0, 0.0, 1.0);
  c.g = clamp(t * 1.5 - 0.2, 0.0, 1.0);
  c.b = clamp(t - 0.5, 0.0, 1.0);
  return mix(c, vec3(0.9, 0.95, 1.0), clamp(t - 1.2, 0.0, 0.5) * 2.0);
}

vec3 accretionDisk(vec3 pos, vec3 vel, float rs, float innerR, float outerR) {
  float r = length(pos.xz);
  if (r < innerR || r > outerR) return vec3(0.0);
  
  float invR = 1.0 / r;
  float angle = atan(pos.z, pos.x);
  
  // Keplerian orbital velocity: v = sqrt(GM/r) = sqrt(rs/(2r))
  float v = sqrt(rs * 0.5 * invR);
  vec3 orbitVel = v * vec3(-pos.z, 0.0, pos.x) * invR;
  
  // Relativistic Doppler factor: D = 1/(γ(1 - v·n̂))
  // γ = 1/sqrt(1-v²) is Lorentz factor
  float vDotN = dot(orbitVel, -vel);
  float gamma = inversesqrt(max(0.01, 1.0 - v * v));
  float doppler = clamp(1.0 / (gamma * (1.0 - vDotN)), 0.2, 5.0);
  
  // Gravitational redshift: g = sqrt(1 - rs/r)
  float grav = sqrt(max(0.01, 1.0 - rs * invR));
  
  // Temperature profile: T ∝ r^(-3/4) (Shakura-Sunyaev thin disk)
  float temp = pow(innerR * invR, 0.75) * doppler * grav;
  vec3 col = blackbodyColor(temp);
  
  // Intensity with doppler beaming: I ∝ D² (simplified from D⁴)
  float intensity = doppler * doppler * temp;
  float pattern = 0.75 + 0.25 * sin(angle * 2.0 - log(r) * 4.0 + u_time * 0.3);
  float falloff = 1.0 - smoothstep(innerR, outerR, r);
  
  return col * intensity * pattern * falloff * 2.0;
}

vec3 trace(vec3 ro, vec3 rd, float M, float spin, int maxSteps) {
  float rs = 2.0 * M;                                            // Schwarzschild radius: rs = 2GM/c²
  float rs2 = rs * rs;
  float rEvent = M + sqrt(max(0.001, M * M - spin * spin));      // Event horizon (Kerr): r+ = M + sqrt(M² - a²)
  float rPhoton = 1.5 * rs;                                      // Photon sphere: r = 3GM/c² = 1.5rs
  float innerDisk = 3.0 * rs * (1.0 - 0.5 * abs(spin));          // ISCO: 6M for Schwarzschild, less for Kerr
  float outerDisk = 12.0 * rs;
  float escapeR2 = 40000.0;
  
  vec3 pos = ro;
  vec3 vel = rd;
  vec3 diskColor = vec3(0.0);
  float diskAlpha = 0.0;
  float prevY = pos.y;
  float prevR2 = dot(pos, pos);
  int diskHits = 0;
  
  for (int i = 0; i < 200; i++) {
    if (i >= maxSteps) break;
    
    float r2 = dot(pos, pos);
    float r = sqrt(r2);
    float invR = 1.0 / r;
    
    if (r2 > escapeR2) {
      return diskColor + starfield(vel) * (1.0 - diskAlpha);
    }
    
    if (r2 > prevR2 * 1.001 && r > 50.0 && abs(pos.y) > outerDisk * 0.3) {
      return diskColor + starfield(vel) * (1.0 - diskAlpha);
    }
    
    if (r < rEvent) {
      return diskColor;
    }
    
    float stepSize;
    if (r < rPhoton * 1.5) {
      stepSize = 0.03 * r;
    } else if (r < 20.0 * rs) {
      stepSize = 0.15 * r * invR * rs;
    } else {
      stepSize = 0.5 + r * 0.02;
    }
    
    float y = pos.y;
    if (diskHits < 2 && abs(y) < outerDisk * 0.5) {
      if (prevY * y < 0.0) {
        float t = abs(prevY) / (abs(prevY) + abs(y) + 0.0001);
        vec3 hitPos = pos - vel * stepSize * (1.0 - t);
        vec3 dc = accretionDisk(hitPos, vel, rs, innerDisk, outerDisk);
        float lum = dot(dc, vec3(0.3, 0.5, 0.2));
        if (lum > 0.001) {
          diskColor += dc * (1.0 - diskAlpha);
          diskAlpha = min(diskAlpha + 0.6, 0.95);
          diskHits++;
        }
      }
    }
    prevY = y;
    prevR2 = r2;
    
    // Geodesic equation for null rays in Schwarzschild metric
    // d²r/dλ² = -Γʳₜₜ(dt/dλ)² - Γʳᵣᵣ(dr/dλ)² - Γʳθθ(dθ/dλ)² - Γʳφφ(dφ/dλ)²
    // Simplifies to: a = -1.5 * rs * h²/r⁴ * r̂
    // where h = |r × v| is specific angular momentum
    vec3 L = cross(pos, vel);
    float h2 = dot(L, L);
    float r4 = r2 * r2;
    float accelMag = 1.5 * rs * h2 / r4;
    vec3 rhat = pos * invR;
    vec3 accel = -accelMag * rhat;
    
    // Frame dragging (Lense-Thirring): Ω = 2Ma/r³
    // Adds precession to orbits around spinning black hole
    if (abs(spin) > 0.05) {
      accel += cross(vec3(0.0, 1.0, 0.0), vel) * (2.0 * spin * rs2 / (r2 * r));
    }
    
    // Leapfrog integration: x(t+dt) = x(t) + v(t)dt + 0.5a(t)dt²
    vel += accel * stepSize;
    pos += vel * stepSize;
    vel = normalize(vel);
  }
  
  return diskColor + starfield(vel) * (1.0 - diskAlpha);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  
  vec3 ro = u_cameraPos;
  vec3 rd = normalize(u_cameraMatrix * vec3(uv, 1.0));
  
  float M = u_blackHoleMass;
  float spin = u_blackHoleSpin * M * 0.99;
  
  vec3 color = trace(ro, rd, M, spin, u_maxSteps);
  
  // ACES tonemapping: attempt to map hdr values to ldr output
  color = color * (color + 0.1) / (color * 0.9 + 0.3);
  color = pow(clamp(color, 0.0, 1.0), vec3(0.45));
  color *= 1.0 - dot(v_uv - 0.5, v_uv - 0.5) * 0.3;
  
  fragColor = vec4(color, 1.0);
}
`;
