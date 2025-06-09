const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AvatarData {
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
}

export interface CustomAvatar {
  userId: string;
  avatarData: AvatarData;
  presets?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AvatarPreset {
  id: string;
  name: string;
  description: string;
  avatarData: AvatarData;
}

class AvatarService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Récupère l'avatar actuel de l'utilisateur
   */
  async getUserAvatar(): Promise<CustomAvatar | null> {
    try {
      const response = await fetch(`${API_BASE}/avatars/me`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'avatar');
      }

      const data = await response.json();
      return data.avatar;
    } catch (error) {
      console.error('Erreur récupération avatar:', error);
      return null;
    }
  }

  /**
   * Sauvegarde l'avatar de l'utilisateur
   */
  async saveUserAvatar(avatarData: AvatarData): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/avatars/me`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ avatarData })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de l\'avatar');
      }

      return true;
    } catch (error) {
      console.error('Erreur sauvegarde avatar:', error);
      return false;
    }
  }

  /**
   * Supprime l'avatar (remet par défaut)
   */
  async resetAvatar(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/avatars/me`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la réinitialisation de l\'avatar');
      }

      return true;
    } catch (error) {
      console.error('Erreur réinitialisation avatar:', error);
      return false;
    }
  }

  /**
   * Récupère les presets d'avatars disponibles
   */
  async getAvatarPresets(): Promise<AvatarPreset[]> {
    try {
      const response = await fetch(`${API_BASE}/avatars/presets`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des presets');
      }

      const data = await response.json();
      return data.presets || [];
    } catch (error) {
      console.error('Erreur récupération presets:', error);
      return [];
    }
  }

  /**
   * Ajoute un preset aux favoris
   */
  async addPresetToFavorites(presetId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/avatars/presets/${presetId}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur ajout preset favoris:', error);
      return false;
    }
  }

  /**
   * Retire un preset des favoris
   */
  async removePresetFromFavorites(presetId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/avatars/presets/${presetId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur suppression preset favoris:', error);
      return false;
    }
  }

  /**
   * Génère un avatar SVG à partir des données
   */
  generateAvatarSVG(avatarData: AvatarData): string {
    const { head, eyes, hair, clothing, background } = avatarData;
    
    return `
      <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="128" height="128" fill="${background?.color || '#E8F4FD'}" rx="64"/>
        
        <!-- Head -->
        <circle cx="64" cy="64" r="40" fill="${head.color}" stroke="#333" stroke-width="2"/>
        
        <!-- Hair -->
        <path d="M 30 40 Q 64 20 98 40 Q 98 30 64 25 Q 30 30 30 40" fill="${hair.color}"/>
        
        <!-- Eyes -->
        <circle cx="50" cy="55" r="4" fill="${eyes.color}"/>
        <circle cx="78" cy="55" r="4" fill="${eyes.color}"/>
        
        <!-- Mouth -->
        <path d="M 55 75 Q 64 80 73 75" stroke="#333" stroke-width="2" fill="none"/>
        
        <!-- Clothing -->
        <rect x="40" y="90" width="48" height="38" fill="${clothing.color}" rx="5"/>
      </svg>
    `;
  }

  /**
   * Convertit un avatar SVG en data URL
   */
  avatarToDataURL(avatarData: AvatarData): string {
    const svg = this.generateAvatarSVG(avatarData);
    const base64 = btoa(svg);
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Upload d'image traditionnel (pour compatibilité)
   */
  async uploadImageAvatar(file: File): Promise<string | null> {
    try {
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 2MB');
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.onerror = () => reject(new Error('Erreur lecture fichier'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Erreur upload image:', error);
      return null;
    }
  }
}

export default new AvatarService(); 