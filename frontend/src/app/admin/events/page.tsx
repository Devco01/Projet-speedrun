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
  createdAt: string;
};

// Données fictives pour l'exemple
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Summer Games Done Quick 2025',
    description: 'La plus grande marathon caritative de speedruns au monde.',
    startDate: '2025-07-15T00:00:00Z',
    endDate: '2025-07-22T23:59:59Z',
    website: 'https://gamesdonequick.com',
    location: 'Bloomington, Minnesota',
    isOnline: false,
    createdAt: '2024-12-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'European Speedrunner Assembly 2025',
    description: 'L\'événement européen de speedruns le plus attendu.',
    startDate: '2025-08-10T00:00:00Z',
    endDate: '2025-08-17T23:59:59Z',
    website: 'https://esa-speedrunning.com',
    location: 'Malmö, Suède',
    isOnline: false,
    createdAt: '2024-11-15T14:30:00Z'
  },
  {
    id: '3',
    name: 'Speedrun Marathon Online',
    description: 'Un événement 100% en ligne ouvert à tous.',
    startDate: '2025-03-20T00:00:00Z',
    endDate: '2025-03-27T23:59:59Z',
    website: 'https://speedrunmarathon.com',
    isOnline: true,
    createdAt: '2024-12-10T09:15:00Z'
  }
];

// Fonction utilitaire pour formater les dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Composant Modal pour créer/éditer un événement
const EventModal = ({ 
  isOpen, 
  onClose, 
  event = null,
  onSave 
}: {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  onSave: (event: Partial<Event>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: event?.name || '',
    description: event?.description || '',
    startDate: event?.startDate ? event.startDate.substring(0, 16) : '',
    endDate: event?.endDate ? event.endDate.substring(0, 16) : '',
    website: event?.website || '',
    location: event?.location || '',
    isOnline: event?.isOnline || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {event ? "Modifier l'événement" : "Créer un événement"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l&apos;événement *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Ex: Summer Games Done Quick 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Description de l&apos;événement..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="https://exemple.com"
              />
            </div>

            <div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isOnline"
                  checked={formData.isOnline}
                  onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isOnline" className="ml-2 block text-sm text-gray-900">
                  Événement en ligne
                </label>
              </div>

              {!formData.isOnline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Ville, Pays"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                {event ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les événements
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Partial<Event>) => {
    if (editingEvent) {
      // Modifier un événement existant
      setEvents(events.map(e => 
        e.id === editingEvent.id ? { ...e, ...eventData } : e
      ));
    } else {
      // Créer un nouvel événement
      const newEvent: Event = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...eventData
      } as Event;
      setEvents([...events, newEvent]);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (startDate > now) return { label: 'À venir', color: 'bg-blue-100 text-blue-800' };
    if (startDate <= now && endDate >= now) return { label: 'En cours', color: 'bg-green-100 text-green-800' };
    return { label: 'Terminé', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des événements</h1>
            <p className="mt-2 text-gray-600">
              Créez, modifiez et gérez les événements speedrun de votre plateforme.
            </p>
          </div>
          <button
            onClick={handleCreateEvent}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Créer un événement
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><Link href="/admin" className="hover:text-purple-600">Administration</Link></li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Événements
          </li>
        </ol>
      </nav>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total événements</h3>
          <p className="text-2xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">À venir</h3>
          <p className="text-2xl font-bold text-blue-600">
            {events.filter(e => new Date(e.startDate) > new Date()).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">En cours</h3>
          <p className="text-2xl font-bold text-green-600">
            {events.filter(e => {
              const now = new Date();
              return new Date(e.startDate) <= now && new Date(e.endDate) >= now;
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Terminés</h3>
          <p className="text-2xl font-bold text-gray-600">
            {events.filter(e => new Date(e.endDate) < new Date()).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <input
              type="text"
              placeholder="Rechercher des événements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Événement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lieu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => {
                const status = getEventStatus(event);
                return (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {event.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>Du {formatDate(event.startDate)}</div>
                      <div>au {formatDate(event.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {event.isOnline ? 'En ligne' : event.location}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(event.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier événement.</p>
            <button
              onClick={handleCreateEvent}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
              Créer un événement
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={editingEvent}
        onSave={handleSaveEvent}
      />
    </div>
  );
} 