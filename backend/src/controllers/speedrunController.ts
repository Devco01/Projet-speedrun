import { Request, Response } from 'express';
import { speedrunApiService } from '../services/speedrunApiService';

/**
 * Fonctions utilitaires pour l'enrichissement des données
 */
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

const getGamesData = async (gameIds: string[]): Promise<Record<string, any>> => {
  const gamesData: Record<string, any> = {};
  
  // Traitement par petits groupes pour éviter le rate limiting
  const batchSize = 5;
  for (let i = 0; i < gameIds.length; i += batchSize) {
    const batch = gameIds.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (gameId) => {
      try {
        const game = await speedrunApiService.getGameById(gameId);
        if (game) {
          gamesData[gameId] = game;
        }
        // Petit délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`⚠️ Impossible de récupérer le jeu ${gameId}`);
      }
    }));
  }
  
  return gamesData;
};

const getCategoriesData = async (categoryIds: string[]): Promise<Record<string, any>> => {
  const categoriesData: Record<string, any> = {};
  
  // Pour les catégories, on doit faire des appels via les jeux
  // C'est plus complexe, pour l'instant on utilisera un cache local
  for (const categoryId of categoryIds) {
    try {
      // L'API speedrun.com ne permet pas de récupérer directement une catégorie par ID
      // On devra enrichir ça différemment, pour l'instant on garde un placeholder
      categoriesData[categoryId] = {
        id: categoryId,
        name: 'Any%' // Placeholder commun
      };
    } catch (error) {
      console.warn(`⚠️ Impossible de récupérer la catégorie ${categoryId}`);
    }
  }
  
  return categoriesData;
};

const getPlayersData = async (playerIds: string[]): Promise<Record<string, any>> => {
  const playersData: Record<string, any> = {};
  
  // Traitement par petits groupes pour éviter le rate limiting
  const batchSize = 3;
  for (let i = 0; i < playerIds.length; i += batchSize) {
    const batch = playerIds.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (playerId) => {
      try {
        const player = await speedrunApiService.getUserById(playerId);
        if (player) {
          playersData[playerId] = player;
        }
        // Délai plus long pour les utilisateurs (plus sensible au rate limiting)
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.warn(`⚠️ Impossible de récupérer le joueur ${playerId}`);
      }
    }));
  }
  
  return playersData;
};

const getFallbackRuns = async (limit: number): Promise<any[]> => {
  console.log(`🔄 Fallback: récupération depuis jeux populaires...`);
  
  // Logique précédente simplifiée
  const popularGames = await speedrunApiService.getPopularGames(15, 0, false);
  let allRecentRuns: any[] = [];
  const gameInfoMap = new Map();
  
  for (const game of popularGames.slice(0, 10)) {
    try {
      const gameRuns = await speedrunApiService.getRecentRuns(game.id, 3);
      if (gameRuns.length > 0) {
        const transformedRuns = gameRuns.map(run => speedrunApiService.transformRunData(run));
        transformedRuns.forEach(run => run.gameId = game.id);
        
        gameInfoMap.set(game.id, {
          id: game.id,
          name: game.names.international,
          cover: game.assets?.['cover-medium']?.uri || null,
          abbreviation: game.abbreviation
        });
        
        allRecentRuns.push(...transformedRuns);
      }
    } catch (error) {
      console.warn(`⚠️ Erreur fallback pour ${game.names.international}`);
    }
  }
  
  // Transformation simple pour le fallback
  return allRecentRuns
    .slice(0, limit)
    .map(run => {
      const gameInfo = gameInfoMap.get(run.gameId);
      return {
        id: run.id,
        user: {
          id: 'unknown',
          username: run.playerName || 'Joueur inconnu',
          profileImage: null
        },
        game: {
          id: run.gameId,
          title: gameInfo?.name || 'Jeu inconnu',
          cover: gameInfo?.cover || null
        },
        category: {
          id: run.categoryId,
          name: 'Catégorie inconnue'
        },
        time: run.time,
        formattedTime: formatTime(run.time),
        submittedAt: run.submittedAt.toISOString(),
        verifiedAt: run.verifiedAt?.toISOString() || null,
        isVerified: run.isVerified
      };
    });
};

/**
 * Contrôleur pour l'intégration avec l'API speedrun.com
 */
