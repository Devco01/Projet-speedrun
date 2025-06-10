import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  pastEvents: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  createdAt: string;
  runsCount: number;
  isActive: boolean;
}

interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdBy: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalEvents: 0,
    pastEvents: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Vérifier l'authentification admin
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    setIsAuthenticated(true);
    loadRealData();
  }, []);

  const loadRealData = async () => {
    setLoading(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      console.log('DEBUG: API URL utilisée:', apiUrl);
      
      // Récupérer les statistiques
      const statsResponse = await fetch(`${apiUrl}/api/admin/stats`);
      console.log('DEBUG: Stats response status:', statsResponse.status);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('DEBUG: Stats data:', statsData);
        setStats({
          totalUsers: statsData.data.totalUsers,
          totalEvents: statsData.data.totalEvents,
          pastEvents: statsData.data.pastEvents
        });
      } else {
        console.error('DEBUG: Stats response error:', await statsResponse.text());
      }

      // Récupérer les utilisateurs
      const usersUrl = `${apiUrl}/api/admin/users?limit=50`;
      console.log('DEBUG: Tentative de récupération des utilisateurs:', usersUrl);
      const usersResponse = await fetch(usersUrl);
      console.log('DEBUG: Users response status:', usersResponse.status);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('DEBUG: Users data:', usersData);
        setUsers(usersData.data);
      } else {
        console.error('DEBUG: Users response error:', await usersResponse.text());
        setUsers([]); // S'assurer que c'est vide en cas d'erreur
      }

      // Récupérer les événements
      const eventsResponse = await fetch(`${apiUrl}/api/admin/events`);
      console.log('DEBUG: Events response status:', eventsResponse.status);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        console.log('DEBUG: Events data:', eventsData);
        setUpcomingEvents(eventsData.data.upcoming);
        setPastEvents(eventsData.data.past);
      } else {
        console.error('DEBUG: Events response error:', await eventsResponse.text());
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Garder les données par défaut en cas d'erreur
      setStats({
        totalUsers: 0,
        totalEvents: 0,
        pastEvents: 0
      });
      setUsers([]);
      setUpcomingEvents([]);
      setPastEvents([]);
    } finally {
      setLoading(false);
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
          {/* Titre avec bouton de déconnexion */}
          <div className="mb-8 relative">
            <div className="absolute top-0 right-0">
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  router.push('/');
                }}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm"
              >
                Déconnexion
              </button>
            </div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2 pr-24">
              Tableau de bord administrateur
            </h1>
            <p className="text-gray-400">Surveillance et statistiques de la plateforme speedrun</p>
          </div>

          {/* Actions rapides */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/analytics"
                className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 border border-purple-500/20"
              >
                Analytics Avancées
              </Link>
              
              <button className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 border border-green-500/20">
                Exporter Données
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <span className="text-white text-xl">📅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Événements à venir</p>
                      <p className="text-white text-2xl font-bold">{stats.totalEvents.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-orange-500 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-600 rounded-lg">
                      <span className="text-white text-xl">📚</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-400 text-sm">Événements passés</p>
                      <p className="text-white text-2xl font-bold">{stats.pastEvents.toLocaleString()}</p>
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
                            Speedruns
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">
                                {user.runsCount}
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

              {/* Événements à venir */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-purple-400">📅</span>
                    Événements en ligne à venir
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  {upcomingEvents.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-400 text-lg">Aucun événement à venir</p>
                      <p className="text-gray-500 text-sm mt-2">Les événements en ligne créés par les utilisateurs apparaîtront ici</p>
                    </div>
                  ) : (
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Nom de l'événement
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Créé par
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date début
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date fin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {upcomingEvents.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-750">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {event.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {event.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">
                                {event.createdBy}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatDate(event.startDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatDate(event.endDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Historique des événements passés */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-orange-400">📚</span>
                    Historique des événements passés
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  {pastEvents.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-400 text-lg">Aucun événement dans l'historique</p>
                      <p className="text-gray-500 text-sm mt-2">Les événements terminés apparaîtront ici automatiquement</p>
                    </div>
                  ) : (
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Nom de l'événement
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Créé par
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date début
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date fin
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {pastEvents.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-750">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {event.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {event.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">
                                {event.createdBy}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatDate(event.startDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatDate(event.endDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                Terminé
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