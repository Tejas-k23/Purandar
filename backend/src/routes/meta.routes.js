import { Router } from 'express';
import { getPropertyMeta, getPropertyMetaJson } from '../controllers/meta.controller.js';

const router = Router();

// Serve HTML with OG tags for social media crawlers
// URL format: /api/v1/meta/property/:id
router.get('/property/:id', getPropertyMeta);

// Get meta data as JSON for client-side updates
router.get('/property/:id/json', getPropertyMetaJson);

export default router;
