"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SessionView } from "@/components/session/session-view";
import { JoinForm } from "@/components/session/join-form";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/session-store";
import { getSocket } from "@/lib/socket";
import { getStoredUsername } from "@/store/session-store";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { state, me, setError, error, socketId } = useSessionStore();
  const [joining, setJoining] = useState(false);

  const isInSession = state?.id === sessionId && me !== null;
  const isSessionNotFound =
    error?.toLowerCase().includes("session not found") ?? false;

  const tryRejoin = useCallback(() => {
    const socket = getSocket();
    const stored = getStoredUsername();
    if (!socket || !stored || stored.length < 2) return;
    setJoining(true);
    setError(null);
    socket.emit("join_session", { sessionId, username: stored }, (ok: boolean) => {
      setJoining(false);
      // Don't overwrite error: socket "error" event already sets the real message
      // (e.g. "Session not found" or "Username already taken")
    });
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !socketId) return;
    if (state?.id === sessionId && me) return;
    tryRejoin();
  }, [sessionId, socketId, state?.id, me, tryRejoin]);

  if (!sessionId) {
    router.replace("/");
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isInSession ? (
        <motion.div
          key="session"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen"
        >
          <SessionView />
        </motion.div>
      ) : isSessionNotFound ? (
        <motion.div
          key="not-found"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm glass rounded-2xl p-6 space-y-5 text-center">
            <p className="text-white/80 font-medium">
              This session has ended or doesn’t exist.
            </p>
            <p className="text-white/50 text-sm">
              The link may be old or the session was closed. Start a new one from
              the home page.
            </p>
            <Button className="w-full" onClick={() => router.replace("/")}>
              Go to home
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="join"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen flex items-center justify-center p-4"
        >
          <JoinForm
            sessionId={sessionId}
            onJoined={() => {}}
            joining={joining}
            onRetry={tryRejoin}
            error={error}
            onClearError={() => setError(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
