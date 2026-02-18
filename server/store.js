const { nanoid } = require("nanoid");

const USER_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#0ea5e9", "#3b82f6",
];
const SESSION_ID_LENGTH = 8;
const CONTEXT_MAX_LENGTH = 2000;

function getColorForIndex(index) {
  return USER_COLORS[index % USER_COLORS.length];
}

const sessions = new Map();

function generateSessionId() {
  const id = nanoid(SESSION_ID_LENGTH);
  return sessions.has(id) ? generateSessionId() : id;
}

function createSession(hostSocketId, hostUsername) {
  const id = generateSessionId();
  const host = {
    id: `user-${nanoid(8)}`,
    username: hostUsername,
    socketId: hostSocketId,
    joinedAt: Date.now(),
    color: getColorForIndex(0),
  };
  const session = {
    id,
    hostSocketId,
    users: [host],
    votes: {},
    revealed: false,
    contextText: "",
    deck: "fibonacci",
    createdAt: Date.now(),
  };
  sessions.set(id, session);
  return session;
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function sessionExists(sessionId) {
  return sessions.has(sessionId);
}

function joinSession(sessionId, socketId, username) {
  const session = sessions.get(sessionId);
  if (!session) return { error: "Session not found" };
  const taken = session.users.some(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (taken) return { error: "Username already taken" };
  const trimmed = username.trim().slice(0, 32);
  if (trimmed.length < 2) return { error: "Username too short" };
  const user = {
    id: `user-${nanoid(8)}`,
    username: trimmed,
    socketId,
    joinedAt: Date.now(),
    color: getColorForIndex(session.users.length),
  };
  session.users.push(user);
  return { session, user };
}

function leaveSession(sessionId, socketId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.users = session.users.filter((u) => u.socketId !== socketId);
  delete session.votes[socketId];
  if (session.users.length === 0) {
    sessions.delete(sessionId);
    return null;
  }
  if (session.hostSocketId === socketId) {
    const nextHost = session.users.reduce((a, b) =>
      a.joinedAt < b.joinedAt ? a : b
    );
    session.hostSocketId = nextHost.socketId;
  }
  return session;
}

function getSessionBySocket(socketId) {
  for (const s of sessions.values()) {
    if (s.users.some((u) => u.socketId === socketId)) return s;
  }
  return undefined;
}

function castVote(sessionId, socketId, value) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const allowed = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?", "☕"];
  if (!allowed.includes(value)) return session;
  session.votes[socketId] = value;
  return session;
}

function clearVotes(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.votes = {};
  session.revealed = false;
  session.contextText = "";
  return session;
}

function revealVotes(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.revealed = true;
  return session;
}

function hideVotes(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.revealed = false;
  return session;
}

function updateContext(sessionId, contextText) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.contextText = String(contextText).slice(0, CONTEXT_MAX_LENGTH);
  return session;
}

function changeDeck(sessionId, deck) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.deck = deck;
  return session;
}

function toClientState(session) {
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

module.exports = {
  createSession,
  getSession,
  sessionExists,
  joinSession,
  leaveSession,
  getSessionBySocket,
  castVote,
  clearVotes,
  revealVotes,
  hideVotes,
  updateContext,
  changeDeck,
  toClientState,
};
