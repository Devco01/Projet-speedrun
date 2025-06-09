import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from './_app';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { gererConnexion } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Appel à l'API backend pour la connexion
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
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
        </div>

        {/* Formulaire */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <span className="mr-2">🔍</span>
              <span className="text-white">Continuer avec Google</span>
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