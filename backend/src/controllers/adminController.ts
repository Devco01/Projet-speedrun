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
      
      // Utilisateurs actifs = tous les utilisateurs inscrits  
      const activeUsers = totalUsers;

      // Les événements sont maintenant remplacés par les races speedrun

      // Récupérer les statistiques des races speedrun
      const totalRaces = await prisma.race.count();
      const activeRaces = await prisma.race.count({
        where: {
          status: {
            in: ['en-attente', 'prete', 'en-cours']
          }
        }
      });
      const completedRaces = await prisma.race.count({
        where: {
          status: 'terminee'
        }
      });

      // Plus besoin de statistiques sur les runs pour cette plateforme d'événements

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
          totalRaces,
          activeRaces,
          completedRaces,
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
          createdAt: true
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
        isActive: true // Tous les utilisateurs inscrits sont considérés actifs
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

  // Les événements généraux ont été remplacés par les races speedrun

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