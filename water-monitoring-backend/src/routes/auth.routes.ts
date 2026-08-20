import { Router } from 'express';
import { login, updateProfile, updatePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware'; // Import middleware-nya

const router = Router();

router.post('/login', login);

// Tambahkan dua baris ini:
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, updatePassword);

export default router;