"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWarningNotification = void 0;
const client_1 = require("@prisma/client");
const whatsapp_provider_1 = require("./whatsapp.provider");
const env_1 = require("../config/env");
const prisma = new client_1.PrismaClient();
const sendWarningNotification = async (warning) => {
    const recipient = env_1.env.WHATSAPP_PHONE_NUMBER;
    // 1. Cek Cooldown (Mencegah Spam Notifikasi)
    const lastLog = await prisma.notificationLog.findFirst({
        where: {
            warningId: warning.id,
            status: 'SENT'
        },
        orderBy: { createdAt: 'desc' }
    });
    if (lastLog) {
        const timeDiffMinutes = (new Date().getTime() - lastLog.createdAt.getTime()) / (1000 * 60);
        if (timeDiffMinutes < env_1.env.NOTIFICATION_COOLDOWN_MINUTES) {
            return; // Batalkan pengiriman jika masih dalam masa cooldown
        }
    }
    // 2. Format Pesan
    const unit = warning.parameter === 'PH' ? 'pH'
        : warning.parameter === 'TURBIDITY' ? 'NTU'
            : warning.parameter === 'TDS' ? 'ppm'
                : '°C';
    // Format tanggal: DD/MM/YYYY HH:MM
    const dateObj = new Date();
    const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
    const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
    const message = `⚠️ WARNING KUALITAS AIR\n\nDevice:\n${warning.deviceId}\n\nParameter:\n${warning.parameter}\n\nNilai:\n${warning.value} ${unit}\n\nBatas:\n${warning.threshold} ${unit}\n\nStatus:\n${warning.severity}\n\nWaktu:\n${dateStr} ${timeStr}\n\nMohon segera dilakukan pemeriksaan.`;
    // 3. Simpan Log Awal (PENDING)
    const log = await prisma.notificationLog.create({
        data: {
            warningId: warning.id,
            channel: 'WHATSAPP',
            recipient,
            message,
            status: 'PENDING'
        }
    });
    // 4. Kirim Pesan via Provider
    const isSuccess = await (0, whatsapp_provider_1.sendWhatsAppMessage)(recipient, message);
    // 5. Update Status Log
    await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
            status: isSuccess ? 'SENT' : 'FAILED',
            sentAt: isSuccess ? new Date() : null,
        }
    });
};
exports.sendWarningNotification = sendWarningNotification;
