"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import Ball from "@/components/agent/Ball";
import { CHAPTERS, DEFAULT_PALETTE, type LifeItem, type Palette } from "@/data/lifeChapters";

// The earlier chat interface lives in git history (a06be39) and in
// src/lib/agentEngine.ts + src/data/agentKnowledge.ts.

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Where else to go from the lone orb. Same destinations as the home menu; the hidden
// terminal and the gated CV page are left out on purpose.
const SITE_LINKS = [
  { label: "Pokédex", href: "/pokedex" },
  { label: "Beats", href: "/music" },
  { label: "Now", href: "/now" },
  { label: "Contact", href: "/contact" },
];
const ELSEWHERE_LINKS = [
  { label: "Research", href: "https://research.braunf.com" },
  { label: "Personal Projects", href: "https://projects.braunf.com" },
  { label: "CalmCampus", href: "https://cc.braunf.com" },
  { label: "DataCamp", href: "https://data.braunf.com" },
  { label: "Nihongo", href: "https://nihongo.braunf.com" },
  { label: "Go", href: "https://go.braunf.com" },
];

const rgb = (v: number[]) => `rgb(${v.map((x) => Math.round(x * 255)).join(" ")})`;

function ItemLink({ item }: { item: LifeItem }) {
  if (!item.href) return null;
  const label = item.linkLabel ?? "Open";
  const inner = (
    <>
      {label}
      <ArrowUpRight size={13} aria-hidden="true" />
    </>
  );
  if (item.external || item.href.startsWith("mailto:")) {
    return (
      <a
        href={item.href}
        className="life-link"
        {...(item.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className="life-link">
      {inner}
    </Link>
  );
}

export default function AgentPage() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const orbRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const chapter = CHAPTERS[idx];
  const palette: Palette = open ? chapter.palette : DEFAULT_PALETTE;

  const goTo = useCallback((i: number) => setIdx((i + CHAPTERS.length) % CHAPTERS.length), []);

  const onOrb = () => {
    if (!open) setOpen(true);
    else goTo(idx + 1);
  };

  const close = useCallback(() => {
    setOpen(false);
    orbRef.current?.focus({ preventScroll: true });
  }, []);

  // Arrow keys browse chapters, Escape returns to the lone orb.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") goTo(idx + 1);
      else if (e.key === "ArrowLeft") goTo(idx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, idx, goTo, close]);

  // Bring keyboard focus into the chapter when it opens.
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <main
      className="life-stage fixed inset-0 overflow-hidden"
      data-open={open}
      style={
        {
          background: "radial-gradient(ellipse 85% 75% at 50% 46%, #151b3d 0%, #0b0e22 52%, #05060f 100%)",
          "--c1": rgb(palette.blue),
          "--c2": rgb(palette.lav),
          "--c3": rgb(palette.peach),
        } as React.CSSProperties
      }
    >
      <h1 className="sr-only">Florian Braun: an orb that opens chapters of his life</h1>
      <p className="sr-only" role="status" aria-live="polite">
        {open ? `Chapter ${idx + 1} of ${CHAPTERS.length}: ${chapter.title}` : ""}
      </p>

      {/* Slow aurora light, tinted by the chapter */}
      <div aria-hidden="true" className="life-aurora life-aurora-a" />
      <div aria-hidden="true" className="life-aurora life-aurora-b" />
      <div aria-hidden="true" className="life-aurora life-aurora-c" />

      {/* The orb: centred when alone, tucked to the side while browsing */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="life-orb relative h-[min(96vmin,900px)] w-[min(96vmin,900px)]">
          <Ball className="absolute inset-0" palette={palette} />
          <button
            ref={orbRef}
            type="button"
            onClick={onOrb}
            className="life-orb-hit"
            aria-label={open ? "Next chapter" : "Open the orb to browse chapters of Florian's life"}
            aria-expanded={open}
          />
        </div>
      </div>

      {/* Chapter content */}
      <AnimatePresence>
        {open && (
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            aria-label={`Chapter ${idx + 1}: ${chapter.title}`}
            className="life-panel"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="life-scroll">
            <AnimatePresence mode="wait">
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <p className="life-kicker">
                  {String(idx + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")} · {chapter.period}
                </p>
                <h2 className="life-title">{chapter.title}</h2>
                <p className="life-blurb">{chapter.blurb}</p>

                <ul className="life-items">
                  {chapter.items.map((item, i) => (
                    <motion.li
                      key={item.title}
                      className="life-card"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.12 + i * 0.07, ease: "easeOut" }}
                    >
                      <div className="life-card-head">
                        <h3>{item.title}</h3>
                        {item.meta && <span>{item.meta}</span>}
                      </div>
                      <p>{item.text}</p>
                      <ItemLink item={item} />
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Chapter bar */}
      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Chapters"
            className="life-nav"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {CHAPTERS.map((c, i) => (
              <button key={c.id} type="button" onClick={() => goTo(i)} aria-current={i === idx ? "true" : undefined} className="life-nav-btn">
                {c.label}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Other pages, shown while the orb is alone */}
      <AnimatePresence>
        {!open && (
          <motion.nav
            aria-label="Other pages"
            className="life-links"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="life-links-row">
              {SITE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="life-pill">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="life-links-row">
              {ELSEWHERE_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="life-pill life-pill-out">
                  {l.label}
                  <ArrowUpRight size={11} aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Film grain: also hides any gradient banding */}
      <div aria-hidden="true" className="life-grain pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN }} />

      {/* Quiet chrome */}
      <Link href="/" className="life-chrome life-home">
        <span aria-hidden="true">←</span> Home
      </Link>
      {open && (
        <button type="button" onClick={close} className="life-chrome life-close" aria-label="Close chapters (Escape)">
          <X size={14} aria-hidden="true" /> Close
        </button>
      )}
      {!open && <p className="life-chrome life-hint">Click the orb</p>}

      <style>{`
        .life-aurora { position:absolute; width:70vmax; height:70vmax; border-radius:50%; pointer-events:none; will-change:transform; opacity:0.3;
          -webkit-mask-image: radial-gradient(closest-side, #000, transparent); mask-image: radial-gradient(closest-side, #000, transparent);
          transition: background-color 1.6s ease; }
        .life-aurora-a { left:-18vmax; top:-22vmax; background-color: var(--c1); animation: life-drift-a 38s ease-in-out infinite alternate; }
        .life-aurora-b { right:-24vmax; bottom:-30vmax; background-color: var(--c2); opacity:0.26; animation: life-drift-b 46s ease-in-out infinite alternate; }
        .life-aurora-c { left:30vw; bottom:-38vmax; width:60vmax; height:60vmax; background-color: var(--c3); opacity:0.15; animation: life-drift-a 52s ease-in-out infinite alternate-reverse; }
        @keyframes life-drift-a { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(9vmax,6vmax,0) scale(1.12); } }
        @keyframes life-drift-b { from { transform: translate3d(0,0,0) scale(1.05); } to { transform: translate3d(-8vmax,-7vmax,0) scale(0.95); } }

        .life-grain { opacity:0.085; mix-blend-mode: overlay; }

        .life-orb { transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1); pointer-events:none; }
        .life-orb-hit { position:absolute; left:50%; top:50%; width:54%; height:54%; transform: translate(-50%,-50%); border-radius:50%; background:transparent; border:0; cursor:pointer; pointer-events:auto; -webkit-tap-highlight-color: transparent; }
        .life-orb-hit:focus-visible { outline:2px solid rgba(199,210,254,0.8); outline-offset:8px; }
        .life-stage[data-open="true"] .life-orb { transform: translate(-21vw, 0) scale(0.62); }

        .life-chrome { position:absolute; z-index:6; font-family: var(--font-inter), system-ui, sans-serif; text-transform:uppercase; letter-spacing:0.24em; color: rgba(199,210,254,0.55); text-decoration:none; font-size:11px; background:none; border:0; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition: color .2s ease; }
        .life-chrome:hover, .life-chrome:focus-visible { color: rgba(238,242,255,0.95); }
        .life-chrome:focus-visible { outline:2px solid #a5b4fc; outline-offset:6px; border-radius:6px; }
        .life-home { top:22px; left:24px; }
        .life-close { top:22px; right:24px; }
        .life-hint { bottom:112px; left:50%; transform:translateX(-50%); font-size:10px; letter-spacing:0.32em; cursor:default; pointer-events:none; opacity:0; animation: life-hint 3.6s ease-in-out 1.4s infinite; }
        @keyframes life-hint { 0%,100% { opacity:0.15; } 50% { opacity:0.85; } }

        .life-panel { position:absolute; z-index:4; right:max(4vw, 24px); top:0; bottom:0; width:min(540px, 42vw); display:flex; flex-direction:column; justify-content:center; pointer-events:none; font-family: var(--font-inter), system-ui, sans-serif; color:#e0e7ff; outline:none; }
        .life-scroll { max-height:76vh; overflow-y:auto; padding:4px 6px 4px 2px; pointer-events:auto; scrollbar-width:thin; scrollbar-color: rgba(165,180,252,0.3) transparent; }
        .life-kicker { font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color: rgba(199,210,254,0.6); margin-bottom:10px; }
        .life-title { font-size:clamp(30px, 3.6vw, 50px); font-weight:600; letter-spacing:-0.02em; line-height:1.05; color:#f5f7ff; margin-bottom:12px; }
        .life-blurb { font-size:15px; line-height:1.6; color: rgba(224,231,255,0.68); margin-bottom:22px; max-width:46ch; }
        .life-items { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
        .life-card { padding:15px 18px 14px; border-radius:16px; border:1px solid rgba(199,210,254,0.14); background: rgba(255,255,255,0.045); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: border-color .25s ease, background .25s ease; }
        .life-card:hover { border-color: rgba(199,210,254,0.3); background: rgba(255,255,255,0.07); }
        .life-card-head { display:flex; align-items:baseline; justify-content:space-between; gap:14px; margin-bottom:6px; flex-wrap:wrap; }
        .life-card h3 { font-size:15px; font-weight:600; color:#f1f4ff; }
        .life-card-head span { font-size:11px; letter-spacing:0.08em; color: rgba(165,180,252,0.75); white-space:nowrap; }
        .life-card p { font-size:13.5px; line-height:1.6; color: rgba(224,231,255,0.7); }
        .life-link { display:inline-flex; align-items:center; gap:4px; margin-top:10px; font-size:12px; letter-spacing:0.04em; color:#c7d2fe; text-decoration:none; border-bottom:1px solid rgba(199,210,254,0.3); padding-bottom:1px; transition: color .2s ease, border-color .2s ease; }
        .life-link:hover, .life-link:focus-visible { color:#fff; border-color:#fff; outline:none; }

        .life-links { position:absolute; z-index:5; left:0; right:0; bottom:20px; display:flex; flex-direction:column; align-items:center; gap:8px; padding:0 16px; }
        .life-links-row { display:flex; flex-wrap:wrap; justify-content:center; gap:6px; }
        .life-pill { display:inline-flex; align-items:center; gap:4px; font-family: var(--font-inter), system-ui, sans-serif; font-size:11.5px; letter-spacing:0.06em; padding:8px 14px; border-radius:999px; border:1px solid rgba(199,210,254,0.18); background: rgba(8,12,28,0.5); color: rgba(224,231,255,0.8); text-decoration:none; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: color .25s ease, border-color .25s ease, background .25s ease, transform .25s ease; }
        .life-pill-out { padding:6px 12px; font-size:10.5px; color: rgba(199,210,254,0.55); border-color: rgba(199,210,254,0.1); background: rgba(8,12,28,0.35); }
        .life-pill:hover { color:#fff; border-color: rgba(199,210,254,0.5); background: rgba(40,50,100,0.45); transform: translateY(-1px); }
        .life-pill:focus-visible { outline:2px solid #a5b4fc; outline-offset:3px; }

        .life-nav { position:absolute; z-index:5; left:0; right:0; bottom:22px; display:flex; justify-content:center; gap:6px; padding:0 16px; overflow-x:auto; scrollbar-width:none; }
        .life-nav::-webkit-scrollbar { display:none; }
        .life-nav-btn { flex:none; font-family: var(--font-inter), system-ui, sans-serif; font-size:11.5px; letter-spacing:0.06em; padding:8px 14px; border-radius:999px; border:1px solid rgba(199,210,254,0.16); background: rgba(8,12,28,0.5); color: rgba(199,210,254,0.62); cursor:pointer; backdrop-filter: blur(8px); transition: color .25s ease, border-color .25s ease, background .25s ease; }
        .life-nav-btn:hover { color:#fff; border-color: rgba(199,210,254,0.4); }
        .life-nav-btn[aria-current="true"] { color:#0b0e22; background: rgba(224,231,255,0.92); border-color: transparent; }
        .life-nav-btn:focus-visible { outline:2px solid #a5b4fc; outline-offset:3px; }

        @media (max-width: 899px) {
          .life-stage[data-open="true"] .life-orb { transform: translate(0, -29vh) scale(0.44); }
          .life-panel { left:20px; right:20px; width:auto; top:34vh; bottom:70px; justify-content:flex-start; }
          .life-scroll { max-height:100%; }
          .life-title { font-size:30px; }
          .life-nav { justify-content:flex-start; }
        }

        @media (prefers-reduced-motion: reduce) {
          .life-aurora, .life-hint { animation: none; }
          .life-hint { opacity:0.7; }
          .life-orb { transition-duration: 0.01ms; }
        }
      `}</style>
    </main>
  );
}
