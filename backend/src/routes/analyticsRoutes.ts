import express from 'express';
import analyticsService from '../services/analyticsService';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * GET /api/analytics/dashboard - Analytics complètes du dashboard (Admin uniquement)
 */
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await analyticsService.getDashboardAnalytics(days);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Erreur analytics dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * GET /api/analytics/activity-feed - Feed d'activité en temps réel (Admin uniquement)
 */
router.get('/activity-feed', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await analyticsService.getRecentActivityFeed(limit);
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Erreur feed activité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * POST /api/analytics/record-activity - Enregistrer une activité (Admin uniquement)
 */
router.post('/record-activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { actionType, resourceId, gameId, gameTitle, categoryId, categoryName, runTime, message } = req.body;
    const userId = req.userId;
    
    // Récupérer les infos utilisateur
    const user = await require('../config/database').default.user.findUnique({
      where: { id: userId },
      select: { username: true }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const success = await analyticsService.recordActivity({
      userId: userId as string,
      username: user.username,
      actionType,
      resourceId,
      gameId,
      gameTitle,
      categoryId,
      categoryName,
      runTime,
      message
    });
    
    res.json({
      success,
      message: success ? 'Activité enregistrée' : 'Erreur enregistrement'
    });
  } catch (error) {
    console.error('Erreur enregistrement activité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

export default router; 