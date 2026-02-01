import { NextResponse } from 'next/server';

// Cache simple
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

export async function POST(request) {
  try {
    const { url } = await request.json();
    
    // Validaciones básicas
    if (!url || !url.includes('efootballhub.net')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'URL requerida y debe ser de efootballhub.net',
          example: 'https://efootballhub.net/' 
        },
        { status: 400 }
      );
    }

    // Verificar caché
    const cacheKey = url;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json({
        ...cached.data,
        cache: 'HIT',
        cached_at: new Date(cached.timestamp).toISOString()
      });
    }

    // HEADERS COMPLETOS PARA EVITAR BLOQUEOS
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'Referer': 'https://www.google.com/'
    };

    const startTime = Date.now();
    
    // Fetch con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers,
      signal: controller.signal,
      redirect: 'follow'
    }).catch(err => {
      if (err.name === 'AbortError') {
        throw new Error('Timeout: La página tardó más de 10 segundos');
      }
      throw err;
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const responseTime = Date.now() - startTime;

    // ANÁLISIS SIMPLE PERO ROBUSTO
    let title = 'Sin título';
    let description = '';
    let pageType = 'general';
    
    // Método 1: Regex mejorado para título
    const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/i;
    const titleMatch = html.match(titleRegex);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1]
        .replace(/<[^>]*>/g, '')
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200);
    }
    
    // Método 2: Buscar en h1 si título falla
    if (title === 'Sin título') {
      const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
      const h1Match = html.match(h1Regex);
      if (h1Match && h1Match[1]) {
        title = h1Match[1]
          .replace(/<[^>]*>/g, '')
          .trim()
          .substring(0, 200);
      }
    }
    
    // Método 3: Detectar tipo de página por URL
    if (url.includes('/player')) pageType = 'player_page';
    else if (url.includes('/team')) pageType = 'team_page';
    else if (url.includes('/tactic')) pageType = 'tactic_page';
    else if (url === 'https://efootballhub.net/') pageType = 'homepage';
    
    // Contar elementos simples
    const linkCount = (html.match(/<a\s+[^>]*href=/gi) || []).length;
    const imageCount = (html.match(/<img\s+/gi) || []).length;
    const tableCount = (html.match(/<table\s+/gi) || []).length;
    
    // Extraer algunos enlaces importantes
    const importantLinks = [];
    const linkRegex = /<a\s+[^>]*?href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let linkMatch;
    let linksCollected = 0;
    
    while ((linkMatch = linkRegex.exec(html)) !== null && linksCollected < 10) {
      const href = linkMatch[1];
      let text = linkMatch[2].replace(/<[^>]*>/g, '').trim();
      
      if (text && href && text.length > 3 && text.length < 100) {
        importantLinks.push({
          text: text.substring(0, 80),
          href: href.startsWith('http') ? href : new URL(href, url).href,
          length: text.length
        });
        linksCollected++;
      }
    }
    
    // Resultado estructurado
    const result = {
      success: true,
      url: response.url,
      data: {
        metadata: {
          title,
          description,
          page_type: pageType,
          extraction_method: 'robust_regex',
          url_analyzed: url
        },
        statistics: {
          links: linkCount,
          images: imageCount,
          tables: tableCount,
          size_bytes: html.length,
          size_kb: Math.round(html.length / 1024)
        },
        structured_data: {
          important_links: importantLinks,
          detected_page_type: pageType
        },
        raw_preview: {
          html_first_500: html.substring(0, 500),
          text_first_500: html.replace(/<[^>]*>/g, ' ').substring(0, 500).trim()
        }
      },
      performance: {
        response_time_ms: responseTime,
        user_agent_used: headers['User-Agent'].substring(0, 60),
        cache_status: 'MISS',
        extraction_method: 'robust_regex_no_cheerio'
      },
      timestamp: new Date().toISOString(),
      version: '4.0',
      system: 'app_router_simple'
    };

    // Guardar en caché
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // Limpiar caché viejo
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return NextResponse.json({
      ...result,
      cache: 'MISS',
      cache_info: {
        items_in_cache: cache.size,
        ttl_minutes: 30
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        error_type: error.name,
        timestamp: new Date().toISOString(),
        recommendation: 'Verifica la URL y prueba con https://efootballhub.net/',
        version: '4.0'
      },
      { status: 500 }
    );
  }
}

// También soportar GET para documentación
export async function GET() {
  return NextResponse.json({
    name: 'I.R.D. Proxy API v4.0',
    description: 'API simple y robusta para efootballhub.net (sin cheerio)',
    version: '4.0',
    status: 'operational',
    endpoints: {
      'POST /': 'Extraer datos de efootballhub.net',
      'GET /': 'Esta documentación'
    },
    features: [
      'Extracción robusta con regex mejorado',
      'Cache automático (30 minutos)',
      'Headers anti-bloqueo',
      'Timeout 10 segundos',
      'Sin dependencias externas'
    ],
    example: {
      method: 'POST',
      body: { url: 'https://efootballhub.net/' }
    }
  });
        }
