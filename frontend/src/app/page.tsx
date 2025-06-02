import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero section */}
      <section className="w-full bg-gradient-to-r from-blue-900 to-purple-900 py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            SpeedRun Platform
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            La plateforme communautaire pour partager, découvrir et suivre les meilleurs speedruns de vos jeux préférés.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/games" 
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Découvrir les jeux
            </Link>
            <Link 
              href="/leaderboards" 
              className="bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white hover:text-purple-900 transition-colors"
            >
              Voir les classements
            </Link>
          </div>
        </div>
      </section>

      {/* Featured runs section */}
      <section className="w-full py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Records récents
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Ces cards seraient normalement générées à partir des données */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <div className="h-48 bg-gray-300 relative">
                  {/* Image d'exemple - à remplacer par de vraies données */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Image du jeu
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Super Mario 64 - 16 étoiles</h3>
                  <p className="text-gray-600 mb-4">Record par <span className="font-medium">SpeedRunner123</span></p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-600">14:58.24</span>
                    <Link href="/runs/123" className="text-blue-600 hover:underline">
                      Voir détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/runs" 
              className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Voir tous les records
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming events section */}
      <section className="w-full py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Événements à venir
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ces événements seraient normalement générés à partir des données */}
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="w-full md:w-1/3 aspect-video bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  Logo de l&apos;événement
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-xl font-bold mb-2">SGDQ 2025</h3>
                  <p className="text-gray-600 mb-4">Summer Games Done Quick revient pour une nouvelle édition spectaculaire !</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      12-19 Juin 2025
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      En ligne
                    </span>
                  </div>
                  <Link 
                    href="/events/sgdq2025" 
                    className="text-purple-600 font-medium hover:text-purple-800"
                  >
                    En savoir plus →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join community section */}
      <section className="w-full py-20 px-4 bg-purple-800 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Rejoignez la communauté
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Créez un compte pour soumettre vos propres records, suivre vos jeux préférés et interagir avec d&apos;autres speedrunners.
          </p>
          <Link 
            href="/register" 
            className="bg-white text-purple-800 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
          >
            S&apos;inscrire maintenant
          </Link>
        </div>
      </section>
    </main>
  );
}
