import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class RaceController {
  /**
   * Obtenir toutes les races avec pagination
   */
  async getAllRaces(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const races = await prisma.race.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              profileImage: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profileImage: true
                }
              }
            }
          },
          _count: {
            select: {
              participants: true,
              messages: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      });

      const totalRaces = await prisma.race.count();

      res.json({
        success: true,
        data: races,
        pagination: {
          page,
          limit,
          total: totalRaces,
          totalPages: Math.ceil(totalRaces / limit)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des races:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Obtenir une race par ID
   */
  async getRaceById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const race = await prisma.race.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              profileImage: true
            }
          },
          participants: {
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
              joinedAt: 'asc'
            }
          },
          messages: {
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
              createdAt: 'asc'
            }
          }
        }
      });

      if (!race) {
        return res.status(404).json({
          success: false,
          message: 'Race non trouvée'
        });
      }

      res.json({
        success: true,
        data: race
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la race:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Créer une nouvelle race
   */
  async createRace(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const {
        gameName,
        gameId,
        categoryName,
        categoryId,
        objective = 'Meilleur temps',
        maxParticipants = 4,
        password
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Validation des données
      if (!gameName || !gameId || !categoryName || !categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Jeu et catégorie requis'
        });
      }

      // Créer la race
      const race = await prisma.race.create({
        data: {
          gameName,
          gameId,
          categoryName,
          categoryId,
          objective,
          maxParticipants,
          password,
          createdById: userId,
          participants: {
            create: {
              userId,
              status: 'inscrit'
            }
          }
        },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              profileImage: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profileImage: true
                }
              }
            }
          }
        }
      });

      // Enregistrer l'activité analytique (désactivé car service supprimé)
      // await analyticsService.recordActivity({
      //   userId,
      //   type: 'race_created',
      //   metadata: {
      //     gameId,
      //     categoryId,
      //     maxParticipants
      //   }
      // });

      res.status(201).json({
        success: true,
        data: race,
        message: 'Race créée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la création de la race:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Rejoindre une race
   */
  async joinRace(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { id: raceId } = req.params;
      const { password } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Récupérer la race
      const race = await prisma.race.findUnique({
        where: { id: raceId },
        include: {
          participants: true
        }
      });

      if (!race) {
        return res.status(404).json({
          success: false,
          message: 'Race non trouvée'
        });
      }

      // Vérifier le mot de passe si nécessaire
      if (race.password && race.password !== password) {
        return res.status(403).json({
          success: false,
          message: 'Mot de passe incorrect'
        });
      }

      // Vérifier si l'utilisateur participe déjà
      const existingParticipant = race.participants.find(p => p.userId === userId);
      if (existingParticipant) {
        return res.status(400).json({
          success: false,
          message: 'Vous participez déjà à cette race'
        });
      }

      // Vérifier la limite de participants
      if (race.participants.length >= race.maxParticipants) {
        return res.status(400).json({
          success: false,
          message: 'Race complète'
        });
      }

      // Ajouter le participant
      const participant = await prisma.raceParticipant.create({
        data: {
          raceId,
          userId,
          status: 'inscrit'
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

      // Ajouter un message système
      await prisma.raceMessage.create({
        data: {
          raceId,
          content: `${participant.user.username} a rejoint la race`,
          type: 'systeme'
        }
      });

      res.json({
        success: true,
        data: participant,
        message: 'Vous avez rejoint la race'
      });
    } catch (error) {
      console.error('Erreur lors de la participation à la race:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Quitter une race
   */
  async leaveRace(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { id: raceId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Trouver le participant
      const participant = await prisma.raceParticipant.findUnique({
        where: {
          raceId_userId: {
            raceId,
            userId
          }
        },
        include: {
          user: {
            select: {
              username: true
            }
          },
          race: {
            select: {
              createdById: true,
              participants: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      });

      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Vous ne participez pas à cette race'
        });
      }

      // Si c'est le créateur et le seul participant, supprimer la race
      if (participant.race.createdById === userId && participant.race.participants.length === 1) {
        await prisma.race.delete({
          where: { id: raceId }
        });

        return res.json({
          success: true,
          message: 'Race supprimée car vous étiez le seul participant'
        });
      }

      // Sinon, juste retirer le participant
      await prisma.raceParticipant.delete({
        where: {
          raceId_userId: {
            raceId,
            userId
          }
        }
      });

      // Ajouter un message système
      await prisma.raceMessage.create({
        data: {
          raceId,
          content: `${participant.user.username} a quitté la race`,
          type: 'systeme'
        }
      });

      res.json({
        success: true,
        message: 'Vous avez quitté la race'
      });
    } catch (error) {
      console.error('Erreur lors de la sortie de la race:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Changer le statut d'un participant
   */
  async updateParticipantStatus(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { id: raceId } = req.params;
      const { status, finishTime } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      const validStatuses = ['inscrit', 'pret', 'en-course', 'termine', 'abandon'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
      }

      // Mettre à jour le participant
      const participant = await prisma.raceParticipant.update({
        where: {
          raceId_userId: {
            raceId,
            userId
          }
        },
        data: {
          status,
          ...(status === 'termine' && finishTime ? { finishTime } : {})
        },
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      });

      // Messages système selon le statut
      const statusMessages = {
        'pret': 'est prêt !',
        'inscrit': 'n\'est plus prêt',
        'en-course': 'a commencé la course !',
        'termine': 'a terminé la course !',
        'abandon': 'a abandonné'
      };

      if (statusMessages[status as keyof typeof statusMessages]) {
        await prisma.raceMessage.create({
          data: {
            raceId,
            content: `${participant.user.username} ${statusMessages[status as keyof typeof statusMessages]}`,
            type: 'systeme'
          }
        });
      }

      // Vérifier si la race peut démarrer ou se terminer
      const race = await prisma.race.findUnique({
        where: { id: raceId },
        include: {
          participants: true
        }
      });

      if (race) {
        let newRaceStatus = race.status;
        const allReady = race.participants.every(p => p.status === 'pret');
        const anyInProgress = race.participants.some(p => p.status === 'en-course');
        
        if (allReady && race.participants.length >= 2 && race.status === 'en-attente') {
          newRaceStatus = 'prete';
        } else if (anyInProgress && race.status !== 'en-cours') {
          newRaceStatus = 'en-cours';
          await prisma.race.update({
            where: { id: raceId },
            data: { 
              status: newRaceStatus,
              startTime: new Date()
            }
          });
        }
      }

      res.json({
        success: true,
        data: participant,
        message: 'Statut mis à jour'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Envoyer un message dans le chat d'une race
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { id: raceId } = req.params;
      const { content } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Message requis'
        });
      }

      // Vérifier que l'utilisateur participe à la race
      const participant = await prisma.raceParticipant.findUnique({
        where: {
          raceId_userId: {
            raceId,
            userId
          }
        }
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: 'Vous devez participer à la race pour envoyer des messages'
        });
      }

      const message = await prisma.raceMessage.create({
        data: {
          raceId,
          userId,
          content: content.trim(),
          type: 'chat'
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

      res.json({
        success: true,
        data: message,
        message: 'Message envoyé'
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Supprimer une race (créateur seulement)
   */
  async deleteRace(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Vérifier que l'utilisateur est le créateur
      const race = await prisma.race.findUnique({
        where: { id }
      });

      if (!race) {
        return res.status(404).json({
          success: false,
          message: 'Race non trouvée'
        });
      }

      if (race.createdById !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Seul le créateur peut supprimer la race'
        });
      }

      await prisma.race.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Race supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la race:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

export default new RaceController(); 