import { Router } from 'express';
import authRoutes from './auth.routes.js';
import blogRoutes from './blog.routes.js';
import propertyRoutes from './property.routes.js';
import projectRoutes from './project.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import notificationRoutes from './notification.routes.js';
import seoRoutes from './seo.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/properties', propertyRoutes);
router.use('/projects', projectRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/seo', seoRoutes);

export default router;
