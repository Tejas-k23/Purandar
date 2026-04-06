import { Router } from 'express';
import {
  checkPhone,
  login,
  logout,
  me,
  refresh,
  register,
  registerWithPhone,
  sendOtp,
  verifyOtp,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/register-phone', registerWithPhone);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/check-phone', checkPhone);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
