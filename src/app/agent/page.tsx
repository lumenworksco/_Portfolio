import Link from "next/link";
import Ball from "@/components/agent/Ball";

// The orb in the middle of a quiet twilight stage. The earlier chat interface lives in git
// history (a06be39) and in src/lib/agentEngine.ts + src/data/agentKnowledge.ts.

// Deterministic so server and client render the same dust.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20241027);
const DUST = Array.from({ length: 46 }, () => ({
  x: rand() * 100,
  y: rand() * 100,
  s: 1 + rand() * 2.2,
  d: 3 + rand() * 6,
  delay: rand() * 8,
  drift: 14 + rand() * 40,
  warm: rand() > 0.72,
}));

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface RingSpec {
  rx: number;
  ry: number;
  rot: number;
  dur: number;
  reverse?: boolean;
  front: boolean;
  opacity: number;
}

const RINGS: RingSpec[] = [
  { rx: 495, ry: 205, rot: 8, dur: 52, front: false, opacity: 0.55 },
  { rx: 425, ry: 150, rot: -16, dur: 30, front: true, opacity: 1 },
  { rx: 355, ry: 118, rot: 58, dur: 38, reverse: true, front: true, opacity: 0.85 },
];

const ellipsePath = (rx: number, ry: number) =>
  `M ${500 - rx},500 a ${rx},${ry} 0 1,0 ${2 * rx},0 a ${rx},${ry} 0 1,0 ${-2 * rx},0`;

