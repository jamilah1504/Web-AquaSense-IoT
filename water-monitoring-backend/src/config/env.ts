import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  DEVICE_API_SECRET: process.env.DEVICE_API_SECRET || 'rahasia_perangkat_iot_2026',
  WHATSAPP_PHONE_NUMBER: process.env.WHATSAPP_PHONE_NUMBER || '081234567890',
  NOTIFICATION_COOLDOWN_MINUTES: parseInt(process.env.NOTIFICATION_COOLDOWN_MINUTES || '15', 10),
};