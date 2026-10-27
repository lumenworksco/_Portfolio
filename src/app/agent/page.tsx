"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUp, ArrowUpRight } from "lucide-react";
import Orb, { type OrbState } from "@/components/agent/Orb";
import { respond, type AgentReply } from "@/lib/agentEngine";
import { STARTER_PROMPTS, type AgentLink } from "@/data/agentKnowledge";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const INTRO =
  "Hi, I'm the assistant on Florian's site. Ask me about his studies, projects or research, or tell me where you want to go.";
const NAV_DELAY_MS = 1700;
const THINK_MS = 650;
const WORD_MS = 34;

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "7px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(125,211,252,0.28)",
  background: "rgba(125,211,252,0.07)",
  color: "rgba(224,242,254,0.9)",
  fontSize: "12.5px",
  textDecoration: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "background 0.2s ease, border-color 0.2s ease",
};

// Knowledge nodes that float around the orb. Clicking one asks the matching question.
const NODES: { id: string; label: string; q: string }[] = [
  { id: "education", label: "education", q: "What does he study?" },
  { id: "experience", label: "experience", q: "What is his experience?" },
  { id: "research", label: "research", q: "Tell me about his research" },
  { id: "projects", label: "projects", q: "What is he building?" },
  { id: "calmcampus", label: "calmcampus", q: "Tell me about CalmCampus" },
  { id: "skills", label: "skills", q: "What are his skills?" },
  { id: "iot", label: "iot lab", q: "Tell me about the IoT lab" },
  { id: "japanese", label: "japanese", q: "Why Japanese?" },
  { id: "hobbies", label: "off duty", q: "What are his hobbies?" },
  { id: "contact", label: "contact", q: "How can I contact him?" },
];

const nodePos = (i: number) => {
  const a = (-90 + (360 / NODES.length) * i) * (Math.PI / 180);
  return { x: 50 + 47 * Math.cos(a), y: 50 + 43 * Math.sin(a) };
};

function Constellation({
  activeId,
  busy,
  onPick,
}: {
  activeId: string | null;
  busy: boolean;
  onPick: (q: string) => void;
}) {
  const active = NODES.findIndex((n) => n.id === activeId);
  const target = active >= 0 ? nodePos(active) : null;
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {NODES.map((n, i) => {
          const p = nodePos(i);
          return (
            <line key={n.id} x1="50" y1="50" x2={p.x} y2={p.y} stroke="rgba(125,211,252,0.07)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          );
        })}
        {target && (
          <line
            x1="50"
            y1="50"
            x2={target.x}
            y2={target.y}
            stroke="url(#beam)"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            vectorEffect="non-scaling-stroke"
            className="agent-beam"
          />
        )}
      </svg>
      {NODES.map((n, i) => {
        const p = nodePos(i);
        const isActive = n.id === activeId;
        return (
          <button
            key={n.id}
            type="button"
            disabled={busy}
            onClick={() => onPick(n.q)}
            aria-label={`Ask about ${n.label}`}
            data-active={isActive}
            className="agent-node pointer-events-auto absolute"
            style={{ left: `${p.x}%`, top: `${p.y}%`, ["--d" as string]: `${(i * 0.7) % 5}s` }}
          >
            <span className="agent-node-dot" />
            {n.label}
          </button>
        );
      })}
    </div>
  );
}

function LinkPill({ link }: { link: AgentLink }) {
  const content = (
    <>
      {link.label}
      <ArrowUpRight size={13} aria-hidden="true" />
    </>
  );
  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" style={pillStyle} className="agent-pill">
      {content}
    </a>
  ) : (
    <Link href={link.href} style={pillStyle} className="agent-pill">
      {content}
    </Link>
  );
}

