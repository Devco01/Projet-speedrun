import express from 'express';
import authController from '../controllers/authController';
import { authenticate, authenticateToken } from '../middleware/authMiddleware';
import prisma, { testDatabaseConnection } from '../config/database';

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
router.get('/google/session/:sessionId', authController.getGoogleSession);

// Routes protégées
router.get('/profile', authenticate, authController.getProfile);

// Routes protégées (nécessitent une authentification)
router.put('/avatar', authenticateToken, authController.updateAvatar);
router.put('/profile', authenticateToken, authController.updateProfile);

// Route de diagnostic base de données
router.get('/db-status', async (req, res) => {
  try {
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

// Route de diagnostic utilisateur connecté
router.get('/user-debug', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.json({
        success: false,
        message: 'Aucun userId dans la requête',
        debug: {
          hasAuth: !!req.headers.authorization,
          tokenLength: token?.length || 0,
          userId: userId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Vérifier si l'utilisateur existe en base
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        profileImage: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: user ? 'Utilisateur trouvé en base' : 'Utilisateur non trouvé en base',
      debug: {
        userId: userId,
        userExists: !!user,
        userData: user,
        tokenLength: token?.length || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur diagnostic utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      debug: {
        userId: req.userId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router; 