import { NextResponse } from 'next/server';
import { IRD_CONFIG } from '@/lib/ird-config';
import { irdScraper } from '@/lib/ird-scraper';

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

    const result = await irdScraper.scrape(url);

    return NextResponse.json({
      ...result,
      cache: result.cached ? 'HIT' : 'MISS'
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
