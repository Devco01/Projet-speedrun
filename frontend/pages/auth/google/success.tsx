import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../_app';

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const { gererConnexion } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Authentification Google en cours...');

  useEffect(() => {
    // Éviter le double traitement
    if (isProcessing) return;

    // Attendre que router soit prêt
    if (!router.isReady) return;

    // Récupérer le token et les données utilisateur depuis l'URL
    const { token, user, note } = router.query;

    console.log('🔐 Page de succès Google - Query params:', { token: !!token, user: !!user, note });

    if (token && user && !isProcessing) {
      setIsProcessing(true);
      setProcessingMessage('Connexion en cours...');
      
      try {
        // Décoder les données utilisateur
        const userData = JSON.parse(decodeURIComponent(user as string));
        console.log('👤 Données utilisateur décodées:', userData.username, userData.email);
        
        // Stocker le token
        localStorage.setItem('authToken', token as string);
        
        // Connecter l'utilisateur dans le contexte global
        gererConnexion(userData.username, userData.email);
        
        // Message personnalisé selon le contexte
        const welcomeMessage = note === 'already_processed' ? 'reconnected' : 'connected';
        
        // Rediriger vers le profil
        setTimeout(() => {
          router.replace(`/profile?welcome=true&source=google&status=${welcomeMessage}`);
        }, 1000);
        
      } catch (error) {
        console.error('❌ Erreur lors du traitement de l\'authentification Google:', error);
        setProcessingMessage('Erreur lors de la connexion...');
        setTimeout(() => {
          router.replace('/login?error=google_auth_error');
        }, 2000);
      }
    } else if (!token || !user) {
      // Rediriger vers la page de connexion si pas de données (seulement si les query params sont chargés)
      if (router.isReady && !isProcessing) {
        console.log('❌ Données d\'authentification manquantes');
        setIsProcessing(true);
        setProcessingMessage('Données manquantes, redirection...');
        setTimeout(() => {
          router.replace('/login?error=missing_auth_data');
        }, 2000);
      }
    }
  }, [router.isReady, router.query]); // Dépendance sur toute la query pour capturer tous les changements

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl">
        <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold text-white mb-3">Connexion Google</h2>
        <p className="text-slate-400 text-lg">{processingMessage}</p>
        {isProcessing && (
          <div className="mt-4 text-sm text-slate-500">
            Vous allez être redirigé automatiquement
          </div>
        )}
      </div>
    </div>
  );
} 