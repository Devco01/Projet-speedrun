import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AdminController {
  /**
   * Récupère les statistiques générales pour le tableau de bord admin
   */
  async getDashboardStats(req: Request, res: Response) {
    try {
      // Récupérer le nombre total d'utilisateurs
      const totalUsers = await prisma.user.count();
      
      // Récupérer le nombre d'utilisateurs actifs (ceux qui ont des runs)
      const activeUsers = await prisma.user.count({
        where: {
          runs: {
            some: {}
          }
        }
      });

      // Récupérer le nombre d'événements
      const totalEvents = await prisma.event.count();
      
      // Récupérer le nombre d'événements passés
      const pastEvents = await prisma.event.count({
        where: {
          endDate: {
            lt: new Date()
          }
        }
      });

      // Récupérer le nombre de runs totaux
      const totalRuns = await prisma.run.count();

      // Récupérer le nombre de runs vérifiés
      const verifiedRuns = await prisma.run.count({
        where: {
          isVerified: true
        }
      });

      // Calcul des utilisateurs de ce mois
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const newUsersThisMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      });

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          totalEvents,
          pastEvents,
          totalRuns,
          verifiedRuns,
          newUsersThisMonth
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Récupère la liste de tous les utilisateurs pour l'admin
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          profileImage: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              runs: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      });

      const totalUsers = await prisma.user.count();

      // Formater les données pour correspondre à l'interface frontend
      const formattedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        createdAt: user.createdAt.toISOString(),
        runsCount: user._count.runs,
        isActive: user._count.runs > 0
      }));

      res.json({
        success: true,
        data: formattedUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Récupère les événements récents pour l'admin
   */
  async getRecentEvents(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const upcomingEvents = await prisma.event.findMany({
        where: {
          startDate: {
            gte: new Date()
          }
        },
        orderBy: {
          startDate: 'asc'
        },
        take: limit
      });

      const pastEvents = await prisma.event.findMany({
        where: {
          endDate: {
            lt: new Date()
          }
        },
        orderBy: {
          endDate: 'desc'
        },
        take: limit
      });

      res.json({
        success: true,
        data: {
          upcoming: upcomingEvents,
          past: pastEvents
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Supprime un utilisateur (admin seulement)
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Supprimer l'utilisateur (les relations seront gérées par Prisma selon le schéma)
      await prisma.user.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

export default new AdminController(); 