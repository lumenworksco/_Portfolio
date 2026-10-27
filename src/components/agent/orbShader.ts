// GLSL for the plasma-sphere orb. Kept free of backticks and template placeholders so the
// body can also be pasted into an offscreen renderer for visual testing.

export const ORB_VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const ORB_FRAG = `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;    // accumulated phase, so speed changes never cause jumps
uniform float uEnergy;  // 0..1
uniform float uPulse;   // 0..1, decays after each streamed word
uniform float uThink;   // 0..1, extra turbulence while thinking
uniform vec2  uPointer; // -1..1
uniform vec3  uColA;    // deep body colour
uniform vec3  uColB;    // mid colour
uniform vec3  uColC;    // hot / highlight colour
uniform vec2  uMouse;   // cursor in orb space (-1..1 across the canvas, may exceed it)
uniform float uMouseAmt;// 0..1, how strongly the cursor is "felt"
uniform vec3  uWa;      // shape weights: circle, diamond, square
uniform vec3  uWb;      //                star, hexagon, heart
uniform vec3  uWc;      //                ring, triangle, envelope

out vec4 fragColor;

// ---- simplex noise (Ashima / Gustavson) ----
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * snoise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

// ---------- silhouettes (signed distance, negative inside) ----------
const float R = 0.4;
float dot2(vec2 v) { return dot(v, v); }

float sdRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float sdCircle(vec2 p) { return length(p) - R; }
float sdDiamond(vec2 p) { return (abs(p.x) + abs(p.y)) * 0.70711 - R * 0.92; }
float sdStar(vec2 p) {
  vec2 a = pow(abs(p) / (R * 1.3), vec2(0.7));
  return (pow(a.x + a.y, 1.0 / 0.7) - 1.0) * R * 0.6;
}
float sdHex(vec2 p) {
  const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  float r = R * 0.9;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}
float sdHeart(vec2 p) {
  float S = R * 1.75;
  p = p / S + vec2(0.0, 0.52);
  p.x = abs(p.x);
  float d;
  if (p.y + p.x > 1.0) {
    d = sqrt(dot2(p - vec2(0.25, 0.75))) - 0.35355339;
  } else {
    d = sqrt(min(dot2(p - vec2(0.0, 1.0)), dot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
  }
  return d * S;
}
float sdRing(vec2 p) { return abs(length(p) - R * 0.74) - R * 0.27; }
float sdTri(vec2 p) {
  float S = R * 1.0;
  p = p / S;
  const float k = 1.7320508;
  p.x = abs(p.x) - 1.0;
  p.y = p.y + 1.0 / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0, 0.0);
  return -length(p) * sign(p.y) * S;
}

float shapeSD(vec2 p) {
  float s = 0.0;
  if (uWa.x > 0.001) s += uWa.x * sdCircle(p);
  if (uWa.y > 0.001) s += uWa.y * sdDiamond(p);
  if (uWa.z > 0.001) s += uWa.z * sdRect(p, vec2(R * 0.78), R * 0.26);
  if (uWb.x > 0.001) s += uWb.x * sdStar(p);
  if (uWb.y > 0.001) s += uWb.y * sdHex(p);
  if (uWb.z > 0.001) s += uWb.z * sdHeart(p);
  if (uWc.x > 0.001) s += uWc.x * sdRing(p);
  if (uWc.y > 0.001) s += uWc.y * sdTri(p);
  if (uWc.z > 0.001) s += uWc.z * sdRect(p, vec2(R * 1.12, R * 0.74), R * 0.2);
  return s;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
  float t = uTime;
  float en = clamp(uEnergy, 0.0, 1.0);

  // ---- cursor: a plasma globe is drawn toward a touch ----
  vec2 toM = uMouse - uv;
  float md = length(toM);
  float infl = exp(-md * md * 3.2) * uMouseAmt;

  vec2 p = uv - uPointer * 0.025 - toM * infl * 0.16;
  float r = length(p);
  float rr = r / R;

  float sd = shapeSD(p);
  float inside = 1.0 - smoothstep(-0.003, 0.004, sd);
  vec3 col = vec3(0.0);

  // ---------- plasma body ----------
  if (sd < 0.012) {
    float dep = clamp(-sd / R, 0.0, 1.0);
    float z = sqrt(max(0.0, 1.0 - (1.0 - dep) * (1.0 - dep)));
    vec2 g = vec2(shapeSD(p + vec2(0.004, 0.0)) - sd, shapeSD(p + vec2(0.0, 0.004)) - sd);
    g = g / (length(g) + 1e-6);
    vec3 n = vec3(g * (1.0 - dep), z);

    // sample the plasma by position on the inflated surface (== the normal for a sphere),
    // so flat faces of angular shapes still get full plasma detail
    vec3 d = vec3(p / R, z);
    d.xz *= rot(t * 0.12 + uPointer.x * 0.5);
    d.yz *= rot(t * 0.07 + uPointer.y * 0.5 + 0.4);

    float sp = 0.55 + en * 0.9 + uThink * 0.8 + infl * 1.6;
    vec3 q = d * 1.7;
    float w = fbm(q + vec3(0.0, 0.0, t * 0.06 * sp));
    float f = fbm(q * 1.3 + w * (1.4 + uThink * 1.2 + infl * 0.8) + vec3(0.0, t * 0.09 * sp, 0.0));
    float ridge = 1.0 - abs(f * 1.7);
    float bands = pow(smoothstep(0.5, 1.0, ridge), 2.2);

    float el = 1.0 - abs(snoise(d * 3.4 + vec3(t * 0.25 * sp, 0.0, t * 0.18)));
    el = pow(clamp(el, 0.0, 1.0), 14.0) * (0.45 + en * 1.5 + uThink * 0.8 + infl * 2.4);

    vec3 body = mix(uColA * 0.55, uColB * 0.62, smoothstep(0.0, 0.85, f + 0.12));
    body += mix(uColB, uColC, 0.55) * bands * (0.9 + en * 1.1 + infl * 0.9);
    body += uColC * el * 1.35;

    float fres = pow(1.0 - z, 2.3);
    vec3 rim = mix(uColB, uColC, 0.55) * fres * (1.1 + en * 0.9);

    float core = exp(-rr * rr * 2.6);
    body += mix(uColB, uColC, 0.6) * core * (0.34 + en * 0.5 + uPulse * 0.6);

    // the spot nearest the cursor heats up
    body += uColC * infl * exp(-md * md * 26.0) * 0.9;

    vec3 nn = normalize(n);
    float spec = pow(max(dot(nn, normalize(vec3(-0.45, 0.55, 0.7))), 0.0), 40.0);
    float spec2 = pow(max(dot(nn, normalize(vec3(0.55, -0.45, 0.6))), 0.0), 16.0) * 0.25;

    vec3 sph = body * (0.62 + 0.38 * z) + rim * 0.9 + vec3(1.0) * spec * 0.6 + uColB * spec2 * 0.4;
    col += sph * inside;
  }

  // ---------- corona: rays lean toward the cursor ----------
  float ang = atan(p.y, p.x);
  float rays = snoise(vec3(cos(ang) * 1.7, sin(ang) * 1.7, t * 0.22)) * 0.5 + 0.5;
  float lean = max(dot(normalize(p + 1e-5), normalize(uMouse + 1e-5)), 0.0) * uMouseAmt;
  float fall = 3.4 - en * 1.0 - rays * 1.5 - uPulse * 0.8 - lean * 1.3;
  float halo = exp(-max(sd, 0.0) / R * fall);
  col += mix(uColB, uColC, 0.3) * halo * (1.0 - inside * 0.75) * (0.2 + en * 0.32 + uPulse * 0.25 + lean * 0.12);
  col += uColA * exp(-rr * 1.15) * 0.42;

  float ringR = 1.05 + (1.0 - uPulse) * 1.15;
  float ringD = (rr - ringR) * 9.0;
  col += uColC * exp(-ringD * ringD) * uPulse * 0.45;

  // ---------- lightning from the surface to the cursor ----------
  float m0 = length(uMouse);
  float boltAmt = uMouseAmt * smoothstep(R * 0.9, R * 1.35, m0) * (1.0 - smoothstep(R * 2.6, R * 3.6, m0));
  if (boltAmt > 0.01) {
    vec2 dirM = uMouse / m0;
    for (int k = 0; k < 2; k++) {
      float fk = float(k);
      vec2 dk = rot((fk - 0.5) * 0.22) * dirM;
      vec2 A = dk * R * 0.9;
      vec2 B = dk * min(m0, R * 2.5);
      vec2 AB = B - A;
      float len2 = dot(AB, AB) + 1e-5;
      float h = clamp(dot(p - A, AB) / len2, 0.0, 1.0);
      vec2 perp = vec2(-AB.y, AB.x) / sqrt(len2);
      vec2 qv = p - (A + AB * h);
      float wob = (snoise(vec3(h * 7.0 + fk * 5.0, t * 2.6, 3.0)) * 0.6 + snoise(vec3(h * 17.0, t * 5.5 + fk, 9.0)) * 0.25) * 0.045 * sin(h * 3.14159);
      float dl = abs(dot(qv, perp) - wob);
      float ends = smoothstep(0.0, 0.08, h) * (1.0 - smoothstep(0.9, 1.0, h));
      float flick = 0.7 + 0.3 * sin(t * 23.0 + fk * 4.0);
      float bolt = exp(-pow(dl / 0.0034, 2.0)) + exp(-dl * 38.0) * 0.2;
      col += mix(uColC, vec3(1.0), 0.45) * bolt * ends * boltAmt * flick * (fk > 0.5 ? 0.55 : 1.0);
    }
    vec2 tip = uMouse - p;
    col += uColC * exp(-dot(tip, tip) * 900.0) * boltAmt * 0.6;
  }

  // ---------- tilted orbital rings ----------
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 q2 = rot(t * (0.16 + 0.07 * fi) * (1.0 + uThink * 1.4) + fi * 2.1) * p;
    float squash = 2.4 + fi * 0.7;
    vec2 e = vec2(q2.x, q2.y * squash);
    float radius = R * (1.55 + 0.26 * fi);
    float rd = abs(length(e) - radius);
    float line = exp(-pow(rd / 0.0042, 2.0));
    float a2 = atan(e.y, e.x);
    float dash = smoothstep(0.1, 0.9, sin(a2 * (5.0 + fi * 3.0) - t * (0.8 + fi * 0.5)) * 0.5 + 0.5);
    float back = (q2.y < 0.0) ? (1.0 - inside) : 1.0;
    col += mix(uColB, uColC, 0.5) * line * (0.18 + dash * 0.5) * (0.5 + en * 0.7) * back;
  }

  // ---------- sparks, gently pulled toward the cursor ----------
  for (int i = 0; i < 26; i++) {
    float fi = float(i);
    float h = hash(fi);
    float h2 = hash(fi + 31.7);
    float dir = (h > 0.5) ? 1.0 : -1.0;
    float a = fi * 2.399 + t * (0.12 + h * 0.34) * dir * (1.0 + uThink);
    float rad = R * (1.22 + h2 * 0.95 + uPulse * 0.1);
    vec2 sp = vec2(cos(a), sin(a) * 0.92) * rad;
    sp += (uMouse - sp) * uMouseAmt * 0.08 * (0.4 + h);
    vec2 dv = p - sp;
    float tw = 0.35 + 0.65 * abs(sin(t * 1.6 + fi * 7.3));
    col += uColC * exp(-dot(dv, dv) * (5200.0 + h * 9000.0)) * tw * (0.55 + en * 0.9);
  }

  col *= 1.0 - smoothstep(0.62, 0.98, length(uv));
  col = 1.0 - exp(-col * 1.3);
  float alpha = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  fragColor = vec4(col, alpha);
}
`;
