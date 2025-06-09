// Service frontend pour consommer l'API speedrun.com via notre backend
// Force deploy fix - v2.1
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface SpeedrunGame {
  id: string;
  name: string;
  abbreviation: string;
  weblink: string;
  releaseDate?: Date;
  description?: string;
  coverImage?: string;
  logoImage?: string;
  backgroundImage?: string;
  platforms: string[];
  genres: string[];
  developers: string[];
  publishers: string[];
  externalData: {
    speedruncom: {
      id: string;
      abbreviation: string;
      weblink: string;
      assets: any;
      moderators: Record<string, string>;
    };
  };
}

export interface SpeedrunCategory {
  id: string;
  name: string;
  rules: string;
  type: 'per-game' | 'per-level';
  isMiscellaneous: boolean;
  playerType: 'exactly' | 'up-to';
  playerCount: number;
  externalData: {
    speedruncom: {
      id: string;
      weblink: string;
      links: Array<{ rel: string; uri: string }>;
    };
  };
}

export interface SpeedrunRun {
  id: string;
  gameId: string;
  categoryId: string;
  levelId?: string;
  time: number;
  videoUrl?: string;
  comment?: string;
  date: Date;
  submittedAt: Date;
  verifiedAt?: Date;
  isVerified: boolean;
  placement?: number;
  platform: string;
  isEmulated: boolean;
  region?: string;
  variables: Record<string, string>;
  playerName?: string;
  externalData: {
    speedruncom: {
      id: string;
      weblink: string;
      status: any;
      players: any[];
      playersData?: any[];
      system: any;
    };
  };
}

export interface LeaderboardEntry {
  placement: number;
  run: SpeedrunRun;
}

export interface Leaderboard {
  gameId: string;
  categoryId: string;
  weblink: string;
  timing: string;
  runs: LeaderboardEntry[];
  metadata: {
    players: any;
    platforms: any;
    regions: any;
    variables: any;
  };
}

export interface RecentRun {
  id: string;
  user: {
    id: string;
    username: string;
    profileImage?: string;
  };
  game: {
    id: string;
    title: string;
    cover?: string;
  };
  category: {
    id: string;
    name: string;
  };
  time: number;
  formattedTime: string;
  submittedAt: string;
  verifiedAt?: string;
  isVerified: boolean;
}

// Type pour les runs enrichis avec les détails du jeu (utilisé dans la page activity)
export interface EnrichedRecentRun extends RecentRun {
  gameDetails?: SpeedrunGame | null;
}

class SpeedrunApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}/api/speedrun${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur API');
      }

      return data.data;
    } catch (error) {
      console.error(`Erreur API speedrun.com (${endpoint}):`, error);
      throw error;
    }
  }

  private async requestDirect<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}/api${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur API');
      }

      return data.data;
    } catch (error) {
      console.error(`Erreur API directe (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Teste la connexion à l'API speedrun.com
   */
  async testConnection(): Promise<{ message: string; testData: SpeedrunGame }> {
    return this.request('/test');
  }

  /**
   * Récupère les jeux populaires
   */
  async getPopularGames(limit = 30, offset = 0): Promise<SpeedrunGame[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    return this.request(`/games/popular?${params.toString()}`);
  }

  /**
   * Récupère les jeux Zelda populaires
   */
  async getPopularZeldaGames(): Promise<SpeedrunGame[]> {
    return this.request('/games/zelda');
  }

  /**
   * Recherche intelligente des jeux par nom via le backend
   */
  async searchGames(query: string, limit = 30): Promise<SpeedrunGame[]> {
    // Utiliser la nouvelle recherche intelligente du backend
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });
    
    return this.request<SpeedrunGame[]>(`/games/search?${params.toString()}`);
  }

  /**
   * Récupère un jeu par son ID
   */
  async getGameById(gameId: string): Promise<SpeedrunGame> {
    return this.request(`/games/${gameId}`);
  }

  /**
   * Récupère les catégories d'un jeu
   */
  async getGameCategories(gameId: string): Promise<SpeedrunCategory[]> {
    return this.request(`/games/${gameId}/categories`);
  }

  /**
   * Récupère les runs récents d'un jeu
   */
  async getRecentRuns(gameId: string, limit = 20): Promise<SpeedrunRun[]> {
    return this.request(`/games/${gameId}/runs/recent?limit=${limit}`);
  }

  /**
   * Récupère les runs récents globaux (tous jeux confondus)
   */
  async getGlobalRecentRuns(limit = 20): Promise<RecentRun[]> {
    return this.requestDirect(`/leaderboards/recent?limit=${limit}`);
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
      videoOnly?: boolean;
      timing?: string;
      date?: string;
      variables?: Record<string, string>;
    } = {}
  ): Promise<Leaderboard> {
    const params = new URLSearchParams();
    
    if (options.top) params.append('top', options.top.toString());
    if (options.platform) params.append('platform', options.platform);
    if (options.region) params.append('region', options.region);
    if (options.emulators !== undefined) params.append('emulators', options.emulators.toString());
    if (options.videoOnly !== undefined) params.append('video-only', options.videoOnly.toString());
    if (options.timing) params.append('timing', options.timing);
    if (options.date) params.append('date', options.date);

    // Ajouter les variables
    if (options.variables) {
      Object.entries(options.variables).forEach(([key, value]) => {
        params.append(`var-${key}`, value);
      });
    }

    const queryString = params.toString();
    const endpoint = `/leaderboards/${gameId}/${categoryId}${queryString ? `?${queryString}` : ''}`;
    
    const leaderboard = await this.request<Leaderboard>(endpoint);
    
    // Post-traitement : convertir les dates string en objets Date
    if (leaderboard.runs) {
      leaderboard.runs.forEach(entry => {
        if (entry.run.date && typeof entry.run.date === 'string') {
          entry.run.date = new Date(entry.run.date);
        }
        if (entry.run.submittedAt && typeof entry.run.submittedAt === 'string') {
          entry.run.submittedAt = new Date(entry.run.submittedAt);
        }
        if (entry.run.verifiedAt && typeof entry.run.verifiedAt === 'string') {
          entry.run.verifiedAt = new Date(entry.run.verifiedAt);
        }
      });
    }
    
    return leaderboard;
  }

  /**
   * Récupère les runs d'un utilisateur
   */
  async getUserRuns(userId: string, limit = 20): Promise<SpeedrunRun[]> {
    return this.request(`/users/${userId}/runs?limit=${limit}`);
  }

  /**
   * Formate le temps en format lisible
   */
  formatTime(seconds: number): string {
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
  }

  /**
   * Extrait le nom du joueur depuis les données de run
   */
  getPlayerName(run: SpeedrunRun): string {
    // Utiliser d'abord le nom enrichi par le backend
    if (run.playerName) {
      return run.playerName;
    }

    // Vérifier que externalData existe
    if (!run.externalData || !run.externalData.speedruncom) {
      return 'Joueur inconnu';
    }

    // Fallback sur les données enrichies
    const playersData = run.externalData.speedruncom.playersData;
    if (playersData && playersData.length > 0) {
      return playersData[0].name || 'Joueur inconnu';
    }

    // Fallback sur les données originales
    const players = run.externalData.speedruncom.players;
    if (players && players.length > 0) {
      const firstPlayer = players[0];
      if (firstPlayer.rel === 'guest') {
        return firstPlayer.name || 'Invité';
      } else if (firstPlayer.rel === 'user') {
        return firstPlayer.name || `Joueur ${firstPlayer.id || 'inconnu'}`;
      }
    }

    return 'Joueur inconnu';
  }

  /**
   * Extrait le nom du joueur depuis les données de RecentRun
   */
  getPlayerNameFromRecentRun(run: RecentRun): string {
    return run.user?.username || 'Joueur inconnu';
  }

  /**
   * Détermine si une image est disponible
   */
  hasValidImage(imageUrl?: string): boolean {
    return !!(imageUrl && imageUrl !== 'null' && imageUrl.startsWith('http'));
  }

  /**
   * Obtient l'URL de l'image avec fallback
   */
  getImageUrl(game: SpeedrunGame, type: 'cover' | 'logo' | 'background' = 'cover'): string | null {
    let imageUrl: string | undefined;

    switch (type) {
      case 'cover':
        imageUrl = game.coverImage;
        break;
      case 'logo':
        imageUrl = game.logoImage;
        break;
      case 'background':
        imageUrl = game.backgroundImage;
        break;
    }

    return this.hasValidImage(imageUrl) ? imageUrl! : null;
  }
}

export const speedrunApiClient = new SpeedrunApiClient(); 