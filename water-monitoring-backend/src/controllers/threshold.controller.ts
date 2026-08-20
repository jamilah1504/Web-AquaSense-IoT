import { Request, Response } from 'express';
import * as thresholdService from '../services/threshold.service';
import { updateThresholdSchema } from '../validators/threshold.validator';
import { SensorType } from '@prisma/client';

export const getThresholds = async (req: Request, res: Response) => {
  try {
    const thresholds = await thresholdService.getAllThresholds();
    res.status(200).json({ success: true, data: thresholds });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getThreshold = async (req: Request, res: Response) => {
  try {
    // Ubah parameter dari URL menjadi UPPERCASE agar sesuai dengan enum Prisma (cth: ph -> PH)
    const parameter = Array.isArray(req.params.parameter)
      ? req.params.parameter[0]
      : req.params.parameter;
    const param = parameter.toUpperCase() as SensorType;
    const threshold = await thresholdService.getThresholdByParameter(param);
    
    res.status(200).json({ success: true, data: threshold });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateThreshold = async (req: Request, res: Response) => {
  try {
    const parameter = Array.isArray(req.params.parameter)
      ? req.params.parameter[0]
      : req.params.parameter;
    const param = parameter.toUpperCase() as SensorType;
    const validatedData = updateThresholdSchema.parse(req.body);
    
    const threshold = await thresholdService.updateThreshold(param, validatedData);
    
    res.status(200).json({ 
      success: true, 
      message: `Threshold ${param} berhasil diupdate`, 
      data: threshold 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.errors ? error.errors[0].message : error.message 
    });
  }
};