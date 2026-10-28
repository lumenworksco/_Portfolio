"use client";

import { useCallback, useEffect, useRef } from "react";
import { Music } from "lucide-react";

const NOTE_FREQS: Record<string, number> = {
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
  C3: 130.81,
  F3: 174.61,
  G3: 196.0,
};

const STEP_DUR = 0.16; // seconds per step (~150bpm eighth notes)

// Original 16-step pentatonic loop written for this site — not a transcription
// of any existing composition.
const LEAD: (string | null)[] = [
  "C5", "E5", "G5", "E5", "A5", "G5", "E5", "D5",
  "C5", "D5", "E5", "D5", "C5", "B4", "C5", null,
];
const BASS: (string | null)[] = [
  "C3", null, "C3", null, "G3", null, "G3", null,
  "F3", null, "F3", null, "G3", null, "C3", null,
];

export default function ChiptuneMusic({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nextStepRef = useRef(0);
  const nextTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const schedulerRef = useRef<() => void>(() => {});

  const playNote = useCallback(
    (freq: number, time: number, dur: number, type: OscillatorType, peak: number) => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      osc.connect(gain).connect(master);
      osc.start(time);
      osc.stop(time + dur + 0.02);
    },
    []
  );

  useEffect(() => {
    schedulerRef.current = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      while (nextTimeRef.current < ctx.currentTime + 0.3) {
        const step = nextStepRef.current % LEAD.length;
        const leadNote = LEAD[step];
        const bassNote = BASS[step];
        if (leadNote) playNote(NOTE_FREQS[leadNote], nextTimeRef.current, STEP_DUR * 0.85, "square", 0.05);
        if (bassNote) playNote(NOTE_FREQS[bassNote], nextTimeRef.current, STEP_DUR * 1.7, "triangle", 0.07);
        nextTimeRef.current += STEP_DUR;
        nextStepRef.current += 1;
      }
      timerRef.current = window.setTimeout(() => schedulerRef.current(), 100);
    };
  }, [playNote]);

  const start = useCallback(() => {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      nextTimeRef.current = ctx.currentTime + 0.1;
      nextStepRef.current = 0;
    } else {
      ctxRef.current.resume();
    }
    schedulerRef.current();

    // Browsers refuse to play audio before a click, tap or key press on the page. If music
    // was already on (carried over from another page), begin on the first interaction.
    const ctx = ctxRef.current;
    if (ctx && ctx.state !== "running") {
      const unlock = () => {
        ctx.resume();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("pointerdown", unlock);
      window.addEventListener("keydown", unlock);
    }
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    ctxRef.current?.suspend();
  }, []);

  useEffect(() => {
    if (enabled) start();
    else stop();
  }, [enabled, start, stop]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return (
    <button
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute background music" : "Play background music"}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px 5px",
        borderRadius: "6px",
        background: enabled ? "rgba(16,185,129,0.15)" : "linear-gradient(180deg, #F7F4E3 0%, #EAE5C8 100%)",
        border: `2px solid ${enabled ? "#10b981" : "#1C1C1C"}`,
        color: enabled ? "#0d7a5f" : "rgba(28,28,28,0.7)",
        cursor: "pointer",
        boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
        transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
      }}
    >
      <Music size={13} className={enabled ? "pulse-dot" : undefined} />
      <span
        style={{
          fontSize: "8px",
          fontFamily: "var(--font-pixel), monospace",
          letterSpacing: "0.06em",
        }}
      >
        {enabled ? "MUSIC ON" : "MUSIC OFF"}
      </span>
    </button>
  );
}
