import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getSettings);
router.use(protect, authorize('admin'));
router.patch('/', updateSettings);

export default router;
