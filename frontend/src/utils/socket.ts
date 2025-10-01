import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initializeSocket = () => {
  if (!socket) {
    socket = io("http://192.168.110.16:5000", {
      transports: ["websocket"], // pakai websocket
      autoConnect: true,         // langsung connect
      reconnection: true,        // auto reconnect kalau disconnect
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Connection error:", error.message);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};