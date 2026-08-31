"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = void 0;
const logger_1 = require("../utils/logger");
const sendWhatsAppMessage = async (phoneNumber, message) => {
    try {
        // Simulasi delay jaringan (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
        // Cetak pesan ke console sebagai bukti pengiriman (Mock)
        logger_1.logger.info(`\n[MOCK WHATSAPP] Mengirim pesan ke ${phoneNumber}:\n${message}\n`);
        return true; // Asumsikan selalu berhasil untuk tahap development
    }
    catch (error) {
        logger_1.logger.error({ err: error }, `[MOCK WHATSAPP] Gagal mengirim pesan ke ${phoneNumber}`);
        return false;
    }
};
exports.sendWhatsAppMessage = sendWhatsAppMessage;
