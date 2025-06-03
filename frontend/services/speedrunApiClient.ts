// Service frontend pour consommer l'API speedrun.com via notre backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  isOfficial: boolean;
  gameType: 'official' | 'community';
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

class SpeedrunApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}/speedrun${endpoint}`;
    
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

  /**
   * Teste la connexion à l'API speedrun.com
   */
  async testConnection(): Promise<{ message: string; testData: SpeedrunGame }> {
    return this.request('/test');
  }

  /**
   * Récupère les jeux populaires
   */
  async getPopularGames(limit = 30, offset = 0, officialOnly = false): Promise<SpeedrunGame[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    if (officialOnly) {
      params.append('officialOnly', 'true');
    }
    
    return this.request(`/games/popular?${params.toString()}`);
  }

  /**
   * Récupère les jeux Zelda populaires
   */
  async getPopularZeldaGames(): Promise<SpeedrunGame[]> {
    return this.request('/games/zelda');
  }

  /**
   * Recherche des jeux par nom
   */
  async searchGames(query: string, limit = 30, officialOnly = false): Promise<SpeedrunGame[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });
    
    if (officialOnly) {
      params.append('officialOnly', 'true');
    }
    
    return this.request(`/games/search?${params.toString()}`);
  }

  /**
   * Recherche exhaustive des jeux par nom (récupère TOUS les résultats)
   */
  async searchGamesExhaustive(query: string, max = 150, officialOnly = false): Promise<SpeedrunGame[]> {
    const params = new URLSearchParams({
      q: query,
      max: max.toString()
    });
    
    if (officialOnly) {
      params.append('officialOnly', 'true');
    }
    
    return this.request(`/games/search/exhaustive?${params.toString()}`);
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
    
    return this.request(endpoint);
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