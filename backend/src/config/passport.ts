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

// Configuration Google OAuth - CONDITIONNELLE
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CLIENT_ID !== 'your-google-client-id-here') {
  console.log('🔑 Configuration Google OAuth activée');
  
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Vérifier si l'utilisateur existe déjà avec cet email Google
      let user = await prisma.user.findUnique({
        where: { email: profile.emails?.[0]?.value }
      });

      if (user) {
        // Utilisateur existant, mettre à jour l'avatar Google s'il a changé
        const googleAvatar = profile.photos?.[0]?.value;
        if (googleAvatar && user.profileImage !== googleAvatar) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { profileImage: googleAvatar }
          });
        }
        
        // Générer un token JWT
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
} else {
  console.log('⚠️ Google OAuth non configuré - Variables GOOGLE_CLIENT_ID/SECRET manquantes');
  console.log('   Pour activer Google OAuth, configurez ces variables d\'environnement');
}

// Sérialisation pour les sessions (optionnel si on utilise JWT)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport; 