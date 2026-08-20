import { z } from 'zod';

export const updateConfigSchema = z.object({
  isEnabled: z.boolean().optional(),
  triggerOnWarning: z.boolean().optional(),
  triggerOnCritical: z.boolean().optional(),
  triggerOnSensorOffline: z.boolean().optional(),
  triggerOnDeviceOffline: z.boolean().optional(),
  cooldownMinutes: z.number().int().min(1).max(1440).optional(),
});

export const addRecipientSchema = z.object({
  name: z.string().min(1, 'Nama penerima wajib diisi'),
  phone: z.string().min(8, 'Nomor telepon tidak valid'),
  role: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateRecipientSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().min(8).optional(),
  role: z.string().optional(),
});

export const testMessageSchema = z.object({
  phone: z.string().min(8, 'Nomor telepon tidak valid'),
  message: z.string().min(1, 'Pesan tidak boleh kosong'),
});