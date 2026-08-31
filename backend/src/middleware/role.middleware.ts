import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Anda tidak memiliki hak akses untuk resource ini.' 
      });
      return;
    }
    next();
  };
};