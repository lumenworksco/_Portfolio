"use client";

import { useSyncExternalStore } from "react";

// Whether the background music is on, remembered for the browser tab so it carries from
// the home screen into the Pokédex. Never turns itself on for a first-time visitor.
const KEY = "braunf-music";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setMusicPref(on: boolean) {
  try {
    window.sessionStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* storage unavailable: the preference just won't persist */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useMusicPref(): readonly [boolean, () => void] {
  const on = useSyncExternalStore(subscribe, read, () => false);
  return [on, () => setMusicPref(!read())] as const;
}
