import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Récupération des données d\'authentification...');

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const { session } = router.query;
        
        if (!session || typeof session !== 'string') {
          throw new Error('Session manquante');
        }

        console.log('🔐 Récupération des données de session sécurisée...');
        
        // Récupérer les données depuis le serveur avec l'ID de session
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/session/${session}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Erreur HTTP: ${response.status}`);
        }
        
        const { data } = await response.json();
        
        if (!data || !data.token || !data.user) {
          throw new Error('Données d\'authentification invalides');
        }

        console.log('✅ Données récupérées, connexion...');
        
        // Stocker le token JWT
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setStatus('success');
        setMessage(`Bienvenue ${data.user.username} ! Redirection...`);
        
        // Rediriger vers la page d'accueil après un court délai
        setTimeout(() => {
          router.push('/');
        }, 1500);
        
      } catch (error) {
        console.error('❌ Erreur d\'authentification Google:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erreur d\'authentification');
        
        // Rediriger vers login après 3 secondes en cas d'erreur
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    if (router.isReady) {
      handleAuthSuccess();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            )}
            {status === 'success' && (
              <div className="text-green-500 text-5xl">✓</div>
            )}
            {status === 'error' && (
              <div className="text-red-500 text-5xl">✗</div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Authentification en cours...'}
            {status === 'success' && 'Connexion réussie !'}
            {status === 'error' && 'Erreur d\'authentification'}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {status === 'error' && (
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 