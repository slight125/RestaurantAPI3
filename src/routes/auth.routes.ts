import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  updateProfileSchema
} from '../utils/validation';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/verify-email', validateRequest(verifyEmailSchema), AuthController.verifyEmail);
router.post('/request-password-reset', validateRequest(requestPasswordResetSchema), AuthController.requestPasswordReset);
router.post('/reset-password', validateRequest(resetPasswordSchema), AuthController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), AuthController.updateProfile);

export default router;

