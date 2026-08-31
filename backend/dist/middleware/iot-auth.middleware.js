"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDeviceToken = void 0;
const env_1 = require("../config/env");
const verifyDeviceToken = (req, res, next) => {
    const deviceToken = req.headers['x-device-token'];
    if (!deviceToken || deviceToken !== env_1.env.DEVICE_API_SECRET) {
        res.status(401).json({
            success: false,
            message: 'Akses IoT ditolak. Token perangkat tidak valid.'
        });
        return;
    }
    next();
};
exports.verifyDeviceToken = verifyDeviceToken;
