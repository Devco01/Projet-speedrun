import { useState, useEffect, useRef } from 'react';
import { speedrunApiClient, SpeedrunGame, SpeedrunCategory, Leaderboard } from '../services/speedrunApiClient';

export default function GamesPage() {
  const [popularGames, setPopularGames] = useState<SpeedrunGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<SpeedrunGame | null>(null);
  const [categories, setCategories] = useState<SpeedrunCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SpeedrunCategory | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpeedrunGame[]>([]);
  const [suggestions, setSuggestions] = useState<SpeedrunGame[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'popular' | 'search'>('popular');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Charger les jeux populaires au démarrage
  useEffect(() => {
    loadPopularGames();
  }, []);

  // Gérer les clics en dehors des suggestions pour les fermer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadPopularGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const games = await speedrunApiClient.getPopularGames(24, 0);
      setPopularGames(games);
    } catch (err) {
      setError('Erreur lors du chargement des jeux populaires');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
          return;
        }
        
    setLoadingSuggestions(true);
    try {
      // Utiliser la recherche normale mais avec une limite plus petite pour les suggestions
      const results = await speedrunApiClient.searchGames(query.trim(), 8);
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Fonction de recherche complète
  const searchGames = async (query: string) => {
    if (query.trim().length < 2) return;
    
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      console.log(`Recherche pour: "${query}"`);
      const results = await speedrunApiClient.searchGames(query.trim(), 50);
      
      setSearchResults(results);
      console.log(`Trouvé ${results.length} jeux pour "${query}"`);
      } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError('Erreur lors de la recherche des jeux');
      setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

  // Gérer les changements dans la barre de recherche
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce pour les suggestions (attendre 300ms après que l'utilisateur arrête de taper)
    const timeoutId = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    // Nettoyer le timeout précédent
    return () => clearTimeout(timeoutId);
  };

  // Gérer les touches du clavier pour naviguer dans les suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        searchGames(searchQuery);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else {
          searchGames(searchQuery);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Sélectionner une suggestion
  const selectSuggestion = (game: SpeedrunGame) => {
    setSearchQuery(game.name);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    searchGames(game.name);
  };

  // Sélectionner un jeu
  const handleGameSelect = async (game: SpeedrunGame) => {
    setSelectedGame(game);
    setCategories([]);
    setSelectedCategory(null);
    setLeaderboard(null);
    
    // Charger les catégories du jeu sélectionné
    try {
      setLoading(true);
      const gameCategories = await speedrunApiClient.getGameCategories(game.id);
      setCategories(gameCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setError('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = async (category: SpeedrunCategory) => {
    if (!selectedGame) return;

    try {
      setLoading(true);
      setError(null);
      setSelectedCategory(category);

      // Charger le leaderboard
      const board = await speedrunApiClient.getLeaderboard(
        selectedGame.id,
        category.id,
        { top: 10 }
      );
      setLeaderboard(board);
    } catch (err) {
      setError('Erreur lors du chargement du leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header moderne */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg rounded-t-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">
                🎮 Catalogue des Jeux Speedrun
        </h1>
              <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
                Découvrez les meilleurs speedruns du monde entier avec l'intégration de l'API speedrun.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerte d'erreur */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-400/30 backdrop-blur-sm p-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
          </div>
            </div>
          </div>
        )}

        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-600/30 p-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('popular')}
                className={`flex-1 py-3 px-6 font-medium text-sm transition-all duration-200 rounded-lg ${
                  activeTab === 'popular'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                🔥 Jeux Populaires
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 px-6 font-medium text-sm transition-all duration-200 rounded-lg ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                🔍 Recherche Avancée
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu basé sur l'onglet actif */}
        {activeTab === 'popular' && (
          <div className="bg-gradient-to-br from-slate-800/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-600/30 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">🔥 Jeux Populaires</h2>
                <p className="text-gray-300">Les jeux les plus joués sur speedrun.com</p>
              </div>
            </div>

            {loading && popularGames.length === 0 ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
                <p className="text-gray-300 text-lg">Chargement des jeux populaires...</p>
                <p className="text-gray-400 text-sm mt-2">Recherche des meilleurs jeux avec plusieurs stratégies...</p>
              </div>
            ) : popularGames.length > 0 ? (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold text-indigo-400">{popularGames.length}</span> jeux populaires chargés
                  </p>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Données en temps réel depuis speedrun.com
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {popularGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onSelect={() => handleGameSelect(game)}
                      isSelected={selectedGame?.id === game.id}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-gray-400 text-lg">Aucun jeu populaire trouvé</p>
                <p className="text-gray-500 text-sm mt-2">Essayez d'actualiser ou vérifiez votre connexion</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="bg-gradient-to-br from-slate-800/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-600/30 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">🔍 Recherche Avancée</h2>
              <p className="text-gray-300">Trouvez n'importe quel jeu dans la base de données speedrun.com</p>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => searchQuery.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Rechercher un jeu (ex: Mario, Zelda, Sonic, Castlevania...)"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400"
                    />
                    {loadingSuggestions && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => searchGames(searchQuery)}
                    disabled={loading || !searchQuery.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {loading ? '⏳' : '🔍'} {loading ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>

                {/* Dropdown des suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-12 mt-2 bg-slate-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="p-2">
                      <div className="text-xs text-gray-400 px-3 py-2 border-b border-gray-600/30">
                        💡 Suggestions ({suggestions.length})
                      </div>
                      {suggestions.map((game, index) => (
                        <button
                          key={game.id}
                          onClick={() => selectSuggestion(game)}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-150 flex items-center space-x-3 ${
                            index === selectedSuggestionIndex
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30'
                              : 'hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {speedrunApiClient.getImageUrl(game, 'cover') ? (
                              <img
                                src={speedrunApiClient.getImageUrl(game, 'cover')!}
                                alt={game.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded flex items-center justify-center">
                                <span className="text-sm">🎮</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-200 truncate">
                              {game.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {game.platforms.length > 0 
                                ? `${game.platforms.slice(0, 2).join(', ')}${game.platforms.length > 2 ? '...' : ''}`
                                : 'Multi-plateforme'
                              }
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="text-xs text-blue-400">
                              ↗
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-200">
                      📝 Résultats ({searchResults.length} jeu{searchResults.length > 1 ? 'x' : ''})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        onSelect={() => handleGameSelect(game)}
                        isSelected={selectedGame?.id === game.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-400 text-lg">Aucun résultat pour "{searchQuery}"</p>
                  <p className="text-gray-500 text-sm mt-2">Essayez un terme différent</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Détails du Jeu - Moderne */}
        {selectedGame && (
          <div className="mt-8 bg-gradient-to-br from-slate-800/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-600/30 overflow-hidden">
            {/* Header du jeu */}
            <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedGame.name}</h2>
                  <p className="text-purple-100">🔗 {selectedGame.abbreviation}</p>
                </div>
                <a
                  href={selectedGame.weblink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors shadow-md hover:shadow-lg"
                >
                  📱 Voir sur speedrun.com
                </a>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations du jeu */}
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">ℹ️ Informations</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-600/30">
                      <span className="text-gray-400">Abréviation</span>
                      <span className="font-medium text-indigo-400">{selectedGame.abbreviation}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-600/30">
                      <span className="text-gray-400">Plateformes</span>
                      <span className="font-medium text-gray-300">
                        {selectedGame.platforms.length > 0 ? selectedGame.platforms.slice(0, 3).join(', ') + (selectedGame.platforms.length > 3 ? '...' : '') : 'Non spécifié'}
                      </span>
                  </div>
                    <div className="flex justify-between py-2 border-b border-gray-600/30">
                      <span className="text-gray-400">Genres</span>
                      <span className="font-medium text-gray-300">
                        {selectedGame.genres.length > 0 ? selectedGame.genres.slice(0, 2).join(', ') + (selectedGame.genres.length > 2 ? '...' : '') : 'Non spécifié'}
                      </span>
                    </div>
                  </div>
                  </div>

                {/* Catégories */}
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">🏆 Catégories ({categories.length})</h3>
                  {categories.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => selectCategory(category)}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                            selectedCategory?.id === category.id
                              ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-indigo-400/50 text-indigo-200 shadow-md'
                              : 'bg-slate-700/30 border-gray-600/30 text-gray-300 hover:bg-gradient-to-r hover:from-slate-600/30 hover:to-indigo-500/20 hover:border-indigo-400/30'
                          }`}
                        >
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm opacity-75 mt-1">
                            {category.type} • {category.playerCount} joueur{category.playerCount > 1 ? 's' : ''}
                          </div>
                  </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-3xl mb-2">🎯</div>
                      <p>Aucune catégorie trouvée</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Moderne */}
        {leaderboard && selectedCategory && (
          <div className="mt-8 bg-gradient-to-br from-slate-800/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-600/30 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-8 py-6 text-white">
              <h2 className="text-3xl font-bold">🏆 Leaderboard - {selectedCategory.name}</h2>
              <p className="text-yellow-100 mt-1">Top {leaderboard.runs.length} des meilleurs temps</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-700/80 to-gray-700/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Joueur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Temps
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600/30">
                  {leaderboard.runs.map((entry) => (
                    <tr key={entry.run.id} className="hover:bg-gradient-to-r hover:from-slate-700/30 hover:to-indigo-500/10 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                            entry.placement === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 ring-2 ring-yellow-400' :
                            entry.placement === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 ring-2 ring-gray-400' :
                            entry.placement === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900 ring-2 ring-orange-400' :
                            'bg-gradient-to-r from-blue-400 to-indigo-400 text-blue-900'
                          }`}>
                            {entry.placement === 1 ? '🥇' : entry.placement === 2 ? '🥈' : entry.placement === 3 ? '🥉' : entry.placement}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-200">
                          {speedrunApiClient.getPlayerName(entry.run)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-bold text-gray-100 bg-gradient-to-r from-slate-600/50 to-indigo-600/30 px-3 py-1 rounded shadow-sm border border-gray-600/30">
                          {speedrunApiClient.formatTime(entry.run.time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(entry.run.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          {entry.run.videoUrl && (
                            <a
                              href={entry.run.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-400 hover:text-red-300 hover:underline transition-colors"
                            >
                              📹 Vidéo
                            </a>
                          )}
                          <a
                            href={entry.run.externalData.speedruncom.weblink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                          >
                            🔗 Détails
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant GameCard moderne
function GameCard({ 
  game, 
  onSelect, 
  isSelected 
}: { 
  game: SpeedrunGame; 
  onSelect: () => void; 
  isSelected: boolean; 
}) {
  const coverImage = speedrunApiClient.getImageUrl(game, 'cover');

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-xl border-2 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
        isSelected 
          ? 'border-indigo-400/60 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-lg backdrop-blur-sm' 
          : 'border-gray-600/40 bg-gradient-to-br from-slate-800/60 to-gray-800/60 backdrop-blur-sm hover:border-indigo-400/50 hover:shadow-lg'
      }`}
    >
      {/* Image du jeu */}
      <div className="relative overflow-hidden rounded-t-xl">
        {coverImage ? (
          <img
            src={coverImage}
            alt={game.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-pink-600/30 flex items-center justify-center backdrop-blur-sm">
            <div className="text-4xl">🎮</div>
          </div>
        )}
        
        {/* Badge sélectionné */}
        {isSelected && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
            ✓ Sélectionné
          </div>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="p-4">
        <div className="min-h-[60px] mb-3">
          <h3 
            className={`font-semibold mb-2 group-hover:text-indigo-400 transition-colors leading-tight ${
              isSelected ? 'text-indigo-300' : 'text-gray-200'
            }`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              hyphens: 'auto'
            }}
            title={game.name} // Tooltip pour voir le nom complet
          >
            {game.name}
          </h3>
          
          {/* Information compacte et utile */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            {game.platforms.length > 0 && (
              <span className="text-gray-500">
                {game.platforms.length} plateforme{game.platforms.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        {/* Tags des genres - seulement si on en a et qu'ils sont lisibles */}
        {game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 min-h-[28px]">
            {game.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className={`inline-block px-2 py-1 text-xs rounded-full truncate max-w-[80px] ${
                  isSelected 
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-400/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20'
                }`}
                title={genre}
              >
                {genre}
              </span>
            ))}
            {game.genres.length > 2 && (
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                isSelected 
                  ? 'bg-gradient-to-r from-gray-500/20 to-indigo-500/20 text-gray-300 border border-gray-400/30' 
                  : 'bg-gray-500/20 text-gray-400 border border-gray-400/20'
              }`}>
                +{game.genres.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 