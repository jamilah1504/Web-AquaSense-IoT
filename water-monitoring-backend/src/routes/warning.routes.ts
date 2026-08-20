import { Router } from 'express';
import { getWarnings, resolveWarning } from '../controllers/warning.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getWarnings);
router.put('/:id/resolve', resolveWarning);

export default router;