"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, BarChart3, BookOpen } from "lucide-react";
import Link from "next/link";
import Aurora from "@/components/ui/Aurora";
import SpotlightCard from "@/components/ui/SpotlightCard";
import GradientText from "@/components/ui/GradientText";
import FadeContent from "@/components/ui/FadeContent";
import ChiptuneMusic from "@/components/ui/ChiptuneMusic";
import PolaroidStack from "@/components/ui/PolaroidStack";
import { playHoverBlip, playConfirmChime, playPowerOn, playShutterClick } from "@/lib/uiSfx";
import { useSeenAchievements } from "@/lib/useSeenAchievements";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useMusicPref } from "@/lib/musicPref";
import { achievements } from "@/data/achievements";
import PocketOperator from "@/components/ui/PocketOperator";
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

const PO_GREEN = "#8fd94a";

type CardId = "lumen" | "calm" | "research";


interface Card {
  id: CardId;
  title: string;
  subtitle: string;
  pokemonType: string;
  typeColor: string;
  description: string;
  href: string | null;
  available: boolean;
  accentColor: string;
  spotlightColor: `rgba(${number}, ${number}, ${number}, ${number})`;
  gradientColors: string[];
  cardImage: string;
  cardAlt: string;
}

const cards: Card[] = [
  {
    id: "lumen",
    title: "Personal Projects",
    subtitle: "Project Portfolio",
    pokemonType: "FIRE",
    typeColor: "#EE8130",
    description:
      "The apps, tools and AI systems I build on my own, full stack and end to end: an autonomous trading system, mobile and macOS apps, and open-source utilities.",
    href: "https://projects.braunf.com",
    available: true,
    accentColor: "#f59e0b",
    spotlightColor: "rgba(245, 158, 11, 0.4)",
    gradientColors: ["#f59e0b", "#d97706", "#fbbf24", "#d97706", "#f59e0b"],
    cardImage: "/cards/eevee.webp",
    cardAlt: "Eevee ex, Special Art Rare, Terastal Fest ex 224/187",
  },
  {
    id: "calm",
    title: "CalmCampus",
    subtitle: "Student Wellness",
    pokemonType: "GRASS",
    typeColor: "#7AC74C",
    description:
      "A student wellness app that helps students manage stress, build healthy routines, and find calm during campus life.",
    href: "https://cc.braunf.com",
    available: true,
    accentColor: "#65a30d",
    spotlightColor: "rgba(101, 163, 13, 0.25)",
    gradientColors: ["#4d7c0f", "#65a30d", "#a3e635", "#65a30d", "#4d7c0f"],
    cardImage: "/cards/reuniclus.webp",
    cardAlt: "Reuniclus, Art Rare, Wild Force 075/071",
  },
  {
    id: "research",
    title: "Research",
    subtitle: "Independent Research",
    pokemonType: "PSYCHIC",
    typeColor: "#F95587",
    description:
      "Independent research on cross-lingual NLP and LLM interpretability, from Japanese pragmatics to detecting benchmark contamination, plus the open-source ESP32 hardware lab that sits beside it.",
    href: "https://research.braunf.com",
    available: true,
    accentColor: "#ec4899",
    spotlightColor: "rgba(236, 72, 153, 0.3)",
    gradientColors: ["#ec4899", "#db2777", "#f472b6", "#db2777", "#ec4899"],
    cardImage: "/cards/bronzor.webp",
    cardAlt: "Bronzor, Art Rare, Wild Force 074/071",
  },
];

