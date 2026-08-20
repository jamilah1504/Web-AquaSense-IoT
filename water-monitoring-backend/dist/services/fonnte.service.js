"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFonnteMessage = exports.normalizePhoneNumber = void 0;
const axios_1 = __importDefault(require("axios"));
const FONNTE_API_URL = 'https://api.fonnte.com/send';
const FONNTE_TOKEN = process.env.FONNTE_TOKEN?.trim();
const normalizePhoneNumber = (raw) => {
    let phone = raw.replace(/[\s\-()]/g, '');
    if (phone.startsWith('+'))
        phone = phone.slice(1);
    if (phone.startsWith('0'))
        phone = '62' + phone.slice(1);
    return phone;
};
exports.normalizePhoneNumber = normalizePhoneNumber;
const sendFonnteMessage = async (phone, message) => {
    if (!FONNTE_TOKEN) {
        throw new Error('FONNTE_TOKEN belum dikonfigurasi di environment variable');
    }
    const body = new URLSearchParams();
    body.append('target', (0, exports.normalizePhoneNumber)(phone));
    body.append('message', message);
    body.append('countryCode', '62');
    body.append('delay', '1-3'); // opsional, samain kaya versi PHP biar ga kena rate limit
    const response = await axios_1.default.post(FONNTE_API_URL, body, {
        headers: {
            Authorization: FONNTE_TOKEN,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
    });
    const data = response.data;
    if (data.status !== true) {
        throw new Error(data.reason || data.detail || 'Fonnte gagal mengirim pesan');
    }
    return data;
};
exports.sendFonnteMessage = sendFonnteMessage;
