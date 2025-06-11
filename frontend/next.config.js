/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'localhost'
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  // Désactiver le strict mode pour éviter les erreurs d'hydratation amplifiées
  reactStrictMode: false,
  swcMinify: true,
  // Optimisations pour éviter les erreurs d'hydratation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  experimental: {
    suppressHydrationWarning: true,
    // Désactiver l'optimisation SSR qui peut causer des problèmes
    esmExternals: false
  }
}

module.exports = nextConfig 