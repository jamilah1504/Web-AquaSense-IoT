"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = void 0;
const client_1 = require("@prisma/client");
const quality_service_1 = require("./quality.service");
const prisma = new client_1.PrismaClient();
const getDashboardSummary = async (requestedDeviceId) => {
    // 1. Cari device (Gunakan yang diminta, atau ambil device pertama sebagai default)
    const device = requestedDeviceId
        ? await prisma.device.findUnique({ where: { deviceId: requestedDeviceId } })
        : await prisma.device.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!device) {
        throw new Error('Tidak ada device yang ditemukan');
    }
    // 2. Ambil data pembacaan sensor paling terakhir
    const latestReading = await prisma.sensorReading.findFirst({
        where: { deviceId: device.deviceId },
        orderBy: { timestamp: 'desc' },
    });
    // 3. Ambil warning yang statusnya masih ACTIVE
    const activeWarnings = await prisma.warning.findMany({
        where: {
            deviceId: device.deviceId,
            status: 'ACTIVE'
        },
        orderBy: { createdAt: 'desc' },
    });
    // 4. Hitung ulang status kualitas air berdasarkan data terakhir
    let analysis = null;
    if (latestReading) {
        analysis = await (0, quality_service_1.analyzeQuality)({
            ph: latestReading.ph,
            turbidity: latestReading.turbidity,
            tds: latestReading.tds,
            temperature: latestReading.temperature,
        });
    }
    // 5. Susun format respons yang mudah dibaca oleh Frontend React
    return {
        device: {
            deviceId: device.deviceId,
            name: device.name,
            status: device.status,
            lastSeen: device.lastSeen,
        },
        overallStatus: analysis ? analysis.overallStatus : 'UNKNOWN',
        latestReading: latestReading ? {
            timestamp: latestReading.timestamp,
            ph: analysis?.ph,
            turbidity: analysis?.turbidity,
            tds: analysis?.tds,
            temperature: analysis?.temperature,
        } : null,
        activeWarnings,
    };
};
exports.getDashboardSummary = getDashboardSummary;
