"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useSessionStore } from "@/store/session-store";
import type { ClientSessionState, SessionUser } from "@/types";

export function useSocket() {
  const connected = useRef(false);
  const {
    setSocketId,
    setMe,
    setState,
    setError,
    reset,
  } = useSessionStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || connected.current) return;

    const onConnect = () => {
      connected.current = true;
      setSocketId(socket.id ?? null);
    };

    const onDisconnect = () => {
      connected.current = false;
      setSocketId(null);
    };

    const onSessionState = (state: ClientSessionState) => {
      setState(state);
      const me = state.users.find((u) => u.socketId === socket.id) ?? null;
      setMe(me);
    };

    const onUserJoined = ({ state }: { state: ClientSessionState }) => {
      setState(state);
      const me = state.users.find((u) => u.socketId === socket.id) ?? null;
      setMe(me);
    };

    const onUserLeft = ({ state }: { state: ClientSessionState }) => {
      setState(state);
      const me = state.users.find((u) => u.socketId === socket.id) ?? null;
      setMe(me);
    };

    const onVotesUpdated = ({ state }: { state: ClientSessionState }) => {
      setState(state);
    };

    const onError = ({ message }: { message: string }) => {
      setError(message);
    };

    const onSessionEnded = (_payload: { reason?: string }) => {
      reset();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("session_state", onSessionState);
    socket.on("user_joined", onUserJoined);
    socket.on("user_left", onUserLeft);
    socket.on("votes_updated", onVotesUpdated);
    socket.on("error", onError);
    socket.on("session_ended", onSessionEnded);

    if (socket.connected) {
      setSocketId(socket.id ?? null);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("session_state", onSessionState);
      socket.off("user_joined", onUserJoined);
      socket.off("user_left", onUserLeft);
      socket.off("votes_updated", onVotesUpdated);
      socket.off("error", onError);
      socket.off("session_ended", onSessionEnded);
    };
  }, [setSocketId, setMe, setState, setError, reset]);

  return getSocket();
}
