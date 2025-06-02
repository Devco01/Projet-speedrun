import mongoose, { Schema, Document } from 'mongoose';

// Interface définissant le document de statistiques
export interface IStatistics extends Document {
  totalUsers: number;
  totalGames: number;
  totalRuns: number;
  totalVerifiedRuns: number;
  popularGames: Array<{
    gameId: string;
    title: string;
    runsCount: number;
  }>;
  recentActivity: Array<{
    type: 'new_run' | 'new_user' | 'new_record';
    timestamp: Date;
    details: Record<string, any>;
  }>;
  lastUpdated: Date;
}

// Schéma pour les statistiques globales
const StatisticsSchema: Schema = new Schema({
  totalUsers: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  totalRuns: { type: Number, default: 0 },
  totalVerifiedRuns: { type: Number, default: 0 },
  popularGames: [{
    gameId: { type: String, required: true },
    title: { type: String, required: true },
    runsCount: { type: Number, default: 0 }
  }],
  recentActivity: [{
    type: { type: String, enum: ['new_run', 'new_user', 'new_record'], required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: Schema.Types.Mixed }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

// Création et export du modèle
export default mongoose.model<IStatistics>('Statistics', StatisticsSchema);

// Schéma pour stocker des statistiques générales de la plateforme
const StatisticsSchemaGeneral = new mongoose.Schema({
  totalRuns: {
    type: Number,
    default: 0
  },
  totalGames: {
    type: Number,
    default: 0
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  mostPopularGames: [{
    gameId: String,
    title: String,
    runCount: Number
  }],
  recentRecords: [{
    runId: String,
    gameId: String,
    gameTitle: String,
    categoryName: String,
    username: String,
    time: Number, // temps en secondes
    date: Date
  }],
  popularCategories: [{
    categoryId: String,
    gameId: String,
    name: String,
    runCount: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les activités des utilisateurs (pour le feed d'activité)
const ActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    enum: ['run_submitted', 'run_verified', 'comment_added', 'joined_platform'],
    required: true
  },
  resourceId: String, // ID de la ressource concernée (run, game, etc.)
  gameId: String,
  gameTitle: String,
  categoryId: String,
  categoryName: String,
  runTime: Number, // Pour les actions liées aux runs
  message: String, // Message descriptif de l'activité
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const Activity = mongoose.model('Activity', ActivitySchema); 