export default function AgentPage() {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();

  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [typing, setTyping] = useState(0);
  const [phase, setPhase] = useState<"idle" | "thinking" | "speaking">("idle");
  const [pulse, setPulse] = useState(0);

  const [asked, setAsked] = useState<string | null>(null);
  const [reply, setReply] = useState<AgentReply | null>(null);
  const [shown, setShown] = useState(INTRO);
  const [done, setDone] = useState(true);
  const [pending, setPending] = useState<AgentLink | null>(null);
  const [trace, setTrace] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<{ think?: number; stream?: number; nav?: number; type?: number; trace?: number[] }>({});

  const clearTimers = useCallback(() => {
    const t = timers.current;
    window.clearTimeout(t.think);
    window.clearInterval(t.stream);
    window.clearTimeout(t.nav);
    t.trace?.forEach((id) => window.clearTimeout(id));
    t.think = t.stream = t.nav = undefined;
    t.trace = undefined;
  }, []);

  useEffect(() => {
    const t = timers.current;
    return () => {
      clearTimers();
      window.clearTimeout(t.type);
    };
  }, [clearTimers]);

  // Focus the box on desktop only, so phones do not open the keyboard unprompted.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  const go = useCallback(
    (link: AgentLink) => {
      if (link.external) window.location.assign(link.href);
      else router.push(link.href);
    },
    [router]
  );

  const cancelNav = useCallback(() => {
    window.clearTimeout(timers.current.nav);
    setPending(null);
  }, []);

  const ask = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q || phase !== "idle") return;

      clearTimers();
      setPending(null);
      setInput("");
      setAsked(q);
      setReply(null);
      setShown("");
      setDone(false);
      setPhase("thinking");
      const steps = ["reading notes", "matching topics", "composing answer"];
      setTrace(steps[0]);
      timers.current.trace = reduced
        ? []
        : [1, 2].map((n) => window.setTimeout(() => setTrace(steps[n]), (THINK_MS / 3) * n));

      timers.current.think = window.setTimeout(
        () => {
          const r = respond(q);
          setReply(r);
          const words = r.text.split(" ");

          const finish = () => {
            setShown(r.text);
            setDone(true);
            setPhase("idle");
            if (r.navigate) {
              const target = r.navigate;
              setPending(target);
              timers.current.nav = window.setTimeout(() => go(target), NAV_DELAY_MS);
            }
          };

          if (reduced) {
            finish();
            return;
          }

          setPhase("speaking");
          let i = 0;
          timers.current.stream = window.setInterval(() => {
            i += 1;
            setShown(words.slice(0, i).join(" "));
            setPulse((n) => n + 1);
            if (i >= words.length) {
              window.clearInterval(timers.current.stream);
              finish();
            }
          }, WORD_MS);
        },
        reduced ? 0 : THINK_MS
      );
    },
    [phase, reduced, clearTimers, go]
  );

  const onChange = (v: string) => {
    setInput(v);
    setTyping(1);
    window.clearTimeout(timers.current.type);
    timers.current.type = window.setTimeout(() => setTyping(0), 500);
  };

  // Escape cancels a pending navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelNav();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelNav]);

  const orbState: OrbState = phase !== "idle" ? phase : focused ? "listening" : "idle";
  const suggestions = !asked ? STARTER_PROMPTS : done ? reply?.followUps ?? [] : [];

  return (
    <div
      className="relative flex w-full flex-col overflow-hidden"
      style={{ height: "100dvh", background: "#05060b", color: "#fff" }}
    >
      {/* Backdrop: soft vignette + faint dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 30%, rgba(56,189,248,0.10), transparent 70%), radial-gradient(ellipse 90% 70% at 50% 110%, rgba(129,140,248,0.10), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 20%, transparent 75%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Ask Florian · early version
        </span>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center px-5">
        <h1 className="sr-only">Ask Florian: an assistant that answers questions about Florian Braun</h1>

        <div className="relative shrink-0" style={{ height: "clamp(210px,38vh,420px)", width: "min(94vw, 880px)" }}>
          <Orb
            state={orbState}
            pulse={pulse}
            typing={typing}
            className="absolute left-1/2 top-1/2 h-[clamp(210px,38vh,420px)] w-[clamp(210px,38vh,420px)] -translate-x-1/2 -translate-y-1/2"
          />
          <Constellation
            activeId={phase === "thinking" ? null : reply?.topicId ?? null}
            busy={phase !== "idle"}
            onPick={ask}
          />
        </div>

        {/* Conversation */}
        <div
          className="flex min-h-0 w-full max-w-2xl flex-1 flex-col items-center overflow-y-auto pb-3 text-center"
          style={{ scrollbarWidth: "none" }}
        >
          <AnimatePresence mode="wait">
            {asked && (
              <motion.p
                key={asked}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 text-[12px] font-mono"
                style={{ color: "rgba(125,211,252,0.7)" }}
              >
                › {asked}
              </motion.p>
            )}
          </AnimatePresence>

          <p
            aria-hidden="true"
            className="text-[17px] leading-relaxed md:text-xl"
            style={{ color: "rgba(255,255,255,0.92)", minHeight: "1.6em" }}
          >
            {phase === "thinking" ? <span className="agent-dots">{trace}</span> : shown}
            {phase === "speaking" && <span className="agent-caret" />}
          </p>
          {done && reply && (reply.navigate || (reply.topicId && !/^(greeting|thanks)$/.test(reply.topicId))) && (
            <p className="mt-3 text-[10.5px] font-mono uppercase tracking-[0.18em]" style={{ color: "rgba(167,139,250,0.55)" }}>
              {reply.navigate ? "action · navigate" : `source · notes/${reply.topicId?.replace(/^(nav|dest):/, "")}`}
            </p>
          )}
          {/* Screen readers get the finished answer once, not every streamed word */}
          <p className="sr-only" role="status" aria-live="polite">
            {done ? shown : ""}
          </p>

          <AnimatePresence>
            {done && reply && reply.links.length > 0 && !pending && (
              <motion.div
                key="links"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex flex-wrap justify-center gap-2"
              >
                {reply.links.map((l) => (
                  <LinkPill key={l.href} link={l} />
                ))}
              </motion.div>
            )}

            {pending && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex flex-col items-center gap-3"
              >
                <div
                  className="h-[3px] w-48 overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: NAV_DELAY_MS / 1000, ease: "linear" }}
                    style={{ height: "100%", background: "linear-gradient(90deg,#38bdf8,#a78bfa)" }}
                  />
                </div>
                <button type="button" onClick={cancelNav} style={pillStyle} className="agent-pill">
                  Stay here (Esc)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Suggestions + input */}
      <footer className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-5 pb-5">
        <div className="flex min-h-[34px] flex-wrap justify-center gap-2">
          <AnimatePresence mode="popLayout">
            {suggestions.map((s) => (
              <motion.button
                key={s}
                type="button"
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => ask(s)}
                style={pillStyle}
                className="agent-pill"
              >
                {s}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="agent-input flex w-full items-center gap-2 rounded-full py-1.5 pl-5 pr-1.5"
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask about Florian, or say “take me to research”"
            aria-label="Ask a question about Florian"
            autoComplete="off"
            enterKeyHint="send"
            maxLength={200}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/35"
            style={{ color: "#fff" }}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!input.trim() || phase !== "idle"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)", color: "#05060b", cursor: "pointer" }}
          >
            <ArrowUp size={17} aria-hidden="true" />
          </button>
        </form>

        <p className="text-center text-[10.5px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Answers come from curated notes about Florian, not a live AI model yet.
        </p>
      </footer>

      <style>{`
        .agent-pill:hover { background: rgba(125,211,252,0.16) !important; border-color: rgba(125,211,252,0.5) !important; }
        .agent-input:focus-within { border-color: rgba(125,211,252,0.55) !important; box-shadow: 0 0 0 4px rgba(56,189,248,0.12), 0 0 34px rgba(56,189,248,0.18); }
        .agent-caret { display:inline-block; width:2px; height:1.05em; margin-left:3px; vertical-align:-0.15em; background:#7dd3fc; animation: blink 0.9s step-end infinite; }
        .agent-dots::after { content:""; animation: agent-dots 1.2s steps(4,end) infinite; }
        @keyframes agent-dots { 0% { content:""; } 25% { content:"."; } 50% { content:".."; } 75% { content:"..."; } }
        .agent-node { display:inline-flex; align-items:center; gap:7px; transform:translate(-50%,-50%); padding:5px 11px; border-radius:999px; border:1px solid rgba(125,211,252,0.14); background:rgba(8,12,22,0.55); color:rgba(224,242,254,0.55); font:500 11px ui-monospace,Menlo,monospace; letter-spacing:0.04em; cursor:pointer; backdrop-filter:blur(6px); animation: agent-float 7s ease-in-out var(--d) infinite; transition: color .25s ease, border-color .25s ease, background .25s ease, box-shadow .25s ease; }
        .agent-node-dot { width:5px; height:5px; border-radius:50%; background:rgba(125,211,252,0.6); transition: background .25s ease, box-shadow .25s ease; }
        .agent-node:hover:not(:disabled), .agent-node[data-active="true"] { color:#fff; border-color:rgba(125,211,252,0.65); background:rgba(56,189,248,0.14); box-shadow:0 0 22px rgba(56,189,248,0.35); }
        .agent-node:hover:not(:disabled) .agent-node-dot, .agent-node[data-active="true"] .agent-node-dot { background:#a5f3fc; box-shadow:0 0 10px #67e8f9; }
        .agent-node:disabled { cursor:default; }
        @keyframes agent-float { 0%,100% { transform:translate(-50%,-50%); } 50% { transform:translate(-50%,calc(-50% - 5px)); } }
        .agent-beam { animation: agent-flow 1.2s linear infinite; }
        @keyframes agent-flow { to { stroke-dashoffset: -18; } }
        .agent-dots { color: rgba(255,255,255,0.45); font-family: ui-monospace, Menlo, monospace; font-size: 0.8em; }
        @media (prefers-reduced-motion: reduce) { .agent-caret, .agent-dots::after, .agent-node, .agent-beam { animation: none; } }
      `}</style>
    </div>
  );
}
