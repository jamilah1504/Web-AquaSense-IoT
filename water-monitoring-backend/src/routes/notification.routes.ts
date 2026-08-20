import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.get('/', notificationController.getNotificationSettings);
router.put('/config', notificationController.updateNotificationConfig);
router.post('/recipients', notificationController.addRecipient);
router.put('/recipients/:id', notificationController.updateRecipient);
router.delete('/recipients/:id', notificationController.deleteRecipient);
router.post('/test', notificationController.sendTestMessage);

export default router;