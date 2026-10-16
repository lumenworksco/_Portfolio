"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, Repeat, Volume2 } from "lucide-react";
import { beats, TOTAL_SLOTS, type Beat } from "@/data/beats";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const GREEN = "#8fd94a";
const GREEN_DIM = "#3f5a2c";
const INK = "#0a0b09";
const MONO = 'ui-monospace, "SF Mono", "Roboto Mono", Menlo, Consolas, monospace';

// 64 peak buckets -> 16, averaged. Used for the pad sparkline and the live
// step row — real amplitude data throughout, nothing decorative or seeded.
function downsample16(peaks: number[]): number[] {
  const out: number[] = [];
  const chunk = peaks.length / 16;
  for (let i = 0; i < 16; i++) {
    const start = Math.floor(i * chunk);
    const end = Math.floor((i + 1) * chunk);
    const slice = peaks.slice(start, Math.max(end, start + 1));
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return out;
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function BeatsPage() {
  const reducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState<Beat>(beats[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [progress, setProgress] = useState(0); // 0..1
  const [displayTime, setDisplayTime] = useState(0);
  const [booted, setBooted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastBucketRef = useRef(-1);

  const steps16 = useMemo(() => downsample16(selected.peaks), [selected]);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.src = beats[0].file;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = loop;
  }, [loop]);

  useEffect(() => {
    if (!isPlaying) return;
    const tick = () => {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        const frac = audio.currentTime / audio.duration;
        const bucket = Math.floor(frac * 16);
        if (bucket !== lastBucketRef.current) {
          lastBucketRef.current = bucket;
          setProgress(frac);
          setDisplayTime(audio.currentTime);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const loadBeat = useCallback((beat: Beat, autoplay: boolean) => {
    setSelected(beat);
    setProgress(0);
    setDisplayTime(0);
    lastBucketRef.current = -1;
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = beat.file;
    audio.currentTime = 0;
    if (autoplay) {
      audio.play();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleEnded = useCallback(() => {
    if (!loop) {
      setIsPlaying(false);
      setProgress(0);
      setDisplayTime(0);
      lastBucketRef.current = -1;
    }
  }, [loop]);

  const activeStep = isPlaying ? Math.floor(progress * 16) : -1;

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center px-4 py-10"
      style={{ background: INK, overflow: "hidden" }}
    >
      <audio ref={audioRef} onEnded={handleEnded} preload="metadata" />

      {/* PCB grid texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${GREEN}0d 1px, transparent 1px), linear-gradient(90deg, ${GREEN}0d 1px, transparent 1px)`,
          backgroundSize: "26px 26px",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 40%, ${GREEN}12 0%, transparent 70%)`,
        }}
      />

      <Link
        href="/"
        style={{
          position: "fixed",
          top: "18px",
          left: "18px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: `${GREEN}99`,
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={13} /> Eject
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={
          booted
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.97, y: 14 }
        }
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "560px",
          background: "linear-gradient(160deg, #1b1e15 0%, #0f110c 100%)",
          border: `1px solid ${GREEN}30`,
          borderRadius: "18px",
          padding: "22px 22px 26px",
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.02)`,
        }}
      >
        {/* Faceplate label */}
        <div className="flex items-baseline justify-between" style={{ marginBottom: "16px" }}>
          <div>
            <p
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: `${GREEN}70`,
                marginBottom: "2px",
              }}
            >
              Florian Braun — field recordings
            </p>
            <h1
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "0.02em",
                color: "#eef7e6",
              }}
            >
              LOOP.SYS
            </h1>
          </div>
          <p
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: `${GREEN}55`,
              textAlign: "right",
            }}
          >
            made on a<br />TE PO-33 K.O.!
          </p>
        </div>

        {/* LCD */}
        <div
          style={{
            background: "#0c1409",
            border: `1px solid ${GREEN}33`,
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "12px",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
            <p
              style={{
                fontFamily: MONO,
                fontSize: "13px",
                letterSpacing: "0.02em",
                color: GREEN,
              }}
            >
              SLOT {selected.slot.toString().padStart(2, "0")} · {selected.title.toUpperCase()}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={isPlaying && !reducedMotion ? "pulse-dot" : undefined}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: isPlaying ? "#ff5a5a" : `${GREEN}60`,
                }}
              />
              <p style={{ fontFamily: MONO, fontSize: "11px", color: `${GREEN}aa` }}>
                {formatTime(displayTime)} / {formatTime(selected.duration)}
              </p>
            </div>
          </div>

          {/* Waveform */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "1.5px",
              height: "44px",
              marginBottom: "6px",
            }}
          >
            {selected.peaks.map((v, i) => {
              const played = i / selected.peaks.length <= progress;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${Math.max(8, v * 100)}%`,
                    background: played ? GREEN : GREEN_DIM,
                    borderRadius: "1px",
                    transition: "background 0.15s linear",
                  }}
                />
              );
            })}
          </div>

          {/* Live 16-step activity row, derived from the same beat's peaks */}
          <div style={{ display: "flex", gap: "3px" }}>
            {steps16.map((v, i) => {
              const hot = v > 0.55;
              const lit = i === activeStep && hot;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "5px",
                    borderRadius: "1px",
                    background: lit ? GREEN : hot ? `${GREEN}35` : `${GREEN}15`,
                    boxShadow: lit ? `0 0 6px ${GREEN}` : "none",
                    transition: "background 0.08s linear, box-shadow 0.08s linear",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-10" style={{ marginBottom: "16px" }}>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: `1px solid ${GREEN}55`,
              background: isPlaying ? GREEN : "transparent",
              color: isPlaying ? "#0a0b09" : GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: isPlaying ? `0 0 22px ${GREEN}55` : "none",
              transition: "background 0.2s ease, box-shadow 0.2s ease",
              flexShrink: 0,
            }}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: "2px" }} />}
          </button>

          <button
            onClick={() => setLoop((v) => !v)}
            aria-pressed={loop}
            aria-label="Toggle loop"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: loop ? GREEN : `${GREEN}50`,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <Repeat size={14} /> Loop
          </button>

          <div className="flex items-center gap-2" style={{ flex: 1 }}>
            <Volume2 size={14} color={`${GREEN}90`} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              style={{
                flex: 1,
                accentColor: GREEN,
              }}
            />
          </div>
        </div>

        {/* Sample pad grid — the track list, doubling as the PO's key bank */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "6px",
          }}
        >
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
            const slotNum = i + 1;
            const beat = beats.find((b) => b.slot === slotNum);
            const isSelected = beat && selected.id === beat.id;
            const sparkline = beat ? downsample16(beat.peaks).filter((_, j) => j % 2 === 0) : [];

            return (
              <button
                key={slotNum}
                disabled={!beat}
                onClick={() => beat && loadBeat(beat, true)}
                aria-label={beat ? `Play ${beat.title}` : `Empty slot ${slotNum}`}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "6px",
                  border: `1px solid ${isSelected ? GREEN : beat ? `${GREEN}40` : `${GREEN}18`}`,
                  background: isSelected ? `${GREEN}22` : beat ? "#12150e" : "transparent",
                  cursor: beat ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  padding: "4px 2px",
                  boxShadow: isSelected ? `0 0 14px ${GREEN}40` : "none",
                  transition: "background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "8px",
                    color: beat ? (isSelected ? GREEN : `${GREEN}90`) : `${GREEN}30`,
                  }}
                >
                  {slotNum.toString().padStart(2, "0")}
                </span>
                {beat ? (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "1px", height: "10px" }}>
                    {sparkline.map((v, j) => (
                      <div
                        key={j}
                        style={{
                          width: "2px",
                          height: `${Math.max(15, v * 100)}%`,
                          background: isSelected ? GREEN : `${GREEN}60`,
                          borderRadius: "0.5px",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span style={{ fontFamily: MONO, fontSize: "8px", color: `${GREEN}25` }}>— —</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer plaque */}
        <p
          style={{
            marginTop: "16px",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "10px",
            letterSpacing: "0.04em",
            color: `${GREEN}55`,
            textAlign: "center",
          }}
        >
          {beats.length} loop{beats.length === 1 ? "" : "s"} recorded so far · slot {selected.slot.toString().padStart(2, "0")} made {new Date(selected.madeOn).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · more loading soon
        </p>
      </motion.div>

      <AnimatePresence>
        {!reducedMotion && (
          <motion.div
            key="scan"
            className="fixed inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            style={{
              background:
                "repeating-linear-gradient(to bottom, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)",
              mixBlendMode: "multiply",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
