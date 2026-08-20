"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const startServer = () => {
    try {
        const port = env_1.env.PORT;
        app_1.default.listen(port, () => {
            logger_1.logger.info(`Server is running in ${env_1.env.NODE_ENV} mode`);
            logger_1.logger.info(`API is listening on http://localhost:${port}`);
            logger_1.logger.info(`Health check available at http://localhost:${port}/api/health`);
        });
    }
    catch (error) {
        logger_1.logger.error(error, 'Error starting server');
        process.exit(1);
    }
};
// Pastikan baris di bawah ini ada untuk memanggil fungsinya!
startServer();
