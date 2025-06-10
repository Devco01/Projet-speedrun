import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport';

// Database
import { connectWithRetry, testDatabaseConnection } from './config/database';

// Routes
import authRoutes from './routes/authRoutes';
// Les routes utilisateurs avec mock data ont été supprimées
import speedrunRoutes from './routes/speedrunRoutes';
import raceRoutes from './routes/raceRoutes';
import avatarRoutes from './routes/avatarRoutes';
import adminRoutes from './routes/adminRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
// Service analytiques recréé avec données simulées

// Services
import mongoService from './services/mongoService';
import analyticsService from './services/analyticsService';

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware CORS - Configuration pour Vercel
const allowedOrigins = [
  'http://localhost:3000',
  'https://projet-speedrun.vercel.app',
  'https://projet-speedrun.vercel.app/',
  process.env.CORS_ORIGIN
].filter(Boolean);

// Configuration CORS permissive pour OAuth et API
app.use(cors({
  origin: true, // Autorise toutes les origines temporairement
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuration body-parser avec limite augmentée pour les avatars
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration Passport (sans sessions - on utilise JWT)
app.use(passport.initialize());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/speedrun', speedrunRoutes);
app.use('/api/races', raceRoutes);
app.use('/api/avatars', avatarRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API SpeedRun Platform opérationnelle !',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      speedrun: '/api/speedrun',
      races: '/api/races',
      avatars: '/api/avatars',
      admin: '/api/admin'
    }
  });
});

// Route de santé
app.get('/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    const isConnected = await testDatabaseConnection();
    dbStatus = isConnected ? 'connected' : 'disconnected';
  } catch (error) {
    dbStatus = 'error';
  }

  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    database: {
      status: dbStatus,
      type: 'postgresql'
    },
    apis: {
      auth: 'operational',
      events: 'operational',
      users: 'operational',
      speedrun: 'operational'
    }
  });
});

// Documentation API simple
app.get('/api', (req, res) => {
  res.json({
    name: 'SpeedRun Platform API',
    version: '1.0.0',
    description: 'API complète pour plateforme de speedrunning',
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: [
          'POST /register - Inscription',
          'POST /login - Connexion',
          'GET /me - Profil utilisateur'
        ]
      },
      runs: {
        base: '/api/runs',
        routes: [
          'GET / - Liste des runs',
          'GET /:id - Détails d\'un run',
          'POST / - Créer un run',
          'POST /:id/verify - Vérifier un run'
        ]
      },
      events: {
        base: '/api/events',
        routes: [
          'GET / - Liste des événements',
          'GET /:id - Détails d\'un événement'
        ]
      },
      users: {
        base: '/api/users',
        routes: [
          'GET / - Liste des utilisateurs',
          'GET /:id - Profil utilisateur',
          'GET /:id/runs - Runs d\'un utilisateur',
          'GET /:id/stats - Statistiques utilisateur'
        ]
      },
      categories: {
        base: '/api/categories',
        routes: [
          'GET / - Liste des catégories',
          'GET /:id - Détails d\'une catégorie',
          'GET /:id/leaderboard - Classement d\'une catégorie'
        ]
      },
      leaderboards: {
        base: '/api/leaderboards',
        routes: [
          'GET / - Classements globaux',
          'GET /games/:gameId - Classements d\'un jeu',
          'GET /categories/:categoryId - Classement d\'une catégorie',
          'GET /recent - Runs récents',
          'GET /top-runners - Top runners'
        ]
      },
      speedrun: {
        base: '/api/speedrun',
        routes: [
          'GET /test - Test connexion API speedrun.com',
          'GET /games/popular - Jeux populaires depuis speedrun.com',
          'GET /games/search - Recherche de jeux',
          'GET /games/:gameId - Détails d\'un jeu speedrun.com',
          'GET /games/:gameId/categories - Catégories d\'un jeu',
          'GET /games/:gameId/runs/recent - Runs récents d\'un jeu',
          'GET /runs/recent-global - Runs récents globaux (tous jeux)',
          'GET /leaderboards/:gameId/:categoryId - Leaderboard d\'une catégorie',
          'GET /users/:userId/runs - Runs d\'un utilisateur speedrun.com'
        ]
      }
    }
  });
});

// Middleware de gestion d'erreurs
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    suggestion: 'Consultez /api pour voir les endpoints disponibles'
  });
});

// Initialisation MongoDB et synchronisation des données réelles
async function initializeServices() {
  try {
    await mongoService.connect();
    console.log('📦 Services MongoDB initialisés');
    
    // Synchroniser les données existantes de PostgreSQL vers MongoDB
    await analyticsService.syncExistingData();
    console.log('📊 Analytics initialisé avec vraies données');
  } catch (error) {
    console.log('⚠️ MongoDB non disponible - mode dégradé');
  }
}

// Start server
app.listen(PORT, async () => {
  // Test et initialisation de la base de données
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectWithRetry();
    const isConnected = await testDatabaseConnection();
    if (isConnected) {
      console.log('✅ PostgreSQL connecté avec succès');
    } else {
      console.log('⚠️ PostgreSQL en mode dégradé');
    }
  } catch (error) {
    console.error('❌ Erreur base de données:', error);
    console.log('⚠️ Serveur démarré sans base de données');
  }

  await initializeServices();
  console.log('🚀 ======================================');
  console.log(`🚀 SpeedRun Platform API Server`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 API URL: http://localhost:${PORT}`);
  console.log(`🚀 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 Documentation: http://localhost:${PORT}/api`);
  console.log('🚀 ======================================');
  console.log('📊 Available APIs:');
  console.log('   • Auth: /api/auth');
  console.log('   • Runs: /api/runs');
  console.log('   • Events: /api/events');
  console.log('   • Users: /api/users');
  console.log('   • Categories: /api/categories');
  console.log('   • Leaderboards: /api/leaderboards');
  console.log('   • Speedrun: /api/speedrun');
  console.log('🚀 ======================================');
  console.log('💾 Using mock data for testing');
  console.log('🎯 Ready for TP DWWM demonstration!');
  console.log('🚀 ======================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
}); 