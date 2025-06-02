import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extension de l'interface Request pour y ajouter l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

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
 * (À implémenter selon vos besoins - pour l'instant, tous les utilisateurs authentifiés sont admin)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Pour l'instant, on considère que tous les utilisateurs authentifiés sont admin
  // Dans un vrai projet, vous vérifieriez le rôle de l'utilisateur en base
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }
  
  next();
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
    next();
  } catch (error) {
    // Continuer même si le token est invalide
    next();
  }
}; 