import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  toggleProjectFeatured,
  toggleProjectVisibility,
  updateProject,
  uploadProjectMedia,
} from '../controllers/project.controller.js';
import { authorize, optionalProtect, protect } from '../middlewares/auth.middleware.js';
import { uploadRateLimit } from '../middlewares/rateLimit.middleware.js';
import { requireMultipart, requireStandardHeaders } from '../middlewares/security.middleware.js';
import { createUpload } from '../middlewares/upload.middleware.js';
import { env } from '../config/env.js';
import { MEGABYTE } from '../utils/media.js';

const router = Router();

const upload = createUpload({
  maxFileSizeBytes: env.MEDIA_VIDEO_MAX_MB * MEGABYTE,
  maxFiles: 14,
});

router.get('/', optionalProtect, listProjects);
router.get('/:id', optionalProtect, getProjectById);
router.post('/', protect, authorize('admin'), createProject);
router.patch('/:id', protect, authorize('admin'), updateProject);
router.patch('/:id/visibility', protect, authorize('admin'), toggleProjectVisibility);
router.patch('/:id/featured', protect, authorize('admin'), toggleProjectFeatured);
router.post(
  '/:id/upload-media',
  protect,
  authorize('admin'),
  uploadRateLimit,
  requireStandardHeaders,
  requireMultipart,
  upload.fields([
    { name: 'images', maxCount: 12 },
    { name: 'videos', maxCount: 2 },
  ]),
  uploadProjectMedia,
);

router.delete('/:id', protect, authorize('admin'), deleteProject);

export default router;
