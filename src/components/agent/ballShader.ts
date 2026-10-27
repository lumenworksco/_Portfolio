// Soft iridescent ball: domain-warped pastel flow on a lit sphere, over a white page.

export const BALL_VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const BALL_FRAG = `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer; // -1..1 across the window, y up
uniform vec2  uMouse;   // cursor in ball space
uniform float uMouseAmt;
uniform float uPulse;   // 0..1, a soft "pop" after a click

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


mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
  float t = uTime;

  // gentle float; the shadow breathes with it
  float bob = sin(t * 0.7) * 0.022;
  vec2 centre = vec2(uPointer.x * 0.02, bob + uPointer.y * 0.014);
  vec2 toM = uMouse - uv;
  float md = length(toM);
  float infl = exp(-md * md * 2.6) * uMouseAmt;

  float R = 0.58 * (1.0 + uPulse * 0.04);
  vec2 p = uv - centre - toM * infl * 0.08;
  float rr = length(p) / R;
  float inside = 1.0 - smoothstep(0.94, 1.0, rr);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (rr < 1.02) {
    float z = sqrt(max(0.0, 1.0 - rr * rr));
    vec3 n = vec3(p / R, z);

    vec3 d = n;
    d.xz *= rot(t * 0.07 + uPointer.x * 0.35);
    d.yz *= rot(t * 0.05 + uPointer.y * 0.35);
    d += vec3(toM * infl * 0.8, 0.0);

    float flow = 1.0 + uPulse * 1.5;
    vec3 q = d * 0.42;
    vec3 warp = vec3(
      snoise(q + vec3(0.0, t * 0.05 * flow, 1.3)),
      snoise(q + vec3(4.1, 2.2, t * 0.045 * flow)),
      snoise(q + vec3(7.7, t * 0.04 * flow, 5.2))
    );
    float f1 = snoise(q * 1.0 + warp * 1.1) * 1.15 + n.x * 0.5 - n.y * 0.1;
    float f2 = snoise(q * 0.9 + vec3(4.0, 1.0, 2.0) - warp * 1.0) * 1.15 - n.x * 0.55 + n.y * 0.5;

    vec3 blue  = vec3(0.27, 0.51, 0.84);
    vec3 peri  = vec3(0.71, 0.76, 0.94);
    vec3 lav   = vec3(0.67, 0.64, 0.86);
    vec3 peach = vec3(0.99, 0.88, 0.89);

    vec3 c = mix(peri, blue, smoothstep(-0.45, 0.95, f1));
    c = mix(c, lav, smoothstep(0.4, -0.8, f1) * 0.7);
    c = mix(c, peach, smoothstep(-0.15, 0.95, f2) * 0.95);

    // soft light from the top left, a little cooler and deeper to the bottom right
    vec3 L = normalize(vec3(-0.5 + uPointer.x * 0.25, 0.6 + uPointer.y * 0.25, 0.65));
    float diff = dot(normalize(n), L) * 0.5 + 0.5;
    c *= 0.84 + 0.22 * diff;
    c = mix(c, c * vec3(0.9, 0.93, 1.05), pow(1.0 - diff, 2.0) * 0.6);

    // milky edge and a faint sheen
    c = mix(c, vec3(0.9, 0.91, 0.99), pow(1.0 - z, 2.0) * 0.62);
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    c += vec3(1.0) * pow(max(dot(normalize(n), H), 0.0), 18.0) * 0.1;

    col = c * inside;
    alpha = inside;
  }

  // soft contact shadow on the white page
  vec2 sc = vec2(uv.x / 0.5, (uv.y + 0.76 + bob * 0.4) / 0.1);
  float sh = exp(-dot(sc, sc) * 1.3) * (0.34 - bob * 2.2);
  vec3 shCol = vec3(0.58, 0.64, 0.93);
  // faint bluish bloom around the ball
  float bloom = exp(-max(rr - 1.0, 0.0) * 4.0) * 0.09 * (1.0 - inside);

  float outA = sh + bloom;
  vec3 outC = shCol * sh + vec3(0.62, 0.68, 0.95) * bloom;
  col += outC * (1.0 - inside);
  alpha = alpha + outA * (1.0 - inside);

  // fade everything but the ball to nothing before the canvas edge
  float edge = 1.0 - smoothstep(0.78, 1.0, length(uv));
  col *= mix(1.0, edge, 1.0 - inside);
  alpha *= mix(1.0, edge, 1.0 - inside);

  fragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;
