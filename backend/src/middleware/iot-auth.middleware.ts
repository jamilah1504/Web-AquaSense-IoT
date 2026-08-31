import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const verifyDeviceToken = (req: Request, res: Response, next: NextFunction): void => {
  const deviceToken = req.headers['x-device-token'];

  if (!deviceToken || deviceToken !== env.DEVICE_API_SECRET) {
    res.status(401).json({ 
      success: false, 
      message: 'Akses IoT ditolak. Token perangkat tidak valid.' 
    });
    return;
  }

  next();
};