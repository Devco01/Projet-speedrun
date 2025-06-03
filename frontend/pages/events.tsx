import { useState, useEffect } from 'react';

interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  isOnline: boolean;
  participants: number;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiResponse = await response.json();
        
        // Extraire les données depuis la réponse API
        let eventData;
        if (apiResponse.success && Array.isArray(apiResponse.data)) {
          eventData = apiResponse.data;
        } else if (Array.isArray(apiResponse)) {
          eventData = apiResponse;
        } else {
          console.error('Structure de données inattendue:', apiResponse);
          setError('Format de données invalide');
          setEvents([]);
          return;
        }
        
        setEvents(eventData);
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        setError('Impossible de charger les événements. Vérifiez que le backend est démarré.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fonction pour déterminer le statut d'un événement basé sur les dates
  const getEventStatus = (startDate: string, endDate: string): 'upcoming' | 'active' | 'completed' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'completed';
  };

  // Ajouter le statut calculé aux événements
  const eventsWithStatus = events.map(event => ({
    ...event,
    status: getEventStatus(event.startDate, event.endDate)
  }));

  // S'assurer que events est toujours un tableau avant de filtrer
  const filteredEvents = Array.isArray(eventsWithStatus) ? (filterStatus === 'all' 
    ? eventsWithStatus 
    : eventsWithStatus.filter(event => event.status === filterStatus)) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'from-blue-500 to-cyan-500';
      case 'active': return 'from-green-500 to-emerald-500';
      case 'completed': return 'from-gray-500 to-slate-500';
      default: return 'from-violet-500 to-purple-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '📅 À venir';
      case 'active': return '🔴 En cours';
      case 'completed': return '✅ Terminé';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-slate-300 text-lg">Chargement des événements...</p>
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-4">
            <span className="text-2xl">🏆</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Événements Speedrun
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Participez aux compétitions de speedrun et défiez les meilleurs runners du monde
        </p>
      </section>

      {/* Filtres */}
      <section>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { key: 'all', label: 'Tous les événements', icon: '📋' },
            { key: 'upcoming', label: 'À venir', icon: '📅' },
            { key: 'active', label: 'En cours', icon: '🔴' },
            { key: 'completed', label: 'Terminés', icon: '✅' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filterStatus === filter.key
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Statistiques */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📅</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {eventsWithStatus.filter(e => e.status === 'upcoming').length}
            </h3>
            <p className="text-slate-400">À venir</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🔴</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {eventsWithStatus.filter(e => e.status === 'active').length}
            </h3>
            <p className="text-slate-400">En cours</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {eventsWithStatus.filter(e => e.status === 'completed').length}
            </h3>
            <p className="text-slate-400">Terminés</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {events.reduce((acc, event) => acc + event.participants, 0)}
            </h3>
            <p className="text-slate-400">Participants</p>
          </div>
        </div>
      </section>

      {/* Liste des événements */}
      <section>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😕</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun événement trouvé</h3>
            <p className="text-slate-400">
              {events.length === 0 
                ? "Aucun événement disponible pour le moment" 
                : "Aucun événement ne correspond à votre filtre"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="card hover-scale group">
                {/* Header de l'événement */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors mb-2">
                      {event.name}
                    </h3>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(event.status)} text-white`}>
                      <span>{getStatusText(event.status)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-violet-400">
                      {event.isOnline ? '🌐 En ligne' : '📍 Présentiel'}
                    </div>
                    {event.location && (
                      <div className="text-xs text-slate-400">{event.location}</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Dates */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span className="text-slate-400">Début:</span>
                    <span className="text-slate-300 ml-2">{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    <span className="text-slate-400">Fin:</span>
                    <span className="text-slate-300 ml-2">{formatDate(event.endDate)}</span>
                  </div>
                </div>

                {/* Durée de l'événement */}
                <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Durée estimée:</span>
                    <span className="text-slate-300 font-medium">
                      {Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-400">Type d'événement:</span>
                    <span className="text-slate-300 font-medium">
                      {event.isOnline ? 'Marathon en ligne' : 'Événement physique'}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex items-center text-sm text-slate-400">
                    <span className="mr-2">👥</span>
                    <span>{event.participants} participants</span>
                  </div>
                  <button className="btn-primary text-sm py-2 px-4">
                    {event.status === 'upcoming' ? '📝 S\'inscrire' : 
                     event.status === 'active' ? '🔴 Suivre en direct' : 
                     '📊 Voir résultats'}
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