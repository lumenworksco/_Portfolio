"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ORB_FRAG, ORB_VERT } from "./orbShader";
import type { OrbState } from "./Orb";

interface Props {
  state: OrbState;
  pulse: number;
  typing?: number;
  className?: string;
  /** Called if WebGL2 or the shader is unavailable, so the caller can fall back. */
  onFail: () => void;
}

type V3 = [number, number, number];
interface Look {
  energy: number;
  spin: number;
  think: number;
  a: V3;
  b: V3;
  c: V3;
}

const LOOKS: Record<OrbState, Look> = {
  idle: { energy: 0.22, spin: 0.25, think: 0, a: [0.03, 0.05, 0.22], b: [0.15, 0.45, 0.95], c: [0.55, 0.9, 1.0] },
  listening: { energy: 0.5, spin: 0.5, think: 0, a: [0.02, 0.07, 0.24], b: [0.1, 0.6, 0.98], c: [0.65, 0.95, 1.0] },
  thinking: { energy: 0.85, spin: 1.6, think: 1, a: [0.13, 0.03, 0.26], b: [0.62, 0.25, 0.95], c: [1.0, 0.55, 0.9] },
  speaking: { energy: 0.62, spin: 0.7, think: 0, a: [0.02, 0.1, 0.18], b: [0.1, 0.7, 0.85], c: [0.8, 1.0, 0.95] },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (cur: V3, to: V3, t: number) => {
  cur[0] = lerp(cur[0], to[0], t);
  cur[1] = lerp(cur[1], to[1], t);
  cur[2] = lerp(cur[2], to[2], t);
};

export default function OrbGL({ state, pulse, typing = 0, className, onFail }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const stateRef = useRef<OrbState>(state);
  const typingRef = useRef(typing);
  const pulseRef = useRef(0);
  const lastPulse = useRef(pulse);
  const failRef = useRef(onFail);

  useEffect(() => {
    stateRef.current = state;
    typingRef.current = typing;
    failRef.current = onFail;
  }, [state, typing, onFail]);
  useEffect(() => {
    if (pulse !== lastPulse.current) {
      lastPulse.current = pulse;
      pulseRef.current = 1;
    }
  }, [pulse]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    } catch {
      failRef.current();
      return;
    }
    const gl = renderer.gl;
    if (!renderer.isWebgl2) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      failRef.current();
      return;
    }
    gl.clearColor(0, 0, 0, 0);

    const program = new Program(gl, {
      vertex: ORB_VERT,
      fragment: ORB_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uEnergy: { value: 0.2 },
        uPulse: { value: 0 },
        uThink: { value: 0 },
        uPointer: { value: [0, 0] },
        uColA: { value: [...LOOKS.idle.a] },
        uColB: { value: [...LOOKS.idle.b] },
        uColC: { value: [...LOOKS.idle.c] },
      },
    });
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      failRef.current();
      return;
    }

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = "block";
    wrap.appendChild(canvas);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const size = Math.max(160, Math.floor(Math.min(rect.width, rect.height)));
      renderer.setSize(size, size);
      program.uniforms.uRes.value = [canvas.width, canvas.height];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onLost = (e: Event) => {
      e.preventDefault();
      failRef.current();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    const cur = {
      energy: LOOKS.idle.energy,
      spin: LOOKS.idle.spin,
      think: 0,
      a: [...LOOKS.idle.a] as V3,
      b: [...LOOKS.idle.b] as V3,
      c: [...LOOKS.idle.c] as V3,
    };
    let phase = 0;
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = LOOKS[stateRef.current];
      const k = 1 - Math.pow(0.001, dt);

      cur.energy = lerp(cur.energy, Math.min(1, target.energy + typingRef.current * 0.35), k * 1.2);
      cur.spin = lerp(cur.spin, target.spin, k);
      cur.think = lerp(cur.think, target.think, k * 0.9);
      lerp3(cur.a, target.a, k);
      lerp3(cur.b, target.b, k);
      lerp3(cur.c, target.c, k);

      pulseRef.current = Math.max(0, pulseRef.current - dt * 2.4);
      phase += dt * (0.6 + cur.spin) * (reduced ? 0.15 : 1);
      pointer.x = lerp(pointer.x, pointer.tx, k * 0.6);
      pointer.y = lerp(pointer.y, pointer.ty, k * 0.6);

      const u = program.uniforms;
      u.uTime.value = phase;
      u.uEnergy.value = cur.energy;
      u.uPulse.value = pulseRef.current;
      u.uThink.value = cur.think;
      u.uPointer.value = [pointer.x, pointer.y];
      u.uColA.value = cur.a;
      u.uColB.value = cur.b;
      u.uColC.value = cur.c;

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (canvas.parentNode === wrap) wrap.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reduced]);

  return <div ref={wrapRef} className={className} aria-hidden="true" style={{ display: "grid", placeItems: "center" }} />;
}
