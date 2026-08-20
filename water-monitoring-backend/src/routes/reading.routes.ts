import { Router } from 'express';
import { getHistory } from '../controllers/reading.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Endpoint untuk frontend (dilindungi JWT)
router.use(authenticate);

// Admin dan Operator boleh melihat riwayat
router.get('/', authorize(['ADMIN', 'OPERATOR']), getHistory);

export default router;