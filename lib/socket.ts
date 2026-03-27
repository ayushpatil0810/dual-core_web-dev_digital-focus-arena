import { Server, Socket } from "socket.io";

export function registerHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // Join Room
    socket.on("join-room", ({ roomCode, userName, userId }) => {
      socket.join(roomCode);
      socket.data = {
        roomCode,
        userName,
        userId,
        status: "focused",
        tabSwitches: 0,
        idleMinutes: 0,
        tasks: [],
      };

      const members = getRoomMembers(io, roomCode);
      io.to(roomCode).emit("members-updated", members);
    });

    // Start Session
    socket.on("start-session", ({ roomCode, duration }) => {
      const serverNow = Date.now();
      const endsAt = new Date(
        serverNow + Number(duration) * 60000,
      ).toISOString();

      // Broadcast both the calculated end time and the server timestamp
      // so clients can compensate for clock skew when rendering the timer.
      io.to(roomCode).emit("session-started", { endsAt, serverNow });
    });

    // End Session Early
    socket.on("end-session", ({ roomCode }) => {
      io.to(roomCode).emit("session-ended", { reason: "host" });
    });

    // Tab Switch / status change (also used for research-mode status)
    socket.on("tab-switch", ({ roomCode, userName, status }) => {
      if (socket.data.tabSwitches === undefined) return;

      const statusOverride = status as string | undefined;

      if (statusOverride === "research") {
        socket.data.status = "research";
      } else if (statusOverride === "focused") {
        socket.data.status = "focused";
      } else {
        socket.data.tabSwitches += 1;
        socket.data.status = "distracted";
        io.to(roomCode).emit("member-distracted", {
          userName,
          switches: socket.data.tabSwitches,
        });
      }

      // Members list update
      const members = getRoomMembers(io, roomCode);
      io.to(roomCode).emit("members-updated", members);
    });

    // Idle / Active
    socket.on("user-idle", ({ roomCode }) => {
      socket.data.status = "idle";
      const members = getRoomMembers(io, roomCode);
      io.to(roomCode).emit("members-updated", members);
    });

    socket.on("user-active", ({ roomCode }) => {
      socket.data.status = "focused";
      const members = getRoomMembers(io, roomCode);
      io.to(roomCode).emit("members-updated", members);
    });

    // Task Update
    socket.on("task-update", ({ roomCode, tasks }) => {
      socket.data.tasks = tasks;
      const members = getRoomMembers(io, roomCode);
      io.to(roomCode).emit("members-updated", members);
    });

    // Send Chat Emoji
    socket.on("send-chat-emoji", ({ roomCode, emoji }) => {
      const userName = socket.data.userName || "Anonymous";
      const id = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();

      io.to(roomCode).emit("chat-message", {
        id,
        emoji,
        userName,
        timestamp,
      });
    });

    // Pomodoro Cycle
    socket.on("pomodoro-cycle", ({ roomCode, phase, endsAt }) => {
      io.to(roomCode).emit("pomodoro-cycle", { phase, endsAt });
    });

    socket.on("disconnect", () => {
      if (socket.data.roomCode) {
        io.to(socket.data.roomCode).emit("member-left", {
          userName: socket.data.userName,
        });
        const members = getRoomMembers(io, socket.data.roomCode, socket.id); // exclude this socket
        io.to(socket.data.roomCode).emit("members-updated", members);
      }
    });
  });
}

function getRoomMembers(
  io: Server,
  roomCode: string,
  excludeSocketId?: string,
) {
  const room = io.sockets.adapter.rooms.get(roomCode);
  if (!room) return [];

  const members: Record<string, unknown>[] = [];
  room.forEach((socketId) => {
    if (socketId === excludeSocketId) return;
    const socket = io.sockets.sockets.get(socketId);
    if (socket && socket.data) {
      members.push({
        socketId: socket.id,
        ...socket.data,
      });
    }
  });
  return members;
}
