export type DeckType = "fibonacci" | "custom";

export interface SessionUser {
  id: string;
  username: string;
  socketId: string;
  joinedAt: number;
  color: string;
}

export interface Session {
  id: string;
  hostSocketId: string;
  users: SessionUser[];
  votes: Record<string, string>;
  revealed: boolean;
  contextText: string;
  deck: DeckType;
  createdAt: number;
  lastActivityAt: number;
}

export interface ClientSessionState {
  id: string;
  hostSocketId: string;
  users: SessionUser[];
  votes: Record<string, string>;
  revealed: boolean;
  contextText: string;
  deck: DeckType;
}

export type SocketEvent =
  | "join_session"
  | "leave_session"
  | "session_state"
  | "user_joined"
  | "user_left"
  | "session_ended"
  | "cast_vote"
  | "votes_updated"
  | "clear_votes"
  | "reveal_votes"
  | "hide_votes"
  | "update_context"
  | "change_deck"
  | "error";

export interface JoinSessionPayload {
  sessionId: string;
  username: string;
}

export interface CastVotePayload {
  sessionId: string;
  value: string;
}

export interface UpdateContextPayload {
  sessionId: string;
  contextText: string;
}

export interface ChangeDeckPayload {
  sessionId: string;
  deck: DeckType;
}
