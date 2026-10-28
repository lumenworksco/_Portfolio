"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChiptuneMusic from "@/components/ui/ChiptuneMusic";
import {
  POKEDEX_RED,
  EMERALD_INK,
  EMERALD_BOX_BG,
  EMERALD_BOX_BORDER,
  EMERALD_BOX_INSET,
  TypewriterText,
} from "@/components/ui/emerald";
import { useMusicPref } from "@/lib/musicPref";
import { playHoverBlip, playConfirmChime } from "@/lib/uiSfx";

// A small overworld you can walk around: arrow keys / WASD, or tap anywhere.
// Each building is a real link as well, so the page also works with Tab and Enter.

const PIXEL = "var(--font-pixel), monospace";
const SANS = "var(--font-inter), system-ui, sans-serif";
const EMAIL = "contact@braunf.com";
const PX = 4; // one terrain "pixel" in CSS px
const SPEED = 190; // px per second
const NEAR = 52; // how close to a door counts as standing at it

type Building = {
  id: string;
  sign: string;
  title: string;
  value: string;
  href: string;
  external: boolean;
  roof: string;
  line: string;
};

const BUILDINGS: Building[] = [
  { id: "mail", sign: "MAIL", title: "MAILBOX", value: EMAIL, href: `mailto:${EMAIL}`, external: false, roof: "#cc0000", line: "Drop me a line. I read everything." },
  { id: "linkedin", sign: "LINKEDIN", title: "LINKEDIN", value: "in/braunflorian25", href: "https://www.linkedin.com/in/braunflorian25/", external: true, roof: "#2e86ab", line: "Experience, education and the full timeline." },
  { id: "github", sign: "GITHUB", title: "GITHUB", value: "lumenworksco", href: "https://github.com/lumenworksco", external: true, roof: "#3a8a3a", line: "The code behind every project." },
];

const SITES = [
  { label: "PERSONAL PROJECTS", href: "https://projects.braunf.com", color: "#e8590c" },
  { label: "RESEARCH", href: "https://research.braunf.com", color: "#d6336c" },
  { label: "CALMCAMPUS", href: "https://cc.braunf.com", color: "#3a8a3a" },
  { label: "DATACAMP", href: "https://data.braunf.com", color: "#2e86ab" },
];

const SPRITE = [
  "....kkkk....",
  "...kwwwwk...",
  "..kwwwwwwk..",
  "..kggggggk..",
  "..kssssssk..",
  "..kskssksk..",
  "..kssssssk..",
  "...kkssskk..",
  "..kggggggk..",
  ".kgggggggsk.",
  ".ksgggggggk.",
  "..kggggggk..",
  "..kbbbbbbk..",
  "..kbbkkbbk..",
  "..kwwk.kwwk.",
  "..kkk...kkk.",
];
const SPRITE_COLORS: Record<string, string> = { k: "#1c1c1c", w: "#f4f1e6", g: "#3b9a4a", s: "#f2c9a0", b: "#2f4f8f" };

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Pt = { x: number; y: number };

