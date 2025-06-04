'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // À remplacer par un vrai state d'authentification

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-purple-700">SpeedRun</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link href="/leaderboards" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                Classements
              </Link>
              <Link href="/activity" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                Activité
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                Événements
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                À propos
              </Link>
            </nav>
          </div>
          
          <div className="hidden md:flex items-center">
            <div className="relative ml-4">
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {isLoggedIn ? (
              <div className="ml-4 flex items-center">
                <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                  Tableau de bord
                </Link>
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="ml-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Déconnexion
                </button>
                <Link href="/profile" className="ml-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                    US
                  </div>
                </Link>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-purple-600 text-sm font-medium">
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/leaderboards" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-600">
            Classements
          </Link>
          <Link href="/activity" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-600">
            Activité
          </Link>
          <Link href="/events" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-600">
            Événements
          </Link>
          <Link href="/about" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-600">
            À propos
          </Link>
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="block text-gray-700 hover:text-purple-600 text-base font-medium">
                  Tableau de bord
                </Link>
                <Link href="/profile" className="block text-gray-700 hover:text-purple-600 text-base font-medium">
                  Profil
                </Link>
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-base font-medium"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <Link 
                  href="/login" 
                  className="block w-full text-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-base font-medium"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-base font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 