import { Request, Response } from 'express';
import * as readingService from '../services/reading.service';
import { createReadingSchema, getHistoryQuerySchema } from '../validators/reading.validator';

// 1. Fungsi untuk menerima data dari IoT (ESP32)
export const receiveIoTData = async (req: Request, res: Response) => {
  try {
    const validatedData = createReadingSchema.parse(req.body);
    
    const result = await readingService.saveSensorReading(validatedData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Data sensor berhasil disimpan', 
      data: result 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.errors ? error.errors[0].message : error.message 
    });
  }
};

// 2. Fungsi untuk mengambil riwayat data (Frontend)
export const getHistory = async (req: Request, res: Response) => {
  try {
    const filters = getHistoryQuerySchema.parse(req.query);
    const result = await readingService.getReadingHistory(filters);
    
    res.status(200).json({ 
      success: true, 
      message: 'Riwayat pembacaan sensor berhasil diambil',
      ...result 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.errors ? error.errors[0].message : error.message 
    });
  }
};