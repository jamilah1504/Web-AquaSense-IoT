import { PrismaClient, SensorType } from '@prisma/client';

const prisma = new PrismaClient();

export type Status = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface AnalysisResult {
  value: number;
  status: Status;
}

export const analyzeQuality = async (readings: {
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
}) => {
  // Ambil semua batas threshold dari database
  const thresholds = await prisma.threshold.findMany();
  
  // Fungsi internal untuk mengevaluasi satu parameter
  const evaluateParameter = (parameter: SensorType, value: number): Status => {
    const threshold = thresholds.find(t => t.parameter === parameter);
    if (!threshold) return 'NORMAL'; // Jika belum diatur, anggap normal

    // Cek batas CRITICAL terlebih dahulu
    if (
      (threshold.criticalMax !== null && value >= threshold.criticalMax) ||
      (threshold.criticalMin !== null && value <= threshold.criticalMin)
    ) {
      return 'CRITICAL';
    }

    // Jika tidak critical, cek batas WARNING
    if (
      (threshold.warningMax !== null && value >= threshold.warningMax) ||
      (threshold.warningMin !== null && value <= threshold.warningMin)
    ) {
      return 'WARNING';
    }

    return 'NORMAL';
  };

  // Lakukan analisis untuk ke-4 parameter
  const result = {
    ph: { value: readings.ph, status: evaluateParameter('PH', readings.ph) },
    turbidity: { value: readings.turbidity, status: evaluateParameter('TURBIDITY', readings.turbidity) },
    tds: { value: readings.tds, status: evaluateParameter('TDS', readings.tds) },
    temperature: { value: readings.temperature, status: evaluateParameter('TEMPERATURE', readings.temperature) }
  };

  // Penentuan Overall Status (PHASE 11)
  const allStatuses = [result.ph.status, result.turbidity.status, result.tds.status, result.temperature.status];
  
  let overallStatus: Status = 'NORMAL';
  if (allStatuses.includes('CRITICAL')) {
    overallStatus = 'CRITICAL'; // Jika ada 1 saja yang Critical, maka sistem Critical
  } else if (allStatuses.includes('WARNING')) {
    overallStatus = 'WARNING';  // Jika tidak ada Critical tapi ada Warning
  }

  return {
    ...result,
    overallStatus
  };
};