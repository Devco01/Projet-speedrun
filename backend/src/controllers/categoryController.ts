import { Request, Response } from 'express';
import { 
  mockCategories, 
  mockRuns, 
  mockUsers,
  getCategoryById, 
  getGameById,
  getUserById,
  formatTime 
} from '../data/mockData';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

class CategoryController {
  // GET /api/categories - Récupérer toutes les catégories
  async getAllCategories(req: Request, res: Response) {
    try {
      const { gameId, limit = 50, offset = 0 } = req.query;
      
      let categories = [...mockCategories];
      
      // Filtre par jeu si spécifié
      if (gameId) {
        categories = categories.filter(category => category.gameId === gameId);
      }

      // Pagination
      const paginatedCategories = categories.slice(
        parseInt(offset as string), 
        parseInt(offset as string) + parseInt(limit as string)
      );

      // Enrichir avec les statistiques
      const categoriesWithStats = paginatedCategories.map(category => {
        const categoryRuns = mockRuns.filter(run => 
          run.categoryId === category.id && run.isVerified
        );
        const game = getGameById(category.gameId);
        
        return {
          ...category,
          game: game ? { id: game.id, title: game.title } : null,
          stats: {
            totalRuns: categoryRuns.length,
            uniqueRunners: new Set(categoryRuns.map(run => run.userId)).size,
            worldRecord: categoryRuns.length > 0 
              ? Math.min(...categoryRuns.map(run => run.time))
              : null,
            worldRecordFormatted: categoryRuns.length > 0 
              ? formatTime(Math.min(...categoryRuns.map(run => run.time)))
              : null
          }
        };
      });

      res.json({
        success: true,
        data: categoriesWithStats,
        pagination: {
          total: categories.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des catégories'
      });
    }
  }

  // GET /api/categories/:id - Récupérer une catégorie par ID
  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = getCategoryById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      const categoryRuns = mockRuns.filter(run => 
        run.categoryId === id && run.isVerified
      );
      const game = getGameById(category.gameId);
      
      const categoryWithDetails = {
        ...category,
        game: game,
        stats: {
          totalRuns: categoryRuns.length,
          uniqueRunners: new Set(categoryRuns.map(run => run.userId)).size,
          worldRecord: categoryRuns.length > 0 
            ? Math.min(...categoryRuns.map(run => run.time))
            : null,
          averageTime: categoryRuns.length > 0
            ? categoryRuns.reduce((sum, run) => sum + run.time, 0) / categoryRuns.length
            : null,
          lastSubmission: categoryRuns.length > 0
            ? categoryRuns.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0].submittedAt
            : null
        }
      };

      res.json({
        success: true,
        data: categoryWithDetails
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la catégorie'
      });
    }
  }

  // GET /api/categories/:id/leaderboard - Récupérer le classement d'une catégorie
  async getCategoryLeaderboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { limit = 100, offset = 0 } = req.query;
      
      const category = getCategoryById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      // Récupérer tous les runs vérifiés de cette catégorie
      const categoryRuns = mockRuns.filter(run => 
        run.categoryId === id && run.isVerified
      );

      // Grouper par utilisateur et garder le meilleur temps
      const bestRunsByUser = categoryRuns.reduce((acc, run) => {
        if (!acc[run.userId] || acc[run.userId].time > run.time) {
          acc[run.userId] = run;
        }
        return acc;
      }, {} as { [key: string]: any });

      // Trier par temps et créer le classement
      const leaderboard = Object.values(bestRunsByUser)
        .sort((a: any, b: any) => a.time - b.time)
        .slice(
          parseInt(offset as string), 
          parseInt(offset as string) + parseInt(limit as string)
        )
        .map((run: any, index) => {
          const user = getUserById(run.userId);
          const game = getGameById(run.gameId);
          
          return {
            rank: parseInt(offset as string) + index + 1,
            user: user ? {
              id: user.id,
              username: user.username,
              profileImage: user.profileImage
            } : null,
            run: {
              id: run.id,
              time: run.time,
              formattedTime: formatTime(run.time),
              submittedAt: run.submittedAt,
              verifiedAt: run.verifiedAt,
              videoUrl: run.videoUrl
            },
            game: game ? { id: game.id, title: game.title } : null,
            category: { id: category.id, name: category.name }
          };
        });

      const game = getGameById(category.gameId);
      
      res.json({
        success: true,
        data: {
          category: {
            id: category.id,
            name: category.name,
            rules: category.rules,
            game: game
          },
          leaderboard,
          stats: {
            totalEntries: Object.keys(bestRunsByUser).length,
            worldRecord: leaderboard.length > 0 ? leaderboard[0].run : null
          }
        },
        pagination: {
          total: Object.keys(bestRunsByUser).length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du classement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du classement'
      });
    }
  }

  // POST /api/categories - Créer une nouvelle catégorie (admin)
  async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, rules, gameId } = req.body;

      // Validation des données
      if (!name || !rules || !gameId) {
        return res.status(400).json({
          success: false,
          message: 'Nom, règles et ID du jeu sont requis'
        });
      }

      // Vérifier que le jeu existe
      const game = getGameById(gameId);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Jeu non trouvé'
        });
      }

      // Simulation de création
      const newCategory = {
        id: (mockCategories.length + 1).toString(),
        name,
        rules,
        gameId,
        createdAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Catégorie créée avec succès',
        data: newCategory
      });
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la catégorie'
      });
    }
  }

  // PUT /api/categories/:id - Mettre à jour une catégorie (admin)
  async updateCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, rules } = req.body;

      const category = getCategoryById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      // Simulation de mise à jour
      const updatedCategory = {
        ...category,
        name: name || category.name,
        rules: rules || category.rules,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Catégorie mise à jour avec succès',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la catégorie'
      });
    }
  }

  // DELETE /api/categories/:id - Supprimer une catégorie (admin)
  async deleteCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const category = getCategoryById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      // Vérifier s'il y a des runs associés
      const categoryRuns = mockRuns.filter(run => run.categoryId === id);
      if (categoryRuns.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer une catégorie qui a des runs associés'
        });
      }

      // Simulation de suppression
      res.json({
        success: true,
        message: 'Catégorie supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la catégorie'
      });
    }
  }
}

export default new CategoryController(); 