export default function ContactPage() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const terrainRef = useRef<HTMLCanvasElement>(null);
  const spriteRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const bobRef = useRef<HTMLDivElement>(null);
  const doorEls = useRef<Record<string, HTMLSpanElement | null>>({});
  const doors = useRef<Record<string, Pt>>({});
  const pos = useRef<Pt>({ x: 0, y: 0 });
  const target = useRef<Pt | null>(null);
  const keys = useRef<Set<string>>(new Set());
  const nearRef = useRef<string | null>(null);
  const bounds = useRef({ w: 0, h: 0, top: 96, bottom: 210 });

  const [near, setNear] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [banner, setBanner] = useState(true);
  const [musicOn, toggleMusic] = useMusicPref();

  // Terrain: grass, a dirt path linking the doors, trees around the edge, flowers.
  const drawTerrain = useCallback(() => {
    const canvas = terrainRef.current;
    const scene = sceneRef.current;
    if (!canvas || !scene) return;
    const sr = scene.getBoundingClientRect();
    const W = Math.ceil(sr.width / PX);
    const H = Math.ceil(sr.height / PX);
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext("2d");
    if (!g) return;
    const rand = rng(7);

    // measure doors (the point a trainer stands at, just below each door)
    const rects: { x0: number; y0: number; x1: number; y1: number }[] = [];
    BUILDINGS.forEach((b) => {
      const el = doorEls.current[b.id];
      if (!el) return;
      const r = el.getBoundingClientRect();
      doors.current[b.id] = { x: r.left - sr.left + r.width / 2, y: r.bottom - sr.top + 16 };
      const par = el.closest("[data-building]") as HTMLElement | null;
      if (par) {
        const pr = par.getBoundingClientRect();
        rects.push({ x0: (pr.left - sr.left) / PX - 4, y0: (pr.top - sr.top) / PX - 6, x1: (pr.right - sr.left) / PX + 4, y1: (pr.bottom - sr.top) / PX + 4 });
      }
    });
    bounds.current = { w: sr.width, h: sr.height, top: 96, bottom: sr.width < 700 ? 250 : 190 };

    // grass checker
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        g.fillStyle = ((x >> 2) + (y >> 2)) % 2 ? "#5cab47" : "#64b34e";
        g.fillRect(x, y, 1, 1);
      }
    }

    // dirt paths: from the spawn up to each door (L-shaped)
    const spawn = { x: sr.width / 2, y: sr.height - bounds.current.bottom };
    const paths: Pt[][] = BUILDINGS.map((b) => {
      const d = doors.current[b.id];
      if (!d) return [];
      return [spawn, { x: spawn.x, y: (spawn.y + d.y) / 2 }, { x: d.x, y: (spawn.y + d.y) / 2 }, d];
    });
    const segs: { x0: number; y0: number; x1: number; y1: number }[] = [];
    paths.forEach((p) => {
      p.forEach((pt, i) => {
        if (i === 0) return;
        const a = p[i - 1];
        segs.push({
          x0: Math.floor(Math.min(a.x, pt.x) / PX) - 2,
          y0: Math.floor(Math.min(a.y, pt.y) / PX) - 2,
          x1: Math.ceil(Math.max(a.x, pt.x) / PX) + 2,
          y1: Math.ceil(Math.max(a.y, pt.y) / PX) + 2,
        });
      });
    });
    segs.forEach((s) => {
      g.fillStyle = "#c9a566";
      g.fillRect(s.x0 - 1, s.y0 - 1, s.x1 - s.x0 + 2, s.y1 - s.y0 + 2);
    });
    segs.forEach((s) => {
      for (let y = s.y0; y < s.y1; y++) for (let x = s.x0; x < s.x1; x++) {
        g.fillStyle = (x + y) % 5 === 0 ? "#dfc07e" : "#d8b878";
        g.fillRect(x, y, 1, 1);
      }
    });
    const inPath = (ux: number, uy: number) => segs.some((s) => ux >= s.x0 - 2 && ux <= s.x1 + 2 && uy >= s.y0 - 2 && uy <= s.y1 + 2);
    const blocked = (ux: number, uy: number, pad = 0) =>
      inPath(ux, uy) || rects.some((r) => ux > r.x0 - pad && ux < r.x1 + pad && uy > r.y0 - pad && uy < r.y1 + pad);

    // tall grass patches near the bottom corners
    const patch = (cx: number, cy: number, rx: number, ry: number) => {
      for (let y = cy - ry; y < cy + ry; y++) for (let x = cx - rx; x < cx + rx; x++) {
        const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        if (d < 1 && !blocked(x, y)) {
          g.fillStyle = (x + y) % 3 === 0 ? "#2f7d36" : "#3b8f3d";
          g.fillRect(x, y, 1, 1);
          if ((x * 7 + y * 3) % 6 === 0) { g.fillStyle = "#256a2d"; g.fillRect(x, y - 1, 1, 2); }
        }
      }
    };
    patch(Math.floor(W * 0.12), Math.floor(H * 0.74), Math.floor(W * 0.1), Math.floor(H * 0.1));
    patch(Math.floor(W * 0.88), Math.floor(H * 0.7), Math.floor(W * 0.1), Math.floor(H * 0.12));

    // flowers
    const FL = ["#fff", "#f7d44a", "#f07aa5"];
    for (let i = 0; i < W * H * 0.004; i++) {
      const x = Math.floor(rand() * W), y = Math.floor(rand() * H);
      if (blocked(x, y, 2)) continue;
      g.fillStyle = FL[Math.floor(rand() * 3)];
      g.fillRect(x, y, 1, 1);
    }

    // trees along the borders
    const tree = (x: number, y: number) => {
      g.fillStyle = "#1c1c1c"; g.fillRect(x + 2, y + 5, 2, 3);
      g.fillStyle = "#6b4a2a"; g.fillRect(x + 2, y + 5, 2, 2);
      g.fillStyle = "#1c1c1c"; g.fillRect(x, y, 6, 6);
      g.fillStyle = "#2f7d36"; g.fillRect(x + 1, y + 1, 4, 4);
      g.fillStyle = "#49a24a"; g.fillRect(x + 1, y + 1, 2, 2);
    };
    for (let x = -2; x < W; x += 7) tree(x + (x % 3), 2 + ((x >> 1) % 2));
    for (let y = 8; y < H - 8; y += 8) {
      if (!blocked(1, y, 2)) tree(0, y);
      if (!blocked(W - 6, y, 2)) tree(W - 6, y);
    }
  }, []);

  // Sprite
  useEffect(() => {
    const c = spriteRef.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    SPRITE.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === ".") return;
        g.fillStyle = SPRITE_COLORS[ch];
        g.fillRect(x, y, 1, 1);
      });
    });
  }, []);

  // Layout + loop
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    let raf = 0;
    let last = performance.now();
    let facing = 1;
    let t = 0;

    const place = () => {
      const p = playerRef.current;
      if (!p) return;
      p.style.transform = `translate3d(${pos.current.x - 18}px, ${pos.current.y - 48}px, 0)`;
      p.style.zIndex = String(Math.floor(pos.current.y));
    };

    const setup = () => {
      drawTerrain();
      const b = bounds.current;
      if (!pos.current.x) pos.current = { x: b.w / 2, y: b.h - b.bottom };
      pos.current.x = Math.min(Math.max(pos.current.x, 24), b.w - 24);
      pos.current.y = Math.min(Math.max(pos.current.y, b.top), b.h - b.bottom);
      place();
    };
    const first = requestAnimationFrame(setup);
    const ro = new ResizeObserver(setup);
    ro.observe(scene);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = keys.current;
      let dx = (k.has("right") ? 1 : 0) - (k.has("left") ? 1 : 0);
      let dy = (k.has("down") ? 1 : 0) - (k.has("up") ? 1 : 0);
      if (dx || dy) target.current = null;
      else if (target.current) {
        const tx = target.current.x - pos.current.x;
        const ty = target.current.y - pos.current.y;
        const d = Math.hypot(tx, ty);
        if (d < 4) target.current = null;
        else { dx = tx / d; dy = ty / d; }
      }
      const moving = !!(dx || dy);
      if (moving) {
        const m = Math.hypot(dx, dy) || 1;
        const b = bounds.current;
        pos.current.x = Math.min(Math.max(pos.current.x + (dx / m) * SPEED * dt, 24), b.w - 24);
        pos.current.y = Math.min(Math.max(pos.current.y + (dy / m) * SPEED * dt, b.top), b.h - b.bottom);
        if (dx) facing = dx < 0 ? -1 : 1;
        t += dt;
        place();
      }
      const bob = bobRef.current;
      if (bob) bob.style.transform = `scaleX(${facing}) translateY(${moving ? -Math.abs(Math.sin(t * 12)) * 3 : 0}px)`;

      // which door are we standing at?
      let found: string | null = null;
      let best = NEAR;
      for (const id in doors.current) {
        const d = Math.hypot(doors.current[id].x - pos.current.x, doors.current[id].y - pos.current.y);
        if (d < best) { best = d; found = id; }
      }
      if (found !== nearRef.current) {
        nearRef.current = found;
        setNear(found);
        if (found) playHoverBlip();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const map: Record<string, string> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down", A: "left", D: "right", W: "up", S: "down" };
    const onDown = (e: KeyboardEvent) => {
      const dir = map[e.key];
      if (!dir || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      e.preventDefault();
      keys.current.add(dir);
    };
    const onUp = (e: KeyboardEvent) => { const dir = map[e.key]; if (dir) keys.current.delete(dir); };
    const onBlur = () => keys.current.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    const bt = setTimeout(() => setBanner(false), 2800);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(first);
      ro.disconnect();
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      clearTimeout(bt);
    };
  }, [drawTerrain]);

  const walkTo = (id: string) => {
    const d = doors.current[id];
    if (d) target.current = { ...d };
  };

  const onScenePointer = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button,[data-building]")) return;
    const r = sceneRef.current!.getBoundingClientRect();
    const b = bounds.current;
    target.current = {
      x: Math.min(Math.max(e.clientX - r.left, 24), b.w - 24),
      y: Math.min(Math.max(e.clientY - r.top, b.top), b.h - b.bottom),
    };
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      playConfirmChime();
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard can be unavailable; the address is shown right in the box.
    }
  };

  const at = BUILDINGS.find((b) => b.id === near) ?? null;

  return (
    <div
      ref={sceneRef}
      onPointerDown={onScenePointer}
      style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#5cab47", touchAction: "none", userSelect: "none", cursor: "crosshair" }}
    >
      <h1 className="sr-only">Contact Florian Braun</h1>
      <canvas ref={terrainRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", imageRendering: "pixelated" }} />

      {/* Buildings */}
      {BUILDINGS.map((b) => (
        <a
          key={b.id}
          data-building
          className={`ct-b ct-${b.id}`}
          href={b.href}
          {...(b.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={`${b.title}: ${b.value}`}
          onClick={(e) => { e.preventDefault(); walkTo(b.id); }}
          onMouseEnter={playHoverBlip}
          style={{ ["--roof" as string]: b.roof }}
        >
          <span className="ct-sign">{b.sign}</span>
          <span className="ct-roof" />
          <span className="ct-wall">
            <span className="ct-win" />
            <span className="ct-win" />
            <span className="ct-door" ref={(el) => { doorEls.current[b.id] = el; }} />
          </span>
        </a>
      ))}

      {/* Trainer */}
      <div ref={playerRef} aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, width: 36, height: 48, willChange: "transform", pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 4, bottom: -2, width: 28, height: 8, borderRadius: "50%", background: "rgba(0,0,0,0.28)" }} />
        <div ref={bobRef} style={{ width: 36, height: 48 }}>
          <canvas ref={spriteRef} width={12} height={16} style={{ width: 36, height: 48, imageRendering: "pixelated" }} />
        </div>
      </div>

      {/* vignette + scanlines */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 9000, background: "radial-gradient(ellipse 90% 75% at 50% 45%, transparent 55%, rgba(0,20,10,0.5) 100%)" }} />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 9001, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)" }} />

      {/* Town-name banner, like entering a new area */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", left: "50%", top: 0, zIndex: 9100, pointerEvents: "none",
          transform: `translate(-50%, ${banner ? "14px" : "-70px"})`, transition: "transform 0.5s steps(6)",
          background: "#1c1c1c", color: "#fff", fontFamily: PIXEL, fontSize: "11px", letterSpacing: "0.12em", padding: "10px 18px 9px",
          border: "3px solid #f7f4e3", borderRadius: "6px", whiteSpace: "nowrap",
        }}
      >
        CONTACT TOWN
      </div>

      <Link
        href="/"
        style={{ position: "absolute", top: 18, left: 18, zIndex: 9100, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: PIXEL, fontSize: "9px", letterSpacing: "0.1em", color: "#fff", textDecoration: "none", background: "rgba(28,28,28,0.72)", border: "2px solid #f7f4e3", borderRadius: 4, padding: "8px 10px 7px" }}
      >
        <ArrowLeft size={12} /> BACK
      </Link>
      <ChiptuneMusic enabled={musicOn} onToggle={toggleMusic} />

      {/* Dialog */}
      <div
        style={{ position: "absolute", left: "50%", bottom: 16, zIndex: 9100, width: "min(760px, calc(100vw - 24px))", transform: "translateX(-50%)" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div style={{ background: EMERALD_BOX_BG, border: EMERALD_BOX_BORDER, borderRadius: 8, padding: "12px 18px 14px", boxShadow: `${EMERALD_BOX_INSET}, 0 6px 28px rgba(0,0,0,0.45)` }}>
          {at ? (
            <div key={at.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ minWidth: 0, flex: "1 1 260px" }}>
                <p style={{ fontFamily: PIXEL, fontSize: "10px", letterSpacing: "0.1em", color: EMERALD_INK, marginBottom: 8 }}>
                  <span style={{ color: POKEDEX_RED }}>▶ </span>{at.title}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: EMERALD_INK, wordBreak: "break-all" }}>{at.value}</p>
                <p style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(28,28,28,0.6)", marginTop: 3 }}>
                  <TypewriterText segments={[{ text: at.line }]} speedMs={16} />
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={at.href}
                  {...(at.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={playConfirmChime}
                  style={{ fontFamily: PIXEL, fontSize: "9px", letterSpacing: "0.08em", color: "#fff", textDecoration: "none", background: at.roof, border: `2px solid ${EMERALD_INK}`, borderRadius: 4, padding: "11px 14px 10px", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.25)" }}
                >
                  OPEN ↗
                </a>
                {at.id === "mail" && (
                  <button
                    type="button"
                    onClick={copy}
                    aria-label={copied ? "Email address copied" : "Copy email address"}
                    style={{ fontFamily: PIXEL, fontSize: "9px", letterSpacing: "0.08em", cursor: "pointer", color: copied ? "#fff" : EMERALD_INK, background: copied ? "#3a8a3a" : "#fff", border: `2px solid ${EMERALD_INK}`, borderRadius: 4, padding: "11px 14px 10px" }}
                  >
                    {copied ? "COPIED!" : "COPY"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(28,28,28,0.5)", display: "block", marginBottom: 3 }}>Prof. Braun</span>
              <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: "rgba(28,28,28,0.88)", minHeight: 42 }}>
                <TypewriterText
                  segments={[
                    { text: "Welcome to Contact Town! I am open to internships, research and good conversations. " },
                    { text: "Walk to a building (arrow keys, or tap) to reach me.", style: { color: EMERALD_INK, fontWeight: 600 } },
                  ]}
                  startDelay={400}
                />
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
                {SITES.map((s) => (
                  <a key={s.href} href={s.href} onMouseEnter={playHoverBlip}
                    style={{ fontFamily: PIXEL, fontSize: "7px", letterSpacing: "0.06em", color: "#fff", textDecoration: "none", background: s.color, border: `2px solid ${EMERALD_INK}`, borderRadius: 4, padding: "6px 8px 5px", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.22)" }}>
                    {s.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ct-b { position:absolute; display:block; width:clamp(124px, 15vw, 190px); transform:translateX(-50%); text-decoration:none; cursor:pointer; -webkit-tap-highlight-color: transparent; z-index:200; }
        .ct-b:focus-visible { outline:3px solid #fff; outline-offset:6px; }
        .ct-mail { left:18%; top:30%; }
        .ct-linkedin { left:50%; top:15%; }
        .ct-github { left:82%; top:32%; }
        .ct-sign { position:absolute; left:50%; top:-26px; transform:translateX(-50%); font-family:${PIXEL}; font-size:8px; letter-spacing:0.08em; color:${EMERALD_INK}; background:#f7f4e3; border:2px solid ${EMERALD_INK}; border-radius:3px; padding:5px 7px 4px; white-space:nowrap; }
        .ct-roof { display:block; height:clamp(42px, 5vw, 62px); background: repeating-linear-gradient(90deg, rgba(0,0,0,0.14) 0 4px, transparent 4px 12px), linear-gradient(180deg, color-mix(in srgb, var(--roof) 80%, #fff) 0 12%, var(--roof) 12% 100%); border:3px solid ${EMERALD_INK}; border-radius:6px 6px 0 0; }
        .ct-wall { position:relative; display:block; height:clamp(52px, 6vw, 76px); background:#f0e6c8; border:3px solid ${EMERALD_INK}; border-top:0; box-shadow: inset 0 -6px 0 rgba(0,0,0,0.08); }
        .ct-win { position:absolute; top:22%; width:22%; height:30%; background:#9fd6ee; border:3px solid ${EMERALD_INK}; box-shadow: inset 3px 3px 0 rgba(255,255,255,0.55); }
        .ct-win:nth-of-type(1) { left:10%; }
        .ct-win:nth-of-type(2) { right:10%; }
        .ct-door { position:absolute; left:50%; bottom:0; width:24%; height:62%; transform:translateX(-50%); background:#7a4a24; border:3px solid ${EMERALD_INK}; border-bottom:0; border-radius:4px 4px 0 0; }
        .ct-door::after { content:""; position:absolute; right:18%; top:50%; width:3px; height:3px; background:#f7d44a; }
        .ct-b:hover .ct-sign, .ct-b:focus-visible .ct-sign { background:#fff; color:${POKEDEX_RED}; }
        @media (max-width: 699px) {
          .ct-mail { left:27%; top:15%; }
          .ct-linkedin { left:72%; top:27%; }
          .ct-github { left:34%; top:44%; }
        }
      `}</style>
    </div>
  );
}
