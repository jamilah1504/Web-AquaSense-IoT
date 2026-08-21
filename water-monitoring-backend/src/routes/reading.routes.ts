import { Router } from 'express';
import { getHistory, receiveIoTData  } from '../controllers/reading.controller';
import { verifyDeviceToken } from '../middleware/iot-auth.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Endpoint untuk ESP32 (device) - taruh SEBELUM authenticate, biar tidak diblok JWT
// router.post('/', receiveIoTData);
// router.post('/', verifyDeviceToken, receiveIoTData);


// Endpoint untuk frontend (dilindungi JWT)
router.use(authenticate);

// Admin dan Operator boleh melihat riwayat
router.get('/', authorize(['ADMIN', 'OPERATOR']), getHistory);

export default router;