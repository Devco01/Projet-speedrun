import express from 'express';
import adminController from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes pour le tableau de bord admin (protégées par authentification)
router.get('/dashboard', authenticateToken, requireAdmin, adminController.getDashboardStats); // Alias pour vérification admin
router.get('/stats', authenticateToken, requireAdmin, adminController.getDashboardStats);
router.get('/users', authenticateToken, requireAdmin, adminController.getAllUsers);
router.delete('/users/:id', authenticateToken, requireAdmin, adminController.deleteUser);

export default router; 