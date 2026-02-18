import { randomBytes } from "crypto";
import type { Session, SessionUser } from "../types";
import { getColorForIndex } from "../lib/utils";
import { SESSION_ID_LENGTH, CONTEXT_MAX_LENGTH } from "../lib/constants";

function touchSession(session: Session): void {
  session.lastActivityAt = Date.now();
}

function generateId(length: number): string {
  return randomBytes(Math.ceil((length * 6) / 8))
    .toString("base64url")
    .slice(0, length);
}

const sessions = new Map<string, Session>();

function generateSessionId(): string {
  const id = generateId(SESSION_ID_LENGTH);
  return sessions.has(id) ? generateSessionId() : id;
}

export function createSession(hostSocketId: string, hostUsername: string): Session {
  const id = generateSessionId();
  const host: SessionUser = {
    id: `user-${generateId(8)}`,
    username: hostUsername,
    socketId: hostSocketId,
    joinedAt: Date.now(),
    color: getColorForIndex(0),
  };
  const now = Date.now();
  const session: Session = {
    id,
    hostSocketId,
    users: [host],
    votes: {},
    revealed: false,
    contextText: "",
    deck: "fibonacci",
    createdAt: now,
    lastActivityAt: now,
  };
  sessions.set(id, session);
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

/** Returns session IDs that have had no activity for at least `inactivityMs`. */
export function getExpiredSessionIds(inactivityMs: number): string[] {
  const now = Date.now();
  const expired: string[] = [];
  for (const [id, session] of sessions) {
    if (now - session.lastActivityAt >= inactivityMs) expired.push(id);
  }
  return expired;
}

/** Removes a session. Returns true if it existed. */
export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

export function sessionExists(sessionId: string): boolean {
  return sessions.has(sessionId);
}

export function joinSession(
  sessionId: string,
  socketId: string,
  username: string
): { session: Session; user: SessionUser } | { error: string } {
  const session = sessions.get(sessionId);
  if (!session) return { error: "Session not found" };
  const taken = session.users.some(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (taken) return { error: "Username already taken" };
  const trimmed = username.trim().slice(0, 32);
  if (trimmed.length < 2) return { error: "Username too short" };
  const user: SessionUser = {
    id: `user-${generateId(8)}`,
    username: trimmed,
    socketId,
    joinedAt: Date.now(),
    color: getColorForIndex(session.users.length),
  };
  session.users.push(user);
  touchSession(session);
  return { session, user };
}

export function leaveSession(sessionId: string, socketId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.users = session.users.filter((u) => u.socketId !== socketId);
  delete session.votes[socketId];
  if (session.users.length === 0) {
    sessions.delete(sessionId);
    return null;
  }
  touchSession(session);
  if (session.hostSocketId === socketId) {
    const nextHost = session.users.reduce((a, b) =>
      a.joinedAt < b.joinedAt ? a : b
    );
    session.hostSocketId = nextHost.socketId;
  }
  return session;
}

export function getSessionBySocket(socketId: string): Session | undefined {
  for (const s of sessions.values()) {
    if (s.users.some((u: SessionUser) => u.socketId === socketId)) return s;
  }
  return undefined;
}

export function castVote(sessionId: string, socketId: string, value: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const allowed = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?", "☕"];
  if (!allowed.includes(value)) return session;
  session.votes[socketId] = value;
  touchSession(session);
  return session;
}

export function clearVotes(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.votes = {};
  session.revealed = false;
  session.contextText = "";
  touchSession(session);
  return session;
}

export function revealVotes(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.revealed = true;
  touchSession(session);
  return session;
}

export function hideVotes(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.revealed = false;
  touchSession(session);
  return session;
}

export function updateContext(sessionId: string, contextText: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.contextText = String(contextText).slice(0, CONTEXT_MAX_LENGTH);
  touchSession(session);
  return session;
}

export function changeDeck(sessionId: string, deck: "fibonacci" | "custom"): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.deck = deck;
  touchSession(session);
  return session;
}

export function toClientState(session: Session): import("../types").ClientSessionState {
  return {
    id: session.id,
    hostSocketId: session.hostSocketId,
    users: [...session.users],
    votes: { ...session.votes },
    revealed: session.revealed,
    contextText: session.contextText,
    deck: session.deck,
  };
}
