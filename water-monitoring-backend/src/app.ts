import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes'; // <-- Import route
import deviceRoutes from './routes/device.routes'; // <-- Import route
import iotRoutes from './routes/iot.routes';
import readingRoutes from './routes/reading.routes'; // <-- Import route
import dashboardRoutes from './routes/dashboard.routes'; // <-- Import route
import thresholdRoutes from './routes/threshold.routes';
import warningRoutes from './routes/warning.routes';
import notificationRoutes from './routes/notification.routes';

const app: Application = express();

// 1. MIDDLEWARE WAJIB (Harus paling atas!)
app.use(helmet());
// app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|192\.168\.\d+\.\d+):3000$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// 👇 INI YANG PALING PENTING 👇
app.use(express.json()); // Membaca req.body berformat JSON
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// 2. ROUTES
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'OK' });
});

// Pastikan route ini berada DI BAWAH app.use(express.json())
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/readings', readingRoutes); // <-- Tambahkan route ini
app.use('/api/dashboard', dashboardRoutes); // <-- Tambahkan route ini
app.use('/api/thresholds', thresholdRoutes); // <-- Tambahkan route ini
app.use('/api/warnings', warningRoutes); // <-- Tambahkan route ini
app.use('/api/notifications', notificationRoutes);

// 3. FALLBACK ROUTE
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

export default app;