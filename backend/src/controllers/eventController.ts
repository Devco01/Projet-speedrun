import { Request, Response } from 'express';
import eventService from '../services/eventService';

/**
 * Contrôleur pour la gestion des événements speedrun
 */
export default {
  /**
   * Récupère tous les événements avec filtres et pagination
   */
  async getAllEvents(req: Request, res: Response) {
    try {
      const options = {
        upcoming: req.query.upcoming === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        page: req.query.page ? parseInt(req.query.page as string) : 1
      };

      const result = await eventService.getAllEvents(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des événements'
      });
    }
  },

  /**
   * Récupère un événement par son ID
   */
  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await eventService.getEventById(id);

      res.json({
        success: true,
        data: { event }
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Événement non trouvé'
      });
    }
  },

  /**
   * Crée un nouvel événement
   */
  async createEvent(req: Request, res: Response) {
    try {
      const eventData = req.body;
      const event = await eventService.createEvent(eventData);

      res.status(201).json({
        success: true,
        message: 'Événement créé avec succès',
        data: { event }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création de l\'événement'
      });
    }
  },

  /**
   * Met à jour un événement
   */
  async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const event = await eventService.updateEvent(id, updateData);

      res.json({
        success: true,
        message: 'Événement mis à jour avec succès',
        data: { event }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de l\'événement'
      });
    }
  },

  /**
   * Supprime un événement
   */
  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await eventService.deleteEvent(id);

      res.json({
        success: true,
        message: 'Événement supprimé avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression de l\'événement'
      });
    }
  }
}; 