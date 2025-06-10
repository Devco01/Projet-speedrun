import express from 'express';
import raceController from '../controllers/raceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Routes publiques (lecture seule)
 */
// GET /api/races - Obtenir toutes les races avec pagination
router.get('/', raceController.getAllRaces);

// GET /api/races/:id - Obtenir une race par ID avec détails complets
router.get('/:id', raceController.getRaceById);

/**
 * Routes authentifiées
 */
// POST /api/races - Créer une nouvelle race
router.post('/', authenticateToken, raceController.createRace);

// POST /api/races/:id/join - Rejoindre une race
router.post('/:id/join', authenticateToken, raceController.joinRace);

// POST /api/races/:id/leave - Quitter une race
router.post('/:id/leave', authenticateToken, raceController.leaveRace);

// PUT /api/races/:id/status - Changer le statut du participant dans une race
router.put('/:id/status', authenticateToken, raceController.updateParticipantStatus);

// POST /api/races/:id/messages - Envoyer un message dans le chat d'une race
router.post('/:id/messages', authenticateToken, raceController.sendMessage);

// DELETE /api/races/:id - Supprimer une race (créateur seulement)
router.delete('/:id', authenticateToken, raceController.deleteRace);

export default router; 