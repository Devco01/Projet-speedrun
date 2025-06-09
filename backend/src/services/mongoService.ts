import mongoose from 'mongoose';

// Interface pour l'avatar personnalisable
interface CustomAvatar {
  userId: string;
  avatarData: {
    head: {
      shape: string;
      color: string;
    };
    eyes: {
      type: string;
      color: string;
    };
    hair: {
      style: string;
      color: string;
    };
    accessories?: {
      type: string;
      color?: string;
    }[];
    clothing: {
      style: string;
      color: string;
    };
    background?: {
      type: string;
      color: string;
    };
  };
  presets?: string[]; // Avatars pré-configurés favoris
  createdAt: Date;
  updatedAt: Date;
}

// Schéma MongoDB pour les avatars
const avatarSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  avatarData: {
    head: {
      shape: { type: String, default: 'round' },
      color: { type: String, default: '#F5C6A0' }
    },
    eyes: {
      type: { type: String, default: 'normal' },
      color: { type: String, default: '#4A90E2' }
    },
    hair: {
      style: { type: String, default: 'short' },
      color: { type: String, default: '#8B4513' }
    },
    accessories: [{
      type: { type: String },
      color: { type: String }
    }],
    clothing: {
      style: { type: String, default: 'casual' },
      color: { type: String, default: '#FF6B6B' }
    },
    background: {
      type: { type: String, default: 'solid' },
      color: { type: String, default: '#E8F4FD' }
    }
  },
  presets: [String], // IDs des avatars pré-configurés favoris
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Modèle MongoDB
const Avatar = mongoose.model<CustomAvatar>('Avatar', avatarSchema);

class MongoService {
  private isConnected: boolean = false;

  /**
   * Connexion à MongoDB
   */
  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        console.log('📦 MongoDB déjà connecté');
        return;
      }

      const mongoUrl = process.env.MONGODB_URL;
      if (!mongoUrl) {
        console.log('⚠️ MONGODB_URL non configuré - service désactivé');
        return;
      }

      await mongoose.connect(mongoUrl);
      this.isConnected = true;
      console.log('✅ MongoDB connecté avec succès');

      // Gestionnaire de déconnexion
      mongoose.connection.on('disconnected', () => {
        this.isConnected = false;
        console.log('📦 MongoDB déconnecté');
      });

    } catch (error) {
      console.error('❌ Erreur connexion MongoDB:', error);
      throw error;
    }
  }

  /**
   * Récupère l'avatar d'un utilisateur
   */
  async getUserAvatar(userId: string): Promise<CustomAvatar | null> {
    try {
      if (!this.isConnected) {
        console.log('📦 MongoDB non connecté - retour avatar par défaut');
        return this.getDefaultAvatar(userId);
      }

      const avatar = await Avatar.findOne({ userId });
      return avatar || this.getDefaultAvatar(userId);
    } catch (error) {
      console.error('❌ Erreur récupération avatar:', error);
      return this.getDefaultAvatar(userId);
    }
  }

  /**
   * Sauvegarde l'avatar d'un utilisateur
   */
  async saveUserAvatar(userId: string, avatarData: CustomAvatar['avatarData']): Promise<CustomAvatar | null> {
    try {
      if (!this.isConnected) {
        console.log('📦 MongoDB non connecté - avatar non sauvegardé');
        return null;
      }

      const updatedAvatar = await Avatar.findOneAndUpdate(
        { userId },
        { 
          avatarData,
          updatedAt: new Date()
        },
        { 
          upsert: true, // Créer si n'existe pas
          new: true // Retourner le document mis à jour
        }
      );

      console.log(`✅ Avatar sauvegardé pour l'utilisateur ${userId}`);
      return updatedAvatar;
    } catch (error) {
      console.error('❌ Erreur sauvegarde avatar:', error);
      return null;
    }
  }

  /**
   * Supprime l'avatar d'un utilisateur
   */
  async deleteUserAvatar(userId: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        console.log('📦 MongoDB non connecté');
        return false;
      }

      await Avatar.deleteOne({ userId });
      console.log(`🗑️ Avatar supprimé pour l'utilisateur ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression avatar:', error);
      return false;
    }
  }

  /**
   * Ajoute un preset favori à un utilisateur
   */
  async addUserPreset(userId: string, presetId: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false;

      await Avatar.findOneAndUpdate(
        { userId },
        { 
          $addToSet: { presets: presetId }, // $addToSet évite les doublons
          updatedAt: new Date()
        },
        { upsert: true }
      );

      console.log(`⭐ Preset ${presetId} ajouté aux favoris de ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur ajout preset:', error);
      return false;
    }
  }

  /**
   * Retire un preset favori
   */
  async removeUserPreset(userId: string, presetId: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false;

      await Avatar.findOneAndUpdate(
        { userId },
        { 
          $pull: { presets: presetId },
          updatedAt: new Date()
        }
      );

      console.log(`🗑️ Preset ${presetId} retiré des favoris de ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression preset:', error);
      return false;
    }
  }

  /**
   * Récupère les statistiques des avatars
   */
  async getAvatarStats(): Promise<any> {
    try {
      if (!this.isConnected) {
        return {
          totalUsers: 0,
          customAvatars: 0,
          mostUsedColors: [],
          mostUsedStyles: []
        };
      }

      const totalUsers = await Avatar.countDocuments();
      
      // Statistiques des couleurs de cheveux les plus populaires
      const hairColorStats = await Avatar.aggregate([
        { $group: { _id: '$avatarData.hair.color', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Statistiques des styles de cheveux les plus populaires
      const hairStyleStats = await Avatar.aggregate([
        { $group: { _id: '$avatarData.hair.style', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      return {
        totalUsers,
        customAvatars: totalUsers,
        mostUsedHairColors: hairColorStats,
        mostUsedHairStyles: hairStyleStats
      };
    } catch (error) {
      console.error('❌ Erreur stats avatars:', error);
      return {
        totalUsers: 0,
        customAvatars: 0,
        mostUsedColors: [],
        mostUsedStyles: []
      };
    }
  }

  /**
   * Avatar par défaut
   */
  private getDefaultAvatar(userId: string): CustomAvatar {
    return {
      userId,
      avatarData: {
        head: {
          shape: 'round',
          color: '#F5C6A0'
        },
        eyes: {
          type: 'normal',
          color: '#4A90E2'
        },
        hair: {
          style: 'short',
          color: '#8B4513'
        },
        accessories: [],
        clothing: {
          style: 'casual',
          color: '#FF6B6B'
        },
        background: {
          type: 'solid',
          color: '#E8F4FD'
        }
      },
      presets: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Ferme la connexion MongoDB
   */
  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('📦 MongoDB déconnecté proprement');
      }
    } catch (error) {
      console.error('❌ Erreur déconnexion MongoDB:', error);
    }
  }

  /**
   * Vérifie l'état de la connexion
   */
  isMongoConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export default new MongoService(); 