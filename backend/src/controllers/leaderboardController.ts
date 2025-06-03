import { Request, Response } from 'express';
import { 
  mockRuns, 
  mockUsers,
  mockGames,
  mockCategories,
  getUserById, 
  getGameById,
  getCategoryById,
  formatTime 
} from '../data/mockData';

class LeaderboardController {
  // GET /api/leaderboards - Récupérer les classements globaux
  async getGlobalLeaderboards(req: Request, res: Response) {
    try {
      const { gameId, categoryId, limit = 50, offset = 0 } = req.query;
      
      let filteredRuns = mockRuns.filter(run => run.isVerified);
      
      // Filtres
      if (gameId) {
        filteredRuns = filteredRuns.filter(run => run.gameId === gameId);
      }
      
      if (categoryId) {
        filteredRuns = filteredRuns.filter(run => run.categoryId === categoryId);
      }

      // Grouper par utilisateur/jeu/catégorie et garder le meilleur temps
      const bestRunsByUserGameCategory = filteredRuns.reduce((acc, run) => {
        const key = `${run.userId}_${run.gameId}_${run.categoryId}`;
        if (!acc[key] || acc[key].time > run.time) {
          acc[key] = run;
        }
        return acc;
      }, {} as { [key: string]: any });

      // Trier par temps et créer le classement
      const globalLeaderboard = Object.values(bestRunsByUserGameCategory)
        .sort((a: any, b: any) => a.time - b.time)
        .slice(
          parseInt(offset as string), 
          parseInt(offset as string) + parseInt(limit as string)
        )
        .map((run: any, index) => {
          const user = getUserById(run.userId);
          const game = getGameById(run.gameId);
          const category = getCategoryById(run.categoryId);
          
          return {
            rank: parseInt(offset as string) + index + 1,
            user: user ? {
              id: user.id,
              username: user.username,
              profileImage: user.profileImage
            } : null,
            game: game ? { 
              id: game.id, 
              title: game.title, 
              cover: game.cover 
            } : null,
            category: category ? { 
              id: category.id, 
              name: category.name 
            } : null,
            run: {
              id: run.id,
              time: run.time,
              formattedTime: formatTime(run.time),
              submittedAt: run.submittedAt,
              verifiedAt: run.verifiedAt,
              videoUrl: run.videoUrl
            }
          };
        });

      // Statistiques globales
      const stats = {
        totalVerifiedRuns: filteredRuns.length,
        uniqueRunners: new Set(filteredRuns.map(run => run.userId)).size,
        gamesWithRuns: new Set(filteredRuns.map(run => run.gameId)).size,
        categoriesWithRuns: new Set(filteredRuns.map(run => run.categoryId)).size,
        worldRecord: globalLeaderboard.length > 0 ? globalLeaderboard[0] : null
      };

      res.json({
        success: true,
        data: {
          leaderboard: globalLeaderboard,
          stats
        },
        pagination: {
          total: Object.keys(bestRunsByUserGameCategory).length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des classements globaux:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des classements globaux'
      });
    }
  }

  // GET /api/leaderboards/games/:gameId - Classements d'un jeu spécifique
  async getGameLeaderboards(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const { limit = 100, offset = 0 } = req.query;
      
      const game = getGameById(gameId);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Jeu non trouvé'
        });
      }

      const gameRuns = mockRuns.filter(run => 
        run.gameId === gameId && run.isVerified
      );

      // Grouper par catégorie
      const categoriesLeaderboards = mockCategories
        .filter(cat => cat.gameId === gameId)
        .map(category => {
          const categoryRuns = gameRuns.filter(run => run.categoryId === category.id);
          
          // Meilleur temps par utilisateur pour cette catégorie
          const bestRunsByUser = categoryRuns.reduce((acc, run) => {
            if (!acc[run.userId] || acc[run.userId].time > run.time) {
              acc[run.userId] = run;
            }
            return acc;
          }, {} as { [key: string]: any });

          const leaderboard = Object.values(bestRunsByUser)
            .sort((a: any, b: any) => a.time - b.time)
            .slice(0, 10) // Top 10 par catégorie
            .map((run: any, index) => {
              const user = getUserById(run.userId);
              return {
                rank: index + 1,
                user: user ? {
                  id: user.id,
                  username: user.username,
                  profileImage: user.profileImage
                } : null,
                run: {
                  id: run.id,
                  time: run.time,
                  formattedTime: formatTime(run.time),
                  submittedAt: run.submittedAt,
                  videoUrl: run.videoUrl
                }
              };
            });

          return {
            category: {
              id: category.id,
              name: category.name,
              rules: category.rules
            },
            leaderboard,
            stats: {
              totalRuns: categoryRuns.length,
              uniqueRunners: Object.keys(bestRunsByUser).length,
              worldRecord: leaderboard.length > 0 ? leaderboard[0] : null
            }
          };
        });

      res.json({
        success: true,
        data: {
          game: {
            id: game.id,
            title: game.title,
            cover: game.cover,
            description: game.description
          },
          categories: categoriesLeaderboards,
          stats: {
            totalRuns: gameRuns.length,
            uniqueRunners: new Set(gameRuns.map(run => run.userId)).size,
            categoriesCount: categoriesLeaderboards.length
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des classements du jeu:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des classements du jeu'
      });
    }
  }

  // GET /api/leaderboards/categories/:categoryId - Classement d'une catégorie
  async getCategoryLeaderboard(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const { limit = 100, offset = 0 } = req.query;
      
      const category = getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      const categoryRuns = mockRuns.filter(run => 
        run.categoryId === categoryId && run.isVerified
      );

      // Meilleur temps par utilisateur
      const bestRunsByUser = categoryRuns.reduce((acc, run) => {
        if (!acc[run.userId] || acc[run.userId].time > run.time) {
          acc[run.userId] = run;
        }
        return acc;
      }, {} as { [key: string]: any });

      const leaderboard = Object.values(bestRunsByUser)
        .sort((a: any, b: any) => a.time - b.time)
        .slice(
          parseInt(offset as string), 
          parseInt(offset as string) + parseInt(limit as string)
        )
        .map((run: any, index) => {
          const user = getUserById(run.userId);
          const game = getGameById(run.gameId);
          
          return {
            rank: parseInt(offset as string) + index + 1,
            user: user ? {
              id: user.id,
              username: user.username,
              profileImage: user.profileImage,
              bio: user.bio
            } : null,
            run: {
              id: run.id,
              time: run.time,
              formattedTime: formatTime(run.time),
              submittedAt: run.submittedAt,
              verifiedAt: run.verifiedAt,
              videoUrl: run.videoUrl
            },
            game: game ? { id: game.id, title: game.title } : null
          };
        });

      const game = getGameById(category.gameId);

      res.json({
        success: true,
        data: {
          category: {
            id: category.id,
            name: category.name,
            rules: category.rules
          },
          game: game,
          leaderboard,
          stats: {
            totalEntries: Object.keys(bestRunsByUser).length,
            worldRecord: leaderboard.length > 0 ? leaderboard[0] : null,
            averageTime: categoryRuns.length > 0 
              ? formatTime(categoryRuns.reduce((sum, run) => sum + run.time, 0) / categoryRuns.length)
              : null
          }
        },
        pagination: {
          total: Object.keys(bestRunsByUser).length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du classement de la catégorie:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du classement de la catégorie'
      });
    }
  }

  // GET /api/leaderboards/recent - Runs récents
  async getRecentRuns(req: Request, res: Response) {
    try {
      const { limit = 20, offset = 0, verified = 'true' } = req.query;
      
      let runs = [...mockRuns];
      
      if (verified === 'true') {
        runs = runs.filter(run => run.isVerified);
      }

      const recentRuns = runs
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(
          parseInt(offset as string), 
          parseInt(offset as string) + parseInt(limit as string)
        )
        .map(run => {
          const user = getUserById(run.userId);
          const game = getGameById(run.gameId);
          const category = getCategoryById(run.categoryId);
          
          return {
            id: run.id,
            user: user ? {
              id: user.id,
              username: user.username,
              profileImage: user.profileImage
            } : null,
            game: game ? {
              id: game.id,
              title: game.title,
              cover: game.cover
            } : null,
            category: category ? {
              id: category.id,
              name: category.name
            } : null,
            time: run.time,
            formattedTime: formatTime(run.time),
            submittedAt: run.submittedAt,
            verifiedAt: run.verifiedAt,
            isVerified: run.isVerified,
            videoUrl: run.videoUrl
          };
        });

      res.json({
        success: true,
        data: recentRuns,
        pagination: {
          total: runs.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des runs récents:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des runs récents'
      });
    }
  }

  // GET /api/leaderboards/top-runners - Top runners
  async getTopRunners(req: Request, res: Response) {
    try {
      const { limit = 50, offset = 0, gameId } = req.query;
      
      let runs = mockRuns.filter(run => run.isVerified);
      
      if (gameId) {
        runs = runs.filter(run => run.gameId === gameId);
      }

      // Calculer les statistiques par utilisateur
      const userStats = runs.reduce((acc, run) => {
        if (!acc[run.userId]) {
          const user = getUserById(run.userId);
          acc[run.userId] = {
            user: user,
            totalRuns: 0,
            totalTime: 0,
            bestTime: Infinity,
            categories: new Set(),
            games: new Set(),
            worldRecords: 0
          };
        }
        
        acc[run.userId].totalRuns++;
        acc[run.userId].totalTime += run.time;
        acc[run.userId].bestTime = Math.min(acc[run.userId].bestTime, run.time);
        acc[run.userId].categories.add(run.categoryId);
        acc[run.userId].games.add(run.gameId);
        
        return acc;
      }, {} as any);

      // Calculer les world records par utilisateur
      const categoriesWR = mockCategories.reduce((acc, category) => {
        const categoryRuns = runs.filter(run => run.categoryId === category.id);
        if (categoryRuns.length > 0) {
          const bestRun = categoryRuns.reduce((best, run) => 
            run.time < best.time ? run : best
          );
          acc[category.id] = bestRun.userId;
        }
        return acc;
      }, {} as any);

      // Compter les WR par utilisateur
      Object.values(categoriesWR).forEach((userId: any) => {
        if (userStats[userId]) {
          userStats[userId].worldRecords++;
        }
      });

      const topRunners = Object.values(userStats)
        .map((stats: any) => ({
          user: stats.user ? {
            id: stats.user.id,
            username: stats.user.username,
            profileImage: stats.user.profileImage,
            bio: stats.user.bio
          } : null,
          stats: {
            totalRuns: stats.totalRuns,
            averageTime: formatTime(stats.totalTime / stats.totalRuns),
            bestTime: formatTime(stats.bestTime),
            categoriesPlayed: stats.categories.size,
            gamesPlayed: stats.games.size,
            worldRecords: stats.worldRecords,
            score: stats.worldRecords * 100 + stats.totalRuns * 10 + stats.categories.size * 5
          }
        }))
        .sort((a, b) => b.stats.score - a.stats.score)
        .slice(
          parseInt(offset as string), 
          parseInt(offset as string) + parseInt(limit as string)
        )
        .map((runner, index) => ({
          ...runner,
          rank: parseInt(offset as string) + index + 1
        }));

      res.json({
        success: true,
        data: topRunners,
        pagination: {
          total: Object.keys(userStats).length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du top runners:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du top runners'
      });
    }
  }
}

export default new LeaderboardController(); 