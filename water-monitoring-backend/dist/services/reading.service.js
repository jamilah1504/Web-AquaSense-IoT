"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadingHistory = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ... (biarkan fungsi saveSensorReading yang sudah ada di atas)
const getReadingHistory = async (filters) => {
    const { page, limit, deviceId, startDate, endDate } = filters;
    const skip = (page - 1) * limit;
    // Bangun query dinamis berdasarkan filter yang dikirim frontend
    const where = {};
    if (deviceId) {
        where.deviceId = deviceId;
    }
    if (startDate || endDate) {
        where.timestamp = {};
        if (startDate)
            where.timestamp.gte = new Date(startDate); // gte = Greater Than or Equal
        if (endDate)
            where.timestamp.lte = new Date(endDate); // lte = Less Than or Equal
    }
    // Gunakan Promise.all agar perhitungan total dan pengambilan data berjalan paralel (lebih cepat)
    const [total, data] = await Promise.all([
        prisma.sensorReading.count({ where }),
        prisma.sensorReading.findMany({
            where,
            skip,
            take: limit,
            orderBy: { timestamp: 'desc' }, // Selalu urutkan dari yang paling baru
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
