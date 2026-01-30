import { irdCache } from './ird-cache';

export class IRDScraper {
  async scrape(url) {
    // Verificar caché primero
    const cacheKey = `scrape:${url}`;
    const cached = irdCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; I.R.D.-Scraper/1.0)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Extraer información básica (simplificado por ahora)
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Sin título';
      
      // Contar elementos
      const linkCount = (html.match(/<a /gi) || []).length;
      const imgCount = (html.match(/<img /gi) || []).length;

      const result = {
        success: true,
        url: response.url,
        data: {
          title,
          stats: {
            links: linkCount,
            images: imgCount,
            size: html.length
          },
          htmlPreview: html.substring(0, 500) + '...'
        },
        timestamp: new Date().toISOString()
      };

      // Guardar en caché
      irdCache.set(cacheKey, result);

      return result;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const irdScraper = new IRDScraper();
