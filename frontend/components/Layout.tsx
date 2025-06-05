import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Speedrun Platform' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Plateforme de speedrunning - TP DWWM" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation principale */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl">🏃‍♂️</span>
                  <span className="text-xl font-bold text-gray-900">SpeedrunSchedule</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Accueil
                </Link>
                <Link 
                  href="/games" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Jeux
                </Link>
                <Link 
                  href="/events" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Événements
                </Link>
                <Link 
                  href="/leaderboards" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Classements
                </Link>
                <Link 
                  href="/login" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Connexion
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Contenu principal */}
        <main>
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-sm text-gray-400">
                © 2025 SpeedrunSchedule - Projet TP DWWM
              </p>
              <div className="mt-4">
                <Link 
                  href="/admin/login" 
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  title="Administration"
                >
                  ⚙️
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 