import express from 'express';
import leaderboardController from '../controllers/leaderboardController';

const router = express.Router();

// Routes publiques pour les classements
router.get('/', leaderboardController.getGlobalLeaderboards);
router.get('/games/:gameId', leaderboardController.getGameLeaderboards);
router.get('/categories/:categoryId', leaderboardController.getCategoryLeaderboard);
router.get('/recent', leaderboardController.getRecentRuns);
router.get('/top-runners', leaderboardController.getTopRunners);

export default router; 