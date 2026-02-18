const {
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
} = require("./store.js");

function attachSocketHandler(io) {
  io.on("connection", (socket) => {
    socket.on("create_session", (username, cb) => {
      const trimmed = String(username || "").trim().slice(0, 32);
      if (trimmed.length < 2) {
        if (typeof cb === "function") cb(null);
        socket.emit("error", { message: "Username too short" });
        return;
      }
      const session = createSession(socket.id, trimmed);
      socket.join(session.id);
      if (typeof cb === "function") cb(session.id);
      socket.emit("session_state", toClientState(session));
    });

    socket.on("join_session", (payload, cb) => {
      const { sessionId, username } = payload || {};
      if (!sessionId || !username) {
        if (typeof cb === "function") cb(false);
        socket.emit("error", { message: "Invalid payload" });
        return;
      }
      const session = getSession(sessionId);
      if (!session) {
        if (typeof cb === "function") cb(false);
        socket.emit("error", { message: "Session not found" });
        return;
      }
      const result = joinSession(sessionId, socket.id, username);
      if (result.error) {
        if (typeof cb === "function") cb(false);
        socket.emit("error", { message: result.error });
        return;
      }
      const { session: updated } = result;
      socket.join(sessionId);
      if (typeof cb === "function") cb(true);
      socket.emit("session_state", toClientState(updated));
      socket.to(sessionId).emit("user_joined", { user: result.user, state: toClientState(updated) });
    });

    socket.on("disconnect", () => {
      const session = getSessionBySocket(socket.id);
      if (!session) return;
      const updated = leaveSession(session.id, socket.id);
      if (updated) {
        io.to(session.id).emit("user_left", { state: toClientState(updated) });
      }
    });

    socket.on("leave_session", (sessionId) => {
      const session = getSession(sessionId);
      if (!session || !session.users.some((u) => u.socketId === socket.id)) return;
      const updated = leaveSession(sessionId, socket.id);
      socket.leave(sessionId);
      if (updated) {
        io.to(sessionId).emit("user_left", { state: toClientState(updated) });
      }
    });

    socket.on("cast_vote", (payload) => {
      const { sessionId, value } = payload || {};
      if (!sessionId || value === undefined) return;
      const session = getSession(sessionId);
      if (!session || !session.users.some((u) => u.socketId === socket.id)) return;
      const updated = castVote(sessionId, socket.id, String(value));
      if (updated) {
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("clear_votes", (sessionId) => {
      const session = getSession(sessionId);
      if (!session || session.hostSocketId !== socket.id) return;
      const updated = clearVotes(sessionId);
      if (updated) {
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("reveal_votes", (sessionId) => {
      const session = getSession(sessionId);
      if (!session || session.hostSocketId !== socket.id) return;
      const updated = revealVotes(sessionId);
      if (updated) {
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("hide_votes", (sessionId) => {
      const session = getSession(sessionId);
      if (!session || session.hostSocketId !== socket.id) return;
      const updated = hideVotes(sessionId);
      if (updated) {
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("update_context", (payload) => {
      const { sessionId, contextText } = payload || {};
      if (!sessionId) return;
      const session = getSession(sessionId);
      if (!session || session.hostSocketId !== socket.id) return;
      const updated = updateContext(sessionId, contextText ?? "");
      if (updated) {
        io.to(sessionId).emit("votes_updated", { state: toClientState(updated) });
      }
    });

    socket.on("change_deck", (payload) => {
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

module.exports = { attachSocketHandler };
