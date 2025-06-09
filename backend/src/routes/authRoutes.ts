import express from 'express';
import authController from '../controllers/authController';
import { authenticate, authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Route de test Google config
router.get('/google/test', authController.testGoogleConfig);

// Route de test simple
router.get('/google/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Route Google debug accessible !',
    timestamp: new Date().toISOString(),
    url: req.originalUrl
  });
});

// Routes Google OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Routes protégées
router.get('/profile', authenticate, authController.getProfile);

// Routes protégées (nécessitent une authentification)
router.put('/avatar', authenticateToken, authController.updateAvatar);
router.put('/profile', authenticateToken, authController.updateProfile);

export default router; 