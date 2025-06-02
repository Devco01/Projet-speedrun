import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service pour gérer les jeux et leurs catégories
 */
export default {
  /**
   * Récupère tous les jeux avec options de filtrage et pagination
   */
  async getAllGames(options: {
    search?: string;
    genre?: string[];
    platform?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'title' | 'releaseDate' | 'runsCount';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      search,
      genre,
      platform,
      page = 1,
      limit = 20,
      sortBy = 'title',
      sortOrder = 'asc'
    } = options;

    // Construire les conditions de filtre
    const where: Record<string, any> = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (genre && genre.length > 0) {
      where.genre = { hasSome: genre };
    }
    
    if (platform && platform.length > 0) {
      where.platform = { hasSome: platform };
    }

    // Calculer le nombre total de jeux correspondant aux filtres
    const totalGames = await prisma.game.count({ where });
    
    // Récupérer les jeux avec pagination
    const games = await prisma.game.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { runs: true }
        },
        categories: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { runs: true }
            }
          }
        }
      }
    });

    // Formater les résultats
    const formattedGames = games.map((game: any) => ({
      ...game,
      runsCount: game._count.runs,
      _count: undefined
    }));

    return {
      games: formattedGames,
      pagination: {
        total: totalGames,
        page,
        limit,
        pages: Math.ceil(totalGames / limit)
      }
    };
  },

  /**
   * Récupère un jeu par son ID avec ses catégories
   */
  async getGameById(gameId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        categories: {
          include: {
            _count: {
              select: { runs: true }
            }
          }
        },
        _count: {
          select: { runs: true }
        }
      }
    });

    if (!game) {
      throw new Error('Jeu non trouvé');
    }

    // Formater le résultat
    return {
      ...game,
      runsCount: game._count.runs,
      _count: undefined,
      categories: game.categories.map((category: any) => ({
        ...category,
        runsCount: category._count.runs,
        _count: undefined
      }))
    };
  },

  /**
   * Récupère les meilleurs runs pour un jeu et une catégorie
   */
  async getGameLeaderboard(gameId: string, categoryId?: string, limit = 10) {
    const where: Record<string, any> = {
      gameId,
      isVerified: true
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const runs = await prisma.run.findMany({
      where,
      orderBy: { time: 'asc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true
          }
        },
        category: true
      }
    });

    return runs;
  },

  /**
   * Récupère toutes les catégories d'un jeu
   */
  async getGameCategories(gameId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        categories: {
          include: {
            _count: {
              select: { runs: true }
            }
          }
        }
      }
    });

    if (!game) {
      throw new Error('Jeu non trouvé');
    }

    return game.categories.map((category: any) => ({
      ...category,
      runsCount: category._count.runs,
      _count: undefined
    }));
  },

  /**
   * Créer un nouveau jeu
   */
  async createGame(data: {
    title: string;
    cover?: string;
    description?: string;
    releaseDate?: Date;
    platform: string[];
    genre: string[];
    developer?: string;
    publisher?: string;
    website?: string;
  }) {
    try {
      const newGame = await prisma.game.create({
        data,
      });
      
      return newGame;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mettre à jour un jeu
   */
  async updateGame(id: string, data: {
    title?: string;
    cover?: string;
    description?: string;
    releaseDate?: Date;
    platform?: string[];
    genre?: string[];
    developer?: string;
    publisher?: string;
    website?: string;
  }) {
    try {
      const updatedGame = await prisma.game.update({
        where: { id },
        data,
      });
      
      return updatedGame;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprimer un jeu
   */
  async deleteGame(id: string) {
    try {
      await prisma.game.delete({
        where: { id },
      });
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}; 