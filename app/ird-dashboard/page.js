'use client';

import { useState, useEffect } from 'react';
import { IRD_CONFIG } from '@/lib/ird-config';

export default function IRDDashboard() {
  const [url, setUrl] = useState('https://efootballhub.net/');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ hits: 0, misses: 0, errors: 0 });
  const [systemStatus, setSystemStatus] = useState({ memory: 0, uptime: 0 });

  // URLs de ejemplo para efootballhub.net
  const exampleUrls = [
    'https://efootballhub.net/',
    'https://efootballhub.net/players',
    'https://efootballhub.net/teams',
    'https://efootballhub.net/tactics'
  ];

  const handleScrape = async () => {
    if (!url || !url.includes('efootballhub.net')) {
      setError('Por favor, usa una URL válida de efootballhub.net');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ird/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      setResult(data);
      
      // Actualizar estadísticas
      if (data.success) {
        if (data.cache === 'HIT') {
          setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
        } else {
          setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        }
      } else {
        setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      }

    } catch (err) {
      setError(err.message);
      setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleUrl) => {
    setUrl(exampleUrl);
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  // Simular métricas del sistema (en un sistema real, esto vendría de una API)
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus({
        memory: Math.floor(Math.random() * 30) + 10, // 10-40 MB
        uptime: Math.floor(Math.random() * 100) + 50, // 50-150%
        requests: Math.floor(Math.random() * 5) + 1 // 1-6 requests/min
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calcular porcentajes para la barra de progreso
  const dailyUsage = 35; // Simulado: 35% del límite diario usado
  const memoryUsage = 60; // Simulado: 60% de memoria usada

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8">
      {/* Header I.R.D. */}
      <header className="mb-8 border-b border-cyan-500/30 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              I.R.D. Proxy System v1.0
            </h1>
            <p className="text-gray-400 mt-2">Ingeniero de Realidades Deterministas - Operación Cimientos</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm border border-green-500/30">
                ✓ OPERACIONAL
              </span>
              <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm border border-blue-500/30">
                COSTO $0.00
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Free Tier Status</p>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-sm text-gray-400">Límite diario</p>
                <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500" 
                    style={{ width: `${dailyUsage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{dailyUsage}% usado (800/1000 requests)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Sistema y Métricas */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tarjeta de Estado del Sistema */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">📊 Estado del Sistema I.R.D.</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Memoria Cache</span>
                  <span className="font-mono">{memoryUsage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                    style={{ width: `${memoryUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">{stats.hits}</p>
                  <p className="text-sm text-gray-400 mt-1">Cache Hits</p>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-400">{stats.misses}</p>
                  <p className="text-sm text-gray-400 mt-1">Cache Misses</p>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-cyan-400">{systemStatus.requests}/min</p>
                  <p className="text-sm text-gray-400 mt-1">Requests</p>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{stats.errors}</p>
                  <p className="text-sm text-gray-400 mt-1">Errores</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Configuración */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">⚙️ Configuración I.R.D.</h2>
            <div className="space-y-3">
              {Object.entries(IRD_CONFIG).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 hover:bg-gray-700/30 rounded">
                  <span className="text-gray-400">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-mono text-cyan-300">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-gray-900/70 rounded-lg border border-cyan-500/20">
              <p className="text-sm text-cyan-300">💡 Filosofía I.R.D.</p>
              <p className="text-xs text-gray-400 mt-1">
                Determinismo quirúrgico. Cada request es verificable, cada límite es explotado tácticamente.
              </p>
            </div>
          </div>

          {/* URLs de Ejemplo */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 text-green-300">🎮 URLs de Ejemplo</h2>
            <div className="space-y-2">
              {exampleUrls.map((exampleUrl, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(exampleUrl)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-600/50 hover:border-green-500/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">→</span>
                    <span className="text-sm truncate">{exampleUrl}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha: Scraping y Resultados */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjeta de Scraping */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 text-yellow-300">🔍 Scraping en Tiempo Real</h2>
            
            <div className="mb-6">
              <label className="block text-gray-400 mb-2">URL de efootballhub.net</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://efootballhub.net/..."
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={handleScrape}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'SCRAPEANDO...' : 'EJECUTAR SCRAPING'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Solo dominios permitidos: <span className="text-cyan-400">efootballhub.net</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <span>⚠</span>
                  <span className="font-semibold">Error del Sistema I.R.D.</span>
                </div>
                <p className="mt-2 text-red-300">{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-green-400">✅ Resultados del Scraping</h3>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${result.cache === 'HIT' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                      CACHE: {result.cache}
                    </span>
                    <button
                      onClick={clearResults}
                      className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Resultados principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/70 rounded-lg">
                    <p className="text-gray-400 text-sm">Título Extraído</p>
                    <p className="mt-1 font-semibold truncate">{result.data?.title || 'No disponible'}</p>
                  </div>
                  <div className="p-4 bg-gray-900/70 rounded-lg">
                    <p className="text-gray-400 text-sm">URL Final</p>
                    <p className="mt-1 text-sm text-cyan-300 truncate">{result.url || url}</p>
                  </div>
                </div>

                {/* Estadísticas */}
                {result.data?.stats && (
                  <div className="p-4 bg-gray-900/70 rounded-lg">
                    <p className="text-gray-400 mb-2">📊 Estadísticas de la Página</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">{result.data.stats.links || 0}</p>
                        <p className="text-xs text-gray-400">Enlaces</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-400">{result.data.stats.images || 0}</p>
                        <p className="text-xs text-gray-400">Imágenes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{result.data.stats.size || 0}</p>
                        <p className="text-xs text-gray-400">Bytes</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* HTML Preview */}
                <div className="p-4 bg-gray-900/70 rounded-lg">
                  <p className="text-gray-400 mb-2">📄 Vista Previa HTML (primeros 500 caracteres)</p>
                  <pre className="text-xs bg-black/50 p-3 rounded-lg overflow-x-auto text-gray-300 font-mono">
                    {result.data?.htmlPreview || 'No hay preview disponible'}
                  </pre>
                </div>

                {/* Metadata */}
                <div className="p-4 bg-gray-900/70 rounded-lg">
                  <p className="text-gray-400 mb-2">🕒 Metadatos del Request</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Timestamp:</span>
                      <span className="ml-2 text-cyan-300">{result.timestamp || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Éxito:</span>
                      <span className={`ml-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.success ? 'SÍ' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-20">🤖</div>
                <h3 className="text-xl text-gray-400 mb-2">Sistema I.R.D. Listo</h3>
                <p className="text-gray-500">Ejecuta un scraping para ver los resultados en tiempo real</p>
                <div className="mt-6 flex justify-center">
                  <div className="text-left space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Cache LRU activo (30min TTL)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Rate limiting: {IRD_CONFIG.RATE_LIMIT_PER_MINUTE}/min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span>Timeout configurado: 8 segundos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Informativo */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-gray-400">📡 Endpoint API para Agentes de IA:</p>
                <code className="block mt-1 px-3 py-2 bg-black/50 rounded-lg text-cyan-300 text-sm">
                  POST https://efootball-proxy-jkja.vercel.app/api/ird/proxy
                </code>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  Operación Cimientos • I.R.D. Protocol • v1.0.0
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Arquitectura 100% Free Tier • Costo garantizado $0.00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
                             }
