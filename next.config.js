/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilita App Router
  experimental: {
    appDir: true,
  },
  // Para cheerio
  serverExternalPackages: ['cheerio'],
  // Asegurar que las API routes funcionen
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('cheerio');
    }
    return config;
  }
};

module.exports = nextConfig;
