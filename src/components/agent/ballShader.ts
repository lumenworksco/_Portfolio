// Soft iridescent glass ball: domain-warped pastel flow on a lit sphere, glowing on a dark page.

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
uniform vec3  uBlue;    // palette: the four colours the swirls blend between
uniform vec3  uPeri;
uniform vec3  uLav;
uniform vec3  uPeach;

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

float hash2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
  float t = uTime;

  float bob = sin(t * 0.7) * 0.02;
  vec2 centre = vec2(uPointer.x * 0.02, bob + uPointer.y * 0.014);
  vec2 toM = uMouse - uv;
  float md = length(toM);
  float infl = exp(-md * md * 2.6) * uMouseAmt;

  float R = 0.54 * (1.0 + uPulse * 0.04);
  vec2 p = uv - centre - toM * infl * 0.07;
  float rr = length(p) / R;
  float inside = 1.0 - smoothstep(0.988, 1.0, rr);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (rr < 1.02) {
    float z = sqrt(max(0.0, 1.0 - rr * rr));
    vec3 n = vec3(p / R, z);
    vec3 nn = normalize(n);

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
    // fine, silky flow lines so the surface reads as material instead of blur
    float fine = snoise(d * 1.7 + warp * 0.9 + vec3(0.0, t * 0.05, 0.0));
    float veil = snoise(d * 2.6 + warp * 1.2 + vec3(t * 0.03, 0.0, 3.0));

    vec3 blue  = uBlue;
    vec3 peri  = uPeri;
    vec3 lav   = uLav;
    vec3 peach = uPeach;

    vec3 c = mix(peri, blue, smoothstep(-0.45, 0.95, f1));
    c = mix(c, lav, smoothstep(0.4, -0.8, f1) * 0.7);
    c = mix(c, peach, smoothstep(-0.15, 0.95, f2) * 0.95);
    c *= 1.0 + fine * 0.07 + veil * 0.02;

    // soft key light from the top left
    vec3 L = normalize(vec3(-0.5 + uPointer.x * 0.25, 0.6 + uPointer.y * 0.25, 0.65));
    float diff = dot(nn, L) * 0.5 + 0.5;
    c *= 0.8 + 0.3 * diff;
    c = mix(c, c * vec3(0.82, 0.88, 1.1), pow(1.0 - diff, 2.0) * 0.65);

    // warm bounce from below
    c += peach * pow(max(-nn.y, 0.0), 2.0) * 0.1;

    // pearly thin-film iridescence toward the edge
    float fres = pow(1.0 - z, 2.2);
    vec3 film = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + fres * 1.1 + nn.y * 0.25 + t * 0.02));
    c = mix(c, mix(c, film, 0.8), fres * 0.5);
    c = mix(c, vec3(0.93, 0.94, 1.0), pow(1.0 - z, 3.2) * 0.4);

    // glass: window reflection plus a tiny hotspot, and a cool rim light low right
    vec2 hp = vec2(nn.x + 0.40, nn.y - 0.50);
    float win = smoothstep(0.36, 0.1, length(hp * vec2(1.0, 1.55)));
    c = mix(c, vec3(1.0), win * 0.34);
    c += smoothstep(0.1, 0.0, length(vec2(nn.x + 0.48, nn.y - 0.56))) * 0.55;
    c += vec3(0.55, 0.68, 1.0) * pow(max(dot(nn, normalize(vec3(0.72, -0.5, 0.48))), 0.0), 18.0) * 0.22;

    // a hairline of light right on the silhouette keeps the edge crisp
    c += vec3(0.8, 0.85, 1.0) * smoothstep(0.93, 0.995, rr) * 0.22;

    col = c * inside;
    alpha = inside;
  }

  // ---- light around and under the ball (this sits on a dark page) ----
  float dOut = max(rr - 1.0, 0.0);
  float ang = atan(p.y, p.x);
  vec3 glowC = mix(mix(uBlue, vec3(1.0), 0.42), mix(uPeach, uLav, 0.5), 0.5 + 0.5 * sin(t * 0.15 + ang));
  float bloom = (exp(-dOut * 3.4) * 0.34 + exp(-dOut * 1.15) * 0.16) * (1.0 - inside);

  vec2 sc = vec2(uv.x / 0.58, (uv.y + 0.84 + bob * 0.4) / 0.1);
  float pool = exp(-dot(sc, sc) * 1.15) * (0.4 - bob * 2.0);
  float rip = (0.55 + 0.45 * fract(t * 0.12));
  float ripple = exp(-pow((length(sc) - rip * 1.05) * 4.5, 2.0)) * (1.0 - rip) * 0.28;
  vec3 poolC = mix(uBlue, vec3(1.0), 0.45);

  float edge = 1.0 - smoothstep(0.72, 1.0, length(uv));
  float aGlow = (bloom + pool + ripple) * edge;
  vec3 cGlow = (glowC * bloom + poolC * (pool + ripple)) * edge;
  col += cGlow * (1.0 - inside);
  alpha += aGlow * (1.0 - inside);

  // dither so the long soft falloffs never show banding
  float dn = (hash2(gl_FragCoord.xy + fract(t) * 17.0) - 0.5) * (2.0 / 255.0);
  float on = step(0.002, alpha);
  alpha = clamp(alpha + dn * on, 0.0, 1.0);
  col = min(max(col + dn * on, 0.0), vec3(alpha));

  fragColor = vec4(col, alpha);
}
`;
