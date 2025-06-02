import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import StatisticsModel from '../models/StatisticsModel';

const prisma = new PrismaClient();

/**
 * Service pour gérer les runs (speedruns)
 */
export default {
  /**
   * Récupère tous les runs avec options de filtrage et pagination
   */
  async getAllRuns(options: {
    gameId?: string;
    categoryId?: string;
    userId?: string;
    isVerified?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'time' | 'submittedAt';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      gameId,
      categoryId,
      userId,
      isVerified,
      page = 1,
      limit = 20,
      sortBy = 'time',
      sortOrder = 'asc'
    } = options;

    // Construire les conditions de filtre
    const where: Record<string, any> = {};
    
    if (gameId) {
      where.gameId = gameId;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    // Calculer le nombre total de runs correspondant aux filtres
    const totalRuns = await prisma.run.count({ where });
    
    // Récupérer les runs avec pagination
    const runs = await prisma.run.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true
          }
        },
        game: {
          select: {
            id: true,
            title: true,
            cover: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return {
      runs,
      pagination: {
        total: totalRuns,
        page,
        limit,
        pages: Math.ceil(totalRuns / limit)
      }
    };
  },

  /**
   * Récupère un run par son ID
   */
  async getRunById(runId: string) {
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            bio: true
          }
        },
        game: true,
        category: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!run) {
      throw new Error('Run non trouvé');
    }

    return run;
  },

  /**
   * Crée un nouveau run
   */
  async createRun(data: {
    time: number;
    videoUrl?: string;
    userId: string;
    gameId: string;
    categoryId: string;
  }) {
    // Créer le run
    const newRun = await prisma.run.create({
      data: {
        time: data.time,
        videoUrl: data.videoUrl,
        userId: data.userId,
        gameId: data.gameId,
        categoryId: data.categoryId,
        isVerified: false
      },
      include: {
        user: {
          select: {
            username: true
          }
        },
        game: {
          select: {
            title: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      }
    });

    // Mettre à jour les statistiques
    try {
      await StatisticsModel.findOneAndUpdate(
        {},
        {
          $inc: { totalRuns: 1 },
          $push: {
            recentActivity: {
              type: 'new_run',
              timestamp: new Date(),
              details: {
                runId: newRun.id,
                username: newRun.user.username,
                gameTitle: newRun.game.title,
                categoryName: newRun.category.name,
                time: newRun.time
              }
            }
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
      // On continue même si la mise à jour des stats échoue
    }

    return newRun;
  },

  /**
   * Vérifie un run (par un modérateur)
   */
  async verifyRun(runId: string) {
    const run = await prisma.run.findUnique({
      where: { id: runId }
    });

    if (!run) {
      throw new Error('Run non trouvé');
    }

    // Vérifier si c'est un nouveau record
    const existingRecord = await prisma.run.findFirst({
      where: {
        gameId: run.gameId,
        categoryId: run.categoryId,
        isVerified: true,
        time: { lt: run.time }
      }
    });

    const isNewRecord = !existingRecord;

    // Mettre à jour le run
    const updatedRun = await prisma.run.update({
      where: { id: runId },
      data: {
        isVerified: true,
        verifiedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        game: {
          select: {
            id: true,
            title: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Mettre à jour les statistiques
    try {
      await StatisticsModel.findOneAndUpdate(
        {},
        {
          $inc: { totalVerifiedRuns: 1 },
          $push: {
            recentActivity: {
              type: isNewRecord ? 'new_record' : 'verified_run',
              timestamp: new Date(),
              details: {
                runId: updatedRun.id,
                userId: updatedRun.user.id,
                username: updatedRun.user.username,
                gameId: updatedRun.game.id,
                gameTitle: updatedRun.game.title,
                categoryId: updatedRun.category.id,
                categoryName: updatedRun.category.name,
                time: updatedRun.time
              }
            }
          }
        }
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
    }

    return {
      ...updatedRun,
      isNewRecord
    };
  },

  /**
   * Ajoute un commentaire à un run
   */
  async addComment(data: {
    content: string;
    userId: string;
    runId: string;
  }) {
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        userId: data.userId,
        runId: data.runId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true
          }
        }
      }
    });

    return comment;
  },

  /**
   * Supprimer un run
   */
  async deleteRun(id: string, userId: string) {
    try {
      // Vérifier que l'utilisateur est bien le propriétaire du run
      const run = await prisma.run.findUnique({
        where: { id },
        select: {
          userId: true,
        },
      });
      
      if (!run) {
        throw new Error('Run non trouvé');
      }
      
      if (run.userId !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer ce run');
      }
      
      await prisma.run.delete({
        where: { id },
      });
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}; 