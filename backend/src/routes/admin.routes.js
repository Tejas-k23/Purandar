import { Router } from 'express';
import {
  createBlog,
  deleteAdminProject,
  deleteAdminProperty,
  deleteBlog,
  getAdminProperties,
  getAdminProjects,
  getAdminPropertyById,
  getAdminBlogById,
  getDashboard,
  getEnquiries,
  getUsers,
  deleteUser,
  sendCustomNotification,
  listAdminBlogs,
  togglePropertyFeatured,
  updateBlog,
  updateEnquiryStatus,
  updatePropertyStatus,
  updateProjectStatus,
} from '../controllers/admin.controller.js';
import { deleteFeedback, listAllFeedback } from '../controllers/feedback.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/blogs', listAdminBlogs);
router.post('/blogs', createBlog);
router.get('/blogs/:id', getAdminBlogById);
router.patch('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);
router.get('/properties', getAdminProperties);
router.get('/properties/:id', getAdminPropertyById);
router.patch('/properties/:id/status', updatePropertyStatus);
router.patch('/properties/:id/featured', togglePropertyFeatured);
router.delete('/properties/:id', deleteAdminProperty);
router.get('/projects', getAdminProjects);
router.patch('/projects/:id/status', updateProjectStatus);
router.delete('/projects/:id', deleteAdminProject);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.post('/notifications/broadcast', sendCustomNotification);
router.get('/enquiries', getEnquiries);
router.patch('/enquiries/:id/status', updateEnquiryStatus);
router.get('/feedback', listAllFeedback);
router.delete('/feedback/:id', deleteFeedback);

export default router;