export const speedrunController = {
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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

  /**
   * Récupère les runs récents globaux (toutes catégories/jeux confondus)
   */
  async getGlobalRecentRuns(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      
      console.log(`🏃 Récupération des ${limit} VRAIS derniers runs globaux...`);
      
      // 1. Récupérer les VRAIS derniers runs globaux (sans embed pour éviter [object Object])
      const globalRuns = await speedrunApiService.getGlobalRecentRuns(limit * 2); // Plus pour compenser les filtres
      console.log(`📊 ${globalRuns.length} runs globaux bruts récupérés`);
      
      if (globalRuns.length === 0) {
        console.log(`⚠️ Aucun run global récupéré, fallback vers jeux populaires...`);
        const fallbackRuns = await getFallbackRuns(limit);
        res.json({
          success: true,
          data: fallbackRuns,
          metadata: {
            limit,
            count: fallbackRuns.length,
            note: 'Runs récents (mode fallback)'
          }
        });
        return;
      }
      
      // 2. Récupérer les informations des jeux, catégories et joueurs
      const gameIds = [...new Set(globalRuns.map(run => run.game))];
      const categoryIds = [...new Set(globalRuns.map(run => run.category))];
      const playerIds = [...new Set(globalRuns.flatMap(run => 
        run.players.filter(p => p.rel === 'user' && p.id).map(p => p.id!)
      ))];
      
      console.log(`🎮 Récupération de ${gameIds.length} jeux, ${categoryIds.length} catégories, ${playerIds.length} joueurs...`);
      
      // Récupération en parallèle des données manquantes
      const [gamesData, categoriesData, playersData] = await Promise.all([
        getGamesData(gameIds),
        getCategoriesData(categoryIds),
        getPlayersData(playerIds)
      ]);
      
      console.log(`✅ Données récupérées: ${Object.keys(gamesData).length} jeux, ${Object.keys(categoriesData).length} catégories, ${Object.keys(playersData).length} joueurs`);
      
      // 3. Transformer pour le format attendu par le frontend
      const transformedRuns = globalRuns
        .filter(run => {
          // Filtrer les runs avec temps invalide
          const hasValidTime = run.times?.primary_t && !isNaN(run.times.primary_t);
          if (!hasValidTime) {
            console.warn(`⚠️ Run ${run.id} filtré - temps invalide`);
          }
          return hasValidTime;
        })
        .slice(0, limit) // Limiter au nombre demandé
        .map(run => {
          const gameInfo = gamesData[run.game];
          const categoryInfo = categoriesData[run.category];
          const mainPlayer = run.players.find(p => p.rel === 'user' && p.id);
          const playerInfo = mainPlayer ? playersData[mainPlayer.id!] : null;
          
          // Logs pour debug
          if (!gameInfo) console.warn(`⚠️ Jeu ${run.game} introuvable`);
          if (!categoryInfo) console.warn(`⚠️ Catégorie ${run.category} introuvable`);
          if (!playerInfo && mainPlayer) console.warn(`⚠️ Joueur ${mainPlayer.id} introuvable`);
          
          return {
            id: run.id,
            user: {
              id: playerInfo?.id || mainPlayer?.id || 'unknown',
              username: playerInfo?.names?.international || mainPlayer?.name || run.players.find(p => p.name)?.name || 'Joueur inconnu',
              profileImage: null
            },
            game: {
              id: run.game,
              title: gameInfo?.names?.international || `Jeu ${run.game}`,
              cover: gameInfo?.assets?.['cover-medium']?.uri || gameInfo?.assets?.['cover-small']?.uri || null
            },
            category: {
              id: run.category,
              name: categoryInfo?.name || 'Catégorie inconnue'
            },
            time: run.times.primary_t,
            formattedTime: formatTime(run.times.primary_t),
            submittedAt: run.submitted,
            verifiedAt: run.status['verify-date'] || null,
            isVerified: run.status.status === 'verified'
          };
        });
      
      console.log(`🎯 ${transformedRuns.length} runs finaux transformés`);
      
      res.json({
        success: true,
        data: transformedRuns,
        metadata: {
          limit,
          count: transformedRuns.length,
          note: 'Vrais derniers runs soumis globalement sur speedrun.com'
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la récupération des runs récents globaux:', error);
      
      // Fallback en cas d'erreur
      try {
        console.log('🔄 Tentative de fallback...');
        const fallbackRuns = await getFallbackRuns(req.query.limit ? parseInt(req.query.limit as string) : 20);
        res.json({
          success: true,
          data: fallbackRuns,
          metadata: {
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
            count: fallbackRuns.length,
            note: 'Runs récents (mode fallback)'
          }
        });
        return;
      } catch (fallbackError) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des runs récents',
          error: errorMessage,
          data: []
        });
      }
    }
  }

  // Note: les fonctions utilitaires getFallbackRuns, formatTime, etc. sont maintenant définies en haut du fichier
}; 