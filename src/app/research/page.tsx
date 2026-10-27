"use client";

import { useEffect } from "react";

// Research now lives on its own site, together with the Mabushi Lab engineering work.
// This route stays so existing links and bookmarks keep working.
const TARGET = "https://research.braunf.com";

export default function ResearchMoved() {
  useEffect(() => {
    window.location.replace(TARGET);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        padding: "24px",
        textAlign: "center",
        background: "#060608",
        color: "rgba(255,255,255,0.7)",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff" }}>Research has moved</h1>
      <p style={{ fontSize: "14px", maxWidth: "420px", lineHeight: 1.6 }}>
        The research and the Mabushi Lab engineering work now share one site. Taking you there now.
      </p>
      <a href={TARGET} style={{ fontSize: "14px", color: "#34d399", textDecoration: "underline" }}>
        research.braunf.com
      </a>
    </main>
  );
}
