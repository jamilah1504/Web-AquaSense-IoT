"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded; // Simpan data token ke dalam request
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' });
        return;
    }
};
exports.authenticate = authenticate;
