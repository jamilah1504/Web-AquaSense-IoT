import { PrismaClient } from '@prisma/client';
import * as fonnteService from './fonnte.service';

const prisma = new PrismaClient();
export const getNotificationSettings = async () => {
  let config = await prisma.notificationConfig.findFirst();

  if (!config) {
    config = await prisma.notificationConfig.create({
      data: {
        isEnabled: true,
        triggerOnWarning: true,
        triggerOnCritical: true,
        triggerOnSensorOffline: false,
        triggerOnDeviceOffline: true,
        cooldownMinutes: 15,
      },
    });
  }

  const recipients = await prisma.notificationRecipient.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return { ...config, recipients };
};

export const updateNotificationConfig = async (
  data: Partial<{
    isEnabled: boolean;
    triggerOnWarning: boolean;
    triggerOnCritical: boolean;
    triggerOnSensorOffline: boolean;
    triggerOnDeviceOffline: boolean;
    cooldownMinutes: number;
  }>
) => {
  const existing = await prisma.notificationConfig.findFirst();
  if (!existing) return prisma.notificationConfig.create({ data: data as any });
  return prisma.notificationConfig.update({ where: { id: existing.id }, data });
};

export const addRecipient = async (data: { name: string; phone: string; role?: string; isActive?: boolean }) =>
  prisma.notificationRecipient.create({ data });

export const updateRecipient = async (
  id: string,
  data: Partial<{ name: string; phone: string; role: string; isActive: boolean }>
) => prisma.notificationRecipient.update({ where: { id }, data });

export const deleteRecipient = async (id: string) => prisma.notificationRecipient.delete({ where: { id } });

export const sendTestMessage = async (phone: string, message: string) =>
  fonnteService.sendFonnteMessage(phone, message);


export const notifyForWarning = async (warning: {
  id: string; parameter: string; severity: 'WARNING' | 'CRITICAL'; message: string; deviceId: string;
}) => {
  const config = await getNotificationSettings();
  if (!config.isEnabled) return;
  if (warning.severity === 'WARNING' && !config.triggerOnWarning) return;
  if (warning.severity === 'CRITICAL' && !config.triggerOnCritical) return;

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