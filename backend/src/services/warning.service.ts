import { PrismaClient } from '@prisma/client';
import { getIO } from '../socket/socket.handler';

const prisma = new PrismaClient();
import * as notificationService from './notification.service';
import * as fonnteService from './fonnte.service';

type ParamKey = 'PH' | 'TURBIDITY' | 'TDS' | 'TEMPERATURE';

const PARAM_UNITS: Record<ParamKey, string> = {
  PH: '', TURBIDITY: 'NTU', TDS: 'ppm', TEMPERATURE: '°C',
};

interface ReadingInput {
  id: string; deviceId: string; ph: number; turbidity: number; tds: number; temperature: number;
}

export const evaluateReadingAndNotify = async (reading: ReadingInput) => {
  const thresholds = await prisma.threshold.findMany();
  const device = await prisma.device.findUnique({ where: { deviceId: reading.deviceId } });

  const params: { parameter: ParamKey; value: number }[] = [
    { parameter: 'PH', value: reading.ph },
    { parameter: 'TURBIDITY', value: reading.turbidity },
    { parameter: 'TDS', value: reading.tds },
    { parameter: 'TEMPERATURE', value: reading.temperature },
  ];

  for (const p of params) {
    const threshold = thresholds.find((t) => t.parameter === p.parameter);
    if (!threshold) continue;

    const severity = getSeverity(p.value, threshold);
    if (!severity) continue; // masih normal, tidak perlu warning

    const limitValue =
      severity === 'CRITICAL'
        ? (threshold.criticalMax !== null && p.value > threshold.criticalMax ? threshold.criticalMax : threshold.criticalMin)
        : (threshold.warningMax !== null && p.value > threshold.warningMax ? threshold.warningMax : threshold.warningMin);

    const warning = await prisma.warning.create({
      data: {
        parameter: p.parameter,
        value: p.value,
        threshold: limitValue ?? 0,
        severity,
        message: buildWarningMessage(p.parameter, p.value, PARAM_UNITS[p.parameter], severity, device?.name ?? reading.deviceId),
        deviceId: reading.deviceId,
        readingId: reading.id,
      },
    });

    try {
      getIO().emit('new-warning', warning);
    } catch (err) {
      console.warn('Socket.IO belum aktif, skip broadcast realtime:', (err as Error).message);
    }

    await notificationService.notifyForWarning(warning);
  }
};

const getSeverity = (
  value: number,
  t: { warningMin: number | null; warningMax: number | null; criticalMin: number | null; criticalMax: number | null }
): 'WARNING' | 'CRITICAL' | null => {
  if ((t.criticalMin !== null && value < t.criticalMin) || (t.criticalMax !== null && value > t.criticalMax)) return 'CRITICAL';
  if ((t.warningMin !== null && value < t.warningMin) || (t.warningMax !== null && value > t.warningMax)) return 'WARNING';
  return null;
};

const buildWarningMessage = (parameter: string, value: number, unit: string, severity: string, deviceName: string) => {
  const label = severity === 'CRITICAL' ? 'Bahaya Kritis' : 'Peringatan';
  return `${label}: Parameter ${parameter} pada ${deviceName} terbaca ${value}${unit} di luar batas aman.`;
};

const dispatchWhatsAppIfNeeded = async (warning: {
  id: string; parameter: string; severity: 'WARNING' | 'CRITICAL'; message: string; deviceId: string;
}) => {
  const config = await notificationService.getNotificationSettings();
  if (!config.isEnabled) return;
  if (warning.severity === 'WARNING' && !config.triggerOnWarning) return;
  if (warning.severity === 'CRITICAL' && !config.triggerOnCritical) return;

  // Cegah spam: skip jika sudah ada notifikasi untuk parameter+device ini dalam masa cooldown
  const cooldownSince = new Date(Date.now() - config.cooldownMinutes * 60 * 1000);
  const recentLog = await prisma.notificationLog.findFirst({
    where: {
      createdAt: { gte: cooldownSince },
      warning: { deviceId: warning.deviceId, parameter: warning.parameter as any },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (recentLog) return;

  const activeRecipients = config.recipients.filter((r: any) => r.isActive);

  for (const recipient of activeRecipients) {
    const log = await prisma.notificationLog.create({
      data: { recipient: recipient.phone, message: warning.message, status: 'PENDING', warningId: warning.id },
    });

    try {
      await fonnteService.sendFonnteMessage(recipient.phone, warning.message);
      await prisma.notificationLog.update({ where: { id: log.id }, data: { status: 'SENT', sentAt: new Date() } });
    } catch (err: any) {
      await prisma.notificationLog.update({ where: { id: log.id }, data: { status: 'FAILED', errorMessage: err.message } });
    }
  }
};