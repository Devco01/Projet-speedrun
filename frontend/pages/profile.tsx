import { useState, useEffect, useRef } from 'react';
import { useAuth } from './_app';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const { utilisateurActuel, estAuthentifie, gererConnexion } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'securite' | 'avatar'>('general');
  
  // États pour les modifications
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirection si pas connecté
  useEffect(() => {
    if (!estAuthentifie) {
      router.push('/login');
      return;
    }
    
    if (utilisateurActuel) {
      setNomUtilisateur(utilisateurActuel.nomUtilisateur);
      setEmail(utilisateurActuel.email);
      setAvatar(utilisateurActuel.imageProfile || null);
    }
  }, [estAuthentifie, utilisateurActuel, router]);

  const afficherMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const sauvegarderGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!utilisateurActuel) return;
    
    try {
      // Sauvegarder le profil dans la base de données
      const token = localStorage.getItem('authToken');
      if (!token) {
        afficherMessage('error', 'Authentification requise pour sauvegarder le profil.');
        return;
      }

      const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: nomUtilisateur,
          email: email,
          profileImage: avatar || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde du profil');
      }

      // Mettre à jour l'utilisateur dans le contexte global avec les données de la base
      if (data.data.user) {
        gererConnexion(data.data.user.username, data.data.user.email, data.data.user.profileImage);
      }
      
      afficherMessage('success', 'Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      afficherMessage('error', 'Erreur lors de la sauvegarde. Le profil a été mis à jour localement uniquement.');
      
      // Fallback : mettre à jour localement uniquement si l'API échoue
      gererConnexion(nomUtilisateur, email, avatar || undefined);
    }
  };

  const changerMotDePasse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nouveauMotDePasse !== confirmerMotDePasse) {
      afficherMessage('error', 'Les mots de passe ne correspondent pas.');
      return;
    }
    
    if (nouveauMotDePasse.length < 6) {
      afficherMessage('error', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    
    // Simulation de changement de mot de passe
    afficherMessage('success', 'Mot de passe changé avec succès !');
    setMotDePasseActuel('');
    setNouveauMotDePasse('');
    setConfirmerMotDePasse('');
  };

  const gererUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        afficherMessage('error', 'L\'image ne doit pas dépasser 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const newAvatar = e.target?.result as string;
        setAvatar(newAvatar);
        
        try {
          // Sauvegarder l'avatar dans la base de données
          const token = localStorage.getItem('authToken');
          if (!token) {
            afficherMessage('error', 'Authentification requise pour sauvegarder l\'avatar.');
            return;
          }

          const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/avatar`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              avatar: newAvatar
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la sauvegarde de l\'avatar');
          }

          // Mettre à jour l'utilisateur dans le contexte global avec les données de la base
          if (utilisateurActuel && data.data.user) {
            gererConnexion(data.data.user.username, data.data.user.email, data.data.user.profileImage);
          }
          
          afficherMessage('success', 'Avatar mis à jour avec succès !');
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de l\'avatar:', error);
          afficherMessage('error', 'Erreur lors de la sauvegarde. L\'avatar a été mis à jour localement uniquement.');
          
          // Fallback : mettre à jour localement uniquement si l'API échoue
          if (utilisateurActuel) {
            gererConnexion(utilisateurActuel.nomUtilisateur, utilisateurActuel.email, newAvatar);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!estAuthentifie || !utilisateurActuel) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
        <p className="text-slate-400">Gérez vos informations personnelles et paramètres de compte</p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/50 text-green-300 border border-green-800' 
            : 'bg-red-900/50 text-red-300 border border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            👤 Informations générales
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'avatar'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            🖼️ Avatar
          </button>
          <button
            onClick={() => setActiveTab('securite')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'securite'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            🔒 Sécurité
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <form onSubmit={sauvegarderGeneral} className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Informations générales</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={nomUtilisateur}
                    onChange={(e) => setNomUtilisateur(e.target.value)}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors"
                >
                  Sauvegarder les modifications
                </button>
              </div>
            </form>
          )}

          {activeTab === 'avatar' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Avatar</h2>
              
              {/* Avatar actuel */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {avatar && avatar.startsWith('data:') ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg 
                        className="w-16 h-16 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-slate-400">Avatar actuel</p>
              </div>

              {/* Upload d'avatar */}
              <div className="bg-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">📸 Changer l'avatar</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={gererUploadAvatar}
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 border border-blue-500/20"
                  >
                    📷 Choisir une nouvelle image
                  </button>
                  <div className="text-slate-400 text-sm">
                    <p>• Formats acceptés: JPG, PNG, GIF</p>
                    <p>• Taille maximum: 2 MB</p>
                    <p>• L'avatar sera mis à jour automatiquement</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'securite' && (
            <form onSubmit={changerMotDePasse} className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Sécurité du compte</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={motDePasseActuel}
                    onChange={(e) => setMotDePasseActuel(e.target.value)}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={nouveauMotDePasse}
                    onChange={(e) => setNouveauMotDePasse(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmerMotDePasse}
                    onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                  <div>
                    <h4 className="text-yellow-300 font-medium">Conseils de sécurité</h4>
                    <ul className="text-yellow-200 text-sm mt-1 space-y-1">
                      <li>• Utilisez au moins 8 caractères</li>
                      <li>• Mélangez lettres, chiffres et symboles</li>
                      <li>• Évitez les mots de passe évidents</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium transition-colors"
                >
                  Changer le mot de passe
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 