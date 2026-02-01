// Rotación de User-Agents para evitar bloqueos
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

// Cache simple en memoria
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

// Limpieza automática de cache
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }
  }, 60 * 60 * 1000);
}

// IMPORTANTE: Agregar Cheerio
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Documentación para GET
  if (req.method === 'GET') {
    return res.status(200).json({
      name: 'I.R.D. Proxy API v3.1',
      description: 'API optimizada para IA - Extrae datos estructurados de efootballhub.net',
      version: '3.1',
      endpoints: {
        'POST /': 'Scraping con datos estructurados',
        'GET /': 'Esta documentación'
      },
      features: [
        'Extracción de tablas y listas con Cheerio',
        'Datos estructurados para IA',
        'Cache inteligente (30min)',
        '5 User-Agents rotativos',
        'Timeout de 8 segundos'
      ],
      exampleRequest: {
        method: 'POST',
        url: '/api/ird/proxy',
        body: { url: 'https://efootballhub.net/' }
      }
    });
  }

  // Solo POST para scraping
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { url } = req.body;

    // Validaciones
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL requerida',
        example: { url: 'https://efootballhub.net/' }
      });
    }

    if (!url.includes('efootballhub.net')) {
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
        cache: 'HIT',
        timestamp: new Date().toISOString()
      });
    }

    // User-Agent aleatorio
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    // Fetch con timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // USAR CHEERIO EN VEZ DE REGEX
    const $ = cheerio.load(html);
    
    // 1. Extraer título y metadatos básicos CON CHEERIO (robusto)
    const title = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  $('h1').first().text().trim() || 
                  'Sin título';
    
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="og:description"]').attr('content') || 
                       '';
    
    const keywords = $('meta[name="keywords"]').attr('content') || '';

    // 2. Contar elementos CON CHEERIO
    const links = $('a').length;
    const images = $('img').length;
    const tables = $('table').length;
    const lists = $('ul, ol').length;
    const forms = $('form').length;

    // 3. Extraer enlaces importantes CON CHEERIO
    const importantLinks = [];
    $('a').each((i, el) => {
      if (importantLinks.length >= 20) return false;
      
      const href = $(el).attr('href');
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      
      if (text && href && (href.startsWith('http') || href.startsWith('/'))) {
        const fullHref = href.startsWith('http') ? href : new URL(href, url).href;
        
        // Filtrar enlaces importantes
        const footballKeywords = ['player', 'team', 'tactic', 'formation', 'skill', 'rating', 'efootball', 'hub'];
        const hasKeyword = footballKeywords.some(keyword => 
          text.toLowerCase().includes(keyword) || fullHref.toLowerCase().includes(keyword)
        );
        
        if (hasKeyword || text.length > 10) {
          importantLinks.push({
            text: text.substring(0, 100),
            href: fullHref,
            length: text.length
          });
        }
      }
    });

    // 4. Extraer tablas CON CHEERIO
    const tableData = [];
    $('table').each((tableIndex, table) => {
      if (tableIndex >= 3) return false;
      
      const rows = [];
      $(table).find('tr').each((i, row) => {
        if (rows.length >= 10) return false;
        
        const cells = [];
        $(row).find('td, th').each((j, cell) => {
          const cellContent = $(cell).text().trim().replace(/\s+/g, ' ');
          if (cellContent) {
            cells.push(cellContent.substring(0, 200));
          }
        });
        
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
      
      if (rows.length > 0) {
        tableData.push({
          tableIndex: tableIndex,
          rowCount: rows.length,
          sampleRows: rows.slice(0, 3)
        });
      }
    });

    // 5. Construir respuesta optimizada para IA
    const result = {
      success: true,
      url: response.url,
      data: {
        metadata: {
          title,
          description,
          keywords,
          charset: $('meta[charset]').attr('charset') || 'UTF-8'
        },
        statistics: {
          links,
          images,
          tables,
          lists,
          forms,
          size_bytes: html.length,
          size_kb: (html.length / 1024).toFixed(2)
        },
        structured_data: {
          important_links: importantLinks.slice(0, 10),
          tables: tableData,
          page_type: detectPageType(url, title, importantLinks),
          has_player_data: title.toLowerCase().includes('player') || url.includes('/player'),
          has_team_data: title.toLowerCase().includes('team') || url.includes('/team')
        },
        raw_preview: {
          html_first_500: html.substring(0, 500),
          text_first_500: html.replace(/<[^>]*>/g, '').substring(0, 500)
        }
      },
      performance: {
        user_agent_used: userAgent.substring(0, 60) + '...',
        cache_status: 'MISS',
        extraction_method: 'cheerio'  // ¡Cambiado de 'advanced_regex'!
      },
      timestamp: new Date().toISOString(),
      version: '3.1'
    };

    // Guardar en caché
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.status(200).json({
      ...result,
      cache: 'MISS',
      cache_info: {
        items_in_cache: cache.size,
        ttl_minutes: 30
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    res.status(500).json({
      success: false,
      error: error.name === 'AbortError' ? 'Timeout: La página tardó más de 8 segundos' : 'Error en el scraping',
      error_details: error.message,
      timestamp: new Date().toISOString(),
      recommendation: 'Intenta con otra URL o espera unos minutos'
    });
  }
}

// Función auxiliar para detectar tipo de página
function detectPageType(url, title, links) {
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  
  if (urlLower.includes('/player') || titleLower.includes('player')) return 'player_page';
  if (urlLower.includes('/team') || titleLower.includes('team')) return 'team_page';
  if (urlLower.includes('/tactic') || titleLower.includes('tactic')) return 'tactic_page';
  if (urlLower.includes('/formation')) return 'formation_page';
  if (links.some(link => link.text.toLowerCase().includes('database'))) return 'database_page';
  
  return 'general_page';
      }
