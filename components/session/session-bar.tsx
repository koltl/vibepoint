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
      <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-sm text-white/70 truncate">{state.id}</span>
            <Button variant="ghost" size="sm" onClick={copyLink} className="shrink-0">
              Copy link
            </Button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isHost && (
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-lg",
                  "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                )}
              >
                Host
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={leaveSession}>
              Leave
            </Button>
          </div>
        </div>
      </header>
      <Toast message="Link copied" visible={toast} onDismiss={() => setToast(false)} />
    </>
  );
}
