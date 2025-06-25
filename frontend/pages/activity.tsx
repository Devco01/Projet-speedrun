import { useState, useEffect } from 'react';
import { speedrunApiClient, SpeedrunGame, RecentRun, EnrichedRecentRun } from '../services/speedrunApiClient';
import Link from 'next/link';
import useCacheWithExpiry from '../hooks/useCacheWithExpiry';

export default function ActivityPage() {
  // Fonction pour charger les jeux actifs récemment (utilisée par le cache)
  const loadRecentActiveGamesData = async (): Promise<SpeedrunGame[]> => {
    try {
      // Récupérer les runs récents globaux
      const recentRunsData = await speedrunApiClient.getGlobalRecentRuns(50);
      
      // Extraire les jeux uniques des runs récents avec leur dernière activité
      const gameMap = new Map<string, { game: SpeedrunGame; lastActivity: Date }>();
      
      for (const run of recentRunsData) {
        const gameId = run.game.id;
        const runDate = new Date(run.submittedAt);
        
        // Validation renforcée : ignorer les jeux qui ne s'affichent pas correctement
        const hasValidId = gameId && gameId.length >= 3;
        const hasValidTitle = run.game.title && 
                             run.game.title !== 'undefined' && 
                             run.game.title.trim() !== '' && 
                             run.game.title.toLowerCase() !== 'unknown' &&
                             run.game.title.toLowerCase() !== 'untitled';
        const hasValidImage = run.game.cover && 
                             run.game.cover.trim() !== '' && 
                             run.game.cover !== 'undefined' &&
                             (run.game.cover.startsWith('http://') || run.game.cover.startsWith('https://'));
        
        if (!hasValidId || !hasValidTitle || !hasValidImage) {
          console.warn('Jeu ignoré - données d\'affichage invalides:', { 
            id: gameId, 
            title: run.game.title,
            cover: run.game.cover,
            hasValidId,
            hasValidTitle,
            hasValidImage
          });
          continue;
        }
        
        if (!gameMap.has(gameId) || runDate > gameMap.get(gameId)!.lastActivity) {
          // Créer un objet SpeedrunGame à partir des données de run
          const gameData: SpeedrunGame = {
            id: run.game.id,
            name: run.game.title,
            abbreviation: run.game.id, // Fallback
            weblink: `https://www.speedrun.com/games/${run.game.id}`,
            platforms: [],
            genres: [],
            developers: [],
            publishers: [],
            coverImage: run.game.cover || undefined,
            externalData: {
              speedruncom: {
                id: run.game.id,
                abbreviation: run.game.id,
                weblink: `https://www.speedrun.com/games/${run.game.id}`,
                assets: {},
                moderators: {}
              }
            }
          };
          
          gameMap.set(gameId, {
            game: gameData,
            lastActivity: runDate
          });
        }
      }
      
      // Convertir en array et trier par activité la plus récente
      const sortedGames = Array.from(gameMap.values())
        .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
        .slice(0, 18) // Limiter à 18 jeux pour l'affichage
        .map(item => item.game);
      
      return sortedGames;
    } catch (error) {
      console.error('Erreur lors du chargement des jeux actifs récemment:', error);
      throw new Error('Impossible de charger les jeux actifs récemment');
    }
  };

  // Fonction pour charger les runs récents (utilisée par le cache)
  const loadRecentRunsData = async (): Promise<EnrichedRecentRun[]> => {
    try {
      // Récupérer 20 runs récents (plus qu'avant)
      const recentRunsData = await speedrunApiClient.getGlobalRecentRuns(20);
      
      // Filtrer les runs avec des données de jeu valides et affichables
      const validRuns = recentRunsData.filter(run => {
        const hasBasicData = run.id && run.game && run.game.id && run.game.title;
        const hasValidGameId = run.game.id && run.game.id.length >= 3;
        const hasValidGameTitle = run.game.title && 
                                 run.game.title !== 'undefined' && 
                                 run.game.title !== undefined &&
                                 run.game.title.trim() !== '' &&
                                 run.game.title.toLowerCase() !== 'unknown' &&
                                 run.game.title.toLowerCase() !== 'untitled';
        const hasValidCategory = run.category && run.category.name && run.category.name.trim() !== '';
        
        const isValid = hasBasicData && hasValidGameId && hasValidGameTitle && hasValidCategory;
        
        if (!isValid) {
          console.warn('Run ignoré - données d\'affichage invalides:', {
            runId: run.id,
            hasBasicData,
            hasValidGameId,
            hasValidGameTitle,
            hasValidCategory,
            gameId: run.game?.id,
            gameTitle: run.game?.title,
            categoryName: run.category?.name
          });
        }
        return isValid;
      });
      
      // Pas besoin d'enrichir car les données sont déjà complètes
      const enrichedRuns = validRuns.map((run) => ({
        ...run,
        gameDetails: {
          id: run.game.id,
          name: run.game.title,
          abbreviation: run.game.id,
          weblink: `https://www.speedrun.com/games/${run.game.id}`,
          platforms: [],
          genres: [],
          developers: [],
          publishers: [],
          coverImage: run.game.cover || undefined,
          externalData: {
            speedruncom: {
              id: run.game.id,
              abbreviation: run.game.id,
              weblink: `https://www.speedrun.com/games/${run.game.id}`,
              assets: {},
              moderators: {}
            }
          }
        } as SpeedrunGame
      }));
      
      // Trier par date de soumission (plus récent en premier)
      enrichedRuns.sort((a, b) => {
        const dateA = new Date(a.submittedAt);
        const dateB = new Date(b.submittedAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      return enrichedRuns;
    } catch (error) {
      console.error('Erreur lors du chargement des runs récents:', error);
      throw new Error('Impossible de charger les runs récents');
    }
  };

  // Utiliser le cache avec expiration pour les jeux actifs (refresh toutes les 2 heures)
  const {
    data: recentActiveGames,
    loading: loadingGames,
    error: gamesError,
    lastUpdate: gamesLastUpdate,
    refresh: refreshGames
  } = useCacheWithExpiry<SpeedrunGame[]>(
    'recent_active_games',
    loadRecentActiveGamesData,
    { expiryMinutes: 120, refreshOnExpiry: true }
  );

  // Utiliser le cache avec expiration pour les runs récents (refresh toutes les 30 minutes)
  const {
    data: recentRuns,
    loading: loadingRuns,
    error: runsError,
    lastUpdate: runsLastUpdate,
    refresh: refreshRuns
  } = useCacheWithExpiry<EnrichedRecentRun[]>(
    'recent_runs',
    loadRecentRunsData,
    { expiryMinutes: 30, refreshOnExpiry: true }
  );

  // Combiner les erreurs
  const error = gamesError || runsError;

  const formatTime = (seconds: number): string => {
    return speedrunApiClient.formatTime(seconds);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (!date || isNaN(date.getTime())) {
        return 'Date inconnue';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error, dateString);
      return 'Date inconnue';
    }
  };

  const getPlayerName = (run: EnrichedRecentRun): string => {
    return speedrunApiClient.getPlayerNameFromRecentRun(run);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Activité Récente
          </span>
        </h1>
        <p className="text-slate-300 text-lg">
          Découvrez les dernières activités de la communauté speedrunning
        </p>
        
        {/* Indicateur de dernière mise à jour */}
        {(gamesLastUpdate || runsLastUpdate) && (
          <div className="mt-4 text-sm text-slate-400">
            <div className="flex flex-wrap justify-center gap-4">
              {gamesLastUpdate && (
                <div className="flex items-center space-x-2">
                  <span>🎮 Jeux mis à jour :</span>
                  <span>{gamesLastUpdate.toLocaleTimeString('fr-FR')}</span>
                </div>
              )}
              {runsLastUpdate && (
                <div className="flex items-center space-x-2">
                  <span>🏃 Runs mis à jour :</span>
                  <span>{runsLastUpdate.toLocaleTimeString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>



      {error && (
        <div className="bg-red-900/50 border border-red-700/50 text-red-200 px-6 py-4 rounded-lg">
          <p className="font-semibold">Erreur :</p>
          <p>{error}</p>
        </div>
      )}

      {/* Jeux actifs récemment */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Jeux Actifs Récemment
        </h2>
        <p className="text-slate-400 mb-6">
          Les jeux où des runs ont été soumis récemment sur speedrun.com
        </p>
        
        {loadingGames ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Chargement des jeux actifs...</p>
          </div>
        ) : recentActiveGames && recentActiveGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {recentActiveGames.map((game) => (
              <Link key={game.id} href={`/leaderboards?game=${game.id}`}>
                <div className="group cursor-pointer rounded-lg border-2 border-slate-700 hover:border-green-400 bg-slate-800/50 transition-all duration-200 hover:scale-105">
                  <div className="p-2 sm:p-3">
                    {game.coverImage ? (
                      <img
                        src={game.coverImage}
                        alt={game.name}
                        className="w-full h-16 sm:h-20 object-cover rounded-lg mb-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-16 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-xl sm:text-2xl">🎮</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-white text-xs sm:text-sm group-hover:text-green-300 transition-colors truncate leading-tight">
                      {game.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">Aucun jeu actif récemment</p>
          </div>
        )}
      </div>

      {/* Runs récents */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              20 Derniers Runs Soumis
            </h2>
            <p className="text-slate-400">
              Les courses les plus récentes vérifiées sur speedrun.com
            </p>
          </div>
        </div>
        
        {loadingRuns ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Chargement des runs récents...</p>
          </div>
        ) : recentRuns && recentRuns.length > 0 ? (
          <div className="space-y-3">
            {recentRuns.map((run, index) => (
              <Link key={run.id} href={`/leaderboards?game=${run.game.id}&category=${run.category.id}`}>
                <div className="group cursor-pointer bg-slate-800/30 hover:bg-slate-800/60 rounded-xl border border-slate-700/30 hover:border-green-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10">
                  
                  {/* Version Desktop */}
                  <div className="hidden md:flex items-center p-4 space-x-5">
                    {/* Position & Image */}
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center text-white font-mono text-sm font-bold group-hover:from-green-600 group-hover:to-green-500 transition-all duration-300">
                        #{index + 1}
                      </div>
                      
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-600 group-hover:border-green-400 transition-all duration-300">
                        {run.gameDetails?.coverImage ? (
                          <img
                            src={run.gameDetails.coverImage}
                            alt={run.gameDetails.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xl">🎮</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Infos principales */}
                    <div className="flex-grow min-w-0 space-y-1">
                      <h3 className="font-bold text-white text-lg group-hover:text-green-300 transition-colors truncate">
                        {run.gameDetails?.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center text-amber-400">
                          <span className="mr-1">🏆</span>
                          {run.category.name}
                        </span>
                        <span className="flex items-center text-blue-300">
                          <span className="mr-1">👤</span>
                          {getPlayerName(run)}
                        </span>
                      </div>
                    </div>

                    {/* Temps & Statut */}
                    <div className="flex-shrink-0 text-right space-y-2">
                      <div className="text-green-400 font-mono font-black text-xl">
                        {formatTime(run.time)}
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-slate-500 text-xs">
                          {formatDate(run.submittedAt)}
                        </span>
                        {run.isVerified && (
                          <div className="px-2 py-1 bg-green-900/50 text-green-300 rounded-md text-xs font-medium">
                            ✅ Vérifié
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Version Tablette */}
                  <div className="hidden sm:flex md:hidden items-center p-4 space-x-4">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-600">
                          {run.gameDetails?.coverImage ? (
                            <img
                              src={run.gameDetails.coverImage}
                              alt={run.gameDetails.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white">🎮</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-mono">
                          {index + 1}
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-white truncate mb-1">
                        {run.gameDetails?.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 text-xs text-slate-400">
                          <div>{run.category.name} • {getPlayerName(run)}</div>
                          <div>{formatDate(run.submittedAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-mono font-bold text-lg">
                            {formatTime(run.time)}
                          </div>
                          {run.isVerified && (
                            <span className="text-green-300 text-xs">✅</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Version Mobile */}
                  <div className="flex sm:hidden p-3">
                    <div className="flex items-start space-x-3 w-full">
                      {/* Image + Position */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            {run.gameDetails?.coverImage ? (
                              <img
                                src={run.gameDetails.coverImage}
                                alt={run.gameDetails.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-sm">🎮</span>
                              </div>
                            )}
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-mono">
                            {index + 1}
                          </div>
                        </div>
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-grow min-w-0 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-white text-sm leading-tight pr-2">
                            {run.gameDetails?.name}
                          </h3>
                          <div className="text-green-400 font-mono font-bold text-base whitespace-nowrap">
                            {formatTime(run.time)}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-slate-400">
                            <span className="text-amber-400 mr-1">🏆</span>
                            <span className="truncate flex-grow">{run.category.name}</span>
                            {run.isVerified && (
                              <span className="text-green-300 ml-2">✅</span>
                            )}
                          </div>
                          
                          <div className="flex items-center text-xs text-slate-400">
                            <span className="text-blue-300 mr-1">👤</span>
                            <span className="truncate">{getPlayerName(run)}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-slate-500">
                            <span className="mr-1">📅</span>
                            <span>{formatDate(run.submittedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-slate-400 text-3xl">📊</span>
            </div>
            <h3 className="text-slate-300 text-xl font-semibold mb-2">Aucun run récent</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Les derniers runs apparaîtront ici une fois qu'ils seront soumis et vérifiés sur speedrun.com
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 