import { PrismaClient } from '@prisma/client';

// Configuration robuste pour Render PostgreSQL
const databaseUrl = process.env.DATABASE_URL;
let enhancedUrl = databaseUrl;

if (databaseUrl && !databaseUrl.includes('connect_timeout')) {
  // Ajouter les paramètres de timeout si pas déjà présents
  const separator = databaseUrl.includes('?') ? '&' : '?';
  enhancedUrl = `${databaseUrl}${separator}connect_timeout=15&pool_timeout=15&statement_timeout=30000`;
}

// Configuration Prisma avec gestion d'erreurs
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: enhancedUrl
    }
  },
  log: ['error', 'warn'],
  errorFormat: 'pretty'
});

// Fonction de test de connexion
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    return false;
  }
}

// Fonction de reconnexion avec retry
export async function connectWithRetry(maxRetries = 5): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Connexion établie à la base de données');
      return;
    } catch (error) {
      console.error(`❌ Tentative ${i + 1}/${maxRetries} échouée:`, error);
      if (i === maxRetries - 1) {
        throw new Error('Impossible de se connecter à la base de données après plusieurs tentatives');
      }
      // Attendre avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}

// Gérer la fermeture propre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma; 