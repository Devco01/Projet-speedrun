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
  
  // Configuration pour éviter les erreurs d'hydratation en production
  reactStrictMode: false,
  experimental: {
    suppressHydrationWarning: true,
  },
  
  // Optimisations spécifiques production vs développement
  swcMinify: process.env.NODE_ENV === 'production',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  
  // Configuration pour stabiliser l'hydratation
  productionBrowserSourceMaps: false,
  optimizeFonts: false,
}

module.exports = nextConfig 