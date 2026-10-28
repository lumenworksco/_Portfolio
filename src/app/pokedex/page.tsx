"use client";

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Search, Check, BookOpen, Radio, Flame, Brain, Leaf, Github } from "lucide-react";
import Link from "next/link";
import Aurora from "@/components/ui/Aurora";
import { GitHubActivity } from "@/components/GitHubActivity";
import { HuggingFaceActivity } from "@/components/HuggingFaceActivity";
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
import {
  achievements,
  typeColors,
  type Achievement,
  POKEDEX_UPDATED_FALLBACK,
  type Category,
} from "@/data/achievements";
import { useSeenAchievements } from "@/lib/useSeenAchievements";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useMusicPref } from "@/lib/musicPref";
import { playHoverBlip, playConfirmChime } from "@/lib/uiSfx";
import ChiptuneMusic from "@/components/ui/ChiptuneMusic";

const PIXEL = "var(--font-pixel), monospace";
const LCD_GREEN = "#8fd94a";

// ─── Which tab is open lives in the URL hash, so /pokedex#now is linkable ─────
type Tab = "dex" | "now";

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

function setTabInUrl(tab: Tab) {
  const url = tab === "now" ? "#now" : window.location.pathname + window.location.search;
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

// ─── When the Pokédex data last changed ────────────────────────────────────────
const UPDATED_ISO = process.env.NEXT_PUBLIC_POKEDEX_UPDATED || POKEDEX_UPDATED_FALLBACK;
const UPDATED_LABEL = new Date(`${UPDATED_ISO}T12:00:00Z`)
  .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
  .toUpperCase();

// ─── Filter categories ─────────────────────────────────────────────────────────
const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all",        label: "ALL"       },
  { id: "founding",   label: "FOUNDING"  },
  { id: "hackathon",  label: "HACKATHON" },
  { id: "award",      label: "AWARD"     },
  { id: "education",  label: "EDUCATION" },
  { id: "cert",       label: "CERT"      },
  { id: "research",   label: "RESEARCH"  },
  { id: "role",       label: "ROLE"      },
];

// ─── What I'm focused on now (same accents as the home-page cards) ────────────
const FOCUS = [
  { label: "Personal Projects", desc: "Building my own apps and tools end to end.", type: "FIRE", color: "#f59e0b", icon: Flame },
  { label: "Cross-lingual NLP research", desc: "Probing how small LLMs reason across languages.", type: "PSYCHIC", color: "#ec4899", icon: Brain },
  { label: "CalmCampus", desc: "Shipping features for the student wellness app.", type: "GRASS", color: "#65a30d", icon: Leaf },
];
const FOCUS_BADGE: Record<string, string> = { FIRE: "#EE8130", PSYCHIC: "#F95587", GRASS: "#7AC74C" };

// ─── Type badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type, color }: { type: string; color?: string }) {
  const bg = color ?? typeColors[type as keyof typeof typeColors] ?? "#A8A878";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px 1px",
        borderRadius: "4px",
        background: bg,
        color: "#fff",
        fontSize: "7px",
        fontFamily: PIXEL,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        lineHeight: "1.8",
        textShadow: "0 1px 1px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.4)",
        boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.25)",
      }}
    >
      {type}
    </span>
  );
}

