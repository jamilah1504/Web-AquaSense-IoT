import { Request, Response } from 'express';
import { getDashboardSummary } from '../services/dashboard.service';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    // Ambil query ?deviceId=WATER-001 jika frontend mengirimkannya
    const deviceId = req.query.deviceId as string | undefined;
    
    const summary = await getDashboardSummary(deviceId);
    
    res.status(200).json({
      success: true,
      message: 'Data dashboard berhasil diambil',
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};