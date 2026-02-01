'use client';

import { useState, useEffect } from 'react';

export default function IRDDashboard() {
  const [url, setUrl] = useState('https://efootballhub.net/');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiVersion, setApiVersion] = useState('Desconocida');

  // Verificar versión de API al cargar
  useEffect(() => {
    checkApiVersion();
  }, []);

  const checkApiVersion = async () => {
    try {
      const res = await fetch('/api/ird/proxy');
      const data = await res.json();
      setApiVersion(data.version || '3.3+');
    } catch (err) {
      setApiVersion('Error al detectar');
    }
  };

  const handleScrape = async () => {
    if (!url.includes('efootballhub.net')) {
      setError('⚠️ Solo URLs de efootballhub.net');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ird/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      // DIAGNÓSTICO DETALLADO
      const diagnosticInfo = {
        // Info de sistema
        api_version: data.version || 'Desconocida',
        cheerio_available: data.system_info?.cheerio_available ?? 
                          data.performance?.cheerio_available ?? 
                          'No info',
        extraction_method: data.performance?.extraction_method || 
                          data.data?.metadata?.extraction_layer || 
                          'unknown',
        
        // Info de caché
        cache_status: data.cache || data.cache_status || 'UNKNOWN',
        cache_items: data.cache_info?.items_in_cache || 0,
        
        // Info de rendimiento
        response_time: data.performance?.response_time_ms || 
                      data.performance?.response_time || 
                      'N/A',
        user_agent: data.performance?.user_agent_used || 
                   data.performance?.userAgent || 
                   'N/A'
      };

      // Formatear resultado para visualización
      const formattedResult = {
        success: data.success,
        url: data.url || url,
        diagnostic: diagnosticInfo,
        
        // Datos extraídos (compatible con v3.0 y v3.3)
        metadata: {
          title: data.data?.metadata?.title || 
                data.data?.title || 
                (data.success ? 'Sin título extraído' : 'Error'),
          description: data.data?.metadata?.description || 
                      data.data?.description || 
                      '',
          extraction_layer: data.data?.metadata?.extraction_layer || 
                          diagnosticInfo.extraction_method
        },
        
        statistics: data.data?.statistics || {
          links: data.data?.structured_data?.important_links?.length || 0,
          images: 0,
          tables: 0,
          size_kb: data.data?.raw_preview?.html_first_500?.length ? 
                  Math.round(data.data.raw_preview.html_first_500.length / 1024) : 0
        },
        
        structured_data: {
          important_links: data.data?.structured_data?.important_links || 
                          data.data?.important_links || 
                          [],
          tables: data.data?.structured_data?.tables || []
        },
        
        raw_preview: {
          html_first_500: data.data?.raw_preview?.html_first_500 || 
                         data.data?.html_preview || 
                         'No disponible',
          text_first_500: data.data?.raw_preview?.text_first_500 || 
                         'No disponible'
        },
        
        timestamp: data.timestamp || new Date().toISOString()
      };

      setResult(formattedResult);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const exampleUrls = [
    { url: 'https://efootballhub.net/', label: '🏠 Inicio (prueba simple)' },
    { url: 'https://efootballhub.net/players', label: '👤 Jugadores' },
    { url: 'https://efootballhub.net/efootball23/player/106765907789861', label: '⚽ Jugador específico' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">
          🤖 I.R.D. Proxy Dashboard v3.3
        </h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-3 py-1 bg-blue-900/50 rounded-full text-sm">
            API: {apiVersion}
          </span>
          <span className="px-3 py-1 bg-green-900/50 rounded-full text-sm">
            Sistema Híbrido
          </span>
          <span className="px-3 py-1 bg-purple-900/50 rounded-full text-sm">
            Diagnóstico Integrado
          </span>
        </div>
        <p className="text-gray-400 mt-3">
          Dashboard compatible con API v3.3 (cheerio + regex + html fallback)
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Controles */}
        <div className="space-y-6">
          {/* Input URL */}
          <div className="bg-gray-800/50 p-5 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-green-400">
              🔗 URL a Extraer
            </h2>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg mb-4"
              placeholder="https://efootballhub.net/..."
            />
            
            <button
              onClick={handleScrape}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? '🔄 PROCESANDO...' : '🚀 EJECUTAR EXTRACCIÓN'}
            </button>

            <div className="mt-4 text-sm text-gray-400">
              <p>⚠️ Solo efootballhub.net</p>
              <p>⏱️ Timeout: 8 segundos</p>
              <p>🔄 3 capas: Cheerio → Regex → HTML</p>
            </div>
          </div>

          {/* URLs de ejemplo */}
          <div className="bg-gray-800/50 p-5 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-yellow-400">
              📋 Ejemplos para Probar
            </h3>
            <div className="space-y-2">
              {exampleUrls.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setUrl(item.url)}
                  className="w-full text-left p-3 bg-gray-900/70 hover:bg-gray-700/70 rounded-lg transition"
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-gray-400 truncate">{item.url}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Estado API */}
          <div className="bg-gray-800/50 p-5 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">
              📡 Estado del Sistema
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Versión API:</span>
                <span className="font-mono">{apiVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modo:</span>
                <span className="text-green-400">Híbrido (3 capas)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Última prueba:</span>
                <span>{result ? '✅ Con datos' : '🔄 Pendiente'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Resultados */}
        <div className="lg:col-span-2 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">❌</span>
                <h3 className="font-bold text-lg">Error del Sistema</h3>
              </div>
              <p className="mt-2 font-mono text-sm">{error}</p>
              <p className="text-sm text-gray-400 mt-2">
                Recomendación: Verifica la URL y prueba con ejemplo "Inicio"
              </p>
            </div>
          )}

          {/* Diagnóstico del Sistema */}
          {result?.diagnostic && (
            <div className="bg-gray-800/50 p-5 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">
                🔍 Diagnóstico del Sistema
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/70 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Capa Usada</p>
                  <p className="text-lg font-bold text-green-400">
                    {result.diagnostic.extraction_method}
                  </p>
                </div>
                <div className="bg-gray-900/70 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Cheerio</p>
                  <p className={`text-lg font-bold ${
                    result.diagnostic.cheerio_available === true ? 'text-green-400' : 
                    result.diagnostic.cheerio_available === false ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {result.diagnostic.cheerio_available === true ? '✅ Disponible' : 
                     result.diagnostic.cheerio_available === false ? '⚠️ No disponible' : '❓'}
                  </p>
                </div>
                <div className="bg-gray-900/70 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Cache</p>
                  <p className={`text-lg font-bold ${
                    result.diagnostic.cache_status === 'HIT' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {result.diagnostic.cache_status}
                  </p>
                </div>
                <div className="bg-gray-900/70 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Tiempo</p>
                  <p className="text-lg font-bold text-blue-400">
                    {result.diagnostic.response_time}{typeof result.diagnostic.response_time === 'number' ? 'ms' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resultados Principales */}
          {result && (
            <div className="space-y-6">
              {/* Metadatos */}
              <div className="bg-gray-800/50 p-5 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-green-400">
                    📄 Metadatos Extraídos
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    result.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                  }`}>
                    {result.success ? '✅ ÉXITO' : '❌ FALLO'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Título</p>
                    <p className="text-lg font-medium break-words">
                      {result.metadata.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Capa: {result.metadata.extraction_layer}
                    </p>
                  </div>

                  {result.metadata.description && (
                    <div>
                      <p className="text-sm text-gray-400">Descripción</p>
                      <p className="text-gray-300 break-words">
                        {result.metadata.description}
                      </p>
                    </div>
                  )}

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="bg-gray-900/70 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {result.statistics.links || 0}
                      </p>
                      <p className="text-xs text-gray-400">Enlaces</p>
                    </div>
                    <div className="bg-gray-900/70 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {result.statistics.images || 0}
                      </p>
                      <p className="text-xs text-gray-400">Imágenes</p>
                    </div>
                    <div className="bg-gray-900/70 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        {result.statistics.tables || 0}
                      </p>
                      <p className="text-xs text-gray-400">Tablas</p>
                    </div>
                    <div className="bg-gray-900/70 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {result.statistics.size_kb || 0}KB
                      </p>
                      <p className="text-xs text-gray-400">Tamaño</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enlaces importantes */}
              {result.structured_data?.important_links?.length > 0 && (
                <div className="bg-gray-800/50 p-5 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">
                    🔗 Enlaces Detectados ({result.structured_data.important_links.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.structured_data.important_links.slice(0, 8).map((link, idx) => (
                      <div key={idx} className="p-3 bg-gray-900/50 rounded-lg hover:bg-gray-700/50">
                        <p className="font-medium truncate">{link.text || 'Sin texto'}</p>
                        <p className="text-sm text-cyan-400 truncate">{link.href}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview HTML */}
              {result.raw_preview?.html_first_500 && result.raw_preview.html_first_500 !== 'No disponible' && (
                <div className="bg-gray-800/50 p-5 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400">
                    👁️ Vista Previa HTML (500 caracteres)
                  </h3>
                  <div className="p-4 bg-gray-900/70 rounded-lg overflow-x-auto">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                      {result.raw_preview.html_first_500}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Longitud: {result.raw_preview.html_first_500.length} caracteres
                  </p>
                </div>
              )}

              {/* Información Técnica */}
              <div className="bg-gray-800/50 p-5 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-400">
                  ⚙️ Información Técnica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">URL Final</p>
                    <p className="text-sm text-cyan-300 break-all">{result.url}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Timestamp</p>
                    <p className="text-sm">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estado inicial */}
          {!result && !error && !loading && (
            <div className="bg-gray-800/50 p-8 rounded-xl text-center">
              <div className="text-6xl mb-4 opacity-30">🤖</div>
              <h3 className="text-2xl text-gray-300 mb-3">
                Sistema I.R.D. v3.3 Listo
              </h3>
              <p className="text-gray-500 mb-6">
                Dashboard con diagnóstico integrado para API híbrida
              </p>
              <div className="inline-flex flex-col items-start space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">3 capas: Cheerio → Regex → HTML</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Diagnóstico automático del sistema</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Compatibilidad con API v3.0 y v3.3</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>I.R.D. Proxy System • Dashboard v3.3 • Sistema Híbrido de 3 Capas</p>
        <p className="mt-1">
          {apiVersion.includes('Error') ? '⚠️ No se pudo detectar API' : `✅ API v${apiVersion} detectada`}
        </p>
      </footer>
    </div>
  );
        }
