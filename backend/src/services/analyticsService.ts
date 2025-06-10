import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface pour les événements d'activité
interface ActivityEvent {
  userId: string;
  username: string;
  action: string;
  type: 'registration' | 'run' | 'record' | 'race' | 'pb' | 'login';
  gameId?: string;
  gameName?: string;
  time?: number;
  timestamp: Date;
}

// Schéma MongoDB simple pour les événements
const activityEventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  action: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['registration', 'run', 'record', 'race', 'pb', 'login']
  },
  gameId: String,
  gameName: String,
  time: Number,
  timestamp: { type: Date, default: Date.now, index: true }
});

const ActivityEvent = mongoose.model<ActivityEvent>('ActivityEvent', activityEventSchema);

class AnalyticsService {

  /**
   * Enregistre un événement d'activité en temps réel
   */
  async recordActivity(event: Partial<ActivityEvent>): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.log('📦 MongoDB non connecté - événement non enregistré');
        return;
      }

      const activityEvent = new ActivityEvent({
        ...event,
        timestamp: new Date()
      });

      await activityEvent.save();
      console.log(`📊 Événement enregistré: ${event.type} par ${event.username}`);
    } catch (error) {
      console.error('❌ Erreur enregistrement activité:', error);
    }
  }

  /**
   * Récupère le tableau de bord analytics avec VRAIES données
   */
  async getDashboardData(days: number = 7): Promise<any> {
    try {
      // Métriques de croissance réelles
      const platformGrowth = await this.calculateRealGrowthMetrics(days);

      // Activité quotidienne réelle
      const dailyActivity = await this.getRealDailyActivity(days);

      // Top performers réels
      const topPerformers = await this.getRealTopPerformers();

      // Popularité des jeux réelle
      const gamePopularity = await this.getRealGamePopularity();

      console.log('📊 Données analytics RÉELLES chargées');
      return {
        platformGrowth,
        dailyActivity,
        topPerformers,
        gamePopularity
      };
    } catch (error) {
      console.error('❌ Erreur analytics réelles:', error);
      return this.getFallbackData();
    }
  }

  /**
   * Récupère le feed d'activité récente depuis MongoDB
   */
  async getActivityFeed(limit: number = 10): Promise<any[]> {
    try {
      if (mongoose.connection.readyState !== 1) {
        return [];
      }

      const recentActivity = await ActivityEvent.find()
        .sort({ timestamp: -1 })
        .limit(limit);

      return recentActivity.map(event => ({
        id: event._id.toString(),
        username: event.username,
        action: event.action,
        timestamp: event.timestamp.toISOString(),
        type: event.type
      }));
    } catch (error) {
      console.error('❌ Erreur feed activité:', error);
      return [];
    }
  }

  /**
   * Calcule les VRAIES métriques de croissance depuis PostgreSQL
   */
  private async calculateRealGrowthMetrics(days: number): Promise<any> {
    try {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 14);

      // Nouveaux utilisateurs cette semaine vs semaine précédente
      const currentWeekUsers = await prisma.user.count({
        where: { createdAt: { gte: weekAgo } }
      });
      const previousWeekUsers = await prisma.user.count({
        where: { 
          createdAt: { 
            gte: twoWeeksAgo,
            lt: weekAgo 
          } 
        }
      });

      // Nouvelles courses cette semaine vs semaine précédente
      const currentWeekRaces = await prisma.race.count({
        where: { createdAt: { gte: weekAgo } }
      });
      const previousWeekRaces = await prisma.race.count({
        where: { 
          createdAt: { 
            gte: twoWeeksAgo,
            lt: weekAgo 
          } 
        }
      });

      const usersGrowth = previousWeekUsers > 0 
        ? ((currentWeekUsers - previousWeekUsers) / previousWeekUsers) * 100 
        : 0;
      const runsGrowth = previousWeekRaces > 0 
        ? ((currentWeekRaces - previousWeekRaces) / previousWeekRaces) * 100 
        : 0;
      const weeklyGrowth = (usersGrowth + runsGrowth) / 2;

      return {
        usersGrowth: Number(usersGrowth.toFixed(1)),
        runsGrowth: Number(runsGrowth.toFixed(1)),
        weeklyGrowth: Number(weeklyGrowth.toFixed(1))
      };
    } catch (error) {
      console.error('❌ Erreur calcul croissance réelle:', error);
      return { usersGrowth: 0, runsGrowth: 0, weeklyGrowth: 0 };
    }
  }

  /**
   * Activité quotidienne RÉELLE des derniers jours
   */
  private async getRealDailyActivity(days: number): Promise<any[]> {
    try {
      const dailyData = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const newUsers = await prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        });

        const newRuns = await prisma.race.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        });

        // Compter les "records" comme les courses terminées avec des temps
        const newRecords = await prisma.raceParticipant.count({
          where: {
            finishTime: { not: null },
            race: {
              createdAt: {
                gte: date,
                lt: nextDate
              }
            }
          }
        });

        dailyData.push({
          date: date.toISOString(),
          newUsers,
          newRuns,
          newRecords
        });
      }

      return dailyData;
    } catch (error) {
      console.error('❌ Erreur activité quotidienne réelle:', error);
      return [];
    }
  }

  /**
   * VRAIS top performers depuis PostgreSQL
   */
  private async getRealTopPerformers(): Promise<any[]> {
    try {
      const races = await prisma.race.findMany({
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      // Calculer les stats par utilisateur
      const userStats = new Map();
      
      races.forEach(race => {
        race.participants.forEach(participant => {
          const userId = participant.user.id;
          const username = participant.user.username;
          
          if (!userStats.has(userId)) {
            userStats.set(userId, {
              username,
              runCount: 0,
              finishedRuns: 0,
              totalTime: 0,
              bestTime: Infinity
            });
          }

          const stats = userStats.get(userId);
          stats.runCount++;
          
          if (participant.finishTime) {
            stats.finishedRuns++;
            stats.totalTime += participant.finishTime;
            if (participant.finishTime < stats.bestTime) {
              stats.bestTime = participant.finishTime;
            }
          }
        });
      });

      // Convertir en tableau et calculer moyennes
      const performers = Array.from(userStats.values())
        .map(stats => ({
          username: stats.username,
          runCount: stats.runCount,
          bestTime: stats.bestTime === Infinity ? 0 : stats.bestTime,
          avgTime: stats.finishedRuns > 0 ? Math.round(stats.totalTime / stats.finishedRuns) : 0
        }))
        .sort((a, b) => b.runCount - a.runCount)
        .slice(0, 8);

      return performers;
    } catch (error) {
      console.error('❌ Erreur top performers réels:', error);
      return [];
    }
  }

  /**
   * VRAIE popularité des jeux depuis PostgreSQL
   */
  private async getRealGamePopularity(): Promise<any[]> {
    try {
      const races = await prisma.race.findMany({
        include: {
          participants: true
        }
      });

      // Grouper par jeu
      const gameStats = new Map();
      
      races.forEach(race => {
        const gameTitle = race.gameName;
        
        if (!gameStats.has(gameTitle)) {
          gameStats.set(gameTitle, {
            runCount: 0,
            uniqueRunners: new Set(),
            totalTime: 0,
            finishedRuns: 0
          });
        }

        const stats = gameStats.get(gameTitle);
        stats.runCount++;
        
        race.participants.forEach(participant => {
          stats.uniqueRunners.add(participant.userId);
          if (participant.finishTime) {
            stats.totalTime += participant.finishTime;
            stats.finishedRuns++;
          }
        });
      });

      // Convertir en tableau
      const popularity = Array.from(gameStats.entries())
        .map(([gameTitle, stats]) => ({
          gameTitle,
          runCount: stats.runCount,
          uniqueRunners: stats.uniqueRunners.size,
          avgTime: stats.finishedRuns > 0 ? Math.round(stats.totalTime / stats.finishedRuns) : 0
        }))
        .sort((a, b) => b.runCount - a.runCount)
        .slice(0, 8);

      return popularity;
    } catch (error) {
      console.error('❌ Erreur popularité jeux réelle:', error);
      return [];
    }
  }

  /**
   * Données de fallback si erreur
   */
  private getFallbackData(): any {
    return {
      platformGrowth: {
        usersGrowth: 0,
        runsGrowth: 0,
        weeklyGrowth: 0
      },
      dailyActivity: [],
      topPerformers: [],
      gamePopularity: []
    };
  }

  /**
   * Synchronise les données PostgreSQL vers MongoDB au démarrage
   */
  async syncExistingData(): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.log('📦 MongoDB non connecté - pas de sync');
        return;
      }

      // Vérifier si des événements existent déjà
      const existingEvents = await ActivityEvent.countDocuments();
      if (existingEvents > 0) {
        console.log('📊 Événements analytics déjà présents');
        return;
      }

      // Synchroniser les inscriptions utilisateurs
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' }
      });

      for (const user of users) {
        await this.recordActivity({
          userId: user.id,
          username: user.username,
          action: 'a rejoint la plateforme',
          type: 'registration' as const,
          timestamp: user.createdAt
        });
      }

      // Synchroniser les courses
      const races = await prisma.race.findMany({
        include: {
          createdBy: true,
          participants: {
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      for (const race of races) {
        // Événement création de course
        await this.recordActivity({
          userId: race.createdBy.id,
          username: race.createdBy.username,
          action: `a créé une course "${race.gameName}"`,
          type: 'race' as const,
          gameId: race.gameId,
          gameName: race.gameName,
          timestamp: race.createdAt
        });

        // Événements participants
        for (const participant of race.participants) {
          if (participant.finishTime) {
            await this.recordActivity({
              userId: participant.user.id,
              username: participant.user.username,
              action: `a terminé la course "${race.gameName}"`,
              type: 'run' as const,
              gameId: race.gameId,
              gameName: race.gameName,
              time: participant.finishTime,
              timestamp: race.updatedAt
            });
          }
        }
      }

      console.log('✅ Données existantes synchronisées vers analytics');
    } catch (error) {
      console.error('❌ Erreur sync données existantes:', error);
    }
  }
}

export default new AnalyticsService(); 