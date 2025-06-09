import express from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Route de test Google config
router.get('/google/test', authController.testGoogleConfig);

// Routes Google OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Routes protégées
router.get('/profile', authenticate, authController.getProfile);

export default router; 