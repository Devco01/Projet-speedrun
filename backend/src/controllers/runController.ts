import { Request, Response } from 'express';
import runService from '../services/runService';

/**
 * Contrôleur pour la gestion des runs
 */
export default {
  /**
   * Récupère tous les runs avec filtres et pagination
   */
  async getAllRuns(req: Request, res: Response) {
    try {
      const options = {
        gameId: req.query.gameId as string,
        categoryId: req.query.categoryId as string,
        userId: req.query.userId as string,
        isVerified: req.query.isVerified ? req.query.isVerified === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as 'time' | 'submittedAt' || 'time',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'asc'
      };

      const result = await runService.getAllRuns(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des runs'
      });
    }
  },

  /**
   * Récupère un run par son ID
   */
  async getRunById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const run = await runService.getRunById(id);

      res.json({
        success: true,
        data: { run }
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Run non trouvé'
      });
    }
  },

  /**
   * Crée un nouveau run
   */
  async createRun(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      const runData = {
        ...req.body,
        userId: req.user.userId
      };

      const run = await runService.createRun(runData);

      res.status(201).json({
        success: true,
        message: 'Run créé avec succès',
        data: { run }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création du run'
      });
    }
  },

  /**
   * Vérifie un run (modérateurs uniquement)
   */
  async verifyRun(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await runService.verifyRun(id);

      res.json({
        success: true,
        message: 'Run vérifié avec succès',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la vérification du run'
      });
    }
  },

  /**
   * Ajoute un commentaire à un run
   */
  async addComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      const { id } = req.params;
      const { content } = req.body;

      const commentData = {
        content,
        userId: req.user.userId,
        runId: id
      };

      const comment = await runService.addComment(commentData);

      res.status(201).json({
        success: true,
        message: 'Commentaire ajouté avec succès',
        data: { comment }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout du commentaire'
      });
    }
  },

  /**
   * Supprime un run
   */
  async deleteRun(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      const { id } = req.params;
      await runService.deleteRun(id, req.user.userId);

      res.json({
        success: true,
        message: 'Run supprimé avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du run'
      });
    }
  }
}; 