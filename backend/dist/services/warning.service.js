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
exports.evaluateReadingAndNotify = void 0;
const client_1 = require("@prisma/client");
const socket_handler_1 = require("../socket/socket.handler");
const prisma = new client_1.PrismaClient();
const notificationService = __importStar(require("./notification.service"));
const fonnteService = __importStar(require("./fonnte.service"));
const PARAM_UNITS = {
    PH: '', TURBIDITY: 'NTU', TDS: 'ppm', TEMPERATURE: '°C',
};
const evaluateReadingAndNotify = async (reading) => {
    const thresholds = await prisma.threshold.findMany();
    const device = await prisma.device.findUnique({ where: { deviceId: reading.deviceId } });
    const params = [
        { parameter: 'PH', value: reading.ph },
        { parameter: 'TURBIDITY', value: reading.turbidity },
        { parameter: 'TDS', value: reading.tds },
        { parameter: 'TEMPERATURE', value: reading.temperature },
    ];
    for (const p of params) {
        const threshold = thresholds.find((t) => t.parameter === p.parameter);
        if (!threshold)
            continue;
        const severity = getSeverity(p.value, threshold);
        if (!severity)
            continue; // masih normal, tidak perlu warning
        const limitValue = severity === 'CRITICAL'
            ? (threshold.criticalMax !== null && p.value > threshold.criticalMax ? threshold.criticalMax : threshold.criticalMin)
            : (threshold.warningMax !== null && p.value > threshold.warningMax ? threshold.warningMax : threshold.warningMin);
        const warning = await prisma.warning.create({
            data: {
                parameter: p.parameter,
                value: p.value,
                threshold: limitValue ?? 0,
                severity,
                message: buildWarningMessage(p.parameter, p.value, PARAM_UNITS[p.parameter], severity, device?.name ?? reading.deviceId),
                deviceId: reading.deviceId,
                readingId: reading.id,
            },
        });
        try {
            (0, socket_handler_1.getIO)().emit('new-warning', warning);
        }
        catch (err) {
            console.warn('Socket.IO belum aktif, skip broadcast realtime:', err.message);
        }
        await notificationService.notifyForWarning(warning);
    }
};
exports.evaluateReadingAndNotify = evaluateReadingAndNotify;
const getSeverity = (value, t) => {
    if ((t.criticalMin !== null && value < t.criticalMin) || (t.criticalMax !== null && value > t.criticalMax))
        return 'CRITICAL';
    if ((t.warningMin !== null && value < t.warningMin) || (t.warningMax !== null && value > t.warningMax))
        return 'WARNING';
    return null;
};
const buildWarningMessage = (parameter, value, unit, severity, deviceName) => {
    const label = severity === 'CRITICAL' ? 'Bahaya Kritis' : 'Peringatan';
    return `${label}: Parameter ${parameter} pada ${deviceName} terbaca ${value}${unit} di luar batas aman.`;
};
const dispatchWhatsAppIfNeeded = async (warning) => {
    const config = await notificationService.getNotificationSettings();
    if (!config.isEnabled)
        return;
    if (warning.severity === 'WARNING' && !config.triggerOnWarning)
        return;
    if (warning.severity === 'CRITICAL' && !config.triggerOnCritical)
        return;
    // Cegah spam: skip jika sudah ada notifikasi untuk parameter+device ini dalam masa cooldown
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
