import { Router } from 'express';
import { getNearbyLocations } from '../controllers/seo.controller.js';

const router = Router();

router.get('/nearby', getNearbyLocations);

export default router;
