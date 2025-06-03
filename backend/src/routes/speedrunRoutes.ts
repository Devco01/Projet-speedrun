import { Router } from 'express';
import { speedrunController } from '../controllers/speedrunController';

const router = Router();

/**
 * Routes pour l'intégration API speedrun.com
 */

// Test de connexion à l'API
router.get('/test', speedrunController.testApiConnection);
router.get('/debug/connection', speedrunController.debugConnection);
router.get('/debug/search', speedrunController.debugSearch);
router.get('/debug/mario', speedrunController.debugMarioSearch);

// Jeux
router.get('/games/popular', speedrunController.getPopularGames);
router.get('/games/zelda', speedrunController.getPopularZeldaGames);
router.get('/games/search', speedrunController.searchGames);
router.get('/games/search/exhaustive', speedrunController.searchGamesExhaustive);
router.get('/games/:gameId', speedrunController.getGameById);
router.get('/games/:gameId/categories', speedrunController.getGameCategories);
router.get('/games/:gameId/runs/recent', speedrunController.getRecentRuns);

// Leaderboards
router.get('/leaderboards/:gameId/:categoryId', speedrunController.getLeaderboard);

// Utilisateurs
router.get('/users/:userId/runs', speedrunController.getUserRuns);

export default router; 