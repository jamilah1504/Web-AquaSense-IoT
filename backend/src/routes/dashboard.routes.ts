import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Wajib login untuk melihat dashboard
router.use(authenticate);

// Endpoint utama: GET /api/dashboard
router.get('/', getDashboard);

export default router;