"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSocket } from "@/lib/socket";
import { getStoredUsername, setStoredUsername } from "@/store/session-store";

interface JoinFormProps {
  sessionId: string;
  onJoined: () => void;
  joining: boolean;
  onRetry: () => void;
  error: string | null;
  onClearError?: () => void;
}

export function JoinForm({ sessionId, joining, onRetry, error, onClearError }: JoinFormProps) {
  const [username, setUsername] = useState(getStoredUsername());
  const handleUsernameChange = (v: string) => {
    setUsername(v);
    onClearError?.();
  };

  const handleJoin = () => {
    const name = username.trim();
    if (name.length < 2) return;
    setStoredUsername(name);
    const socket = getSocket();
    if (!socket) return;
    socket.emit("join_session", { sessionId, username: name }, (ok: boolean) => {
      if (!ok) onRetry();
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm glass rounded-2xl p-6 space-y-4"
    >
      <p className="text-white/60 text-sm">Join session</p>
      <Input
        placeholder="Your name"
        value={username}
        onChange={(e) => handleUsernameChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        autoFocus
      />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <Button className="w-full" onClick={handleJoin} disabled={joining}>
        {joining ? "Joining…" : "Join"}
      </Button>
    </motion.div>
  );
}
