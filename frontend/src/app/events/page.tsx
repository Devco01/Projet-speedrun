'use client';

import { useState } from 'react';
import Link from 'next/link';

// Types
type Event = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  website?: string;
  location?: string;
  isOnline: boolean;
};

// Données fictives pour l'exemple (en attendant l'intégration avec l'API)
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Summer Games Done Quick 2025',
    description: 'La plus grande marathon caritative de speedruns au monde revient pour une semaine de runs incroyables au profit d\'œuvres de charité.',
    startDate: '2025-07-15T00:00:00Z',
    endDate: '2025-07-22T23:59:59Z',
    website: 'https://gamesdonequick.com',
    location: 'Bloomington, Minnesota',
    isOnline: false
  },
  {
    id: '2',
    name: 'European Speedrunner Assembly 2025',
    description: 'L\'événement européen de speedruns le plus attendu, avec des runners de tous les pays du continent.',
    startDate: '2025-08-10T00:00:00Z',
    endDate: '2025-08-17T23:59:59Z',
    website: 'https://esa-speedrunning.com',
    location: 'Malmö, Suède',
    isOnline: false
  },
  {
    id: '3',
    name: 'Awesome Games Done Quick 2025',
    description: 'Le premier événement de l\'année pour commencer 2025 en beauté avec les meilleurs speedrunners.',
    startDate: '2025-01-05T00:00:00Z',
    endDate: '2025-01-12T23:59:59Z',
    website: 'https://gamesdonequick.com',
    location: 'Orlando, Floride',
    isOnline: false
  },
  {
    id: '4',
    name: 'Speedrun Marathon Online',
    description: 'Un événement 100% en ligne ouvert à tous les speedrunners du monde entier.',
    startDate: '2025-03-20T00:00:00Z',
    endDate: '2025-03-27T23:59:59Z',
    website: 'https://speedrunmarathon.com',
    isOnline: true
  }
];

// Fonction utilitaire pour formater les dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (startDate.getFullYear() === endDate.getFullYear() && 
      startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}-${endDate.getDate()} ${endDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
  }
  
  return `${formatDate(start)} - ${formatDate(end)}`;
};

// Composant pour une carte d'événement
const EventCard = ({ event }: { event: Event }) => {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const isUpcoming = startDate > now;
  const isOngoing = startDate <= now && endDate >= now;
  const isPast = endDate < now;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex-1">
            {event.name}
          </h3>
          <div className="ml-4">
            {isUpcoming && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                À venir
              </span>
            )}
            {isOngoing && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                En cours
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Terminé
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateRange(event.startDate, event.endDate)}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.isOnline ? 'En ligne' : event.location}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Link 
            href={`/events/${event.id}`}
            className="text-purple-600 hover:text-purple-800 font-medium text-sm"
          >
            Voir détails →
          </Link>
          
          {event.website && (
            <a 
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Site officiel ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Page principale
export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');
  
  const now = new Date();
  const upcomingEvents = MOCK_EVENTS.filter(event => new Date(event.startDate) > now);
  const allEvents = MOCK_EVENTS.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : allEvents;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Événements Speedrun
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Découvrez les marathons, compétitions et événements speedrun du monde entier. 
          Ne manquez aucun événement de la communauté !
        </p>
      </div>
      
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            À venir ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tous les événements ({allEvents.length})
          </button>
        </div>
      </div>
      
      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      {displayedEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun événement trouvé
          </h3>
          <p className="text-gray-600">
            {activeTab === 'upcoming' 
              ? 'Aucun événement prévu pour le moment. Revenez bientôt !'
              : 'Aucun événement disponible.'
            }
          </p>
        </div>
      )}
    </div>
  );
} 