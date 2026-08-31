import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initSocket } from './socket/socket.handler';

const startServer = () => {
  try {
    const port = env.PORT;
    
    // Bungkus Express app dengan standar HTTP Server
    const httpServer = createServer(app);
    
    // Inisialisasi Socket.IO menggunakan HTTP Server tersebut
    initSocket(httpServer);
    
    // Ubah app.listen menjadi httpServer.listen
    httpServer.listen(port, () => {
      logger.info(`Server is running in ${env.NODE_ENV} mode`);
      logger.info(`API is listening on http://localhost:${port}`);
      logger.info(`Health check available at http://localhost:${port}/api/health`);
    });
  } catch (error) {
    logger.error({ error }, 'Error starting server');
    process.exit(1);
  }
};

startServer();