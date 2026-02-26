"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/store/session-store";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HostControls() {
  const state = useSessionStore((s) => s.state);
  const allVoted = useSessionStore((s) => s.allVoted);

  const toggleReveal = useCallback(() => {
    if (!state) return;
    if (state.revealed) {
      getSocket()?.emit("hide_votes", state.id);
    } else {
      getSocket()?.emit("reveal_votes", state.id);
    }
  }, [state]);

  const clear = useCallback(() => {
    if (!state) return;
    getSocket()?.emit("clear_votes", state.id);
  }, [state]);

  if (!state) return null;

  const canReveal = !state.revealed && Object.keys(state.votes).length > 0;
  const canHide = state.revealed;
  const canToggle = canReveal || canHide;
  const canClear = Object.keys(state.votes).length > 0 || state.contextText.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 space-y-2"
    >
      <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
        Host controls
      </h2>
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          className={cn(
            "w-full min-h-[44px] sm:min-h-8",
            allVoted() && canReveal && "animate-pulse-soft shadow-indigo-500/30"
          )}
          onClick={toggleReveal}
          disabled={!canToggle}
        >
          {state.revealed ? "Hide votes" : "Reveal votes"}
        </Button>
        <Button variant="outline" size="sm" className="w-full min-h-[44px] sm:min-h-8" onClick={clear} disabled={!canClear}>
          Clear & reset
        </Button>
      </div>
    </motion.section>
  );
}
