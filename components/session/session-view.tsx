"use client";

import { useSessionStore } from "@/store/session-store";
import { SessionBar } from "./session-bar";
import { ContextPanel } from "./context-panel";
import { VotingCards } from "./voting-cards";
import { PlayersReveal } from "./players-reveal";
import { HostControls } from "./host-controls";
import { RevealEffect } from "./reveal-effect";
import { SessionStats } from "./session-stats";

export function SessionView() {
  const state = useSessionStore((s) => s.state);
  const isHost = useSessionStore((s) => s.isHost());

  if (!state) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <RevealEffect />
      <SessionBar />
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
        <main className="flex-1 flex flex-col gap-8 min-w-0 order-2 lg:order-1">
          <PlayersReveal />
          <VotingCards />
          <SessionStats />
        </main>
        <aside className="lg:w-80 flex flex-col gap-4 shrink-0 order-1 lg:order-2">
          <ContextPanel />
          {isHost && <HostControls />}
        </aside>
      </div>
    </div>
  );
}
