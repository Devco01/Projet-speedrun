import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import prisma from './database';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

interface AuthResult {
  user: any;
  token: string;
}

// Configuration Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Vérifier si l'utilisateur existe déjà avec cet email Google
    let user = await prisma.user.findUnique({
      where: { email: profile.emails?.[0]?.value }
    });

    if (user) {
      // Utilisateur existant, générer un token JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return done(null, { user, token } as AuthResult);
    } else {
      // Nouvel utilisateur, créer un compte
      const newUser = await prisma.user.create({
        data: {
          username: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'user',
          email: profile.emails?.[0]?.value || '',
          password: '', // Pas de mot de passe pour Google OAuth
          profileImage: profile.photos?.[0]?.value,
          bio: `Utilisateur connecté via Google`
        }
      });

      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return done(null, { user: newUser, token } as AuthResult);
    }
  } catch (error) {
    console.error('Erreur lors de l\'authentification Google:', error);
    return done(error as Error, undefined);
  }
}));

// Sérialisation pour les sessions (optionnel si on utilise JWT)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport; 