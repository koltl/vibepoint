"use client";

import { motion } from "framer-motion";
import { useSessionStore } from "@/store/session-store";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PlayerList() {
  const state = useSessionStore((s) => s.state);
  const me = useSessionStore((s) => s.me);
  const socketId = useSessionStore((s) => s.socketId);

  if (!state) return null;

  return (
    <section className="glass rounded-2xl p-4">
      <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
        Players ({state.users.length})
      </h2>
      <ul className="space-y-2">
        {state.users.map((user) => {
          const voted = user.socketId in state.votes;
          const value = state.revealed ? state.votes[user.socketId] : voted ? "✓" : "—";
          const isMe = user.socketId === socketId;

          return (
            <motion.li
              key={user.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                isMe && "bg-white/10"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{
                    backgroundColor: `${user.color}30`,
                    color: user.color,
                  }}
                >
                  {getInitials(user.username)}
                </span>
                <span className="text-sm text-white/90 truncate">
                  {user.username}
                  {isMe && " (you)"}
                </span>
              </div>
              <span
                className={cn(
                  "text-sm font-mono tabular-nums shrink-0",
                  state.revealed ? "text-white" : "text-white/50"
                )}
              >
                {value}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
