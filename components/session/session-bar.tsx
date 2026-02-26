"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

export function SessionBar() {
  const router = useRouter();
  const state = useSessionStore((s) => s.state);
  const isHost = useSessionStore((s) => s.isHost());
  const voteOnlyView = useSessionStore((s) => s.voteOnlyView);
  const setVoteOnlyView = useSessionStore((s) => s.setVoteOnlyView);
  const [toast, setToast] = useState(false);

  const copyLink = useCallback(() => {
    if (!state) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/session/${state.id}` : "";
    navigator.clipboard.writeText(url).then(() => {
      setToast(true);
      if (navigator.vibrate) navigator.vibrate(10);
    });
  }, [state]);

  const leaveSession = useCallback(() => {
    if (!state) return;
    getSocket()?.emit("leave_session", state.id);
    useSessionStore.getState().reset();
    router.push("/");
  }, [state, router]);

  if (!state) return null;

  return (
    <>
      <header className="sticky top-0 z-40 glass-strong border-b border-white/10 safe-area-padding">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 min-h-[52px] sm:min-h-[56px] flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-mono text-xs sm:text-sm text-white/70 truncate max-w-[80px] sm:max-w-none">{state.id}</span>
            <Button variant="ghost" size="sm" onClick={copyLink} className="shrink-0 min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-0 px-3 sm:px-2 text-sm">
              Copy link
            </Button>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isHost && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVoteOnlyView(!voteOnlyView)}
                className="shrink-0 min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-0 px-3 sm:px-2 text-sm"
              >
                {voteOnlyView ? "Full view" : "Vote only"}
              </Button>
            )}
            {isHost && (
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1.5 sm:py-1 rounded-lg",
                  "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                )}
              >
                Host
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={leaveSession} className="min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-0 px-3 sm:px-2 text-sm">
              Leave
            </Button>
          </div>
        </div>
      </header>
      <Toast message="Link copied" visible={toast} onDismiss={() => setToast(false)} />
    </>
  );
}
