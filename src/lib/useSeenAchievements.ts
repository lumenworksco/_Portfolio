"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { achievements } from "@/data/achievements";

const STORAGE_KEY = "pokedex-seen-v1";
const VALID_IDS = new Set(achievements.map((a) => a.id));
const EMPTY_SET: Set<string> = new Set();
const listeners = new Set<() => void>();
let cache: Set<string> | null = null;

function readFromStorage(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function getSnapshot(): Set<string> {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): Set<string> {
  return EMPTY_SET;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function markSeenGlobal(id: string) {
  const current = getSnapshot();
  if (current.has(id)) return;
  const next = new Set(current).add(id);
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // localStorage unavailable (private mode, quota) — in-memory state still works
  }
  listeners.forEach((listener) => listener());
}

// Reads/writes the set of achievement ids the visitor has opened, mirroring the
// classic Pokédex "seen" list. SSR-safe via useSyncExternalStore, matching the
// usePrefersReducedMotion pattern used elsewhere in this app.
export function useSeenAchievements() {
  const seenIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const markSeen = useCallback((id: string) => markSeenGlobal(id), []);
  // Entries that were merged away or renamed leave stale ids in storage; do not count them.
  const seenCount = useMemo(() => [...seenIds].filter((id) => VALID_IDS.has(id)).length, [seenIds]);
  return { seenIds, markSeen, seenCount };
}
