import { Request, Response } from 'express';
import { speedrunApiService } from '../services/speedrunApiService';

export class SpeedrunController {
  /**
   * Récupère les jeux populaires depuis speedrun.com
   */
  async getPopularGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const offset = parseInt(req.query.offset as string) || 0;
      const officialOnly = req.query.officialOnly === 'true';

      console.log(`🎮 Contrôleur getPopularGames: limit=${limit}, offset=${offset}, officialOnly=${officialOnly}`);

      const games = await speedrunApiService.getPopularGames(limit, offset, officialOnly);
      
      // Transformer les données pour notre format
      const transformedGames = games.map(game => speedrunApiService.transformGameData(game));

      // Compter les jeux par type
      const officialCount = transformedGames.filter(g => g.isOfficial).length;
      const communityCount = transformedGames.filter(g => !g.isOfficial).length;

      console.log(`📊 Résultats finaux: ${transformedGames.length} jeux (${officialCount} officiels, ${communityCount} community)`);

      res.json({
        success: true,
        data: transformedGames,
        pagination: {
          limit,
          offset,
          count: transformedGames.length,
          originalCount: games.length
        },
        metadata: {
          officialOnly,
          officialGamesCount: officialCount,
          communityGamesCount: communityCount,
          totalGamesCount: transformedGames.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des jeux populaires:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des jeux populaires'
      });
    }
  }

  /**
   * Recherche des jeux par nom
   */
  async searchGames(req: Request, res: Response) {
    try {
      const { q: query, limit = 30 } = req.query;
      const officialOnly = req.query.officialOnly === 'true';

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre de recherche "q" est requis'
        });
      }

      if (query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Le terme de recherche doit contenir au moins 2 caractères'
        });
      }

      const numLimit = parseInt(limit as string, 10);
      if (isNaN(numLimit) || numLimit < 1 || numLimit > 200) {
        return res.status(400).json({
          success: false,
          message: 'La limite doit être un nombre entre 1 et 200'
        });
      }

      console.log(`🔍 Recherche contrôleur pour: "${query.trim()}" (limite: ${numLimit}, officialOnly: ${officialOnly})`);
      const games = await speedrunApiService.searchGames(query.trim(), numLimit);
      
      // Filtrer par statut officiel si demandé
      const filteredGames = officialOnly 
        ? speedrunApiService.filterAndSortGamesByOfficial(games, true)
        : games;
      
      const transformedGames = filteredGames.map(game => speedrunApiService.transformGameData(game));

      // Compter les jeux par type
      const officialCount = transformedGames.filter(g => g.isOfficial).length;
      const communityCount = transformedGames.filter(g => !g.isOfficial).length;

      res.json({
        success: true,
        data: transformedGames,
        metadata: {
          query: query.trim(),
          resultsCount: transformedGames.length,
          originalCount: games.length,
          limit: numLimit,
          officialOnly,
          officialGamesCount: officialCount,
          communityGamesCount: communityCount,
          note: 'Recherche exhaustive activée pour tous les jeux'
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la recherche de jeux:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche de jeux',
        error: errorMessage,
        data: []
      });
    }
  }

  /**
   * Recherche exhaustive des jeux par nom (récupère TOUS les résultats)
   */
  async searchGamesExhaustive(req: Request, res: Response) {
    try {
      const { q: query, max = 100 } = req.query;
      const officialOnly = req.query.officialOnly === 'true';

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre de recherche "q" est requis'
        });
      }

      if (query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Le terme de recherche doit contenir au moins 2 caractères'
        });
      }

      const numMax = parseInt(max as string, 10);
      if (isNaN(numMax) || numMax < 1 || numMax > 500) {
        return res.status(400).json({
          success: false,
          message: 'Le maximum doit être un nombre entre 1 et 500'
        });
      }

      console.log(`Recherche exhaustive demandée pour: "${query.trim()}" (officialOnly: ${officialOnly})`);
      const games = await speedrunApiService.searchGamesSimple(query.trim(), numMax);
      
      // Filtrer par statut officiel si demandé
      const filteredGames = officialOnly 
        ? speedrunApiService.filterAndSortGamesByOfficial(games, true)
        : games;
      
      const transformedGames = filteredGames.map((game: any) => speedrunApiService.transformGameData(game));

      // Compter les jeux par type
      const officialCount = transformedGames.filter((g: any) => g.isOfficial).length;
      const communityCount = transformedGames.filter((g: any) => !g.isOfficial).length;

      res.json({
        success: true,
        data: transformedGames, // Format attendu par le frontend
        metadata: {
          query: query.trim(),
          resultsCount: transformedGames.length,
          originalCount: games.length,
          maxRequested: numMax,
          officialOnly,
          officialGamesCount: officialCount,
          communityGamesCount: communityCount,
          isExhaustive: true,
          note: 'Cette recherche récupère TOUS les jeux correspondants disponibles sur speedrun.com'
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la recherche exhaustive de jeux:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche exhaustive de jeux',
        error: errorMessage,
        data: [] // Retourner un tableau vide en cas d'erreur
      });
    }
  }

  /**
   * Récupère un jeu par son ID speedrun.com
   */
  async getGameById(req: Request, res: Response) {
    try {
      const { gameId } = req.params;

      const game = await speedrunApiService.getGameById(gameId);
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Jeu non trouvé'
        });
      }

      const transformedGame = speedrunApiService.transformGameData(game);

      res.json({
        success: true,
        data: transformedGame
      });
    } catch (error) {
      console.error(`Erreur lors de la récupération du jeu ${req.params.gameId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du jeu'
      });
    }
  }

  /**
   * Récupère les catégories d'un jeu
   */
  async getGameCategories(req: Request, res: Response) {
    try {
      const { gameId } = req.params;

      const categories = await speedrunApiService.getGameCategories(gameId);
      const transformedCategories = categories.map(category => 
        speedrunApiService.transformCategoryData(category)
      );

      res.json({
        success: true,
        data: transformedCategories,
        gameId,
        count: categories.length
      });
    } catch (error) {
      console.error(`Erreur lors de la récupération des catégories pour ${req.params.gameId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des catégories',
        categories: []
      });
    }
  }

  /**
   * Récupère le leaderboard d'une catégorie
   */
  async getLeaderboard(req: Request, res: Response) {
    try {
      const { gameId, categoryId } = req.params;
      
      console.log(`🏆 Récupération du leaderboard pour jeu: ${gameId}, catégorie: ${categoryId}`);
      
      // Validation basique des IDs
      if (!gameId || !categoryId || gameId.length < 3 || categoryId.length < 3) {
        console.warn(`⚠️ IDs invalides - gameId: "${gameId}", categoryId: "${categoryId}"`);
        return res.status(400).json({
          success: false,
          message: 'IDs de jeu ou catégorie invalides'
        });
      }
      
      // Vérifier d'abord que le jeu existe
      try {
        const gameInfo = await speedrunApiService.getGameById(gameId);
        if (!gameInfo) {
          console.warn(`⚠️ Jeu non trouvé: ${gameId}`);
          return res.status(404).json({
            success: false,
            message: `Le jeu avec l'ID "${gameId}" n'existe pas ou n'est plus accessible`
          });
        }
        console.log(`✅ Jeu trouvé: ${gameInfo.names.international}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la vérification du jeu ${gameId}:`, error);
        return res.status(404).json({
          success: false,
          message: `Le jeu avec l'ID "${gameId}" n'est pas accessible`
        });
      }
      
      const options: {
        top?: number;
        platform?: string;
        region?: string;
        emulators?: boolean;
        'video-only'?: boolean;
        timing?: string;
        date?: string;
        var?: Record<string, string>;
      } = {
        top: parseInt(req.query.top as string) || 10,
        platform: req.query.platform as string,
        region: req.query.region as string,
        emulators: req.query.emulators === 'true',
        'video-only': req.query['video-only'] === 'true',
        timing: req.query.timing as string,
        date: req.query.date as string,
      };

      // Gérer les variables (sous-catégories)
      const variables: Record<string, string> = {};
      Object.keys(req.query).forEach(key => {
        if (key.startsWith('var-')) {
          const varKey = key.replace('var-', '');
          variables[varKey] = req.query[key] as string;
        }
      });

      if (Object.keys(variables).length > 0) {
        options.var = variables;
      }

      console.log(`📋 Options de requête:`, options);

      const leaderboard = await speedrunApiService.getLeaderboard(gameId, categoryId, options);

      if (!leaderboard) {
        console.warn(`⚠️ Leaderboard non trouvé pour ${gameId}/${categoryId}`);
        return res.status(404).json({
          success: false,
          message: `La catégorie "${categoryId}" n'existe pas pour ce jeu ou ne contient aucun run`
        });
      }

      // Transformer les runs
      const transformedRuns = leaderboard.runs.map(runEntry => ({
        placement: runEntry.place,
        run: speedrunApiService.transformRunData(runEntry.run, runEntry.place)
      }));

      console.log(`✅ Leaderboard récupéré avec ${transformedRuns.length} runs`);

      res.json({
        success: true,
        data: {
          gameId,
          categoryId,
          weblink: leaderboard.weblink,
          timing: leaderboard.timing,
          runs: transformedRuns,
          metadata: {
            players: leaderboard.players,
            platforms: leaderboard.platforms,
            regions: leaderboard.regions,
            variables: leaderboard.variables
          }
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error(`❌ Erreur lors de la récupération du leaderboard ${req.params.gameId}/${req.params.categoryId}:`, error);
      
      // Fournir des messages d'erreur plus spécifiques
      if (errorMessage.includes('404')) {
        res.status(404).json({
          success: false,
          message: `La catégorie "${req.params.categoryId}" n'existe pas pour ce jeu`,
          error: 'Catégorie non trouvée'
        });
      } else if (errorMessage.includes('timeout')) {
        res.status(504).json({
          success: false,
          message: 'Délai d\'attente dépassé lors de la récupération du leaderboard',
          error: 'Timeout'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération du leaderboard',
          error: errorMessage
        });
      }
    }
  }

  /**
   * Récupère les runs récents d'un jeu
   */
  async getRecentRuns(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const runs = await speedrunApiService.getRecentRuns(gameId, limit);
      const transformedRuns = runs.map(run => speedrunApiService.transformRunData(run));

      res.json({
        success: true,
        data: transformedRuns,
        gameId,
        count: runs.length
      });
    } catch (error) {
      console.error(`Erreur lors de la récupération des runs récents pour ${req.params.gameId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des runs récents'
      });
    }
  }

  /**
   * Récupère les runs d'un utilisateur speedrun.com
   */
  async getUserRuns(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const runs = await speedrunApiService.getUserRuns(userId, limit);
      const transformedRuns = runs.map(run => speedrunApiService.transformRunData(run));

      res.json({
        success: true,
        data: transformedRuns,
        userId,
        count: runs.length
      });
    } catch (error) {
      console.error(`Erreur lors de la récupération des runs de l'utilisateur ${req.params.userId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des runs de l\'utilisateur'
      });
    }
  }

  /**
   * Teste la connexion à l'API speedrun.com
   */
  async testApiConnection(req: Request, res: Response) {
    try {
      // Test simple : récupérer un jeu populaire
      const games = await speedrunApiService.getPopularGames(1);
      
      if (games.length > 0) {
        res.json({
          success: true,
          message: 'Connexion à l\'API speedrun.com réussie',
          testData: speedrunApiService.transformGameData(games[0])
        });
      } else {
        res.status(503).json({
          success: false,
          message: 'L\'API speedrun.com semble indisponible'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du test de connexion à l\'API speedrun.com:', error);
      res.status(503).json({
        success: false,
        message: 'Erreur de connexion à l\'API speedrun.com',
        error: errorMessage
      });
    }
  }

  /**
   * Récupère les jeux Zelda populaires
   */
  async getPopularZeldaGames(req: Request, res: Response) {
    try {
      console.log('🎮 Demande de jeux Zelda reçue');
      
      // Utiliser temporairement la recherche simple qui fonctionne avec plus de résultats
      const games = await speedrunApiService.searchGamesSimple('zelda', 100);
      console.log(`📊 ${games.length} jeux Zelda trouvés`);
      
      // Transformer les données pour notre format
      const transformedGames = games.map(game => speedrunApiService.transformGameData(game));

      res.json({
        success: true,
        data: transformedGames,
        count: games.length,
        message: `${games.length} jeux Zelda récupérés avec succès`
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des jeux Zelda populaires:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des jeux Zelda populaires',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Debug - Test de connexion de base
   */
  async debugConnection(req: Request, res: Response) {
    try {
      const testData = await speedrunApiService.debugConnection();
      res.json({
        success: true,
        message: 'Connexion debug réussie',
        data: testData
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur debug connexion:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur de connexion debug',
        error: errorMessage
      });
    }
  }

  /**
   * Debug - Recherche simple
   */
  async debugSearch(req: Request, res: Response) {
    try {
      const { q: query = 'mario' } = req.query;
      const games = await speedrunApiService.searchGamesSimple(query as string);
      
      res.json({
        success: true,
        data: games,
        count: games.length,
        query: query
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur debug recherche:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur de recherche debug',
        error: errorMessage
      });
    }
  }

  /**
   * Debug pour tester la recherche Mario
   */
  async debugMarioSearch(req: Request, res: Response) {
    try {
      console.log('🔍 Début du debug de recherche Mario...');
      const result = await speedrunApiService.debugMarioSearch();
      
      res.json({
        success: true,
        data: result,
        message: 'Debug Mario terminé - vérifiez les logs du serveur'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur debug Mario:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du debug Mario',
        error: errorMessage
      });
    }
  }

  /**
   * Récupère les runs récents globaux (toutes catégories/jeux confondus)
   */
  async getGlobalRecentRuns(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      
      console.log(`🏃 Récupération des ${limit} runs récents globaux...`);
      
      // Utiliser directement l'endpoint global de runs récents de speedrun.com
      const recentRuns = await speedrunApiService.getGlobalRecentRuns(limit * 2); // Récupérer plus pour filtrer
      
      if (!recentRuns || recentRuns.length === 0) {
        return res.json({
          success: true,
          data: [],
          metadata: {
            limit,
            count: 0,
            note: 'Aucun run récent trouvé'
          }
        });
      }
      
      // Créer une map pour stocker les infos des jeux
      const gameInfoMap = new Map();
      const gameIds = [...new Set(recentRuns.map(run => run.game))]; // IDs uniques des jeux
      
      // Récupérer les infos des jeux en parallèle (mais limité pour éviter le rate limiting)
      console.log(`📋 Récupération des infos pour ${gameIds.length} jeux uniques...`);
      
      for (const gameId of gameIds.slice(0, 15)) { // Limiter à 15 jeux pour éviter trop d'appels API
        try {
          const gameInfo = await speedrunApiService.getGameById(gameId);
          if (gameInfo) {
            gameInfoMap.set(gameId, {
              id: gameInfo.id,
              name: gameInfo.names.international,
              cover: gameInfo.assets?.['cover-medium']?.uri || gameInfo.assets?.['cover-small']?.uri || null
            });
          }
          // Petit délai pour éviter le rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.warn(`⚠️ Impossible de récupérer les infos du jeu ${gameId}:`, error);
        }
      }
      
      // Fonction utilitaire pour formater le temps
      const formatTime = (seconds: number): string => {
        if (!seconds || isNaN(seconds)) return 'Temps invalide';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);

        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        } else if (minutes > 0) {
          return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        } else {
          return `${secs}.${ms.toString().padStart(3, '0')}s`;
        }
      };
      
      // Transformer et filtrer les runs
      const transformedRuns = recentRuns
        .filter(run => {
          // Filtrer les runs avec temps valide
          const hasValidTime = run.times && run.times.primary_t && !isNaN(run.times.primary_t);
          return hasValidTime;
        })
        .map(run => {
          // Transformer le run en utilisant transformRunData
          const transformedRun = speedrunApiService.transformRunData(run);
          const gameInfo = gameInfoMap.get(run.game);
          
          return {
            id: transformedRun.id,
            user: {
              id: transformedRun.externalData?.speedruncom?.players?.[0]?.id || 'unknown',
              username: transformedRun.playerName || 'Joueur inconnu',
              profileImage: null
            },
            game: {
              id: run.game, // Utiliser l'ID original du run
              title: gameInfo?.name || 'Jeu inconnu',
              cover: gameInfo?.cover || null
            },
            category: {
              id: run.category, // Utiliser l'ID original du run
              name: 'Catégorie inconnue' // Il faudrait récupérer le nom de la catégorie séparément
            },
            time: transformedRun.time,
            formattedTime: formatTime(transformedRun.time),
            submittedAt: transformedRun.submittedAt.toISOString(),
            verifiedAt: transformedRun.verifiedAt?.toISOString() || null,
            isVerified: transformedRun.isVerified
          };
        })
        .filter(run => {
          // Validation finale
          const isValid = run.id && run.game.id && run.time && !isNaN(run.time);
          
          if (!isValid) {
            console.warn(`❌ Run rejeté - données invalides:`, {
              id: run.id,
              gameId: run.game?.id,
              gameTitle: run.game?.title,
              time: run.time
            });
          }
          
          return isValid;
        })
        .slice(0, limit); // Limiter au nombre demandé
      
      console.log(`✅ ${transformedRuns.length} runs récents valides récupérés avec succès`);
      
      res.json({
        success: true,
        data: transformedRuns,
        metadata: {
          limit,
          count: transformedRuns.length,
          totalGames: gameInfoMap.size,
          note: 'Runs récents globaux de speedrun.com'
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la récupération des runs récents globaux:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des runs récents',
        error: errorMessage,
        data: []
      });
    }
  }
}

export const speedrunController = new SpeedrunController(); 