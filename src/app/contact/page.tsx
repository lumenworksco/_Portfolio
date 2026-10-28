"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Aurora from "@/components/ui/Aurora";
import ChiptuneMusic from "@/components/ui/ChiptuneMusic";
import {
  POKEDEX_RED,
  EMERALD_INK,
  EMERALD_BOX_BG,
  EMERALD_BOX_BORDER,
  EMERALD_BOX_INSET,
  DialogBox,
  TypewriterText,
  CornerBrackets,
  OverworldStrip,
} from "@/components/ui/emerald";
import { achievements } from "@/data/achievements";
import { useSeenAchievements } from "@/lib/useSeenAchievements";
import { useMusicPref } from "@/lib/musicPref";
import { playHoverBlip, playConfirmChime } from "@/lib/uiSfx";

const PIXEL = "var(--font-pixel), monospace";
const SANS = "var(--font-inter), system-ui, sans-serif";

const EMAIL = "contact@braunf.com";

const CHANNELS = [
  { id: "email", label: "EMAIL", value: EMAIL, href: `mailto:${EMAIL}`, color: "#cc0000", external: false },
  { id: "linkedin", label: "LINKEDIN", value: "in/braunflorian25", href: "https://www.linkedin.com/in/braunflorian25/", color: "#2e86ab", external: true },
  { id: "github", label: "GITHUB", value: "lumenworksco", href: "https://github.com/lumenworksco", color: "#3a8a3a", external: true },
];

const SITES = [
  { label: "PERSONAL PROJECTS", href: "https://projects.braunf.com", color: "#e8590c" },
  { label: "RESEARCH", href: "https://research.braunf.com", color: "#d6336c" },
  { label: "CALMCAMPUS", href: "https://cc.braunf.com", color: "#3a8a3a" },
  { label: "DATACAMP", href: "https://data.braunf.com", color: "#2e86ab" },
];

