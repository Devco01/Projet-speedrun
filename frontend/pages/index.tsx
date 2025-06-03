import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-6">
              <span className="text-3xl">🏆</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Plateforme de Speedruns
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            La plateforme dédiée aux speedrunners. Suivez vos performances, 
            participez aux événements et rejoignez une communauté passionnée.
          </p>
          <div className="flex justify-center">
            <Link href="/leaderboards" className="btn-secondary text-lg px-8 py-4 inline-flex items-center">
              📊 Voir les classements
            </Link>
          </div>
        </div>
      </section>

      {/* API Testing Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">API Backend - Tests en Direct</h2>
          <p className="text-slate-400 text-lg">
            Backend fonctionnel avec données de test complètes 🎯
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card API Jeux */}
          <div className="card hover-scale group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">🎮</span>
              </div>
              <h3 className="text-xl font-semibold text-white">API Jeux</h3>
            </div>
            <p className="text-slate-300 mb-6">
              Accédez à la liste complète des jeux disponibles avec leurs catégories et statistiques.
            </p>
            <a 
              href="http://localhost:5000/api/games" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">🔗</span>
              Tester l'API Jeux
            </a>
          </div>
          
          {/* Card API Événements */}
          <div className="card hover-scale group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-white">API Événements</h3>
            </div>
            <p className="text-slate-300 mb-6">
              Découvrez les événements de speedrun en cours et à venir avec tous leurs détails.
            </p>
            <a 
              href="http://localhost:5000/api/events" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">📅</span>
              Tester l'API Événements
            </a>
          </div>
          
          {/* Card API Jeu Spécifique */}
          <div className="card hover-scale group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Jeu Détaillé</h3>
            </div>
            <p className="text-slate-300 mb-6">
              Explorez les détails complets d'un jeu spécifique avec ses catégories et records.
            </p>
            <a 
              href="http://localhost:5000/api/games/1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">🍄</span>
              Voir Super Mario Bros
            </a>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section>
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700/50 rounded-2xl p-8">
          <div className="flex items-start">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Backend 100% Opérationnel !</h3>
              <p className="text-green-200 text-lg mb-4">
                Le serveur backend fonctionne parfaitement avec un système complet de données de test.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center text-green-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    API RESTful complète
                  </div>
                  <div className="flex items-center text-green-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    4 jeux avec catégories multiples
                  </div>
                  <div className="flex items-center text-green-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Système d'événements actif
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-green-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Données de test complètes
                  </div>
                  <div className="flex items-center text-green-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Contrôleurs TypeScript
                  </div>
                  <div className="flex items-center text-green-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Prêt pour la soutenance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Progress */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">État d'Avancement du Projet TP DWWM</h2>
          <p className="text-slate-400">Progression complète pour l'examen</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Terminé */}
          <div className="card bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/30">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Fonctionnalités Terminées</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-green-300">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Backend Express + TypeScript complet
              </div>
              <div className="flex items-center text-green-300">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                API RESTful avec tous les endpoints
              </div>
              <div className="flex items-center text-green-300">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Système de données de test robuste
              </div>
              <div className="flex items-center text-green-300">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Interface avec Next.js
              </div>
              <div className="flex items-center text-green-300">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Design responsive et accessible
              </div>
            </div>
          </div>
          
          {/* En cours */}
          <div className="card bg-gradient-to-br from-blue-900/20 to-violet-900/20 border-blue-700/30">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">🔧</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Prochaines Étapes</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-blue-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Pages de détail des jeux
              </div>
              <div className="flex items-center text-blue-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Interface d'administration
              </div>
              <div className="flex items-center text-blue-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Système de gestion des runs
              </div>
              <div className="flex items-center text-blue-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Tableaux de classements
              </div>
              <div className="flex items-center text-blue-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Documentation finale
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 