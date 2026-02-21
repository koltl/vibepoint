"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSocket } from "@/lib/socket";
import { getStoredUsername, setStoredUsername } from "@/store/session-store";

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [username, setUsername] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const stored = getStoredUsername();
  const displayName = username || (mode === "join" ? "" : stored);
  const effectiveName = displayName || stored;

  const handleStartSession = () => {
    if (!effectiveName.trim() || effectiveName.trim().length < 2) {
      setError("Enter a username (at least 2 characters)");
      return;
    }
    setError("");
    setCreating(true);
    const socket = getSocket();
    if (!socket) {
      setError("Connection not available");
      setCreating(false);
      return;
    }
    setStoredUsername(effectiveName.trim());
    socket.emit("create_session", effectiveName.trim(), (sessionId: string | null) => {
      setCreating(false);
      if (sessionId) {
        router.push(`/session/${sessionId}`);
      } else {
        setError("Could not create session");
      }
    });
  };

  const handleJoinSession = () => {
    const name = (joinLink ? username : effectiveName).trim();
    if (name.length < 2) {
      setError("Enter a username (at least 2 characters)");
      return;
    }
    const match = joinLink.match(/\/session\/([a-zA-Z0-9_-]+)/) || joinLink.trim();
    const sessionId = typeof match === "string" ? match : match[1];
    if (!sessionId) {
      setError("Paste a valid session link or ID");
      return;
    }
    setError("");
    setJoining(true);
    const socket = getSocket();
    if (!socket) {
      setError("Connection not available");
      setJoining(false);
      return;
    }
    setStoredUsername(name);
    socket.emit("join_session", { sessionId, username: name }, (ok: boolean) => {
      setJoining(false);
      if (ok) {
        router.push(`/session/${sessionId}`);
      } else {
        setError("Could not join (session not found or username taken)");
      }
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-10"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            VibePoint
          </h1>
          <p className="text-white/50 text-sm">Story point estimation, in sync.</p>
        </div>

        {mode === "choose" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3"
          >
            <Button
              size="lg"
              className="w-full h-14 text-lg rounded-2xl"
              onClick={() => { setError(""); setMode("create"); }}
            >
              Start a session
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg rounded-2xl"
              onClick={() => { setError(""); setMode("join"); }}
            >
              Join with link
            </Button>
          </motion.div>
        )}

        {mode === "create" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 glass rounded-2xl p-6"
          >
            <label className="block text-sm font-medium text-white/70">Your name</label>
            <Input
              placeholder="e.g. Alex"
              value={displayName}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartSession()}
              autoFocus
            />
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => { setError(""); setMode("choose"); }}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleStartSession} disabled={creating}>
                {creating ? "Creating…" : "Create session"}
              </Button>
            </div>
          </motion.div>
        )}

        {mode === "join" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 glass rounded-2xl p-6"
          >
            <label className="block text-sm font-medium text-white/70">Your name</label>
            <Input
              placeholder="e.g. Alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label className="block text-sm font-medium text-white/70">Session link or ID</label>
            <Input
              placeholder="Paste link or session ID"
              value={joinLink}
              onChange={(e) => setJoinLink(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
            />
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => { setError(""); setMode("choose"); }}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleJoinSession} disabled={joining}>
                {joining ? "Joining…" : "Join"}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
