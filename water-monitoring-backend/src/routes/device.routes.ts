import { Router } from 'express';
import * as deviceController from '../controllers/device.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Semua rute di bawah ini wajib menggunakan token (authenticate)
router.use(authenticate);

// Bisa diakses ADMIN dan OPERATOR
router.get('/', authorize(['ADMIN', 'OPERATOR']), deviceController.getDevices);
router.get('/:id', authorize(['ADMIN', 'OPERATOR']), deviceController.getDevice);

// HANYA bisa diakses ADMIN
router.post('/', authorize(['ADMIN']), deviceController.createDevice);
router.put('/:id', authorize(['ADMIN']), deviceController.updateDevice);
router.delete('/:id', authorize(['ADMIN']), deviceController.deleteDevice);

export default router;