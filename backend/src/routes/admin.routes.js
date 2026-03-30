import { Router } from 'express';
import {
  getAdminProperties,
  getDashboard,
  getEnquiries,
  getUsers,
  updateEnquiryStatus,
  updatePropertyStatus,
} from '../controllers/admin.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/properties', getAdminProperties);
router.patch('/properties/:id/status', updatePropertyStatus);
router.get('/users', getUsers);
router.get('/enquiries', getEnquiries);
router.patch('/enquiries/:id/status', updateEnquiryStatus);

export default router;
