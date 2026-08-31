"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const getDashboard = async (req, res) => {
    try {
        // Ambil query ?deviceId=WATER-001 jika frontend mengirimkannya
        const deviceId = req.query.deviceId;
        const summary = await (0, dashboard_service_1.getDashboardSummary)(deviceId);
        res.status(200).json({
            success: true,
            message: 'Data dashboard berhasil diambil',
            data: summary
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getDashboard = getDashboard;
