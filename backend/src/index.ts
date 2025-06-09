import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/authRoutes';
import runRoutes from './routes/runRoutes';
import eventRoutes from './routes/eventRoutes';
import userRoutes from './routes/userRoutes';
import categoryRoutes from './routes/categoryRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import speedrunRoutes from './routes/speedrunRoutes';
import avatarRoutes from './routes/avatarRoutes';

// Services
import mongoService from './services/mongoService';

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

app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origin (comme Postman) en développement
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Vérifier si l'origin est dans la liste autorisée
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Permettre toutes les URLs Vercel (preview URLs)
    if (origin && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Bloquer les autres origins
    callback(new Error('Non autorisé par CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/runs', runRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/speedrun', speedrunRoutes);
app.use('/api/avatars', avatarRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API SpeedRun Platform opérationnelle !',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      runs: '/api/runs',
      events: '/api/events',
      users: '/api/users',
      categories: '/api/categories',
      leaderboards: '/api/leaderboards',
      speedrun: '/api/speedrun',
      avatars: '/api/avatars'
    }
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    apis: {
      auth: 'operational',
      runs: 'operational',
      events: 'operational',
      users: 'operational',
      categories: 'operational',
      leaderboards: 'operational',
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

// Initialisation MongoDB (optionnel)
async function initializeServices() {
  try {
    await mongoService.connect();
    console.log('📦 Services MongoDB initialisés');
  } catch (error) {
    console.log('⚠️ MongoDB non disponible - mode dégradé');
  }
}

// Start server
app.listen(PORT, async () => {
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