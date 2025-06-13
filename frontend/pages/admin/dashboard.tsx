import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface Stats {
  totalUsers: number;
  totalRaces: number;
  activeRaces: number;
  completedRaces: number;
  newUsersThisMonth: number;
}

interface CleanupStats {
  totalRaces: number;
  finishedRaces: number;
  racesToCleanup: number;
  oldestFinishedRace?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  createdAt: string;
  isActive: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRaces: 0,
    activeRaces: 0,
    completedRaces: 0,
    newUsersThisMonth: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [cleanupStats, setCleanupStats] = useState<CleanupStats>({
    totalRaces: 0,
    finishedRaces: 0,
    racesToCleanup: 0
  });
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification admin
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    setIsAuthenticated(true);
    loadRealData();
    loadCleanupStats();
  }, []);

  const loadRealData = async () => {
    setLoading(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      console.log('DEBUG: API URL utilisée:', apiUrl);
      
      const adminToken = localStorage.getItem('adminToken');
      const authToken = localStorage.getItem('authToken');
      const token = adminToken || authToken;
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Récupérer les statistiques
      const statsResponse = await fetch(`${apiUrl}/api/admin/stats`, { headers });
      console.log('DEBUG: Stats response status:', statsResponse.status);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('DEBUG: Stats data:', statsData);
        setStats({
          totalUsers: statsData.data.totalUsers || 0,
          totalRaces: statsData.data.totalRaces || 0,
          activeRaces: statsData.data.activeRaces || 0,
          completedRaces: statsData.data.completedRaces || 0,
          newUsersThisMonth: statsData.data.newUsersThisMonth || 0
        });
      } else {
        console.error('DEBUG: Stats response error:', await statsResponse.text());
      }

      // Récupérer les utilisateurs
      const usersUrl = `${apiUrl}/api/admin/users?limit=50`;
      console.log('DEBUG: Tentative de récupération des utilisateurs:', usersUrl);
      const usersResponse = await fetch(usersUrl, { headers });
      console.log('DEBUG: Users response status:', usersResponse.status);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('DEBUG: Users data:', usersData);
        setUsers(usersData.data);
      } else {
        console.error('DEBUG: Users response error:', await usersResponse.text());
        setUsers([]); // S'assurer que c'est vide en cas d'erreur
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Garder les données par défaut en cas d'erreur
      setStats({
        totalUsers: 0,
        totalRaces: 0,
        activeRaces: 0,
        completedRaces: 0,
        newUsersThisMonth: 0
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCleanupStats = async () => {
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      const adminToken = localStorage.getItem('adminToken');
      const authToken = localStorage.getItem('authToken');
      const token = adminToken || authToken;
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiUrl}/api/admin/cleanup/stats`, { headers });
      if (response.ok) {
        const data = await response.json();
        setCleanupStats(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats de nettoyage:', error);
    }
  };

  const forceCleanup = async () => {
    setCleanupLoading(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      const adminToken = localStorage.getItem('adminToken');
      const authToken = localStorage.getItem('authToken');
      const token = adminToken || authToken;
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiUrl}/api/admin/cleanup`, {
        method: 'POST',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Nettoyage terminé: ${data.data.deletedCount} course(s) supprimée(s)`);
        loadCleanupStats(); // Recharger les stats
        loadRealData(); // Recharger les données générales
      } else {
        alert('Erreur lors du nettoyage');
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage forcé:', error);
      alert('Erreur lors du nettoyage');
    } finally {
      setCleanupLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isEventPast = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  if (!isAuthenticated) {
    return <div>Redirection...</div>;
  }

  return (
    <>
      <Head>
        <title>Administration - SpeedrunSchedule</title>
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
              Tableau de bord administrateur
            </h1>
            <p className="text-gray-400">Surveillance et statistiques de la plateforme speedrun</p>
          </div>

          {/* Actions rapides */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={forceCleanup}
                disabled={cleanupLoading}
                className="group bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 border border-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cleanupLoading ? '🧹 Nettoyage...' : '🧹 Nettoyer courses terminées'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <span className="text-white text-xl">👥</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Utilisateurs</p>
                      <p className="text-white text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <span className="text-white text-xl">🏁</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Races actives</p>
                      <p className="text-white text-2xl font-bold">{stats.activeRaces.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-orange-500 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-600 rounded-lg">
                      <span className="text-white text-xl">🧹</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Courses à nettoyer</p>
                      <p className="text-white text-2xl font-bold">{cleanupStats.racesToCleanup.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-orange-500 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-600 rounded-lg">
                      <span className="text-white text-xl">🏆</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Races terminées</p>
                      <p className="text-white text-2xl font-bold">{stats.completedRaces.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-green-500 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-600 rounded-lg">
                      <span className="text-white text-xl">📈</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Nouveaux ce mois</p>
                      <p className="text-white text-2xl font-bold">{stats.newUsersThisMonth.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Utilisateurs */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-blue-400">👥</span>
                    Utilisateurs de la plateforme
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  {users.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-400 text-lg">Aucun utilisateur enregistré</p>
                      <p className="text-gray-500 text-sm mt-2">Les utilisateurs apparaîtront ici une fois inscrits</p>
                      <p className="text-blue-400 text-xs mt-4">
                        Debug: {stats.totalUsers > 0 ? `${stats.totalUsers} utilisateur(s) détecté(s) dans les stats mais liste vide` : 'Aucun utilisateur dans les stats'}
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Avatar
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date d'inscription
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-750">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                                {user.profileImage && user.profileImage.startsWith('data:') ? (
                                  <img 
                                    src={user.profileImage} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <svg 
                                    className="w-6 h-6 text-white" 
                                    fill="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                  </svg>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {user.username}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">
                                {user.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
} 