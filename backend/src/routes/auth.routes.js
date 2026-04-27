import { Router } from 'express';
import {
  checkPhone,
  loginWithGoogle,
  login,
  logout,
  me,
  mergeMobileAccount,
  refresh,
  register,
  registerWithPhone,
  validateMobileVerification,
  validateForOtp,
  verifyMobileForCurrentUser,
  verifyMsg91Token,
} from '../controllers/authV2.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/register-phone', registerWithPhone);
router.post('/login', login);
router.post('/google', loginWithGoogle);
router.post('/validate-for-otp', validateForOtp);
router.post('/verify-msg91-token', verifyMsg91Token);
router.post('/check-phone', checkPhone);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/validate-mobile', protect, validateMobileVerification);
router.post('/verify-mobile', protect, verifyMobileForCurrentUser);
router.post('/merge-mobile-account', protect, mergeMobileAccount);
router.get('/me', protect, me);

export default router;
