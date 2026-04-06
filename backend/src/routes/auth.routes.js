import { Router } from 'express';
import {
  checkPhone,
  login,
  loginWithPhone,
  logout,
  me,
  refresh,
  register,
  registerWithPhone,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/register-phone', registerWithPhone);
router.post('/login', login);
router.post('/login-phone', loginWithPhone);
router.post('/check-phone', checkPhone);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
