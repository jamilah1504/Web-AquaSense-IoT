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
exports.updateThreshold = exports.getThreshold = exports.getThresholds = void 0;
const thresholdService = __importStar(require("../services/threshold.service"));
const threshold_validator_1 = require("../validators/threshold.validator");
const getThresholds = async (req, res) => {
    try {
        const thresholds = await thresholdService.getAllThresholds();
        res.status(200).json({ success: true, data: thresholds });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getThresholds = getThresholds;
const getThreshold = async (req, res) => {
    try {
        // Ubah parameter dari URL menjadi UPPERCASE agar sesuai dengan enum Prisma (cth: ph -> PH)
        const parameter = Array.isArray(req.params.parameter)
            ? req.params.parameter[0]
            : req.params.parameter;
        const param = parameter.toUpperCase();
        const threshold = await thresholdService.getThresholdByParameter(param);
        res.status(200).json({ success: true, data: threshold });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
exports.getThreshold = getThreshold;
const updateThreshold = async (req, res) => {
    try {
        const parameter = Array.isArray(req.params.parameter)
            ? req.params.parameter[0]
            : req.params.parameter;
        const param = parameter.toUpperCase();
        const validatedData = threshold_validator_1.updateThresholdSchema.parse(req.body);
        const threshold = await thresholdService.updateThreshold(param, validatedData);
        res.status(200).json({
            success: true,
            message: `Threshold ${param} berhasil diupdate`,
            data: threshold
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.errors ? error.errors[0].message : error.message
        });
    }
};
exports.updateThreshold = updateThreshold;
