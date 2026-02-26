"use client";

import { useSessionStore } from "@/store/session-store";
import { averageVote, isNumericVote } from "@/lib/utils";

export function SessionStats() {
  const state = useSessionStore((s) => s.state);

  if (!state) return null;

  const voted = Object.keys(state.votes).length;
  const total = state.users.length;
  const values = Object.values(state.votes);
  const numericValues = values.filter(isNumericVote).map(Number);
  const avg = averageVote(values);
  const min = numericValues.length ? Math.min(...numericValues) : null;
  const max = numericValues.length ? Math.max(...numericValues) : null;

  return (
    <section className="flex items-center justify-center gap-4 sm:gap-6 py-3 px-3 sm:px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 min-h-[48px]">
      <span className="tabular-nums">
        <span className="text-white/80 font-medium">{voted}</span>
        <span className="mx-1">/</span>
        <span>{total}</span>
        <span className="ml-1">voted</span>
      </span>
      {state.revealed && avg !== null && (
        <>
          <span className="text-white/40">·</span>
          <span className="tabular-nums">
            Avg <span className="text-white/80 font-mono font-medium">{avg}</span>
          </span>
          {min !== null && max !== null && min !== max && (
            <>
              <span className="text-white/40">·</span>
              <span className="tabular-nums">
                <span className="font-mono">{min}</span>–<span className="font-mono">{max}</span>
              </span>
            </>
          )}
        </>
      )}
    </section>
  );
}