function Rings({ half }: { half: "back" | "front" }) {
  const clip = half === "front";
  return (
    <svg
      viewBox="0 0 1000 1000"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`rg-${half}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a5b4fc" stopOpacity="0" />
          <stop offset="0.25" stopColor="#c4b5fd" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#fbcfe8" stopOpacity="0.7" />
          <stop offset="0.75" stopColor="#93c5fd" stopOpacity="0.55" />
          <stop offset="1" stopColor="#a5b4fc" stopOpacity="0" />
        </linearGradient>
        {/* Only the half of each ring that passes in front of the orb is drawn above it. */}
        <clipPath id={`front-${half}`}>
          <rect x="-200" y="500" width="1400" height="800" />
        </clipPath>
      </defs>
      <g clipPath={clip ? `url(#front-${half})` : undefined}>
        {RINGS.filter((r) => (clip ? r.front : true)).map((r, i) => (
          <g key={i} transform={`rotate(${r.rot} 500 500)`} opacity={r.opacity}>
            <path d={ellipsePath(r.rx, r.ry)} fill="none" stroke={`url(#rg-${half})`} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
            <circle r="11" fill="rgba(165,180,255,0.18)">
              <animateMotion dur={`${r.dur}s`} repeatCount="indefinite" path={ellipsePath(r.rx, r.ry)} keyPoints={r.reverse ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear" />
            </circle>
            <circle r="3" fill="#eef2ff">
              <animateMotion dur={`${r.dur}s`} repeatCount="indefinite" path={ellipsePath(r.rx, r.ry)} keyPoints={r.reverse ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear" />
            </circle>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function AgentPage() {
  return (
    <main
      className="fixed inset-0 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 85% 75% at 50% 46%, #151b3d 0%, #0b0e22 52%, #05060f 100%)" }}
    >
      <h1 className="sr-only">An iridescent glass orb that drifts and follows your cursor</h1>

      {/* Slow aurora light in the orb's own palette */}
      <div aria-hidden="true" className="orb-aurora orb-aurora-a" />
      <div aria-hidden="true" className="orb-aurora orb-aurora-b" />
      <div aria-hidden="true" className="orb-aurora orb-aurora-c" />

      {/* Dust */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {DUST.map((d, i) => (
          <span
            key={i}
            className="orb-dust"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.s,
              height: d.s,
              background: d.warm ? "#fde3e2" : "#c7d2fe",
              color: d.warm ? "#fde3e2" : "#c7d2fe",
              animationDuration: `${d.d}s, ${d.drift}s`,
              animationDelay: `${d.delay}s, ${d.delay}s`,
            }}
          />
        ))}
      </div>

      {/* The orb, with rings that pass behind and in front of it */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[min(96vmin,900px)] w-[min(96vmin,900px)]">
          <Rings half="back" />
          <Ball className="absolute inset-0" />
          <Rings half="front" />
        </div>
      </div>

      {/* Film grain: also hides any gradient banding */}
      <div aria-hidden="true" className="orb-grain pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN }} />

      {/* Quiet chrome */}
      <Link href="/" className="orb-chrome orb-home">
        <span aria-hidden="true">←</span> Home
      </Link>
      <div className="orb-chrome orb-name">
        <span className="orb-name-main">Florian Braun</span>
        <span className="orb-name-sub">AI · Data · Research</span>
        <span className="orb-hint">Move your cursor close · click to pulse</span>
      </div>

      <style>{`
        .orb-aurora { position:absolute; width:70vmax; height:70vmax; border-radius:50%; pointer-events:none; will-change:transform; }
        .orb-aurora-a { left:-18vmax; top:-22vmax; background:radial-gradient(closest-side, rgba(68,133,213,0.26), rgba(68,133,213,0)); animation: orb-drift-a 38s ease-in-out infinite alternate; }
        .orb-aurora-b { right:-24vmax; bottom:-30vmax; background:radial-gradient(closest-side, rgba(174,168,216,0.22), rgba(174,168,216,0)); animation: orb-drift-b 46s ease-in-out infinite alternate; }
        .orb-aurora-c { left:30vw; bottom:-38vmax; width:60vmax; height:60vmax; background:radial-gradient(closest-side, rgba(253,200,210,0.13), rgba(253,200,210,0)); animation: orb-drift-a 52s ease-in-out infinite alternate-reverse; }
        @keyframes orb-drift-a { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(9vmax,6vmax,0) scale(1.12); } }
        @keyframes orb-drift-b { from { transform: translate3d(0,0,0) scale(1.05); } to { transform: translate3d(-8vmax,-7vmax,0) scale(0.95); } }

        .orb-dust { position:absolute; border-radius:50%; opacity:0; animation-name: orb-twinkle, orb-rise; animation-iteration-count: infinite, infinite; animation-timing-function: ease-in-out, linear; box-shadow: 0 0 6px currentColor; }
        @keyframes orb-twinkle { 0%,100% { opacity:0; } 50% { opacity:0.75; } }
        @keyframes orb-rise { from { transform: translateY(0); } to { transform: translateY(-60px); } }

        .orb-grain { opacity:0.085; mix-blend-mode: overlay; }

        .orb-chrome { position:absolute; z-index:5; font-family: var(--font-inter), system-ui, sans-serif; text-transform:uppercase; letter-spacing:0.24em; color: rgba(199,210,254,0.5); text-decoration:none; }
        .orb-home { top:22px; left:24px; font-size:11px; transition: color .2s ease; }
        .orb-home:hover, .orb-home:focus-visible { color: rgba(238,242,255,0.95); }
        .orb-home:focus-visible { outline:2px solid #a5b4fc; outline-offset:6px; border-radius:6px; }
        .orb-name { bottom:30px; left:0; right:0; display:flex; flex-direction:column; align-items:center; gap:7px; pointer-events:none; text-align:center; }
        .orb-name-main { font-size:12px; font-weight:500; color: rgba(224,231,255,0.72); }
        .orb-name-sub { font-size:9.5px; letter-spacing:0.3em; color: rgba(165,180,252,0.45); }
        .orb-hint { margin-top:10px; font-size:9.5px; letter-spacing:0.18em; color: rgba(199,210,254,0.42); opacity:0; animation: orb-hint 9s ease 1.2s both; }
        @keyframes orb-hint { 0% { opacity:0; transform: translateY(4px); } 12%, 78% { opacity:1; transform:none; } 100% { opacity:0; } }

        @media (prefers-reduced-motion: reduce) {
          .orb-aurora, .orb-dust, .orb-hint { animation: none; }
          .orb-dust { opacity: 0.35; }
          .orb-hint { opacity: 0.8; }
        }
      `}</style>
    </main>
  );
}
