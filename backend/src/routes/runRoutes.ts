import express from 'express';
import runController from '../controllers/runController';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.get('/', runController.getAllRuns);
router.get('/:id', runController.getRunById);

// Routes protégées
router.post('/', authenticate, runController.createRun);
router.post('/:id/verify', authenticate, runController.verifyRun);
router.post('/:id/comments', authenticate, runController.addComment);
router.delete('/:id', authenticate, runController.deleteRun);

export default router; 