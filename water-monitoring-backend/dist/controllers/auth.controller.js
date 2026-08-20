"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.me = exports.login = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
const login = async (req, res) => {
    try {
        const validatedData = auth_validator_1.loginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginUser)(validatedData.email, validatedData.password);
        res.status(200).json({
            success: true,
            message: 'Login berhasil',
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
exports.login = login;
const me = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new Error('User ID tidak ditemukan');
        const user = await (0, auth_service_1.getUserById)(userId);
        res.status(200).json({
            success: true,
            message: 'Data user berhasil diambil',
            data: { user }
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};
exports.me = me;
const logout = (req, res) => {
    // JWT bersifat stateless, jadi logout biasanya cukup menghapus token di sisi frontend (React)
    res.status(200).json({
        success: true,
        message: 'Logout berhasil'
    });
};
exports.logout = logout;
