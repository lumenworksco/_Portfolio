"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Aurora from "@/components/ui/Aurora";
import ChiptuneMusic from "@/components/ui/ChiptuneMusic";
import { POKEDEX_RED, CornerBrackets } from "@/components/ui/emerald";
import { useMusicPref } from "@/lib/musicPref";
import { playHoverBlip, playConfirmChime } from "@/lib/uiSfx";

const PIXEL = "var(--font-pixel), monospace";
const SANS = "var(--font-inter), system-ui, sans-serif";
const EMAIL = "contact@braunf.com";

const CHANNELS = [
  { id: "email", n: "01", label: "EMAIL", value: EMAIL, href: `mailto:${EMAIL}`, external: false, color: "#ff4d4d" },
  { id: "linkedin", n: "02", label: "LINKEDIN", value: "in/braunflorian25", href: "https://www.linkedin.com/in/braunflorian25/", external: true, color: "#5cc2ee" },
  { id: "github", n: "03", label: "GITHUB", value: "lumenworksco", href: "https://github.com/lumenworksco", external: true, color: "#6fdc7a" },
];

const SITES = [
  { label: "Personal Projects", href: "https://projects.braunf.com", color: "#ff8a3d" },
  { label: "Research", href: "https://research.braunf.com", color: "#f06ea0" },
  { label: "CalmCampus", href: "https://cc.braunf.com", color: "#6fdc7a" },
  { label: "DataCamp", href: "https://data.braunf.com", color: "#5cc2ee" },
];


// ── PokéNav-style town map ────────────────────────────────────────────────────
const GW = 40;
const GH = 30;
const CELL = 10;
const NODES: Record<string, { x: number; y: number }> = {
  email: { x: 9, y: 9 },
  linkedin: { x: 24, y: 17 },
  github: { x: 31, y: 7 },
};
const YOU = { x: 15, y: 24 };

function makeLand() {
  let seed = 11;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  let g = Array.from({ length: GH }, () => Array.from({ length: GW }, () => (rand() < 0.5 ? 1 : 0)));
  for (let pass = 0; pass < 4; pass++) {
    g = g.map((row, y) =>
      row.map((_, x) => {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const yy = y + dy, xx = x + dx;
          n += yy >= 0 && yy < GH && xx >= 0 && xx < GW ? g[yy][xx] : 0;
        }
        return n >= 5 ? 1 : 0;
      }),
    );
  }
  const pts = [...Object.values(NODES), YOU];
  pts.forEach((p) => {
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      if ((x - p.x) ** 2 + (y - p.y) ** 2 <= 9) g[y][x] = 1;
    }
  });
  // keep the outer ring as sea
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (x < 1 || y < 1 || x >= GW - 1 || y >= GH - 1) g[y][x] = 0;
  return g;
}

const ROUTES: [string, string][] = [
  ["you", "linkedin"],
  ["linkedin", "email"],
  ["linkedin", "github"],
];
const at = (id: string) => (id === "you" ? YOU : NODES[id]);
const routePath = (a: string, b: string) => {
  const p = at(a), q = at(b);
  return `M${p.x * CELL + 5} ${p.y * CELL + 5} H${q.x * CELL + 5} V${q.y * CELL + 5}`;
};

