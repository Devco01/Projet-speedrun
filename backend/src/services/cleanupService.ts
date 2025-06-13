import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CleanupService {
  private lastCleanup: Date | null = null;
  private cleanupInterval = 15 * 60 * 1000; // 15 minutes en millisecondes

  /**
   * Démarre le service de nettoyage (compatible Vercel)
   */
  start(): void {
    console.log('🧹 Service de nettoyage automatique démarré (déclenché par requêtes)');
    
    // Exécution immédiate au démarrage
    this.cleanupFinishedRaces();
  }

  /**
   * Vérifie si un nettoyage est nécessaire et l'exécute
   * (appelé quand une course se termine ou manuellement depuis l'admin)
   */
  async checkAndCleanup(): Promise<void> {
    const now = new Date();
    
    // Vérifier s'il y a des courses à nettoyer avant de procéder
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const racesToCleanCount = await prisma.race.count({
      where: {
        status: 'terminee',
        updatedAt: {
          lte: oneHourAgo
        }
      }
    });

    if (racesToCleanCount === 0) {
      console.log('🧹 Aucune course éligible pour le nettoyage');
      return;
    }

    // Si aucun nettoyage précédent ou si 15+ minutes se sont écoulées
    if (!this.lastCleanup || (now.getTime() - this.lastCleanup.getTime()) >= this.cleanupInterval) {
      await this.cleanupFinishedRaces();
      this.lastCleanup = now;
    } else {
      console.log('🧹 Nettoyage déjà effectué récemment, attente...');
    }
  }

  /**
   * Nettoie les courses terminées depuis plus d'1 heure
   */
  async cleanupFinishedRaces(): Promise<void> {
    try {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      // Trouver les courses terminées depuis plus d'1 heure
      const racesToDelete = await prisma.race.findMany({
        where: {
          status: 'terminee',
          updatedAt: {
            lte: oneHourAgo
          }
        },
        include: {
          createdBy: {
            select: {
              username: true
            }
          }
        }
      });

      if (racesToDelete.length === 0) {
        console.log('🧹 Aucune course à nettoyer');
        return;
      }

      // Supprimer les courses une par une pour le logging
      for (const race of racesToDelete) {
        try {
          await prisma.race.delete({
            where: { id: race.id }
          });

          // Log du nettoyage automatique
          console.log(`🧹 Nettoyage automatique: Course "${race.gameName}" supprimée`);

          console.log(`🧹 Course auto-supprimée: "${race.gameName}" (créée par ${race.createdBy.username})`);
        } catch (deleteError) {
          console.error(`❌ Erreur suppression course ${race.id}:`, deleteError);
        }
      }

      console.log(`🧹 Nettoyage terminé: ${racesToDelete.length} course(s) supprimée(s)`);
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage automatique:', error);
    }
  }

  /**
   * Nettoie manuellement les courses terminées (pour test)
   */
  async forceCleanup(): Promise<{ deletedCount: number; deletedRaces: string[] }> {
    try {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const racesToDelete = await prisma.race.findMany({
        where: {
          status: 'terminee',
          updatedAt: {
            lte: oneHourAgo
          }
        },
        select: {
          id: true,
          gameName: true,
          createdBy: {
            select: {
              username: true
            }
          }
        }
      });

      const deletedRaces: string[] = [];

      for (const race of racesToDelete) {
        await prisma.race.delete({
          where: { id: race.id }
        });
        deletedRaces.push(`${race.gameName} (par ${race.createdBy.username})`);
      }

      return {
        deletedCount: racesToDelete.length,
        deletedRaces
      };
    } catch (error) {
      console.error('❌ Erreur nettoyage forcé:', error);
      return { deletedCount: 0, deletedRaces: [] };
    }
  }

  /**
   * Obtient les statistiques de nettoyage
   */
  async getCleanupStats(): Promise<{
    totalRaces: number;
    finishedRaces: number;
    racesToCleanup: number;
    oldestFinishedRace?: Date;
  }> {
    try {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const [totalRaces, finishedRaces, racesToCleanup, oldestRace] = await Promise.all([
        prisma.race.count(),
        prisma.race.count({ where: { status: 'terminee' } }),
        prisma.race.count({ 
          where: { 
            status: 'terminee',
            updatedAt: { lte: oneHourAgo }
          } 
        }),
        prisma.race.findFirst({
          where: { status: 'terminee' },
          orderBy: { updatedAt: 'asc' },
          select: { updatedAt: true }
        })
      ]);

      return {
        totalRaces,
        finishedRaces,
        racesToCleanup,
        oldestFinishedRace: oldestRace?.updatedAt
      };
    } catch (error) {
      console.error('❌ Erreur stats nettoyage:', error);
      return {
        totalRaces: 0,
        finishedRaces: 0,
        racesToCleanup: 0
      };
    }
  }
}

export default new CleanupService(); 