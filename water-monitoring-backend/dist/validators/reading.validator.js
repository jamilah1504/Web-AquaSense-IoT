"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoryQuerySchema = void 0;
const zod_1 = require("zod");
exports.getHistoryQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => (val ? parseInt(val) : 1)),
    limit: zod_1.z.string().optional().transform(val => (val ? parseInt(val) : 20)),
    deviceId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
