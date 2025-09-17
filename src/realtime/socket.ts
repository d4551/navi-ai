import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001', { 
      transports: ["websocket"] 
    });
  }
  return socket;
}