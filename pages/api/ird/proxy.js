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
      name: 'I.R.D. Proxy API v3.0',
      description: 'API optimizada para IA - Extrae datos estructurados de efootballhub.net',
      version: '3.0',
      endpoints: {
        'POST /': 'Scraping con datos estructurados',
        'GET /': 'Esta documentación'
      },
      features: [
        'Extracción de tablas y listas',
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
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // ANÁLISIS AVANZADO PARA IA
    // 1. Extraer título y metadatos básicos
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Sin título';
    
    const descriptionMatch = html.match(/<meta name="description" content="(.*?)"/i);
    const description = descriptionMatch ? descriptionMatch[1] : '';
    
    const keywordsMatch = html.match(/<meta name="keywords" content="(.*?)"/i);
    const keywords = keywordsMatch ? keywordsMatch[1] : '';

    // 2. Contar elementos
    const links = (html.match(/<a\s+/gi) || []).length;
    const images = (html.match(/<img\s+/gi) || []).length;
    const tables = (html.match(/<table\s+/gi) || []).length;
    const lists = (html.match(/<(ul|ol)\s+/gi) || []).length;
    const forms = (html.match(/<form\s+/gi) || []).length;

    // 3. Extraer datos estructurados (simplificado)
    // - Enlaces importantes (los que contienen palabras clave)
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const importantLinks = [];
    let match;
    let linkCount = 0;
    
    while ((match = linkRegex.exec(html)) !== null && linkCount < 20) {
      const href = match[1];
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      
      if (text && href && href.startsWith('http')) {
        // Filtrar enlaces importantes para efootball
        const footballKeywords = ['player', 'team', 'tactic', 'formation', 'skill', 'rating', 'efootball', 'hub'];
        const hasKeyword = footballKeywords.some(keyword => 
          text.toLowerCase().includes(keyword) || href.toLowerCase().includes(keyword)
        );
        
        if (hasKeyword || text.length > 10) {
          importantLinks.push({
            text: text.substring(0, 100),
            href: href,
            length: text.length
          });
          linkCount++;
        }
      }
    }

    // 4. Extraer posibles datos tabulares (simplificado)
    const tableData = [];
    const tableRegex = /<table[\s\S]*?<\/table>/gi;
    let tableMatch;
    let tableIndex = 0;
    
    while ((tableMatch = tableRegex.exec(html)) !== null && tableIndex < 3) {
      const tableHtml = tableMatch[0];
      // Extraer filas
      const rowRegex = /<tr[\s\S]*?<\/tr>/gi;
      const rows = [];
      let rowMatch;
      
      while ((rowMatch = rowRegex.exec(tableHtml)) !== null && rows.length < 10) {
        const rowHtml = rowMatch[0];
        // Extraer celdas
        const cellRegex = /<(td|th)[\s\S]*?>([\s\S]*?)<\/\1>/gi;
        const cells = [];
        let cellMatch;
        
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
          const cellContent = cellMatch[2].replace(/<[^>]*>/g, '').trim();
          if (cellContent) {
            cells.push(cellContent.substring(0, 200));
          }
        }
        
        if (cells.length > 0) {
          rows.push(cells);
        }
      }
      
      if (rows.length > 0) {
        tableData.push({
          tableIndex: tableIndex,
          rowCount: rows.length,
          sampleRows: rows.slice(0, 3) // Primeras 3 filas como muestra
        });
        tableIndex++;
      }
    }

    // 5. Construir respuesta optimizada para IA
    const result = {
      success: true,
      url: response.url,
      data: {
        metadata: {
          title,
          description,
          keywords,
          charset: html.match(/charset=["']?([\w-]+)/i)?.[1] || 'unknown'
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
          // Detectar si es página de jugadores, equipos, etc.
          page_type: detectPageType(url, title, importantLinks),
          has_player_data: title.toLowerCase().includes('player') || url.includes('/player'),
          has_team_data: title.toLowerCase().includes('team') || url.includes('/team')
        },
        raw_preview: {
          html_first_500: html.substring(0, 500).replace(/</g, '&lt;').replace(/>/g, '&gt;'),
          text_first_500: html.replace(/<[^>]*>/g, '').substring(0, 500)
        }
      },
      performance: {
        user_agent_used: userAgent.substring(0, 60) + '...',
        cache_status: 'MISS',
        extraction_method: 'advanced_regex'
      },
      timestamp: new Date().toISOString(),
      version: '3.0'
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
