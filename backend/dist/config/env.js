"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    DEVICE_API_SECRET: process.env.DEVICE_API_SECRET || 'abdulGanteng',
    WHATSAPP_PHONE_NUMBER: process.env.WHATSAPP_PHONE_NUMBER || '081234567890',
    NOTIFICATION_COOLDOWN_MINUTES: parseInt(process.env.NOTIFICATION_COOLDOWN_MINUTES || '15', 10),
};
