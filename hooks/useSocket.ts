import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(roomCode?: string, userName?: string, userId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!roomCode || !userName) return;

    const newSocket = io(); // connects to same origin on default /socket.io path

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("[socket] connected:", newSocket.id);
      newSocket.emit("join-room", { roomCode, userName, userId });
    });

    newSocket.on("connect_error", (err) => {
      console.error("[socket] connection error:", err.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, userName, userId]);

  return socket;
}

