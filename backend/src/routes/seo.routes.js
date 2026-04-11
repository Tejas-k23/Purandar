import { Router } from 'express';
import { getNearbyLocations, getSitemap } from '../controllers/seo.controller.js';

const router = Router();

router.get('/nearby', getNearbyLocations);
router.get('/sitemap.xml', getSitemap);

export default router;
