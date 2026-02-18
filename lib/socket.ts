import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (typeof window === "undefined") return "";
  const port = process.env.NEXT_PUBLIC_PORT;
  if (port) return `${window.location.protocol}//${window.location.hostname}:${port}`;
  return window.location.origin;
};

let socket: ReturnType<typeof io> | null = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io(getSocketUrl(), {
      path: "/api/socket",
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
