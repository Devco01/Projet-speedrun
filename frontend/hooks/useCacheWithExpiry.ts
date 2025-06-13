import { useState, useEffect } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  expiryMinutes?: number; // Durée d'expiration en minutes
  refreshOnExpiry?: boolean; // Si true, refresh automatiquement quand expiré
}

function useCacheWithExpiry<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    expiryMinutes = 60, // Par défaut 1 heure
    refreshOnExpiry = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Vérifier si les données en cache sont expirées
  const isExpired = (cacheItem: CacheItem<T>): boolean => {
    return Date.now() > cacheItem.expiresAt;
  };

  // Obtenir les données du cache localStorage
  const getCachedData = (): CacheItem<T> | null => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const cacheItem: CacheItem<T> = JSON.parse(cached);
        return cacheItem;
      }
    } catch (error) {
      console.warn(`Erreur lecture cache ${key}:`, error);
    }
    return null;
  };

  // Sauvegarder les données dans le cache
  const setCachedData = (newData: T): void => {
    try {
      const now = Date.now();
      const cacheItem: CacheItem<T> = {
        data: newData,
        timestamp: now,
        expiresAt: now + (expiryMinutes * 60 * 1000)
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      setLastUpdate(new Date(now));
    } catch (error) {
      console.warn(`Erreur sauvegarde cache ${key}:`, error);
    }
  };

  // Récupérer les données (cache ou API)
  const fetchData = async (forceRefresh = false): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache seulement si on ne force pas le refresh
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData && !isExpired(cachedData)) {
          setData(cachedData.data);
          setLastUpdate(new Date(cachedData.timestamp));
          setLoading(false);
          return;
        }
      }

      // Récupérer depuis l'API
      console.log(`🔄 Récupération fraîche des données pour ${key}...`);
      const freshData = await fetchFunction();
      setData(freshData);
      setCachedData(freshData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error(`Erreur récupération ${key}:`, err);

      // En cas d'erreur, utiliser le cache même expiré si disponible
      const cachedData = getCachedData();
      if (cachedData) {
        console.log(`⚠️ Utilisation du cache expiré pour ${key}`);
        setData(cachedData.data);
        setLastUpdate(new Date(cachedData.timestamp));
      }
    } finally {
      setLoading(false);
    }
  };

  // Forcer un refresh des données
  const refresh = (): Promise<void> => {
    return fetchData(true);
  };

  // Nettoyer le cache
  const clearCache = (): void => {
    try {
      localStorage.removeItem(`cache_${key}`);
      setData(null);
      setLastUpdate(null);
    } catch (error) {
      console.warn(`Erreur nettoyage cache ${key}:`, error);
    }
  };

  // Vérifier automatiquement l'expiration et rafraîchir
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (refreshOnExpiry && data) {
      interval = setInterval(() => {
        const cachedData = getCachedData();
        if (cachedData && isExpired(cachedData)) {
          console.log(`⏰ Cache expiré pour ${key}, rafraîchissement automatique...`);
          fetchData(true);
        }
      }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data, refreshOnExpiry, key]);

  // Charger les données au montage
  useEffect(() => {
    fetchData();
  }, [key]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    clearCache,
    isExpired: lastUpdate ? Date.now() > (lastUpdate.getTime() + (expiryMinutes * 60 * 1000)) : false
  };
}

export default useCacheWithExpiry; 