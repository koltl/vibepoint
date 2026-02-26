"use client";

import { useSessionStore } from "@/store/session-store";
import { SessionBar } from "./session-bar";
import { ContextPanel } from "./context-panel";
import { VotingCards } from "./voting-cards";
import { PlayersReveal } from "./players-reveal";
import { HostControls } from "./host-controls";
import { RevealEffect } from "./reveal-effect";
import { SessionStats } from "./session-stats";
import { averageVote } from "@/lib/utils";

export function SessionView() {
  const state = useSessionStore((s) => s.state);
  const isHost = useSessionStore((s) => s.isHost());
  const voteOnlyView = useSessionStore((s) => s.voteOnlyView);

  if (!state) return null;

  const isVoteOnly = !isHost && voteOnlyView;
  const avg = state.revealed ? averageVote(Object.values(state.votes)) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <RevealEffect />
      <SessionBar />
      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 p-3 sm:p-4 md:p-6 max-w-6xl mx-auto w-full pb-safe">
        <main className="flex-1 flex flex-col gap-5 sm:gap-6 md:gap-8 min-w-0 order-2 lg:order-1">
          {!isVoteOnly && <PlayersReveal />}
          <VotingCards />
          {isVoteOnly ? (
            state.revealed && avg !== null && (
              <p className="text-center text-sm text-white/60">
                Average <span className="font-mono font-medium text-white/80">{avg}</span>
              </p>
            )
          ) : (
            <SessionStats />
          )}
        </main>
        <aside className="lg:w-80 flex flex-col gap-4 shrink-0 order-1 lg:order-2">
          <ContextPanel />
          {isHost && <HostControls />}
        </aside>
      </div>
    </div>
  );
}
