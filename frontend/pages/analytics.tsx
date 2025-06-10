import { useState, useEffect } from 'react';
import { useAuth } from './_app';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

interface DailyActivity {
  date: string;
  newUsers: number;
  newRuns: number;
  newRecords: number;
}

interface TopPerformer {
  username: string;
  runCount: number;
  bestTime: number;
  avgTime: number;
}

interface GamePopularity {
  gameTitle: string;
  runCount: number;
  uniqueRunners: number;
  avgTime: number;
}

interface PlatformGrowth {
  usersGrowth: number;
  runsGrowth: number;
  weeklyGrowth: number;
}

interface ActivityFeedItem {
  id: string;
  username: string;
  action: string;
  timestamp: string;
  type: string;
}

interface AnalyticsData {
  dailyActivity: DailyActivity[];
  topPerformers: TopPerformer[];
  gamePopularity: GamePopularity[];
  platformGrowth: PlatformGrowth;
}

export default function AnalyticsPage() {
  const { utilisateurActuel, estAuthentifie } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!estAuthentifie) {
      router.push('/login');
      return;
    }
    
    // Vérifier si l'utilisateur est admin
    checkAdminAccess();
  }, [estAuthentifie]);

  useEffect(() => {
    if (isAdmin) {
      loadAnalytics();
      loadActivityFeed();
    }
  }, [isAdmin, timeRange]);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Appel à l'API pour vérifier le statut admin
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAdmin(true);
      } else {
        // Pas autorisé - rediriger vers l'accueil
        setError('Accès non autorisé. Cette page est réservée aux administrateurs.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur vérification admin:', error);
      setError('Erreur de vérification des permissions.');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des analytics');
      }

      const data = await response.json();
      setAnalyticsData(data.data);
    } catch (error) {
      console.error('Erreur analytics:', error);
      setError('Impossible de charger les analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityFeed = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/activity-feed?limit=10`);
      
      if (!response.ok) {
        throw new Error('Erreur feed activité');
      }

      const data = await response.json();
      setActivityFeed(data.data);
    } catch (error) {
      console.error('Erreur feed activité:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthColor = (growth: number): string => {
    if (growth > 0) return 'text-green-400';
    if (growth < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getGrowthIcon = (growth: number): string => {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➡️';
  };

  if (!estAuthentifie) {
    return <div>Redirection...</div>;
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="text-slate-400">
          {!isAdmin ? 'Vérification des permissions...' : 'Chargement...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-900/50 text-red-300 p-4 rounded-lg border border-red-800 text-center">
          <div className="text-lg font-semibold mb-2">🚫 Accès Restreint</div>
          <div>{error}</div>
          <div className="mt-3 text-sm text-red-400">
            Redirection automatique dans quelques secondes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics - SpeedrunSchedule</title>
        <meta name="description" content="Analytics et statistiques de la plateforme" />
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header avec navigation */}
        <div className="text-center">
          <div className="flex justify-between items-center mb-4">
            <Link 
              href="/admin/dashboard"
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Retour au Dashboard Admin</span>
            </Link>
            <div></div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">📊 Analytics Admin</h1>
          <p className="text-slate-400">Insights et métriques avancées de la plateforme</p>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-purple-900/50 text-purple-300 rounded-full border border-purple-700">
              🔐 Accès Administrateur
            </span>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800 rounded-lg p-2 flex space-x-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  timeRange === days
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {days} jours
              </button>
            ))}
          </div>
        </div>

        {analyticsData && (
          <>
            {/* Métriques de croissance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-300 font-medium">Croissance Utilisateurs</h3>
                  <span className="text-2xl">{getGrowthIcon(analyticsData.platformGrowth.usersGrowth)}</span>
                </div>
                <div className={`text-2xl font-bold ${getGrowthColor(analyticsData.platformGrowth.usersGrowth)}`}>
                  {analyticsData.platformGrowth.usersGrowth > 0 ? '+' : ''}{analyticsData.platformGrowth.usersGrowth.toFixed(1)}%
                </div>
                <p className="text-slate-400 text-sm">vs semaine précédente</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-300 font-medium">Croissance Runs</h3>
                  <span className="text-2xl">{getGrowthIcon(analyticsData.platformGrowth.runsGrowth)}</span>
                </div>
                <div className={`text-2xl font-bold ${getGrowthColor(analyticsData.platformGrowth.runsGrowth)}`}>
                  {analyticsData.platformGrowth.runsGrowth > 0 ? '+' : ''}{analyticsData.platformGrowth.runsGrowth.toFixed(1)}%
                </div>
                <p className="text-slate-400 text-sm">vs semaine précédente</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-300 font-medium">Croissance Globale</h3>
                  <span className="text-2xl">{getGrowthIcon(analyticsData.platformGrowth.weeklyGrowth)}</span>
                </div>
                <div className={`text-2xl font-bold ${getGrowthColor(analyticsData.platformGrowth.weeklyGrowth)}`}>
                  {analyticsData.platformGrowth.weeklyGrowth > 0 ? '+' : ''}{analyticsData.platformGrowth.weeklyGrowth.toFixed(1)}%
                </div>
                <p className="text-slate-400 text-sm">moyenne pondérée</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activité quotidienne */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  📈 Activité Quotidienne
                </h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analyticsData.dailyActivity.slice(-10).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="font-medium text-white">
                        {formatDate(day.date)}
                      </div>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-blue-400">👥 {day.newUsers}</span>
                        <span className="text-green-400">🏃 {day.newRuns}</span>
                        <span className="text-purple-400">🏆 {day.newRecords}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  🏆 Top Performers
                </h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analyticsData.topPerformers.slice(0, 8).map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-white">{performer.username}</div>
                          <div className="text-slate-400 text-sm">{performer.runCount} runs</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-mono">{formatTime(performer.bestTime)}</div>
                        <div className="text-slate-400 text-sm">meilleur temps</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jeux populaires */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  🎮 Jeux Populaires
                </h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analyticsData.gamePopularity.slice(0, 8).map((game, index) => (
                    <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-white truncate">{game.gameTitle}</div>
                        <div className="text-blue-400 font-bold">{game.runCount} runs</div>
                      </div>
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>👥 {game.uniqueRunners} runners</span>
                        {game.avgTime > 0 && (
                          <span>⏱️ {formatTime(game.avgTime)} moy.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feed d'activité */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  ⚡ Activité Récente
                </h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {activity.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm">
                            <span className="font-medium">{activity.username}</span> {activity.action}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {formatTimestamp(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
} 