"use client";

import { useState } from "react";
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

      </main>

      <style>{`
        .ct-root { position:relative; min-height:100svh; width:100%; overflow-x:hidden; background:#04080a; color:#eef4ef; font-family:${SANS}; }
        .ct-vig { position:fixed; inset:0; z-index:1; pointer-events:none; background: radial-gradient(ellipse 85% 70% at 50% 40%, transparent 0%, rgba(4,8,10,0.78) 100%); }
        .ct-scan { position:fixed; inset:0; z-index:2; pointer-events:none; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px); }
        .ct-back { position:fixed; top:20px; left:22px; z-index:20; display:inline-flex; align-items:center; gap:8px; font:11px ${PIXEL}; letter-spacing:0.14em; text-transform:uppercase; color:rgba(238,244,239,0.55); text-decoration:none; transition:color .15s ease; }
        .ct-back:hover { color:#fff; }
        .ct-main { position:relative; z-index:10; min-height:100svh; display:grid; grid-template-columns: minmax(0,1fr); align-items:center; max-width:1200px; gap:clamp(24px,5vw,80px); padding:clamp(80px,10vh,120px) clamp(20px,6vw,100px) clamp(40px,8vh,80px); margin:0 auto; }
        .ct-kicker { font:10px ${PIXEL}; letter-spacing:0.22em; color:rgba(238,244,239,0.55); margin-bottom:18px; }
        .ct-title { font-size:clamp(52px, 11vw, 168px); font-weight:650; letter-spacing:-0.045em; line-height:0.95; background:linear-gradient(180deg,#fff 30%,#a9c9b4); -webkit-background-clip:text; background-clip:text; color:transparent; margin:0 0 18px; }
        .ct-sub { font-size:clamp(14px,1.3vw,17px); color:rgba(238,244,239,0.6); max-width:52ch; line-height:1.6; margin-bottom:clamp(28px,5vh,56px); }
        .ct-rows { list-style:none; margin:0; padding:0; border-top:1px solid rgba(238,244,239,0.14); }
        .ct-row { position:relative; display:flex; align-items:center; border-bottom:1px solid rgba(238,244,239,0.14); transition:background .2s ease; }
        .ct-row[data-on="true"] { background:linear-gradient(90deg, rgba(255,255,255,0.06), transparent); }
        .ct-link { position:relative; flex:1; min-width:0; display:flex; align-items:center; gap:clamp(14px,2.2vw,32px); padding:clamp(16px,2.6vh,26px) 6px; color:inherit; text-decoration:none; }
        .ct-link:focus-visible { outline:2px solid var(--accent); outline-offset:-2px; }
        .ct-n { font:10px ${PIXEL}; color:rgba(238,244,239,0.35); width:24px; flex:none; }
        .ct-body { flex:1; min-width:0; display:flex; flex-direction:column; gap:8px; }
        .ct-label { font:9px ${PIXEL}; letter-spacing:0.18em; color:var(--accent); }
        .ct-value { font-size:clamp(17px,4.4vw,64px); font-weight:560; letter-spacing:-0.02em; line-height:1.1; overflow-wrap:anywhere; transition:transform .25s ease; }
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


        @media (max-width: 899px) { .ct-main { padding-top:84px; } }
      `}</style>
    </div>
  );
}
