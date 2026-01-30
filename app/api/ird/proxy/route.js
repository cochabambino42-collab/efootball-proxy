import { NextResponse } from 'next/server';
import { IRD_CONFIG } from '@/lib/ird-config';

export async function POST(request) {
  try {
    const { url } = await request.json();
    
    if (!url || !url.includes(IRD_CONFIG.TARGET_DOMAIN)) {
      return NextResponse.json(
        { error: `Solo se permiten URLs de ${IRD_CONFIG.TARGET_DOMAIN}` },
        { status: 400 }
      );
    }

    // Simulación de respuesta exitosa (luego la implementaremos completa)
    return NextResponse.json({
      success: true,
      message: 'API I.R.D. operativa. Pronto tendrás scraping real.',
      config: IRD_CONFIG
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor I.R.D.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'I.R.D. Proxy API',
    status: 'operational',
    version: '1.0',
    documentation: 'Usa POST con { "url": "https://efootballhub.net/..." }'
  });
}j
