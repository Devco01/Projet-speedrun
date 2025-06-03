import { Request, Response } from 'express';
import { 
  mockUsers, 
  mockRuns, 
  getUserById, 
  getRunsByUserId, 
  getGameById,
  getCategoryById,
  formatTime 
} from '../data/mockData';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

class UserController {
  // GET /api/users - Récupérer tous les utilisateurs
  async getAllUsers(req: Request, res: Response) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      const users = mockUsers.slice(
        parseInt(offset as string), 
        parseInt(offset as string) + parseInt(limit as string)
      );

      const usersWithStats = users.map(user => {
        const userRuns = getRunsByUserId(user.id);
        const verifiedRuns = userRuns.filter(run => run.isVerified);
        
        return {
          ...user,
          stats: {
            totalRuns: userRuns.length,
            verifiedRuns: verifiedRuns.length,
            personalBests: verifiedRuns.length, // Simplifié pour la démo
            joinedAt: user.createdAt
          }
        };
      });

      res.json({
        success: true,
        data: usersWithStats,
        pagination: {
          total: mockUsers.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs'
      });
    }
  }

  // GET /api/users/:id - Récupérer un utilisateur par ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      const userRuns = getRunsByUserId(id);
      const verifiedRuns = userRuns.filter(run => run.isVerified);
      
      const userWithDetails = {
        ...user,
        stats: {
          totalRuns: userRuns.length,
          verifiedRuns: verifiedRuns.length,
          personalBests: verifiedRuns.length,
          averageTime: verifiedRuns.length > 0 
            ? verifiedRuns.reduce((sum, run) => sum + run.time, 0) / verifiedRuns.length 
            : 0,
          joinedAt: user.createdAt,
          lastActive: userRuns.length > 0 
            ? userRuns.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0].submittedAt 
            : user.createdAt
        }
      };

      res.json({
        success: true,
        data: userWithDetails
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'utilisateur'
      });
    }
  }

  // GET /api/users/:id/runs - Récupérer les runs d'un utilisateur
  async getUserRuns(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { gameId, categoryId, verified, limit = 20, offset = 0 } = req.query;

      const user = getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      let userRuns = getRunsByUserId(id);

      // Filtres
      if (gameId) {
        userRuns = userRuns.filter(run => run.gameId === gameId);
      }
      
      if (categoryId) {
        userRuns = userRuns.filter(run => run.categoryId === categoryId);
      }
      
      if (verified !== undefined) {
        userRuns = userRuns.filter(run => run.isVerified === (verified === 'true'));
      }

      // Pagination
      const paginatedRuns = userRuns.slice(
        parseInt(offset as string), 
        parseInt(offset as string) + parseInt(limit as string)
      );

      // Enrichir avec les détails du jeu et catégorie
      const runsWithDetails = paginatedRuns.map(run => {
        const game = getGameById(run.gameId);
        const category = getCategoryById(run.categoryId);
        
        return {
          ...run,
          game: game ? { id: game.id, title: game.title, cover: game.cover } : null,
          category: category ? { id: category.id, name: category.name } : null,
          formattedTime: formatTime(run.time)
        };
      });

      res.json({
        success: true,
        data: runsWithDetails,
        pagination: {
          total: userRuns.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des runs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des runs'
      });
    }
  }

  // GET /api/users/:id/stats - Récupérer les statistiques d'un utilisateur
  async getUserStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      const userRuns = getRunsByUserId(id);
      const verifiedRuns = userRuns.filter(run => run.isVerified);
      
      // Calculs des statistiques
      const gameStats = verifiedRuns.reduce((acc, run) => {
        if (!acc[run.gameId]) {
          const game = getGameById(run.gameId);
          acc[run.gameId] = {
            gameId: run.gameId,
            gameName: game?.title || 'Inconnu',
            runsCount: 0,
            bestTime: Infinity,
            averageTime: 0,
            totalTime: 0
          };
        }
        
        acc[run.gameId].runsCount++;
        acc[run.gameId].totalTime += run.time;
        acc[run.gameId].bestTime = Math.min(acc[run.gameId].bestTime, run.time);
        acc[run.gameId].averageTime = acc[run.gameId].totalTime / acc[run.gameId].runsCount;
        
        return acc;
      }, {} as any);

      const stats = {
        overview: {
          totalRuns: userRuns.length,
          verifiedRuns: verifiedRuns.length,
          pendingRuns: userRuns.filter(run => !run.isVerified).length,
          gamesPlayed: Object.keys(gameStats).length,
          totalTimeSpent: verifiedRuns.reduce((sum, run) => sum + run.time, 0),
          averageRunTime: verifiedRuns.length > 0 
            ? verifiedRuns.reduce((sum, run) => sum + run.time, 0) / verifiedRuns.length 
            : 0,
          bestTime: verifiedRuns.length > 0 ? Math.min(...verifiedRuns.map(run => run.time)) : 0,
          memberSince: user.createdAt,
          lastActive: userRuns.length > 0 
            ? userRuns.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0].submittedAt 
            : user.createdAt
        },
        byGame: Object.values(gameStats).map((game: any) => ({
          ...game,
          bestTimeFormatted: formatTime(game.bestTime),
          averageTimeFormatted: formatTime(game.averageTime)
        })),
        recentActivity: userRuns
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .slice(0, 5)
          .map(run => {
            const game = getGameById(run.gameId);
            const category = getCategoryById(run.categoryId);
            return {
              id: run.id,
              game: game?.title || 'Inconnu',
              category: category?.name || 'Inconnu',
              time: formatTime(run.time),
              submittedAt: run.submittedAt,
              isVerified: run.isVerified
            };
          })
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  // PUT /api/users/profile - Mettre à jour le profil utilisateur
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { username, bio, profileImage } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      const user = getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Simulation de mise à jour (en réalité, on modifierait en base)
      const updatedUser = {
        ...user,
        username: username || user.username,
        bio: bio || user.bio,
        profileImage: profileImage || user.profileImage
      };

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: updatedUser
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du profil'
      });
    }
  }

  // DELETE /api/users/account - Supprimer le compte utilisateur
  async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      const user = getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Simulation de suppression
      res.json({
        success: true,
        message: 'Compte supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du compte'
      });
    }
  }
}

export default new UserController(); 