// ─── Pokémon Type Badge ────────────────────────────────────────────────────────
function TypeBadge({ type, color }: { type: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px 2px",
        borderRadius: "4px",
        background: color,
        color: "#fff",
        fontSize: "8px",
        fontFamily: "var(--font-pixel), monospace",
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

// ─── Start-menu row — GBA pause-menu list item ─────────────────────────────────
function StartMenuRow({
  href,
  onClick,
  external = false,
  icon,
  label,
  color,
  badge,
  soundEnabled = false,
}: {
  href?: string;
  onClick?: () => void;
  external?: boolean;
  icon: React.ReactNode;
  label: string;
  color: string;
  badge?: string;
  soundEnabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const style: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "8px 14px 8px 24px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
    background: hovered ? color : "transparent",
    color: hovered ? "#fff" : EMERALD_INK,
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.15s ease, color 0.15s ease",
    fontFamily: "var(--font-pixel), monospace",
    fontSize: "10px",
    letterSpacing: "0.04em",
    textAlign: "left",
  };

  const handlers = {
    onMouseEnter: () => {
      setHovered(true);
      if (soundEnabled) playHoverBlip();
    },
    onMouseLeave: () => setHovered(false),
    onFocus: () => {
      setHovered(true);
      if (soundEnabled) playHoverBlip();
    },
    onBlur: () => setHovered(false),
    onClick: () => {
      if (soundEnabled) playConfirmChime();
      onClick?.();
    },
  };

  const inner = (
    <>
      <span
        style={{
          position: "absolute",
          left: "9px",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s ease",
          fontSize: "9px",
          lineHeight: 1,
        }}
      >
        ▶
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "16px",
          lineHeight: 0,
          color: hovered ? "#fff" : color,
          transition: "color 0.15s ease",
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1, display: "inline-block", lineHeight: 1, transform: "translateY(1px)" }}>
        {label}
      </span>
      {badge && (
        <span
          style={{
            fontSize: "7px",
            background: hovered ? "rgba(255,255,255,0.28)" : color,
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
    </>
  );

  if (onClick) {
    return (
      <button style={style} {...handlers}>
        {inner}
      </button>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style} {...handlers}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href!} style={style} {...handlers}>
      {inner}
    </Link>
  );
}

// ─── Collector card — the Pokémon TCG card that represents each choice ────────
const CARD_ASPECT = 600 / 825;

function CollectorCard({
  src,
  alt,
  width = 112,
  hovered = false,
  selected = false,
  color,
}: {
  src: string;
  alt: string;
  width?: number;
  hovered?: boolean;
  selected?: boolean;
  color: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const height = Math.round(width / CARD_ASPECT);

  return (
    <motion.div
      style={{ width, height, position: "relative" }}
      animate={
        reducedMotion
          ? { scale: selected ? 1.06 : 1 }
          : selected
          ? { scale: [1, 1.12, 0.96, 1.04, 1], rotate: [0, -4, 4, -2, 0] }
          : hovered
          ? { y: -6, rotate: -2 }
          : { y: 0, rotate: 0 }
      }
      transition={reducedMotion ? { duration: 0.2 } : { duration: selected ? 0.55 : 0.3, ease: "easeOut" }}
    >
      {/* ground shadow */}
      <div
        style={{
          position: "absolute",
          bottom: "-9px",
          left: "50%",
          transform: "translateX(-50%)",
          width: `${width * 0.7}px`,
          height: "9px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.4)",
          filter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "relative",
          width,
          height,
          borderRadius: "7px",
          overflow: "hidden",
          boxShadow:
            hovered || selected
              ? `0 0 0 2px ${color}, 0 12px 26px ${color}66`
              : "0 0 0 1px rgba(0,0,0,0.55), 0 6px 14px rgba(0,0,0,0.35)",
          transition: "box-shadow 0.25s ease",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={600}
          height={825}
          loading="eager"
          draggable={false}
          style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
        />
        {/* holo sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.38) 48%, transparent 66%)",
            opacity: hovered || selected ? 1 : 0,
            transform: hovered || selected ? "translateX(0)" : "translateX(-40%)",
            transition: "opacity 0.35s ease, transform 0.6s ease",
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* selection flash */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.5, 1.7] }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}bb 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </motion.div>
  );
}

// ─── Card entrance variants ────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, delay: 0.35 + i * 0.14, ease: "easeOut" as const },
  }),
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SelectPage() {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<CardId | null>(null);
  const [selectedId, setSelectedId] = useState<CardId | null>(null);
  const [navigatingToPokedex, setNavigatingToPokedex] = useState(false);
  const [navigatingToBeats, setNavigatingToBeats] = useState(false);
  const [photoFlash, setPhotoFlash] = useState(false);
  const [musicEnabled, toggleMusic] = useMusicPref();
  const { seenCount } = useSeenAchievements();
  const reducedMotion = usePrefersReducedMotion();
  const cardRefs = useRef<Record<CardId, HTMLDivElement | null>>({
    lumen: null,
    calm: null,
    research: null,
  });

  // Backtick easter egg → terminal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "`" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        router.push("/terminal");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  // Back/forward cache restores this page mid-selection (other cards dimmed, flash up).
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      setSelectedId(null);
      setNavigatingToPokedex(false);
      setNavigatingToBeats(false);
      setPhotoFlash(false);
      setHoveredId(null);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const selectedCard = cards.find((c) => c.id === selectedId) ?? null;

  const handleSelect = useCallback(
    (card: Card) => {
      if (!card.available || selectedId !== null || navigatingToPokedex) return;
      if (musicEnabled) playConfirmChime();
      setSelectedId(card.id);
      if (card.href) {
        const isInternal = card.href.startsWith("/");
        setTimeout(() => {
          if (isInternal) {
            router.push(card.href!);
          } else {
            window.location.href = card.href!;
          }
        }, 850);
      }
    },
    [selectedId, navigatingToPokedex, router, musicEnabled]
  );

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, card: Card, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect(card);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = cards[(index + 1) % cards.length];
        cardRefs.current[next.id]?.focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = cards[(index - 1 + cards.length) % cards.length];
        cardRefs.current[prev.id]?.focus();
      }
    },
    [handleSelect]
  );

  const handlePokedex = useCallback(() => {
    if (selectedId !== null || navigatingToPokedex) return;
    if (musicEnabled) playConfirmChime();
    setNavigatingToPokedex(true);
    setTimeout(() => router.push("/pokedex"), 700);
  }, [selectedId, navigatingToPokedex, router, musicEnabled]);

  const handleBeats = useCallback(() => {
    if (selectedId !== null || navigatingToPokedex || navigatingToBeats) return;
    playPowerOn();
    setNavigatingToBeats(true);
    setTimeout(() => router.push("/music"), 650);
  }, [selectedId, navigatingToPokedex, navigatingToBeats, router]);

  const handlePortfolio = useCallback(() => {
    playShutterClick();
    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 260);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: "#060608" }}>
      <ChiptuneMusic enabled={musicEnabled} onToggle={toggleMusic} />
      <PocketOperator
        onLaunch={handleBeats}
        disabled={selectedId !== null || navigatingToPokedex || navigatingToBeats}
      />
      <PolaroidStack href="https://braunf25.myportfolio.com" onLaunch={handlePortfolio} />

      {/* Aurora WebGL background — Hoenn-leaning tropical palette */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#2f6b2f", "#0e7490", "#c9a36a"]}
          speed={0.6}
          amplitude={1.1}
        />
      </div>

      {/* Vignette */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(6,6,8,0.55) 100%)",
        }}
      />

      {/* CRT scanlines — subtle handheld-screen texture */}
      <div
        className="fixed inset-0 z-20 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.09) 0px, rgba(0,0,0,0.09) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />

      {/* Card selection flash — white */}
      <AnimatePresence>
        {selectedId !== null && (
          <motion.div
            key="flash"
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: "#fff" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.5, delay: 0.25, times: [0, 0.35, 1], ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Pokédex navigation flash — red */}
      <AnimatePresence>
        {navigatingToPokedex && (
          <motion.div
            key="pokedex-flash"
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: POKEDEX_RED }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.82, 0] }}
            transition={{ duration: 0.7, times: [0, 0.2, 1], ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Beats navigation flash — phosphor green, capped low for photosensitivity */}
      <AnimatePresence>
        {navigatingToBeats && (
          <motion.div
            key="beats-flash"
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: PO_GREEN }}
            initial={{ opacity: 0 }}
            animate={{ opacity: reducedMotion ? [0, 0.25, 0] : [0, 0.4, 0] }}
            transition={{ duration: 0.65, times: [0, 0.25, 1], ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Camera flash — capped low for photosensitivity, doesn't navigate */}
      <AnimatePresence>
        {photoFlash && (
          <motion.div
            key="photo-flash"
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: "#fff" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: reducedMotion ? [0, 0.2, 0] : [0, 0.85, 0] }}
            transition={{ duration: 0.26, times: [0, 0.2, 1], ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-4 md:py-6 gap-3 md:gap-4">
        <h1 className="sr-only">Florian Braun: engineer, researcher and co-founder</h1>

        {/* Overworld strip */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl"
        >
          <OverworldStrip />
        </motion.div>

        {/* Professor dialog header */}
        <FadeContent blur duration={650} initialOpacity={0} className="w-full max-w-4xl">
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
                whiteSpace: undefined,
              }}
            >
              <TypewriterText
                segments={[
                  { text: "These three are no ordinary Pokémon — each one rare in its own right. " },
                  { text: "Which will you choose?", style: { color: EMERALD_INK, fontWeight: 600 } },
                ]}
                startDelay={300}
              />
            </p>
          </DialogBox>
        </FadeContent>

        {/* Card grid */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full max-w-4xl">
          {cards.map((card, i) => {
            const isSelected = selectedId === card.id;
            const isOther = (selectedId !== null && !isSelected) || navigatingToPokedex;
            const isHovered = hoveredId === card.id && selectedId === null && !navigatingToPokedex;

            return (
              <motion.div
                key={card.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="flex-1"
                style={{ position: "relative" }}
              >
                <motion.div
                  ref={(el) => {
                    cardRefs.current[card.id] = el;
                  }}
                  role="button"
                  tabIndex={card.available ? 0 : -1}
                  aria-label={`Choose ${card.title}`}
                  aria-disabled={!card.available}
                  onHoverStart={() => {
                    if (!card.available) return;
                    setHoveredId(card.id);
                    if (musicEnabled) playHoverBlip();
                  }}
                  onHoverEnd={() => setHoveredId(null)}
                  onFocus={() => card.available && setHoveredId(card.id)}
                  onBlur={() => setHoveredId(null)}
                  onKeyDown={(e) => handleCardKeyDown(e, card, i)}
                  onClick={() => handleSelect(card)}
                  animate={{
                    scale: isSelected ? 1.04 : isOther ? 0.93 : isHovered ? 1.025 : 1,
                    opacity: isOther ? 0.2 : 1,
                    y: isHovered ? -10 : 0,
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{
                    cursor: card.available ? "pointer" : "not-allowed",
                    height: "100%",
                    position: "relative",
                    outline: "none",
                  }}
                >
                  <CornerBrackets color={card.accentColor} visible={(isHovered || isSelected) && card.available} />
                  <SpotlightCard
                    spotlightColor={card.available ? card.spotlightColor : "rgba(80, 80, 80, 0.08)"}
                    className="flex flex-col h-full"
                    style={{
                      minHeight: "clamp(260px, 32vw, 320px)",
                      padding: "19px",
                      borderRadius: "10px",
                      border: `2px solid ${
                        isSelected
                          ? card.accentColor
                          : isHovered
                          ? card.accentColor + "80"
                          : EMERALD_INK
                      }`,
                      boxShadow: isSelected
                        ? `${EMERALD_BOX_INSET}, 0 0 50px ${card.accentColor}50, 0 0 90px ${card.accentColor}20`
                        : isHovered
                        ? `${EMERALD_BOX_INSET}, 0 0 28px ${card.accentColor}30`
                        : EMERALD_BOX_INSET,
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                      background: card.available
                        ? EMERALD_BOX_BG
                        : "rgba(120,116,96,0.35)",
                    }}
                  >
                    {/* Top accent bar */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: card.available ? card.accentColor : "#333",
                        opacity: isHovered || isSelected ? 1 : 0.6,
                        transition: "opacity 0.3s ease",
                      }}
                    />

                    {/* Corner glow */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-30px",
                        left: "-30px",
                        width: "140px",
                        height: "140px",
                        borderRadius: "50%",
                        background: card.accentColor,
                        opacity: isHovered || isSelected ? 0.07 : 0.025,
                        filter: "blur(40px)",
                        transition: "opacity 0.4s ease",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Type emblem */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "4px",
                        marginBottom: "22px",
                        filter: card.available ? "none" : "grayscale(1)",
                        opacity: card.available ? 1 : 0.4,
                      }}
                    >
                      <CollectorCard
                        src={card.cardImage}
                        alt={card.cardAlt}
                        hovered={isHovered}
                        selected={isSelected}
                        color={card.accentColor}
                      />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl font-bold mb-1">
                      <GradientText
                        colors={
                          card.available
                            ? card.gradientColors
                            : ["#8a8a80", "#6f6f66", "#8a8a80"]
                        }
                        animationSpeed={5}
                      >
                        {card.title}
                      </GradientText>
                    </h2>

                    {/* Subtitle + type badge */}
                    <div className="flex items-center gap-2 mb-4" style={{ flexWrap: "wrap" }}>
                      <p
                        className="text-[10px] font-mono tracking-[0.2em] uppercase"
                        style={{ color: "rgba(28,28,28,0.55)" }}
                      >
                        {card.subtitle}
                      </p>
                      <TypeBadge
                        type={card.pokemonType}
                        color={card.available ? card.typeColor : "#8a8a80"}
                      />
                    </div>

                    {/* Accent line */}
                    <div
                      style={{
                        width: isHovered || isSelected ? "48px" : "24px",
                        height: "2px",
                        background: card.available ? card.accentColor : "#999",
                        marginBottom: "14px",
                        transition: "width 0.4s ease",
                        opacity: card.available ? 1 : 0.4,
                      }}
                    />

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed flex-1"
                      style={{
                        color: card.available
                          ? "rgba(28,28,28,0.72)"
                          : "rgba(28,28,28,0.3)",
                      }}
                    >
                      {card.description}
                    </p>

                    {/* CTA */}
                    <div className="mt-5">
                      {card.available ? (
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-pixel), monospace",
                            color: card.accentColor,
                            opacity: isHovered ? 1 : 0.8,
                            transition: "opacity 0.3s ease",
                            letterSpacing: "0.04em",
                          }}
                        >
                          ▶ CHOOSE
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "8px",
                            fontFamily: "var(--font-pixel), monospace",
                            color: "rgba(28,28,28,0.35)",
                            background: "rgba(28,28,28,0.05)",
                            border: "1px solid rgba(28,28,28,0.15)",
                            padding: "4px 10px 3px",
                            borderRadius: "4px",
                            letterSpacing: "0.04em",
                          }}
                        >
                          COMING SOON
                        </span>
                      )}
                    </div>
                  </SpotlightCard>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Start menu — every other destination, GBA pause-menu style */}
        <FadeContent blur duration={600} delay={1100} initialOpacity={0} className="w-full max-w-4xl">
          <div
            style={{
              position: "relative",
              background: EMERALD_BOX_BG,
              border: EMERALD_BOX_BORDER,
              borderRadius: "8px",
              padding: "12px 14px 14px",
              boxShadow: EMERALD_BOX_INSET,
            }}
          >
            {/* Panel label */}
            <div className="flex items-center gap-2 px-3 pt-1.5 pb-2">
              <span
                className="pulse-dot"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: POKEDEX_RED,
                  boxShadow: `0 0 8px ${POKEDEX_RED}`,
                }}
              />
              <p
                style={{
                  fontSize: "9px",
                  fontFamily: "var(--font-pixel), monospace",
                  color: "rgba(28,28,28,0.5)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Menu
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <StartMenuRow
                onClick={handlePokedex}
                icon={<BookOpen size={14} />}
                label="POKEDEX + NOW"
                color={POKEDEX_RED}
                soundEnabled={musicEnabled}
                badge={seenCount > 0 ? `${seenCount}/${achievements.length}` : undefined}
              />
              <StartMenuRow
                href="https://nihongo.braunf.com"
                external
                icon={<span style={{ fontSize: "13px" }}>日</span>}
                label="NIHONGO"
                color="#f472b6"
                badge="WK LV.3"
                soundEnabled={musicEnabled}
              />
              <StartMenuRow
                href="https://go.braunf.com"
                external
                icon={<span style={{ fontSize: "13px" }}>●</span>}
                label="GO"
                color="#78716c"
                badge="25 KYU · 600 ELO"
                soundEnabled={musicEnabled}
              />
            </div>

            <div style={{ height: "1px", background: "rgba(28,28,28,0.15)", margin: "5px 12px" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px" }}>
              <StartMenuRow href="/contact" icon={<Mail size={14} />} label="CONTACT" color={EMERALD_INK} soundEnabled={musicEnabled} />
              <StartMenuRow href="https://data.braunf.com" external icon={<BarChart3 size={14} />} label="DATACAMP" color="#f59e0b" soundEnabled={musicEnabled} />
            </div>
          </div>
        </FadeContent>

        {/* Bottom dialog */}
        <FadeContent blur duration={600} delay={950} initialOpacity={0} className="w-full max-w-4xl">
          <DialogBox showCursor={selectedId === null && !navigatingToPokedex && !navigatingToBeats}>
            <AnimatePresence mode="wait">
              {selectedId === null && !navigatingToPokedex && !navigatingToBeats ? (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-pixel), monospace",
                    color: "rgba(28,28,28,0.7)",
                    letterSpacing: "0.05em",
                    lineHeight: "1.8",
                  }}
                >
                  <TypewriterText segments={[{ text: "Choose a Pokémon!" }]} speedMs={28} />
                </motion.p>
              ) : navigatingToPokedex ? (
                <motion.p
                  key="pokedex"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-pixel), monospace",
                    letterSpacing: "0.05em",
                    lineHeight: "1.8",
                    color: POKEDEX_RED,
                  }}
                >
                  <TypewriterText segments={[{ text: "Opening POKEDEX..." }]} speedMs={28} />
                </motion.p>
              ) : navigatingToBeats ? (
                <motion.p
                  key="beats"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-pixel), monospace",
                    letterSpacing: "0.05em",
                    lineHeight: "1.8",
                    color: PO_GREEN,
                  }}
                >
                  <TypewriterText segments={[{ text: "Powering on PO-33..." }]} speedMs={28} />
                </motion.p>
              ) : (
                <motion.p
                  key="chosen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-pixel), monospace",
                    letterSpacing: "0.05em",
                    lineHeight: "1.8",
                  }}
                >
                  <TypewriterText
                    segments={[
                      { text: "So, you want ", style: { color: "rgba(28,28,28,0.7)" } },
                      { text: selectedCard?.title ?? "", style: { color: selectedCard?.accentColor ?? EMERALD_INK } },
                      { text: "? This choice is yours!", style: { color: "rgba(28,28,28,0.7)" } },
                    ]}
                    speedMs={28}
                  />
                </motion.p>
              )}
            </AnimatePresence>
          </DialogBox>
        </FadeContent>

        {/* Friend credit — not one of my own projects, kept visually separate */}
        <FadeContent blur duration={600} delay={1250} initialOpacity={0}>
          <a
            href="https://delphi.tools/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "9px",
              fontFamily: "var(--font-pixel), monospace",
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.28)",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.28)")
            }
          >
            delphi.tools ↗ — built by a fellow developer
          </a>
        </FadeContent>
      </main>
    </div>
  );
}
