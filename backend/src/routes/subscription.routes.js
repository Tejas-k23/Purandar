import { Router } from 'express';
import {
  assignPackageToUser,
  getMySubscription,
  modifySubscription,
} from '../controllers/subscription.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/me', getMySubscription);

router.use(authorize('admin'));
router.post('/assign', assignPackageToUser);
router.patch('/:id', modifySubscription);

export default router;
