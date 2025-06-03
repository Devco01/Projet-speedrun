import type { AppProps } from 'next/app'
import Link from 'next/link'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header moderne */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">🚀</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  SpeedRun Platform
                </h1>
                <p className="text-sm text-slate-400">Plateforme de speedrunning</p>
              </div>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                Accueil
              </Link>
              <Link href="/games" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                Jeux
              </Link>
              <Link href="/events" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                Événements
              </Link>
              <Link href="/leaderboards" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                Classements
              </Link>
              <Link href="/support" className="text-slate-300 hover:text-violet-400 transition-colors font-medium">
                Support
              </Link>
              <div className="flex items-center space-x-4 ml-6">
                <Link href="/login" className="px-4 py-2 text-slate-300 hover:text-violet-400 border border-slate-600 hover:border-violet-500 rounded-lg transition-colors font-medium">
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary">
                  S'inscrire
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-8 px-4 fade-in">
        <Component {...pageProps} />
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-white">SpeedRun Platform</h3>
              </div>
              <p className="text-slate-400 mb-6 max-w-lg">
                La plateforme de référence pour les speedrunners. 
                Suivez vos performances, participez aux événements et rejoignez la communauté !
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="space-y-2">
                  <div><Link href="/" className="text-slate-400 hover:text-violet-400 transition-colors">Accueil</Link></div>
                  <div><Link href="/games" className="text-slate-400 hover:text-violet-400 transition-colors">Jeux</Link></div>
                  <div><Link href="/events" className="text-slate-400 hover:text-violet-400 transition-colors">Événements</Link></div>
                  <div><Link href="/leaderboards" className="text-slate-400 hover:text-violet-400 transition-colors">Classements</Link></div>
                </div>
                <div className="space-y-2">
                  <div><Link href="/support" className="text-slate-400 hover:text-violet-400 transition-colors">Support</Link></div>
                  <div><Link href="/login" className="text-slate-400 hover:text-violet-400 transition-colors">Connexion</Link></div>
                  <div><Link href="/register" className="text-slate-400 hover:text-violet-400 transition-colors">Inscription</Link></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              &copy; 2025 SpeedRun Platform - Projet TP DWWM 🎯
            </p>
            <p className="text-slate-500 text-sm mt-2 md:mt-0">
              Backend fonctionnel avec données de test • Interface professionnelle
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 