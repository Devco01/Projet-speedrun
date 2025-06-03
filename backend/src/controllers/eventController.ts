import { Request, Response } from 'express';
import { mockEvents, MockEvent } from '../data/mockData';

/**
 * Contrôleur pour la gestion des événements speedrun
 */
export default {
  /**
   * Récupère tous les événements avec filtres et pagination
   */
  async getAllEvents(req: Request, res: Response) {
    try {
      const { upcoming, past, online } = req.query;
      const now = new Date().toISOString();
      
      let filteredEvents = [...mockEvents];
      
      // Filtre par événements à venir
      if (upcoming === 'true') {
        filteredEvents = filteredEvents.filter(event => event.startDate > now);
      }
      
      // Filtre par événements passés
      if (past === 'true') {
        filteredEvents = filteredEvents.filter(event => event.endDate < now);
      }
      
      // Filtre par événements en ligne
      if (online === 'true') {
        filteredEvents = filteredEvents.filter(event => event.isOnline === true);
      } else if (online === 'false') {
        filteredEvents = filteredEvents.filter(event => event.isOnline === false);
      }
      
      // Trier par date de début
      filteredEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      res.json({
        success: true,
        data: filteredEvents,
        total: filteredEvents.length
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des événements'
      });
    }
  },

  /**
   * Récupère un événement par son ID
   */
  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const event = mockEvents.find(e => e.id === id);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Événement non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'événement'
      });
    }
  },

  /**
   * Crée un nouvel événement
   */
  async createEvent(req: Request, res: Response) {
    try {
      const eventData = req.body;
      
      // Validation basique
      if (!eventData.name || !eventData.startDate || !eventData.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Nom, date de début et date de fin sont requis'
        });
      }
      
      // Générer un nouvel ID
      const newId = (mockEvents.length + 1).toString();
      
      const newEvent: MockEvent = {
        id: newId,
        name: eventData.name,
        description: eventData.description || '',
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location,
        isOnline: eventData.isOnline || false,
        participants: eventData.participants || 0,
        createdAt: new Date().toISOString()
      };
      
      // Ajouter le nouvel événement
      mockEvents.push(newEvent);
      
      res.status(201).json({
        success: true,
        data: newEvent,
        message: 'Événement créé avec succès'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'événement'
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
      
      const eventIndex = mockEvents.findIndex(event => event.id === id);
      
      if (eventIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Événement non trouvé'
        });
      }
      
      // Mettre à jour l'événement
      mockEvents[eventIndex] = {
        ...mockEvents[eventIndex],
        ...updateData
      };
      
      res.json({
        success: true,
        data: mockEvents[eventIndex],
        message: 'Événement mis à jour avec succès'
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'événement'
      });
    }
  },

  /**
   * Supprime un événement
   */
  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const eventIndex = mockEvents.findIndex(event => event.id === id);
      
      if (eventIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Événement non trouvé'
        });
      }
      
      // Supprimer l'événement
      const deletedEvent = mockEvents.splice(eventIndex, 1)[0];
      
      res.json({
        success: true,
        data: deletedEvent,
        message: 'Événement supprimé avec succès'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'événement'
      });
    }
  }
}; 