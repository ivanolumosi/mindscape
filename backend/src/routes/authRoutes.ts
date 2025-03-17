import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

// 🔑 Authentication Routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/request-verification', authController.requestVerificationCode);

export default router;
