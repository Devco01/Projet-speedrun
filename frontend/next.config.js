/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      'speedrun-backend.onrender.com'
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  
  // Configuration pour masquer les erreurs d'hydratation
  reactStrictMode: false,
  experimental: {
    suppressHydrationWarning: true,
  },
  
  // Supprimer complètement les console.error en production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? true : false,
  },
}

module.exports = nextConfig 