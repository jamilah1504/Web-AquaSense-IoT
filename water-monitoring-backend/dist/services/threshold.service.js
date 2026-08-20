"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateThreshold = exports.getThresholdByParameter = exports.getAllThresholds = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllThresholds = async () => {
    return prisma.threshold.findMany();
};
exports.getAllThresholds = getAllThresholds;
const getThresholdByParameter = async (parameter) => {
    const threshold = await prisma.threshold.findUnique({
        where: { parameter }
    });
    if (!threshold) {
        throw new Error(`Threshold untuk parameter ${parameter} tidak ditemukan`);
    }
    return threshold;
};
exports.getThresholdByParameter = getThresholdByParameter;
const updateThreshold = async (parameter, data) => {
    // Pastikan parameter tersebut ada sebelum diupdate
    await (0, exports.getThresholdByParameter)(parameter);
    return prisma.threshold.update({
        where: { parameter },
        data,
    });
};
exports.updateThreshold = updateThreshold;
