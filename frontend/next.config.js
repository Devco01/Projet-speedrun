/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'localhost'
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  }
}

module.exports = nextConfig 