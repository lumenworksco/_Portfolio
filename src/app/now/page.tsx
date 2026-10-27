"use client";

import { ArrowLeft, Sparkles, Github, Radio } from "lucide-react";
import Link from "next/link";
import GradientText from "@/components/ui/GradientText";
import FadeContent from "@/components/ui/FadeContent";
import { GitHubActivity } from "@/components/GitHubActivity";
import { HuggingFaceActivity } from "@/components/HuggingFaceActivity";

const AMBER = "#f59e0b";
const TEAL = "#14b8a6";
const PINK = "#ec4899";
const BLUE = "#38bdf8";
const VIOLET = "#a78bfa";

interface Focus {
  label: string;
  desc: string;
  color: string;
}

const FOCUS: Focus[] = [
  { label: "Personal Projects", desc: "Building my own apps and tools end to end.", color: AMBER },
  { label: "Cross-lingual NLP research", desc: "Probing how small LLMs reason across languages.", color: TEAL },
  { label: "CalmCampus", desc: "Shipping features for the student wellness app.", color: PINK },
];

function BentoTile({
  color,
  className = "",
  children,
}: {
  color: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}33`,
        borderRadius: "14px",
        padding: "26px 28px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: color,
          opacity: 0.12,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

function TileLabel({ color, icon, text }: { color: string; icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
      <span style={{ color, display: "flex", alignItems: "center" }}>{icon}</span>
      <p
        style={{
          fontSize: "9px",
          fontFamily: "var(--font-pixel), monospace",
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default function NowPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: "#060608" }}>
      {/* Dot-grid backdrop — deliberately not another Aurora page */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(245,158,11,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 85% 15%, rgba(236,72,153,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 50% 100%, rgba(20,184,166,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Back */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-20 flex items-center gap-2 text-xs font-mono tracking-widest uppercase"
        style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.15s ease" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)")}
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <main className="relative z-10 max-w-4xl mx-auto px-5 pt-24 pb-24">

        {/* Header */}
        <FadeContent blur duration={600} initialOpacity={0} className="mb-10">
          <p
            style={{
              fontSize: "8px",
              fontFamily: "var(--font-pixel), monospace",
              color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            /now
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <GradientText colors={[AMBER, PINK, TEAL, BLUE, AMBER]} animationSpeed={6}>
              What I&apos;m up to
            </GradientText>
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", lineHeight: "1.7" }}>
            Current focus, and what I&apos;ve actually been shipping — pulled live from GitHub and Hugging Face.
          </p>
        </FadeContent>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {FOCUS.map((f, i) => (
            <FadeContent key={f.label} blur duration={600} delay={150 + i * 90} initialOpacity={0}>
              <BentoTile color={f.color}>
                <TileLabel color={f.color} icon={<Sparkles size={13} />} text={`Focus ${i + 1}`} />
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", fontWeight: 600, marginBottom: "6px" }}>
                  {f.label}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </BentoTile>
            </FadeContent>
          ))}
        </div>

        {/* Live stats — stacked full-width so the calendar and repo list have room to breathe */}
        <div className="flex flex-col gap-4 mb-4">
          <FadeContent blur duration={600} delay={480} initialOpacity={0}>
            <BentoTile color={BLUE}>
              <TileLabel color={BLUE} icon={<Github size={13} />} text="Live from GitHub" />
              <GitHubActivity />
            </BentoTile>
          </FadeContent>

          <FadeContent blur duration={600} delay={560} initialOpacity={0}>
            <BentoTile color={VIOLET}>
              <TileLabel color={VIOLET} icon={<span style={{ fontSize: "13px", lineHeight: 1 }}>🤗</span>} text="Live from Hugging Face" />
              <HuggingFaceActivity />
            </BentoTile>
          </FadeContent>
        </div>

        {/* Footnote */}
        <FadeContent blur duration={600} delay={680} initialOpacity={0} className="mt-6">
          <div className="flex items-center gap-2 justify-center">
            <Radio size={11} style={{ color: "rgba(255,255,255,0.2)" }} />
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-pixel), monospace", letterSpacing: "0.08em" }}>
              activity updates automatically — focus updates whenever it changes
            </p>
          </div>
        </FadeContent>

      </main>
    </div>
  );
}
