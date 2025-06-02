'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Types
type GameDetails = {
  id: string;
  title: string;
  cover: string;
  description: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  platform: string[];
  genre: string[];
  website?: string;
};

type Category = {
  id: string;
  name: string;
  rules: string;
  runCount: number;
};

type Run = {
  id: string;
  rank: number;
  time: number;
  player: {
    id: string;
    username: string;
    country?: string;
  };
  date: string;
  videoUrl?: string;
  verified: boolean;
};

// Données fictives
const MOCK_GAME: GameDetails = {
  id: '1',
  title: 'Super Mario 64',
  cover: '/images/games/mario64.jpg',
  description: 'Super Mario 64 est un jeu de plateforme 3D développé par Nintendo et sorti en 1996. Le joueur contrôle Mario dans diverses missions pour récupérer des Power Stars et sauver la princesse Peach de Bowser.',
  releaseDate: '1996-06-23',
  developer: 'Nintendo EAD',
  publisher: 'Nintendo',
  platform: ['Nintendo 64', 'Nintendo DS', 'Nintendo Switch'],
  genre: ['Platformer', '3D', 'Adventure'],
  website: 'https://www.nintendo.com/games/detail/super-mario-3d-all-stars-switch/'
};

const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: '120 étoiles',
    rules: 'Récupérer toutes les 120 étoiles du jeu et vaincre Bowser.',
    runCount: 256
  },
  {
    id: '2',
    name: '70 étoiles',
    rules: 'Récupérer 70 étoiles et vaincre Bowser.',
    runCount: 378
  },
  {
    id: '3',
    name: '16 étoiles',
    rules: 'Récupérer 16 étoiles et vaincre Bowser en utilisant divers glitches.',
    runCount: 512
  },
  {
    id: '4',
    name: '0 étoile',
    rules: 'Terminer le jeu sans récupérer d\'étoiles en utilisant des techniques avancées de saut mural et des glitches.',
    runCount: 195
  }
];

const MOCK_RUNS: Record<string, Run[]> = {
  '1': [
    {
      id: '101',
      rank: 1,
      time: 6089, // 1h 41m 29s
      player: {
        id: 'p1',
        username: 'Cheese05',
        country: 'US'
      },
      date: '2021-04-15',
      videoUrl: 'https://www.youtube.com/watch?v=example1',
      verified: true
    },
    {
      id: '102',
      rank: 2,
      time: 6116, // 1h 41m 56s
      player: {
        id: 'p2',
        username: 'Puncayshun',
        country: 'US'
      },
      date: '2020-12-03',
      videoUrl: 'https://www.youtube.com/watch?v=example2',
      verified: true
    },
    {
      id: '103',
      rank: 3,
      time: 6183, // 1h 43m 03s
      player: {
        id: 'p3',
        username: 'Simply',
        country: 'US'
      },
      date: '2021-01-28',
      videoUrl: 'https://www.youtube.com/watch?v=example3',
      verified: true
    }
  ],
  '2': [
    {
      id: '201',
      rank: 1,
      time: 2878, // 47m 58s
      player: {
        id: 'p4',
        username: 'Batora',
        country: 'JP'
      },
      date: '2021-05-21',
      videoUrl: 'https://www.youtube.com/watch?v=example4',
      verified: true
    },
    {
      id: '202',
      rank: 2,
      time: 2895, // 48m 15s
      player: {
        id: 'p1',
        username: 'Cheese05',
        country: 'US'
      },
      date: '2021-03-10',
      videoUrl: 'https://www.youtube.com/watch?v=example5',
      verified: true
    },
    {
      id: '203',
      rank: 3,
      time: 2932, // 48m 52s
      player: {
        id: 'p5',
        username: 'Taggo',
        country: 'DE'
      },
      date: '2021-02-14',
      videoUrl: 'https://www.youtube.com/watch?v=example6',
      verified: true
    }
  ],
  '3': [
    {
      id: '301',
      rank: 1,
      time: 898, // 14m 58s
      player: {
        id: 'p6',
        username: 'Suigi',
        country: 'JP'
      },
      date: '2021-06-30',
      videoUrl: 'https://www.youtube.com/watch?v=example7',
      verified: true
    },
    {
      id: '302',
      rank: 2,
      time: 902, // 15m 02s
      player: {
        id: 'p7',
        username: 'Akki',
        country: 'US'
      },
      date: '2021-05-18',
      videoUrl: 'https://www.youtube.com/watch?v=example8',
      verified: true
    },
    {
      id: '303',
      rank: 3,
      time: 907, // 15m 07s
      player: {
        id: 'p8',
        username: 'Weegee',
        country: 'CA'
      },
      date: '2021-06-05',
      videoUrl: 'https://www.youtube.com/watch?v=example9',
      verified: true
    }
  ],
  '4': [
    {
      id: '401',
      rank: 1,
      time: 432, // 7m 12s
      player: {
        id: 'p9',
        username: 'Dowsky',
        country: 'IT'
      },
      date: '2021-07-02',
      videoUrl: 'https://www.youtube.com/watch?v=example10',
      verified: true
    },
    {
      id: '402',
      rank: 2,
      time: 441, // 7m 21s
      player: {
        id: 'p6',
        username: 'Suigi',
        country: 'JP'
      },
      date: '2021-06-10',
      videoUrl: 'https://www.youtube.com/watch?v=example11',
      verified: true
    },
    {
      id: '403',
      rank: 3,
      time: 446, // 7m 26s
      player: {
        id: 'p10',
        username: 'Vallu',
        country: 'FI'
      },
      date: '2021-04-25',
      videoUrl: 'https://www.youtube.com/watch?v=example12',
      verified: true
    }
  ]
};

