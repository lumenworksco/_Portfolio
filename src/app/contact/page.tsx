"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import Aurora from "@/components/ui/Aurora";
import GradientText from "@/components/ui/GradientText";
import FadeContent from "@/components/ui/FadeContent";

const EMAIL = "contact@braunf.com";

const LINKS = [
  { label: "Personal Projects", href: "https://lumen.braunf.com", sub: "lumen.braunf.com" },
  { label: "CalmCampus", href: "https://cc.braunf.com", sub: "cc.braunf.com" },
];

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (insecure context, denied permission).
      // The address is shown right beside the button, so there is nothing to recover.
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: "#060608" }}
    >
      {/* Aurora */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#0369a1", "#6d28d9", "#0e7490"]}
          speed={0.45}
          amplitude={0.85}
        />
      </div>

      {/* Vignette */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(6,6,8,0.72) 100%)",
        }}
      />

      {/* Back */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-20 flex items-center gap-2 text-xs font-mono tracking-widest uppercase"
        style={{
          color: "rgba(255,255,255,0.35)",
          transition: "color 0.15s ease",
          textDecoration: "none",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color =
            "rgba(255,255,255,0.7)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color =
            "rgba(255,255,255,0.35)")
        }
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg">

          {/* Header */}
          <FadeContent blur duration={600} initialOpacity={0} className="mb-12 text-center">
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
              Contact
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <GradientText
                colors={["#7dd3fc", "#6d28d9", "#38bdf8", "#6d28d9", "#7dd3fc"]}
                animationSpeed={5}
              >
                Get in touch
              </GradientText>
            </h1>
          </FadeContent>

          {/* Email card */}
          <FadeContent blur duration={600} delay={200} initialOpacity={0} className="mb-6">
            <div
              style={{
                background: "rgba(10,10,14,0.88)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "28px 24px",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-pixel), monospace",
                  color: "rgba(255,255,255,0.22)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                Email
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <a
                  href={`mailto:${EMAIL}`}
                  style={{
                    fontSize: "clamp(14px, 3vw, 18px)",
                    color: "rgba(255,255,255,0.88)",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    textDecoration: "none",
                    transition: "color 0.15s ease",
                    wordBreak: "break-all",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.88)")
                  }
                >
                  {EMAIL}
                </a>

                <motion.button
                  onClick={copy}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    flexShrink: 0,
                    padding: "8px",
                    borderRadius: "7px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    cursor: "pointer",
                    color: copied ? "#4ade80" : "rgba(255,255,255,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s ease, background 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!copied) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(255,255,255,0.09)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(255,255,255,0.18)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(255,255,255,0.1)";
                  }}
                  title="Copy email"
                  aria-label={copied ? "Email address copied" : "Copy email address"}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check size={14} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Copy size={14} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Copied confirmation */}
              <AnimatePresence>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      fontSize: "10px",
                      fontFamily: "var(--font-pixel), monospace",
                      color: "#4ade80",
                      letterSpacing: "0.08em",
                      marginTop: "10px",
                    }}
                  >
                    ✓ Copied to clipboard
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </FadeContent>

          {/* Tagline */}
          <FadeContent blur duration={600} delay={350} initialOpacity={0} className="mb-8 px-1">
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.38)",
                lineHeight: "1.7",
                textAlign: "center",
              }}
            >
              Open to research collaborations, engineering opportunities,
              and interesting conversations.
            </p>
          </FadeContent>

          {/* Project links */}
          <FadeContent blur duration={600} delay={500} initialOpacity={0}>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "8px 14px",
                    borderRadius: "7px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    textDecoration: "none",
                    transition: "background 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "rgba(255,255,255,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "rgba(255,255,255,0.07)";
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 500,
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {link.label}
                    </p>
                    <p
                      style={{
                        fontSize: "9px",
                        color: "rgba(255,255,255,0.28)",
                        fontFamily: "var(--font-pixel), monospace",
                        letterSpacing: "0.04em",
                        margin: 0,
                      }}
                    >
                      {link.sub}
                    </p>
                  </div>
                  <ExternalLink size={11} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </FadeContent>

        </div>
      </main>
    </div>
  );
}
