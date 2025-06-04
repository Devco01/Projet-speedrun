import { useState, useEffect, useRef } from 'react';
import { speedrunApiClient, SpeedrunGame, LeaderboardEntry, Leaderboard } from '../services/speedrunApiClient';

export default function LeaderboardsPage() {
  const [popularGames, setPopularGames] = useState<SpeedrunGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<SpeedrunGame | null>(null);
  const [gameCategories, setGameCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  
  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpeedrunGame[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUserSelected, setHasUserSelected] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Rechercher et charger Super Mario 64 par défaut (OPTIMISÉ)
  useEffect(() => {
    // Ne charger Mario 64 par défaut que si l'utilisateur n'a pas encore fait de sélection
    if (hasUserSelected) return;
    
    const loadDefaultGame = async () => {
      try {
        setLoadingGames(true);
        setError(null);
        
        // OPTIMISATION : Mario 64 hardcodé avec son ID connu + récupération des jeux populaires en parallèle
        const [popularGamesData] = await Promise.all([
          speedrunApiClient.getPopularGames(12)
        ]);
        
        setPopularGames(popularGamesData);
        
        // Mario 64 hardcodé (ID connu : o1y9wo6q)
        const mario64: SpeedrunGame = {
          id: 'o1y9wo6q',
          name: 'Super Mario 64',
          abbreviation: 'sm64',
          weblink: 'https://www.speedrun.com/sm64',
          releaseDate: new Date('1996-06-23'),
          description: undefined,
          coverImage: 'https://www.speedrun.com/static/game/o1y9wo6q/cover?v=82fa0a4',
          logoImage: 'https://www.speedrun.com/static/theme/e87d4p8q/logo?v=b0fced9',
          backgroundImage: 'https://www.speedrun.com/static/theme/e87d4p8q/background?v=dc04a3b',
          platforms: ['Nintendo 64', 'Wii Virtual Console', 'Wii U Virtual Console', 'Switch'],
          genres: [],
          developers: [],
          publishers: [],
          externalData: {
            speedruncom: {
              id: 'o1y9wo6q',
              abbreviation: 'sm64',
              weblink: 'https://www.speedrun.com/sm64',
              assets: {},
              moderators: {}
            }
          }
        };
        
        setSelectedGame(mario64);
      } catch (error) {
        console.error('Erreur lors du chargement du jeu par défaut:', error);
        setError('Erreur lors du chargement du jeu par défaut');
        
        // Fallback : utiliser le premier jeu populaire
        try {
          const popularGamesData = await speedrunApiClient.getPopularGames(1);
          if (popularGamesData.length > 0) {
            setSelectedGame(popularGamesData[0]);
          }
        } catch (fallbackError) {
          console.error('Erreur de fallback:', fallbackError);
        }
      } finally {
        setLoadingGames(false);
      }
    };

    loadDefaultGame();
  }, [hasUserSelected]);

  // Récupérer les catégories quand un jeu est sélectionné (OPTIMISÉ)
  useEffect(() => {
    if (!selectedGame) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setError(null);
        const categories = await speedrunApiClient.getGameCategories(selectedGame.id);
        
        // Vérifier que categories est défini et est un tableau
        if (categories && Array.isArray(categories)) {
          setGameCategories(categories);
          
          // OPTIMISATION : Sélectionner directement la première catégorie logique sans test
          if (categories.length > 0) {
            // Trier les catégories par priorité mais sans les tester
            const priorityOrder = categories.sort((a, b) => {
              // Priorité aux catégories principales
              if (!a.isMiscellaneous && b.isMiscellaneous) return -1;
              if (a.isMiscellaneous && !b.isMiscellaneous) return 1;
              
              // Ensuite par nom (Any% en premier)
              if (a.name.toLowerCase().includes('any%')) return -1;
              if (b.name.toLowerCase().includes('any%')) return 1;
              
              return a.name.localeCompare(b.name);
            });
            
            // Sélectionner directement la première catégorie prioritaire
            console.log(`✅ Sélection directe de la catégorie: ${priorityOrder[0].name}`);
            setSelectedCategory(priorityOrder[0]);
          }
        } else {
          // Si categories est undefined ou pas un tableau, on initialise avec un tableau vide
          console.warn('Categories est undefined ou invalide:', categories);
          setGameCategories([]);
          setError('Aucune catégorie disponible pour ce jeu');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setGameCategories([]); // Reset en cas d'erreur
        setError('Erreur lors du chargement des catégories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [selectedGame]);

  // Récupérer le leaderboard quand une catégorie est sélectionnée (OPTIMISÉ)
  useEffect(() => {
    if (!selectedGame || !selectedCategory) return;

    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        setError(null);
        
        // OPTIMISATION : Une seule tentative avec paramètres génériques
        const leaderboardData = await speedrunApiClient.getLeaderboard(
          selectedGame.id, 
          selectedCategory.id,
          { top: 20 } // Paramètres simples et génériques
        );
        
        if (leaderboardData && leaderboardData.runs && leaderboardData.runs.length > 0) {
          setLeaderboard(leaderboardData);
        } else {
          setLeaderboard(null);
          setError(`Aucun run disponible pour "${selectedCategory.name}" de ${selectedGame.name}`);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du leaderboard:', error);
        setLeaderboard(null);
        setError(`Impossible de charger le classement pour "${selectedCategory.name}"`);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [selectedGame, selectedCategory]);

  // Recherche de jeux avec debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const delayedSearch = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const results = await speedrunApiClient.searchGames(searchQuery, 8);
        // S'assurer que results est un tableau
        if (Array.isArray(results)) {
          setSearchResults(results);
          setShowSearchResults(true);
        } else {
          console.warn('Résultats de recherche invalides:', results);
          setSearchResults([]);
          setShowSearchResults(false);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]); // Toujours garder un tableau vide en cas d'erreur
        setShowSearchResults(false);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Fermer les résultats de recherche en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGameSelect = (game: SpeedrunGame) => {
    setSelectedGame(game);
    setSelectedCategory(null);
    setLeaderboard(null);
    setShowSearchResults(false);
    setSearchQuery('');
    setHasUserSelected(true);
  };

  const handleSearchResultSelect = (game: SpeedrunGame) => {
    handleGameSelect(game);
  };

  const formatTime = (seconds: number): string => {
    return speedrunApiClient.formatTime(seconds);
  };

  const formatDate = (date: Date): string => {
    try {
      // Vérifier si la date est valide
      if (!date || isNaN(date.getTime())) {
        return 'Date inconnue';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error, date);
      return 'Date inconnue';
    }
  };

  const getPlayerName = (run: any): string => {
    return speedrunApiClient.getPlayerName(run);
  };

  const getPlatformName = (run: any, leaderboardData: any): string => {
    // Essayer d'obtenir le nom de la plateforme depuis les métadonnées du leaderboard
    if (leaderboardData && leaderboardData.metadata && leaderboardData.metadata.platforms) {
      const platformData = leaderboardData.metadata.platforms.data;
      if (platformData && Array.isArray(platformData)) {
        const platform = platformData.find((p: any) => p.id === run.platform);
        if (platform && platform.name) {
          return platform.name;
        }
      }
    }
    
    // Fallback : retourner la plateforme telle quelle si c'est déjà un nom
    if (typeof run.platform === 'string' && run.platform.length > 0 && !run.platform.includes('_')) {
      return run.platform;
    }
    
    // Dernier fallback : nom générique
    return 'Plateforme inconnue';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🏆 Classements Speedrun
          </span>
        </h1>
        <p className="text-slate-300 text-lg">
          Découvrez les meilleurs temps sur les jeux les plus populaires
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700/50 text-red-200 px-6 py-4 rounded-lg">
          <p className="font-semibold">Erreur :</p>
          <p>{error}</p>
        </div>
      )}

      {/* Barre de recherche rapide */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-3">🔍</span>
          Recherche rapide de jeu
        </h2>
        
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tapez le nom d'un jeu (ex: Mario, Zelda, Sonic...)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          
          {loadingSearch && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-500"></div>
            </div>
          )}

          {/* Résultats de recherche */}
          {showSearchResults && searchResults && Array.isArray(searchResults) && searchResults.length > 0 && (
            <div
              ref={searchResultsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
            >
              {searchResults.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleSearchResultSelect(game)}
                  className="flex items-center p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-b-0"
                >
                  {game.coverImage && (
                    <img
                      src={game.coverImage}
                      alt={game.name}
                      className="w-12 h-12 object-cover rounded-lg mr-3 flex-shrink-0"
                    />
                  )}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-white truncate">{game.name}</h3>
                    <p className="text-sm text-slate-400 truncate">
                      {(() => {
                        if (!game.platforms) {
                          return 'Plateformes non disponibles';
                        }
                        
                        if (Array.isArray(game.platforms)) {
                          const validPlatforms = game.platforms
                            .filter(p => p && typeof p === 'string' && p.trim().length > 0)
                            .map(p => p.toString().trim());
                          
                          if (validPlatforms.length === 0) {
                            return 'Plateformes non disponibles';
                          }
                          
                          const displayPlatforms = validPlatforms.slice(0, 2);
                          return displayPlatforms.join(', ') + (validPlatforms.length > 2 ? '...' : '');
                        }
                        
                        if (typeof game.platforms === 'string') {
                          return String(game.platforms).trim() || 'Plateformes non disponibles';
                        }
                        
                        return 'Plateformes non disponibles';
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSearchResults && searchResults && Array.isArray(searchResults) && searchResults.length === 0 && !loadingSearch && searchQuery.length >= 2 && (
            <div
              ref={searchResultsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-4 text-center"
            >
              <p className="text-slate-400">Aucun jeu trouvé pour "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Jeu sélectionné et ses informations */}
      {selectedGame && (
        <div className="card">
          <div className="flex items-center mb-6">
            {selectedGame.coverImage && (
              <img
                src={selectedGame.coverImage}
                alt={selectedGame.name}
                className="w-16 h-16 object-cover rounded-lg mr-4"
              />
            )}
            <div>
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <span className="mr-3">🎮</span>
                {selectedGame.name}
              </h2>
              <p className="text-slate-400">
                {(() => {
                  if (!selectedGame.platforms) {
                    return 'Plateformes non disponibles';
                  }
                  
                  // Si c'est un tableau
                  if (Array.isArray(selectedGame.platforms)) {
                    const validPlatforms = selectedGame.platforms
                      .filter(p => p && typeof p === 'string' && p.trim().length > 0)
                      .map(p => p.toString().trim());
                    
                    return validPlatforms.length > 0 ? validPlatforms.join(', ') : 'Plateformes non disponibles';
                  }
                  
                  // Si c'est une string
                  if (typeof selectedGame.platforms === 'string') {
                    const platformStr = String(selectedGame.platforms).trim();
                    return platformStr || 'Plateformes non disponibles';
                  }
                  
                  // Autre cas - on ne tente pas d'afficher un objet
                  return 'Plateformes non disponibles';
                })()}
              </p>
            </div>
          </div>

          {/* Sélection de catégorie */}
          {loadingCategories ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Chargement des catégories...</p>
            </div>
          ) : gameCategories && gameCategories.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📊 Catégories disponibles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {gameCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      selectedCategory?.id === category.id
                        ? 'border-violet-500 bg-violet-900/20'
                        : 'border-slate-700 hover:border-violet-400 bg-slate-800/50'
                    }`}
                  >
                    <h4 className="font-semibold text-white mb-1">{category.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.isMiscellaneous 
                          ? 'bg-yellow-900/50 text-yellow-300' 
                          : 'bg-green-900/50 text-green-300'
                      }`}>
                        {category.isMiscellaneous ? 'Misc' : 'Principal'}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-300">
                        {category.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-4">Aucune catégorie trouvée pour ce jeu</p>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {selectedGame && selectedCategory && (
        <div className="card">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="mr-3">🏅</span>
            Classement - {selectedCategory.name}
          </h2>
          
          {loadingLeaderboard ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Chargement du classement...</p>
            </div>
          ) : leaderboard && leaderboard.runs.length > 0 ? (
            <div className="space-y-4">
              {/* En-têtes des colonnes */}
              <div className="hidden sm:grid grid-cols-12 gap-4 items-center px-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="col-span-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Rang
                </div>
                <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Joueur
                </div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Temps
                </div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Plateforme
                </div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </div>
              </div>
              
              {leaderboard.runs.map((entry, index) => (
                <div
                  key={entry.run.id}
                  className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg border transition-colors ${
                    index === 0
                      ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-amber-900/20'
                      : index === 1
                      ? 'border-gray-400/50 bg-gradient-to-r from-gray-800/20 to-slate-800/20'
                      : index === 2
                      ? 'border-orange-500/50 bg-gradient-to-r from-orange-900/20 to-red-900/20'
                      : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Colonne Rang */}
                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-lg">
                      {entry.placement}
                    </div>
                  </div>

                  {/* Colonne Joueur */}
                  <div className="col-span-10 sm:col-span-3">
                    <h3 className="font-semibold text-white text-lg">
                      {getPlayerName(entry.run)}
                    </h3>
                  </div>

                  {/* Colonne Temps */}
                  <div className="col-span-6 sm:col-span-2">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      <span className="font-mono font-bold text-green-400 text-lg">
                        {formatTime(entry.run.time)}
                      </span>
                    </div>
                  </div>

                  {/* Colonne Date */}
                  <div className="col-span-6 sm:col-span-2">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      <span className="text-blue-400 text-sm">
                        📅 {formatDate(entry.run.date)}
                      </span>
                    </div>
                  </div>

                  {/* Colonne Plateforme */}
                  <div className="col-span-8 sm:col-span-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-300 text-sm">🎮 {getPlatformName(entry.run, leaderboard)}</span>
                      {entry.run.isEmulated && (
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs">
                          Émulé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Colonne Actions */}
                  <div className="col-span-4 sm:col-span-2 flex justify-end">
                    <div className="flex items-center space-x-2">
                      {entry.run.videoUrl && (
                        <a
                          href={entry.run.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center"
                        >
                          <span className="mr-1">📺</span>
                          Vidéo
                        </a>
                      )}
                      <a
                        href={entry.run.externalData.speedruncom.weblink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Voir sur speedrun.com
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-300 text-lg">Aucun run trouvé pour cette catégorie</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 