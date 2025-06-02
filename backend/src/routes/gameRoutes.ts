import express from 'express';
import gameController from '../controllers/gameController';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.get('/', gameController.getAllGames);
router.get('/:id', gameController.getGameById);
router.get('/:id/categories', gameController.getGameCategories);
router.get('/:id/leaderboard', gameController.getGameLeaderboard);

// Routes protégées (administration)
router.post('/', authenticate, gameController.createGame);
router.put('/:id', authenticate, gameController.updateGame);
router.delete('/:id', authenticate, gameController.deleteGame);

export default router; 