const dim = "rgba(28,28,28,0.55)";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [musicOn, toggleMusic] = useMusicPref();
  const { seenCount } = useSeenAchievements();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      playConfirmChime();
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard can be unavailable (insecure context, denied permission).
      // The address is shown right beside the button, so there is nothing to recover.
    }
  };

  const card: React.CSSProperties = {
    background: EMERALD_BOX_BG,
    border: EMERALD_BOX_BORDER,
    borderRadius: "8px",
    boxShadow: `${EMERALD_BOX_INSET}, 0 6px 28px rgba(0,0,0,0.45)`,
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: "#060a08" }}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Aurora colorStops={["#2f6b2f", "#0e7490", "#c9a36a"]} speed={0.45} amplitude={0.85} />
      </div>
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(6,10,8,0.72) 100%)" }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 3px)" }}
      />

      <Link
        href="/"
        className="fixed top-5 left-5 z-20 flex items-center gap-2 text-xs font-mono tracking-widest uppercase"
        style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
      >
        <ArrowLeft size={14} />
        Back
      </Link>
      <ChiptuneMusic enabled={musicOn} onToggle={toggleMusic} />

      <main className="relative z-10 flex flex-col items-center gap-3 md:gap-4 px-4 pt-20 pb-20 max-w-3xl mx-auto">
        <h1 className="sr-only">Contact Florian Braun</h1>

        <div className="w-full">
          <OverworldStrip label="CONTACT" />
        </div>

        <div className="w-full">
          <DialogBox showCursor>
            <p style={{ fontSize: "10px", fontFamily: SANS, fontWeight: 600, color: dim, marginBottom: "3px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Prof. Braun
            </p>
            <p style={{ fontSize: "13px", color: "rgba(28,28,28,0.88)", lineHeight: 1.6, fontFamily: SANS, minHeight: "42px" }}>
              <TypewriterText
                segments={[
                  { text: "Want to team up? I am open to internships, research collaborations and good conversations. " },
                  { text: "Pick a way to reach me below.", style: { color: EMERALD_INK, fontWeight: 600 } },
                ]}
                startDelay={200}
              />
            </p>
          </DialogBox>
        </div>

        <div className="w-full grid gap-3 md:gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start">
          {/* Trainer card */}
          <section
            aria-label="Trainer card"
            style={{
              position: "relative",
              borderRadius: "10px",
              border: EMERALD_BOX_BORDER,
              background: "linear-gradient(180deg,#3fae9a 0%,#2a8a7a 55%,#1f6e63 100%)",
              boxShadow: "inset 0 3px 0 rgba(255,255,255,0.25), inset 0 -4px 0 rgba(0,0,0,0.22), 0 6px 28px rgba(0,0,0,0.45)",
              padding: "14px 16px 16px",
              color: "#fff",
              fontFamily: PIXEL,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.1em", textShadow: "2px 2px 0 #0f4a42" }}>TRAINER CARD</span>
              <span style={{ fontSize: "7px", letterSpacing: "0.08em", opacity: 0.85 }}>OPEN TO WORK</span>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              <div
                aria-hidden="true"
                style={{
                  flex: "none",
                  width: "54px",
                  height: "54px",
                  borderRadius: "6px",
                  border: `3px solid ${EMERALD_INK}`,
                  background: "linear-gradient(180deg,#f7f4e3,#eae5c8)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <span
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: `3px solid ${EMERALD_INK}`,
                    background: `linear-gradient(180deg, ${POKEDEX_RED} 0 50%, #fff 50% 100%)`,
                    position: "relative",
                    display: "block",
                  }}
                >
                  <span style={{ position: "absolute", left: "50%", top: "50%", width: "9px", height: "9px", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "#fff", border: `2px solid ${EMERALD_INK}` }} />
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "12px", textShadow: "2px 2px 0 #0f4a42", lineHeight: 1.4 }}>FLORIAN</p>
                <p style={{ fontSize: "12px", textShadow: "2px 2px 0 #0f4a42", lineHeight: 1.4 }}>BRAUN</p>
              </div>
            </div>

            <dl style={{ margin: 0, display: "grid", gap: "7px", padding: "10px 10px 9px", background: "rgba(10,50,44,0.55)", border: `2px solid ${EMERALD_INK}`, borderRadius: "4px" }}>
              {[
                ["FIELD", "AI & DATA"],
                ["SCHOOL", "UCLL · 2027"],
                ["NEXT", "TSUKUBA · 2028"],
                ["POKéDEX", `${String(seenCount).padStart(2, "0")}/${achievements.length}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "8px", letterSpacing: "0.06em" }}>
                  <dt style={{ opacity: 0.8 }}>{k}</dt>
                  <dd style={{ margin: 0, textAlign: "right" }}>{v}</dd>
                </div>
              ))}
            </dl>

          </section>

          {/* Menu */}
          <section aria-label="Ways to reach me" style={{ ...card, padding: "10px" }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "6px" }}>
              {CHANNELS.map((c) => {
                const on = active === c.id;
                return (
                  <li key={c.id} style={{ display: "flex", gap: "6px", alignItems: "center", borderBottom: c.id === "github" ? "none" : "2px dashed rgba(28,28,28,0.14)", paddingBottom: c.id === "github" ? 0 : "6px" }}>
                    <a
                      href={c.href}
                      {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      onMouseEnter={() => { setActive(c.id); playHoverBlip(); }}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(c.id)}
                      onBlur={() => setActive(null)}
                      style={{
                        position: "relative",
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 12px",
                        textDecoration: "none",
                        color: EMERALD_INK,
                        borderRadius: "4px",
                        background: on ? "rgba(255,255,255,0.55)" : "transparent",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <span aria-hidden="true" style={{ width: "10px", fontSize: "10px", color: POKEDEX_RED, opacity: on ? 1 : 0 }}>▶</span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontFamily: PIXEL, fontSize: "10px", letterSpacing: "0.08em" }}>{c.label}</span>
                        <span style={{ display: "block", fontFamily: SANS, fontSize: "12.5px", color: dim, marginTop: "5px", wordBreak: "break-all" }}>
                          {c.value}{c.external ? " ↗" : ""}
                        </span>
                      </span>
                      <CornerBrackets color={c.color} visible={on} />
                    </a>
                    {c.id === "email" && (
                      <button
                        type="button"
                        onClick={copy}
                        aria-label={copied ? "Email address copied" : "Copy email address"}
                        style={{
                          flex: "none",
                          fontFamily: PIXEL,
                          fontSize: "8px",
                          letterSpacing: "0.06em",
                          padding: "9px 10px 8px",
                          border: `2px solid ${EMERALD_INK}`,
                          borderRadius: "4px",
                          background: copied ? "#3a8a3a" : "#fff",
                          color: copied ? "#fff" : EMERALD_INK,
                          cursor: "pointer",
                          transition: "background 0.15s ease, color 0.15s ease",
                        }}
                      >
                        {copied ? "COPIED!" : "COPY"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Other places, as type badges */}
        <nav aria-label="Other sites" className="w-full" style={{ ...card, padding: "12px 14px" }}>
          <p style={{ fontFamily: PIXEL, fontSize: "8px", letterSpacing: "0.1em", color: dim, marginBottom: "10px" }}>
            OR SEE MY WORK FIRST
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {SITES.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onMouseEnter={playHoverBlip}
                style={{
                  fontFamily: PIXEL,
                  fontSize: "8px",
                  letterSpacing: "0.06em",
                  color: "#fff",
                  textDecoration: "none",
                  background: s.color,
                  border: `2px solid ${EMERALD_INK}`,
                  borderRadius: "4px",
                  padding: "7px 10px 6px",
                  boxShadow: "inset 0 2px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.22)",
                }}
              >
                {s.label} ↗
              </a>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}
