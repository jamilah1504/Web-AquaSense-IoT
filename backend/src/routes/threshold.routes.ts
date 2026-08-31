import { Router } from 'express';
import * as thresholdController from '../controllers/threshold.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// Bisa dilihat oleh siapa saja yang sudah login
router.get('/', authorize(['ADMIN', 'OPERATOR']), thresholdController.getThresholds);
router.get('/:parameter', authorize(['ADMIN', 'OPERATOR']), thresholdController.getThreshold);

// HANYA BISA DIUBAH OLEH ADMIN
router.put('/:parameter', authorize(['ADMIN']), thresholdController.updateThreshold);

export default router;