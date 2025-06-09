import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from './_app';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const router = useRouter();
  const { gererConnexion } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'adresse email est requise';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmez votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Appel à l'API backend pour l'inscription
      const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Stocker le token d'authentification
      if (data.data.token) {
        localStorage.setItem('authToken', data.data.token);
      }
      
      // Connecter automatiquement l'utilisateur
      gererConnexion(formData.username, formData.email);
      
      // Rediriger vers le profil avec message de bienvenue
      router.push('/profile?welcome=true');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
          <p className="text-slate-400">
            Rejoignez la communauté speedrun !
          </p>
        </div>

        {/* Formulaire */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span className="text-red-300 text-sm">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Nom d'utilisateur */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.username 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-slate-700 focus:ring-violet-500 focus:border-transparent'
                }`}
                placeholder="votre pseudo"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-slate-700 focus:ring-violet-500 focus:border-transparent'
                }`}
                placeholder="votre email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-800 border rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-700 focus:ring-violet-500 focus:border-transparent'
                  }`}
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-800 border rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-700 focus:ring-violet-500 focus:border-transparent'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="text-lg">{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</span>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Conditions d'utilisation */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className={`w-4 h-4 mt-1 text-violet-600 bg-slate-800 border rounded focus:ring-violet-500 ${
                    errors.acceptTerms ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                <span className="ml-2 text-sm text-slate-300">
                  J'accepte les{' '}
                  <Link href="/support" className="text-violet-400 hover:text-violet-300 transition-colors">
                    conditions d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/support" className="text-violet-400 hover:text-violet-300 transition-colors">
                    politique de confidentialité
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-400">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Bouton d'inscription */}
            <button 
              type="submit"
              disabled={isLoading}
              className="group w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 border border-green-500/20 disabled:transform-none disabled:shadow-none"
            >
              <span>
                {isLoading ? 'Création en cours...' : 'Créer mon compte'}
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

          {/* Inscription sociale */}
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
              <span className="text-white group-hover:text-gray-100 transition-colors">S'inscrire avec Google</span>
            </a>
          </div>

          {/* Lien vers connexion */}
          <div className="text-center mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-400">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 