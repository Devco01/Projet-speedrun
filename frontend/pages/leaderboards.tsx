import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
}

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
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  rules: string;
  gameId: string;
}

interface Run {
  id: string;
  time: number;
  videoUrl?: string;
  submittedAt: string;
  isVerified: boolean;
  verifiedAt?: string;
  userId: string;
  gameId: string;
  categoryId: string;
}

interface LeaderboardEntry {
  run: Run;
  user: User;
  game: Game;
  category: Category;
  rank: number;
}

export default function LeaderboardsPage() {
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Pour cette démo, on va créer des données simulées pour les classements
        // En attendant que le backend ait des endpoints pour users, categories et runs
        const simulatedLeaderboards: LeaderboardEntry[] = [
          {
            run: {
              id: "1",
              time: 294000, // 4:54
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              submittedAt: "2024-06-01T15:30:00Z",
              isVerified: true,
              verifiedAt: "2024-06-01T16:00:00Z",
              userId: "1",
              gameId: "1",
              categoryId: "1"
            },
            user: {
              id: "1",
              username: "SpeedRunner123",
              email: "speedrunner@example.com",
              profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
              bio: "Passionné de speedrun depuis 5 ans, spécialisé dans les plateformers.",
              createdAt: "2024-01-15T10:00:00Z"
            },
            game: {
              id: "1",
              title: "Super Mario Bros.",
              cover: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300",
              description: "Le classique platformer de Nintendo",
              platform: ["NES", "Switch"],
              genre: ["Platformer", "Action"],
              developer: "Nintendo",
              publisher: "Nintendo",
              releaseDate: "1985-09-13",
              createdAt: "2024-01-01T00:00:00Z"
            },
            category: {
              id: "1",
              name: "Any%",
              rules: "Finir le jeu le plus rapidement possible, glitches autorisés.",
              gameId: "1"
            },
            rank: 1
          },
          {
            run: {
              id: "2",
              time: 1140000, // 19:00
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              submittedAt: "2024-06-02T10:15:00Z",
              isVerified: true,
              verifiedAt: "2024-06-02T11:00:00Z",
              userId: "2",
              gameId: "1",
              categoryId: "2"
            },
            user: {
              id: "2",
              username: "FastGamer",
              email: "fastgamer@example.com",
              profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
              bio: "Records holder en Any% sur plusieurs jeux rétro.",
              createdAt: "2024-02-20T14:30:00Z"
            },
            game: {
              id: "1",
              title: "Super Mario Bros.",
              cover: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300",
              description: "Le classique platformer de Nintendo",
              platform: ["NES", "Switch"],
              genre: ["Platformer", "Action"],
              developer: "Nintendo",
              publisher: "Nintendo",
              releaseDate: "1985-09-13",
              createdAt: "2024-01-01T00:00:00Z"
            },
            category: {
              id: "2",
              name: "100%",
              rules: "Finir le jeu avec tous les collectibles et niveaux.",
              gameId: "1"
            },
            rank: 1
          },
          {
            run: {
              id: "3",
              time: 1020000, // 17:00
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              submittedAt: "2024-06-03T14:45:00Z",
              isVerified: false,
              userId: "3",
              gameId: "2",
              categoryId: "3"
            },
            user: {
              id: "3",
              username: "RetroRunner",
              email: "retro@example.com",
              bio: "Fan des jeux 16-bit, toujours à la recherche du run parfait.",
              createdAt: "2024-03-10T09:15:00Z"
            },
            game: {
              id: "2",
              title: "The Legend of Zelda: Ocarina of Time",
              cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300",
              description: "Un RPG d'action épique",
              platform: ["N64", "3DS", "Switch"],
              genre: ["RPG", "Action", "Adventure"],
              developer: "Nintendo EAD",
              publisher: "Nintendo",
              releaseDate: "1998-11-21",
              createdAt: "2024-01-02T00:00:00Z"
            },
            category: {
              id: "3",
              name: "Any%",
              rules: "Finir le jeu principal le plus vite possible.",
              gameId: "2"
            },
            rank: 1
          },
          {
            run: {
              id: "4",
              time: 1800000, // 30:00
              submittedAt: "2024-06-04T09:20:00Z",
              isVerified: true,
              verifiedAt: "2024-06-04T10:00:00Z",
              userId: "1",
              gameId: "3",
              categoryId: "5"
            },
            user: {
              id: "1",
              username: "SpeedRunner123",
              email: "speedrunner@example.com",
              profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
              bio: "Passionné de speedrun depuis 5 ans, spécialisé dans les plateformers.",
              createdAt: "2024-01-15T10:00:00Z"
            },
            game: {
              id: "3",
              title: "Celeste",
              cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
              description: "Un platformer challengeant",
              platform: ["PC", "Switch", "PS4", "Xbox One"],
              genre: ["Platformer", "Indie"],
              developer: "Maddy Makes Games",
              publisher: "Maddy Makes Games",
              releaseDate: "2018-01-25",
              createdAt: "2024-01-03T00:00:00Z"
            },
            category: {
              id: "5",
              name: "Any%",
              rules: "Atteindre le sommet de la montagne.",
              gameId: "3"
            },
            rank: 1
          }
        ];

        // Récupérer les jeux depuis l'API
        const gamesResponse = await fetch('http://localhost:5000/api/games');
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          if (gamesData.success && Array.isArray(gamesData.data)) {
            setGames(gamesData.data);
          }
        }

        setLeaderboards(simulatedLeaderboards);
        
        // Extraire les catégories uniques
        const uniqueCategories = simulatedLeaderboards.reduce((acc, entry) => {
          const exists = acc.find(cat => cat.id === entry.category.id);
          if (!exists) acc.push(entry.category);
          return acc;
        }, [] as Category[]);
        setCategories(uniqueCategories);

      } catch (error) {
        console.error('Erreur lors du chargement des classements:', error);
        setError('Impossible de charger les classements');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filtrer les classements
  const filteredLeaderboards = leaderboards.filter(entry => {
    const gameFilter = selectedGame === 'all' || entry.game.id === selectedGame;
    const categoryFilter = selectedCategory === 'all' || entry.category.id === selectedCategory;
    const verifiedFilter = !verifiedOnly || entry.run.isVerified;
    
    return gameFilter && categoryFilter && verifiedFilter;
  });

  // Fonction pour formater le temps
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${Math.floor(ms / 10).toString().padStart(2, '0')}`;
    } else {
      return `${seconds}.${Math.floor(ms / 10).toString().padStart(2, '0')}`;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-slate-300 text-lg">Chargement des classements...</p>
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mb-4">
            <span className="text-2xl">🏆</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Classements Speedrun
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Découvrez les meilleurs temps et performances de la communauté speedrun
        </p>
      </section>

      {/* Filtres */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Filtre par jeu */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Jeu</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">Tous les jeux</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>

          {/* Filtre par catégorie */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Switch pour runs vérifiés */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filtres</label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${verifiedOnly ? 'bg-violet-600' : 'bg-slate-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
                <span className="ml-3 text-sm text-slate-300">Runs vérifiés uniquement</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🎮</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{games.length}</h3>
            <p className="text-slate-400">Jeux classés</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{categories.length}</h3>
            <p className="text-slate-400">Catégories</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {leaderboards.filter(entry => entry.run.isVerified).length}
            </h3>
            <p className="text-slate-400">Runs vérifiés</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {new Set(leaderboards.map(entry => entry.user.id)).size}
            </h3>
            <p className="text-slate-400">Runners actifs</p>
          </div>
        </div>
      </section>

      {/* Classements */}
      <section>
        {filteredLeaderboards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😕</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun classement trouvé</h3>
            <p className="text-slate-400">Aucun run ne correspond aux filtres sélectionnés</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Classements ({filteredLeaderboards.length} runs)
              </h2>
              <div className="text-sm text-slate-400">
                Mis à jour en temps réel
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Rang
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Runner
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Jeu / Catégorie
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Temps
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Vidéo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredLeaderboards.map((entry, index) => (
                      <tr key={entry.run.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                              index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                              'bg-slate-600 text-slate-300'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.user.profileImage ? (
                              <img
                                src={entry.user.profileImage}
                                alt={entry.user.username}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">
                                  {entry.user.username[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-white">{entry.user.username}</div>
                              <div className="text-xs text-slate-400">{entry.user.bio?.substring(0, 30)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{entry.game.title}</div>
                            <div className="text-xs text-violet-400">{entry.category.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-mono font-bold text-white">
                            {formatTime(entry.run.time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {formatDate(entry.run.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.run.isVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <span className="mr-1">✅</span>
                              Vérifié
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <span className="mr-1">⏳</span>
                              En attente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.run.videoUrl ? (
                            <a
                              href={entry.run.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              <span className="mr-1">📺</span>
                              Voir
                            </a>
                          ) : (
                            <span className="text-xs text-slate-500">Pas de vidéo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
} 