"use client";

import { useSessionStore } from "@/store/session-store";
import { averageVote } from "@/lib/utils";

export function RevealEffect() {
  return null;
}

export function RevealAverage() {
  const state = useSessionStore((s) => s.state);
  if (!state?.revealed) return null;
  const values = Object.values(state.votes);
  const avg = averageVote(values);
  if (avg === null) return null;
  return (
    <p className="text-center text-sm text-white/60 mt-2">
      Average: <span className="font-mono font-semibold text-white/80">{avg}</span>
    </p>
  );
}
