"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Kind = "cmd" | "out" | "muted" | "err";

interface Line {
  id: number;
  kind: Kind;
  text: string;
}

let _uid = 0;
const L = (kind: Kind, text: string): Line => ({ id: _uid++, kind, text });
const BLANK = (): Line => L("muted", "");

const PROMPT = "florian@braunf:~$";

const COLORS: Record<Kind, string> = {
  cmd:   "#ffffff",
  out:   "rgba(255,255,255,0.85)",
  muted: "rgba(255,255,255,0.32)",
  err:   "#f87171",
};

const GREEN = "#4ade80";

// ─── Welcome ───────────────────────────────────────────────────────────────────
const WELCOME: Line[] = [
  BLANK(),
  L("out",   "florian@braunf.com — terminal"),
  L("muted", "──────────────────────────────"),
  L("muted", "Type 'help' for available commands."),
  BLANK(),
];

// ─── Command runner ────────────────────────────────────────────────────────────
function run(
  raw: string,
  router: ReturnType<typeof useRouter>,
  onClear: () => void
): Line[] {
  const parts = raw.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(" ").toLowerCase();

  switch (cmd) {

    case "help":
      return [
        BLANK(),
        L("out",   "available commands"),
        L("muted", "──────────────────"),
        L("out",   "  help             list available commands"),
        L("out",   "  whoami           brief introduction"),
        L("out",   "  ls               list files"),
        L("out",   "  ls projects/     list all projects"),
        L("out",   "  cat <file>       read a file  (about, skills, contact)"),
        L("out",   "  open <name>      open a project in a new tab"),
        L("out",   "  cd <path>        navigate  (/, /portfolio, /pokedex, /now, /research, /music)"),
        L("out",   "  neofetch         system information"),
        L("out",   "  clear            clear the terminal"),
        L("out",   "  exit             return to home"),
        BLANK(),
      ];

    case "whoami":
      return [
        BLANK(),
        L("out",   "Florian Braun"),
        L("muted", "Co-Founder @ CalmCampus"),
        L("muted", "BASc Applied CS · UCLL · Leuven, Belgium"),
        L("muted", "Researching LLMs, NLP, and cross-lingual alignment"),
        BLANK(),
      ];

    case "ls":
      if (arg === "projects/" || arg === "projects") {
        return [
          BLANK(),
          L("out",   "lumen-studio/   calm-campus/   velox/     tokn/"),
          L("out",   "feather/        nihongo/       go/        research/"),
          BLANK(),
        ];
      }
      return [
        BLANK(),
        L("out",   "projects/   about.txt   skills.txt   contact.txt"),
        BLANK(),
      ];

    case "cat": {
      const files: Record<string, Line[]> = {
        "about.txt": [
          BLANK(),
          L("out",   "Name      Florian Braun"),
          L("out",   "Role      Co-Founder · Engineer · Researcher"),
          L("out",   "Location  Leuven, Belgium"),
          L("out",   "Focus     AI · Entrepreneurship · NLP"),
          BLANK(),
          L("muted", "Building at the intersection of technology and product."),
          L("muted", "A startup, three research papers, and a lot of side projects."),
          BLANK(),
        ],
        "skills.txt": [
          BLANK(),
          L("out",   "Languages   Python · TypeScript · Rust · Dart · Kotlin"),
          L("out",   "AI / ML     PyTorch · LangChain · HuggingFace · Claude API"),
          L("out",   "Web         React · Next.js · FastAPI"),
          L("out",   "Mobile      Flutter · React Native · Jetpack Compose"),
          L("out",   "Infra       Docker · PostgreSQL · Git · GitHub Actions"),
          BLANK(),
        ],
        "contact.txt": [
          BLANK(),
          L("out",   "Email     contact@braunf.com"),
          L("out",   "Site      braunf.com"),
          L("out",   "Projects  projects.braunf.com"),
          L("out",   "Research  research.braunf.com"),
          BLANK(),
        ],
      };
      const key = arg.endsWith(".txt") ? arg : arg + ".txt";
      const content = files[key] ?? null;
      if (!content) return [L("err", `cat: ${arg}: No such file or directory`), BLANK()];
      return content;
    }

    case "open": {
      const projects: Record<string, string> = {
        "lumen":        "https://projects.braunf.com",
        "lumen-studio": "https://projects.braunf.com",
        "lumenstudio":  "https://projects.braunf.com",
        "projects":     "https://projects.braunf.com",
        "research":     "https://research.braunf.com",
        "mabushi":      "https://research.braunf.com",
        "calm":         "https://cc.braunf.com",
        "calmcampus":   "https://cc.braunf.com",
        "calm-campus":  "https://cc.braunf.com",
        "nihongo":      "https://nihongo.braunf.com",
        "go":           "https://go.braunf.com",
        "velox":        "https://velox.braunf.com",
        "tokn":         "https://tokn.braunf.com",
        "feather":      "https://feather.braunf.com",
        "silkworm":     "https://silk.braunf.com",
        "silk":         "https://silk.braunf.com",
      };
      const url = projects[arg];
      if (!url) {
        return [L("err", `open: unknown project '${arg}'`), L("muted", "try: projects, research, calmcampus, nihongo, go"), BLANK()];
      }
      setTimeout(() => window.open(url, "_blank"), 250);
      return [L("muted", `→ opening ${url}`), BLANK()];
    }

    case "cd": {
      const routes: Record<string, string> = {
        "/":          "/",
        "~":          "/",
        "home":       "/",
        "/portfolio": "/portfolio",
        "portfolio":  "/portfolio",
        "/pokedex":   "/pokedex",
        "pokedex":    "/pokedex",
        "/terminal":  "/terminal",
        "terminal":   "/terminal",
        "/now":       "/now",
        "now":        "/now",
        "/research":  "/research",
        "research":   "/research",
        "/music":     "/music",
        "music":      "/music",
      };
      const route = routes[arg];
      if (!route) return [L("err", `cd: ${arg}: no such directory`), BLANK()];
      if (route === "/terminal") return [L("muted", "you're already here."), BLANK()];
      setTimeout(() => router.push(route), 300);
      return [L("muted", `→ navigating to ${arg === "/" || arg === "~" ? "home" : arg}`), BLANK()];
    }

    case "neofetch":
      return [
        BLANK(),
        L("out",   "    ◆          florian@braunf.com"),
        L("out",   "   ◆◆◆         ─────────────────────────"),
        L("out",   "  ◆◆◆◆◆        OS: Human 24.0 LTS"),
        L("out",   "   ◆◆◆         Host: Leuven, Belgium"),
        L("out",   "    ◆          Kernel: entrepreneur-6.2"),
        L("muted", "               "),
        L("out",   "               Uptime: ~24 years"),
        L("out",   "               Shell: curiosity"),
        L("out",   "               CPU: Brain (overclocked)"),
        L("out",   "               Memory: caffeine-dependent"),
        L("out",   "               Languages: NL EN FR DE JA ES"),
        BLANK(),
      ];

    case "clear":
      onClear();
      return [];

    case "exit":
      setTimeout(() => router.push("/"), 200);
      return [L("muted", "Goodbye."), BLANK()];

    // ── Easter eggs ──────────────────────────────────────────────────────────
    case "sudo":
      return [L("err", "sudo: permission denied. nice try."), BLANK()];

    case "git":
      if (arg === "blame") return [L("muted", "every line is florian's fault."), BLANK()];
      if (arg === "push") return [L("muted", "pushing to main... just kidding."), BLANK()];
      return [L("err", `git: '${arg}' is not a terminal command`), BLANK()];

    case "make":
      if (arg === "coffee") return [L("err", "make: *** coffee: No such file or directory"), BLANK()];
      return [L("err", "make: *** No targets specified. Stop."), BLANK()];

    case "vim":
    case "nano":
    case "emacs":
      return [
        L("muted", `${cmd}: not supported.`),
        L("muted", "and yes, :q! doesn't work here either."),
        BLANK(),
      ];

    case "ssh":
      if (arg.includes("velox")) {
        return [
          L("muted", "connecting to velox..."),
          L("muted", "WARNING: live trading session active."),
          L("err",   "connection closed for your own protection."),
          BLANK(),
        ];
      }
      return [L("err", `ssh: ${arg}: connection refused`), BLANK()];

    case "rm":
      if (arg.includes("-rf") || arg.includes("--no-preserve-root")) {
        return [L("muted", "rm: the filesystem is fine. don't worry."), BLANK()];
      }
      return [L("err", `rm: cannot remove '${arg}': Permission denied`), BLANK()];

    case "pwd":
      return [L("out", "/home/florian/terminal"), BLANK()];

    case "echo":
      return [L("out", parts.slice(1).join(" ")), BLANK()];

    case "":
      return [];

    default:
      return [
        L("err",   `command not found: ${cmd}`),
        L("muted", "type 'help' to see available commands."),
        BLANK(),
      ];
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function TerminalPage() {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [savedInput, setSavedInput] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const submit = useCallback(() => {
    const raw = input.trim();
    const cmdLine = L("cmd", raw);

    if (!raw) {
      setLines((prev) => [...prev, cmdLine]);
      setInput("");
      return;
    }

    setCmdHistory((prev) => [raw, ...prev]);
    setHistIdx(-1);
    setSavedInput("");
    setInput("");

    let cleared = false;
    const output = run(raw, router, () => { cleared = true; });

    if (cleared) {
      setLines([]);
    } else {
      setLines((prev) => [...prev, cmdLine, ...output]);
    }
  }, [input, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        submit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (cmdHistory.length === 0) return;
        if (histIdx === -1) setSavedInput(input);
        const next = Math.min(histIdx + 1, cmdHistory.length - 1);
        setHistIdx(next);
        setInput(cmdHistory[next]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx === -1) return;
        const next = histIdx - 1;
        setHistIdx(next);
        setInput(next === -1 ? savedInput : cmdHistory[next]);
      }
    },
    [submit, cmdHistory, histIdx, input, savedInput]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "#060608",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
        fontSize: "clamp(11px, 1.8vw, 13px)",
        lineHeight: "1.7",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scrollable output */}
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "clamp(20px, 4vw, 36px)",
          paddingBottom: "12px",
          cursor: "text",
        }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            style={{
              color: COLORS[line.kind],
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {line.kind === "cmd" && (
              <span style={{ color: GREEN, userSelect: "none", marginRight: "8px" }}>
                {PROMPT}
              </span>
            )}
            {line.text}
          </div>
        ))}
      </div>

      {/* Input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "0 clamp(20px, 4vw, 36px) clamp(20px, 4vw, 36px)",
          flexShrink: 0,
        }}
      >
        <span style={{ color: GREEN, flexShrink: 0, userSelect: "none" }}>
          {PROMPT}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#ffffff",
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
            caretColor: GREEN,
            padding: 0,
            minWidth: 0,
          }}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
    </motion.div>
  );
}
