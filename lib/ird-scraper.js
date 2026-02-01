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
