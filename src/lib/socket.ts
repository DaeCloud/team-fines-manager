import { Server as SocketIOServer } from "socket.io";

// Singleton held in the Node.js global so it survives Next.js hot-reloads
const globalForIO = globalThis as unknown as { _io?: SocketIOServer };

export function getIO(): SocketIOServer | undefined {
  return globalForIO._io;
}

export function setIO(io: SocketIOServer): void {
  globalForIO._io = io;
}
