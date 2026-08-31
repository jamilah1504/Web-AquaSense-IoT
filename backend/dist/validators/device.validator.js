"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceSchema = exports.createDeviceSchema = void 0;
const zod_1 = require("zod");
exports.createDeviceSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(3, 'Device ID minimal 3 karakter'),
    name: zod_1.z.string().min(3, 'Nama device minimal 3 karakter'),
    status: zod_1.z.enum(['ONLINE', 'OFFLINE']).optional(),
    firmwareVersion: zod_1.z.string().optional(),
});
exports.updateDeviceSchema = exports.createDeviceSchema.partial();
