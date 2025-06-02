'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Types
type Game = {
  id: string;
  title: string;
};

type Category = {
  id: string;
  name: string;
  gameId: string;
};

// Composant principal
export default function SubmitRunPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId');
  
  // États
  const [isLoading, setIsLoading] = useState(false);
  const [games] = useState<Game[]>([
    { id: '1', title: 'Super Mario 64' },
    { id: '2', title: 'The Legend of Zelda: Ocarina of Time' },
    { id: '3', title: 'Hollow Knight' },
    { id: '4', title: 'Celeste' },
    { id: '5', title: 'Dark Souls' },
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    gameId: gameIdParam || '',
    categoryId: '',
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    videoUrl: '',
    comment: '',
    platform: '',
    emulator: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Chargement des catégories en fonction du jeu sélectionné
  useEffect(() => {
    if (formData.gameId) {
      // Simuler un appel API pour récupérer les catégories
      const mockCategories: Category[] = [
        { id: '1', name: '120 étoiles', gameId: '1' },
        { id: '2', name: '70 étoiles', gameId: '1' },
        { id: '3', name: '16 étoiles', gameId: '1' },
        { id: '4', name: '0 étoile', gameId: '1' },
        { id: '5', name: 'Any%', gameId: '2' },
        { id: '6', name: '100%', gameId: '2' },
        { id: '7', name: 'All Bosses', gameId: '3' },
        { id: '8', name: 'Any%', gameId: '3' },
        { id: '9', name: 'Any%', gameId: '4' },
        { id: '10', name: 'All B-Sides', gameId: '4' },
        { id: '11', name: 'All Bosses', gameId: '5' },
        { id: '12', name: 'Any%', gameId: '5' },
      ];
      
      // Filtrer les catégories par jeu
      const filteredCategories = mockCategories.filter(
        category => category.gameId === formData.gameId
      );
      
      setCategories(filteredCategories);
      setFormData(prev => ({ ...prev, categoryId: '' })); // Réinitialiser la catégorie
    }
  }, [formData.gameId]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.gameId) {
      newErrors.gameId = 'Veuillez sélectionner un jeu';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Veuillez sélectionner une catégorie';
    }
    
    const totalTime = 
      formData.hours * 3600000 + 
      formData.minutes * 60000 + 
      formData.seconds * 1000 + 
      formData.milliseconds;
      
    if (totalTime <= 0) {
      newErrors.time = 'Le temps doit être supérieur à 0';
    }
    
    if (!formData.videoUrl) {
      newErrors.videoUrl = 'L\'URL de la vidéo est requise';
    } else if (!/^(https?:\/\/)?(www\.)?(youtube\.com|twitch\.tv|youtu\.be)/.test(formData.videoUrl)) {
      newErrors.videoUrl = 'L\'URL doit provenir de YouTube ou Twitch';
    }
    
    if (!formData.platform) {
      newErrors.platform = 'Veuillez sélectionner une plateforme';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      // Simuler un appel API
      setTimeout(() => {
        setIsLoading(false);
        setSubmitSuccess(true);
        
        // Rediriger vers la page du jeu après quelques secondes
        setTimeout(() => {
          router.push(`/games/${formData.gameId}`);
        }, 3000);
      }, 1500);
    }
  };

  // Gestion des changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'hours' || name === 'minutes' || name === 'seconds' || name === 'milliseconds'
          ? parseInt(value) || 0
          : value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/games" className="text-purple-600 hover:text-purple-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au catalogue
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Soumettre un nouveau record</h1>
      
      {submitSuccess ? (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Votre record a été soumis avec succès ! Vous allez être redirigé vers la page du jeu.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Sélection du jeu */}
            <div>
              <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-1">
                Jeu <span className="text-red-500">*</span>
              </label>
              <select
                id="gameId"
                name="gameId"
                value={formData.gameId}
                onChange={handleChange}
                className={`block w-full border ${errors.gameId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500`}
              >
                <option value="">Sélectionner un jeu</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.title}
                  </option>
                ))}
              </select>
              {errors.gameId && (
                <p className="mt-1 text-sm text-red-600">{errors.gameId}</p>
              )}
            </div>
            
            {/* Sélection de la catégorie */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={!formData.gameId}
                className={`block w-full border ${errors.categoryId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 ${!formData.gameId ? 'bg-gray-100' : ''}`}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
              {!formData.gameId && (
                <p className="mt-1 text-sm text-gray-500">Veuillez d&apos;abord sélectionner un jeu</p>
              )}
            </div>
            
            {/* Temps du run */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temps <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor="hours" className="sr-only">Heures</label>
                  <div className="flex">
                    <input
                      type="number"
                      id="hours"
                      name="hours"
                      min="0"
                      max="999"
                      value={formData.hours}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-l-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-center"
                    />
                    <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      h
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="minutes" className="sr-only">Minutes</label>
                  <div className="flex">
                    <input
                      type="number"
                      id="minutes"
                      name="minutes"
                      min="0"
                      max="59"
                      value={formData.minutes}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 text-center"
                    />
                    <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      m
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="seconds" className="sr-only">Secondes</label>
                  <div className="flex">
                    <input
                      type="number"
                      id="seconds"
                      name="seconds"
                      min="0"
                      max="59"
                      value={formData.seconds}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 text-center"
                    />
                    <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      s
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="milliseconds" className="sr-only">Millisecondes</label>
                  <div className="flex">
                    <input
                      type="number"
                      id="milliseconds"
                      name="milliseconds"
                      min="0"
                      max="999"
                      step="1"
                      value={formData.milliseconds}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-r-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-center"
                    />
                    <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                      ms
                    </span>
                  </div>
                </div>
              </div>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>
            
            {/* URL de la vidéo */}
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL de la vidéo <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`block w-full border ${errors.videoUrl ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500`}
              />
              {errors.videoUrl ? (
                <p className="mt-1 text-sm text-red-600">{errors.videoUrl}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Lien YouTube ou Twitch où votre run peut être visionné
                </p>
              )}
            </div>
            
            {/* Plateforme */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                Plateforme <span className="text-red-500">*</span>
              </label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className={`block w-full border ${errors.platform ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500`}
              >
                <option value="">Sélectionner une plateforme</option>
                <option value="PC">PC</option>
                <option value="Nintendo Switch">Nintendo Switch</option>
                <option value="PlayStation 5">PlayStation 5</option>
                <option value="PlayStation 4">PlayStation 4</option>
                <option value="Xbox Series X/S">Xbox Series X/S</option>
                <option value="Xbox One">Xbox One</option>
                <option value="Nintendo 64">Nintendo 64</option>
                <option value="Super Nintendo">Super Nintendo</option>
                <option value="Other">Autre</option>
              </select>
              {errors.platform && (
                <p className="mt-1 text-sm text-red-600">{errors.platform}</p>
              )}
            </div>
            
            {/* Émulateur */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emulator"
                name="emulator"
                checked={formData.emulator}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="emulator" className="ml-2 block text-sm text-gray-700">
                J&apos;ai utilisé un émulateur
              </label>
            </div>
            
            {/* Commentaire */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire (optionnel)
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={4}
                value={formData.comment}
                onChange={handleChange}
                placeholder="Partagez des détails sur votre run, techniques utilisées, difficultés rencontrées..."
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            {/* Bouton de soumission */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Soumission en cours...
                  </>
                ) : (
                  'Soumettre mon record'
                )}
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Les champs marqués d&apos;un <span className="text-red-500">*</span> sont obligatoires.</p>
              <p className="mt-1">Votre soumission sera examinée par des modérateurs avant d&apos;être ajoutée au classement.</p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 