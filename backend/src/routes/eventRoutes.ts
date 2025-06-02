import express from 'express';
import eventController from '../controllers/eventController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Routes admin (nécessitent authentification et autorisation admin)
router.post('/', authenticateToken, requireAdmin, eventController.createEvent);
router.put('/:id', authenticateToken, requireAdmin, eventController.updateEvent);
router.delete('/:id', authenticateToken, requireAdmin, eventController.deleteEvent);

export default router; 