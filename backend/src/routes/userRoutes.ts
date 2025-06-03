import express from 'express';
import userController from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/runs', userController.getUserRuns);
router.get('/:id/stats', userController.getUserStats);

// Routes protégées
router.put('/profile', authenticate, userController.updateProfile);
router.delete('/account', authenticate, userController.deleteAccount);

export default router; 