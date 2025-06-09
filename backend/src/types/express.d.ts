import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      userId?: string; // Pour la compatibilité avec AuthenticatedRequest
    }
  }
} 