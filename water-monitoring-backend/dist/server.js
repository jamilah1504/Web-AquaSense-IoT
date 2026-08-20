"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const socket_handler_1 = require("./socket/socket.handler");
const startServer = () => {
    try {
        const port = env_1.env.PORT;
        // Bungkus Express app dengan standar HTTP Server
        const httpServer = (0, http_1.createServer)(app_1.default);
        // Inisialisasi Socket.IO menggunakan HTTP Server tersebut
        (0, socket_handler_1.initSocket)(httpServer);
        // Ubah app.listen menjadi httpServer.listen
        httpServer.listen(port, () => {
            logger_1.logger.info(`Server is running in ${env_1.env.NODE_ENV} mode`);
            logger_1.logger.info(`API is listening on http://localhost:${port}`);
            logger_1.logger.info(`Health check available at http://localhost:${port}/api/health`);
        });
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Error starting server');
        process.exit(1);
    }
};
startServer();
