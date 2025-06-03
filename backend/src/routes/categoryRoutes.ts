import express from 'express';
import categoryController from '../controllers/categoryController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/leaderboard', categoryController.getCategoryLeaderboard);

// Routes protégées (administration)
router.post('/', authenticate, categoryController.createCategory);
router.put('/:id', authenticate, categoryController.updateCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);

export default router; 