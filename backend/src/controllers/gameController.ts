import { Request, Response } from 'express';
import gameService from '../services/gameService';

/**
 * Contrôleur pour la gestion des jeux
 */
export default {
  /**
   * Récupère tous les jeux avec filtres et pagination
   */
  async getAllGames(req: Request, res: Response) {
    try {
      const options = {
        search: req.query.search as string,
        genre: req.query.genre ? (Array.isArray(req.query.genre) ? req.query.genre as string[] : [req.query.genre as string]) : undefined,
        platform: req.query.platform ? (Array.isArray(req.query.platform) ? req.query.platform as string[] : [req.query.platform as string]) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as 'title' | 'releaseDate' | 'runsCount' || 'title',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'asc'
      };

      const result = await gameService.getAllGames(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des jeux'
      });
    }
  },

  /**
   * Récupère un jeu par son ID
   */
  async getGameById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const game = await gameService.getGameById(id);

      res.json({
        success: true,
        data: { game }
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Jeu non trouvé'
      });
    }
  },

  /**
   * Récupère les catégories d'un jeu
   */
  async getGameCategories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categories = await gameService.getGameCategories(id);

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

      const runs = await gameService.getGameLeaderboard(id, categoryId, limit);

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
      const game = await gameService.createGame(gameData);

      res.status(201).json({
        success: true,
        message: 'Jeu créé avec succès',
        data: { game }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création du jeu'
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
      const game = await gameService.updateGame(id, updateData);

      res.json({
        success: true,
        message: 'Jeu mis à jour avec succès',
        data: { game }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du jeu'
      });
    }
  },

  /**
   * Supprime un jeu
   */
  async deleteGame(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await gameService.deleteGame(id);

      res.json({
        success: true,
        message: 'Jeu supprimé avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du jeu'
      });
    }
  }
}; 