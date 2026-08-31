import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger';
import { env } from '../config/env';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket.IO] Frontend Client terhubung: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`[Socket.IO] Frontend Client terputus: ${socket.id}`);
    });
  });

  return io;
};

// Fungsi ini akan kita gunakan di Service untuk men-trigger event ke frontend
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO belum diinisialisasi!');
  }
  return io;
};