// Fonctions utilitaires
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  } else {
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Composant principal
export default function GameDetailsPage() {
  // Dans une version réelle, nous utiliserions params.id pour charger les données du jeu
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const params = useParams();
  
  // En production, ces données seraient chargées depuis l'API
  const game = MOCK_GAME;
  const categories = MOCK_CATEGORIES;
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0].id);
  const runs = MOCK_RUNS[selectedCategory] || [];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* En-tête du jeu */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[3/4] bg-gray-200 rounded-lg relative overflow-hidden">
            {/* Ici on afficherait normalement l'image de couverture */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl font-medium">
              {game.title}
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">{game.title}</h1>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Ajouter aux favoris
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {game.platform.map(platform => (
              <span key={platform} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {platform}
              </span>
            ))}
            {game.genre.map(genre => (
              <span key={genre} className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                {genre}
              </span>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date de sortie</h3>
              <p className="text-gray-900">{formatDate(game.releaseDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Développeur</h3>
              <p className="text-gray-900">{game.developer}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Éditeur</h3>
              <p className="text-gray-900">{game.publisher}</p>
            </div>
            {game.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Site web</h3>
                <a href={game.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                  Visiter le site officiel
                </a>
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700">{game.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link href={`/runs/submit?gameId=${game.id}`} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Soumettre un record
            </Link>
            <Link href={`/forum/game/${game.id}`} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">
              Forum du jeu
            </Link>
          </div>
        </div>
      </div>
      
      {/* Section des catégories et des records */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Catégories et classements</h2>
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  selectedCategory === category.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {category.runCount}
                </span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mb-8">
          {categories.find(c => c.id === selectedCategory)?.rules && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">Règles de la catégorie: </span>
                    {categories.find(c => c.id === selectedCategory)?.rules}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joueur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temps
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vidéo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {runs.map(run => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                        run.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        run.rank === 2 ? 'bg-gray-100 text-gray-700' :
                        run.rank === 3 ? 'bg-amber-100 text-amber-700' :
                        'text-gray-500'
                      }`}>
                        {run.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {run.player.country && (
                          <span className="mr-2 text-sm">{run.player.country}</span>
                        )}
                        <Link href={`/users/${run.player.id}`} className="text-gray-900 font-medium hover:text-purple-600">
                          {run.player.username}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-mono font-medium">
                        {formatTime(run.time)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {formatDate(run.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {run.videoUrl ? (
                        <a href={run.videoUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <Link href={`/leaderboards/${game.id}/${selectedCategory}`} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                Voir le classement complet →
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section des runs récents */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Activité récente</h2>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium">US</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        <Link href={`/users/player${i+1}`} className="hover:text-purple-600">
                          Player{i+1}
                        </Link>
                        {' '}a soumis un nouveau record
                      </p>
                      <p className="text-sm text-gray-500">
                        Catégorie: {categories[i].name} - Temps: {formatTime(900 + i*100)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <Link href={`/activity/${game.id}`} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Voir toute l&apos;activité →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 