import { NextResponse } from 'next/server';
import { IRD_CONFIG } from '@/lib/ird-config';  // Si este existe
// Si ird-scraper no existe, pero tienes otro, ajusta:
// import { irdScraper } from '@/lib/ird-scraper-engine';

export async function POST(request) {
  try {
    const { url } = await request.json();
    
    if (!url || !url.includes(IRD_CONFIG.TARGET_DOMAIN)) {
      return NextResponse.json(
        { 
          success: false,
          error: `Solo se permiten URLs de ${IRD_CONFIG.TARGET_DOMAIN}` 
        },
        { status: 400 }
      );
    }

    // TEMPORAL: Respuesta simulada hasta que tengamos el scraper real
    return NextResponse.json({
      success: true,
      message: 'API I.R.D. funcionando. Scraper en desarrollo.',
      url: url,
      data: {
        title: 'Página de prueba - efootballhub.net',
        stats: {
          links: 15,
          images: 8,
          size: 10240
        },
        htmlPreview: '<html>... Vista previa del scraping ...</html>'
      },
      cache: 'MISS',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'I.R.D. Proxy API',
    status: 'operational',
    version: '1.0',
    endpoints: {
      'POST /': 'Scrape efootballhub.net URLs',
      'GET /': 'Documentación'
    }
  });
}
export async function GET() {
  return NextResponse.json({
    name: 'I.R.D. Proxy API',
    status: 'operational',
    version: '1.0',
    endpoints: {
      'POST /': 'Scrape efootballhub.net URLs',
      'GET /': 'Documentación'
    }
  });
    }
