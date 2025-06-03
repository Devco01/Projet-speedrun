import { Request, Response } from 'express';
import { 
  mockGames, 
  mockCategories,
  getGameById as findGameById,
  getRunsByGameId,
  formatTime,
  MockGame
} from '../data/mockData';

/**
 * Contrôleur pour la gestion des jeux
 */
export default {
  /**
   * Récupère tous les jeux avec filtres et pagination
   */
  async getAllGames(req: Request, res: Response) {
    try {
      const { genre, platform, search } = req.query;
      
      let filteredGames = [...mockGames];
      
      // Filtre par genre
      if (genre && typeof genre === 'string') {
        filteredGames = filteredGames.filter(game => 
          game.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
        );
      }
      
      // Filtre par plateforme
      if (platform && typeof platform === 'string') {
        filteredGames = filteredGames.filter(game => 
          game.platform.some(p => p.toLowerCase().includes(platform.toLowerCase()))
        );
      }
      
      // Recherche par titre
      if (search && typeof search === 'string') {
        filteredGames = filteredGames.filter(game =>
          game.title.toLowerCase().includes(search.toLowerCase()) ||
          game.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      res.json({
        success: true,
        data: filteredGames,
        total: filteredGames.length
      });
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des jeux'
      });
    }
  },

  /**
   * Récupère un jeu par son ID
   */
  async getGameById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const game = findGameById(id);
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Jeu non trouvé'
        });
      }
      
      // Récupérer les catégories du jeu
      const categories = mockCategories.filter(cat => cat.gameId === id);
      
      // Récupérer les runs du jeu
      const runs = getRunsByGameId(id);
      
      // Ajouter les informations enrichies
      const gameWithDetails = {
        ...game,
        categories,
        runsCount: runs.length,
        bestTime: runs.length > 0 ? Math.min(...runs.map(r => r.time)) : null,
        bestTimeFormatted: runs.length > 0 ? formatTime(Math.min(...runs.map(r => r.time))) : null
      };
      
      res.json({
        success: true,
        data: gameWithDetails
      });
    } catch (error) {
      console.error('Error fetching game:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du jeu'
      });
    }
  },

  /**
   * Récupère les catégories d'un jeu
   */
  async getGameCategories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categories = mockCategories.filter(cat => cat.gameId === id);

      res.json({
        success: true,
        data: { categories }
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Jeu non trouvé'
      });
    }
  },

  /**
   * Récupère le classement d'un jeu
   */
  async getGameLeaderboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categoryId = req.query.categoryId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const runs = await getRunsByGameId(id);

      res.json({
        success: true,
        data: { runs }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du classement'
      });
    }
  },

  /**
   * Crée un nouveau jeu
   */
  async createGame(req: Request, res: Response) {
    try {
      const gameData = req.body;
      
      // Générer un nouvel ID
      const newId = (mockGames.length + 1).toString();
      
      const newGame: MockGame = {
        id: newId,
        title: gameData.title,
        cover: gameData.cover,
        description: gameData.description,
        platform: gameData.platform || [],
        genre: gameData.genre || [],
        developer: gameData.developer,
        publisher: gameData.publisher,
        releaseDate: gameData.releaseDate,
        createdAt: new Date().toISOString()
      };
      
      // Ajouter le nouveau jeu (en mémoire)
      mockGames.push(newGame);
      
      res.status(201).json({
        success: true,
        data: newGame,
        message: 'Jeu créé avec succès'
      });
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du jeu'
      });
    }
  },

  /**
   * Met à jour un jeu
   */
  async updateGame(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const gameIndex = mockGames.findIndex(game => game.id === id);
      
      if (gameIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Jeu non trouvé'
        });
      }
      
      // Mettre à jour le jeu
      mockGames[gameIndex] = {
        ...mockGames[gameIndex],
        ...updateData
      };
      
      res.json({
        success: true,
        data: mockGames[gameIndex],
        message: 'Jeu mis à jour avec succès'
      });
    } catch (error) {
      console.error('Error updating game:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du jeu'
      });
    }
  },

  /**
   * Supprime un jeu
   */
  async deleteGame(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const gameIndex = mockGames.findIndex(game => game.id === id);
      
      if (gameIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Jeu non trouvé'
        });
      }
      
      // Supprimer le jeu
      const deletedGame = mockGames.splice(gameIndex, 1)[0];
      
      res.json({
        success: true,
        data: deletedGame,
        message: 'Jeu supprimé avec succès'
      });
    } catch (error) {
      console.error('Error deleting game:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du jeu'
      });
    }
  },

  /**
   * Obtenir les genres disponibles
   */
  async getGenres(req: Request, res: Response) {
    try {
      const allGenres = mockGames.flatMap(game => game.genre);
      const uniqueGenres = [...new Set(allGenres)].sort();
      
      res.json({
        success: true,
        data: uniqueGenres
      });
    } catch (error) {
      console.error('Error fetching genres:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des genres'
      });
    }
  },

  /**
   * Obtenir les plateformes disponibles
   */
  async getPlatforms(req: Request, res: Response) {
    try {
      const allPlatforms = mockGames.flatMap(game => game.platform);
      const uniquePlatforms = [...new Set(allPlatforms)].sort();
      
      res.json({
        success: true,
        data: uniquePlatforms
      });
    } catch (error) {
      console.error('Error fetching platforms:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des plateformes'
      });
    }
  }
}; 