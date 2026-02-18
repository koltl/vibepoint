"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SessionView } from "@/components/session/session-view";
import { JoinForm } from "@/components/session/join-form";
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

  const tryRejoin = useCallback(() => {
    const socket = getSocket();
    const stored = getStoredUsername();
    if (!socket || !stored || stored.length < 2) return;
    setJoining(true);
    setError(null);
    socket.emit("join_session", { sessionId, username: stored }, (ok: boolean) => {
      setJoining(false);
      if (!ok) setError("Could not rejoin. Name may be taken.");
    });
  }, [sessionId, setError]);

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
