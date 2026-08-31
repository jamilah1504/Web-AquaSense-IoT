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
exports.deleteDevice = exports.updateDevice = exports.createDevice = exports.getDevice = exports.getDevices = void 0;
const deviceService = __importStar(require("../services/device.service"));
const device_validator_1 = require("../validators/device.validator");
const getDevices = async (req, res) => {
    try {
        const devices = await deviceService.getAllDevices();
        res.status(200).json({ success: true, data: devices });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDevices = getDevices;
const getDevice = async (req, res) => {
    try {
        const device = await deviceService.getDeviceById(String(req.params.id));
        res.status(200).json({ success: true, data: device });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
exports.getDevice = getDevice;
const createDevice = async (req, res) => {
    try {
        const validatedData = device_validator_1.createDeviceSchema.parse(req.body);
        const device = await deviceService.createDevice(validatedData);
        res.status(201).json({ success: true, message: 'Device berhasil ditambahkan', data: device });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
    }
};
exports.createDevice = createDevice;
const updateDevice = async (req, res) => {
    try {
        const validatedData = device_validator_1.updateDeviceSchema.parse(req.body);
        const device = await deviceService.updateDevice(String(req.params.id), validatedData);
        res.status(200).json({ success: true, message: 'Device berhasil diupdate', data: device });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
    }
};
exports.updateDevice = updateDevice;
const deleteDevice = async (req, res) => {
    try {
        await deviceService.deleteDevice(String(req.params.id));
        res.status(200).json({ success: true, message: 'Device berhasil dihapus' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteDevice = deleteDevice;
