import axios from 'axios';

// Types pour l'API speedrun.com
interface SpeedrunGame {
  id: string;
  names: {
    international: string;
    japanese?: string;
  };
  abbreviation: string;
  weblink: string;
  discord?: string;
  released: number;
  platforms: string[];
  regions: string[];
  genres: string[];
  engines: string[];
  developers: string[];
  publishers: string[];
  moderators: Record<string, string>;
  created: string;
  assets: {
    logo: {
      uri: string | null;
    };
    'cover-tiny': {
      uri: string | null;
    };
    'cover-small': {
      uri: string | null;
    };
    'cover-medium': {
      uri: string | null;
    };
    'cover-large': {
      uri: string | null;
    };
    icon: {
      uri: string | null;
    };
    trophy: {
      '1st': { uri: string | null };
      '2nd': { uri: string | null };
      '3rd': { uri: string | null };
    };
    background: {
      uri: string | null;
    };
    foreground: {
      uri: string | null;
    };
  };
  links: Array<{
    rel: string;
    uri: string;
  }>;
}

interface SpeedrunCategory {
  id: string;
  name: string;
  weblink: string;
  type: 'per-game' | 'per-level';
  rules: string;
  players: {
    type: 'exactly' | 'up-to';
    value: number;
  };
  miscellaneous: boolean;
  links: Array<{
    rel: string;
    uri: string;
  }>;
}

interface SpeedrunRun {
  id: string;
  weblink: string;
  game: string;
  level?: string;
  category: string;
  videos: {
    text?: string;
    links?: Array<{
      uri: string;
    }>;
  };
  comment?: string;
  status: {
    status: 'new' | 'verified' | 'rejected';
    examiner?: string;
    'verify-date'?: string;
    reason?: string;
  };
  players: Array<{
    rel: 'user' | 'guest';
    id?: string;
    name?: string;
    uri?: string;
  }>;
  date: string;
  submitted: string;
  times: {
    primary: string;
    primary_t: number;
    realtime?: string;
    realtime_t?: number;
    realtime_noloads?: string;
    realtime_noloads_t?: number;
    ingame?: string;
    ingame_t?: number;
  };
  system: {
    platform: string;
    emulated: boolean;
    region?: string;
  };
  splits?: {
    rel: string;
    uri: string;
  };
  values: Record<string, string>;
  links: Array<{
    rel: string;
    uri: string;
  }>;
  playersData?: Array<{
    id?: string;
    name: string;
    weblink?: string;
    type: 'user' | 'guest';
  }>;
}

interface SpeedrunLeaderboard {
  weblink: string;
  game: string;
  category: string;
  level?: string;
  platform?: string;
  region?: string;
  emulators?: boolean;
  'video-only'?: boolean;
  timing: string;
  values: Record<string, string>;
  runs: Array<{
    place: number;
    run: SpeedrunRun;
  }>;
  links: Array<{
    rel: string;
    uri: string;
  }>;
  players: {
    data: Array<any>;
  };
  regions: {
    data: Array<any>;
  };
  platforms: {
    data: Array<any>;
  };
  variables: {
    data: Array<any>;
  };
}

interface SpeedrunApiResponse<T> {
  data: T;
  pagination?: {
    offset: number;
    max: number;
    size: number;
    links: Array<{
      rel: string;
      uri: string;
    }>;
  };
}

