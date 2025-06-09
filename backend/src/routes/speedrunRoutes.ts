import { Router } from 'express';
import { speedrunController } from '../controllers/speedrunController';

const router = Router();

/**
 * Routes pour l'intégration API speedrun.com
 */

// Test de connexion à l'API
router.get('/test', speedrunController.testApiConnection);
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Route speedrun accessible',
    timestamp: new Date().toISOString()
  });
});
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

// Endpoint pour récupérer les statistiques d'un jeu
router.get('/game-stats/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Données statiques réalistes basées sur speedrun.com
    const gameStats = {
      'sm64': {
        gameId: 'sm64',
        name: 'Super Mario 64',
        players: 7967,
        worldRecord: '1h 35m 28s',
        category: '120 Star',
        totalRuns: 48944
      },
      'oot': {
        gameId: 'oot', 
        name: 'The Legend of Zelda: Ocarina of Time',
        players: 1931,
        worldRecord: '3m 47s 900ms',
        category: 'Any%',
        totalRuns: 13000
      },
      'celeste': {
        gameId: 'celeste',
        name: 'Celeste', 
        players: 8231,
        worldRecord: '24m 51s 495ms',
        category: 'Any%',
        totalRuns: 45957
      }
    };
    
    const stats = gameStats[gameId as keyof typeof gameStats];
    
    if (!stats) {
      return res.status(404).json({ error: 'Jeu non trouvé' });
    }
    
    res.json(stats);
    
  } catch (error) {
    console.error('Erreur game-stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router; 