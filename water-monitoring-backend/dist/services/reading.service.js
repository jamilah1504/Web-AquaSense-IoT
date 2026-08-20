"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadingHistory = exports.saveSensorReading = void 0;
const client_1 = require("@prisma/client");
const quality_service_1 = require("./quality.service");
// import { processWarnings } from './warning.service';
const socket_handler_1 = require("../socket/socket.handler");
const prisma = new client_1.PrismaClient();
// FUNGSI 1: Menyimpan data dari IoT
const saveSensorReading = async (data) => {
    const device = await prisma.device.findUnique({ where: { deviceId: data.deviceId } });
    if (!device)
        throw new Error(`Device dengan ID ${data.deviceId} tidak ditemukan`);
    // Simpan data pembacaan
    const reading = await prisma.sensorReading.create({
        data: {
            deviceId: data.deviceId,
            ph: data.ph,
            turbidity: data.turbidity,
            tds: data.tds,
            temperature: data.temperature,
        }
    });
    // Perbarui status alat menjadi online
    await prisma.device.update({
        where: { deviceId: data.deviceId },
        data: { lastSeen: new Date(), status: 'ONLINE' }
    });
    // Lakukan analisis
    const analysis = await (0, quality_service_1.analyzeQuality)({
        ph: data.ph,
        turbidity: data.turbidity,
        tds: data.tds,
        temperature: data.temperature
    });
    // Proses warning (Cek duplikasi & Trigger Notifikasi WhatsApp)
    // const newWarnings = await processWarnings(data.deviceId, reading.id, analysis);
    // Pancarkan (Emit) data terbaru ke Frontend via Socket.IO
    try {
        (0, socket_handler_1.getIO)().emit('sensor:update', {
            deviceId: data.deviceId,
            timestamp: reading.timestamp,
            ph: data.ph,
            turbidity: data.turbidity,
            tds: data.tds,
            temperature: data.temperature,
            overallStatus: analysis.overallStatus
        });
    }
    catch (err) {
        // Abaikan jika socket belum siap, agar tidak mengganggu operasional IoT
    }
    return {
        readingId: reading.id,
        timestamp: reading.timestamp,
        deviceId: data.deviceId,
        analysis
        // newWarnings 
    };
};
exports.saveSensorReading = saveSensorReading;
// FUNGSI 2: Mengambil riwayat untuk API Frontend (History)
const getReadingHistory = async (filters) => {
    const { page, limit, deviceId, startDate, endDate } = filters;
    const skip = (page - 1) * limit;
    const where = {};
    if (deviceId) {
        where.deviceId = deviceId;
    }
    if (startDate || endDate) {
        where.timestamp = {};
        if (startDate)
            where.timestamp.gte = new Date(startDate);
        if (endDate)
            where.timestamp.lte = new Date(endDate);
    }
    const [total, data] = await Promise.all([
        prisma.sensorReading.count({ where }),
        prisma.sensorReading.findMany({
            where,
            skip,
            take: limit,
            orderBy: { timestamp: 'desc' },
        }),
    ]);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getReadingHistory = getReadingHistory;
