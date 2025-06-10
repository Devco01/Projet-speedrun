import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from './_app';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleAuthStatus, setGoogleAuthStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const { gererConnexion } = useAuth();
  const router = useRouter();

  // Gestion de l'authentification Google automatique
  useEffect(() => {
    const handleGoogleAuth = async () => {
      const { google_session } = router.query;
      
      if (!google_session || typeof google_session !== 'string' || googleAuthStatus !== 'idle') {
        return;
      }

      setGoogleAuthStatus('processing');
      console.log('🔐 Récupération des données Google depuis session:', google_session);

      try {
        const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/google/session/${google_session}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Erreur HTTP: ${response.status}`);
        }
        
        const { data } = await response.json();
        
        if (!data || !data.token || !data.user) {
          throw new Error('Données d\'authentification invalides');
        }

        // Stocker les données d'authentification
        localStorage.setItem('authToken', data.token);
        
        // Connecter l'utilisateur
        gererConnexion(data.user.username, data.user.email);
        
        setGoogleAuthStatus('success');
        
        // Rediriger vers la page d'accueil
        setTimeout(() => {
          router.push('/');
        }, 1000);
        
      } catch (error) {
        console.error('❌ Erreur authentification Google:', error);
        setGoogleAuthStatus('error');
        setError(error instanceof Error ? error.message : 'Erreur d\'authentification Google');
        
        // Nettoyer l'URL après quelques secondes
        setTimeout(() => {
          router.replace('/login', undefined, { shallow: true });
        }, 3000);
      }
    };

    if (router.isReady) {
      handleGoogleAuth();
    }
  }, [router.isReady, router.query, googleAuthStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Appel à l'API backend pour la connexion
      const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier, // email ou nom d'utilisateur
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      // Stocker le token d'authentification
      if (data.data.token) {
        localStorage.setItem('authToken', data.data.token);
      }

      // Se connecter via le contexte global
      const user = data.data.user;
      gererConnexion(user.username, user.email);
      
      // Redirection vers la page d'événements
      router.push('/events');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la connexion';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
          <p className="text-slate-400">
            Accédez à votre compte speedrunner
          </p>
          
          {/* Statut authentification Google */}
          {googleAuthStatus === 'processing' && (
            <div className="mt-4 p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-3"></div>
                <span className="text-blue-300">Connexion Google en cours...</span>
              </div>
            </div>
          )}
          
          {googleAuthStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-900/50 border border-green-700 rounded-lg">
              <div className="flex items-center justify-center">
                <span className="text-green-300 mr-2">✅</span>
                <span className="text-green-300">Connexion réussie ! Redirection...</span>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6"
                style={{ opacity: googleAuthStatus === 'processing' ? 0.5 : 1, 
                        pointerEvents: googleAuthStatus === 'processing' ? 'none' : 'auto' }}>
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Email ou nom d'utilisateur */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-slate-300 mb-2">
                Email ou nom d'utilisateur
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="votre email ou votre pseudo"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="text-lg">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-violet-600 bg-slate-800 border-slate-600 rounded focus:ring-violet-500"
                />
                <span className="ml-2 text-sm text-slate-300">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Bouton de connexion */}
            <button 
              type="submit"
              disabled={isLoading}
              className="group w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 border border-violet-500/20 disabled:transform-none disabled:shadow-none"
            >
              <span>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </span>
              {!isLoading && (
                <span className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">ou</span>
            </div>
          </div>

          {/* Connexion sociale */}
          <div className="space-y-3">
            <a 
              href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/google`}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <svg className="mr-3 w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-white group-hover:text-gray-100 transition-colors">Continuer avec Google</span>
            </a>
          </div>

          {/* Lien vers inscription */}
          <div className="text-center mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-400">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 