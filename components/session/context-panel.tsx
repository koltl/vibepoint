"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/store/session-store";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

export function ContextPanel() {
  const state = useSessionStore((s) => s.state);
  const isHost = useSessionStore((s) => s.isHost());
  const [local, setLocal] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (state) setLocal(state.contextText);
  }, [state?.id, state?.contextText]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (!isHost || !state) return;
    const socket = getSocket();
    if (socket && local !== state.contextText) {
      socket.emit("update_context", { sessionId: state.id, contextText: local });
    }
  }, [isHost, state, local]);

  if (!state) return null;

  const displayValue = focused && isHost ? local : (state.contextText || local);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-2xl p-4 min-h-[120px]"
    >
      <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
        Context
      </label>
      {isHost ? (
        <textarea
          value={displayValue}
          onChange={(e) => setLocal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder="Paste Jira link or describe the item…"
          className={cn(
            "w-full min-h-[80px] rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 resize-y transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 border-white/10"
          )}
          maxLength={2000}
        />
      ) : (
        <p className="min-h-[52px] rounded-xl bg-white/5 px-4 py-3 text-sm text-white/90 whitespace-pre-wrap">
          {state.contextText || "—"}
        </p>
      )}
    </motion.section>
  );
}
