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
      timeout: 10000, // Réduire le timeout de 30s à 10s pour éviter les longs délais
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
   * Récupère la liste des jeux populaires (VERSION RAPIDE OPTIMISÉE)
   */
  async getPopularGames(limit: number = 30, offset: number = 0, officialOnly: boolean = false): Promise<SpeedrunGame[]> {
    try {
      console.log(`🔥 Récupération rapide de ${limit} jeux populaires (offset: ${offset})`);
      
      // VERSION ULTRA SIMPLIFIÉE : une seule requête simple et rapide
      const response = await this.api.get('/games', {
        params: {
          max: limit,
          offset: offset,
          orderby: 'similarity',
          direction: 'desc',
          embed: 'platforms,regions,genres'
        }
      });
      
      const games = response.data.data || [];
      console.log(`✅ ${games.length} jeux récupérés rapidement`);
      
      // Tri simple par popularité
      games.sort((a: any, b: any) => {
        const aLinks = (a.links ? a.links.length : 0);
        const bLinks = (b.links ? b.links.length : 0);
        return bLinks - aLinks;
      });
      
      return games.slice(0, limit);
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération rapide des jeux populaires:', error);
      
      // Fallback ultra simple
      try {
        console.log('🆘 Fallback ultra simple...');
        const lastResponse = await this.api.get('/games', {
          params: { max: limit }
        });
        
        return lastResponse.data.data || [];
      } catch (lastError) {
        console.error('❌ Fallback échoué:', lastError);
        return [];
      }
    }
  }

  /**
   * Recherche des jeux par nom avec priorité pour les jeux principaux
   */
  async searchGames(query: string, limit: number = 20): Promise<SpeedrunGame[]> {
    try {
      console.log(`🔍 Recherche INTELLIGENTE pour: "${query}" (limite: ${limit})`);
      
      // Jeux prioritaires pour les grosses licences (mapping par nom ET abréviation)
      const priorityGames: { [key: string]: { names: string[]; abbreviations: string[]; score: number }[] } = {
        'mario': [
          { names: ['super mario 64'], abbreviations: ['sm64'], score: 100 },
          { names: ['super mario world'], abbreviations: ['smw'], score: 95 },
          { names: ['super mario bros.'], abbreviations: ['smb'], score: 90 },
          { names: ['super mario odyssey'], abbreviations: ['smo'], score: 85 },
          { names: ['super mario bros. 3'], abbreviations: ['smb3'], score: 80 },
          { names: ['super mario galaxy'], abbreviations: ['smg'], score: 75 },
          { names: ['new super mario bros.'], abbreviations: ['nsmb'], score: 70 },
          { names: ['super mario sunshine'], abbreviations: ['sms'], score: 65 },
          { names: ['mario kart 64'], abbreviations: ['mk64'], score: 60 },
          { names: ['mario party'], abbreviations: ['mp'], score: 55 }
        ],
        'zelda': [
          { names: ['the legend of zelda: ocarina of time'], abbreviations: ['oot'], score: 100 },
          { names: ['the legend of zelda: breath of the wild'], abbreviations: ['botw'], score: 95 },
          { names: ['the legend of zelda: a link to the past'], abbreviations: ['alttp'], score: 90 },
          { names: ['the legend of zelda: majora\'s mask'], abbreviations: ['mm'], score: 85 },
          { names: ['the legend of zelda: twilight princess'], abbreviations: ['tp'], score: 80 },
          { names: ['the legend of zelda: the wind waker'], abbreviations: ['ww'], score: 75 },
          { names: ['the legend of zelda: skyward sword'], abbreviations: ['ss'], score: 70 },
          { names: ['the legend of zelda: link\'s awakening'], abbreviations: ['la'], score: 65 },
          { names: ['the legend of zelda: oracle'], abbreviations: ['oracle'], score: 60 },
          { names: ['the legend of zelda: minish cap'], abbreviations: ['mc'], score: 55 }
        ],
        'sonic': [
          { names: ['sonic the hedgehog'], abbreviations: ['sonic1', 's1'], score: 100 },
          { names: ['sonic the hedgehog 2'], abbreviations: ['sonic2', 's2'], score: 95 },
          { names: ['sonic 3 & knuckles'], abbreviations: ['sonic3k', 's3k'], score: 90 },
          { names: ['sonic cd'], abbreviations: ['soniccd', 'scd'], score: 85 },
          { names: ['sonic mania'], abbreviations: ['sonicmania'], score: 80 },
          { names: ['sonic generations'], abbreviations: ['sonicgen'], score: 75 },
          { names: ['sonic adventure'], abbreviations: ['sa1'], score: 70 },
          { names: ['sonic adventure 2'], abbreviations: ['sa2'], score: 65 }
        ],
        'metroid': [
          { names: ['super metroid'], abbreviations: ['sm'], score: 100 },
          { names: ['metroid'], abbreviations: ['metroid'], score: 95 },
          { names: ['metroid dread'], abbreviations: ['metroiddread'], score: 90 },
          { names: ['metroid prime'], abbreviations: ['metroidprime', 'mp1'], score: 85 },
          { names: ['metroid: zero mission'], abbreviations: ['mzm'], score: 80 },
          { names: ['metroid: samus returns'], abbreviations: ['msr'], score: 75 },
          { names: ['metroid prime 2'], abbreviations: ['mp2'], score: 70 },
          { names: ['metroid prime 3'], abbreviations: ['mp3'], score: 65 }
        ],
        'pokemon': [
          { names: ['pokemon red/blue', 'pokemon red', 'pokemon blue'], abbreviations: ['pokemonred', 'pkmnrb'], score: 100 },
          { names: ['pokemon gold/silver', 'pokemon gold', 'pokemon silver'], abbreviations: ['pokemongold', 'pkmngs'], score: 95 },
          { names: ['pokemon ruby/sapphire/emerald', 'pokemon emerald'], abbreviations: ['pokemonrse', 'pkmnrse'], score: 90 },
          { names: ['pokemon diamond/pearl', 'pokemon platinum'], abbreviations: ['pkmndp'], score: 85 },
          { names: ['pokemon black/white'], abbreviations: ['pkmnbw'], score: 80 },
          { names: ['pokemon x/y'], abbreviations: ['pkmnxy'], score: 75 },
          { names: ['pokemon sun/moon'], abbreviations: ['pkmnsm'], score: 70 }
        ],
        'final': [
          { names: ['final fantasy vii', 'final fantasy 7'], abbreviations: ['ff7', 'ffvii'], score: 100 },
          { names: ['final fantasy x', 'final fantasy 10'], abbreviations: ['ff10', 'ffx'], score: 95 },
          { names: ['final fantasy vi', 'final fantasy 6'], abbreviations: ['ff6', 'ffvi'], score: 90 },
          { names: ['final fantasy ix', 'final fantasy 9'], abbreviations: ['ff9', 'ffix'], score: 85 },
          { names: ['final fantasy viii', 'final fantasy 8'], abbreviations: ['ff8', 'ffviii'], score: 80 }
        ],
        'castlevania': [
          { names: ['castlevania: symphony of the night'], abbreviations: ['sotn'], score: 100 },
          { names: ['super castlevania iv'], abbreviations: ['cv4'], score: 95 },
          { names: ['castlevania'], abbreviations: ['cv1'], score: 90 },
          { names: ['castlevania iii'], abbreviations: ['cv3'], score: 85 }
        ],
        'mega': [
          { names: ['mega man 2'], abbreviations: ['mm2'], score: 100 },
          { names: ['mega man x'], abbreviations: ['mmx'], score: 95 },
          { names: ['mega man 3'], abbreviations: ['mm3'], score: 90 },
          { names: ['mega man'], abbreviations: ['mm1'], score: 85 }
        ],
        'donkey': [
          { names: ['donkey kong country'], abbreviations: ['dkc'], score: 100 },
          { names: ['donkey kong country 2'], abbreviations: ['dkc2'], score: 95 },
          { names: ['donkey kong 64'], abbreviations: ['dk64'], score: 90 },
          { names: ['donkey kong country 3'], abbreviations: ['dkc3'], score: 85 }
        ],
        'crash': [
          { names: ['crash bandicoot'], abbreviations: ['crash1'], score: 100 },
          { names: ['crash bandicoot 2'], abbreviations: ['crash2'], score: 95 },
          { names: ['crash bandicoot 3'], abbreviations: ['crash3'], score: 90 },
          { names: ['crash team racing'], abbreviations: ['ctr'], score: 85 }
        ],
        'spyro': [
          { names: ['spyro the dragon'], abbreviations: ['spyro1'], score: 100 },
          { names: ['spyro 2'], abbreviations: ['spyro2'], score: 95 },
          { names: ['spyro 3'], abbreviations: ['spyro3'], score: 90 }
        ],
        'celeste': [
          { names: ['celeste'], abbreviations: ['celeste'], score: 100 }
        ],
        'hollow': [
          { names: ['hollow knight'], abbreviations: ['hk'], score: 100 }
        ],
        'cuphead': [
          { names: ['cuphead'], abbreviations: ['cuphead'], score: 100 }
        ],
        'ori': [
          { names: ['ori and the blind forest'], abbreviations: ['ori1'], score: 100 },
          { names: ['ori and the will of the wisps'], abbreviations: ['ori2'], score: 95 }
        ],
        'shovel': [
          { names: ['shovel knight'], abbreviations: ['sk'], score: 100 }
        ],
        'undertale': [
          { names: ['undertale'], abbreviations: ['undertale'], score: 100 }
        ],
        'portal': [
          { names: ['portal'], abbreviations: ['portal'], score: 100 },
          { names: ['portal 2'], abbreviations: ['portal2'], score: 95 }
        ],
        'half': [
          { names: ['half-life'], abbreviations: ['hl1'], score: 100 },
          { names: ['half-life 2'], abbreviations: ['hl2'], score: 95 }
        ]
      };
      
      // Filtrage et scoring intelligent
      const queryLower = query.toLowerCase().trim();
      
      // Conversion chiffres arabes → chiffres romains
      const arabicToRoman: { [key: string]: string } = {
        '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
        '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X',
        '11': 'XI', '12': 'XII', '13': 'XIII', '14': 'XIV', '15': 'XV'
      };
      
      // Fonction pour convertir une requête avec chiffres arabes en romains
      const convertToRoman = (text: string): string[] => {
        const variants = [text];
        
        // Chercher les chiffres dans le texte et créer des variantes romaines
        for (const [arabic, roman] of Object.entries(arabicToRoman)) {
          if (text.includes(' ' + arabic) || text.endsWith(' ' + arabic) || text.endsWith(arabic)) {
            const romanVariant = text.replace(new RegExp(arabic + '(?=\\s|$)', 'g'), roman);
            if (romanVariant !== text) {
              variants.push(romanVariant);
            }
          }
        }
        
        return variants;
      };
      
      // NOUVELLE APPROCHE : UNE SEULE RECHERCHE RAPIDE + SCORING INTELLIGENT
      const allGames = new Map<string, any>();
      
      // Une seule recherche avec le terme principal + variantes de chiffres
      let searchTerms = [query];
      const romanVariants = convertToRoman(query);
      searchTerms.push(...romanVariants);
      
      // Ajouter UN SEUL terme de recherche large selon la franchise détectée
      if (queryLower.includes('mario')) {
        if (queryLower.includes('kart')) {
          searchTerms.push('Mario Kart'); // Recherche ciblée pour Mario Kart
        } else {
          searchTerms.push('Mario'); // Recherche générale Mario
        }
                          } else if (queryLower.includes('zelda')) {
         searchTerms.push('Zelda'); // Recherche générale Zelda
             } else if (queryLower.includes('sonic')) {
         searchTerms.push('Sonic');
              } else if (queryLower.includes('metroid')) {
        searchTerms.push('Metroid');
             } else if (queryLower.includes('ys')) {
         searchTerms.push('Ys'); // Recherche générale Ys
       } else if (queryLower.includes('dragon') && queryLower.includes('quest')) {
         searchTerms.push('Dragon Quest'); // Recherche générale Dragon Quest
       } else if (queryLower.includes('pokemon') || queryLower.includes('pokémon')) {
         searchTerms.push('Pokemon'); // Recherche générale Pokemon
       } else if (queryLower.includes('final fantasy')) {
         searchTerms.push('Final Fantasy'); // Recherche générale Final Fantasy
       }
       
       // Ajout de termes génériques français pour d'autres recherches populaires
       if (queryLower.includes('final') || queryLower.includes('fantasy')) {
         searchTerms.push('Final Fantasy VII', 'Final Fantasy X', 'Final Fantasy VI');
       }
       
       if (queryLower.includes('castlevania')) {
         searchTerms.push('Castlevania: Symphony of the Night', 'Super Castlevania IV');
       }
       
       if (queryLower.includes('metroid')) {
         searchTerms.push('Super Metroid', 'Metroid Prime', 'Metroid Dread');
       }
       
       // Détections spécifiques pour termes français
       if (queryLower.includes('perle')) {
         searchTerms.push('Pokemon Diamond/Pearl', 'Pokémon Perle', 'Pokemon Pearl Version');
       }
       
       if (queryLower.includes('diamant')) {
         searchTerms.push('Pokemon Diamond/Pearl', 'Pokémon Diamant', 'Pokemon Diamond Version');
       }
       
       if (queryLower.includes('platine')) {
         searchTerms.push('Pokemon Platinum', 'Pokémon Platine');
       }
       
       if (queryLower.includes('émeraude') || queryLower.includes('emeraude')) {
         searchTerms.push('Pokemon Emerald Version', 'Pokémon Émeraude', 'Pokemon Ruby/Sapphire');
       }
       
       if (queryLower.includes('rubis')) {
         searchTerms.push('Pokemon Ruby/Sapphire', 'Pokémon Rubis', 'Pokemon Ruby Version');
       }
       
       if (queryLower.includes('saphir')) {
         searchTerms.push('Pokemon Ruby/Sapphire', 'Pokémon Saphir', 'Pokemon Sapphire Version');
       }
       
       if (queryLower.includes('soleil')) {
         searchTerms.push('Pokemon Sun/Moon', 'Pokémon Soleil', 'Pokemon Sun Version', 'Pokemon Ultra Sun');
       }
       
       if (queryLower.includes('lune')) {
         searchTerms.push('Pokemon Sun/Moon', 'Pokémon Lune', 'Pokemon Moon Version', 'Pokemon Ultra Moon');
       }
       
       if (queryLower.includes('ultra')) {
         searchTerms.push('Pokemon Ultra Sun', 'Pokemon Ultra Moon', 'Pokémon Ultra-Soleil', 'Pokémon Ultra-Lune');
       }
       
       if (queryLower.includes('violet')) {
         searchTerms.push('Pokemon Violet', 'Pokémon Violet', 'Pokemon Scarlet/Violet');
       }
       
       if (queryLower.includes('écarlate') || queryLower.includes('ecarlate')) {
         searchTerms.push('Pokemon Scarlet', 'Pokémon Écarlate', 'Pokemon Scarlet/Violet');
       }
       
       if (queryLower.includes('épée') || queryLower.includes('epee')) {
         searchTerms.push('Pokemon Sword', 'Pokémon Épée', 'Pokemon Sword/Shield');
       }
       
       if (queryLower.includes('bouclier')) {
         searchTerms.push('Pokemon Shield', 'Pokémon Bouclier', 'Pokemon Sword/Shield');
       }
       
       if (queryLower.includes('arceus') || queryLower.includes('legends')) {
         searchTerms.push('Pokemon Legends: Arceus', 'Pokémon Legends Arceus');
       }
       
       // Autres séries populaires
       if (queryLower.includes('kingdom') && queryLower.includes('hearts')) {
         searchTerms.push('Kingdom Hearts', 'Kingdom Hearts II', 'Kingdom Hearts III');
       }
       
       if (queryLower.includes('chrono')) {
         searchTerms.push('Chrono Trigger', 'Chrono Cross');
       }
       
       if (queryLower.includes('secret') && queryLower.includes('mana')) {
         searchTerms.push('Secret of Mana', 'Trials of Mana');
       }
       
       if (queryLower.includes('tales')) {
         searchTerms.push('Tales of Symphonia', 'Tales of Vesperia', 'Tales of the Abyss');
       }
       
       if (queryLower.includes('persona')) {
         searchTerms.push('Persona 3', 'Persona 4', 'Persona 5');
       }
       
       if (queryLower.includes('nier')) {
         searchTerms.push('NieR', 'NieR: Automata');
       }
       
       // Détections spécifiques pour Dragon Quest par numéro
       if (queryLower.includes('dragon quest 8') || queryLower.includes('dq8')) {
         searchTerms.push('Dragon Quest VIII', 'Dragon Quest VIII: Journey of the Cursed King');
       }
       
       if (queryLower.includes('dragon quest 11') || queryLower.includes('dq11')) {
         searchTerms.push('Dragon Quest XI', 'Dragon Quest XI: Echoes of an Elusive Age');
       }
       
       if (queryLower.includes('dragon quest 3') || queryLower.includes('dq3')) {
         searchTerms.push('Dragon Quest III', 'Dragon Warrior III');
       }
       
       if (queryLower.includes('dragon quest 7') || queryLower.includes('dq7')) {
         searchTerms.push('Dragon Quest VII', 'Dragon Quest VII: Fragments of the Forgotten Past');
       }
       
       // Détections spécifiques pour Ys avec conversion automatique
       if (queryLower.includes('ys ')) {
         // Extraire le numéro et ajouter les variantes
         const ysMatch = queryLower.match(/ys\s*(\d+)/);
         if (ysMatch) {
           const number = ysMatch[1];
           const roman = arabicToRoman[number];
           if (roman) {
             searchTerms.push(`Ys ${roman}`, `Ys: ${roman}`);
           }
         }
         
         // Ajouter aussi les noms spéciaux de Ys
         searchTerms.push('Ys: The Oath in Felghana', 'Ys: Origin', 'Ys: Memories of Celceta', 'Ys: Lacrimosa of Dana');
       }
       
       // Application universelle des chiffres romains pour Final Fantasy
       if (queryLower.includes('final fantasy ')) {
         const ffMatch = queryLower.match(/final fantasy\s*(\d+)/);
         if (ffMatch) {
           const number = ffMatch[1];
           const roman = arabicToRoman[number];
           if (roman) {
             searchTerms.push(`Final Fantasy ${roman}`, `FF${roman}`);
           }
         }
       }

             // Équivalences français/anglais pour un filtrage plus intelligent
       const frenchToEnglish: { [key: string]: string[] } = {
         'perle': ['pearl', 'diamond/pearl'],
         'diamant': ['diamond', 'diamond/pearl'],
         'platine': ['platinum'],
         'émeraude': ['emerald'],
         'emeraude': ['emerald'],
         'rubis': ['ruby'],
         'saphir': ['sapphire'],
         'or': ['gold'],
         'argent': ['silver'],
         'rouge': ['red'],
         'bleu': ['blue'],
         'jaune': ['yellow'],
         'noir': ['black'],
         'blanc': ['white'],
         'cristal': ['crystal'],
         'soleil': ['sun', 'sun/moon'],
         'lune': ['moon', 'sun/moon'],
         'ultra-soleil': ['ultra sun'],
         'ultra-lune': ['ultra moon'],
         'épée': ['sword'],
         'bouclier': ['shield'],
         'écarlate': ['scarlet'],
         'violet': ['violet'],
         'legends': ['legends', 'arceus']
       };

       // OPTIMISATION : limiter à maximum 3 recherches pour éviter la lenteur
       const limitedSearchTerms = searchTerms.slice(0, 3);
       console.log(`⚡ Recherche RAPIDE avec ${limitedSearchTerms.length} termes: ${limitedSearchTerms.join(', ')}`);
       
       for (const term of limitedSearchTerms) {
         try {
           console.log(`🔍 Recherche du terme: "${term}"`);
           
           const searchParams = {
             name: term,
             max: 15, // Réduire pour plus de rapidité
             embed: 'platforms,regions,genres'
           };
           
           const response = await this.api.get('/games', { params: searchParams });
           const games = response.data.data || [];
           
           console.log(`📝 ${games.length} jeux trouvés pour "${term}"`);
           
           // Ajouter tous les jeux trouvés (avec filtrage intelligent)
           games.forEach((game: any) => {
             const gameName = game.names.international.toLowerCase();
             const gameAbbrev = game.abbreviation.toLowerCase();
             
             // Vérifier correspondance directe avec la requête originale
             let matches = gameName.includes(queryLower) || 
                          gameAbbrev.includes(queryLower);
             
             // Vérifier correspondance par mots avec équivalences
             if (!matches) {
               const queryWords = queryLower.split(' ').filter(word => word.length > 1); // Ignorer mots trop courts
               matches = queryWords.some((word: string) => {
                 // Vérifier le mot directement
                 if (gameName.includes(word) || gameAbbrev.includes(word)) {
                   return true;
                 }
                 // Vérifier les équivalences français/anglais
                 if (frenchToEnglish[word]) {
                   return frenchToEnglish[word].some(englishWord => 
                     gameName.includes(englishWord) || gameAbbrev.includes(englishWord)
                   );
                 }
                 return false;
               });
             }
             
             if (matches) {
               allGames.set(game.id, game);
               console.log(`✅ Jeu ajouté: "${game.names.international}" car correspond à "${queryLower}"`);
             }
           });
           
           // Suppression du délai pour plus de rapidité
         } catch (error) {
           console.log(`❌ Erreur recherche pour "${term}":`, error);
         }
       }

             const games = Array.from(allGames.values()) as SpeedrunGame[];
      console.log(`✅ ${games.length} jeux trouvés rapidement`);
      
      // DEBUG: Afficher les premiers noms de jeux pour diagnostic (pour tous les termes)
      console.log(`🔍 DEBUG - Premiers jeux trouvés pour "${query}":`);
      games.slice(0, 10).forEach((game: any, index: number) => {
        console.log(`  ${index + 1}. "${game.names.international}" (${game.abbreviation})`);
      });
      
      // Chercher spécifiquement les jeux iconiques selon le terme de recherche
      let iconicGames: any[] = [];
      
      if (queryLower.includes('mario')) {
        iconicGames = games.filter((game: any) => {
          const name = game.names.international.toLowerCase();
          return name.includes('super mario 64') || 
                 name.includes('super mario world') || 
                 name.includes('super mario bros') ||
                 name.includes('super mario odyssey') ||
                 name.includes('mario kart') ||
                 name.includes('super mario galaxy');
        });
      } else if (queryLower.includes('zelda')) {
        iconicGames = games.filter((game: any) => {
          const name = game.names.international.toLowerCase();
          return name.includes('ocarina of time') || 
                 name.includes('breath of the wild') || 
                 name.includes('link to the past') ||
                 name.includes('majora') ||
                 name.includes('twilight princess') ||
                 name.includes('wind waker');
        });
      } else if (queryLower.includes('sonic')) {
        iconicGames = games.filter((game: any) => {
          const name = game.names.international.toLowerCase();
          return name.includes('sonic the hedgehog') || 
                 name.includes('sonic 2') || 
                 name.includes('sonic 3') ||
                 name.includes('sonic cd') ||
                 name.includes('sonic mania') ||
                 name.includes('sonic generations');
        });
      }
      
      if (iconicGames.length > 0) {
        console.log(`🎯 Jeux iconiques trouvés pour "${query}":`);
        iconicGames.forEach((game: any, index: number) => {
          console.log(`  ⭐ "${game.names.international}" (${game.abbreviation})`);
        });
      } else {
        console.log(`❌ Aucun jeu iconique reconnu trouvé pour "${query}"`);
      }
      const scoredGames = games.map((game: any) => {
        const gameName = game.names.international.toLowerCase();
        const gameAbbrev = game.abbreviation.toLowerCase();
        let priorityScore = 0;
        
        // Bonus de score spécifique pour correspondances exactes avec des termes spécifiques
        
        // MARIO - Scoring spécifique selon le type de jeu recherché
        if (queryLower.includes('mario')) {
          if (queryLower.includes('kart') && gameName.includes('mario kart')) {
            priorityScore += 300; // Priorité MAXIMALE pour Mario Kart quand on cherche "mario kart"
            if (gameName.includes('mario kart 64')) priorityScore += 50; // Mario Kart 64 en premier
          } else if (queryLower.includes('64') && gameName.includes('super mario 64')) {
            priorityScore += 300;
          } else if (queryLower.includes('world') && gameName.includes('super mario world')) {
            priorityScore += 300;
          } else if (queryLower.includes('odyssey') && gameName.includes('odyssey')) {
            priorityScore += 300;
          } else if (queryLower.includes('galaxy') && gameName.includes('galaxy')) {
            priorityScore += 300;
          } else if (queryLower.includes('party') && gameName.includes('mario party')) {
            priorityScore += 300;
          }
        }
        
        // ZELDA - Scoring spécifique
        if (queryLower.includes('zelda')) {
          if (queryLower.includes('twilight') && gameName.includes('twilight princess')) {
            priorityScore += 300;
          } else if (queryLower.includes('ocarina') && gameName.includes('ocarina of time')) {
            priorityScore += 300;
          } else if (queryLower.includes('breath') && gameName.includes('breath of the wild')) {
            priorityScore += 300;
          } else if (queryLower.includes('majora') && gameName.includes('majora')) {
            priorityScore += 300;
          } else if (queryLower.includes('wind') && gameName.includes('wind waker')) {
            priorityScore += 300;
          } else if (queryLower.includes('skyward') && gameName.includes('skyward sword')) {
            priorityScore += 300;
          }
        }
        
        // YS - Scoring spécifique avec conversion chiffres arabes → romains
        if (queryLower.includes('ys')) {
          if (queryLower.includes('8') && (gameName.includes('ys viii') || gameName.includes('lacrimosa of dana'))) {
            priorityScore += 300; // Ys VIII: Lacrimosa of Dana pour "ys 8"
          } else if (queryLower.includes('7') && gameName.includes('ys vii')) {
            priorityScore += 300;
          } else if (queryLower.includes('6') && gameName.includes('ys vi')) {
            priorityScore += 300;
          } else if (queryLower.includes('9') && gameName.includes('ys ix')) {
            priorityScore += 300;
          } else if (queryLower.includes('origin') && gameName.includes('ys: origin')) {
            priorityScore += 300;
          } else if (queryLower.includes('felghana') && gameName.includes('oath in felghana')) {
            priorityScore += 300;
          } else if (queryLower.includes('celceta') && gameName.includes('memories of celceta')) {
            priorityScore += 300;
          }
        }
        
        // DRAGON QUEST - Scoring spécifique
        if (queryLower.includes('dragon quest')) {
          if (queryLower.includes('8') && gameName.includes('dragon quest viii')) {
            priorityScore += 300;
          } else if (queryLower.includes('11') && gameName.includes('dragon quest xi')) {
            priorityScore += 300;
          } else if (queryLower.includes('3') && (gameName.includes('dragon quest iii') || gameName.includes('dragon warrior iii'))) {
            priorityScore += 300;
          } else if (queryLower.includes('7') && gameName.includes('dragon quest vii')) {
            priorityScore += 300;
          }
        }
        
        // POKEMON - Scoring spécifique
        if (queryLower.includes('pokemon') || queryLower.includes('pokémon')) {
          if ((queryLower.includes('red') || queryLower.includes('rouge')) && gameName.includes('red')) {
            priorityScore += 300;
          } else if ((queryLower.includes('blue') || queryLower.includes('bleu')) && gameName.includes('blue')) {
            priorityScore += 300;
          } else if ((queryLower.includes('gold') || queryLower.includes('or')) && gameName.includes('gold')) {
            priorityScore += 300;
          } else if ((queryLower.includes('silver') || queryLower.includes('argent')) && gameName.includes('silver')) {
            priorityScore += 300;
          } else if ((queryLower.includes('emerald') || queryLower.includes('émeraude')) && gameName.includes('emerald')) {
            priorityScore += 300;
          }
        }
        
        // FINAL FANTASY - Scoring spécifique avec conversion chiffres arabes → romains
        if (queryLower.includes('final fantasy')) {
          if (queryLower.includes('6') && gameName.includes('final fantasy vi')) {
            priorityScore += 300; // Final Fantasy VI pour "final fantasy 6"
          } else if (queryLower.includes('7') && gameName.includes('final fantasy vii')) {
            priorityScore += 300;
          } else if (queryLower.includes('8') && gameName.includes('final fantasy viii')) {
            priorityScore += 300;
          } else if (queryLower.includes('9') && gameName.includes('final fantasy ix')) {
            priorityScore += 300;
          } else if (queryLower.includes('10') && gameName.includes('final fantasy x')) {
            priorityScore += 300;
          } else if (queryLower.includes('4') && gameName.includes('final fantasy iv')) {
            priorityScore += 300;
          } else if (queryLower.includes('5') && gameName.includes('final fantasy v')) {
            priorityScore += 300;
          } else if (queryLower.includes('12') && gameName.includes('final fantasy xii')) {
            priorityScore += 300;
          } else if (queryLower.includes('13') && gameName.includes('final fantasy xiii')) {
            priorityScore += 300;
          } else if (queryLower.includes('15') && gameName.includes('final fantasy xv')) {
            priorityScore += 300;
          }
        }
        
        // Vérifier si le terme de recherche correspond à une licence connue
        for (const [franchise, priorityGamesList] of Object.entries(priorityGames)) {
          if (queryLower.includes(franchise) || franchise.includes(queryLower)) {
            const priorityGame = priorityGamesList.find(pg => 
              pg.names.some(name => gameName.includes(name.toLowerCase())) ||
              pg.abbreviations.some(abbrev => gameAbbrev === abbrev.toLowerCase())
            );
            if (priorityGame) {
              priorityScore += priorityGame.score;
              break;
            }
          }
        }
        
        // Score basé sur la correspondance exacte du nom
        if (gameName === queryLower) {
          priorityScore += 50;
        } else if (gameName.startsWith(queryLower)) {
          priorityScore += 25;
        } else if (gameName.includes(queryLower)) {
          priorityScore += 10;
        }
        
        // Score basé sur la correspondance de l'abréviation
        if (gameAbbrev === queryLower) {
          priorityScore += 30;
        }
        
        return {
          ...game,
          _priorityScore: priorityScore
        };
      });

      // Tri intelligent par score de priorité puis par nom
      scoredGames.sort((a: any, b: any) => {
        if (b._priorityScore !== a._priorityScore) {
          return b._priorityScore - a._priorityScore;
        }
        return a.names.international.localeCompare(b.names.international);
      });

      const finalResults = scoredGames.slice(0, limit).map(({_priorityScore, ...game}: {_priorityScore: number; [key: string]: any}) => game);
      console.log(`🎯 ${finalResults.length} jeux retournés avec priorité intelligente`);
      
      return finalResults as SpeedrunGame[];

    } catch (error) {
      console.error('❌ Erreur lors de la recherche intelligente:', error);
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
   * Récupère les runs récents globaux (tous jeux confondus)
   */
  async getGlobalRecentRuns(limit: number = 20): Promise<SpeedrunRun[]> {
    try {
      const response = await this.api.get('/runs', {
        params: {
          status: 'verified',
          orderby: 'verify-date',
          direction: 'desc',
          max: limit,
          embed: 'game,category,level,players,platforms'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des runs récents globaux:`, error);
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