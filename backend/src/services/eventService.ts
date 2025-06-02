import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service pour gérer les événements speedrun
 */
export default {
  /**
   * Récupère tous les événements avec options de filtrage et pagination
   */
  async getAllEvents(options: {
    upcoming?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const {
      upcoming = false,
      page = 1,
      limit = 10
    } = options;

    // Construire les conditions de filtre
    const where: Record<string, any> = {};
    
    if (upcoming) {
      where.startDate = {
        gte: new Date()
      };
    }

    // Calculer le nombre total d'événements
    const totalEvents = await prisma.event.count({ where });
    
    // Récupérer les événements avec pagination
    const events = await prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: 'asc' }
    });

    return {
      events,
      pagination: {
        total: totalEvents,
        page,
        limit,
        pages: Math.ceil(totalEvents / limit)
      }
    };
  },

  /**
   * Récupère un événement par son ID
   */
  async getEventById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('Événement non trouvé');
    }

    return event;
  },

  /**
   * Crée un nouvel événement
   */
  async createEvent(data: {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    website?: string;
    location?: string;
    isOnline?: boolean;
  }) {
    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        website: data.website,
        location: data.location,
        isOnline: data.isOnline ?? true
      }
    });

    return event;
  },

  /**
   * Met à jour un événement
   */
  async updateEvent(id: string, data: {
    name?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    website?: string;
    location?: string;
    isOnline?: boolean;
  }) {
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      throw new Error('Événement non trouvé');
    }

    const event = await prisma.event.update({
      where: { id },
      data
    });

    return event;
  },

  /**
   * Supprime un événement
   */
  async deleteEvent(id: string) {
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      throw new Error('Événement non trouvé');
    }

    await prisma.event.delete({
      where: { id }
    });

    return true;
  },

  /**
   * Récupère les événements à venir (pour la page d'accueil)
   */
  async getUpcomingEvents(limit = 5) {
    const events = await prisma.event.findMany({
      where: {
        startDate: {
          gte: new Date()
        }
      },
      orderBy: { startDate: 'asc' },
      take: limit
    });

    return events;
  }
}; 