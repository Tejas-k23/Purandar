import { Router } from 'express';
import {
  checkPhone,
  login,
  logout,
  me,
  refresh,
  register,
  registerWithPhone,
  validateForOtp,
  verifyMsg91Token,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/register-phone', registerWithPhone);
router.post('/login', login);
router.post('/validate-for-otp', validateForOtp);
router.post('/verify-msg91-token', verifyMsg91Token);
router.post('/check-phone', checkPhone);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
