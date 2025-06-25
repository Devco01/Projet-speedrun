import { PrismaClient } from '@prisma/client';

// Configuration simplifiée pour NeonDB
const databaseUrl = process.env.DATABASE_URL;

console.log('🔍 DATABASE_URL reçue:', databaseUrl ? 'Présente' : 'Manquante');
console.log('🔍 Type de protocole:', databaseUrl ? databaseUrl.split('://')[0] : 'N/A');

// Configuration Prisma avec gestion d'erreurs
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
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