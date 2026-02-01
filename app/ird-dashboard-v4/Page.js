'use client';

import { useState } from 'react';

export default function DashboardV4() {
  const [url, setUrl] = useState('https://efootballhub.net/');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-green-400">
          🚀 I.R.D. Proxy v4.0 (App Router)
        </h1>
        <p className="text-gray-400 mt-2">
          Sistema simplificado sin dependencias externas
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Input */}
        <div className="bg-gray-800 p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-4">🔗 URL de efootballhub.net</h2>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-700 rounded-lg"
              placeholder="https://efootballhub.net/..."
            />
            <button
              onClick={handleScrape}
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? '🔄 Procesando...' : '🚀 Extraer'}
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Ejemplos: https://efootballhub.net/ | https://efootballhub.net/players
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
            <div className="font-bold text-red-300">❌ Error</div>
            <div className="mt-2 font-mono text-sm">{error}</div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-green-400">
                  ✅ Extracción Exitosa
                </h2>
                <div className="flex gap-3">
                  <span className={`px-3 py-1 rounded-full ${
                    result.cache === 'HIT' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    CACHE: {result.cache}
                  </span>
                  <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full">
                    ⚡ {result.performance?.response_time_ms}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">📄 Título Extraído</h3>
              <div className="text-2xl font-bold">{result.data.metadata.title}</div>
              <div className="text-sm text-gray-400 mt-2">
                Método: {result.data.metadata.extraction_method} | 
                Tipo: {result.data.metadata.page_type}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">📊 Estadísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {result.data.statistics.links}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Enlaces</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {result.data.statistics.images}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Imágenes</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {result.data.statistics.tables}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Tablas</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {result.data.statistics.size_kb}KB
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Tamaño</div>
                </div>
              </div>
            </div>

            {/* Links */}
            {result.data.structured_data.important_links.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">
                  🔗 Enlaces Importantes ({result.data.structured_data.important_links.length})
                </h3>
                <div className="space-y-3">
                  {result.data.structured_data.important_links.slice(0, 8).map((link, idx) => (
                    <div key={idx} className="bg-gray-900/50 p-3 rounded-lg">
                      <div className="font-medium truncate">{link.text}</div>
                      <div className="text-sm text-cyan-400 truncate">{link.href}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">👁️ Vista Previa (HTML)</h3>
              <div className="bg-gray-900/70 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {result.data.raw_preview.html_first_500}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && (
          <div className="bg-gray-800 p-8 rounded-xl text-center">
            <div className="text-6xl mb-4 opacity-30">🚀</div>
            <h3 className="text-2xl mb-3">Sistema v4.0 Listo</h3>
            <p className="text-gray-400 mb-6">
              Extracción robusta sin dependencias externas
            </p>
            <div className="inline-flex flex-col items-start gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Regex mejorado sin cheerio</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Headers anti-bloqueo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Cache automático 30min</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
    }
