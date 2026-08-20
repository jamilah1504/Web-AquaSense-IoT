import { z } from 'zod';

export const updateThresholdSchema = z.object({
  warningMin: z.number().nullable().optional(),
  warningMax: z.number().nullable().optional(),
  criticalMin: z.number().nullable().optional(),
  criticalMax: z.number().nullable().optional(),
});