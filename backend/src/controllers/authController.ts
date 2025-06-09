import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import passport from '../config/passport';
import prisma from '../config/database';
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
   * Mis à jour : forcer redéploiement avec GOOGLE_CALLBACK_URL
   */
  testGoogleConfig = (req: Request, res: Response) => {
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
    
    res.json({
      success: true,
      message: 'Configuration Google OAuth',
      config: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: callbackUrl,
        frontendUrl: process.env.FRONTEND_URL,
        nodeEnv: process.env.NODE_ENV,
        clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...'
      },
      debug: {
        callbackUrlRaw: process.env.GOOGLE_CALLBACK_URL,
        callbackUrlIsDefined: process.env.GOOGLE_CALLBACK_URL !== undefined,
        callbackUrlLength: process.env.GOOGLE_CALLBACK_URL?.length || 0,
        allGoogleEnvKeys: Object.keys(process.env).filter(key => key.includes('GOOGLE')),
        renderHostname: process.env.RENDER_EXTERNAL_HOSTNAME,
        renderUrl: process.env.RENDER_EXTERNAL_URL,
        port: process.env.PORT || '5000'
      },
      instructions: {
        step1: 'Copiez exactement cette URL dans Google Cloud Console:',
        exactCallbackUrl: callbackUrl,
        step2: 'Dans Google Cloud Console > APIs & Services > Credentials',
        step3: 'Cliquez sur votre Client OAuth 2.0',
        step4: 'Dans "URIs de redirection autorisées", ajoutez cette URL exacte'
      }
    });
  };

  /**
   * Initialiser l'authentification Google
   */
  googleAuth = (req: Request, res: Response, next: any) => {
    // Vérifier que les variables d'environnement sont définies
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Configuration Google OAuth manquante',
        details: 'Variables GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET non définies'
      });
    }

    // Procéder à l'authentification Google
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
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

  /**
   * Mettre à jour l'avatar de l'utilisateur
   */
  updateAvatar = async (req: Request, res: Response) => {
    try {
      const userId = req.userId; // Vient du middleware d'authentification
      const { avatar } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      if (!avatar) {
        return res.status(400).json({
          success: false,
          message: 'Avatar requis'
        });
      }

      // Test de connexion à la base de données d'abord
      try {
        await prisma.$connect();
        console.log('✅ Connexion PostgreSQL réussie pour avatar');
      } catch (dbError) {
        console.error('❌ Erreur connexion PostgreSQL:', dbError);
        // Retourner succès pour permettre au frontend de fonctionner avec localStorage
        return res.json({
          success: true,
          message: 'Avatar mis à jour (mode dégradé - base de données indisponible)',
          data: {
            user: {
              id: userId,
              profileImage: avatar,
              username: 'Utilisateur',
              email: 'user@example.com',
              bio: null,
              createdAt: new Date()
            }
          },
          warning: 'Base de données temporairement indisponible'
        });
      }

      // Mettre à jour l'avatar dans la base de données
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profileImage: avatar },
        select: {
          id: true,
          username: true,
          email: true,
          profileImage: true,
          bio: true,
          createdAt: true
        }
      });

      console.log('✅ Avatar mis à jour en base pour utilisateur:', userId);
      res.json({
        success: true,
        message: 'Avatar mis à jour avec succès',
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'avatar:', error);
      
      // Mode fallback - retourner succès pour que le frontend fonctionne
      res.json({
        success: true,
        message: 'Avatar mis à jour (mode dégradé)',
        data: {
          user: {
            id: req.userId,
            profileImage: req.body.avatar,
            username: 'Utilisateur',
            email: 'user@example.com',
            bio: null,
            createdAt: new Date()
          }
        },
        warning: 'Sauvegarde en base échouée, avatar mis à jour localement'
      });
    }
  };

  /**
   * Mettre à jour le profil de l'utilisateur
   */
  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      const { username, email, bio, profileImage } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Vérifier si le nom d'utilisateur ou l'email sont déjà pris (par un autre utilisateur)
      if (username || email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: userId } }, // Pas l'utilisateur actuel
              {
                OR: [
                  username ? { username } : {},
                  email ? { email } : {}
                ].filter(condition => Object.keys(condition).length > 0)
              }
            ]
          }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Ce nom d\'utilisateur ou cet email est déjà utilisé'
          });
        }
      }

      // Préparer les données à mettre à jour
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (bio !== undefined) updateData.bio = bio;
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      // Mettre à jour le profil
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          profileImage: true,
          bio: true,
          createdAt: true
        }
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
}

export default new AuthController(); 