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

  // Rechercher et charger Super Mario 64 par défaut
  useEffect(() => {
    // Ne charger Mario 64 par défaut que si l'utilisateur n'a pas encore fait de sélection
    if (hasUserSelected) return;
    
    const loadDefaultGame = async () => {
      try {
        setLoadingGames(true);
        setError(null);
        
        // D'abord, récupérer quelques jeux populaires pour la grille
        const popularGamesData = await speedrunApiClient.getPopularGames(12);
        setPopularGames(popularGamesData);
        
        // Rechercher spécifiquement Super Mario 64
        const mario64Results = await speedrunApiClient.searchGames('Super Mario 64', 10);
        
        // Trouver le vrai Super Mario 64
        const mario64 = mario64Results.find(game => 
          game.name.toLowerCase().includes('super mario 64') &&
          !game.name.toLowerCase().includes('hack') &&
          !game.name.toLowerCase().includes('mod')
        );
        
        if (mario64) {
          setSelectedGame(mario64);
        } else {
          if (popularGamesData.length > 0) {
            setSelectedGame(popularGamesData[0]);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du jeu par défaut:', error);
        setError('Erreur lors du chargement du jeu par défaut');
      } finally {
        setLoadingGames(false);
      }
    };

    loadDefaultGame();
  }, [hasUserSelected]);

  // Récupérer les catégories quand un jeu est sélectionné
  useEffect(() => {
    if (!selectedGame) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setError(null);
        const categories = await speedrunApiClient.getGameCategories(selectedGame.id);
        setGameCategories(categories);
        
        // Essayer de trouver une catégorie avec des runs disponibles
        if (categories.length > 0) {
          // Essayer les catégories dans l'ordre de priorité
          const priorityOrder = categories.sort((a, b) => {
            // Priorité aux catégories principales
            if (!a.isMiscellaneous && b.isMiscellaneous) return -1;
            if (a.isMiscellaneous && !b.isMiscellaneous) return 1;
            
            // Ensuite par nom (Any% en premier)
            if (a.name.toLowerCase().includes('any%')) return -1;
            if (b.name.toLowerCase().includes('any%')) return 1;
            
            return a.name.localeCompare(b.name);
          });
          
          // Essayer chaque catégorie jusqu'à en trouver une qui fonctionne
          for (const category of priorityOrder) {
            try {
              const testLeaderboard = await speedrunApiClient.getLeaderboard(
                selectedGame.id, 
                category.id,
                { top: 5, videoOnly: false }
              );
              
              if (testLeaderboard && testLeaderboard.runs && testLeaderboard.runs.length > 0) {
                console.log(`✅ Catégorie fonctionnelle trouvée: ${category.name}`);
                setSelectedCategory(category);
                break;
              }
            } catch (categoryError) {
              console.log(`❌ Catégorie ${category.name} n'a pas de runs disponibles`);
              continue;
            }
          }
          
          // Si aucune catégorie ne fonctionne, sélectionner la première quand même
          if (!selectedCategory) {
            console.log(`⚠️ Aucune catégorie avec des runs trouvée, sélection de la première`);
            setSelectedCategory(priorityOrder[0]);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setError('Erreur lors du chargement des catégories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [selectedGame]);

  // Récupérer le leaderboard quand une catégorie est sélectionnée
  useEffect(() => {
    if (!selectedGame || !selectedCategory) return;

    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        setError(null);
        const leaderboardData = await speedrunApiClient.getLeaderboard(
          selectedGame.id, 
          selectedCategory.id,
          { top: 20, videoOnly: false }
        );
        
        if (leaderboardData && leaderboardData.runs && leaderboardData.runs.length > 0) {
          setLeaderboard(leaderboardData);
        } else {
          // Essayer sans filtres pour voir s'il y a des runs
          const leaderboardWithoutFilters = await speedrunApiClient.getLeaderboard(
            selectedGame.id, 
            selectedCategory.id,
            { top: 50 }
          );
          
          if (leaderboardWithoutFilters && leaderboardWithoutFilters.runs && leaderboardWithoutFilters.runs.length > 0) {
            setLeaderboard(leaderboardWithoutFilters);
          } else {
            setLeaderboard(null);
            setError(`Aucun run trouvé pour la catégorie "${selectedCategory.name}" de ${selectedGame.name}`);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du leaderboard:', error);
        setLeaderboard(null);
        setError(`Impossible de charger le classement pour "${selectedCategory.name}". Cette catégorie n'a peut-être pas de runs disponibles.`);
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
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
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
          {showSearchResults && searchResults.length > 0 && (
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

          {showSearchResults && searchResults.length === 0 && !loadingSearch && searchQuery.length >= 2 && (
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
          ) : gameCategories.length > 0 ? (
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
              {leaderboard.runs.map((entry, index) => (
                <div
                  key={entry.run.id}
                  className={`flex items-center p-4 rounded-lg border transition-colors ${
                    index === 0
                      ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-amber-900/20'
                      : index === 1
                      ? 'border-gray-400/50 bg-gradient-to-r from-gray-800/20 to-slate-800/20'
                      : index === 2
                      ? 'border-orange-500/50 bg-gradient-to-r from-orange-900/20 to-red-900/20'
                      : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Rang */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-lg mr-4">
                    {entry.placement}
                  </div>
                  
                  {/* Informations du run */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        {/* Nom du joueur */}
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            {getPlayerName(entry.run)}
                          </h3>
                        </div>
                        
                        {/* Temps */}
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          <span className="font-mono font-bold text-green-400 text-lg">
                            {formatTime(entry.run.time)}
                          </span>
                        </div>
                        
                        {/* Plateforme */}
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-300">{getPlatformName(entry.run, leaderboard)}</span>
                          {entry.run.isEmulated && (
                            <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs">
                              Émulé
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
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

      {/* Grille des jeux populaires (réduite) */}
      {popularGames.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="mr-3">🌟</span>
            Autres jeux populaires
          </h2>
          
          {loadingGames ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Chargement des jeux populaires...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {popularGames.slice(0, 12).map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className={`group cursor-pointer rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    selectedGame?.id === game.id
                      ? 'border-violet-500 bg-violet-900/20'
                      : 'border-slate-700 hover:border-violet-400 bg-slate-800/50'
                  }`}
                >
                  <div className="p-3">
                    {game.coverImage && (
                      <img
                        src={game.coverImage}
                        alt={game.name}
                        className="w-full h-20 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors truncate">
                      {game.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 