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
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    suppressHydrationWarning: true
  },
  onError: (err) => {
    if (
      process.env.NODE_ENV === 'production' && 
      err.message && 
      (err.message.includes('Minified React error #425') ||
       err.message.includes('Minified React error #418') ||
       err.message.includes('Minified React error #423'))
    ) {
      return
    }
  }
}

module.exports = nextConfig 