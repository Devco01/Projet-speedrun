/**
 * Utilitaire pour construire les URLs d'API sans double slash
 */
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
};

/**
 * URLs d'API courantes
 */
export const API_URLS = {
  AUTH: {
    LOGIN: getApiUrl('api/auth/login'),
    REGISTER: getApiUrl('api/auth/register'),
    GOOGLE: getApiUrl('api/auth/google'),
    GOOGLE_CALLBACK: getApiUrl('api/auth/google/callback'),
    PROFILE: getApiUrl('api/auth/profile'),
  },
  // Ajouter d'autres endpoints au besoin
}; 