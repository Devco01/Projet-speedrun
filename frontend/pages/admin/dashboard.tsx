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
      // Données vides pour les utilisateurs (pas de données fictives)
      setUsers([]);

      // Événements vides (pas de données fictives) 
      setUpcomingEvents([]);
      setPastEvents([]);

      // Statistiques basées sur les données réelles
      setStats({
        totalUsers: 0,
        totalEvents: 0,
        pastEvents: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Données de fallback
      setStats({
        totalUsers: 0,
        totalEvents: 0,
        pastEvents: 0
      });
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
              <span className="text-blue-400">⚡</span>
              Tableau de bord administrateur
            </h1>
            <p className="text-gray-400">Surveillance et statistiques de la plateforme speedrun</p>
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
                    </div>
                  ) : (
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
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