export class SpeedrunApiService {
  private api: any;
  private readonly baseUrl = 'https://www.speedrun.com/api/v1';
  private readonly userAgent = 'SpeedrunPlatform/1.0 (Educational Project)';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // Augmenter le timeout pour les recherches exhaustives
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
    });

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response: any) => {
        console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
        return response;
      },
      (error: any) => {
        console.error('❌ Erreur API speedrun.com:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        console.error('Erreur API speedrun.com:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Récupère la liste des jeux populaires
   */
  async getPopularGames(limit: number = 30, offset: number = 0, officialOnly: boolean = false): Promise<SpeedrunGame[]> {
    try {
      console.log(`🔥 Récupération de ${limit} jeux populaires (offset: ${offset}, officialOnly: ${officialOnly})`);
      
      // Essayer plusieurs stratégies pour récupérer les vrais jeux populaires
      let allPopularGames = new Map<string, SpeedrunGame>();
      
      // Stratégie 1: Tri par nombre de runs (le plus fiable)
      try {
        console.log('📊 Tentative tri par nombre de runs...');
        const runsResponse = await this.api.get('/games', {
          params: {
            max: Math.min(limit * 2, 200),
            offset: offset,
            orderby: 'similarity',
            direction: 'desc',
            embed: 'platforms,regions,genres'
          }
        });
        
        if (runsResponse.data.data && runsResponse.data.data.length > 0) {
          runsResponse.data.data.forEach((game: any) => {
            allPopularGames.set(game.id, game);
          });
          console.log(`✅ ${runsResponse.data.data.length} jeux récupérés avec tri par runs`);
        }
      } catch (error) {
        console.log('❌ Tri par runs échoué:', error);
      }
      
      // Stratégie 2: Tri par date de création (récents populaires)
      try {
        console.log('📅 Tentative tri par date de création...');
        const createdResponse = await this.api.get('/games', {
          params: {
            max: Math.min(limit, 100),
            offset: offset,
            orderby: 'created',
            direction: 'desc',
            embed: 'platforms,regions,genres'
          }
        });
        
        if (createdResponse.data.data && createdResponse.data.data.length > 0) {
          createdResponse.data.data.forEach((game: any) => {
            allPopularGames.set(game.id, game);
          });
          console.log(`✅ ${createdResponse.data.data.length} jeux récupérés avec tri par création`);
        }
      } catch (error) {
        console.log('❌ Tri par création échoué:', error);
      }
      
      // Stratégie 3: Recherche de jeux connus populaires
      const popularGameNames = [
        'Super Mario Bros', 'Legend of Zelda', 'Super Mario 64', 'Minecraft', 
        'Super Metroid', 'Sonic', 'Castlevania', 'Final Fantasy', 'Pokemon',
        'Grand Theft Auto', 'Call of Duty', 'Counter-Strike', 'Resident Evil',
        'Halo', 'Portal', 'Half-Life', 'Super Mario World', 'Doom'
      ];
      
      for (const gameName of popularGameNames.slice(0, 8)) { // Limiter pour éviter trop de requêtes
        try {
          const searchResponse = await this.api.get('/games', {
            params: {
              name: gameName,
              max: 10,
              orderby: 'similarity',
              direction: 'desc',
              embed: 'platforms,regions,genres'
            }
          });
          
          if (searchResponse.data.data && searchResponse.data.data.length > 0) {
            // Prendre seulement le premier résultat le plus pertinent
            const topGame = searchResponse.data.data[0];
            if (topGame.names.international.toLowerCase().includes(gameName.toLowerCase())) {
              allPopularGames.set(topGame.id, topGame);
            }
          }
          
          // Petit délai pour éviter le rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.log(`❌ Recherche pour "${gameName}" échouée:`, error);
        }
      }
      
      // Stratégie 4: Fallback simple sans tri spécifique
      if (allPopularGames.size < 5) {
        try {
          console.log('🔄 Fallback sans tri spécifique...');
          const fallbackResponse = await this.api.get('/games', {
            params: {
              max: limit * 2,
              offset: offset,
              embed: 'platforms,regions,genres'
            }
          });
          
          if (fallbackResponse.data.data) {
            fallbackResponse.data.data.forEach((game: any) => {
              allPopularGames.set(game.id, game);
            });
            console.log(`🔄 ${fallbackResponse.data.data.length} jeux récupérés en fallback`);
          }
        } catch (fallbackError) {
          console.error('❌ Erreur du fallback:', fallbackError);
        }
      }
      
      // Convertir en array et trier par popularité réelle
      const games = Array.from(allPopularGames.values());
      
      // Tri avancé par popularité
      games.sort((a, b) => {
        // Priorité 1: Jeux avec beaucoup de liens (indicateur de popularité)
        const aLinks = (a.links ? a.links.length : 0);
        const bLinks = (b.links ? b.links.length : 0);
        if (aLinks !== bLinks) return bLinks - aLinks;
        
        // Priorité 2: Jeux avec plus de plateformes (plus accessible = plus populaire)
        const aPlatforms = (a.platforms ? a.platforms.length : 0);
        const bPlatforms = (b.platforms ? b.platforms.length : 0);
        if (aPlatforms !== bPlatforms) return bPlatforms - aPlatforms;
        
        // Priorité 3: Jeux avec plus de genres (plus de catégories = plus joué)
        const aGenres = (a.genres ? a.genres.length : 0);
        const bGenres = (b.genres ? b.genres.length : 0);
        if (aGenres !== bGenres) return bGenres - aGenres;
        
        // Priorité 4: Tri alphabétique pour stabilité
        return a.names.international.localeCompare(b.names.international);
      });
      
      const finalGames = games.slice(0, limit);
      console.log(`✅ ${finalGames.length} jeux populaires finaux retournés (${allPopularGames.size} total trouvés)`);
      
      // Appliquer le tri officiel/non-officiel selon le paramètre
      const sortedGames = this.filterAndSortGamesByOfficial(finalGames, officialOnly);
      
      console.log(`🎯 Après filtrage officialOnly=${officialOnly}: ${sortedGames.length} jeux retournés`);
      
      return sortedGames;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des jeux populaires:', error);
      
      // Dernier fallback ultra simple
      try {
        console.log('🆘 Dernier fallback ultra simple...');
        const lastResponse = await this.api.get('/games', {
          params: { max: limit }
        });
        
        const lastGames = lastResponse.data.data || [];
        console.log(`🆘 ${lastGames.length} jeux récupérés en dernier recours`);
        
        // Appliquer le filtrage même en fallback
        const filteredFallback = this.filterAndSortGamesByOfficial(lastGames, officialOnly);
        console.log(`🆘 Après filtrage fallback officialOnly=${officialOnly}: ${filteredFallback.length} jeux`);
        
        return filteredFallback;
      } catch (lastError) {
        console.error('❌ Dernier fallback échoué:', lastError);
        return [];
      }
    }
  }

  /**
   * Recherche exhaustive de jeux (récupère TOUS les résultats disponibles)
   */
  async searchGamesExhaustive(query: string, maxResults: number = 100): Promise<SpeedrunGame[]> {
    try {
      console.log(`🔍 RECHERCHE EXHAUSTIVE pour: "${query}" (max: ${maxResults})`);
      const allGames = new Map<string, SpeedrunGame>();
      const queryLower = query.toLowerCase();

      // Liste des variantes de recherche à tester
      const searchVariants = [query];

      // Ajouter des variantes spécifiques pour certains termes
      if (queryLower.includes('mario')) {
        searchVariants.push('Super Mario', 'Mario Bros', 'New Super Mario Bros', 'Super Mario 64', 'Mario Kart', 'Mario Party');
      }
      if (queryLower.includes('zelda')) {
        searchVariants.push('The Legend of Zelda', 'Legend of Zelda');
      }
      if (queryLower.includes('sonic')) {
        searchVariants.push('Sonic the Hedgehog');
      }

      console.log(`📝 Variantes à tester: ${searchVariants.join(', ')}`);

      // STRATÉGIE SPÉCIALE pour Mario : Chercher des jeux Mario populaires directement
      if (queryLower.includes('mario')) {
        console.log('🎯 Stratégie spéciale Mario : recherche de jeux populaires');
        const popularMarioGames = [
          'Super Mario 64', 'Super Mario Bros.', 'Super Mario World', 'Super Mario Sunshine',
          'Super Mario Galaxy', 'Super Mario Odyssey', 'Mario Kart 64', 'Mario Party'
        ];
        
        for (const popularGame of popularMarioGames) {
          try {
            console.log(`🔍 Recherche directe: "${popularGame}"`);
            const response = await this.api.get('/games', {
              params: {
                name: popularGame,
                max: 5,
                embed: 'platforms,regions,genres'
              }
            });
            
            const games = response.data.data;
            if (games && games.length > 0) {
              games.forEach((game: any) => {
                const gameName = game.names.international.toLowerCase();
                if (gameName.includes(queryLower) || popularGame.toLowerCase().includes(queryLower)) {
                  allGames.set(game.id, game);
                  console.log(`🎯 Ajouté "${game.names.international}" via recherche directe`);
                }
              });
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.log(`❌ Erreur recherche directe "${popularGame}":`, error);
          }
        }
      }

      // STRATÉGIE SPÉCIALE pour Zelda : Chercher des jeux Zelda populaires directement  
      if (queryLower.includes('zelda')) {
        console.log('🎯 Stratégie spéciale Zelda : recherche de jeux populaires');
        const popularZeldaGames = [
          // Jeux Zelda principaux avec noms exacts prioritaires
          'The Legend of Zelda', 'Zelda II: The Adventure of Link', 
          'The Legend of Zelda: A Link to the Past', 'The Legend of Zelda: Link\'s Awakening',
          'The Legend of Zelda: Ocarina of Time', 'The Legend of Zelda: Majora\'s Mask',
          'The Legend of Zelda: Oracle of Ages', 'The Legend of Zelda: Oracle of Seasons',
          'The Legend of Zelda: The Wind Waker', 'The Legend of Zelda: The Wind Waker HD',
          'The Legend of Zelda: Four Swords Adventures', 'The Legend of Zelda: The Minish Cap',
          'The Legend of Zelda: Twilight Princess', 'The Legend of Zelda: Twilight Princess HD',
          'The Legend of Zelda: Phantom Hourglass', 'The Legend of Zelda: Spirit Tracks',
          'The Legend of Zelda: Skyward Sword', 'The Legend of Zelda: Skyward Sword HD',
          'The Legend of Zelda: A Link Between Worlds', 'The Legend of Zelda: Tri Force Heroes',
          'The Legend of Zelda: Breath of the Wild', 'The Legend of Zelda: Tears of the Kingdom',
          'The Legend of Zelda: Link\'s Awakening (2019)',
          
          // Variantes de noms courts pour assurer la découverte - RECHERCHE PLUS AGGRESSIVE
          'A Link to the Past', 'Link\'s Awakening', 'Ocarina of Time', 'Majora\'s Mask',
          'Oracle of Ages', 'Oracle of Seasons', 'The Wind Waker', 'Wind Waker', 'Wind Waker HD',
          'Four Swords Adventures', 'The Minish Cap', 'Minish Cap', 'Twilight Princess',
          'Phantom Hourglass', 'Spirit Tracks', 'Skyward Sword', 'A Link Between Worlds',
          'Tri Force Heroes', 'Breath of the Wild', 'Tears of the Kingdom',
          
          // Recherches spécifiques pour jeux manquants
          'wind waker', 'minish cap', 'link to the past', 'majora mask', 'oracle ages',
          'oracle seasons', 'twilight princess', 'skyward sword', 'breath wild'
        ];
        
        for (const popularGame of popularZeldaGames) {
          try {
            console.log(`🔍 Recherche directe Zelda: "${popularGame}"`);
            
            // Faire plusieurs tentatives avec différentes API endpoints
            const searchConfigs = [
              { name: popularGame, max: 3 },
              { name: popularGame.replace(/\s+/g, '+'), max: 3 }, // Avec + au lieu d'espaces
              { name: popularGame.replace(/\s+/g, '%20'), max: 3 } // URL encoded
            ];
            
            for (const config of searchConfigs) {
              const response = await this.api.get('/games', {
                params: {
                  ...config,
                  embed: 'platforms,regions,genres'
                }
              });
              
              const games = response.data.data;
              if (games && games.length > 0) {
                games.forEach((game: any) => {
                  const gameName = game.names.international.toLowerCase();
                  const gameAbbr = game.abbreviation.toLowerCase();
                  
                  // Vérification stricte pour les vrais jeux Zelda
                  const isLegitimateZelda = 
                    (gameName.includes('legend of zelda') || gameName.includes('zelda') || 
                     gameName.includes('wind waker') || gameName.includes('minish cap') ||
                     gameName.includes('ocarina') || gameName.includes('majora') ||
                     gameName.includes('link to the past') || gameName.includes('breath')) &&
                    !gameName.includes('hack') &&
                    !gameName.includes('mod') &&
                    !gameName.includes('fan') &&
                    !gameName.includes('custom') &&
                    !gameName.includes('rom') &&
                    !gameName.includes('homebrew') &&
                    !gameName.includes('category extensions');
                  
                  if (isLegitimateZelda) {
                    allGames.set(game.id, game);
                    console.log(`🎯 Ajouté "${game.names.international}" via recherche directe Zelda "${popularGame}"`);
                  }
                });
              }
              
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.log(`❌ Erreur recherche directe Zelda "${popularGame}":`, error);
          }
        }
      }

      // === STRATÉGIE CRITIQUE : AJOUT DIRECT DES JEUX ZELDA POPULAIRES ===
      if (queryLower.includes('zelda')) {
        console.log('🎯 Ajout direct des jeux Zelda populaires manquants...');
        
        // Jeux Zelda populaires à chercher individuellement (approche simplifiée)
        const popularZeldaQueries = ['Wind Waker', 'Minish Cap', 'Ocarina of Time', 'Majora Mask'];
        
        for (const zeldaQuery of popularZeldaQueries) {
          try {
            console.log(`🔍 Recherche simple: "${zeldaQuery}"`);
            const response = await this.api.get('/games', {
              params: {
                name: zeldaQuery,
                max: 3,
                embed: 'platforms,regions,genres'
              }
            });
            
            if (response.data.data && response.data.data.length > 0) {
              response.data.data.forEach((game: any) => {
                const gameName = game.names.international.toLowerCase();
                // Ajouter seulement les vrais jeux Zelda (pas les extensions)
                if (gameName.includes('legend of zelda') && 
                    !gameName.includes('category extensions') &&
                    !gameName.includes('extension')) {
                  allGames.set(game.id, game);
                  console.log(`🎯 Ajouté Zelda populaire: "${game.names.international}"`);
                }
              });
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.log(`❌ Erreur recherche Zelda populaire "${zeldaQuery}":`, error);
          }
        }
      }

      // Pour chaque variante de recherche
      for (const searchTerm of searchVariants) {
        console.log(`🔍 Test variante: "${searchTerm}"`);
        
        try {
          // Faire plusieurs requêtes avec pagination SANS orderby qui pose problème
          for (let offset = 0; offset < 400; offset += 200) {
            console.log(`🔍 Recherche "${searchTerm}" à l'offset ${offset}...`);
            const response = await this.api.get('/games', {
              params: {
                name: searchTerm,
                max: 200,
                offset: offset,
                embed: 'platforms,regions,genres'
                // Suppression complète de orderby et direction qui causent des erreurs 400
              }
            });

            const games = response.data.data;
            
            if (!games || games.length === 0) {
              console.log(`📭 Aucun résultat à l'offset ${offset} pour "${searchTerm}"`);
              break;
            }

            // Ajouter tous les jeux qui correspondent vraiment au terme original
            let validGames = 0;
            games.forEach((game: any) => {
              const gameName = game.names.international.toLowerCase();
              // Vérifier que le jeu contient vraiment le terme recherché (ou variante)
              // Critères élargis pour inclure les jeux comme "Super Mario 64" quand on cherche "mario"
              const matchesOriginalQuery = gameName.includes(queryLower) || 
                                          game.abbreviation.toLowerCase().includes(queryLower);
              const matchesSearchTerm = gameName.includes(searchTerm.toLowerCase()) || 
                                       game.abbreviation.toLowerCase().includes(searchTerm.toLowerCase());
              
              if (matchesOriginalQuery || matchesSearchTerm) {
                allGames.set(game.id, game);
                validGames++;
                
                // Log spécial pour Super Mario 64
                if (gameName.includes('super mario 64')) {
                  console.log(`🎯 TROUVÉ Super Mario 64: "${game.names.international}" via terme "${searchTerm}"`);
                }
              }
            });

            console.log(`📊 "${searchTerm}" offset ${offset}: ${games.length} trouvés, ${validGames} valides, total unique: ${allGames.size}`);

            // Si on a moins de résultats que le max, on a atteint la fin
            if (games.length < 200) {
              console.log(`🔚 Fin des résultats pour "${searchTerm}" à l'offset ${offset}`);
              break;
            }

            // Délai pour éviter le rate limiting
            await new Promise(resolve => setTimeout(resolve, 150));

            // Si on a déjà assez de résultats, arrêter
            if (allGames.size >= maxResults) {
              console.log(`✅ Limite atteinte: ${allGames.size} jeux trouvés`);
              break;
            }
          }
        } catch (error) {
          console.error(`❌ Erreur pour la variante "${searchTerm}":`, error);
          // Continuer avec les autres variantes
        }

        // Délai entre les variantes de recherche
        await new Promise(resolve => setTimeout(resolve, 200));

        // Si on a déjà suffisamment de résultats, arrêter
        if (allGames.size >= maxResults) break;
      }

      console.log(`✅ Recherche exhaustive terminée. Total: ${allGames.size} jeux uniques trouvés`);

      // Convertir en array et trier par pertinence
      const games = Array.from(allGames.values());

      // Trier par pertinence 
      games.sort((a, b) => {
        const aName = a.names.international.toLowerCase();
        const bName = b.names.international.toLowerCase();

        // Priorité 1: Préférer les jeux principaux (non-extensions) AVANT TOUT
        const aIsExtension = aName.includes('extension') || aName.includes('category extension') || (a as any).romhack;
        const bIsExtension = bName.includes('extension') || bName.includes('category extension') || (b as any).romhack;
        if (!aIsExtension && bIsExtension) return -1;
        if (aIsExtension && !bIsExtension) return 1;

        // Priorité 2: Match exact du nom
        if (aName === queryLower && bName !== queryLower) return -1;
        if (bName === queryLower && aName !== queryLower) return 1;

        // Priorité 3: Correspond exactement à des mots clés importants de la recherche
        const queryWords = queryLower.split(' ');
        const aMatchesKeywords = queryWords.filter(word => aName.includes(word)).length;
        const bMatchesKeywords = queryWords.filter(word => bName.includes(word)).length;
        if (aMatchesKeywords !== bMatchesKeywords) return bMatchesKeywords - aMatchesKeywords;

        // Priorité 4: Commence par le terme recherché
        if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
        if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;

        // Priorité 5: Trier par nombre de liens (indicateur de popularité)
        const aLinks = a.links ? a.links.length : 0;
        const bLinks = b.links ? b.links.length : 0;
        if (bLinks !== aLinks) return bLinks - aLinks;

        // Priorité 6: Tri alphabétique pour stabilité
        return aName.localeCompare(bName);
      });

      const finalResults = games.slice(0, maxResults);
      console.log(`🎯 Retour de ${finalResults.length} jeux triés par pertinence`);
      
      // Appliquer le tri officiel/non-officiel (jeux officiels en premier)
      const sortedResults = this.filterAndSortGamesByOfficial(finalResults, false);
      
      return sortedResults;

    } catch (error) {
      console.error('❌ Erreur lors de la recherche exhaustive de jeux:', error);
      return [];
    }
  }

  /**
   * Recherche des jeux par nom (version améliorée)
   */
  async searchGames(query: string, limit: number = 20): Promise<SpeedrunGame[]> {
    try {
      console.log(`🔍 Recherche de jeux pour: "${query}" (limite: ${limit})`);
      
      const allGames = new Map<string, SpeedrunGame>();
      const queryLower = query.toLowerCase();
      
      // Définir plusieurs variantes de recherche
      const searchTerms = [query];
      
      // Ajouter des variantes spécifiques pour Zelda
      if (queryLower.includes('zelda')) {
        searchTerms.push('The Legend of Zelda', 'Legend of Zelda');
        
        // Variantes spécifiques pour Twilight Princess
        if (queryLower.includes('twilight')) {
          searchTerms.push('Twilight Princess', 'The Legend of Zelda: Twilight Princess');
        }
      }
      
      // Pour chaque terme de recherche
      for (const searchTerm of searchTerms) {
        console.log(`🔍 Test avec le terme: "${searchTerm}"`);
        
        try {
          const response = await this.api.get('/games', {
            params: {
              name: searchTerm,
              max: Math.min(50, limit * 3), // Plus de résultats pour avoir plus de choix
              embed: 'platforms,regions,genres'
              // Pas de orderby pour éviter les erreurs
            }
          });

          const games = response.data.data || [];
          console.log(`📊 ${games.length} jeux trouvés pour "${searchTerm}"`);

          // Ajouter tous les jeux qui correspondent
          games.forEach((game: any) => {
            const gameName = game.names.international.toLowerCase();
            const gameAbbr = game.abbreviation.toLowerCase();
            
            // Vérifier que le jeu correspond vraiment au terme recherché original
            const matchesOriginal = gameName.includes(queryLower) || 
                                   gameAbbr.includes(queryLower) ||
                                   // Vérifier que tous les mots de la recherche sont présents (insensible à la casse)
                                   queryLower.split(' ').every(word => 
                                     gameName.toLowerCase().includes(word.toLowerCase()) ||
                                     gameAbbr.toLowerCase().includes(word.toLowerCase())
                                   );
            
            if (matchesOriginal) {
              allGames.set(game.id, game);
              console.log(`✅ Ajouté: "${game.names.international}"`);
            }
          });
          
          // Petit délai pour éviter le rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Erreur pour le terme "${searchTerm}":`, error);
          continue;
        }
      }

      // Convertir en array et trier par pertinence
      const games = Array.from(allGames.values());
      
      // Trier par pertinence 
      games.sort((a, b) => {
        const aName = a.names.international.toLowerCase();
        const bName = b.names.international.toLowerCase();

        // Priorité 1: Préférer les jeux principaux (non-extensions) AVANT TOUT
        const aIsExtension = aName.includes('extension') || aName.includes('category extension') || (a as any).romhack;
        const bIsExtension = bName.includes('extension') || bName.includes('category extension') || (b as any).romhack;
        if (!aIsExtension && bIsExtension) return -1;
        if (aIsExtension && !bIsExtension) return 1;

        // Priorité 2: Match exact du nom
        if (aName === queryLower && bName !== queryLower) return -1;
        if (bName === queryLower && aName !== queryLower) return 1;

        // Priorité 3: Correspond exactement à des mots clés importants de la recherche
        const queryWords = queryLower.split(' ');
        const aMatchesKeywords = queryWords.filter(word => aName.includes(word)).length;
        const bMatchesKeywords = queryWords.filter(word => bName.includes(word)).length;
        if (aMatchesKeywords !== bMatchesKeywords) return bMatchesKeywords - aMatchesKeywords;

        // Priorité 4: Commence par le terme recherché
        if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
        if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;

        // Priorité 5: Trier par nombre de liens (indicateur de popularité)
        const aLinks = a.links ? a.links.length : 0;
        const bLinks = b.links ? b.links.length : 0;
        if (bLinks !== aLinks) return bLinks - aLinks;

        // Priorité 6: Tri alphabétique pour stabilité
        return aName.localeCompare(bName);
      });

      const finalGames = games.slice(0, limit);
      console.log(`✅ Retour de ${finalGames.length} jeux triés par pertinence`);
      return finalGames;

    } catch (error) {
      console.error('❌ Erreur lors de la recherche de jeux:', error);
      return [];
    }
  }

  /**
   * Récupère un jeu par son ID
   */
  async getGameById(gameId: string): Promise<SpeedrunGame | null> {
    try {
      const response = await this.api.get(`/games/${gameId}`, {
        params: {
          embed: 'platforms,regions,genres,engines,developers,publishers,moderators'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du jeu ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Récupère les catégories d'un jeu
   */
  async getGameCategories(gameId: string): Promise<SpeedrunCategory[]> {
    try {
      const response = await this.api.get(`/games/${gameId}/categories`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des catégories pour ${gameId}:`, error);
      return [];
    }
  }

  /**
   * Récupère le leaderboard d'une catégorie
   */
  async getLeaderboard(
    gameId: string, 
    categoryId: string, 
    options: {
      top?: number;
      platform?: string;
      region?: string;
      emulators?: boolean;
      'video-only'?: boolean;
      timing?: string;
      date?: string;
      var?: Record<string, string>;
    } = {}
  ): Promise<SpeedrunLeaderboard | null> {
    try {
      const params: any = {
        top: options.top || 10,
        // Inclure automatiquement les joueurs pour avoir leurs noms
        embed: 'game,category,level,players,regions,platforms,variables'
      };

      // Ajouter les paramètres optionnels
      if (options.platform) params.platform = options.platform;
      if (options.region) params.region = options.region;
      if (options.emulators !== undefined) params.emulators = options.emulators;
      if (options['video-only'] !== undefined) params['video-only'] = options['video-only'];
      if (options.timing) params.timing = options.timing;
      if (options.date) params.date = options.date;

      // Ajouter les variables (sous-catégories)
      if (options.var) {
        Object.entries(options.var).forEach(([key, value]) => {
          params[`var-${key}`] = value;
        });
      }

      const response = await this.api.get(
        `/leaderboards/${gameId}/category/${categoryId}`,
        { params }
      );

      const leaderboard = response.data.data;

      // Enrichir les runs avec les noms des joueurs
      if (leaderboard && leaderboard.runs) {
        leaderboard.runs = leaderboard.runs.map((runEntry: any) => {
          const run = runEntry.run;
          
          // Enrichir avec les données des joueurs
          if (run.players && leaderboard.players && leaderboard.players.data) {
            run.playersData = run.players.map((playerRef: any) => {
              if (playerRef.rel === 'user' && playerRef.id) {
                // Trouver les données du joueur dans l'embed
                const playerData = leaderboard.players.data.find((p: any) => p.id === playerRef.id);
                return {
                  id: playerRef.id,
                  name: playerData?.names?.international || playerData?.name || `Joueur ${playerRef.id}`,
                  weblink: playerData?.weblink,
                  type: 'user'
                };
              } else if (playerRef.rel === 'guest') {
                return {
                  name: playerRef.name || 'Invité',
                  type: 'guest'
                };
              }
              return playerRef;
            });
          }

          return runEntry;
        });
      }

      return leaderboard;
    } catch (error) {
      console.error(`Erreur lors de la récupération du leaderboard ${gameId}/${categoryId}:`, error);
      return null;
    }
  }

  /**
   * Récupère les runs récents d'un jeu
   */
  async getRecentRuns(gameId: string, limit: number = 20): Promise<SpeedrunRun[]> {
    try {
      const response = await this.api.get('/runs', {
        params: {
          game: gameId,
          status: 'verified',
          orderby: 'verify-date',
          direction: 'desc',
          max: limit,
          embed: 'game,category,level,players,platforms'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des runs récents pour ${gameId}:`, error);
      return [];
    }
  }

  /**
   * Récupère les runs d'un utilisateur
   */
  async getUserRuns(userId: string, limit: number = 20): Promise<SpeedrunRun[]> {
    try {
      const response = await this.api.get('/runs', {
        params: {
          user: userId,
          status: 'verified',
          orderby: 'verify-date',
          direction: 'desc',
          max: limit,
          embed: 'game,category,level,players'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des runs de l'utilisateur ${userId}:`, error);
      return [];
    }
  }

  /**
   * Récupère les informations d'un utilisateur par son ID
   */
  async getUserById(userId: string): Promise<any> {
    try {
      const response = await this.api.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
      return null;
    }
  }

  /**
   * Récupère les informations de plusieurs utilisateurs
   */
  async getUsers(userIds: string[]): Promise<Record<string, any>> {
    const users: Record<string, any> = {};
    
    // Faire les requêtes en parallèle avec un délai pour éviter le rate limiting
    for (const userId of userIds) {
      try {
        const user = await this.getUserById(userId);
        if (user) {
          users[userId] = user;
        }
        // Petit délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.log(`Impossible de récupérer l'utilisateur ${userId}`);
      }
    }

    return users;
  }

  /**
   * Récupère spécifiquement les jeux Zelda populaires
   */
  async getPopularZeldaGames(): Promise<SpeedrunGame[]> {
    try {
      console.log('🎮 Début de la récupération des jeux Zelda...');
      
      // Version simplifiée et plus rapide pour éviter les timeouts
      const allZeldaGames = new Map<string, SpeedrunGame>();
      
      // 1. Recherches ciblées avec les termes les plus efficaces
      const searchTerms = [
        'zelda',
        'The Legend of Zelda',
        'Legend of Zelda'
      ];

      for (const term of searchTerms) {
        console.log(`🔍 Recherche avec le terme: "${term}"`);
        
        try {
          // Faire plusieurs requêtes avec pagination limitée
          for (let offset = 0; offset < 400; offset += 200) {
            const response = await this.api.get('/games', {
              params: {
                name: term,
                max: 200,
                offset: offset,
                embed: 'platforms,regions,genres',
                orderby: 'similarity',
                direction: 'desc'
              }
            });

            const games = response.data.data;
            
            if (!games || games.length === 0) {
              console.log(`📭 Aucun résultat à l'offset ${offset} pour "${term}"`);
              break;
            }

            // Filtrer et ajouter les jeux Zelda
            let addedCount = 0;
            games.forEach((game: any) => {
              const gameName = game.names.international.toLowerCase();
              if (gameName.includes('zelda') || game.abbreviation.toLowerCase().includes('zelda')) {
                allZeldaGames.set(game.id, game);
                addedCount++;
              }
            });

            console.log(`📝 Ajouté ${addedCount} jeux Zelda (${games.length} jeux total) pour "${term}" offset ${offset}`);

            // Arrêter si moins de résultats que le maximum
            if (games.length < 200) {
              break;
            }

            // Délai pour éviter le rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error) {
          console.error(`❌ Erreur pour le terme "${term}":`, error);
        }

        // Délai entre les termes
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`🎯 Recherche terminée. Total: ${allZeldaGames.size} jeux Zelda uniques trouvés`);

      // Convertir et trier
      const games = Array.from(allZeldaGames.values());

      // Trier par popularité et pertinence
      games.sort((a, b) => {
        const aName = a.names.international.toLowerCase();
        const bName = b.names.international.toLowerCase();

        // Priorité aux jeux principaux
        const mainZeldaGames = [
          'ocarina of time', 'majora', 'wind waker', 'twilight princess', 
          'breath of the wild', 'skyward sword', 'link to the past', 
          'link\'s awakening', 'oracle', 'minish cap'
        ];

        const aIsMain = mainZeldaGames.some(main => aName.includes(main));
        const bIsMain = mainZeldaGames.some(main => bName.includes(main));

        if (aIsMain && !bIsMain) return -1;
        if (bIsMain && !aIsMain) return 1;

        // Ensuite par popularité
        const aLinks = a.links ? a.links.length : 0;
        const bLinks = b.links ? b.links.length : 0;
        return bLinks - aLinks;
      });

      console.log(`✅ Retour de ${games.length} jeux Zelda triés`);
      return games;
      
    } catch (error) {
      console.error('❌ Erreur majeure lors de la récupération des jeux Zelda:', error);
      
      // Fallback simple en cas d'erreur
      try {
        console.log('🔄 Tentative de fallback avec recherche simple...');
        const fallbackResults = await this.searchGames('zelda', 30);
        console.log(`🔄 Fallback: ${fallbackResults.length} jeux trouvés`);
        return fallbackResults;
      } catch (fallbackError) {
        console.error('❌ Erreur du fallback:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Transforme les données de jeu speedrun.com vers notre format
   */
  transformGameData(speedrunGame: SpeedrunGame) {
    const isOfficial = this.isOfficialGame(speedrunGame);
    
    // Assurer que platforms est toujours un tableau valide
    let platforms: string[] = [];
    
    // Vérifier la structure platforms.data[] de speedrun.com
    const platformsObj = speedrunGame.platforms as any;
    if (platformsObj && typeof platformsObj === 'object') {
      // Structure speedrun.com avec embed: platforms.data[]
      if (platformsObj.data && Array.isArray(platformsObj.data)) {
        platforms = platformsObj.data.map((platform: any) => {
          return platform.name || platform.title || platform.id || 'Plateforme inconnue';
        }).filter((p: any) => p && p !== 'Plateforme inconnue');
      }
      // Fallback: platforms est directement un objet avec un nom
      else if (platformsObj.name) {
        platforms = [platformsObj.name];
      }
    }
    // Fallback: si platforms est un tableau direct (ancienne structure)
    else if (Array.isArray(speedrunGame.platforms)) {
      const platformsArray = speedrunGame.platforms as any[];
      platforms = platformsArray.map((platform: any) => {
        // Si c'est un objet avec un nom, extraire le nom
        if (typeof platform === 'object' && platform !== null) {
          return platform.name || platform.title || platform.id || 'Plateforme inconnue';
        }
        // Si c'est déjà une string, la garder
        if (typeof platform === 'string') {
          return platform;
        }
        // Fallback pour autres types
        return String(platform);
      }).filter((p: any) => p && p !== 'Plateforme inconnue');
    }
    // Dernier fallback: string directe
    else if (typeof speedrunGame.platforms === 'string') {
      platforms = [speedrunGame.platforms];
    }
    
    return {
      id: speedrunGame.id,
      name: speedrunGame.names.international,
      abbreviation: speedrunGame.abbreviation,
      weblink: speedrunGame.weblink,
      releaseDate: speedrunGame.released ? new Date(speedrunGame.released, 0, 1) : null,
      description: null, // speedrun.com n'a pas de description
      coverImage: speedrunGame.assets['cover-large']?.uri || 
                  speedrunGame.assets['cover-medium']?.uri || 
                  speedrunGame.assets['cover-small']?.uri,
      logoImage: speedrunGame.assets.logo?.uri,
      backgroundImage: speedrunGame.assets.background?.uri,
      platforms: platforms,
      genres: Array.isArray(speedrunGame.genres) ? speedrunGame.genres : [],
      developers: Array.isArray(speedrunGame.developers) ? speedrunGame.developers : [],
      publishers: Array.isArray(speedrunGame.publishers) ? speedrunGame.publishers : [],
      isOfficial: isOfficial, // Nouveau champ pour indiquer si le jeu est officiel
      gameType: isOfficial ? 'official' : 'community', // Type lisible
      externalData: {
        speedruncom: {
          id: speedrunGame.id,
          abbreviation: speedrunGame.abbreviation,
          weblink: speedrunGame.weblink,
          assets: speedrunGame.assets,
          moderators: speedrunGame.moderators
        }
      }
    };
  }

  /**
   * Transforme les données de run speedrun.com vers notre format
   */
  transformRunData(speedrunRun: SpeedrunRun, placement?: number) {
    // Récupérer le nom du joueur depuis les données enrichies ou fallback
    let playerName = 'Joueur inconnu';
    
    if (speedrunRun.playersData && speedrunRun.playersData.length > 0) {
      // Utiliser les données enrichies avec les vrais noms
      playerName = speedrunRun.playersData[0].name;
    } else if (speedrunRun.players && speedrunRun.players.length > 0) {
      // Fallback sur les données originales
      const firstPlayer = speedrunRun.players[0];
      if (firstPlayer.rel === 'guest') {
        playerName = firstPlayer.name || 'Invité';
      } else if (firstPlayer.rel === 'user') {
        playerName = firstPlayer.name || `Joueur ${firstPlayer.id}`;
      }
    }

    return {
      id: speedrunRun.id,
      gameId: speedrunRun.game,
      categoryId: speedrunRun.category,
      levelId: speedrunRun.level || null,
      time: speedrunRun.times.primary_t,
      videoUrl: speedrunRun.videos?.links?.[0]?.uri || null,
      comment: speedrunRun.comment || null,
      date: new Date(speedrunRun.date),
      submittedAt: new Date(speedrunRun.submitted),
      verifiedAt: speedrunRun.status['verify-date'] ? new Date(speedrunRun.status['verify-date']) : null,
      isVerified: speedrunRun.status.status === 'verified',
      placement: placement || null,
      platform: speedrunRun.system.platform,
      isEmulated: speedrunRun.system.emulated,
      region: speedrunRun.system.region || null,
      variables: speedrunRun.values,
      playerName: playerName, // Ajouter le nom du joueur transformé
      externalData: {
        speedruncom: {
          id: speedrunRun.id,
          weblink: speedrunRun.weblink,
          status: speedrunRun.status,
          players: speedrunRun.players,
          playersData: speedrunRun.playersData || [], // Inclure les données enrichies
          system: speedrunRun.system
        }
      }
    };
  }

  /**
   * Transforme les données de catégorie speedrun.com
   */
  transformCategoryData(speedrunCategory: SpeedrunCategory) {
    return {
      id: speedrunCategory.id,
      name: speedrunCategory.name,
      rules: speedrunCategory.rules,
      type: speedrunCategory.type,
      isMiscellaneous: speedrunCategory.miscellaneous,
      playerType: speedrunCategory.players.type,
      playerCount: speedrunCategory.players.value,
      externalData: {
        speedruncom: {
          id: speedrunCategory.id,
          weblink: speedrunCategory.weblink,
          links: speedrunCategory.links
        }
      }
    };
  }

  /**
   * Méthode de debug pour tester la connexion de base
   */
  async debugConnection(): Promise<any> {
    try {
      console.log('🔍 Test de connexion debug...');
      console.log('📍 URL de base:', this.baseUrl);
      console.log('📱 User-Agent:', this.userAgent);
      
      const response = await this.api.get('/games', {
        params: {
          max: 1
        }
      });
      
      console.log('✅ Connexion réussie !');
      console.log('📊 Données reçues:', response.data.data[0]);
      return response.data.data[0];
    } catch (error) {
      console.error('❌ Erreur de connexion debug:', error);
      throw error;
    }
  }

  /**
   * Version simplifiée de la recherche pour debug (exhaustive pour tous les jeux)
   */
  async searchGamesSimple(query: string, max: number = 50): Promise<SpeedrunGame[]> {
    try {
      console.log(`🔍 Recherche exhaustive pour: "${query}" (max: ${max})`);
      
      const allGames = new Map<string, SpeedrunGame>();
      const queryLower = query.toLowerCase();
      
      // Définir des termes de recherche multiples pour les jeux populaires
      let searchTerms = [query];
      
      // Ajouter des variantes pour les séries populaires
      if (queryLower.includes('zelda')) {
        searchTerms = ['zelda', 'The Legend of Zelda', 'Legend of Zelda'];
      } else if (queryLower.includes('mario')) {
        searchTerms = ['mario', 'Super Mario', 'Mario Bros', 'New Super Mario', 'Super Mario 64', 'Mario Kart', 'Mario Party'];
      } else if (queryLower.includes('sonic')) {
        searchTerms = ['sonic', 'Sonic the Hedgehog'];
      } else if (queryLower.includes('pokemon')) {
        searchTerms = ['pokemon', 'pokémon'];
      } else if (queryLower.includes('final fantasy')) {
        searchTerms = ['final fantasy', 'ff'];
      } else if (queryLower.includes('metroid')) {
        searchTerms = ['metroid'];
      }
      
      // Pour chaque terme de recherche
      for (const term of searchTerms) {
        console.log(`🔍 Recherche avec le terme: "${term}"`);
        
        // Faire des recherches avec différents paramètres de tri
        const searchConfigs = [
          { orderby: 'similarity', direction: 'desc' },          // Plus populaires
          { orderby: 'created', direction: 'desc' },       // Plus récents
          { orderby: 'name.int', direction: 'asc' } // Alphabétique
        ];
        
        for (const config of searchConfigs) {
          try {
            const response = await this.api.get('/games', {
              params: {
                name: term,
                max: 50, // Maximum par requête
                embed: 'platforms,regions,genres',
                ...config
              }
            });
            
            const games = response.data.data || [];
            
            // Filtrer et ajouter les jeux pertinents
            games.forEach((game: any) => {
              const gameName = game.names.international.toLowerCase();
              const gameAbbr = game.abbreviation.toLowerCase();
              
              // Vérifier que le jeu correspond vraiment au terme recherché
              if (gameName.includes(queryLower) || 
                  gameAbbr.includes(queryLower) ||
                  (term.toLowerCase() !== queryLower && gameName.includes(term.toLowerCase()))) {
                allGames.set(game.id, game);
              }
            });
            
            console.log(`📝 ${games.length} jeux trouvés pour "${term}" avec tri ${config.orderby}`);
            
            // Petit délai entre les requêtes pour éviter le rate limiting
            await new Promise(resolve => setTimeout(resolve, 150));
            
          } catch (error) {
            console.log(`❌ Erreur pour "${term}" avec tri ${config.orderby}:`, error);
          }
        }
        
        // Délai entre les termes
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Convertir en array et trier par pertinence
      const finalGames = Array.from(allGames.values());
      
      // Trier par pertinence
      finalGames.sort((a, b) => {
        const aName = a.names.international.toLowerCase();
        const bName = b.names.international.toLowerCase();

        // Priorité 1: Préférer les jeux principaux (non-extensions) AVANT TOUT
        const aIsExtension = aName.includes('extension') || aName.includes('category extension') || (a as any).romhack;
        const bIsExtension = bName.includes('extension') || bName.includes('category extension') || (b as any).romhack;
        if (!aIsExtension && bIsExtension) return -1;
        if (aIsExtension && !bIsExtension) return 1;

        // Priorité 2: Match exact du nom
        if (aName === queryLower && bName !== queryLower) return -1;
        if (bName === queryLower && aName !== queryLower) return 1;

        // Priorité 3: Correspond exactement à des mots clés importants de la recherche
        const queryWords = queryLower.split(' ');
        const aMatchesKeywords = queryWords.filter(word => aName.includes(word)).length;
        const bMatchesKeywords = queryWords.filter(word => bName.includes(word)).length;
        if (aMatchesKeywords !== bMatchesKeywords) return bMatchesKeywords - aMatchesKeywords;

        // Priorité 4: Commence par le terme recherché
        if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
        if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;

        // Priorité 5: Trier par nombre de liens (indicateur de popularité)
        const aLinks = a.links ? a.links.length : 0;
        const bLinks = b.links ? b.links.length : 0;
        if (bLinks !== aLinks) return bLinks - aLinks;

        // Priorité 6: Tri alphabétique pour stabilité
        return aName.localeCompare(bName);
      });
      
      const result = finalGames.slice(0, max);
      console.log(`✅ ${result.length} jeux finaux retournés pour "${query}" (${allGames.size} uniques trouvés)`);
      
      return result;
    } catch (error) {
      console.error(`❌ Erreur recherche exhaustive pour "${query}":`, error);
      return [];
    }
  }

  /**
   * Méthode de debug pour tester directement la recherche Mario
   */
  async debugMarioSearch(): Promise<any> {
    try {
      console.log('🐍 DEBUG: Test direct de recherche Mario');
      
      // Test 1: Recherche basique
      const basicSearch = await this.api.get('/games', {
        params: {
          name: 'Mario',
          max: 10
        }
      });
      
      console.log('✅ Recherche basique Mario:', {
        url: basicSearch.config.url,
        params: basicSearch.config.params,
        results: basicSearch.data.data?.length || 0,
        firstResult: basicSearch.data.data?.[0]?.names?.international
      });
      
      // Test 2: Recherche avec embed
      const embedSearch = await this.api.get('/games', {
        params: {
          name: 'Mario',
          max: 10,
          embed: 'platforms,regions,genres'
        }
      });
      
      console.log('✅ Recherche avec embed Mario:', {
        results: embedSearch.data.data?.length || 0,
        firstResult: embedSearch.data.data?.[0]?.names?.international
      });
      
      // Test 3: Recherche avec tri
      const sortedSearch = await this.api.get('/games', {
        params: {
          name: 'Mario',
          max: 10,
          orderby: 'similarity',
          direction: 'desc'
        }
      });
      
      console.log('✅ Recherche triée Mario:', {
        results: sortedSearch.data.data?.length || 0,
        firstResult: sortedSearch.data.data?.[0]?.names?.international
      });
      
      // Test 4: Recherche sans paramètre name mais avec query 
      try {
        const querySearch = await this.api.get('/games', {
          params: {
            _bulk: 'yes',
            max: 10
          }
        });
        
        console.log('✅ Recherche bulk:', {
          results: querySearch.data.data?.length || 0,
          sample: querySearch.data.data?.slice(0, 3).map((g: any) => g.names.international)
        });
      } catch (error) {
        console.log('❌ Recherche bulk échouée:', error);
      }
      
      // Test 5: Variantes du terme Mario
      const variants = ['mario', 'Mario', 'MARIO', 'Super Mario'];
      
      for (const variant of variants) {
        try {
          const variantSearch = await this.api.get('/games', {
            params: {
              name: variant,
              max: 5
            }
          });
          
          console.log(`✅ Recherche "${variant}":`, {
            results: variantSearch.data.data?.length || 0,
            firstResult: variantSearch.data.data?.[0]?.names?.international
          });
          
          // Petit délai
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.log(`❌ Recherche "${variant}" échouée:`, error);
        }
      }
      
      return {
        success: true,
        message: 'Tests de debug terminés - voir les logs'
      };
      
    } catch (error) {
      console.error('❌ Erreur debug Mario:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Détermine si un jeu est officiel ou non-officiel (ROM hack, fan game, etc.)
   * Simplifié : tous les jeux sont considérés comme officiels
   */
  isOfficialGame(game: SpeedrunGame): boolean {
    // Tous les jeux sont maintenant considérés comme officiels
    // pour simplifier l'interface et éviter la complexité de détection
    return true;
  }

  /**
   * Filtre et trie les jeux (simplifié : plus de filtrage officiel/non-officiel)
   */
  filterAndSortGamesByOfficial(games: SpeedrunGame[], officialOnly: boolean = false): SpeedrunGame[] {
    // Plus de filtrage officiel/non-officiel - retourner tous les jeux
    // Trier simplement par popularité et nom
    return games.sort((a, b) => {
      // Trier par popularité (nombre de liens)
      const aLinks = a.links ? a.links.length : 0;
      const bLinks = b.links ? b.links.length : 0;
      if (bLinks !== aLinks) return bLinks - aLinks;
      
      // Ensuite tri alphabétique
      return a.names.international.localeCompare(b.names.international);
    });
  }
}

export const speedrunApiService = new SpeedrunApiService(); 