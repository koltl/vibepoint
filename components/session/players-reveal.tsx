"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/store/session-store";
import { getInitials, revealSortKey } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PlayersReveal() {
  const state = useSessionStore((s) => s.state);
  const socketId = useSessionStore((s) => s.socketId);

  const sorted = useMemo(() => {
    if (!state) return [];
    return [...state.users].sort((a, b) => {
      const va = state.revealed ? state.votes[a.socketId] : undefined;
      const vb = state.revealed ? state.votes[b.socketId] : undefined;
      const ka = revealSortKey(va);
      const kb = revealSortKey(vb);
      if (ka !== kb) return ka - kb;
      return a.joinedAt - b.joinedAt;
    });
  }, [state?.users, state?.votes, state?.revealed]);

  if (!state) return null;

  return (
    <section className="glass rounded-2xl p-5 md:p-6">
      <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">
        {state.revealed ? "Results" : "Players"} ({state.users.length})
      </h2>
      <ul className="flex flex-wrap gap-3 justify-center md:justify-start">
        {sorted.map((user, i) => {
          const voted = user.socketId in state.votes;
          const value = state.revealed ? state.votes[user.socketId] : undefined;
          const isMe = user.socketId === socketId;

          return (
            <motion.li
              key={user.id}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
                delay: state.revealed ? i * 0.06 : 0,
              }}
              className="list-none"
            >
              <motion.div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 min-w-[140px]",
                  "border transition-colors",
                  state.revealed
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 border-white/10",
                  isMe && "ring-1 ring-indigo-400/40"
                )}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 shadow-lg"
                  style={{
                    backgroundColor: `${user.color}35`,
                    color: user.color,
                    boxShadow: `0 0 0 2px ${user.color}40`,
                  }}
                >
                  {getInitials(user.username)}
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">
                    {user.username}
                    {isMe && (
                      <span className="text-white/50 font-normal ml-1">(you)</span>
                    )}
                  </p>
                  <div className="min-h-[22px] flex items-center mt-0.5">
                    {state.revealed && value !== undefined ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className="text-sm font-bold tabular-nums text-white/90"
                      >
                        {value}
                      </motion.span>
                    ) : voted ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-emerald-400/90 flex items-center gap-1.5"
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        Voted
                      </motion.span>
                    ) : (
                      <span className="text-sm text-white/40">Waiting…</span>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