// ─── Start-menu tab — GBA pause-menu row ───────────────────────────────────────
function MenuTab({
  selected,
  onSelect,
  icon,
  label,
  badge,
  color,
  controls,
  soundEnabled = false,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  color: string;
  controls: string;
  soundEnabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;
  return (
    <button
      role="tab"
      id={`tab-${controls}`}
      aria-selected={selected}
      aria-controls={controls}
      onClick={() => {
        if (soundEnabled) playConfirmChime();
        onSelect();
      }}
      onMouseEnter={() => {
        setHovered(true);
        if (soundEnabled) playHoverBlip();
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        setHovered(true);
        if (soundEnabled) playHoverBlip();
      }}
      onBlur={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "10px 14px 10px 26px",
        borderRadius: "6px",
        border: "none",
        outline: "none",
        background: active ? color : "transparent",
        color: active ? "#fff" : EMERALD_INK,
        cursor: "pointer",
        transition: "background 0.15s ease, color 0.15s ease",
        fontFamily: PIXEL,
        fontSize: "10px",
        letterSpacing: "0.04em",
        textAlign: "left",
      }}
    >
      <span style={{ position: "absolute", left: "9px", fontSize: "9px", opacity: active ? 1 : 0, transition: "opacity 0.15s ease" }}>
        ▶
      </span>
      <span style={{ display: "flex", color: active ? "#fff" : color, transition: "color 0.15s ease" }}>{icon}</span>
      <span style={{ flex: 1, transform: "translateY(1px)" }}>{label}</span>
      {badge && (
        <span
          style={{
            fontSize: "7px",
            background: active ? "rgba(255,255,255,0.28)" : color,
            color: "#fff",
            padding: "3px 6px 2px",
            borderRadius: "4px",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Achievement card ──────────────────────────────────────────────────────────
function AchievementCard({
  achievement,
  onClick,
  index,
  seen,
  soundEnabled,
  animate: playIn,
}: {
  achievement: Achievement;
  onClick: () => void;
  index: number;
  seen: boolean;
  soundEnabled: boolean;
  animate: boolean;
}) {
  const Icon = achievement.icon;
  const primaryColor = typeColors[achievement.types[0]];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      // Entries "register" one after another: each pops in with a bright flash that settles
      initial={playIn ? { opacity: 0, scale: 0.9, filter: "brightness(2.4) saturate(0.6)" } : false}
      animate={{ opacity: 1, scale: 1, filter: "brightness(1) saturate(1)" }}
      transition={{ duration: 0.4, delay: Math.min(index, 20) * 0.04, ease: "easeOut" }}
      style={{ position: "relative" }}
    >
      <CornerBrackets color={primaryColor} visible={hovered} />
      <motion.button
        onClick={() => {
          if (soundEnabled) playConfirmChime();
          onClick();
        }}
        onMouseEnter={() => {
          setHovered(true);
          if (soundEnabled) playHoverBlip();
        }}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        whileHover={{ y: -4 }}
        style={{
          background: EMERALD_BOX_BG,
          border: `2px solid ${hovered ? primaryColor : EMERALD_INK}`,
          borderRadius: "10px",
          padding: "16px",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          boxShadow: hovered ? `${EMERALD_BOX_INSET}, 0 0 26px ${primaryColor}40` : EMERALD_BOX_INSET,
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          outline: "none",
        }}
      >
        {/* Type-coloured accent bar, like the home cards */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: primaryColor,
            opacity: hovered ? 1 : 0.6,
            transition: "opacity 0.3s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -24,
            right: -24,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: primaryColor,
            opacity: hovered ? 0.16 : 0.08,
            filter: "blur(20px)",
            pointerEvents: "none",
            transition: "opacity 0.3s ease",
          }}
        />

        {seen && (
          <div
            title="Seen"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "#2E86AB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 2px rgba(28,28,28,0.12)",
            }}
          >
            <Check size={10} color="#fff" strokeWidth={3} />
          </div>
        )}

        <p style={{ fontSize: "9px", fontFamily: PIXEL, color: "rgba(28,28,28,0.4)", margin: "4px 0 10px", letterSpacing: "0.1em" }}>
          No.{achievement.id}
        </p>
        <div style={{ color: primaryColor, marginBottom: "10px" }}>
          <Icon size={22} />
        </div>
        <p style={{ fontSize: "12px", fontWeight: 600, color: EMERALD_INK, marginBottom: "3px", lineHeight: 1.3 }}>
          {achievement.name}
        </p>
        <p style={{ fontSize: "10px", color: "rgba(28,28,28,0.6)", marginBottom: "9px", lineHeight: 1.3 }}>
          {achievement.org}
        </p>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {achievement.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
        {achievement.highlight && (
          <p style={{ fontSize: "8px", fontFamily: PIXEL, color: primaryColor, letterSpacing: "0.04em", marginTop: "9px", lineHeight: 1.6 }}>
            ★ {achievement.highlight}
          </p>
        )}
      </motion.button>
    </motion.div>
  );
}

// ─── Detail modal ──────────────────────────────────────────────────────────────
function Modal({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  const Icon = achievement.icon;
  const primaryColor = typeColors[achievement.types[0]];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={achievement.name}
        initial={{ opacity: 0, scale: 0.93, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: EMERALD_BOX_BG,
          border: EMERALD_BOX_BORDER,
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "480px",
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: `${EMERALD_BOX_INSET}, 0 0 60px ${primaryColor}25, 0 24px 60px rgba(0,0,0,0.85)`,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: primaryColor }} />
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(28,28,28,0.06)",
            border: `1px solid ${EMERALD_INK}30`,
            borderRadius: "6px",
            padding: "5px",
            cursor: "pointer",
            color: "rgba(28,28,28,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={13} />
        </button>

        <p style={{ fontSize: "9px", fontFamily: PIXEL, color: "rgba(28,28,28,0.4)", margin: "6px 0 16px", letterSpacing: "0.1em" }}>
          No.{achievement.id}
        </p>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
          <div style={{ color: primaryColor, filter: `drop-shadow(0 0 10px ${primaryColor}65)`, flexShrink: 0, marginTop: "3px" }}>
            <Icon size={34} />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: EMERALD_INK, lineHeight: 1.2, marginBottom: "7px" }}>
              {achievement.name}
            </h2>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {achievement.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: primaryColor, opacity: 0.85, marginBottom: "4px" }}>{achievement.org}</p>
          <p style={{ fontSize: "10px", fontFamily: PIXEL, color: "rgba(28,28,28,0.45)", letterSpacing: "0.04em" }}>
            {achievement.period}
          </p>
        </div>

        {achievement.highlight && (
          <div
            style={{
              background: `${primaryColor}12`,
              border: `1px solid ${primaryColor}28`,
              borderRadius: "6px",
              padding: "8px 12px",
              marginBottom: "16px",
            }}
          >
            <p style={{ fontSize: "9px", fontFamily: PIXEL, color: primaryColor, letterSpacing: "0.05em" }}>
              ★ {achievement.highlight}
            </p>
          </div>
        )}

        <div style={{ height: "1px", background: "rgba(28,28,28,0.12)", marginBottom: "16px" }} />
        <p style={{ fontSize: "13px", color: "rgba(28,28,28,0.75)", lineHeight: 1.75 }}>{achievement.detail}</p>
      </motion.div>
    </motion.div>
  );
}

