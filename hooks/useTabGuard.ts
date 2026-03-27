import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export function useTabGuard(socket: Socket | null, roomCode: string, userName: string) {
  const [switches, setSwitches] = useState(0);

  useEffect(() => {
    if (!socket || !roomCode || !userName) return;

    const handler = () => {
      if (document.hidden) {
        setSwitches(s => s + 1);
        socket.emit("tab-switch", { roomCode, userName });
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [socket, roomCode, userName]);

  return switches;
}
