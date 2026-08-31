"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDevice = exports.updateDevice = exports.createDevice = exports.getDeviceById = exports.getAllDevices = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllDevices = async () => {
    return prisma.device.findMany({
        orderBy: { createdAt: 'desc' },
    });
};
exports.getAllDevices = getAllDevices;
const getDeviceById = async (id) => {
    const device = await prisma.device.findUnique({
        where: { id },
        include: { sensors: true } // Sekalian ambil data sensor yang menempel
    });
    if (!device)
        throw new Error('Device tidak ditemukan');
    return device;
};
exports.getDeviceById = getDeviceById;
const createDevice = async (data) => {
    // Cek apakah deviceId sudah dipakai
    const existingDevice = await prisma.device.findUnique({ where: { deviceId: data.deviceId } });
    if (existingDevice)
        throw new Error('Device ID sudah terdaftar');
    return prisma.device.create({ data });
};
exports.createDevice = createDevice;
const updateDevice = async (id, data) => {
    await (0, exports.getDeviceById)(id); // Pastikan device ada dulu
    return prisma.device.update({
        where: { id },
        data,
    });
};
exports.updateDevice = updateDevice;
const deleteDevice = async (id) => {
    await (0, exports.getDeviceById)(id); // Pastikan device ada
    return prisma.device.delete({ where: { id } });
};
exports.deleteDevice = deleteDevice;
