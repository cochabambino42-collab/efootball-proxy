/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para producción
  reactStrictMode: true,
  swcMinify: true,
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
  
  // Redirecciones
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ird-dashboard',
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
