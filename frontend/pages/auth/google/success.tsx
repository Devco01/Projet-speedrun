import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../_app';

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const { gererConnexion } = useAuth();

  useEffect(() => {
    // Récupérer le token et les données utilisateur depuis l'URL
    const { token, user } = router.query;

    if (token && user) {
      try {
        // Décoder les données utilisateur
        const userData = JSON.parse(decodeURIComponent(user as string));
        
        // Stocker le token
        localStorage.setItem('authToken', token as string);
        
        // Connecter l'utilisateur dans le contexte global
        gererConnexion(userData.username, userData.email);
        
        // Rediriger vers le profil
        router.push('/profile?welcome=true&source=google');
      } catch (error) {
        console.error('Erreur lors du traitement de l\'authentification Google:', error);
        router.push('/login?error=google_auth_error');
      }
    } else {
      // Rediriger vers la page de connexion si pas de données
      router.push('/login?error=missing_auth_data');
    }
  }, [router.query, gererConnexion, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Authentification Google en cours...</h2>
        <p className="text-slate-400">Vous allez être redirigé automatiquement</p>
      </div>
    </div>
  );
} 