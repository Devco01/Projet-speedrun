import express from 'express';
import adminController from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes pour le tableau de bord admin (protégées par authentification)
router.get('/dashboard', authenticateToken, requireAdmin, adminController.getDashboardStats); // Alias pour vérification admin
router.get('/stats', authenticateToken, requireAdmin, adminController.getDashboardStats);
router.get('/users', authenticateToken, requireAdmin, adminController.getAllUsers);
router.delete('/users/:id', authenticateToken, requireAdmin, adminController.deleteUser);

// POST /admin/cleanup - Forcer le nettoyage des courses terminées
router.post('/cleanup', authenticateToken, requireAdmin, adminController.forceCleanup);

// GET /admin/cleanup/stats - Statistiques de nettoyage
router.get('/cleanup/stats', authenticateToken, requireAdmin, adminController.getCleanupStats);

export default router; 