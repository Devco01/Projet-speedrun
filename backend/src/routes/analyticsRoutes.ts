import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import analyticsService from '../services/analyticsService';

const router = express.Router();

// Contrôleur analytics utilisant MongoDB
const analyticsController = {
  async getDashboard(req: any, res: any) {
    try {
      const days = parseInt(req.query.days) || 7;
      const data = await analyticsService.getDashboardData(days);

      console.log('📊 Analytics dashboard data loaded from MongoDB');
      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('❌ Erreur analytics dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement des analytics',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  },

  async getActivityFeed(req: any, res: any) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const data = await analyticsService.getActivityFeed(limit);

      console.log('📊 Activity feed data loaded from MongoDB');
      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('❌ Erreur activity feed:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur feed activité',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
};

/**
 * Routes d'analytics (accès admin requis)
 */
// GET /api/analytics/dashboard - Tableau de bord analytics
router.get('/dashboard', authenticateToken, requireAdmin, analyticsController.getDashboard);

// GET /api/analytics/activity-feed - Feed d'activité récente
router.get('/activity-feed', authenticateToken, requireAdmin, analyticsController.getActivityFeed);

export default router; 