import { logger } from '../utils/logger';

export const sendWhatsAppMessage = async (phoneNumber: string, message: string): Promise<boolean> => {
  try {
    // Simulasi delay jaringan (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Cetak pesan ke console sebagai bukti pengiriman (Mock)
    logger.info(`\n[MOCK WHATSAPP] Mengirim pesan ke ${phoneNumber}:\n${message}\n`);
    
    return true; // Asumsikan selalu berhasil untuk tahap development
  } catch (error) {
    logger.error({ err: error }, `[MOCK WHATSAPP] Gagal mengirim pesan ke ${phoneNumber}`);
    return false;
  }
};