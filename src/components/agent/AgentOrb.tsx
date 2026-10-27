"use client";

import { useState } from "react";
import Orb, { type OrbState } from "./Orb";
import OrbGL from "./OrbGL";

interface Props {
  state: OrbState;
  pulse: number;
  typing?: number;
  shape?: number;
  className?: string;
}

/** Plasma-sphere shader orb, with the 2D canvas orb as a fallback when WebGL2 is unavailable. */
export default function AgentOrb(props: Props) {
  const [failed, setFailed] = useState(false);
  return failed ? <Orb {...props} /> : <OrbGL {...props} onFail={() => setFailed(true)} />;
}
