import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import passport from '../config/passport';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Validation des entrées
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères'
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'nom d\'utilisateur';
        return res.status(409).json({
          success: false,
          message: `Ce ${field} est déjà utilisé`
        });
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Créer l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword
        },
        select: {
          id: true,
          username: true,
          email: true,
          profileImage: true,
          bio: true,
          createdAt: true
        }
      });

      // Générer un token JWT
      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Inscription réussie !',
        data: {
          user: newUser,
          token
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body; // identifier peut être email ou username

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/nom d\'utilisateur et mot de passe requis'
        });
      }

      // Chercher l'utilisateur par email ou nom d'utilisateur
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { username: identifier }
          ]
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Identifiants invalides'
        });
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Identifiants invalides'
        });
      }

      // Générer un token JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Retourner les données utilisateur (sans le mot de passe)
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Connexion réussie !',
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Test des variables d'environnement Google
   */
  testGoogleConfig = (req: Request, res: Response) => {
    res.json({
      success: true,
      config: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        frontendUrl: process.env.FRONTEND_URL,
        clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...'
      }
    });
  };

  /**
   * Initialiser l'authentification Google
   */
  googleAuth = (req: Request, res: Response, next: any) => {
    // Test temporaire - retourner les informations de config
    return res.json({
      success: true,
      message: 'Route Google OAuth accessible !',
      config: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        frontendUrl: process.env.FRONTEND_URL,
        nodeEnv: process.env.NODE_ENV
      },
      next_step: 'Si cette route fonctionne, le problème vient de Passport'
    });

    // Code d'authentification commenté temporairement
    /*
    // Vérifier que les variables d'environnement sont définies
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Configuration Google OAuth manquante',
        details: 'Variables GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET non définies'
      });
    }

    // Si tout est OK, procéder à l'authentification
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
    */
  };

  /**
   * Callback Google OAuth
   */
  googleCallback = (req: Request, res: Response, next: any) => {
    passport.authenticate('google', { session: false }, (err, authResult) => {
      if (err) {
        console.error('Erreur Google OAuth:', err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
      }

      if (!authResult) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_cancelled`);
      }

      // Rediriger vers le frontend avec le token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/google/success?token=${authResult.token}&user=${encodeURIComponent(JSON.stringify(authResult.user))}`);
    })(req, res, next);
  };

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          profileImage: true,
          bio: true,
          createdAt: true,
          runs: {
            select: {
              id: true,
              time: true,
              isVerified: true,
              submittedAt: true,
              game: {
                select: {
                  title: true
                }
              },
              category: {
                select: {
                  name: true
                }
              }
            },
            orderBy: {
              submittedAt: 'desc'
            },
            take: 5
          },
          _count: {
            select: {
              runs: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      res.json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

export default new AuthController(); 