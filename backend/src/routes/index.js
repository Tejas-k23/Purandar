import { Router } from 'express';
import authRoutes from './auth.routes.js';
import blogRoutes from './blog.routes.js';
import contactRoutes from './contact.routes.js';
import propertyRoutes from './property.routes.js';
import projectRoutes from './project.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import notificationRoutes from './notification.routes.js';
import packageRoutes from './package.routes.js';
import paymentRoutes from './payment.routes.js';
import settingsRoutes from './settings.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import seoRoutes from './seo.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/contact', contactRoutes);
router.use('/properties', propertyRoutes);
router.use('/projects', projectRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/packages', packageRoutes);
router.use('/payments', paymentRoutes);
router.use('/settings', settingsRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/seo', seoRoutes);

export default router;
