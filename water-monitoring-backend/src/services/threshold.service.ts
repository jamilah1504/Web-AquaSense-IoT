import { PrismaClient, SensorType } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllThresholds = async () => {
  return prisma.threshold.findMany();
};

export const getThresholdByParameter = async (parameter: SensorType) => {
  const threshold = await prisma.threshold.findUnique({ 
    where: { parameter } 
  });
  
  if (!threshold) {
    throw new Error(`Threshold untuk parameter ${parameter} tidak ditemukan`);
  }
  return threshold;
};

export const updateThreshold = async (
  parameter: SensorType, 
  data: {
    warningMin?: number | null;
    warningMax?: number | null;
    criticalMin?: number | null;
    criticalMax?: number | null;
  }
) => {
  // Pastikan parameter tersebut ada sebelum diupdate
  await getThresholdByParameter(parameter); 
  
  return prisma.threshold.update({
    where: { parameter },
    data,
  });
};