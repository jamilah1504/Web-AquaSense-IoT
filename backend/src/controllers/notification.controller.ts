import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import {
  updateConfigSchema,
  addRecipientSchema,
  updateRecipientSchema,
  testMessageSchema,
} from '../validators/notification.validator';

export const getNotificationSettings = async (req: Request, res: Response) => {
  try {
    const data = await notificationService.getNotificationSettings();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNotificationConfig = async (req: Request, res: Response) => {
  try {
    const validated = updateConfigSchema.parse(req.body);
    const config = await notificationService.updateNotificationConfig(validated);
    res.status(200).json({ success: true, message: 'Konfigurasi notifikasi berhasil diupdate', data: config });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
  }
};

export const addRecipient = async (req: Request, res: Response) => {
  try {
    const validated = addRecipientSchema.parse(req.body);
    const recipient = await notificationService.addRecipient(validated);
    res.status(201).json({ success: true, message: 'Nomor penerima berhasil ditambahkan', data: recipient });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
  }
};

export const updateRecipient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid id parameter' });
    }
    const validated = updateRecipientSchema.parse(req.body);
    const recipient = await notificationService.updateRecipient(id, validated);
    res.status(200).json({ success: true, message: 'Nomor penerima berhasil diupdate', data: recipient });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
  }
};

export const deleteRecipient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid id parameter' });
    }
    await notificationService.deleteRecipient(id);
    res.status(200).json({ success: true, message: 'Nomor penerima berhasil dihapus' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendTestMessage = async (req: Request, res: Response) => {
  try {
    const { phone, message } = testMessageSchema.parse(req.body);
    await notificationService.sendTestMessage(phone, message);
    res.status(200).json({ success: true, message: `Pesan uji coba berhasil dikirim ke ${phone}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
  }
};