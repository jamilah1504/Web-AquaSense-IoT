import { PrismaClient, SensorType, Severity } from '@prisma/client';
import { AnalysisResult } from './quality.service';
import { sendWarningNotification } from './notification.service';
import { getIO } from '../socket/socket.handler';

const prisma = new PrismaClient();

export const processWarnings = async (
  deviceId: string,
  readingId: string,
  analysis: any 
) => {
  const parameters: SensorType[] = ['PH', 'TURBIDITY', 'TDS', 'TEMPERATURE'];
  const generatedWarnings = [];

  for (const param of parameters) {
    const paramKey = param.toLowerCase();
    const result: AnalysisResult = analysis[paramKey];

    // Jika kualitas normal, lewati
    if (!result || result.status === 'NORMAL') continue;

    // Cek apakah sudah ada warning yang masih aktif untuk parameter & device ini
    const activeWarning = await prisma.warning.findFirst({
      where: { deviceId, parameter: param, status: 'ACTIVE' },
    });

    // Jika belum ada warning aktif, buat warning baru
    if (!activeWarning) {
      const threshold = await prisma.threshold.findUnique({ where: { parameter: param } });
      let thresholdLimit = 0;

      if (result.status === 'CRITICAL') {
        thresholdLimit = (threshold?.criticalMax !== null && result.value >= threshold!.criticalMax!) 
          ? threshold!.criticalMax! 
          : (threshold?.criticalMin || 0);
      } else {
        thresholdLimit = (threshold?.warningMax !== null && result.value >= threshold!.warningMax!) 
          ? threshold!.warningMax! 
          : (threshold?.warningMin || 0);
      }

      // Buat data warning di database
      const newWarning = await prisma.warning.create({
        data: {
          deviceId,
          readingId,
          parameter: param,
          value: result.value,
          threshold: thresholdLimit,
          severity: result.status as Severity,
          message: `Nilai ${param} mencapai ${result.value}. Melewati batas ${result.status} (${thresholdLimit}).`,
          status: 'ACTIVE',
        },
      });

      generatedWarnings.push(newWarning);

      // Trigger Notifikasi WhatsApp secara asynchronous di background
      void sendWarningNotification(newWarning); 

      // Pancarkan (Emit) Warning baru ke Frontend via Socket.IO
      try {
        getIO().emit('warning:new', newWarning);
      } catch (err) {}
    }
  }

  return generatedWarnings;
};