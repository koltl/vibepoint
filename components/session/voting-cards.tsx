"use client";

import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/store/session-store";
import { getSocket } from "@/lib/socket";
import { FIBONACCI_DECK } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function VotingCards() {
  const state = useSessionStore((s) => s.state);
  const myVote = useSessionStore((s) => s.myVote);
  const socketId = useSessionStore((s) => s.socketId);
  const deck = state?.deck === "fibonacci" ? FIBONACCI_DECK : FIBONACCI_DECK;

  const castVote = useCallback(
    (value: string) => {
      if (!state || !socketId) return;
      getSocket()?.emit("cast_vote", { sessionId: state.id, value });
    },
    [state, socketId]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      if (!state) return;
      if (e.key === "?" && deck[11]) {
        castVote(deck[11]);
        e.preventDefault();
        return;
      }
      if ((e.key === "c" || e.key === "C") && deck[12]) {
        castVote(deck[12]);
        e.preventDefault();
        return;
      }
      const idx = parseInt(e.key, 10);
      if (idx >= 0 && idx <= 9 && deck[idx] !== undefined) {
        castVote(deck[idx]);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state, deck, castVote]);

  if (!state) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider md:block">
        Your vote
      </h2>
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 md:flex md:flex-wrap md:justify-center md:gap-1.5">
        {deck.map((value, i) => (
          <VoteCard
            key={value}
            value={value}
            selected={myVote() === value}
            onSelect={() => castVote(value)}
            index={i}
          />
        ))}
      </div>
      <p className="text-center text-xs text-white/40 mt-2 hidden md:block">0–9, ?, C</p>
    </section>
  );
}

function VoteCard({
  value,
  selected,
  onSelect,
}: {
  value: string;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const isCoffee = value === "☕";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={false}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "relative rounded-xl overflow-hidden touch-manipulation",
        "flex items-center justify-center",
        "border transition-all duration-300",
        "text-white/90 drop-shadow-sm",
        "w-full min-h-[72px] sm:min-h-[80px]",
        "text-2xl sm:text-3xl font-bold tabular-nums",
        "md:w-12 md:h-16 md:min-h-0 md:text-xl md:rounded-lg md:flex-initial",
        selected
          ? "border-indigo-400/80 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/50 bg-indigo-500/20"
          : "border-white/12 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/25 hover:from-white/[0.12] hover:to-white/[0.04] active:from-white/[0.15]"
      )}
    >
      {isCoffee ? "☕" : value}
    </motion.button>
  );
}
