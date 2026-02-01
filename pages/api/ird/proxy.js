// pages/api/ird/proxy.js - VERSIÓN 3.3 (HÍBRIDO DE EMERGENCIA)

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

// SISTEMA HÍBRIDO: Intentar cargar cheerio, sino usar regex
let cheerio = null;
let cheerioAvailable = false;

try {
  cheerio = require('cheerio');
  cheerioAvailable = true;
  console.log('✅ Cheerio cargado exitosamente');
} catch (error) {
  console.log('⚠️ Cheerio no disponible, usando regex:', error.message);
  cheerioAvailable = false;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      name: 'I.R.D. Proxy API v3.3 (Hybrid System)',
      description: 'Sistema híbrido Cheerio/Regex para máxima compatibilidad',
      version: '3.3',
      system_status: {
        cheerio_available: cheerioAvailable,
        extraction_method: cheerioAvailable ? 'cheerio' : 'advanced_regex',
        cache_enabled: true,
        hybrid_mode: true
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL requerida',
        example: { url: 'https://efootballhub.net/' }
      });
    }

    // VALIDAR URL COMPLETA Y CORRECTA
    if (!url.includes('efootballhub.net')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Solo se permiten URLs de efootballhub.net' 
      });
    }

    // URL DEBE SER COMPLETA - CORREGIR SI ES NECESARIO
    let targetUrl = url;
    if (!targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl.replace(/^https?:\/\//, '');
    }
    if (!targetUrl.endsWith('/') && !targetUrl.includes('.')) {
      targetUrl = targetUrl + '/';
    }

    // Verificar caché
    const cacheKey = `scrape:${targetUrl}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.status(200).json({
        ...cached.data,
        cached: true,
        cache: 'HIT',
        timestamp: new Date().toISOString()
      });
    }

    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://efootballhub.net/'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const finalUrl = response.url; // URL después de redirecciones
    
    let result;
    let extractionMethod = 'unknown';
    
    // CAPA 1: INTENTAR CON CHEERIO
    if (cheerioAvailable && cheerio) {
      try {
        const $ = cheerio.load(html);
        
        const title = $('title').text().trim() || 
                      $('meta[property="og:title"]').attr('content') || 
                      $('h1').first().text().trim() || 
                      'Sin título (Cheerio)';
        
        const description = $('meta[name="description"]').attr('content') || 
                          $('meta[property="og:description"]').attr('content') || '';
        
        // Extraer algunos enlaces
        const importantLinks = [];
        $('a').each((i, el) => {
          if (importantLinks.length >= 10) return false;
          const href = $(el).attr('href');
          const text = $(el).text().trim().substring(0, 100);
          if (text && href) {
            importantLinks.push({ text, href: href.substring(0, 200) });
          }
        });

        result = {
          success: true,
          url: finalUrl,
          data: {
            metadata: {
              title,
              description,
              extraction_layer: 'cheerio_success'
            },
            statistics: {
              links: $('a').length,
              images: $('img').length,
              tables: $('table').length,
              size_kb: Math.round(html.length / 1024)
            },
            structured_data: {
              important_links: importantLinks.slice(0, 5)
            },
            raw_preview: {
              html_first_500: html.substring(0, 500),
              text_first_500: html.replace(/<[^>]*>/g, ' ').substring(0, 500).trim()
            }
          },
          system_info: {
            cheerio_used: true,
            html_length: html.length
          }
        };
        
        extractionMethod = 'cheerio_success';
        
      } catch (cheerioError) {
        console.log('Cheerio falló, usando regex:', cheerioError.message);
        // Caer a Capa 2
      }
    }
    
    // CAPA 2: REGEX MEJORADO (si cheerio falló o no disponible)
    if (!result) {
      try {
        // REGEX MEJORADA PARA TÍTULO
        const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/i;
        const titleMatch = html.match(titleRegex);
        let title = 'Sin título (Regex)';
        
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1]
            .replace(/[\r\n\t]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 200);
        }
        
        // REGEX PARA DESCRIPCIÓN
        const descRegex = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i;
        const descMatch = html.match(descRegex);
        const description = descMatch ? descMatch[1].substring(0, 300) : '';
        
        // CONTAR ELEMENTOS CON REGEX SIMPLE
        const linksCount = (html.match(/<a\s+[^>]*href=/gi) || []).length;
        const imagesCount = (html.match(/<img\s+/gi) || []).length;
        
        // EXTRAER ALGUNOS ENLACES CON REGEX MEJORADA
        const linkRegex = /<a\s+[^>]*?href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
        const importantLinks = [];
        let linkMatch;
        let linkCounter = 0;
        
        while ((linkMatch = linkRegex.exec(html)) !== null && linkCounter < 10) {
          const href = linkMatch[1];
          let text = linkMatch[2].replace(/<[^>]*>/g, '').trim();
          if (text.length > 5 && text.length < 100 && href) {
            importantLinks.push({
              text: text.substring(0, 80),
              href: href.substring(0, 200)
            });
            linkCounter++;
          }
        }
        
        result = {
          success: true,
          url: finalUrl,
          data: {
            metadata: {
              title,
              description,
              extraction_layer: 'regex_fallback'
            },
            statistics: {
              links: linksCount,
              images: imagesCount,
              tables: (html.match(/<table\s+/gi) || []).length,
              size_kb: Math.round(html.length / 1024)
            },
            structured_data: {
              important_links: importantLinks
            },
            raw_preview: {
              html_first_500: html.substring(0, 500),
              text_first_500: html.replace(/<[^>]*>/g, ' ').substring(0, 500).trim()
            }
          },
          system_info: {
            cheerio_used: false,
            regex_used: true,
            html_length: html.length
          }
        };
        
        extractionMethod = 'regex_fallback';
        
      } catch (regexError) {
        console.log('Regex falló, usando HTML mínimo:', regexError.message);
        // Caer a Capa 3
      }
    }
    
    // CAPA 3: RESPUESTA MÍNIMA (si todo falla)
    if (!result) {
      result = {
        success: true,
        url: finalUrl,
        data: {
          metadata: {
            title: 'Página cargada pero no parseada',
            description: 'HTML recibido pero sistemas de parsing fallaron',
            extraction_layer: 'html_only'
          },
          statistics: {
            size_kb: Math.round(html.length / 1024),
            html_received: true
          },
          raw_preview: {
            html_first_500: html.substring(0, 500),
            notice: 'Sistemas Cheerio y Regex fallaron. Mostrando HTML crudo.'
          }
        },
        system_info: {
          cheerio_available: cheerioAvailable,
          error: 'Todos los sistemas de parsing fallaron',
          html_length: html.length
        }
      };
      
      extractionMethod = 'html_only';
    }

    // Agregar metadata común
    const finalResult = {
      ...result,
      performance: {
        response_time_ms: Date.now() - (req.startTime || Date.now()),
        user_agent_used: userAgent.substring(0, 60),
        cache_status: 'MISS',
        extraction_method: extractionMethod,
        cheerio_available: cheerioAvailable
      },
      timestamp: new Date().toISOString(),
      version: '3.3',
      cache: 'MISS',
      cache_info: {
        items_in_cache: cache.size,
        ttl_minutes: 30
      }
    };

    // Guardar en caché
    cache.set(cacheKey, {
      data: finalResult,
      timestamp: Date.now()
    });

    // Limpiar caché si es muy grande
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    res.status(200).json(finalResult);

  } catch (error) {
    console.error('Error general:', error);
    
    res.status(500).json({
      success: false,
      error: error.name === 'AbortError' ? 'Timeout (8 segundos)' : 'Error en el scraping',
      error_details: error.message.substring(0, 200),
      timestamp: new Date().toISOString(),
      system_status: {
        cheerio_available: cheerioAvailable,
        hybrid_system: true,
        recommendation: 'Usa una URL completa: https://efootballhub.net/'
      }
    });
  }
}; 
