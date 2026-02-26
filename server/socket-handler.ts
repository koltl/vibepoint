import { Server } from "socket.io";
import type { JoinSessionPayload, CastVotePayload, UpdateContextPayload, ChangeDeckPayload } from "../types";
import {
  createSession,
  getSession,
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
  getExpiredSessionIds,
  deleteSession,
} from "./store";
import { SESSION_INACTIVITY_MS } from "../lib/constants";

const INACTIVITY_CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

const log = {
  sessionCreated: (sessionId: string, username: string) =>
    console.log("[vibepoint] session created", { sessionId, host: username }),
  sessionDestroyed: (sessionId: string, reason: string) =>
    console.log("[vibepoint] session destroyed", { sessionId, reason }),
  userJoined: (sessionId: string, username: string) =>
    console.log("[vibepoint] user joined", { sessionId, username }),
  userLeft: (sessionId: string, socketId: string) =>
    console.log("[vibepoint] user left", { sessionId, socketId }),
  voteCast: (sessionId: string, socketId: string, value: string) =>
    console.log("[vibepoint] vote cast", { sessionId, socketId, value }),
  votesRevealed: (sessionId: string) =>
    console.log("[vibepoint] votes revealed", { sessionId }),
  votesHidden: (sessionId: string) =>
    console.log("[vibepoint] votes hidden", { sessionId }),
  contextUpdated: (sessionId: string, length: number) =>
    console.log("[vibepoint] context updated", { sessionId, contextLength: length }),
};

export function attachSocketHandler(io: Server) {
  setInterval(() => {
    const expiredIds = getExpiredSessionIds(SESSION_INACTIVITY_MS);
    for (const sessionId of expiredIds) {
      log.sessionDestroyed(sessionId, "inactivity");
      io.to(sessionId).emit("session_ended", { reason: "inactivity" });
      deleteSession(sessionId);
    }
  }, INACTIVITY_CHECK_INTERVAL_MS);

  io.on("connection", (socket) => {
    socket.on("create_session", (username: string, cb?: (sessionId: string | null) => void) => {
      const trimmed = String(username || "").trim().slice(0, 32);
      if (trimmed.length < 2) {
        cb?.(null);
        socket.emit("error", { message: "Username too short" });
        return;
      }
      const session = createSession(socket.id, trimmed);
      socket.join(session.id);
      log.sessionCreated(session.id, trimmed);
      cb?.(session.id);
      socket.emit("session_state", toClientState(session));
    });

    socket.on("join_session", (payload: JoinSessionPayload, cb?: (ok: boolean) => void) => {
      const { sessionId, username } = payload || {};
      if (!sessionId || !username) {
        cb?.(false);
        socket.emit("error", { message: "Invalid payload" });
        return;
      }
      const session = getSession(sessionId);
      if (!session) {
        cb?.(false);
        socket.emit("error", { message: "Session not found" });
        return;
      }
      const result = joinSession(sessionId, socket.id, username);
      if ("error" in result) {
        cb?.(false);
        socket.emit("error", { message: result.error });
        return;
      }
      const { session: updated, user } = result;
      socket.join(sessionId);
      log.userJoined(sessionId, user.username);
      cb?.(true);
      socket.emit("session_state", toClientState(updated));
      socket.to(sessionId).emit("user_joined", { user, state: toClientState(updated) });
    });

    socket.on("disconnect", () => {
      const session = getSessionBySocket(socket.id);
      if (!session) return;
      const wasLastUser = session.users.length === 1;
      const updated = leaveSession(session.id, socket.id);
      if (wasLastUser && !updated) {
        log.sessionDestroyed(session.id, "last user left");
      } else if (updated) {
        log.userLeft(session.id, socket.id);
      }
      if (updated) {
        io.to(session.id).emit("user_left", { state: toClientState(updated) });
      }
    });

    socket.on("leave_session", (sessionId: string) => {
      const session = getSession(sessionId);
      if (!session || !session.users.some((u) => u.socketId === socket.id)) return;
      const wasLastUser = session.users.length === 1;
      const updated = leaveSession(sessionId, socket.id);
      socket.leave(sessionId);
      if (wasLastUser && !updated) {
        log.sessionDestroyed(sessionId, "last user left");
      } else if (updated) {
        log.userLeft(sessionId, socket.id);
      }
      if (updated) {
        io.to(sessionId).emit("user_left", { state: toClientState(updated) });
      }
    });

    socket.on("cast_vote", (payload: CastVotePayload) => {
      const { sessionId, value } = payload || {};
      if (!sessionId || value === undefined) return;
      const session = getSession(sessionId);
      if (!session || !session.users.some((u) => u.socketId === socket.id)) return;
      const updated = castVote(sessionId, socket.id, String(value));
      if (updated) {
        log.voteCast(sessionId, socket.id, String(value));
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("clear_votes", (sessionId: string) => {
      const session = getSession(sessionId);
      if (!session || session.hostSocketId !== socket.id) return;
      const updated = clearVotes(sessionId);
      if (updated) {
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("reveal_votes", (sessionId: string) => {
      const session = getSession(sessionId);
      if (!session || session.hostSocketId !== socket.id) return;
      const updated = revealVotes(sessionId);
      if (updated) {
        log.votesRevealed(sessionId);
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("hide_votes", (sessionId: string) => {
      const session = getSession(sessionId);
      if (!session || session.hostSocketId !== socket.id) return;
      const updated = hideVotes(sessionId);
      if (updated) {
        log.votesHidden(sessionId);
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("update_context", (payload: UpdateContextPayload) => {
      const { sessionId, contextText } = payload || {};
      if (!sessionId) return;
      const session = getSession(sessionId);
      if (!session || session.hostSocketId !== socket.id) return;
      const updated = updateContext(sessionId, contextText ?? "");
      if (updated) {
        log.contextUpdated(sessionId, updated.contextText.length);
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("change_deck", (payload: ChangeDeckPayload) => {
      const { sessionId, deck } = payload || {};
      if (!sessionId) return;
      const session = getSession(sessionId);
      if (!session || session.hostSocketId !== socket.id) return;
      const updated = changeDeck(sessionId, deck ?? "fibonacci");
      if (updated) {
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });
  });
}