// ─── Dark LCD "screen" for the live panels, framed like the cream boxes ───────
function Lcd({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(180deg, #0b1511 0%, #08100c 100%)",
        border: EMERALD_BOX_BORDER,
        borderRadius: "8px",
        boxShadow: "inset 0 0 0 2px #25402f, 0 6px 24px rgba(0,0,0,0.45)",
        padding: "16px 18px 18px",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div style={{ position: "relative" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: "14px" }}>
          <span className="pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: LCD_GREEN, boxShadow: `0 0 8px ${LCD_GREEN}` }} />
          <span style={{ color: LCD_GREEN, display: "flex" }}>{icon}</span>
          <p style={{ fontSize: "9px", fontFamily: PIXEL, color: LCD_GREEN, letterSpacing: "0.14em", textTransform: "uppercase" }}>{title}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function PokedexPage() {
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const tab: Tab = hash === "#now" ? "now" : "dex";
  const reducedMotion = usePrefersReducedMotion();

  const [filter, setFilter] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Achievement | null>(null);
  const [musicOn, toggleMusic] = useMusicPref();
  const { seenIds, markSeen, seenCount } = useSeenAchievements();

  const total = achievements.length;
  const seenPct = total ? Math.round((seenCount / total) * 100) : 0;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: achievements.length };
    for (const a of achievements) counts[a.category] = (counts[a.category] ?? 0) + 1;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return achievements.filter((a) => {
      const matchesCategory = filter === "all" || a.category === filter;
      const matchesQuery = q.length === 0 || a.name.toLowerCase().includes(q) || a.org.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [filter, query]);

  const handleSelect = useCallback(
    (a: Achievement) => {
      setSelected(a);
      markSeen(a.id);
    },
    [markSeen]
  );
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: "#060608" }}>
      {/* Aurora — the home page's tropical palette */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Aurora colorStops={["#2f6b2f", "#0e7490", "#c9a36a"]} speed={0.6} amplitude={1.1} />
      </div>

      {/* Vignette */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(6,6,8,0.55) 100%)" }}
      />

      {/* CRT scanlines — subtle handheld-screen texture */}
      <div
        className="fixed inset-0 z-20 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.09) 0px, rgba(0,0,0,0.09) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />

      <ChiptuneMusic enabled={musicOn} onToggle={toggleMusic} />

      {/* Back */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-30 flex items-center gap-2 text-xs font-mono tracking-widest uppercase"
        style={{
          padding: "6px 12px 5px",
          borderRadius: "6px",
          background: EMERALD_BOX_BG,
          border: `2px solid ${EMERALD_INK}`,
          boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
          color: "rgba(28,28,28,0.7)",
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <main className="relative z-10 flex flex-col items-center gap-3 md:gap-4 px-4 pt-20 pb-24 max-w-4xl mx-auto">
        <h1 className="sr-only">Pokédex and Now: achievements and what Florian is working on</h1>

        {/* Overworld strip */}
        <div className="w-full">
          <OverworldStrip label="POKEDEX" />
        </div>

        {/* Professor dialog */}
        <div className="w-full">
          <DialogBox showCursor>
            <p
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontWeight: 600,
                color: "rgba(28,28,28,0.5)",
                marginBottom: "3px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Prof. Braun
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(28,28,28,0.88)",
                lineHeight: "1.6",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                minHeight: "42px",
              }}
            >
              <TypewriterText
                key={tab}
                segments={
                  tab === "dex"
                    ? [
                        { text: `${total} entries logged so far: every hackathon, award, role and course. ` },
                        { text: "Tap one to read its entry.", style: { color: EMERALD_INK, fontWeight: 600 } },
                      ]
                    : [
                        { text: "This is what I am training right now, plus my latest moves, " },
                        { text: "pulled live from GitHub and Hugging Face.", style: { color: EMERALD_INK, fontWeight: 600 } },
                      ]
                }
                startDelay={200}
              />
            </p>
          </DialogBox>
        </div>

        {/* Start menu: the two tabs */}
        <div className="w-full">
          <div
            style={{
              background: EMERALD_BOX_BG,
              border: EMERALD_BOX_BORDER,
              borderRadius: "8px",
              padding: "12px 14px 14px",
              boxShadow: EMERALD_BOX_INSET,
            }}
          >
            <div className="flex items-center gap-2 px-3 pt-1.5 pb-2">
              <span
                className="pulse-dot"
                style={{ width: "6px", height: "6px", borderRadius: "50%", background: POKEDEX_RED, boxShadow: `0 0 8px ${POKEDEX_RED}` }}
              />
              <p style={{ fontSize: "9px", fontFamily: PIXEL, color: "rgba(28,28,28,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Menu
              </p>
              <p style={{ marginLeft: "auto", fontSize: "8px", fontFamily: PIXEL, color: "rgba(28,28,28,0.5)", letterSpacing: "0.08em" }}>
                UPDATED <time dateTime={UPDATED_ISO}>{UPDATED_LABEL}</time>
              </p>
            </div>
            <div role="tablist" aria-label="Pokédex sections" className="grid grid-cols-1 sm:grid-cols-2 gap-px">
              <MenuTab
                selected={tab === "dex"}
                onSelect={() => setTabInUrl("dex")}
                icon={<BookOpen size={14} />}
                label="POKEDEX"
                badge={`${seenCount}/${total}`}
                color={POKEDEX_RED}
                controls="panel-dex"
                soundEnabled={musicOn}
              />
              <MenuTab
                selected={tab === "now"}
                onSelect={() => setTabInUrl("now")}
                icon={<Radio size={14} />}
                label="NOW"
                badge="LIVE"
                color="#0e7490"
                controls="panel-now"
                soundEnabled={musicOn}
              />
            </div>
          </div>
        </div>

        {/* ───────────── POKEDEX tab ───────────── */}
        {tab === "dex" && (
          <div id="panel-dex" role="tabpanel" aria-labelledby="tab-panel-dex" className="w-full flex flex-col gap-3 md:gap-4">
            {/* Seen meter — HP-bar style */}
            <div
              style={{
                background: EMERALD_BOX_BG,
                border: EMERALD_BOX_BORDER,
                borderRadius: "8px",
                padding: "12px 16px",
                boxShadow: EMERALD_BOX_INSET,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "9px", fontFamily: PIXEL, color: EMERALD_INK, letterSpacing: "0.1em" }}>SEEN</span>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={seenCount}
                aria-label="Entries you have opened"
                style={{
                  flex: 1,
                  minWidth: "120px",
                  height: "12px",
                  border: `2px solid ${EMERALD_INK}`,
                  borderRadius: "7px",
                  background: "#cfc8a6",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${seenPct}%`,
                    background: "repeating-linear-gradient(90deg, #4ade80 0px, #4ade80 5px, #22c55e 5px, #22c55e 7px)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: "9px", fontFamily: PIXEL, color: "rgba(28,28,28,0.65)", letterSpacing: "0.08em" }}>
                {seenCount}/{total}
              </span>
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search
                size={13}
                color="rgba(28,28,28,0.45)"
                style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or organisation..."
                aria-label="Search the Pokédex"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 34px",
                  borderRadius: "8px",
                  background: EMERALD_BOX_BG,
                  border: EMERALD_BOX_BORDER,
                  boxShadow: EMERALD_BOX_INSET,
                  fontSize: "12px",
                  color: EMERALD_INK,
                  outline: "none",
                }}
              />
            </div>

            {/* Filter tabs */}
            <div className="filter-scroll" style={{ display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "4px" }}>
              {CATEGORIES.map((cat) => {
                const isActive = filter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    aria-pressed={isActive}
                    style={{
                      padding: "6px 12px 5px",
                      borderRadius: "5px",
                      fontSize: "8px",
                      fontFamily: PIXEL,
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: isActive ? POKEDEX_RED : EMERALD_BOX_BG,
                      border: isActive ? `2px solid ${POKEDEX_RED}` : `2px solid ${EMERALD_INK}`,
                      color: isActive ? "#fff" : "rgba(28,28,28,0.65)",
                      boxShadow: isActive ? "0 0 16px #CC000050" : "none",
                    }}
                  >
                    {cat.label} · {categoryCounts[cat.id] ?? 0}
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <DialogBox>
                <p style={{ fontSize: "11px", fontFamily: PIXEL, color: "rgba(28,28,28,0.7)", letterSpacing: "0.05em", lineHeight: 1.8 }}>
                  No entry found. Try another search!
                </p>
              </DialogBox>
            ) : (
              <motion.div
                key={filter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "12px" }}
              >
                {filtered.map((a, i) => (
                  <AchievementCard
                    key={a.id}
                    achievement={a}
                    index={i}
                    seen={seenIds.has(a.id)}
                    soundEnabled={musicOn}
                    animate={!reducedMotion}
                    onClick={() => handleSelect(a)}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* ───────────── NOW tab ───────────── */}
        {tab === "now" && (
          <div id="panel-now" role="tabpanel" aria-labelledby="tab-panel-now" className="w-full flex flex-col gap-3 md:gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {FOCUS.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: "easeOut" }}
                    style={{
                      position: "relative",
                      background: EMERALD_BOX_BG,
                      border: EMERALD_BOX_BORDER,
                      borderRadius: "10px",
                      boxShadow: EMERALD_BOX_INSET,
                      padding: "22px 18px 18px",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: f.color }} />
                    <div style={{ position: "absolute", top: -26, right: -26, width: 100, height: 100, borderRadius: "50%", background: f.color, opacity: 0.12, filter: "blur(22px)" }} />
                    <p style={{ position: "relative", fontSize: "8px", fontFamily: PIXEL, color: "rgba(28,28,28,0.45)", letterSpacing: "0.14em", marginBottom: "12px" }}>
                      FOCUS {i + 1}
                    </p>
                    <div style={{ position: "relative", color: f.color, marginBottom: "10px" }}>
                      <Icon size={22} />
                    </div>
                    <p style={{ position: "relative", fontSize: "14px", fontWeight: 700, color: EMERALD_INK, lineHeight: 1.25, marginBottom: "6px" }}>{f.label}</p>
                    <p style={{ position: "relative", fontSize: "12px", color: "rgba(28,28,28,0.65)", lineHeight: 1.6, marginBottom: "12px" }}>{f.desc}</p>
                    <div style={{ position: "relative" }}>
                      <TypeBadge type={f.type} color={FOCUS_BADGE[f.type]} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Lcd title="Live from GitHub" icon={<Github size={13} />}>
              <GitHubActivity />
            </Lcd>

            <Lcd title="Live from Hugging Face" icon={<span style={{ fontSize: "13px", lineHeight: 1 }}>🤗</span>}>
              <HuggingFaceActivity />
            </Lcd>

            <DialogBox showCursor>
              <p style={{ fontSize: "10px", fontFamily: PIXEL, color: "rgba(28,28,28,0.7)", letterSpacing: "0.05em", lineHeight: 1.9 }}>
                Activity refreshes automatically. Focus updates whenever it changes.
              </p>
            </DialogBox>
          </div>
        )}
      </main>

      <AnimatePresence>{selected && <Modal achievement={selected} onClose={handleClose} />}</AnimatePresence>
    </div>
  );
}
