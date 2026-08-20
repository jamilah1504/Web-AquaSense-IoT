import { Router } from 'express';
import { receiveIoTData } from '../controllers/reading.controller';
import { verifyDeviceToken } from '../middleware/iot-auth.middleware';

const router = Router();

// Endpoint ini akan dipanggil oleh NodeMCU / ESP32
router.post('/readings', verifyDeviceToken, receiveIoTData);

export default router;