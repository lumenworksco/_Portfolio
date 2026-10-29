"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { beats, TOTAL_SLOTS, type Beat } from "@/data/beats";

// A homage to the Teenage Engineering PO-33 K.O!, the little sampler these loops were made on:
// a pale aluminium body, a small LCD, a 4x4 bank of keys and a few printed buttons.
// Not affiliated with Teenage Engineering.

const PIXEL = "var(--font-pixel), monospace";
const SANS = "var(--font-inter), system-ui, sans-serif";
const ORANGE = "#ff5a1f";
const INK = "#232323";
const LCD_BG = "#b8c3a8";
const LCD_INK = "#1f2a17";
const LCD_DIM = "rgba(31,42,23,0.2)";

// 64 peak buckets -> 16, averaged. Real amplitude data throughout, nothing decorative or seeded.
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
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop;
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
      audio.play().catch(() => setIsPlaying(false));
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
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const step = useCallback(
    (dir: number) => {
      const i = beats.findIndex((b) => b.id === selected.id);
      loadBeat(beats[(i + dir + beats.length) % beats.length], isPlaying);
    },
    [selected, isPlaying, loadBeat],
  );

  const handleEnded = useCallback(() => {
    if (!loop) {
      setIsPlaying(false);
      setProgress(0);
      setDisplayTime(0);
      lastBucketRef.current = -1;
    }
  }, [loop]);

  const activeStep = isPlaying ? Math.floor(progress * 16) : -1;
  const vol = Math.round(volume * 100);
  const bumpVol = (d: number) => setVolume((v) => Math.min(1, Math.max(0, Math.round((v + d) * 100) / 100)));

  return (
    <div className="po-root">
      <audio ref={audioRef} onEnded={handleEnded} preload="metadata" />

      <Link href="/pokedex" className="po-eject">
        <ArrowLeft size={13} /> Eject
      </Link>

      <motion.div
        className="po-body"
        initial={{ opacity: 0, y: 16, rotate: -0.6 }}
        animate={booted ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 16, rotate: -0.6 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="sr-only">Beats: loops made on a PO-33 K.O.!</h1>

        {/* Left: brand, LCD, printed buttons */}
        <div className="po-left">
          <div className="po-brand">
            <span className="po-brand-name">pocket operator</span>
            <span className="po-brand-tag">made on a PO-33 K.O.!</span>
          </div>

          <div className="po-lcd" role="status" aria-live="polite">
            <div className="po-lcd-top">
              <span className="po-lcd-slot">{selected.slot.toString().padStart(2, "0")}</span>
              <div className="po-lcd-icons">
                <span style={{ opacity: isPlaying ? 1 : 0.2 }}>▶</span>
                <span style={{ opacity: loop ? 1 : 0.2 }}>LP</span>
                <span>V{vol.toString().padStart(3, "0")}</span>
              </div>
            </div>
            <p className="po-lcd-title">{selected.title.toUpperCase()}</p>

            <div className="po-lcd-wave" aria-hidden="true">
              {selected.peaks.map((v, i) => {
                const played = i / selected.peaks.length <= progress;
                return (
                  <i key={i} style={{ height: `${Math.max(10, v * 100)}%`, background: played ? LCD_INK : LCD_DIM }} />
                );
              })}
            </div>

            <div className="po-lcd-steps" aria-hidden="true">
              {steps16.map((v, i) => {
                const hot = v > 0.55;
                const lit = i === activeStep;
                return <i key={i} style={{ background: lit ? LCD_INK : hot ? "rgba(31,42,23,0.45)" : LCD_DIM }} />;
              })}
            </div>

            <p className="po-lcd-time">
              {formatTime(displayTime)} / {formatTime(selected.duration)}
            </p>
          </div>

          <div className="po-fn">
            <button type="button" className="po-btn po-btn-wide" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
              <span>{isPlaying ? "pause" : "play"}</span>
            </button>
            <button type="button" className="po-btn" onClick={() => step(-1)} aria-label="Previous sound">
              <ChevronLeft size={15} />
              <span>sound</span>
            </button>
            <button type="button" className="po-btn" onClick={() => step(1)} aria-label="Next sound">
              <ChevronRight size={15} />
              <span>sound</span>
            </button>
            <button type="button" className="po-btn" onClick={() => setLoop((v) => !v)} aria-pressed={loop} aria-label="Toggle loop">
              <i className="po-led" data-on={loop} />
              <span>loop</span>
            </button>
            <button type="button" className="po-btn" onClick={() => bumpVol(-0.1)} aria-label="Volume down">
              <span className="po-sign">−</span>
              <span>vol</span>
            </button>
            <button type="button" className="po-btn" onClick={() => bumpVol(0.1)} aria-label="Volume up">
              <span className="po-sign">+</span>
              <span>vol</span>
            </button>
          </div>

          <div className="po-grille" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <i key={i} />
            ))}
          </div>
        </div>

        {/* Right: the 4x4 key bank, also the track list */}
        <div className="po-keys" role="group" aria-label="Loops">
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
            const slotNum = i + 1;
            const beat = beats.find((b) => b.slot === slotNum);
            const on = !!beat && selected.id === beat.id;
            return (
              <button
                key={slotNum}
                type="button"
                className="po-key"
                data-on={on}
                data-empty={!beat}
                disabled={!beat}
                onClick={() => beat && loadBeat(beat, true)}
                aria-label={beat ? `Play ${beat.title}` : `Empty slot ${slotNum}`}
                aria-pressed={beat ? on : undefined}
              >
                <span className="po-key-n" style={{ color: beat ? ORANGE : "rgba(35,35,35,0.35)" }}>
                  {slotNum}
                </span>
                {beat && <i className="po-key-led" data-lit={on && isPlaying} data-sel={on} />}
              </button>
            );
          })}
        </div>
      </motion.div>

      <p className="po-foot">
        {beats.length} loop{beats.length === 1 ? "" : "s"} recorded so far · slot {selected.slot.toString().padStart(2, "0")} made{" "}
        {new Date(selected.madeOn).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · more loading soon
      </p>

      <style>{`
        .po-root { position:relative; min-height:100svh; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; padding:64px 16px 36px; overflow-x:hidden;
          background: radial-gradient(ellipse 90% 70% at 50% 35%, #2b2b2c 0%, #171718 60%, #0d0d0e 100%); font-family:${SANS}; }
        .po-eject { position:fixed; top:18px; left:18px; z-index:10; display:inline-flex; align-items:center; gap:6px; font:600 11px ${SANS}; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.6); text-decoration:none; transition:color .15s ease; }
        .po-eject:hover { color:#fff; }

        .po-body { position:relative; width:min(920px, 100%); display:grid; grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); gap:clamp(16px,3vw,34px); padding:clamp(16px,2.4vw,28px);
          border-radius:20px; background: linear-gradient(165deg, #e4e5e6 0%, #d3d5d7 45%, #c4c6c9 100%);
          box-shadow: 0 40px 80px rgba(0,0,0,0.65), 0 2px 0 rgba(255,255,255,0.7) inset, 0 -3px 0 rgba(0,0,0,0.18) inset, 0 0 0 1px rgba(0,0,0,0.35); color:${INK}; }
        .po-body::before { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0.35; mix-blend-mode:multiply;
          background-image: radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1.2px); background-size: 5px 5px; }

        .po-left { position:relative; display:flex; flex-direction:column; gap:14px; min-width:0; }
        .po-brand { display:flex; align-items:baseline; justify-content:space-between; gap:10px; flex-wrap:wrap; }
        .po-brand-name { font:800 17px ${SANS}; letter-spacing:-0.01em; color:${INK}; }
        .po-brand-tag { font:600 9px ${SANS}; letter-spacing:0.12em; text-transform:uppercase; color:${ORANGE}; }

        .po-lcd { position:relative; padding:12px 14px 10px; border-radius:6px; background:${LCD_BG}; color:${LCD_INK}; font-family:${PIXEL};
          box-shadow: inset 0 3px 7px rgba(0,0,0,0.35), inset 0 0 0 2px #2a2a2a, 0 1px 0 rgba(255,255,255,0.6); }
        .po-lcd::after { content:""; position:absolute; inset:0; border-radius:6px; pointer-events:none; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 3px), linear-gradient(135deg, rgba(255,255,255,0.22), transparent 40%); }
        .po-lcd-top { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .po-lcd-slot { font-size:clamp(26px,4vw,38px); line-height:1; letter-spacing:0.04em; }
        .po-lcd-icons { display:flex; gap:10px; font-size:8px; letter-spacing:0.06em; }
        .po-lcd-title { margin-top:8px; font-size:9px; letter-spacing:0.08em; line-height:1.5; min-height:14px; overflow-wrap:anywhere; }
        .po-lcd-wave { display:flex; align-items:flex-end; gap:1px; height:40px; margin-top:8px; }
        .po-lcd-wave i { flex:1; display:block; min-width:1px; transition: background .12s linear; }
        .po-lcd-steps { display:flex; gap:3px; margin-top:6px; }
        .po-lcd-steps i { flex:1; height:5px; display:block; transition: background .08s linear; }
        .po-lcd-time { margin-top:8px; font-size:8px; letter-spacing:0.08em; text-align:right; }

        .po-fn { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:8px; }
        .po-btn { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; min-height:48px; padding:7px 4px 6px; cursor:pointer; color:${INK};
          font:700 9px ${SANS}; letter-spacing:0.08em; text-transform:lowercase; border-radius:7px; border:0;
          background: linear-gradient(180deg, #f1f2f3 0%, #dcdee0 100%); box-shadow: 0 3px 0 #9ea1a5, 0 4px 6px rgba(0,0,0,0.3), inset 0 1px 0 #fff; transition: transform .06s ease, box-shadow .06s ease; -webkit-tap-highlight-color: transparent; }
        .po-btn:hover { background: linear-gradient(180deg, #fff 0%, #e4e6e8 100%); }
        .po-btn:active { transform: translateY(3px); box-shadow: 0 0 0 #9ea1a5, 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 #fff; }
        .po-btn:focus-visible, .po-key:focus-visible { outline:2px solid ${ORANGE}; outline-offset:3px; }
        .po-btn span { color:rgba(35,35,35,0.75); }
        .po-btn-wide { grid-column: span 1; }
        .po-btn-wide svg { color:${ORANGE}; }
        .po-sign { font:800 15px ${SANS}; line-height:1; color:${ORANGE} !important; }
        .po-led { display:block; width:7px; height:7px; border-radius:50%; background:#8b8e92; box-shadow: inset 0 1px 1px rgba(0,0,0,0.4); transition: background .15s ease, box-shadow .15s ease; }
        .po-led[data-on="true"] { background:${ORANGE}; box-shadow: 0 0 8px ${ORANGE}, inset 0 0 0 1px rgba(255,255,255,0.4); }

        .po-grille { display:grid; grid-template-columns: repeat(12, 1fr); gap:5px; width:min(220px,70%); margin-top:2px; opacity:0.55; }
        .po-grille i { display:block; aspect-ratio:1; border-radius:50%; background:#6f7276; box-shadow: inset 0 1px 1px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.6); }

        .po-keys { position:relative; display:grid; grid-template-columns: repeat(4, 1fr); gap:clamp(8px,1.4vw,14px); align-content:center; }
        .po-key { position:relative; aspect-ratio:1; display:flex; align-items:flex-start; justify-content:flex-start; padding:9px 0 0 11px; cursor:pointer; border:0; border-radius:10px;
          background: linear-gradient(180deg, #f6f7f8 0%, #dfe1e3 100%); box-shadow: 0 5px 0 #8f9296, 0 8px 10px rgba(0,0,0,0.3), inset 0 1px 0 #fff; transition: transform .07s ease, box-shadow .07s ease; -webkit-tap-highlight-color: transparent; }
        .po-key:hover:not(:disabled) { background: linear-gradient(180deg, #fff 0%, #e8eaec 100%); }
        .po-key:active:not(:disabled), .po-key[data-on="true"] { transform: translateY(4px); box-shadow: 0 1px 0 #8f9296, 0 2px 3px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.12); }
        .po-key[data-empty="true"] { cursor:default; background: linear-gradient(180deg, #d5d7d9, #c9cbce); box-shadow: 0 3px 0 #a6a9ad, inset 0 1px 0 rgba(255,255,255,0.5); }
        .po-key-n { font:800 clamp(14px,1.8vw,20px) ${SANS}; line-height:1; }
        .po-key-led { position:absolute; right:10px; bottom:10px; width:8px; height:8px; border-radius:50%; background:#a9acb0; box-shadow: inset 0 1px 1px rgba(0,0,0,0.35); transition: background .15s ease, box-shadow .15s ease; }
        .po-key-led[data-sel="true"] { background:#d9a08c; }
        .po-key-led[data-lit="true"] { background:${ORANGE}; box-shadow: 0 0 10px ${ORANGE}; animation: po-blink 0.9s steps(2, jump-none) infinite; }
        @keyframes po-blink { 0%,49% { opacity:1; } 50%,100% { opacity:0.45; } }

        .po-foot { font:500 10px ${SANS}; letter-spacing:0.04em; color:rgba(255,255,255,0.45); text-align:center; max-width:560px; }

        @media (max-width: 760px) {
          .po-body { grid-template-columns: 1fr; }
          .po-keys { max-width:420px; width:100%; margin:0 auto; }
        }
        @media (prefers-reduced-motion: reduce) { .po-key-led[data-lit="true"] { animation:none; } }
      `}</style>
    </div>
  );
}
