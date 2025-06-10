import mongoose from 'mongoose';
import { Activity } from '../models/StatisticsModel';
import prisma from '../config/database';

interface AnalyticsData {
  dailyActivity: Array<{
    date: string;
    newUsers: number;
    newRuns: number;
    newRecords: number;
  }>;
  topPerformers: Array<{
    username: string;
    runCount: number;
    bestTime: number;
    avgTime: number;
  }>;
  gamePopularity: Array<{
    gameTitle: string;
    runCount: number;
    uniqueRunners: number;
    avgTime: number;
  }>;
  platformGrowth: {
    usersGrowth: number;
    runsGrowth: number;
    weeklyGrowth: number;
  };
}

class AnalyticsService {
  /**
   * Enregistre une activité utilisateur dans MongoDB
   */
  async recordActivity(data: {
    userId: string;
    username: string;
    actionType: 'run_submitted' | 'run_verified' | 'comment_added' | 'joined_platform';
    resourceId?: string;
    gameId?: string;
    gameTitle?: string;
    categoryId?: string;
    categoryName?: string;
    runTime?: number;
    message?: string;
  }) {
    try {
      const activity = new Activity({
        ...data,
        timestamp: new Date()
      });
      
      await activity.save();
      console.log(`📊 Activité enregistrée: ${data.actionType} par ${data.username}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur enregistrement activité:', error);
      return false;
    }
  }

  /**
   * Récupère les analytics complètes du dashboard
   */
  async getDashboardAnalytics(days: number = 30): Promise<AnalyticsData> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // 1. Activité quotidienne (MongoDB)
      const dailyActivity = await Activity.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
            },
            newUsers: {
              $sum: { $cond: [{ $eq: ["$actionType", "joined_platform"] }, 1, 0] }
            },
            newRuns: {
              $sum: { $cond: [{ $eq: ["$actionType", "run_submitted"] }, 1, 0] }
            },
            newRecords: {
              $sum: { $cond: [{ $eq: ["$actionType", "run_verified"] }, 1, 0] }
            }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            date: "$_id",
            newUsers: 1,
            newRuns: 1,
            newRecords: 1,
            _id: 0
          }
        }
      ]);

      // 2. Top performers (PostgreSQL + agrégation)
      const topRunners = await prisma.user.findMany({
        include: {
          runs: {
            where: {
              isVerified: true
            },
            select: {
              time: true
            }
          }
        },
        take: 10
      });

      const topPerformers = topRunners
        .map(user => ({
          username: user.username,
          runCount: user.runs.length,
          bestTime: user.runs.length > 0 ? Math.min(...user.runs.map(r => r.time)) : 0,
          avgTime: user.runs.length > 0 ? user.runs.reduce((sum, r) => sum + r.time, 0) / user.runs.length : 0
        }))
        .filter(p => p.runCount > 0)
        .sort((a, b) => b.runCount - a.runCount);

      // 3. Popularité des jeux (MongoDB)
      const gamePopularity = await Activity.aggregate([
        {
          $match: {
            actionType: "run_submitted",
            gameTitle: { $exists: true },
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: "$gameTitle",
            runCount: { $sum: 1 },
            uniqueRunners: { $addToSet: "$username" },
            avgTime: { $avg: "$runTime" }
          }
        },
        {
          $project: {
            gameTitle: "$_id",
            runCount: 1,
            uniqueRunners: { $size: "$uniqueRunners" },
            avgTime: { $ifNull: ["$avgTime", 0] },
            _id: 0
          }
        },
        {
          $sort: { runCount: -1 }
        },
        {
          $limit: 10
        }
      ]);

      // 4. Croissance de la plateforme
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - 7);

      const [usersThisWeek, usersLastWeek] = await Promise.all([
        prisma.user.count({
          where: { createdAt: { gte: thisWeekStart } }
        }),
        prisma.user.count({
          where: { 
            createdAt: { 
              gte: new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000),
              lt: thisWeekStart
            } 
          }
        })
      ]);

      const [runsThisWeek, runsLastWeek] = await Promise.all([
        prisma.run.count({
          where: { submittedAt: { gte: thisWeekStart } }
        }),
        prisma.run.count({
          where: { 
            submittedAt: { 
              gte: new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000),
              lt: thisWeekStart
            } 
          }
        })
      ]);

      const usersGrowth = usersLastWeek > 0 ? ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100 : 0;
      const runsGrowth = runsLastWeek > 0 ? ((runsThisWeek - runsLastWeek) / runsLastWeek) * 100 : 0;
      const weeklyGrowth = (usersGrowth + runsGrowth) / 2;

      return {
        dailyActivity,
        topPerformers,
        gamePopularity,
        platformGrowth: {
          usersGrowth,
          runsGrowth,
          weeklyGrowth
        }
      };

    } catch (error) {
      console.error('❌ Erreur analytics:', error);
      // Retourner des données vides en cas d'erreur
      return {
        dailyActivity: [],
        topPerformers: [],
        gamePopularity: [],
        platformGrowth: {
          usersGrowth: 0,
          runsGrowth: 0,
          weeklyGrowth: 0
        }
      };
    }
  }

  /**
   * Feed d'activité en temps réel
   */
  async getRecentActivityFeed(limit: number = 20) {
    try {
      const activities = await Activity.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      return activities.map(activity => ({
        id: activity._id,
        username: activity.username,
        action: this.formatActivityMessage(activity),
        timestamp: activity.timestamp,
        type: activity.actionType
      }));
    } catch (error) {
      console.error('❌ Erreur feed activité:', error);
      return [];
    }
  }

  /**
   * Formatage des messages d'activité
   */
  private formatActivityMessage(activity: any): string {
    switch (activity.actionType) {
      case 'run_submitted':
        return `a soumis un run de ${this.formatTime(activity.runTime || 0)} sur ${activity.gameTitle}`;
      case 'run_verified':
        return `a obtenu un run vérifié sur ${activity.gameTitle}`;
      case 'joined_platform':
        return 'a rejoint la plateforme';
      case 'comment_added':
        return `a commenté sur ${activity.gameTitle || 'un run'}`;
      default:
        return 'a effectué une action';
    }
  }

  /**
   * Formatage du temps
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}min ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Cache intelligent des données API externes
   */
  async cacheExternalApiData(key: string, data: any, ttlMinutes: number = 60) {
    try {
      const CacheModel = mongoose.model('Cache', new mongoose.Schema({
        key: { type: String, unique: true },
        data: mongoose.Schema.Types.Mixed,
        expiresAt: { type: Date, index: { expireAfterSeconds: 0 } }
      }));

      await CacheModel.findOneAndUpdate(
        { key },
        { 
          data,
          expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000)
        },
        { upsert: true }
      );

      console.log(`💾 Cache mis à jour: ${key} (expire dans ${ttlMinutes}min)`);
      return true;
    } catch (error) {
      console.error('❌ Erreur cache:', error);
      return false;
    }
  }

  /**
   * Récupération depuis le cache
   */
  async getCachedData(key: string) {
    try {
      const CacheModel = mongoose.model('Cache');
      const cached = await CacheModel.findOne({ key }).lean() as any;
      
      if (cached && cached.expiresAt > new Date()) {
        console.log(`🎯 Cache hit: ${key}`);
        return cached.data;
      }
      
      console.log(`❌ Cache miss: ${key}`);
      return null;
    } catch (error) {
      console.error('❌ Erreur lecture cache:', error);
      return null;
    }
  }
}

export default new AnalyticsService(); 