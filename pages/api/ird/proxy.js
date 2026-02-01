// Importaciones dinámicas para evitar problemas en build
const cheerio = require('cheerio');

// Cache simple en memoria
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(200).json({
      name: 'I.R.D. Proxy API',
      status: 'operational',
      version: '1.0',
      method: 'Use POST with { "url": "https://efootballhub.net/..." }'
    });
  }

  try {
    const { url } = req.body;
    
    if (!url || !url.includes('efootballhub.net')) {
      return res.status(400).json({
        success: false,
        error: 'Solo se permiten URLs de efootballhub.net'
      });
    }

    // Verificar caché
    const cacheKey = `scrape:${url}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.status(200).json({
        ...cached.data,
        cached: true,
        cache: 'HIT'
      });
    }

    // Hacer scraping
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; I.R.D.-Scraper/1.0)'
      },
      timeout: 8000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('title').text() || 'Sin título';
    const links = $('a').length;
    const images = $('img').length;

    const result = {
      success: true,
      url: response.url,
      data: {
        title,
        stats: {
          links,
          images,
          size: html.length
        },
        htmlPreview: html.substring(0, 500) + '...'
      },
      timestamp: new Date().toISOString()
    };

    // Guardar en caché
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.status(200).json({
      ...result,
      cache: 'MISS'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error en el scraping',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
        }
