import Link from 'next/link'
import { useState, useEffect } from 'react'

interface JeuStats {
  id: string
  nom: string
  nombreJoueurs: number
  recordTemps: string
  categorie: string
  coverImage?: string
}

export default function HomePage() {
  const [jeuxPopulaires, setJeuxPopulaires] = useState<JeuStats[]>([])
  const [chargementJeux, setChargementJeux] = useState(true)

  useEffect(() => {
    const chargerJeuxPopulaires = async () => {
      try {
        setChargementJeux(true)
        
        // Liste des jeux populaires avec leurs IDs Speedrun.com
        const jeuxIds = [
          { 
            id: 'sm64', 
            nom: 'Super Mario 64'
          },
          { 
            id: 'oot', 
            nom: 'Zelda: OOT'
          },
          { 
            id: 'celeste', 
            nom: 'Celeste'
          }
        ]

        const jeuxData = await Promise.all(
          jeuxIds.map(async (jeu) => {
            try {
              // Récupérer les stats du jeu
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
              const response = await fetch(`${apiUrl}/speedrun/game-stats/${jeu.id}`)
              if (response.ok) {
                const stats = await response.json()
                return {
                  id: jeu.id,
                  nom: jeu.nom,
                  nombreJoueurs: stats.players || 0,
                  recordTemps: stats.worldRecord || 'N/A',
                  categorie: stats.category || 'Any%'
                }
              }
            } catch (error) {
              console.error(`Erreur lors du chargement de ${jeu.nom}:`, error)
            }
            
            // Fallback en cas d'erreur
            return {
              id: jeu.id,
              nom: jeu.nom,
              nombreJoueurs: 0,
              recordTemps: 'Chargement...',
              categorie: 'Any%'
            }
          })
        )

        setJeuxPopulaires(jeuxData)
      } catch (error) {
        console.error('Erreur lors du chargement des jeux populaires:', error)
      } finally {
        setChargementJeux(false)
      }
    }

    chargerJeuxPopulaires()
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl mb-6">
              <span className="text-5xl font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">⚡</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              SpeedrunSchedule
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Explorez les temps record, découvrez les performances légendaires et 
            naviguez dans l'univers fascinant du speedrunning.
          </p>
          <div className="flex justify-center">
            <Link href="/leaderboards" className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 border border-violet-500/20 inline-flex items-center">
              <span>Voir les Classements</span>
              <span className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Fonctionnalités principales */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Découvrez l'univers du speedrunning</h2>
          <p className="text-slate-400 text-lg">
            Explorez les meilleurs temps mondiaux et plongez dans la passion du speedrun
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Exploration */}
          <div className="card hover-scale group h-full flex flex-col">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Exploration de Jeux</h3>
            </div>
            <p className="text-slate-300 mb-6 flex-grow">
              Découvrez des milliers de jeux speedrunnés avec leurs catégories, règles et records officiels. Naviguez facilement dans notre catalogue complet.
            </p>
            <Link 
              href="/leaderboards"
              className="group inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 border border-blue-500/20 mt-auto"
            >
              <span>Explorer les Jeux</span>
              <span className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          </div>
          
          {/* Card Classements */}
          <div className="card hover-scale group h-full flex flex-col">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">🏅</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Records Mondiaux</h3>
            </div>
            <p className="text-slate-300 mb-6 flex-grow">
              Consultez les classements officiels et découvrez les performances légendaires des meilleurs speedrunners de chaque jeu et catégorie.
            </p>
            <Link 
              href="/leaderboards"
              className="group bg-transparent border-2 border-white hover:border-white/80 text-white hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:bg-white/10 inline-flex items-center"
            >
              <span>Voir les Classements</span>
              <span className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Jeux populaires */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Jeux Populaires</h2>
          <p className="text-slate-400 text-lg">
            Découvrez les jeux les plus speedrunnés
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {chargementJeux ? (
            // Skeletons de chargement
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-xl mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-slate-700 rounded mx-auto mb-2 w-32 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded mx-auto mb-3 w-24 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded mx-auto w-28 animate-pulse"></div>
              </div>
            ))
          ) : (
            jeuxPopulaires.map((jeu, index) => (
              <div key={jeu.id} className="card text-center hover-scale group">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden relative shadow-lg">
                  <div className={`w-full h-full bg-gradient-to-br ${
                    index === 0 ? 'from-red-400 via-red-500 to-red-600' :
                    index === 1 ? 'from-green-400 via-green-500 to-green-600' :
                    'from-purple-400 via-purple-500 to-purple-600'
                  } flex items-center justify-center`}>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{jeu.nom}</h3>
                <p className="text-slate-400 text-sm mb-3">
                  {jeu.nombreJoueurs > 0 ? `${jeu.nombreJoueurs.toLocaleString()} joueurs` : 'Chargement...'}
                </p>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-green-400 text-xs font-mono">
                    {jeu.categorie} - Record: {jeu.recordTemps}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Statistiques */}
      <section>
        <div className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 border border-violet-700/50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Rejoignez des milliers de speedrunners</h2>
            <p className="text-violet-200 text-lg">
              Une communauté grandissante passionnée par la performance
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">45,000+</div>
              <div className="text-violet-300 text-sm">Runs soumis</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">8,500+</div>
              <div className="text-violet-300 text-sm">Joueurs actifs</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">2,000+</div>
              <div className="text-violet-300 text-sm">Jeux disponibles</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">150+</div>
              <div className="text-violet-300 text-sm">Courses cette semaine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à battre des records ?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez notre plateforme dès maintenant et commencez à participer aux courses speedrun les plus excitantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="group bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 text-blue-600 hover:text-blue-700 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-200/30 inline-flex items-center">
              <span>S'inscrire</span>
              <span className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
            <Link href="/leaderboards" className="group bg-transparent border-2 border-white hover:border-white/80 text-white hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:bg-white/10 inline-flex items-center">
              <span>Voir les Classements</span>
              <span className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 