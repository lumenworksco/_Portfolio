"use client";

// Shared "emerald" chrome from the home start menu: cream boxes, the Professor's dialog,
// typewriter text, selection brackets and the overworld strip. The home page and the
// Pokédex both build on these so they stay visually identical.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export const POKEDEX_RED = "#CC0000";
export const EMERALD_CREAM = "#F7F4E3";
export const EMERALD_CREAM_DEEP = "#EAE5C8";
export const EMERALD_INK = "#1C1C1C";
export const EMERALD_BLUE = "#2E86AB";
export const EMERALD_BOX_BG = `linear-gradient(180deg, ${EMERALD_CREAM} 0%, ${EMERALD_CREAM_DEEP} 100%)`;
export const EMERALD_BOX_BORDER = `3px solid ${EMERALD_INK}`;
export const EMERALD_BOX_INSET = `inset 0 0 0 2px ${EMERALD_BLUE}30`;

// ─── Professor Dialog Box ──────────────────────────────────────────────────────
export function DialogBox({
  children,
  showCursor = false,
}: {
  children: React.ReactNode;
  showCursor?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: EMERALD_BOX_BG,
        border: EMERALD_BOX_BORDER,
        borderRadius: "8px",
        padding: "11px 20px",
        boxShadow: `${EMERALD_BOX_INSET}, 0 6px 28px rgba(0,0,0,0.45)`,
      }}
    >
      {children}
      {showCursor && (
        <span
          className="dialog-cursor"
          style={{
            position: "absolute",
            bottom: "9px",
            right: "16px",
            color: EMERALD_INK,
            fontSize: "10px",
            fontFamily: "var(--font-pixel), monospace",
          }}
        >
          ▼
        </span>
      )}
    </div>
  );
}

// ─── Typewriter text — reveals character by character, like the game's boxes ──
export function TypewriterText({
  segments,
  speedMs = 22,
  startDelay = 0,
}: {
  segments: { text: string; style?: React.CSSProperties }[];
  speedMs?: number;
  startDelay?: number;
}) {
  const fullLength = segments.reduce((n, s) => n + s.text.length, 0);
  const [count, setCount] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let cancelled = false;
    const startTime = performance.now() + startDelay;
    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - startTime;
      if (elapsed >= 0) {
        const n = Math.min(fullLength, Math.floor(elapsed / speedMs));
        setCount(n);
        if (n >= fullLength) return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [fullLength, speedMs, startDelay, reducedMotion]);

  const displayCount = reducedMotion ? fullLength : count;

  return (
    <>
      {segments.map((seg, i) => {
        const startOffset = segments.slice(0, i).reduce((n, s) => n + s.text.length, 0);
        const take = Math.max(0, Math.min(seg.text.length, displayCount - startOffset));
        return (
          <span key={i} style={seg.style}>
            {seg.text.slice(0, take)}
          </span>
        );
      })}
    </>
  );
}


// ─── GBA-style selection cursor brackets ───────────────────────────────────────
export function CornerBrackets({ color, visible }: { color: string; visible: boolean }) {
  const base: React.CSSProperties = {
    position: "absolute",
    width: "14px",
    height: "14px",
    borderColor: color,
    opacity: visible ? 1 : 0,
    transition: "opacity 0.25s ease",
    pointerEvents: "none",
  };
  return (
    <>
      <span style={{ ...base, top: "-6px", left: "-6px", borderTop: "2px solid", borderLeft: "2px solid" }} />
      <span style={{ ...base, top: "-6px", right: "-6px", borderTop: "2px solid", borderRight: "2px solid" }} />
      <span style={{ ...base, bottom: "-6px", left: "-6px", borderBottom: "2px solid", borderLeft: "2px solid" }} />
      <span style={{ ...base, bottom: "-6px", right: "-6px", borderBottom: "2px solid", borderRight: "2px solid" }} />
    </>
  );
}

// ─── Overworld strip — pixel-tile terrain + town entry banner ─────────────────
export function OverworldStrip({ label = "PROF. BRAUN'S LAB" }: { label?: string }) {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowBanner(false), 2600);
    return () => clearTimeout(t);
  }, []);

  const trees = [8, 90];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "52px",
        borderRadius: "8px",
        overflow: "hidden",
        border: `3px solid ${EMERALD_INK}`,
        boxShadow: "0 5px 18px rgba(0,0,0,0.4)",
      }}
    >
      {/* grass tiles */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(90deg, #4d9c3f 0px, #4d9c3f 15px, #57ab49 15px, #57ab49 30px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 15px, transparent 15px, transparent 30px)",
        }}
      />

      {/* dirt path */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: "18px",
          transform: "translateY(-50%)",
          background:
            "repeating-linear-gradient(90deg, #c9a36a 0px, #c9a36a 15px, #bd9660 15px, #bd9660 30px)",
          borderTop: "2px solid rgba(0,0,0,0.15)",
          borderBottom: "2px solid rgba(0,0,0,0.15)",
        }}
      />

      {/* trees */}
      {trees.map((leftPct, i) => (
        <div key={i} style={{ position: "absolute", left: `${leftPct}%`, bottom: 0, transform: "translateX(-50%)" }}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "6px",
              height: "8px",
              background: "#6b4423",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "5px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#2f6b2f",
              border: "2px solid #1f4d1f",
            }}
          />
        </div>
      ))}

      {/* entering-location banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              background: "rgba(8,8,8,0.92)",
              padding: "6px 16px 5px",
              fontFamily: "var(--font-pixel), monospace",
              fontSize: "10px",
              color: "#fff",
              letterSpacing: "0.1em",
              boxShadow: "0 2px 14px rgba(0,0,0,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

