"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveWarning = exports.getWarnings = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Ambil semua daftar warning/alert
const getWarnings = async (req, res) => {
    try {
        const warnings = await prisma.warning.findMany({
            include: {
                device: true,
                notificationLogs: true
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Ambil 100 data terbaru
        });
        const getAggregatedWaStatus = (logs) => {
            if (logs.length === 0)
                return 'pending';
            if (logs.some(l => l.status === 'FAILED'))
                return 'failed';
            if (logs.every(l => l.status === 'SENT'))
                return 'sent';
            return 'pending';
        };
        // Format agar sesuai dengan struktur UI Frontend Anda
        const formattedWarnings = warnings.map(w => ({
            id: w.id,
            deviceId: w.deviceId,
            deviceName: w.device?.name || 'Sensor Tandon Utama',
            sensorName: w.parameter,
            parameter: w.parameter,
            currentValue: w.value,
            threshold: w.threshold,
            level: w.severity.toLowerCase(), // 'warning' atau 'critical'
            message: w.message,
            status: w.status.toLowerCase(), // 'active' atau 'resolved'
            timestamp: new Date(w.createdAt).toLocaleString('id-ID'),
            whatsappStatus: getAggregatedWaStatus(w.notificationLogs)
        }));
        res.status(200).json({
            success: true,
            message: 'Data warning berhasil diambil',
            data: formattedWarnings
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWarnings = getWarnings;
// Tandai warning sebagai selesai (resolved)
const resolveWarning = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await prisma.warning.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date()
            }
        });
        res.status(200).json({
            success: true,
            message: 'Warning berhasil diselesaikan',
            data: updated
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.resolveWarning = resolveWarning;
