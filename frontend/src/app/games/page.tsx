'use client';

import { useState } from 'react';
import Link from 'next/link';

// Types
type Game = {
  id: string;
  title: string;
  cover: string;
  platform: string[];
  genre: string[];
  runCount: number;
};

// Données fictives pour l'exemple
const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: 'Super Mario 64',
    cover: '/images/games/mario64.jpg',
    platform: ['Nintendo 64', 'Nintendo Switch'],
    genre: ['Platformer', '3D'],
    runCount: 1245
  },
  {
    id: '2',
    title: 'The Legend of Zelda: Ocarina of Time',
    cover: '/images/games/zelda-oot.jpg',
    platform: ['Nintendo 64', 'Nintendo 3DS'],
    genre: ['Action-Adventure', 'RPG'],
    runCount: 987
  },
  {
    id: '3',
    title: 'Hollow Knight',
    cover: '/images/games/hollow-knight.jpg',
    platform: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    genre: ['Metroidvania', 'Action'],
    runCount: 654
  },
  {
    id: '4',
    title: 'Celeste',
    cover: '/images/games/celeste.jpg',
    platform: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    genre: ['Platformer', 'Indie'],
    runCount: 432
  },
  {
    id: '5',
    title: 'Dark Souls',
    cover: '/images/games/dark-souls.jpg',
    platform: ['PC', 'PlayStation 3', 'Xbox 360'],
    genre: ['Action RPG', 'Souls-like'],
    runCount: 876
  },
  {
    id: '6',
    title: 'Minecraft',
    cover: '/images/games/minecraft.jpg',
    platform: ['PC', 'Console', 'Mobile'],
    genre: ['Sandbox', 'Survival'],
    runCount: 543
  },
  {
    id: '7',
    title: 'Portal 2',
    cover: '/images/games/portal2.jpg',
    platform: ['PC', 'PlayStation 3', 'Xbox 360'],
    genre: ['Puzzle', 'First-Person'],
    runCount: 321
  },
  {
    id: '8',
    title: 'Hades',
    cover: '/images/games/hades.jpg',
    platform: ['PC', 'Nintendo Switch', 'PlayStation', 'Xbox'],
    genre: ['Roguelike', 'Action'],
    runCount: 198
  },
];

// Composant pour le filtre
const FilterSection = ({ 
  title, 
  options, 
  selectedOptions, 
  onChange 
}: { 
  title: string; 
  options: string[]; 
  selectedOptions: string[]; 
  onChange: (option: string) => void; 
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map(option => (
          <div key={option} className="flex items-center">
            <input
              id={`filter-${title.toLowerCase()}-${option}`}
              name={`${title.toLowerCase()}[]`}
              value={option}
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => onChange(option)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label
              htmlFor={`filter-${title.toLowerCase()}-${option}`}
              className="ml-3 text-sm text-gray-600"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// Page principale
export default function GamesPage() {
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'runCount'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extraire toutes les plateformes et genres uniques des jeux
  const allPlatforms = Array.from(new Set(MOCK_GAMES.flatMap(game => game.platform)));
  const allGenres = Array.from(new Set(MOCK_GAMES.flatMap(game => game.genre)));

  // Fonction pour filtrer et trier les jeux
  const getFilteredGames = () => {
    return MOCK_GAMES
      .filter(game => {
        // Filtre par recherche
        if (searchQuery && !game.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Filtre par plateforme
        if (selectedPlatforms.length > 0 && !game.platform.some(p => selectedPlatforms.includes(p))) {
          return false;
        }
        
        // Filtre par genre
        if (selectedGenres.length > 0 && !game.genre.some(g => selectedGenres.includes(g))) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Tri par titre ou nombre de runs
        if (sortBy === 'title') {
          return sortOrder === 'asc' 
            ? a.title.localeCompare(b.title) 
            : b.title.localeCompare(a.title);
        } else {
          return sortOrder === 'asc' 
            ? a.runCount - b.runCount 
            : b.runCount - a.runCount;
        }
      });
  };

  const filteredGames = getFilteredGames();

  // Gestionnaires d'événements pour les filtres
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'title-asc') {
      setSortBy('title');
      setSortOrder('asc');
    } else if (value === 'title-desc') {
      setSortBy('title');
      setSortOrder('desc');
    } else if (value === 'popularity-asc') {
      setSortBy('runCount');
      setSortOrder('asc');
    } else if (value === 'popularity-desc') {
      setSortBy('runCount');
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Catalogue de jeux</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtres */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Filtres</h2>
            
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher
              </label>
              <input
                type="text"
                id="search"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Nom du jeu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <FilterSection
              title="Plateformes"
              options={allPlatforms}
              selectedOptions={selectedPlatforms}
              onChange={togglePlatform}
            />

            <FilterSection
              title="Genres"
              options={allGenres}
              selectedOptions={selectedGenres}
              onChange={toggleGenre}
            />
            
            <button
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium"
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatforms([]);
                setSelectedGenres([]);
                setSortBy('title');
                setSortOrder('asc');
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
        
        {/* Liste de jeux */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {filteredGames.length} {filteredGames.length === 1 ? 'jeu' : 'jeux'} trouvé{filteredGames.length === 1 ? '' : 's'}
            </p>
            
            <div className="flex items-center">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700 mr-2">
                Trier par:
              </label>
              <select
                id="sort"
                className="border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={`${sortBy}-${sortOrder}`}
                onChange={handleSortChange}
              >
                <option value="title-asc">Titre (A-Z)</option>
                <option value="title-desc">Titre (Z-A)</option>
                <option value="popularity-desc">Popularité (décroissante)</option>
                <option value="popularity-asc">Popularité (croissante)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <Link href={`/games/${game.id}`} key={game.id} className="group">
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
                  <div className="h-48 bg-gray-200 relative">
                    {/* Ici, on afficherait normalement l'image de couverture */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 group-hover:scale-105 transition-transform">
                      {game.title}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                      {game.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {game.platform.slice(0, 2).map(platform => (
                        <span key={platform} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {platform}
                        </span>
                      ))}
                      {game.platform.length > 2 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          +{game.platform.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {game.genre.map(genre => (
                        <span key={genre} className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {genre}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                      </svg>
                      {game.runCount} runs
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {filteredGames.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun jeu trouvé</h3>
              <p className="text-gray-600">
                Essayez de modifier vos filtres ou de réinitialiser votre recherche.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 