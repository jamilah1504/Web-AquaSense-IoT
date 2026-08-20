import { z } from 'zod';

export const createDeviceSchema = z.object({
  deviceId: z.string().min(3, 'Device ID minimal 3 karakter'),
  name: z.string().min(3, 'Nama device minimal 3 karakter'),
  status: z.enum(['ONLINE', 'OFFLINE']).optional(),
  firmwareVersion: z.string().optional(),
});

export const updateDeviceSchema = createDeviceSchema.partial();