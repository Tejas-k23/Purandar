import { Router } from 'express';
import {
  getMyEnquiries,
  getMyProfile,
  getMyProperties,
  getSavedProperties,
  getSavedProjects,
  saveProperty,
  saveProject,
  unsaveProperty,
  unsaveProject,
  updateMyProfile,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);
router.get('/me/properties', getMyProperties);
router.get('/me/saved-properties', getSavedProperties);
router.post('/me/saved-properties/:propertyId', saveProperty);
router.delete('/me/saved-properties/:propertyId', unsaveProperty);
router.get('/me/saved-projects', getSavedProjects);
router.post('/me/saved-projects/:projectId', saveProject);
router.delete('/me/saved-projects/:projectId', unsaveProject);
router.get('/me/enquiries', getMyEnquiries);

export default router;
