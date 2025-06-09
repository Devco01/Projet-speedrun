import express from 'express';
import adminController from '../controllers/adminController';

const router = express.Router();

// Routes pour le tableau de bord admin
router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/events', adminController.getRecentEvents);
router.delete('/users/:id', adminController.deleteUser);

export default router; 