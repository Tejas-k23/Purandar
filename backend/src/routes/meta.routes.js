import { Router } from 'express';
import { getPropertyMeta, getPropertyMetaJson, getProjectMeta, getProjectMetaJson } from '../controllers/meta.controller.js';

const router = Router();

// Serve HTML with OG tags for social media crawlers
// URL format: /api/v1/meta/property/:id
router.get('/property/:id', getPropertyMeta);
router.get('/project/:id', getProjectMeta);

// Get meta data as JSON for client-side updates
router.get('/property/:id/json', getPropertyMetaJson);
router.get('/project/:id/json', getProjectMetaJson);

export default router;
