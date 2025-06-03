import { useState, useEffect } from 'react';

interface Game {
  id: string;
  title: string;
  cover?: string;
  description: string;
  platform: string[];
  genre: string[];
  developer: string;
  publisher: string;
  releaseDate: string;
  categories?: Array<{
    id: string;
    name: string;
    rules: string;
  }>;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/games');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiResponse = await response.json();
        
        // Extraire les données depuis la réponse API
        let gameData;
        if (apiResponse.success && Array.isArray(apiResponse.data)) {
          gameData = apiResponse.data;
        } else if (Array.isArray(apiResponse)) {
          gameData = apiResponse;
        } else {
          console.error('Structure de données inattendue:', apiResponse);
          setError('Format de données invalide');
          setGames([]);
          return;
        }
        
        setGames(gameData);
      } catch (error) {
        console.error('Erreur lors du chargement des jeux:', error);
        setError('Impossible de charger les jeux. Vérifiez que le backend est démarré.');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // S'assurer que games est toujours un tableau avant de filtrer
  const filteredGames = Array.isArray(games) ? games.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.platform.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
    game.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const getYearFromDate = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🎮</span>
          </div>
          <p className="text-slate-300 text-lg">Chargement des jeux...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Erreur de chargement</h3>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header de la page */}
      <section className="text-center py-12">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-4">
            <span className="text-2xl">🎮</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Catalogue des Jeux
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Découvrez tous les jeux disponibles sur la plateforme avec leurs catégories de speedrun
        </p>
      </section>

      {/* Barre de recherche */}
      <section>
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un jeu, plateforme ou genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <span className="text-slate-400">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{games.length}</h3>
            <p className="text-slate-400">Jeux disponibles</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🏷️</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {games.reduce((acc, game) => acc + game.genre.length, 0)}
            </h3>
            <p className="text-slate-400">Genres totaux</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{filteredGames.length}</h3>
            <p className="text-slate-400">Résultats trouvés</p>
          </div>
        </div>
      </section>

      {/* Liste des jeux */}
      <section>
        {filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😕</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun jeu trouvé</h3>
            <p className="text-slate-400">
              {games.length === 0 
                ? "Aucun jeu disponible pour le moment" 
                : "Essayez avec d'autres termes de recherche"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div key={game.id} className="card hover-scale group">
                {/* Image du jeu */}
                <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {game.cover ? (
                    <img 
                      src={game.cover} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl opacity-50">🎮</span>
                  )}
                </div>

                {/* Contenu */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">
                      {game.title}
                    </h3>
                    <span className="text-sm text-slate-400 bg-slate-700 px-2 py-1 rounded">
                      {getYearFromDate(game.releaseDate)}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm line-clamp-2">
                    {game.description}
                  </p>

                  {/* Développeur/Éditeur */}
                  <div className="text-xs text-slate-400">
                    <span className="font-medium">Développeur:</span> {game.developer}
                  </div>

                  {/* Plateformes */}
                  <div className="flex flex-wrap gap-2">
                    {game.platform.map((platform, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {game.genre.map((genre, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-violet-600/20 text-violet-300 px-2 py-1 rounded-full border border-violet-600/30"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Bouton d'action */}
                  <button className="w-full btn-primary text-sm py-2 mt-4">
                    <span className="mr-2">🏃‍♂️</span>
                    Voir les runs
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 