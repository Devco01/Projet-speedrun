import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulation d'authentification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (email && password) {
      // Redirection après connexion réussie
      alert('Connexion réussie ! (Démo)');
    } else {
      setError('Veuillez remplir tous les champs');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-6">
            <span className="text-2xl">🔐</span>
          </div>
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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="votre@email.com"
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
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 ${
                isLoading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
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
            <button className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
              <span className="mr-2">📺</span>
              <span className="text-white">Continuer avec Twitch</span>
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
              <span className="mr-2">💬</span>
              <span className="text-white">Continuer avec Discord</span>
            </button>
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

        {/* Info démo */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-blue-400 mr-2">ℹ️</span>
            <span className="text-blue-300 font-medium">Mode Démo</span>
          </div>
          <p className="text-blue-200 text-sm">
            Cette page de connexion est fonctionnelle pour la démonstration du projet TP DWWM.
          </p>
        </div>
      </div>
    </div>
  );
} 