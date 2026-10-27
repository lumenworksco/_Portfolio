"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { BALL_FRAG, BALL_VERT } from "./ballShader";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Static stand-in for browsers without WebGL2: the same palette as a CSS gradient. */
function FallbackBall({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
      <div
        style={{
          width: "58%",
          aspectRatio: "1",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 28%, #fde3e2 0%, rgba(253,227,226,0) 38%), radial-gradient(circle at 72% 58%, #4485d5 0%, rgba(68,133,213,0) 55%), radial-gradient(circle at 40% 80%, #b3beec 0%, rgba(179,190,236,0) 60%), #aea8d8",
          boxShadow: "0 40px 50px -18px rgba(148,163,238,0.45)",
        }}
      />
    </div>
  );
}

/** A soft, iridescent ball that drifts on its own, leans toward the cursor and pops when clicked. */
export default function Ball({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const failRef = useRef<() => void>(() => {});
  useEffect(() => {
    failRef.current = () => setFailed(true);
  }, []);

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
      vertex: BALL_VERT,
      fragment: BALL_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uPointer: { value: [0, 0] },
        uMouse: { value: [5, 5] },
        uMouseAmt: { value: 0 },
        uPulse: { value: 0 },
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
    const cursor = { cx: 0, cy: 0, has: false, x: 5, y: 5, amt: 0 };
    let pulse = 0;

    const toBallSpace = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const half = rect.width / 2 || 1;
      return { x: (clientX - (rect.left + half)) / half, y: -(clientY - (rect.top + rect.height / 2)) / half };
    };
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
      cursor.cx = e.clientX;
      cursor.cy = e.clientY;
      cursor.has = true;
    };
    const onDown = (e: PointerEvent) => {
      const m = toBallSpace(e.clientX, e.clientY);
      if (Math.hypot(m.x, m.y) < 0.75) pulse = 1;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") cursor.has = false;
    };
    const onLeave = () => {
      cursor.has = false;
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      failRef.current();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onLeave);
    document.documentElement.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("webglcontextlost", onLost);

    let phase = 0;
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = 1 - Math.pow(0.001, dt);

      pulse = Math.max(0, pulse - dt * 1.6);
      phase += dt * (reduced ? 0.12 : 1);
      pointer.x = lerp(pointer.x, reduced ? 0 : pointer.tx, k * 0.5);
      pointer.y = lerp(pointer.y, reduced ? 0 : pointer.ty, k * 0.5);

      if (cursor.has && !reduced) {
        const m = toBallSpace(cursor.cx, cursor.cy);
        const d = Math.hypot(m.x, m.y);
        const clampLen = Math.min(1, 3 / Math.max(d, 1e-4));
        cursor.x = cursor.x > 4 ? m.x * clampLen : lerp(cursor.x, m.x * clampLen, k * 1.1);
        cursor.y = cursor.y > 4 ? m.y * clampLen : lerp(cursor.y, m.y * clampLen, k * 1.1);
        cursor.amt = lerp(cursor.amt, 1 - smoothstep(0.45, 1.5, d), k * 0.8);
      } else {
        cursor.amt = lerp(cursor.amt, 0, k * 0.9);
      }

      const u = program.uniforms;
      u.uTime.value = phase;
      u.uPointer.value = [pointer.x, pointer.y];
      u.uMouse.value = [cursor.x, cursor.y];
      u.uMouseAmt.value = cursor.amt;
      u.uPulse.value = pulse;

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onLeave);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (canvas.parentNode === wrap) wrap.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reduced]);

  if (failed) return <FallbackBall className={className} />;
  return <div ref={wrapRef} className={className} aria-hidden="true" style={{ display: "grid", placeItems: "center" }} />;
}
