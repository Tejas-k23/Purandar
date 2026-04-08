import { Router } from 'express';
import {
  createEnquiry,
  createProperty,
  deleteProperty,
  getPropertyById,
  getPropertyStats,
  listProperties,
  listPropertyEnquiries,
  uploadPropertyImages,
  uploadPropertyVideos,
  unlockSellerDetails,
  updateProperty,
} from '../controllers/property.controller.js';
import { authorize, optionalProtect, protect } from '../middlewares/auth.middleware.js';
import { uploadRateLimit } from '../middlewares/rateLimit.middleware.js';
import { requireMultipart, requireStandardHeaders } from '../middlewares/security.middleware.js';
import { createUpload } from '../middlewares/upload.middleware.js';
import { env } from '../config/env.js';
import { MEGABYTE } from '../utils/media.js';

const router = Router();

router.get('/', listProperties);
router.get('/stats/mine', protect, getPropertyStats);
router.get('/:id', optionalProtect, getPropertyById);
router.post('/', protect, authorize('user', 'agent', 'admin'), createProperty);
router.patch('/:id', protect, authorize('user', 'agent', 'admin'), updateProperty);
router.post(
  '/:id/upload-images',
  protect,
  authorize('user', 'agent', 'admin'),
  uploadRateLimit,
  requireStandardHeaders,
  requireMultipart,
  createUpload({
    maxFileSizeBytes: env.MEDIA_IMAGE_MAX_MB * MEGABYTE,
    maxFiles: 8,
  }).array('images', 8),
  uploadPropertyImages,
);
router.post(
  '/:id/upload-videos',
  protect,
  authorize('user', 'agent', 'admin'),
  uploadRateLimit,
  requireStandardHeaders,
  requireMultipart,
  createUpload({
    maxFileSizeBytes: env.MEDIA_VIDEO_MAX_MB * MEGABYTE,
    maxFiles: 2,
  }).array('videos', 2),
  uploadPropertyVideos,
);
router.delete('/:id', protect, authorize('user', 'agent', 'admin'), deleteProperty);
router.post('/:id/seller-details', protect, authorize('user', 'agent', 'admin'), unlockSellerDetails);
router.post('/:id/enquiries', createEnquiry);
router.get('/:id/enquiries', protect, authorize('user', 'agent', 'admin'), listPropertyEnquiries);

export default router;

