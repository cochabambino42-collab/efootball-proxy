export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    service: 'I.R.D. Proxy System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      proxy: '/api/ird/proxy',
      dashboard: '/ird-dashboard'
    },
    architecture: 'Pages Router API + App Router Dashboard'
  });
}
