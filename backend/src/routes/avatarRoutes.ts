import express from 'express';
import mongoService from '../services/mongoService';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * GET /api/avatars/me - Récupère l'avatar de l'utilisateur connecté
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const avatar = await mongoService.getUserAvatar(userId);
    res.json({ avatar });
  } catch (error) {
    console.error('Erreur récupération avatar:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/avatars/me - Met à jour l'avatar de l'utilisateur connecté
 */
router.put('/me', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const { avatarData } = req.body;
    if (!avatarData) {
      return res.status(400).json({ error: 'Données d\'avatar manquantes' });
    }

    // Validation des données d'avatar
    if (!avatarData.head || !avatarData.eyes || !avatarData.hair || !avatarData.clothing) {
      return res.status(400).json({ error: 'Données d\'avatar incomplètes' });
    }

    const updatedAvatar = await mongoService.saveUserAvatar(userId, avatarData);
    
    if (!updatedAvatar) {
      return res.status(500).json({ error: 'Échec de la sauvegarde' });
    }

    res.json({ 
      message: 'Avatar mis à jour avec succès',
      avatar: updatedAvatar 
    });
  } catch (error) {
    console.error('Erreur sauvegarde avatar:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/avatars/me - Supprime l'avatar de l'utilisateur (remet par défaut)
 */
router.delete('/me', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const success = await mongoService.deleteUserAvatar(userId);
    
    if (!success) {
      return res.status(500).json({ error: 'Échec de la suppression' });
    }

    res.json({ message: 'Avatar réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur suppression avatar:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/avatars/presets/:presetId - Ajoute un preset aux favoris
 */
router.post('/presets/:presetId', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { presetId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!presetId) {
      return res.status(400).json({ error: 'ID preset manquant' });
    }

    const success = await mongoService.addUserPreset(userId, presetId);
    
    if (!success) {
      return res.status(500).json({ error: 'Échec de l\'ajout du preset' });
    }

    res.json({ message: 'Preset ajouté aux favoris' });
  } catch (error) {
    console.error('Erreur ajout preset:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/avatars/presets/:presetId - Retire un preset des favoris
 */
router.delete('/presets/:presetId', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { presetId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!presetId) {
      return res.status(400).json({ error: 'ID preset manquant' });
    }

    const success = await mongoService.removeUserPreset(userId, presetId);
    
    if (!success) {
      return res.status(500).json({ error: 'Échec de la suppression du preset' });
    }

    res.json({ message: 'Preset retiré des favoris' });
  } catch (error) {
    console.error('Erreur suppression preset:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/avatars/stats - Récupère les statistiques des avatars (admin)
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await mongoService.getAvatarStats();
    res.json({ stats });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/avatars/presets - Récupère les presets d'avatars disponibles
 */
router.get('/presets', async (req, res) => {
  try {
    // Presets prédéfinis pour les avatars
    const presets = [
      {
        id: 'gamer-1',
        name: 'Gamer Classique',
        description: 'Look casual pour speedrunner décontracté',
        avatarData: {
          head: { shape: 'round', color: '#F5C6A0' },
          eyes: { type: 'focused', color: '#4A90E2' },
          hair: { style: 'messy', color: '#8B4513' },
          clothing: { style: 'hoodie', color: '#FF6B6B' },
          accessories: [{ type: 'headphones', color: '#000000' }],
          background: { type: 'gradient', color: '#1E3A8A' }
        }
      },
      {
        id: 'pro-1',
        name: 'Pro Player',
        description: 'Style professionnel pour les compétitions',
        avatarData: {
          head: { shape: 'oval', color: '#D4B5A0' },
          eyes: { type: 'determined', color: '#10B981' },
          hair: { style: 'clean', color: '#374151' },
          clothing: { style: 'esports-jersey', color: '#7C3AED' },
          accessories: [{ type: 'gaming-glasses', color: '#1F2937' }],
          background: { type: 'esports', color: '#000000' }
        }
      },
      {
        id: 'retro-1',
        name: 'Rétro Gamer',
        description: 'Nostalgique des consoles d\'antan',
        avatarData: {
          head: { shape: 'square', color: '#FED7AA' },
          eyes: { type: 'nostalgic', color: '#F59E0B' },
          hair: { style: 'vintage', color: '#DC2626' },
          clothing: { style: 'retro-tee', color: '#059669' },
          accessories: [{ type: 'cap', color: '#EF4444' }],
          background: { type: 'pixelated', color: '#8B5CF6' }
        }
      },
      {
        id: 'speedrun-1',
        name: 'Speedrun Master',
        description: 'Optimisé pour la performance pure',
        avatarData: {
          head: { shape: 'angular', color: '#F3E8FF' },
          eyes: { type: 'laser-focused', color: '#DC2626' },
          hair: { style: 'aerodynamic', color: '#1E40AF' },
          clothing: { style: 'racing-suit', color: '#F59E0B' },
          accessories: [{ type: 'timer-watch', color: '#059669' }],
          background: { type: 'speed-lines', color: '#EF4444' }
        }
      },
      {
        id: 'casual-1',
        name: 'Décontracté',
        description: 'Pour jouer en mode relax',
        avatarData: {
          head: { shape: 'round', color: '#FEF3C7' },
          eyes: { type: 'chill', color: '#06B6D4' },
          hair: { style: 'long', color: '#92400E' },
          clothing: { style: 'casual-shirt', color: '#10B981' },
          accessories: [],
          background: { type: 'nature', color: '#059669' }
        }
      }
    ];

    res.json({ presets });
  } catch (error) {
    console.error('Erreur récupération presets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router; 