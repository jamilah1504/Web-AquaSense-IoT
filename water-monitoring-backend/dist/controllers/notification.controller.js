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
exports.sendTestMessage = exports.deleteRecipient = exports.updateRecipient = exports.addRecipient = exports.updateNotificationConfig = exports.getNotificationSettings = void 0;
const notificationService = __importStar(require("../services/notification.service"));
const notification_validator_1 = require("../validators/notification.validator");
const getNotificationSettings = async (req, res) => {
    try {
        const data = await notificationService.getNotificationSettings();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getNotificationSettings = getNotificationSettings;
const updateNotificationConfig = async (req, res) => {
    try {
        const validated = notification_validator_1.updateConfigSchema.parse(req.body);
        const config = await notificationService.updateNotificationConfig(validated);
        res.status(200).json({ success: true, message: 'Konfigurasi notifikasi berhasil diupdate', data: config });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
    }
};
exports.updateNotificationConfig = updateNotificationConfig;
const addRecipient = async (req, res) => {
    try {
        const validated = notification_validator_1.addRecipientSchema.parse(req.body);
        const recipient = await notificationService.addRecipient(validated);
        res.status(201).json({ success: true, message: 'Nomor penerima berhasil ditambahkan', data: recipient });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
    }
};
exports.addRecipient = addRecipient;
const updateRecipient = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid id parameter' });
        }
        const validated = notification_validator_1.updateRecipientSchema.parse(req.body);
        const recipient = await notificationService.updateRecipient(id, validated);
        res.status(200).json({ success: true, message: 'Nomor penerima berhasil diupdate', data: recipient });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
    }
};
exports.updateRecipient = updateRecipient;
const deleteRecipient = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid id parameter' });
        }
        await notificationService.deleteRecipient(id);
        res.status(200).json({ success: true, message: 'Nomor penerima berhasil dihapus' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteRecipient = deleteRecipient;
const sendTestMessage = async (req, res) => {
    try {
        const { phone, message } = notification_validator_1.testMessageSchema.parse(req.body);
        await notificationService.sendTestMessage(phone, message);
        res.status(200).json({ success: true, message: `Pesan uji coba berhasil dikirim ke ${phone}` });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.errors ? error.errors[0].message : error.message });
    }
};
exports.sendTestMessage = sendTestMessage;
