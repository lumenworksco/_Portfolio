"use client";

import Link from "next/link";
import Ball from "@/components/agent/Ball";

// Just the ball. The earlier chat interface (constellation, assistant, morphing orb)
// lives in git history at commit a06be39 and in src/lib/agentEngine.ts + src/data/agentKnowledge.ts.
export default function AgentPage() {
  return (
    <main className="fixed inset-0 flex items-center justify-center" style={{ background: "#ffffff" }}>
      <h1 className="sr-only">An iridescent ball that drifts and follows your cursor</h1>

      {/* Invisible until focused, so keyboard users still have a way back. */}
      <Link
        href="/"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:px-4 focus:py-2 focus:text-sm"
        style={{ color: "#4a5a8a", background: "rgba(148,163,238,0.18)" }}
      >
        ← Home
      </Link>

      <Ball className="h-[min(92vmin,820px)] w-[min(92vmin,820px)]" />
    </main>
  );
}
