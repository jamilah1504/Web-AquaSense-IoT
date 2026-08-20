"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.env.FRONTEND_URL,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`[Socket.IO] Frontend Client terhubung: ${socket.id}`);
        socket.on('disconnect', () => {
            logger_1.logger.info(`[Socket.IO] Frontend Client terputus: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
// Fungsi ini akan kita gunakan di Service untuk men-trigger event ke frontend
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO belum diinisialisasi!');
    }
    return io;
};
exports.getIO = getIO;
