"use client";

import { useEffect } from "react";

// "Now" is now a tab of the Pokédex. This route stays so old links keep working.
const TARGET = "/pokedex/#now";

export default function NowMoved() {
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
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff" }}>Now has moved</h1>
      <p style={{ fontSize: "14px", maxWidth: "420px", lineHeight: 1.6 }}>
        What I am up to now lives inside the Pokédex. Taking you there now.
      </p>
      <a href={TARGET} style={{ fontSize: "14px", color: "#34d399", textDecoration: "underline" }}>
        Open the Pokédex
      </a>
    </main>
  );
}
