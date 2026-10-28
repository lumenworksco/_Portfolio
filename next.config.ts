import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// The Pokédex shows when it was last updated. Rather than a date someone has to remember to
// bump, take it from the last commit that touched the achievements data. CI checks out the
// full history for this (see .github/workflows/deploy.yml); if git is unavailable the page
// falls back to POKEDEX_UPDATED_FALLBACK in src/data/achievements.ts.
function lastDataUpdate(): string {
  try {
    const out = execSync("git log -1 --format=%cs -- src/data/achievements.ts", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : "";
  } catch {
    return "";
  }
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_POKEDEX_UPDATED: lastDataUpdate(),
  },
};

export default nextConfig;
