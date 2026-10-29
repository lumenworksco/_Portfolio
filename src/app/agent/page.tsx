"use client";

import { useEffect } from "react";
import Link from "next/link";

// The orb is the home page now. This route stays so old links keep working.
export default function AgentMoved() {
  useEffect(() => {
    window.location.replace("/");
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#060608",
        color: "rgba(255,255,255,0.7)",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontSize: "14px",
      }}
    >
      <Link href="/" style={{ color: "#34d399", textDecoration: "underline" }}>
        Taking you home
      </Link>
    </main>
  );
}
