/* eslint-disable */
const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_SITE_URL || "*" }
  });

  require("./lib/socket").registerHandlers(io);

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
