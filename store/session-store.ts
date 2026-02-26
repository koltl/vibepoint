import { create } from "zustand";
import type { ClientSessionState, SessionUser } from "@/types";

const USERNAME_KEY = "vibepoint-username";

export function getStoredUsername(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function setStoredUsername(username: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERNAME_KEY, username);
}

interface SessionStore {
  socketId: string | null;
  me: SessionUser | null;
  state: ClientSessionState | null;
  error: string | null;
  voteOnlyView: boolean;
  setSocketId: (id: string | null) => void;
  setMe: (user: SessionUser | null) => void;
  setState: (state: ClientSessionState | null) => void;
  setError: (error: string | null) => void;
  setVoteOnlyView: (voteOnlyView: boolean) => void;
  reset: () => void;
  isHost: () => boolean;
  myVote: () => string | undefined;
  hasVoted: () => boolean;
  allVoted: () => boolean;
  votedCount: () => number;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  socketId: null,
  me: null,
  state: null,
  error: null,
  voteOnlyView: false,
  setSocketId: (socketId) => set({ socketId }),
  setMe: (me) => set({ me }),
  setState: (state) => set({ state, error: null }),
  setError: (error) => set({ error }),
  setVoteOnlyView: (voteOnlyView) => set({ voteOnlyView }),
  reset: () =>
    set({
      socketId: null,
      me: null,
      state: null,
      error: null,
      voteOnlyView: false,
    }),
  isHost: () => {
    const { socketId, state } = get();
    return !!(state && socketId && state.hostSocketId === socketId);
  },
  myVote: () => {
    const { socketId, state } = get();
    if (!socketId || !state) return undefined;
    return state.votes[socketId];
  },
  hasVoted: () => {
    const vote = get().myVote();
    return vote !== undefined && vote !== null;
  },
  allVoted: () => {
    const { state } = get();
    if (!state || state.users.length === 0) return false;
    const voted = Object.keys(state.votes).length;
    return voted >= state.users.length;
  },
  votedCount: () => {
    const { state } = get();
    return state ? Object.keys(state.votes).length : 0;
  },
}));
