/* eslint-disable */
// Socket.io event handlers for the custom Node server.
// Written in plain JS (not TS) so server.js can require() it directly.

function registerHandlers(io) {
  io.on("connection", (socket) => {
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
      const endsAt = new Date(Date.now() + duration * 60000).toISOString();
      io.to(roomCode).emit("session-started", { endsAt });
    });

    // End Session Early
    socket.on("end-session", ({ roomCode }) => {
      io.to(roomCode).emit("session-ended", { reason: "host" });
    });

    // Tab Switch
    socket.on("tab-switch", ({ roomCode, userName }) => {
      if (socket.data.tabSwitches !== undefined) {
        socket.data.tabSwitches += 1;
        socket.data.status = "distracted";
        io.to(roomCode).emit("member-distracted", {
          userName,
          switches: socket.data.tabSwitches,
        });

        const members = getRoomMembers(io, roomCode);
        io.to(roomCode).emit("members-updated", members);
      }
    });

    // Task Update
    socket.on("task-update", ({ roomCode, tasks }) => {
      socket.data.tasks = tasks;
      const members = getRoomMembers(io, roomCode);
      io.to(roomCode).emit("members-updated", members);
    });

    // Emoji Reaction — relay to everyone in the room
    // Payload: { roomCode, toSocketId, emoji }
    // The client decides which member card to animate based on toSocketId
    socket.on("send-reaction", ({ roomCode, toSocketId, emoji }) => {
      io.to(roomCode).emit("reaction-received", {
        toSocketId,
        fromName: socket.data.userName || "Someone",
        emoji,
      });
    });

    socket.on("disconnect", () => {
      if (socket.data.roomCode) {
        io.to(socket.data.roomCode).emit("member-left", {
          userName: socket.data.userName,
        });
        const members = getRoomMembers(
          io,
          socket.data.roomCode,
          socket.id // exclude this socket
        );
        io.to(socket.data.roomCode).emit("members-updated", members);
      }
    });
  });
}

function getRoomMembers(io, roomCode, excludeSocketId) {
  const room = io.sockets.adapter.rooms.get(roomCode);
  if (!room) return [];

  const members = [];
  room.forEach((socketId) => {
    if (socketId === excludeSocketId) return;
    const socket = io.sockets.sockets.get(socketId);
    if (socket && socket.data) {
      members.push({ socketId: socket.id, ...socket.data });
    }
  });
  return members;
}

module.exports = { registerHandlers };
