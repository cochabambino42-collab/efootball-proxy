// Rotación de User-Agents para evitar bloqueos
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

// Cache mejorado
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

// Limpieza automática de cache cada hora
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60 * 60 * 1000);

export default async function handler(req, res) {
  // HEADERS para CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Manejar OPTIONS para CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(200).json({
      name: 'I.R.D. Proxy API v2.0',
      status: 'operational',
      version: '2.0',
      message: 'Use POST with { "url": "https://efootballhub.net/..." }',
      endpoints: {
        'POST /': 'Scrape efootballhub.net URLs',
        'GET /': 'Documentación'
      },
      features: ['caching', 'user-agent-rotation', 'timeout-8s']
    });
  }

  try {
    const { url } = req.body;
    
    // Validación mejorada
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL no proporcionada o formato incorrecto',
        example: { url: 'https://efootballhub.net/' }
      });
    }

    if (!url.includes('efootballhub.net')) {
      return res.status(400).json({
        success: false,
        error: 'Solo se permiten URLs de efootballhub.net',
        received: url,
        expected: 'Dominio: efootballhub.net'
      });
    }

    // Verificar caché
    const cacheKey = `scrape:${url}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.status(200).json({
        ...cached.data,
        cached: true,
        cache: 'HIT',
        timestamp: new Date().toISOString(),
        performance: 'cached_response'
      });
    }

    // Seleccionar User-Agent aleatorio
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    // Hacer scraping con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': randomUserAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Extracción mejorada con expresiones regulares (sin cheerio para simplificar)
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Sin título';
      
      const links = (html.match(/<a\s+/gi) || []).length;
      const images = (html.match(/<img\s+/gi) || []).length;
      const scripts = (html.match(/<script\s+/gi) || []).length;
      const styles = (html.match(/<link.*?rel="stylesheet".*?>/gi) || []).length;

      const result = {
        success: true,
        url: response.url,
        data: {
          title,
          stats: {
            links,
            images,
            scripts,
            styles,
            size: html.length,
            size_kb: Math.round(html.length / 1024 * 100) / 100
          },
          metadata: {
            userAgent: randomUserAgent.substring(0, 50) + '...',
            responseTime: Date.now() - req.startTime || 'N/A',
            encoding: response.headers.get('content-type') || 'unknown'
          },
          htmlPreview: html.substring(0, 800) + (html.length > 800 ? '...' : '')
        },
        timestamp: new Date().toISOString()
      };

      // Guardar en caché
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      // Estadísticas de caché
      const cacheStats = {
        totalItems: cache.size,
        maxAge: CACHE_TTL,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
      };

      res.status(200).json({
        ...result,
        cache: 'MISS',
        cacheStats,
        performance: 'fresh_scrape'
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    console.error('I.R.D. Proxy Error:', error);
    
    let errorType = 'unknown';
    let errorMessage = error.message;
    
    if (error.name === 'AbortError') {
      errorType = 'timeout';
      errorMessage = 'La solicitud tardó demasiado (timeout de 8 segundos)';
    } else if (error.message.includes('HTTP')) {
      errorType = 'http_error';
    } else if (error.message.includes('fetch')) {
      errorType = 'network_error';
    }

    res.status(500).json({
      success: false,
      error: 'Error en el scraping',
      errorType,
      details: errorMessage,
      timestamp: new Date().toISOString(),
      recommendation: 'Intenta de nuevo en 30 segundos o usa otra URL'
    });
  }
}

// Middleware para medir tiempo
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
