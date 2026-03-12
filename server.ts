/**
 * Custom Next.js server that mounts Socket.IO on the same HTTP port.
 * Run with:  npx tsx server.ts   (dev)
 *            node server.js      (prod, after build)
 *
 * No imports from src/ — this file must compile to a self-contained server.js.
 * The Socket.IO instance is stored on globalThis so Next.js API routes can
 * reach it via src/lib/socket.ts's getIO().
 */
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev  = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app    = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // Store on globalThis — src/lib/socket.ts reads it via getIO()
  (globalThis as unknown as { _io: SocketIOServer })._io = io;

  io.on("connection", (socket) => {
    console.log("[socket.io] client connected:", socket.id);
    socket.on("disconnect", () =>
      console.log("[socket.io] client disconnected:", socket.id)
    );
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
