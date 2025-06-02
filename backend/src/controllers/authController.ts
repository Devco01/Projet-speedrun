import { Request, Response } from 'express';
import authService from '../services/authService';

/**
 * Contrôleur pour la gestion de l'authentification
 */
export default {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Validation des données
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis'
        });
      }

      const user = await authService.register(username, email, password);

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: { user }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de l\'inscription'
      });
    }
  },

  /**
   * Connexion d'un utilisateur
   */
  async login(req: Request, res: Response) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/nom d\'utilisateur et mot de passe requis'
        });
      }

      const result = await authService.login(emailOrUsername, password);

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Erreur lors de la connexion'
      });
    }
  },

  /**
   * Récupération du profil utilisateur
   */
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      const user = await authService.getUserById(req.user.userId);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Utilisateur non trouvé'
      });
    }
  }
}; 