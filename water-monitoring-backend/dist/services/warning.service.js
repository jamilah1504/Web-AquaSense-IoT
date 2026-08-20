"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWarnings = void 0;
const client_1 = require("@prisma/client");
const notification_service_1 = require("./notification.service");
const prisma = new client_1.PrismaClient();
const processWarnings = async (deviceId, readingId, analysis) => {
    const parameters = ['PH', 'TURBIDITY', 'TDS', 'TEMPERATURE'];
    const generatedWarnings = [];
    for (const param of parameters) {
        const paramKey = param.toLowerCase();
        const result = analysis[paramKey];
        if (!result || result.status === 'NORMAL')
            continue;
        const activeWarning = await prisma.warning.findFirst({
            where: { deviceId, parameter: param, status: 'ACTIVE' },
        });
        // Jika tidak ada warning aktif, buat warning baru
        if (!activeWarning) {
            // Ambil data threshold untuk referensi (batas mana yang dilewati)
            const threshold = await prisma.threshold.findUnique({ where: { parameter: param } });
            let thresholdLimit = 0;
            if (result.status === 'CRITICAL') {
                thresholdLimit = (threshold?.criticalMax !== null && result.value >= threshold.criticalMax)
                    ? threshold.criticalMax
                    : (threshold?.criticalMin || 0);
            }
            else {
                thresholdLimit = (threshold?.warningMax !== null && result.value >= threshold.warningMax)
                    ? threshold.warningMax
                    : (threshold?.warningMin || 0);
            }
            // PHASE 12: Buat Warning Baru
            const newWarning = await prisma.warning.create({
                data: {
                    deviceId,
                    readingId,
                    parameter: param,
                    value: result.value,
                    threshold: thresholdLimit,
                    severity: result.status,
                    message: `Nilai ${param} mencapai ${result.value}. Melewati batas ${result.status} (${thresholdLimit}).`,
                    status: 'ACTIVE',
                },
            });
            generatedWarnings.push(newWarning);
            // 👇 Panggil fungsi notifikasi untuk warning yang baru dibuat 👇
            // Menggunakan void untuk menjalankannya secara asynchronous di background
            // agar tidak memperlambat respons API IoT
            void (0, notification_service_1.sendWarningNotification)(newWarning);
        }
    }
    return generatedWarnings;
};
exports.processWarnings = processWarnings;
