import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'I.R.D. Proxy System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      proxy: '/api/ird/proxy',
      dashboard: '/ird-dashboard'
    },
    limits: {
      daily_deploys: '100/day (Free Tier)',
      memory: '1024 MB',
      timeout: '10 seconds'
    }
  });
}
