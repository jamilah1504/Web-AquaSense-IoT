import { PrismaClient } from '@prisma/client';
import { analyzeQuality } from './quality.service';

const prisma = new PrismaClient();

export const getDashboardSummary = async (deviceId?: string) => {
  // 1. Ambil perangkat berdasarkan ID, atau ambil perangkat pertama yang ada
  let device;
  if (deviceId) {
    device = await prisma.device.findUnique({ where: { deviceId } });
  }
  
  if (!device) {
    device = await prisma.device.findFirst();
  }

  // Jika sama sekali belum ada device di database, kembalikan nilai aman
  if (!device) {
    return {
      overallWaterQuality: 'normal',
      qualityScore: 100,
      latestReading: null
    };
  }

  // 2. Ambil pembacaan sensor terakhir untuk device tersebut
  const latestReading = await prisma.sensorReading.findFirst({
    where: { deviceId: device.deviceId },
    orderBy: { createdAt: 'desc' }
  });

  return {
    device,
    overallWaterQuality: 'normal',
    qualityScore: 95,
    latestReading: latestReading || { ph: 7.0, turbidity: 1.0, tds: 200, temperature: 25.0 }
  };
};