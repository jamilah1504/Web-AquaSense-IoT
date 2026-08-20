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
exports.notifyForWarning = exports.sendTestMessage = exports.deleteRecipient = exports.updateRecipient = exports.addRecipient = exports.updateNotificationConfig = exports.getNotificationSettings = void 0;
const client_1 = require("@prisma/client");
const fonnteService = __importStar(require("./fonnte.service"));
const prisma = new client_1.PrismaClient();
const getNotificationSettings = async () => {
    let config = await prisma.notificationConfig.findFirst();
    if (!config) {
        config = await prisma.notificationConfig.create({
            data: {
                isEnabled: true,
                triggerOnWarning: true,
                triggerOnCritical: true,
                triggerOnSensorOffline: false,
                triggerOnDeviceOffline: true,
                cooldownMinutes: 15,
            },
        });
    }
    const recipients = await prisma.notificationRecipient.findMany({
        orderBy: { createdAt: 'asc' },
    });
    return { ...config, recipients };
};
exports.getNotificationSettings = getNotificationSettings;
const updateNotificationConfig = async (data) => {
    const existing = await prisma.notificationConfig.findFirst();
    if (!existing)
        return prisma.notificationConfig.create({ data: data });
    return prisma.notificationConfig.update({ where: { id: existing.id }, data });
};
exports.updateNotificationConfig = updateNotificationConfig;
const addRecipient = async (data) => prisma.notificationRecipient.create({ data });
exports.addRecipient = addRecipient;
const updateRecipient = async (id, data) => prisma.notificationRecipient.update({ where: { id }, data });
exports.updateRecipient = updateRecipient;
const deleteRecipient = async (id) => prisma.notificationRecipient.delete({ where: { id } });
exports.deleteRecipient = deleteRecipient;
const sendTestMessage = async (phone, message) => fonnteService.sendFonnteMessage(phone, message);
exports.sendTestMessage = sendTestMessage;
const notifyForWarning = async (warning) => {
    const config = await (0, exports.getNotificationSettings)();
    if (!config.isEnabled)
        return;
    if (warning.severity === 'WARNING' && !config.triggerOnWarning)
        return;
    if (warning.severity === 'CRITICAL' && !config.triggerOnCritical)
        return;
    const cooldownSince = new Date(Date.now() - config.cooldownMinutes * 60 * 1000);
    const recentLog = await prisma.notificationLog.findFirst({
        where: {
            createdAt: { gte: cooldownSince },
            warning: { deviceId: warning.deviceId, parameter: warning.parameter },
        },
        orderBy: { createdAt: 'desc' },
    });
    if (recentLog)
        return;
    const activeRecipients = config.recipients.filter((r) => r.isActive);
    for (const recipient of activeRecipients) {
        const log = await prisma.notificationLog.create({
            data: { recipient: recipient.phone, message: warning.message, status: 'PENDING', warningId: warning.id },
        });
        try {
            await fonnteService.sendFonnteMessage(recipient.phone, warning.message);
            await prisma.notificationLog.update({ where: { id: log.id }, data: { status: 'SENT', sentAt: new Date() } });
        }
        catch (err) {
            await prisma.notificationLog.update({ where: { id: log.id }, data: { status: 'FAILED', errorMessage: err.message } });
        }
    }
};
exports.notifyForWarning = notifyForWarning;
