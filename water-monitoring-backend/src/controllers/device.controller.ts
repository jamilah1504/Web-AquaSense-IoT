import { Request, Response } from 'express';
import * as deviceService from '../services/device.service';
import { createDeviceSchema, updateDeviceSchema } from '../validators/device.validator';

export const getDevices = async (req: Request, res: Response) => {
  try {
    const devices = await deviceService.getAllDevices();
    res.status(200).json({ success: true, data: devices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDevice = async (req: Request, res: Response) => {
  try {
    const device = await deviceService.getDeviceById(String(req.params.id));
    res.status(200).json({ success: true, data: device });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createDevice = async (req: Request, res: Response) => {
  try {
    const validatedData = createDeviceSchema.parse(req.body);
    const device = await deviceService.createDevice(validatedData as any);
    res.status(201).json({ success: true, message: 'Device berhasil ditambahkan', data: device });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
  }
};

export const updateDevice = async (req: Request, res: Response) => {
  try {
    const validatedData = updateDeviceSchema.parse(req.body);
    const device = await deviceService.updateDevice(String(req.params.id), validatedData as any);
    res.status(200).json({ success: true, message: 'Device berhasil diupdate', data: device });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
  }
};

export const deleteDevice = async (req: Request, res: Response) => {
  try {
    await deviceService.deleteDevice(String(req.params.id));
    res.status(200).json({ success: true, message: 'Device berhasil dihapus' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};