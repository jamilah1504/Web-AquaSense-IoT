"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoryQuerySchema = exports.createReadingSchema = void 0;
const zod_1 = require("zod");
// 1. Validasi untuk data yang dikirim oleh perangkat IoT
exports.createReadingSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1, 'Device ID wajib diisi'),
    ph: zod_1.z.number().min(0).max(14),
    turbidity: zod_1.z.number().min(0),
    tds: zod_1.z.number().min(0),
    temperature: zod_1.z.number(),
});
// 2. Validasi untuk parameter URL (Query) pada History API
exports.getHistoryQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => (val ? parseInt(val) : 1)),
    limit: zod_1.z.string().optional().transform(val => (val ? parseInt(val) : 20)),
    deviceId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
