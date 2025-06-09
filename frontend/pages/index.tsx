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
              const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')
              const response = await fetch(`${apiUrl}/api/speedrun/game-stats/${jeu.id}`)
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
      {/* Hero Section - Responsive */}
      <section className="text-center py-8 md:py-16 px-4 relative overflow-hidden">
        {/* Particules d'arrière-plan dynamiques - adaptées aux écrans */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Particules orbitant autour du titre - responsive */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-8 md:-translate-x-16 w-1.5 h-1.5 bg-violet-400/30 rounded-full animate-ping" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
          <div className="absolute top-1/3 left-1/2 transform translate-x-8 md:translate-x-16 w-2 h-2 bg-cyan-400/40 rounded-full animate-ping" style={{animationDelay: '0.5s', animationDuration: '2.5s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-10 md:-translate-x-20 w-1 h-1 bg-purple-400/35 rounded-full animate-ping" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform translate-x-10 md:translate-x-20 w-1.5 h-1.5 bg-violet-300/35 rounded-full animate-ping" style={{animationDelay: '1.5s', animationDuration: '2.2s'}}></div>
          <div className="absolute top-2/3 left-1/2 transform -translate-x-6 md:-translate-x-12 w-1 h-1 bg-cyan-300/40 rounded-full animate-ping" style={{animationDelay: '0.3s', animationDuration: '2.8s'}}></div>
          <div className="absolute top-2/3 left-1/2 transform translate-x-6 md:translate-x-12 w-1 h-1 bg-purple-300/30 rounded-full animate-ping" style={{animationDelay: '1.2s', animationDuration: '2.7s'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl mb-4 md:mb-6 animate-pulse hover:animate-none transition-all duration-300 hover:scale-110 hover:rotate-3">
              <span className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">⚡</span>
            </div>
          </div>
          
          {/* Titre responsive avec breakpoints adaptés */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in leading-tight">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
              SpeedrunSchedule
            </span>
          </h1>
          
          {/* Description responsive */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay px-2">
            Explorez les temps record, découvrez les performances légendaires et 
            naviguez dans l'univers fascinant du speedrunning.
          </p>
          
          {/* Button responsive */}
          <div className="flex justify-center animate-fade-in-delay-2">
            <Link href="/leaderboards" className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 border border-violet-500/20 inline-flex items-center relative overflow-hidden">
              <span className="relative z-10">Voir les Classements</span>
              <span className="ml-2 opacity-75 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">→</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Jeux populaires - Grid responsive améliorée */}
      <section className="px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Jeux Populaires</h2>
          <p className="text-slate-400 text-base md:text-lg">
            Découvrez les jeux les plus speedrunnés
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {chargementJeux ? (
            // Skeletons de chargement
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="card text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-700 rounded-xl mx-auto mb-4 animate-pulse"></div>
                <div className="h-5 md:h-6 bg-slate-700 rounded mx-auto mb-2 w-32 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded mx-auto mb-3 w-24 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded mx-auto w-28 animate-pulse"></div>
              </div>
            ))
          ) : (
            jeuxPopulaires.map((jeu, index) => (
              <div 
                key={jeu.id} 
                className="card text-center hover-scale group animate-fade-in-delay"
                style={{animationDelay: `${0.6 + index * 0.1}s`}}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-4 overflow-hidden relative shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <div className={`w-full h-full bg-gradient-to-br ${
                    index === 0 ? 'from-red-400 via-red-500 to-red-600' :
                    index === 1 ? 'from-green-400 via-green-500 to-green-600' :
                    'from-purple-400 via-purple-500 to-purple-600'
                  } flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors duration-300">{jeu.nom}</h3>
                <p className="text-slate-400 text-xs md:text-sm mb-3 group-hover:text-slate-300 transition-colors duration-300">
                  {jeu.nombreJoueurs > 0 ? `${jeu.nombreJoueurs.toLocaleString()} joueurs` : 'Chargement...'}
                </p>
                <div className="bg-slate-800/50 rounded-lg p-2 md:p-3 border border-slate-700/50 group-hover:border-violet-500/30 group-hover:bg-slate-700/50 transition-all duration-300">
                  <p className="text-green-400 text-xs font-mono group-hover:text-green-300 transition-colors duration-300">
                    {jeu.categorie} - Record: {jeu.recordTemps}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Call to action - Responsive */}
      <section className="px-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 lg:p-12 text-center backdrop-blur-sm max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Prêt à battre des records ?
          </h2>
          <p className="text-slate-300 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
            Rejoignez notre plateforme dès maintenant et commencez à participer aux courses speedrun les plus excitantes.
          </p>
          <div className="flex justify-center">
            <Link href="/register" className="group bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-flex items-center text-sm md:text-base">
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>S'inscrire maintenant</span>
              <span className="ml-2 opacity-75 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 