export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const documentation = {
    api_name: "I.R.D. Football Data Proxy",
    description: "API optimizada para IA que extrae datos estructurados de efootballhub.net",
    version: "3.0",
    base_url: "https://efootball-proxy.vercel.app",
    
    endpoints: {
      main: {
        url: "/api/ird/proxy",
        method: "POST",
        description: "Extrae datos estructurados de cualquier página de efootballhub.net",
        request_format: {
          url: "string (ej: https://efootballhub.net/players)"
        },
        response_structure: {
          success: "boolean",
          url: "string",
          data: {
            metadata: "object con título, descripción, etc.",
            statistics: "conteo de elementos",
            structured_data: "datos organizados para IA",
            raw_preview: "vista previa del contenido"
          },
          performance: "información del scraping",
          timestamp: "ISO string"
        }
      },
      health: {
        url: "/api/health",
        method: "GET",
        description: "Verifica el estado del servicio"
      }
    },
    
    features_for_ai: [
      "Extracción automática de tablas y listas",
      "Detección de tipo de página (jugadores, equipos, tácticas)",
      "Enlaces importantes filtrados por relevancia",
      "Cache inteligente para reducir peticiones",
      "Rotación de User-Agent para evitar bloqueos"
    ],
    
    usage_examples: {
      javascript: `
// Ejemplo para agentes de IA
async function getFootballData(url) {
  const response = await fetch('https://efootball-proxy.vercel.app/api/ird/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url })
  });
  return await response.json();
}

// Uso
const data = await getFootballData('https://efootballhub.net/players');
console.log(data.data.structured_data.important_links);
console.log(data.data.metadata.title);
      `,
      python: `
import requests

def get_football_data(url):
    response = requests.post(
        'https://efootball-proxy.vercel.app/api/ird/proxy',
        json={'url': url}
    )
    return response.json()

# Uso
data = get_football_data('https://efootballhub.net/players')
print(f"Título: {data['data']['metadata']['title']}")
print(f"Enlaces importantes: {len(data['data']['structured_data']['important_links'])}")
      `,
      curl: `
curl -X POST https://efootball-proxy.vercel.app/api/ird/proxy \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://efootballhub.net/players"}'
      `
    },
    
    best_practices: [
      "Usa el campo 'structured_data' para análisis rápido",
      "Verifica 'data.statistics' para entender el contenido",
      "Revisa 'data.metadata' para título y descripción",
      "Usa 'performance.cache_status' para saber si son datos frescos"
    ],
    
    rate_limits: {
      free_tier: "~15 requests/minuto, ~1000/día",
      recommendation: "Implementa caché en tu lado para reducir llamadas"
    },
    
    support: {
      dashboard: "https://efootball-proxy.vercel.app/ird-dashboard",
      github: "https://github.com/cochabambino42-collab/efootball-proxy",
      status: "https://efootball-proxy.vercel.app/api/health"
    }
  };
  
  res.status(200).json(documentation);
}
