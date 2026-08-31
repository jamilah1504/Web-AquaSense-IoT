"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateThresholdSchema = void 0;
const zod_1 = require("zod");
exports.updateThresholdSchema = zod_1.z.object({
    warningMin: zod_1.z.number().nullable().optional(),
    warningMax: zod_1.z.number().nullable().optional(),
    criticalMin: zod_1.z.number().nullable().optional(),
    criticalMax: zod_1.z.number().nullable().optional(),
});
