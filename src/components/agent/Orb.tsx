"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface Props {
  state: OrbState;
  /** Increment to fire a visible pulse (e.g. once per streamed word). */
  pulse: number;
  /** 0..1 extra energy while the visitor is typing. */
  typing?: number;
  className?: string;
}

interface Look {
  energy: number;
  spin: number;
  // rgb triplets
  core: [number, number, number];
  mid: [number, number, number];
  rim: [number, number, number];
}

const LOOKS: Record<OrbState, Look> = {
  idle: { energy: 0.22, spin: 0.25, core: [215, 240, 255], mid: [96, 165, 250], rim: [167, 139, 250] },
  listening: { energy: 0.5, spin: 0.5, core: [225, 245, 255], mid: [56, 189, 248], rim: [129, 140, 248] },
  thinking: { energy: 0.85, spin: 1.6, core: [255, 235, 255], mid: [192, 132, 252], rim: [244, 114, 182] },
  speaking: { energy: 0.62, spin: 0.7, core: [240, 255, 250], mid: [52, 211, 235], rim: [167, 139, 250] },
};

const PARTICLES = 46;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rgba = (c: number[], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export default function Orb({ state, pulse, typing = 0, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  // Live inputs live in refs so the animation loop never restarts on re-render.
  const stateRef = useRef<OrbState>(state);
  const typingRef = useRef(typing);
  const pulseRef = useRef(0);
  const lastPulse = useRef(pulse);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    typingRef.current = typing;
  }, [typing]);
  useEffect(() => {
    if (pulse !== lastPulse.current) {
      lastPulse.current = pulse;
      pulseRef.current = 1;
    }
  }, [pulse]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let size = 0;
    let dpr = 1;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      size = Math.max(160, Math.floor(Math.min(rect.width, rect.height)));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Pointer: the orb leans gently toward the cursor.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const seeds = Array.from({ length: PARTICLES }, (_, i) => ({
      a: (i / PARTICLES) * Math.PI * 2 + Math.random() * 0.5,
      r: 1.18 + Math.random() * 0.55,
      s: (0.25 + Math.random() * 0.75) * (Math.random() > 0.5 ? 1 : -1),
      size: 0.6 + Math.random() * 1.6,
      tw: Math.random() * Math.PI * 2,
    }));

    const cur: Look = JSON.parse(JSON.stringify(LOOKS.idle));
    let energy = cur.energy;
    let phase = 0;
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = LOOKS[stateRef.current];
      const k = 1 - Math.pow(0.001, dt); // frame-rate independent easing
      const targetEnergy = Math.min(1, target.energy + typingRef.current * 0.35);
      energy = lerp(energy, targetEnergy, k * 1.2);
      cur.spin = lerp(cur.spin, target.spin, k);
      for (let i = 0; i < 3; i++) {
        cur.core[i] = lerp(cur.core[i], target.core[i], k);
        cur.mid[i] = lerp(cur.mid[i], target.mid[i], k);
        cur.rim[i] = lerp(cur.rim[i], target.rim[i], k);
      }
      pulseRef.current = Math.max(0, pulseRef.current - dt * 2.4);
      const p = pulseRef.current;

      const speed = reduced ? 0.15 : 1;
      phase += dt * (0.6 + cur.spin) * speed;
      pointer.x = lerp(pointer.x, pointer.tx, k * 0.6);
      pointer.y = lerp(pointer.y, pointer.ty, k * 0.6);

      const S = size * dpr;
      const cx = S / 2 + pointer.x * S * 0.025;
      const cy = S / 2 + pointer.y * S * 0.025;
      const R = S * 0.19 * (1 + p * 0.07 + energy * 0.04);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, S, S);
      ctx.globalCompositeOperation = "lighter";

      // Wide ambient glow
      // Capped at the canvas edge so the glow always fades to zero before it can be clipped
      const glowR = Math.min(S * 0.5, R * (2.4 + energy * 0.4 + p * 0.3));
      const glow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, glowR);
      glow.addColorStop(0, rgba(cur.mid, 0.34 + energy * 0.2 + p * 0.1));
      glow.addColorStop(0.45, rgba(cur.rim, 0.1 + energy * 0.08));
      glow.addColorStop(1, rgba(cur.rim, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, S, S);

      // Pulse rings
      if (p > 0.02) {
        for (let i = 0; i < 2; i++) {
          const rr = R * (1.05 + (1 - p) * (0.9 + i * 0.5));
          ctx.strokeStyle = rgba(cur.mid, p * 0.35 * (1 - i * 0.4));
          ctx.lineWidth = Math.max(1, S * 0.002);
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Three overlapping noisy membranes
      const amp = 0.035 + energy * 0.13 + p * 0.05;
      const layers = [
        { w: 1.0, ph: 0, a: 0.55, col: cur.mid },
        { w: -0.8, ph: 2.1, a: 0.45, col: cur.rim },
        { w: 1.4, ph: 4.2, a: 0.4, col: cur.core },
      ];
      const N = 120;
      for (const L of layers) {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const th = (i / N) * Math.PI * 2;
          const t = phase * L.w + L.ph;
          const wob =
            Math.sin(th * 3 + t * 1.3) * 0.5 +
            Math.sin(th * 5 - t * 1.9) * 0.3 +
            Math.sin(th * 2 + t * 0.7) * 0.2;
          const r = R * (1 + amp * wob);
          const x = cx + Math.cos(th) * r;
          const y = cy + Math.sin(th) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const g = ctx.createRadialGradient(
          cx - R * 0.25 + pointer.x * R * 0.15,
          cy - R * 0.3 + pointer.y * R * 0.15,
          R * 0.05,
          cx,
          cy,
          R * 1.15
        );
        g.addColorStop(0, rgba(cur.core, L.a * 0.9));
        g.addColorStop(0.55, rgba(L.col, L.a * 0.55));
        g.addColorStop(1, rgba(L.col, L.a * 0.05));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = rgba(L.col, 0.35 + energy * 0.25);
        ctx.lineWidth = Math.max(1, S * 0.0022);
        ctx.stroke();
      }

      // Bright core
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.62);
      core.addColorStop(0, rgba(cur.core, 0.85));
      core.addColorStop(1, rgba(cur.core, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.62, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting particles
      for (const s of seeds) {
        const ang = s.a + phase * s.s * (0.35 + cur.spin * 0.45);
        const rad = R * (s.r + Math.sin(phase * 0.8 + s.tw) * 0.05 + p * 0.12);
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(phase * 1.4 + s.tw));
        ctx.fillStyle = rgba(cur.core, tw * (0.35 + energy * 0.5));
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad * 0.92, s.size * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
