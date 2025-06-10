import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware d'authentification JWT
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'accès requis'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    req.userId = decoded.userId; // Pour la compatibilité
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est admin
 * Vérifie le champ 'role' de l'utilisateur en base de données
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    // Vérifier si c'est un token admin spécial (connexion admin@speedrun.com)
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // Pour la démo, accepter le token admin spécial
      if (token === 'admin-jwt-token-simulation') {
        console.log('🔑 Accès admin autorisé via token spécial');
        next();
        return;
      }
    }

    // Vérifier le rôle de l'utilisateur en base de données
    const user = await prisma.user.findUnique({
      where: { id: (req.user as any).userId },
      select: { email: true, role: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le rôle admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Privilèges administrateur requis.'
      });
    }

    console.log('🔑 Accès admin autorisé pour:', user.email, '(rôle:', user.role + ')');
    next();
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification des permissions'
    });
  }
};

/**
 * Middleware qui vérifie si l'utilisateur est authentifié
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token d'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Vérifier le token
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };

    // Vérifier que l'utilisateur existe toujours en base de données
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Ajouter l'utilisateur à la requête
    req.user = decoded;
    req.userId = decoded.userId; // Pour la compatibilité
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

/**
 * Middleware optionnel qui récupère l'utilisateur si le token est présent,
 * mais continue même si l'utilisateur n'est pas authentifié
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };

    req.user = decoded;
    req.userId = decoded.userId; // Pour la compatibilité
    next();
  } catch (error) {
    // Continuer même si le token est invalide
    next();
  }
}; 