import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { speedrunApiClient, SpeedrunGame, LeaderboardEntry, Leaderboard } from '../services/speedrunApiClient';

export default function LeaderboardsPage() {
  const router = useRouter();
  const [popularGames, setPopularGames] = useState<SpeedrunGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<SpeedrunGame | null>(null);
  const [gameCategories, setGameCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  
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

  // Charger le jeu depuis l'URL ou par défaut (OPTIMISÉ)
  useEffect(() => {
    // Attendre que router.query soit prêt
    if (!router.isReady) return;
    
    // Ne charger le jeu par défaut que si l'utilisateur n'a pas encore fait de sélection
    if (hasUserSelected) return;
    
    const loadGameFromUrl = async () => {
      try {
        setLoadingGames(true);
        setError(null);
        
        // Récupérer les jeux populaires en parallèle
        const [popularGamesData] = await Promise.all([
          speedrunApiClient.getPopularGames(12)
        ]);
        
        setPopularGames(popularGamesData);
        
        // Vérifier si un jeu est spécifié dans l'URL
        const gameIdFromUrl = router.query.game as string;
        
        if (gameIdFromUrl) {
          // Charger le jeu spécifié depuis l'URL
          try {
            const gameFromUrl = await speedrunApiClient.getGameById(gameIdFromUrl);
            setSelectedGame(gameFromUrl);
            setHasUserSelected(true); // Marquer comme sélection utilisateur
            return;
          } catch (error) {
            console.error('Erreur lors du chargement du jeu depuis l\'URL:', error);
            // Afficher un message d'erreur plus explicite
            setError(`Le jeu demandé (ID: ${gameIdFromUrl}) n'a pas pu être trouvé. Chargement d'un jeu par défaut...`);
            // Continuer vers le fallback Mario 64
          }
        }
        
        // Mario 64 hardcodé par défaut (ID connu : o1y9wo6q)
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

    loadGameFromUrl();
  }, [router.isReady, router.query.game, hasUserSelected]);

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
          // Filtrer les catégories valides
          const validCategories = categories.filter(cat => {
            const isValid = cat && cat.id && cat.name && cat.id.length >= 3;
            if (!isValid) {
              console.warn('Catégorie ignorée - données invalides:', cat);
            }
            return isValid;
          });
          
          setGameCategories(validCategories);
          
          // OPTIMISATION : Sélectionner directement la première catégorie logique sans test
          if (validCategories.length > 0) {
            // Trier les catégories par priorité mais sans les tester
            const priorityOrder = validCategories.sort((a, b) => {
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
            setCurrentPage(1); // Reset pagination pour nouvelle catégorie
          } else {
            setError('Aucune catégorie valide disponible pour ce jeu');
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
        
        // Toujours récupérer au moins 100 runs pour pouvoir faire de la pagination
        const runsToFetch = 100; // Maximum qu'on peut récupérer
        
        // OPTIMISATION : Une seule tentative avec paramètres génériques
        const leaderboardData = await speedrunApiClient.getLeaderboard(
          selectedGame.id, 
          selectedCategory.id,
          { top: runsToFetch } // Toujours récupérer 100 runs
        );
        
        if (leaderboardData && leaderboardData.runs && leaderboardData.runs.length > 0) {
          setLeaderboard(leaderboardData);
          
          // Calculer le nombre total de pages en fonction des runs disponibles
          const totalRuns = leaderboardData.runs.length;
          const calculatedPages = Math.ceil(totalRuns / itemsPerPage);
          
          setTotalPages(calculatedPages);
          
          console.log('📊 Pagination calculée:', {
            totalRuns,
            itemsPerPage,
            calculatedPages,
            currentPage,
            willShowPagination: calculatedPages > 1,
            runsOnCurrentPage: Math.min(itemsPerPage, totalRuns - (currentPage - 1) * itemsPerPage)
          });
          
          // Vérifier qu'on ne dépasse pas le nombre de pages disponibles
          if (currentPage > calculatedPages) {
            console.log('⚠️ Page actuelle trop élevée, reset à 1');
            setCurrentPage(1);
          }
        } else {
          setLeaderboard(null);
          setTotalPages(1);
          setError(`Aucun run disponible pour "${selectedCategory.name}" de ${selectedGame.name}`);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement du leaderboard:', error);
        setLeaderboard(null);
        
        // Gestion d'erreurs plus spécifique
        if (error.message && error.message.includes('404')) {
          setError(`La catégorie "${selectedCategory.name}" n'existe plus ou a été modifiée sur speedrun.com`);
          // Nettoyer l'erreur après 5 secondes pour les erreurs 404
          setTimeout(() => {
            setError(null);
          }, 5000);
        } else if (error.message && error.message.includes('timeout')) {
          setError('Délai d\'attente dépassé. Veuillez réessayer.');
        } else {
        setError(`Impossible de charger le classement pour "${selectedCategory.name}"`);
        }
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
        const results = await speedrunApiClient.searchGames(searchQuery, 20); // Augmenter le nombre de résultats
        
        // S'assurer que results est un tableau
        if (Array.isArray(results)) {
          // Algorithme de tri avancé - Priorité aux jeux officiels, ROM hacks seulement si nom complet
          const sortedResults = results.sort((a, b) => {
            const queryLower = searchQuery.toLowerCase().trim();
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            
            // 1. Jeux iconiques officiels par franchise (priorité absolue)
            const iconicTitles = {
              'zelda': [
                'the legend of zelda: ocarina of time',
                'the legend of zelda: majora\'s mask', 
                'the legend of zelda: breath of the wild',
                'the legend of zelda: tears of the kingdom',
                'the legend of zelda: twilight princess',
                'the legend of zelda: wind waker',
                'the legend of zelda: a link to the past',
                'the legend of zelda: link\'s awakening',
                'the legend of zelda',
                'zelda ii: the adventure of link'
              ],
              'mario': [
                'super mario 64',
                'super mario odyssey',
                'super mario world',
                'super mario bros.',
                'super mario sunshine',
                'super mario galaxy',
                'super mario bros. 3',
                'mario kart 64',
                'paper mario'
              ],
              'sonic': [
                'sonic the hedgehog',
                'sonic the hedgehog 2',
                'sonic the hedgehog 3',
                'sonic & knuckles',
                'sonic adventure',
                'sonic adventure 2',
                'sonic mania'
              ],
              'metroid': [
                'super metroid',
                'metroid prime',
                'metroid fusion',
                'metroid dread'
              ],
              'pokemon': [
                'pokemon red',
                'pokemon blue',
                'pokemon yellow',
                'pokemon gold',
                'pokemon silver',
                'pokemon ruby',
                'pokemon sapphire'
              ]
            };
            
            // 2. Tous les jeux officiels (deuxième priorité)
            const allOfficialTitles = {
              'zelda': [
                ...iconicTitles.zelda,
                'the legend of zelda: skyward sword',
                'the legend of zelda: a link between worlds',
                'the legend of zelda: tri force heroes',
                'the legend of zelda: spirit tracks',
                'the legend of zelda: phantom hourglass',
                'the legend of zelda: minish cap',
                'the legend of zelda: four swords adventures',
                'the legend of zelda: oracle of seasons',
                'the legend of zelda: oracle of ages',
                'zelda (game & watch)',
                'zelda classic'
              ],
              'mario': [
                ...iconicTitles.mario,
                'super mario galaxy 2',
                'mario kart 8',
                'mario kart: double dash',
                'super mario bros. 2',
                'super mario land',
                'super mario land 2',
                'super mario 3d world',
                'super mario 3d land',
                'new super mario bros.',
                'mario party',
                'mario & luigi'
              ],
              'sonic': [
                ...iconicTitles.sonic,
                'sonic 3 & knuckles',
                'sonic cd',
                'sonic heroes',
                'sonic generations',
                'sonic forces',
                'sonic frontiers',
                'sonic colors'
              ],
              'metroid': [
                ...iconicTitles.metroid,
                'metroid',
                'metroid ii',
                'metroid prime 2',
                'metroid prime 3',
                'metroid zero mission',
                'metroid: other m',
                'metroid: samus returns'
              ],
              'pokemon': [
                ...iconicTitles.pokemon,
                'pokemon crystal',
                'pokemon emerald',
                'pokemon diamond',
                'pokemon pearl',
                'pokemon platinum',
                'pokemon black',
                'pokemon white',
                'pokemon black 2',
                'pokemon white 2'
              ]
            };
            
            // 3. ROM hacks - Liste exhaustive pour filtrage strict
            const knownHacks = [
              // Zelda hacks
              'parallel worlds', 'goddess of wisdom', 'missing link', 
              'time to triumph', 'dawn & dusk', 'return of ganon', 'outlands',
              'ancient stone tablets', 'bs zelda', 'master quest',
              
              // Mario hacks
              'star road', 'last impact', 'sunshine 64', 'peach\'s fury',
              'mario 64 chaos edition', 'mario builder', 'mario forever',
              
              // Sonic hacks
              'sonic 2 xl', 'sonic classic heroes', 'sonic megamix',
              'sonic 3 complete', 'sonic the hedgehog 2 nick arcade',
              
              // Pokemon hacks
              'pokemon uranium', 'pokemon prism', 'pokemon dark rising',
              'pokemon glazed', 'pokemon light platinum', 'pokemon flora sky'
            ];
            
            // 4. Mots indicateurs de hacks (pour détection générale)
            const hackIndicators = [
              'hack', 'mod', 'randomizer', 'kaizo', 'romhack', 'rom hack', 'custom',
              'fan made', 'fanmade', 'homebrew', 'beta', 'demo', 'challenge',
              'difficulty', 'editor', 'maker', 'creator', 'remix', 'remaster',
              'enhanced', 'redux', 'tribute', 'fan game', 'fangame', 'bootleg',
              'tas', 'tool assisted', 'speedhack', 'practice', 'training'
            ];
            
            // Détection des catégories
            let aIsIconic = false;
            let bIsIconic = false;
            let aIsOfficial = false;
            let bIsOfficial = false;
            let aIsHack = false;
            let bIsHack = false;
            
            // Détecter la franchise de la requête
            for (const [franchise, titles] of Object.entries(iconicTitles)) {
              if (queryLower.includes(franchise) && queryLower.length <= franchise.length + 3) {
                // Requête simple de franchise (ex: "zelda", "mario")
                
                // Jeux iconiques
                aIsIconic = titles.some(title => aName === title || aName.includes(title));
                bIsIconic = titles.some(title => bName === title || bName.includes(title));
                
                                 // Tous les jeux officiels
                 const allTitles = allOfficialTitles[franchise as keyof typeof allOfficialTitles] || [];
                 aIsOfficial = allTitles.some((title: string) => aName === title || aName.includes(title));
                 bIsOfficial = allTitles.some((title: string) => bName === title || bName.includes(title));
                
                break;
              }
            }
            
            // Détection des ROM hacks - STRICTE
            // Seulement si le nom du hack est tapé en entier OU contient des mots indicateurs
            const queryIsSpecificHack = knownHacks.some(hack => 
              queryLower.includes(hack) && queryLower.length >= hack.length - 2
            );
            
            if (!queryIsSpecificHack) {
              // Si l'utilisateur ne cherche pas spécifiquement un hack, on les filtre
              aIsHack = knownHacks.some(hack => aName.includes(hack)) || 
                        hackIndicators.some(indicator => aName.includes(indicator));
              bIsHack = knownHacks.some(hack => bName.includes(hack)) || 
                        hackIndicators.some(indicator => bName.includes(indicator));
            }
            
            // Logique de tri par priorité
            
            // Priorité 1: Jeux iconiques (pour requêtes simples comme "zelda")
            if (aIsIconic && !bIsIconic) return -1;
            if (!aIsIconic && bIsIconic) return 1;
            
            // Priorité 2: Jeux officiels
            if (aIsOfficial && !bIsOfficial) return -1;
            if (!aIsOfficial && bIsOfficial) return 1;
            
            // Priorité 3: Filtrer les ROM hacks (sauf si recherche spécifique)
            if (!queryIsSpecificHack) {
              if (!aIsHack && bIsHack) return -1;
              if (aIsHack && !bIsHack) return 1;
            }
            
            // Priorité 4: Match exact
            if (aName === queryLower && bName !== queryLower) return -1;
            if (bName === queryLower && aName !== queryLower) return 1;
            
            // Priorité 5: Commence par la requête
            const aStarts = aName.startsWith(queryLower);
            const bStarts = bName.startsWith(queryLower);
            if (aStarts && !bStarts) return -1;
            if (bStarts && !aStarts) return 1;
            
            // Priorité 6: Plus court = probablement plus officiel
            const lengthDiff = aName.length - bName.length;
            if (Math.abs(lengthDiff) > 15) return lengthDiff;
            
            // Par défaut: ordre alphabétique
            return aName.localeCompare(bName);
          });
          
          // Limiter à 8 résultats pour l'affichage
          setSearchResults(sortedResults.slice(0, 8));
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
    setCurrentPage(1); // Reset pagination
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
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1); // Reset pagination
                    }}
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
              
              {leaderboard.runs
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((entry, index) => {
                  // Calculer l'index global pour le placement correct
                  const globalIndex = (currentPage - 1) * itemsPerPage + index;
                  return (
                <div
                  key={entry.run.id}
                  className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg border transition-colors ${
                    globalIndex === 0
                      ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-amber-900/20'
                      : globalIndex === 1
                      ? 'border-gray-400/50 bg-gradient-to-r from-gray-800/20 to-slate-800/20'
                      : globalIndex === 2
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
              );
            })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-300 text-lg">Aucun run trouvé pour cette catégorie</p>
            </div>
          )}
          
                      {/* Contrôles de pagination du bas - Optimisé mobile */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 p-3 sm:p-6">
                <div className="flex items-center space-x-2 sm:space-x-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 sm:p-4 shadow-xl w-full max-w-md sm:max-w-none">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="group flex items-center px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 text-sm sm:text-base flex-1 sm:flex-none justify-center"
                  >
                    <svg className="w-4 h-4 sm:mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Précédent</span>
                  </button>
                  
                  <div className="flex items-center space-x-1 sm:space-x-3 px-2 sm:px-4">
                    <div className="text-slate-300 font-medium text-sm sm:text-base hidden sm:block">
                      Page
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-lg shadow-md text-sm sm:text-base">
                        {currentPage}
                      </span>
                      <span className="text-slate-400 text-sm sm:text-base">
                        /
                      </span>
                      <span className="px-2 py-1 sm:px-4 sm:py-2 bg-slate-700 text-slate-300 font-medium rounded-lg text-sm sm:text-base">
                        {totalPages}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="group flex items-center px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 text-sm sm:text-base flex-1 sm:flex-none justify-center"
                  >
                    <span className="hidden sm:inline">Suivant</span>
                    <svg className="w-4 h-4 sm:ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 