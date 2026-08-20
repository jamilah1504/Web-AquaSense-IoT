import { z } from 'zod';

// 1. Validasi untuk data yang dikirim oleh perangkat IoT
export const createReadingSchema = z.object({
  deviceId: z.string().min(1, 'Device ID wajib diisi'),
  ph: z.number().min(0).max(14),
  turbidity: z.number().min(0),
  tds: z.number().min(0),
  temperature: z.number(),
});

// 2. Validasi untuk parameter URL (Query) pada History API
export const getHistoryQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 20)),
  deviceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});