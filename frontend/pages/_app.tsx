import type { AppProps } from 'next/app'
import Link from 'next/link'
import { useState, useEffect, createContext, useContext } from 'react'
import '../styles/globals.css'

// Types pour l'authentification globale
interface Utilisateur {
  id: string;
  nomUtilisateur: string;
  email: string;
  imageProfile?: string;
}

interface AuthContextType {
  utilisateurActuel: Utilisateur | null;
  estAuthentifie: boolean;
  gererConnexion: (nomUtilisateur: string, email: string, avatar?: string) => void;
  gererDeconnexion: () => void;
}

// Contexte d'authentification global
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default function App({ Component, pageProps }: AppProps) {
  const [utilisateurActuel, setUtilisateurActuel] = useState<Utilisateur | null>(null);
  const [estAuthentifie, setEstAuthentifie] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const utilisateurSauvegarde = localStorage.getItem('utilisateurSpeedrun');
    const token = localStorage.getItem('authToken');
    
    if (utilisateurSauvegarde && token) {
      const utilisateur = JSON.parse(utilisateurSauvegarde);
      setUtilisateurActuel(utilisateur);
      setEstAuthentifie(true);
      
      // Vérifier le profil avec l'API pour synchroniser l'avatar
      const verifierProfil = async () => {
        try {
          const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              // Mettre à jour avec les données fraîches de l'API (notamment l'avatar)
              const utilisateurMisAJour: Utilisateur = {
                id: data.data.id,
                nomUtilisateur: data.data.username,
                email: data.data.email,
                imageProfile: data.data.profileImage
              };
              
              console.log('🔄 Synchronisation avatar depuis l\'API:', {
                hasAvatar: !!data.data.profileImage,
                avatarChanged: utilisateur.imageProfile !== data.data.profileImage
              });
              
              setUtilisateurActuel(utilisateurMisAJour);
              localStorage.setItem('utilisateurSpeedrun', JSON.stringify(utilisateurMisAJour));
            }
          }
        } catch (error) {
          console.log('⚠️ Impossible de synchroniser le profil (mode offline):', error);
          // En cas d'erreur API, on garde les données locales
        }
      };
      
      verifierProfil();
    }
  }, []);

  const gererConnexion = (nomUtilisateur: string, email: string, avatar?: string) => {
    // Utiliser l'avatar fourni, ou préserver l'avatar existant, ou utiliser undefined
    const imageProfile = avatar !== undefined ? avatar : utilisateurActuel?.imageProfile;
    
    const nouvelUtilisateur: Utilisateur = {
      id: utilisateurActuel?.id || Date.now().toString(),
      nomUtilisateur,
      email,
      imageProfile
    };
    
    console.log('💾 Sauvegarde utilisateur avec avatar:', {
      nomUtilisateur,
      email,
      hasAvatar: !!imageProfile,
      avatarStart: imageProfile?.substring(0, 50) + '...'
    });
    
    setUtilisateurActuel(nouvelUtilisateur);
    setEstAuthentifie(true);
    localStorage.setItem('utilisateurSpeedrun', JSON.stringify(nouvelUtilisateur));
  };

  const gererDeconnexion = () => {
    setUtilisateurActuel(null);
    setEstAuthentifie(false);
    localStorage.removeItem('utilisateurSpeedrun');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const authValue: AuthContextType = {
    utilisateurActuel,
    estAuthentifie,
    gererConnexion,
    gererDeconnexion
  };

  return (
    <AuthContext.Provider value={authValue}>
      <div className="min-h-screen bg-slate-900">
        {/* Header moderne avec menu burger */}
        <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity" onClick={closeMobileMenu}>
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    SpeedrunSchedule
                  </h1>
                  <p className="text-sm text-slate-400">Explorez les temps et records</p>
                </div>
                <div className="block sm:hidden">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    SpeedrunSchedule
                  </h1>
                </div>
              </Link>
              
              {/* Navigation desktop - cachée sur mobile */}
              <nav className="hidden md:flex items-center space-x-10">
                <Link href="/" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                  Accueil
                </Link>
                <Link href="/leaderboards" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                  Classements
                </Link>
                <Link href="/activity" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                  Activité
                </Link>
                <Link href="/events" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                  Événements
                </Link>
                <Link href="/support" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                  Support
                </Link>
                
                {/* Zone d'authentification desktop */}
                <div className="flex items-center space-x-4 ml-8">
                  {estAuthentifie && utilisateurActuel ? (
                    <>
                      {/* Bouton Profil */}
                      <Link 
                        href="/profile"
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                      >
                        Profil
                      </Link>
                      
                      {/* Informations utilisateur */}
                      <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-3 py-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden">
                          {utilisateurActuel.imageProfile && utilisateurActuel.imageProfile.startsWith('data:') ? (
                            <img 
                              src={utilisateurActuel.imageProfile} 
                              alt="Avatar" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                            </svg>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium text-sm">{utilisateurActuel.nomUtilisateur}</div>
                          <div className="text-slate-400 text-xs">En ligne</div>
                        </div>
                      </div>
                      
                      {/* Bouton déconnexion */}
                      <button
                        onClick={gererDeconnexion}
                        className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 border border-red-500/20"
                      >
                        <span>Déconnexion</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 border border-violet-500/20">
                        <span>Connexion</span>
                      </Link>
                      <Link href="/register" className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 border border-green-500/20">
                        <span>S'inscrire</span>
                      </Link>
                    </>
                  )}
                </div>
              </nav>

              {/* Menu burger - visible sur mobile uniquement */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-200"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Menu principal"
                >
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {/* Icône hamburger */}
                  <svg 
                    className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-transform duration-200`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {/* Icône X */}
                  <svg 
                    className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-transform duration-200`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Menu mobile - slide down propre */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen 
              ? 'max-h-[500px] opacity-100 visible' 
              : 'max-h-0 opacity-0 invisible'
          } overflow-hidden`}>
            <div className="px-4 pt-3 pb-6 space-y-1 bg-slate-800/95 backdrop-blur-md border-t border-slate-700 shadow-lg">
              {/* Navigation mobile */}
              <Link 
                href="/" 
                className="text-slate-300 hover:text-white hover:bg-slate-700/80 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                onClick={closeMobileMenu}
              >
                Accueil
              </Link>
              <Link 
                href="/leaderboards" 
                className="text-slate-300 hover:text-white hover:bg-slate-700/80 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                onClick={closeMobileMenu}
              >
                Classements
              </Link>
              <Link 
                href="/activity" 
                className="text-slate-300 hover:text-white hover:bg-slate-700/80 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                onClick={closeMobileMenu}
              >
                Activité
              </Link>
              <Link 
                href="/events" 
                className="text-slate-300 hover:text-white hover:bg-slate-700/80 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                onClick={closeMobileMenu}
              >
                Événements
              </Link>
              <Link 
                href="/support" 
                className="text-slate-300 hover:text-white hover:bg-slate-700/80 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                onClick={closeMobileMenu}
              >
                Support
              </Link>
              
              {/* Authentification mobile */}
              <div className="pt-4 border-t border-slate-600 space-y-3">
                {estAuthentifie && utilisateurActuel ? (
                  <>
                    <Link 
                      href="/profile" 
                      className="bg-slate-700 hover:bg-slate-600 text-white block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 text-center hover:scale-[1.02]"
                      onClick={closeMobileMenu}
                    >
                      Profil
                    </Link>
                    <button
                      onClick={() => {
                        gererDeconnexion();
                        closeMobileMenu();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white block w-full px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="bg-violet-600 hover:bg-violet-700 text-white block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 text-center hover:scale-[1.02]"
                      onClick={closeMobileMenu}
                    >
                      Connexion
                    </Link>
                    <Link 
                      href="/register" 
                      className="bg-green-600 hover:bg-green-700 text-white block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 text-center hover:scale-[1.02]"
                      onClick={closeMobileMenu}
                    >
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto py-8 px-4 fade-in">
          <Component {...pageProps} />
        </main>
        
        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 py-16 mt-20">
          <div className="max-w-7xl mx-auto px-4">
            {/* Contenu principal du footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              
              {/* Logo et description */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">SpeedrunSchedule</h3>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-6"> 
                  Explorez les temps, découvrez les records et plongez dans l'univers du speedrunning !
                </p>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-6 pb-2 border-b border-slate-800">Navigation</h4>
                <div className="space-y-3">
                  <div><Link href="/" className="text-slate-400 hover:text-violet-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    Accueil
                  </Link></div>
                  <div><Link href="/leaderboards" className="text-slate-400 hover:text-violet-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    Classements
                  </Link></div>
                  <div><Link href="/activity" className="text-slate-400 hover:text-violet-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    Activité
                  </Link></div>
                  <div><Link href="/events" className="text-slate-400 hover:text-violet-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    Événements
                  </Link></div>
                </div>
              </div>

              {/* Légal */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-6 pb-2 border-b border-slate-800">Légal</h4>
                <div className="space-y-3">
                  <div><Link href="/legal/privacy" className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    Confidentialité
                  </Link></div>
                  <div><Link href="/legal/terms" className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    CGU
                  </Link></div>
                  <div><Link href="/legal/mentions" className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    Mentions légales
                  </Link></div>
                </div>
              </div>
            </div>
            
            {/* Ligne de séparation */}
            <div className="border-t border-slate-800"></div>
            
            {/* Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <p className="text-slate-400 text-sm">
                  &copy; 2025 <span className="text-white font-medium">SpeedrunSchedule</span>
                </p>
                <span className="hidden md:block w-1 h-1 bg-slate-600 rounded-full"></span>
                <p className="text-slate-500 text-xs">
                  Projet TP DWWM
                </p>
              </div>
              
              <div className="text-slate-500 text-xs">
                Made with ❤️ pour la communauté speedrun
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthContext.Provider>
  )
} 