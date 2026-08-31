"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMessageSchema = exports.updateRecipientSchema = exports.addRecipientSchema = exports.updateConfigSchema = void 0;
const zod_1 = require("zod");
exports.updateConfigSchema = zod_1.z.object({
    isEnabled: zod_1.z.boolean().optional(),
    triggerOnWarning: zod_1.z.boolean().optional(),
    triggerOnCritical: zod_1.z.boolean().optional(),
    triggerOnSensorOffline: zod_1.z.boolean().optional(),
    triggerOnDeviceOffline: zod_1.z.boolean().optional(),
    cooldownMinutes: zod_1.z.number().int().min(1).max(1440).optional(),
});
exports.addRecipientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nama penerima wajib diisi'),
    phone: zod_1.z.string().min(8, 'Nomor telepon tidak valid'),
    role: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateRecipientSchema = zod_1.z.object({
    isActive: zod_1.z.boolean().optional(),
    name: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().min(8).optional(),
    role: zod_1.z.string().optional(),
});
exports.testMessageSchema = zod_1.z.object({
    phone: zod_1.z.string().min(8, 'Nomor telepon tidak valid'),
    message: zod_1.z.string().min(1, 'Pesan tidak boleh kosong'),
});
