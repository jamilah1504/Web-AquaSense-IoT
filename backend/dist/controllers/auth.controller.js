"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.updatePassword = exports.updateProfile = exports.me = exports.login = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
// ==========================================
// ENDPOINT: UPDATE PROFIL
// ==========================================
const updateProfile = async (req, res) => {
    try {
        // Gunakan fallback: cari 'id' atau 'userId' dari dalam token
        const userPayload = req.user;
        const userId = userPayload?.id || userPayload?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Akses ditolak: ID tidak valid' });
        }
        const { name, email, phone, department } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, email, phone, department }
        });
        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('[Auth] Error update profile:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui profil' });
    }
};
exports.updateProfile = updateProfile;
// ==========================================
// ENDPOINT: UPDATE PASSWORD
// ==========================================
const updatePassword = async (req, res) => {
    try {
        const userPayload = req.user;
        const userId = userPayload?.id || userPayload?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Akses ditolak: ID tidak valid' });
        }
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }
        const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Kata sandi saat ini salah' });
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.status(200).json({
            success: true,
            message: 'Kata sandi berhasil diperbarui'
        });
    }
    catch (error) {
        console.error('[Auth] Error update password:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui kata sandi' });
    }
};
exports.updatePassword = updatePassword;
const logout = (req, res) => {
    // JWT bersifat stateless, jadi logout biasanya cukup menghapus token di sisi frontend (React)
    res.status(200).json({
        success: true,
        message: 'Logout berhasil'
    });
};
exports.logout = logout;
