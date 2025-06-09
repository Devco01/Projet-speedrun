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

// Route de diagnostic base de données
router.get('/db-status', async (req, res) => {
  try {
    const { testDatabaseConnection } = await import('../config/database');
    const isConnected = await testDatabaseConnection();
    
    res.json({
      success: true,
      database: {
        connected: isConnected,
        type: 'postgresql',
        timestamp: new Date().toISOString()
      },
      message: isConnected ? 'Base de données accessible' : 'Base de données indisponible'
    });
  } catch (error) {
    res.json({
      success: false,
      database: {
        connected: false,
        type: 'postgresql',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      message: 'Erreur de diagnostic base de données'
    });
  }
});

export default router; 