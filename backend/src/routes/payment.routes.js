import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { pricingEnabled } from '../middlewares/pricing.middleware.js';

const router = Router();

router.use(protect);
router.post('/orders', pricingEnabled, createOrder);
router.post('/verify', pricingEnabled, verifyPayment);

export default router;
