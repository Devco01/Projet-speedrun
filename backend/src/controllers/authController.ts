import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import passport from '../config/passport';
import prisma from '../config/database';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Stockage temporaire des sessions Google (en mémoire, expire après 5 minutes)
const tempGoogleSessions = new Map<string, { 
  token: string; 
  user: any; 
  expiresAt: number; 
}>();

// Nettoyer les sessions expirées toutes les minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of tempGoogleSessions.entries()) {
    if (now > session.expiresAt) {
      tempGoogleSessions.delete(sessionId);
    }
  }
}, 60000);

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
    console.log('🔐 Début du callback Google OAuth');
    console.log('URL complète:', req.originalUrl);
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers['user-agent']);
    
    // Protection contre les appels multiples - vérifier si le code a déjà été traité
    const authCode = req.query.code as string;
    if (!authCode) {
      console.log('❌ Aucun code d\'autorisation Google fourni');
      const frontendUrl = process.env.FRONTEND_URL || 'https://projet-speedrun.vercel.app';
      return res.redirect(`${frontendUrl}/login?error=missing_auth_code`);
    }
    
    // Créer un identifiant unique pour ce callback pour éviter les conflits
    const callbackId = `${authCode.substring(0, 10)}-${Date.now()}`;
    console.log(`🔄 Traitement du callback ${callbackId}`);
    
    passport.authenticate('google', { session: false }, (err, authResult) => {
      console.log('🔐 Résultat de l\'authentification Passport:', { 
        callbackId,
        hasError: !!err, 
        hasAuthResult: !!authResult,
        errorMessage: err?.message,
        errorCode: err?.code,
        userExists: !!authResult?.user 
      });

      const frontendUrl = process.env.FRONTEND_URL || 'https://projet-speedrun.vercel.app';

      if (err) {
        console.error(`❌ Erreur Google OAuth (${callbackId}):`, err);
        
        // Gestion spécifique de l'erreur "invalid_grant" (code déjà utilisé)
        if (err.code === 'invalid_grant') {
          console.log(`⚠️ Code d'autorisation déjà utilisé (${callbackId}) - redirection vers profil`);
          // Utiliser une redirection HTML au lieu d'une redirection HTTP pour éviter les 502
          return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Redirection en cours...</title>
              <script>
                console.log('🔄 Redirection automatique vers le profil');
                window.location.href = '${frontendUrl}/profile?welcome=true&source=google&note=already_processed';
              </script>
            </head>
            <body>
              <p>Redirection en cours...</p>
            </body>
            </html>
          `);
        }
        
        // Autres erreurs - redirection HTML
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Erreur d'authentification</title>
            <script>
              console.log('❌ Erreur Google OAuth, redirection vers login');
              window.location.href = '${frontendUrl}/login?error=google_auth_failed&details=${encodeURIComponent(err.message)}';
            </script>
          </head>
          <body>
            <p>Erreur d'authentification, redirection...</p>
          </body>
          </html>
        `);
      }

      if (!authResult) {
        console.log(`❌ Pas de résultat d'authentification (${callbackId})`);
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authentification annulée</title>
            <script>
              console.log('❌ Authentification Google annulée');
              window.location.href = '${frontendUrl}/login?error=google_auth_cancelled';
            </script>
          </head>
          <body>
            <p>Authentification annulée, redirection...</p>
          </body>
          </html>
        `);
      }

      // Authentification réussie - utiliser une redirection HTML
      const userData = encodeURIComponent(JSON.stringify(authResult.user));
      console.log(`✅ Authentification réussie (${callbackId}), redirection vers page de succès`);
      console.log('👤 Utilisateur:', authResult.user.username, authResult.user.email);
      
      // Créer une session temporaire sécurisée (expire dans 5 minutes)
      const sessionId = `gs_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
      
      tempGoogleSessions.set(sessionId, {
        token: authResult.token,
        user: authResult.user,
        expiresAt
      });
      
      console.log(`📦 Session temporaire créée: ${sessionId} (expire dans 5min)`);
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentification réussie</title>
          <script>
            console.log('✅ Authentification Google réussie, redirection avec session sécurisée');
            window.location.href = '${frontendUrl}/auth/google/success?session=${sessionId}';
          </script>
        </head>
        <body>
          <p>Authentification réussie, redirection...</p>
        </body>
        </html>
      `);
    })(req, res, next);
  };

  /**
   * Récupérer et consommer une session Google temporaire
   */
  getGoogleSession = (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId || !sessionId.startsWith('gs_')) {
        return res.status(400).json({
          success: false,
          message: 'ID de session invalide'
        });
      }
      
      const session = tempGoogleSessions.get(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session expirée ou introuvable'
        });
      }
      
      // Vérifier l'expiration
      if (Date.now() > session.expiresAt) {
        tempGoogleSessions.delete(sessionId);
        return res.status(410).json({
          success: false,
          message: 'Session expirée'
        });
      }
      
      // Consommer la session (usage unique)
      tempGoogleSessions.delete(sessionId);
      
      console.log(`📦 Session consommée: ${sessionId} pour ${session.user.username}`);
      
      res.json({
        success: true,
        data: {
          token: session.token,
          user: session.user
        }
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération de session Google:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
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

      res.json({
        success: true,
        message: 'Avatar mis à jour avec succès',
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
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