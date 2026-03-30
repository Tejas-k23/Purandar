import { Router } from 'express';
import {
  createEnquiry,
  createProperty,
  deleteProperty,
  getPropertyById,
  getPropertyStats,
  listProperties,
  listPropertyEnquiries,
  updateProperty,
} from '../controllers/property.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', listProperties);
router.get('/stats/mine', protect, getPropertyStats);
router.get('/:id', getPropertyById);
router.post('/', protect, authorize('user', 'agent', 'admin'), createProperty);
router.patch('/:id', protect, authorize('user', 'agent', 'admin'), updateProperty);
router.delete('/:id', protect, authorize('user', 'agent', 'admin'), deleteProperty);
router.post('/:id/enquiries', createEnquiry);
router.get('/:id/enquiries', protect, authorize('user', 'agent', 'admin'), listPropertyEnquiries);

export default router;
