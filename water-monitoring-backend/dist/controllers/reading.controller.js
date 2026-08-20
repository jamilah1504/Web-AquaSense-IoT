"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.receiveIoTData = void 0;
const readingService = __importStar(require("../services/reading.service"));
const reading_validator_1 = require("../validators/reading.validator");
// 1. Fungsi untuk menerima data dari IoT (ESP32)
const receiveIoTData = async (req, res) => {
    try {
        const validatedData = reading_validator_1.createReadingSchema.parse(req.body);
        const result = await readingService.saveSensorReading(validatedData);
        res.status(201).json({
            success: true,
            message: 'Data sensor berhasil disimpan',
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.errors ? error.errors[0].message : error.message
        });
    }
};
exports.receiveIoTData = receiveIoTData;
// 2. Fungsi untuk mengambil riwayat data (Frontend)
const getHistory = async (req, res) => {
    try {
        const filters = reading_validator_1.getHistoryQuerySchema.parse(req.query);
        const result = await readingService.getReadingHistory(filters);
        res.status(200).json({
            success: true,
            message: 'Riwayat pembacaan sensor berhasil diambil',
            ...result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.errors ? error.errors[0].message : error.message
        });
    }
};
exports.getHistory = getHistory;
