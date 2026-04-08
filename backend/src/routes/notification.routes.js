import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  subscribeNotifications,
  unsubscribeNotifications,
  updateNotificationPreferences,
} from '../controllers/notification.controller.js';
import { optionalProtect, protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/subscribe', optionalProtect, subscribeNotifications);
router.post('/unsubscribe', unsubscribeNotifications);
router.patch('/preferences', protect, updateNotificationPreferences);
router.get('/me', protect, getMyNotifications);
router.patch('/:id/read', protect, markNotificationRead);

export default router;
