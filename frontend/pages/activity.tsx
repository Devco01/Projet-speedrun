import { useState, useEffect } from 'react';
import { speedrunApiClient, SpeedrunGame, RecentRun, EnrichedRecentRun } from '../services/speedrunApiClient';
import Link from 'next/link';

export default function ActivityPage() {
  const [recentActiveGames, setRecentActiveGames] = useState<SpeedrunGame[]>([]);
  const [recentRuns, setRecentRuns] = useState<EnrichedRecentRun[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les jeux actifs récemment
  useEffect(() => {
    const loadRecentActiveGames = async () => {
      try {
        setLoadingGames(true);
        setError(null);
        
        // Récupérer les runs récents globaux
        const recentRunsData = await speedrunApiClient.getGlobalRecentRuns(50);
        
        // Extraire les jeux uniques des runs récents avec leur dernière activité
        const gameMap = new Map<string, { game: SpeedrunGame; lastActivity: Date }>();
        
        for (const run of recentRunsData) {
          const gameId = run.game.id;
          const runDate = new Date(run.submittedAt);
          
          // Validation : ignorer les jeux sans ID valide ou sans nom
          if (!gameId || !run.game.title || gameId.length < 3) {
            console.warn('Jeu ignoré - ID ou nom invalide:', { id: gameId, title: run.game.title });
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
        
        setRecentActiveGames(sortedGames);
      } catch (error) {
        console.error('Erreur lors du chargement des jeux actifs récemment:', error);
        setRecentActiveGames([]);
        setError('Impossible de charger les jeux actifs récemment');
      } finally {
        setLoadingGames(false);
      }
    };

    loadRecentActiveGames();
  }, []);

  // Charger les runs récents
  useEffect(() => {
    const loadRecentRuns = async () => {
      try {
        setLoadingRuns(true);
        
        // Récupérer les runs récents (déjà enrichis par l'API)
        const recentRunsData = await speedrunApiClient.getGlobalRecentRuns(20);
        
        // Filtrer les runs avec des données de jeu valides
        const validRuns = recentRunsData.filter(run => {
          // Validation simplifiée - le backend s'assure déjà que les données sont valides
          const hasBasicData = run.id && run.game && run.game.id && run.game.title;
          const titleNotUndefined = run.game.title !== 'undefined' && run.game.title !== undefined;
          const isValid = hasBasicData && titleNotUndefined;
          
          if (!isValid) {
            console.warn('Run ignoré - données de base manquantes:', {
              runId: run.id,
              hasId: !!run.id,
              hasGame: !!run.game,
              hasGameId: !!run.game?.id,
              hasGameTitle: !!run.game?.title,
              gameTitle: run.game?.title,
              titleNotUndefined
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
        
        setRecentRuns(enrichedRuns);
      } catch (error) {
        console.error('Erreur lors du chargement des runs récents:', error);
        setRecentRuns([]);
      } finally {
        setLoadingRuns(false);
      }
    };

    loadRecentRuns();
  }, []);

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
            ⚡ Activité Récente
          </span>
        </h1>
        <p className="text-slate-300 text-lg">
          Découvrez les dernières activités de la communauté speedrunning
        </p>
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
        ) : recentActiveGames.length > 0 ? (
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
        <h2 className="text-2xl font-semibold text-white mb-6">
          Derniers Runs Soumis
        </h2>
        <p className="text-slate-400 mb-6">
          Les 20 derniers runs soumis sur speedrun.com
        </p>
        
        {loadingRuns ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Chargement des runs récents...</p>
          </div>
        ) : recentRuns.length > 0 ? (
          <div className="space-y-3">
            {recentRuns.map((run, index) => (
              <div
                key={run.id}
                className="flex items-start sm:items-center p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:bg-slate-800/50 transition-colors"
              >
                {/* Jeu */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 mr-3 sm:mr-4">
                  {run.gameDetails?.coverImage ? (
                    <img
                      src={run.gameDetails.coverImage}
                      alt={run.gameDetails.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm">🎮</span>
                    </div>
                  )}
                </div>

                {/* Informations du run */}
                <div className="flex-grow min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                    <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                      {run.gameDetails?.name || 'Jeu inconnu'}
                    </h3>
                    <span className="hidden sm:inline text-slate-400">•</span>
                    <span className="text-green-400 font-mono font-bold text-sm sm:text-base">
                      {formatTime(run.time)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-slate-400">
                    <span className="flex items-center">
                      <span className="mr-1">👤</span>
                      <span className="truncate">{getPlayerName(run)}</span>
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">🏆</span>
                      <span className="truncate">{run.category.name}</span>
                    </span>
                    <span className="hidden sm:flex items-center">
                      <span className="mr-1">📅</span>
                      <span>{formatDate(run.submittedAt)}</span>
                    </span>
                    {run.isVerified && (
                      <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded-full text-xs inline-flex items-center w-fit">
                        <span className="mr-1">✅</span>
                        <span className="hidden sm:inline">Vérifié</span>
                      </span>
                    )}
                  </div>
                  <div className="sm:hidden mt-2 text-xs text-slate-500">
                    📅 {formatDate(run.submittedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">Aucun run récent trouvé</p>
          </div>
        )}
      </div>


    </div>
  );
} 