function TownMap({ active, setActive }: { active: string | null; setActive: (id: string | null) => void }) {
  const land = useMemo(() => makeLand(), []);
  const rects = useMemo(() => {
    const out: { x: number; y: number; w: number; shore: boolean }[] = [];
    land.forEach((row, y) => {
      let x = 0;
      while (x < GW) {
        if (!row[x]) { x++; continue; }
        const x0 = x;
        const shore = !land[y - 1]?.[x0] || !land[y + 1]?.[x0];
        while (x < GW && row[x] && (!land[y - 1]?.[x] || !land[y + 1]?.[x]) === shore) x++;
        out.push({ x: x0, y, w: x - x0, shore });
      }
    });
    return out;
  }, [land]);

  return (
    <div className="ct-nav" aria-label="Map of ways to reach me">
      <div className="ct-nav-bar">
        <span>POKéNAV</span>
        <span className="ct-nav-dot" aria-hidden="true" />
        <span>TOWN MAP</span>
      </div>
      <svg viewBox={`0 0 ${GW * CELL} ${GH * CELL}`} shapeRendering="crispEdges" className="ct-map" role="img" aria-label="Pixel map with Email, LinkedIn and GitHub marked as towns">
        <rect width={GW * CELL} height={GH * CELL} fill="#2b6cb0" />
        {Array.from({ length: GH }).map((_, y) => (
          <rect key={y} x={0} y={y * CELL} width={GW * CELL} height={CELL} fill={y % 2 ? "#2f74bd" : "#2b6cb0"} />
        ))}
        {rects.map((r, i) => (
          <rect key={i} x={r.x * CELL} y={r.y * CELL} width={r.w * CELL} height={CELL} fill={r.shore ? "#7fc15a" : "#5aa845"} />
        ))}
        {/* grid */}
        {Array.from({ length: GW + 1 }).map((_, x) => (
          <line key={`v${x}`} x1={x * CELL} y1={0} x2={x * CELL} y2={GH * CELL} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
        ))}
        {Array.from({ length: GH + 1 }).map((_, y) => (
          <line key={`h${y}`} x1={0} y1={y * CELL} x2={GW * CELL} y2={y * CELL} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
        ))}
        {/* routes */}
        {ROUTES.map(([a, b]) => (
          <path key={a + b} d={routePath(a, b)} fill="none" stroke="#f5e6b0" strokeWidth={4} strokeDasharray="8 6" />
        ))}
        {/* towns */}
        {CHANNELS.map((c) => {
          const n = NODES[c.id];
          const on = active === c.id;
          const x = n.x * CELL, y = n.y * CELL;
          return (
            <a key={c.id} href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} aria-label={c.label}
              onMouseEnter={() => setActive(c.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(c.id)} onBlur={() => setActive(null)}>
              <rect x={x - 6} y={y - 6} width={32} height={32} fill="transparent" />
              <rect x={x - 1} y={y - 1} width={12} height={12} fill="#1c1c1c" />
              <rect x={x + 1} y={y + 1} width={8} height={8} fill={c.color} />
              {on && <rect x={x - 6} y={y - 6} width={22} height={22} fill="none" stroke="#cc0000" strokeWidth={3} className="ct-blink" />}
              <g transform={`translate(${x + 5} ${y - 11})`}>
                <text textAnchor="middle" fontFamily={PIXEL} fontSize={9} fill="#1c1c1c" stroke="#f7f4e3" strokeWidth={3} paintOrder="stroke" letterSpacing={0.5}>{c.label}</text>
              </g>
            </a>
          );
        })}
        {/* you are here */}
        <g transform={`translate(${YOU.x * CELL + 5} ${YOU.y * CELL + 5})`} className="ct-blink">
          <path d="M0 -9 L9 0 L0 9 L-9 0 Z" fill="#cc0000" stroke="#1c1c1c" strokeWidth={2} />
          <circle r={2.5} fill="#fff" />
        </g>
      </svg>
      <div className="ct-nav-foot">
        <span className="ct-blink" style={{ color: POKEDEX_RED }}>▶</span>
        <span>{CHANNELS.find((c) => c.id === active)?.value ?? "YOU ARE HERE · PICK A TOWN"}</span>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [musicOn, toggleMusic] = useMusicPref();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      playConfirmChime();
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard can be unavailable; the address is visible on the page.
    }
  };

  return (
    <div className="ct-root">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Aurora colorStops={["#1f6b3a", "#0e7490", "#8a6a2f"]} speed={0.4} amplitude={0.8} />
      </div>
      <div aria-hidden="true" className="ct-vig" />
      <div aria-hidden="true" className="ct-scan" />

      <Link href="/" className="ct-back">
        <ArrowLeft size={14} /> Back
      </Link>
      <ChiptuneMusic enabled={musicOn} onToggle={toggleMusic} />

      <main className="ct-main">
        <section className="ct-left">
          <p className="ct-kicker">
            <span aria-hidden="true" style={{ color: POKEDEX_RED }}>▶</span> CONTACT
          </p>
          <h1 className="ct-title">Let&apos;s talk.</h1>
          <p className="ct-sub">Open to internships, research collaborations and good conversations.</p>

          <ul className="ct-rows">
            {CHANNELS.map((c) => {
              const on = active === c.id;
              return (
                <li key={c.id} className="ct-row" data-on={on}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onMouseEnter={() => { setActive(c.id); playHoverBlip(); }}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(c.id)}
                    onBlur={() => setActive(null)}
                    className="ct-link"
                    style={{ ["--accent" as string]: c.color }}
                  >
                    <span className="ct-n">{c.n}</span>
                    <span className="ct-body">
                      <span className="ct-label">{c.label}</span>
                      <span className="ct-value">{c.value}</span>
                    </span>
                    <span className="ct-go" aria-hidden="true">{c.external ? "↗" : "→"}</span>
                    <CornerBrackets color={c.color} visible={on} />
                  </a>
                  {c.id === "email" && (
                    <button type="button" onClick={copy} className="ct-copy" data-done={copied} aria-label={copied ? "Email address copied" : "Copy email address"}>
                      {copied ? "COPIED" : "COPY"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <nav aria-label="Other sites" className="ct-sites">
            <span className="ct-sites-label">OR START WITH MY WORK</span>
            {SITES.map((s) => (
              <a key={s.href} href={s.href} onMouseEnter={playHoverBlip} className="ct-site">
                <i style={{ background: s.color }} /> {s.label}
              </a>
            ))}
          </nav>
        </section>

        <section className="ct-right">
          <TownMap active={active} setActive={setActive} />
        </section>

      </main>

      <style>{`
        .ct-root { position:relative; min-height:100svh; width:100%; overflow-x:hidden; background:#04080a; color:#eef4ef; font-family:${SANS}; }
        .ct-vig { position:fixed; inset:0; z-index:1; pointer-events:none; background: radial-gradient(ellipse 85% 70% at 50% 40%, transparent 0%, rgba(4,8,10,0.78) 100%); }
        .ct-scan { position:fixed; inset:0; z-index:2; pointer-events:none; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px); }
        .ct-back { position:fixed; top:20px; left:22px; z-index:20; display:inline-flex; align-items:center; gap:8px; font:11px ${PIXEL}; letter-spacing:0.14em; text-transform:uppercase; color:rgba(238,244,239,0.55); text-decoration:none; transition:color .15s ease; }
        .ct-back:hover { color:#fff; }
        .ct-main { position:relative; z-index:10; min-height:100svh; display:grid; grid-template-columns: minmax(0,1.2fr) minmax(0,1fr); align-items:center; max-width:1500px; gap:clamp(24px,5vw,80px); padding:clamp(80px,10vh,120px) clamp(20px,6vw,100px) clamp(40px,8vh,80px); margin:0 auto; }
        .ct-kicker { font:10px ${PIXEL}; letter-spacing:0.22em; color:rgba(238,244,239,0.55); margin-bottom:18px; }
        .ct-title { font-size:clamp(46px, 8vw, 120px); font-weight:650; letter-spacing:-0.045em; line-height:0.95; background:linear-gradient(180deg,#fff 30%,#a9c9b4); -webkit-background-clip:text; background-clip:text; color:transparent; margin:0 0 18px; }
        .ct-sub { font-size:clamp(14px,1.3vw,17px); color:rgba(238,244,239,0.6); max-width:52ch; line-height:1.6; margin-bottom:clamp(28px,5vh,56px); }
        .ct-rows { list-style:none; margin:0; padding:0; border-top:1px solid rgba(238,244,239,0.14); }
        .ct-row { position:relative; display:flex; align-items:center; border-bottom:1px solid rgba(238,244,239,0.14); transition:background .2s ease; }
        .ct-row[data-on="true"] { background:linear-gradient(90deg, rgba(255,255,255,0.06), transparent); }
        .ct-link { position:relative; flex:1; min-width:0; display:flex; align-items:center; gap:clamp(14px,2.2vw,32px); padding:clamp(16px,2.6vh,26px) 6px; color:inherit; text-decoration:none; }
        .ct-link:focus-visible { outline:2px solid var(--accent); outline-offset:-2px; }
        .ct-n { font:10px ${PIXEL}; color:rgba(238,244,239,0.35); width:24px; flex:none; }
        .ct-body { flex:1; min-width:0; display:flex; flex-direction:column; gap:8px; }
        .ct-label { font:9px ${PIXEL}; letter-spacing:0.18em; color:var(--accent); }
        .ct-value { font-size:clamp(17px,3vw,40px); font-weight:560; letter-spacing:-0.02em; line-height:1.1; overflow-wrap:anywhere; transition:transform .25s ease; }
        .ct-row[data-on="true"] .ct-value { transform:translateX(8px); }
        .ct-go { font-size:clamp(18px,2vw,26px); color:rgba(238,244,239,0.35); transition:color .2s ease, transform .25s ease; padding-right:8px; }
        .ct-row[data-on="true"] .ct-go { color:var(--accent); transform:translateX(4px); }
        .ct-copy { flex:none; margin-right:6px; font:9px ${PIXEL}; letter-spacing:0.12em; color:#eef4ef; background:transparent; border:1px solid rgba(238,244,239,0.3); border-radius:4px; padding:10px 12px 9px; cursor:pointer; transition:background .15s ease, color .15s ease, border-color .15s ease; }
        .ct-copy:hover { background:rgba(255,255,255,0.1); border-color:rgba(238,244,239,0.6); }
        .ct-copy[data-done="true"] { background:#6fdc7a; color:#08210f; border-color:#6fdc7a; }
        .ct-sites { display:flex; flex-wrap:wrap; align-items:center; gap:8px 18px; margin-top:clamp(24px,4vh,44px); }
        .ct-sites-label { font:8px ${PIXEL}; letter-spacing:0.16em; color:rgba(238,244,239,0.35); width:100%; }
        .ct-site { display:inline-flex; align-items:center; gap:8px; font-size:13px; color:rgba(238,244,239,0.75); text-decoration:none; transition:color .15s ease; }
        .ct-site i { width:8px; height:8px; display:block; border-radius:2px; }
        .ct-site:hover { color:#fff; }



        .ct-right { display:flex; justify-content:center; }
        .ct-nav { width:min(100%, 560px); border-radius:16px; padding:12px; background:linear-gradient(180deg,#2a3a3d,#141c1e); border:2px solid #0a0f10; box-shadow: 0 30px 60px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.08), 0 0 50px rgba(63,174,154,0.15); }
        .ct-nav-bar { display:flex; align-items:center; gap:10px; font:9px ${PIXEL}; letter-spacing:0.16em; color:#bfe9dc; padding:2px 4px 10px; }
        .ct-nav-dot { flex:none; width:6px; height:6px; border-radius:50%; background:#cc0000; box-shadow:0 0 8px #cc0000; margin-left:auto; margin-right:2px; order:2; }
        .ct-nav-bar span:last-child { order:3; color:rgba(191,233,220,0.6); }
        .ct-map { display:block; width:100%; height:auto; border:3px solid #0a0f10; border-radius:6px; background:#2b6cb0; }
        .ct-nav-foot { display:flex; align-items:center; gap:10px; margin-top:10px; padding:9px 10px 8px; background:#a8c880; border:2px solid #0a0f10; border-radius:4px; font:8px ${PIXEL}; letter-spacing:0.08em; color:#1f3a14; min-height:34px; overflow-wrap:anywhere; }
        .ct-blink { animation: ct-blink 1s steps(2, jump-none) infinite; }
        @keyframes ct-blink { 0%,49% { opacity:1; } 50%,100% { opacity:0.15; } }
        @media (prefers-reduced-motion: reduce) { .ct-blink { animation:none; } }
        @media (max-width: 899px) { .ct-main { padding-top:84px; grid-template-columns:1fr; } .ct-right { order:3; } }
      `}</style>
    </div>
  );
}
