import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

/**
 * Service pour gérer l'authentification des utilisateurs
 */
export default {
  /**
   * Inscrit un nouvel utilisateur
   */
  async register(username: string, email: string, password: string) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new Error('Cet email est déjà utilisé');
        }
        if (existingUser.username === username) {
          throw new Error('Ce nom d\'utilisateur est déjà pris');
        }
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword
        }
      });

      // Retourner l'utilisateur sans le mot de passe
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Connecte un utilisateur existant
   */
  async login(emailOrUsername: string, password: string) {
    try {
      // Mode développement - authentification simplifiée
      if (process.env.USE_MOCK_DATA === 'true') {
        // Pour la démo, accepter n'importe quel email/password
        if (!emailOrUsername || !password) {
          throw new Error('Email et mot de passe requis');
        }

        // Créer un utilisateur fictif basé sur l'email
        const username = emailOrUsername.includes('@') 
          ? emailOrUsername.split('@')[0] 
          : emailOrUsername;
        
        const mockUser = {
          id: '1',
          username: username,
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Générer un token JWT
        const token = jwt.sign(
          { userId: mockUser.id, email: mockUser.email },
          process.env.JWT_SECRET || 'default_secret',
          { expiresIn: '24h' }
        );

        return {
          user: mockUser,
          token
        };
      }

      // Mode production - utiliser Prisma
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: emailOrUsername },
            { username: emailOrUsername }
          ]
        }
      });

      if (!user) {
        throw new Error('Identifiants incorrects');
      }

      // Vérifier le mot de passe
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('Identifiants incorrects');
      }

      // Générer un token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      // Retourner l'utilisateur et le token
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère les informations d'un utilisateur par son ID
   */
  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Vérifier un token JWT
 */
export const verifyToken = (token: string): AuthUser => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
}; 