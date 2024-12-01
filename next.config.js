/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['www.alphavantage.co'],
  },
}

module.exports = nextConfig

