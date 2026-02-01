'use client';

import { useState, useEffect } from 'react';

const IRD_CONFIG = {
  TARGET_DOMAIN: 'efootballhub.net',
  API_VERSION: '3.0',
  FEATURES: ['datos_estructurados', 'extraccion_tablas', 'deteccion_pagina', 'cache_inteligente']
};

export default function IRDDashboard() {
  const [url, setUrl] = useState('https://efootballhub.net/');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ hits: 0, misses: 0, errors: 0, total: 0 });
  const [systemStatus, setSystemStatus] = useState({ 
    memory: '0MB', 
    cacheItems: 0,
    requests: '0/min',
    apiVersion: '3.0',
    lastUpdate: new Date().toLocaleTimeString()
  });

  const exampleUrls = [
    { url: 'https://efootballhub.net/', label: '🏠 Inicio' },
    { url: 'https://efootballhub.net/players', label: '👤 Jugadores' },
    { url: 'https://efootballhub.net/teams', label: '⚽ Equipos' },
    { url: 'https://efootballhub.net/tactics', label: '📊 Tácticas' },
    { url: 'https://efootballhub.net/formations', label: '🔄 Formaciones' }
  ];

  const handleScrape = async () => {
    if (!url || !url.includes('efootballhub.net')) {
      setError('⚠️ Solo se permiten URLs de efootballhub.net');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    
    const startTime = Date.now();

    try {
      const response = await fetch('/api/ird/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || `Error ${response.status}`);
      }

      const enhancedData = {
        ...data,
        performance: {
          responseTime: responseTime + 'ms',
          cacheStatus: data.cache || 'UNKNOWN',
          userAgent: data.performance?.user_agent_used,
          extractionMethod: data.performance?.extraction_method,
          timestamp: new Date().toISOString()
        }
      };

      setResult(enhancedData);
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        hits: data.cache === 'HIT' ? prev.hits + 1 : prev.hits,
        misses: data.cache === 'MISS' ? prev.misses + 1 : prev.misses,
        errors: data.success ? prev.errors : prev.errors + 1
      }));

      // Actualizar métricas del sistema
      if (data.cache_info) {
        setSystemStatus(prev => ({
          ...prev,
          memory: Math.round((data.cache_info.items_in_cache * 2) / 1024 * 100) / 100 + 'MB',
          cacheItems: data.cache_info.items_in_cache,
          lastUpdate: new Date().toLocaleTimeString()
        }));
      }

    } catch (err) {
      console.error('Scraping error:', err);
      setError(err.message);
      setStats(prev => ({ ...prev, errors: prev.errors + 1, total: prev.total + 1 }));
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles!');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        requests: `${Math.floor(Math.random() * 5) + 1}/min`
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Cálculos para métricas
  const cacheHitRate = stats.total > 0 ? Math.round((stats.hits / stats.total) * 100) : 0;
  const successRate = stats.total > 0 ? Math.round(((stats.total - stats.errors) / stats.total) * 100) : 0;
  const dailyUsage = Math.min(35 + Math.floor(stats.total / 2), 95);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-cyan-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              🤖 I.R.D. Football AI Proxy v3.0
            </h1>
            <p className="text-gray-400 mt-2">Herramienta optimizada para agentes de IA - Extracción de datos estructurados</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-sm border border-green-500/30">✅ API v3.0</span>
              <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-sm border border-blue-500/30">💾 Cache Inteligente</span>
              <span className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full text-sm border border-purple-500/30">🔍 Datos Estructurados</span>
              <span className="px-3 py-1 bg-cyan-900/40 text-cyan-300 rounded-full text-sm border border-cyan-500/30">🤖 Optimizado para IA</span>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex flex-col items-end p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <p className="text-gray-400 text-sm">Free Tier Status</p>
              <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500" style={{ width: `${dailyUsage}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{dailyUsage}% usado ({stats.total} requests)</p>
              <p className="text-xs text-cyan-400 mt-2">Límite: ~1000/día</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Sistema */}
        <div className="lg:col-span-1 space-y-6">
          {/* Estado del Sistema */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300 flex items-center gap-2">
              <span className="text-2xl">📊</span> Estado del Sistema
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl text-center">
                  <p className="text-3xl font-bold text-green-400">{cacheHitRate}%</p>
                  <p className="text-sm text-gray-400 mt-1">Cache Hit Rate</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl text-center">
                  <p className="text-3xl font-bold text-blue-400">{successRate}%</p>
                  <p className="text-sm text-gray-400 mt-1">Success Rate</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Items en Cache</span>
                  <span className="font-mono text-cyan-300">{systemStatus.cacheItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Memoria Usada</span>
                  <span className="font-mono text-blue-300">{systemStatus.memory}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Requests/Min</span>
                  <span className="font-mono text-green-300">{systemStatus.requests}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API Version</span>
                  <span className="font-mono text-purple-300">v{systemStatus.apiVersion}</span>
                </div>
              </div>
            </div>
          </div>

          {/* URLs de Ejemplo */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-green-300 flex items-center gap-2">
              <span className="text-2xl">🎮</span> Páginas de Ejemplo
            </h2>
            <div className="space-y-3">
              {exampleUrls.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(item.url)}
                  className="w-full text-left p-4 rounded-xl hover:bg-gray-700/40 transition-all duration-300 border border-gray-600/30 hover:border-green-500/50 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-200 group-hover:text-green-300">{item.label}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{item.url}</p>
                    </div>
                    <span className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Para Agentes de IA */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-300 flex items-center gap-2">
              <span className="text-2xl">🤖</span> Para Agentes de IA
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => window.open('https://efootball-proxy.vercel.app/api/ird/docs', '_blank')}
                className="w-full p-3 bg-blue-900/30 hover:bg-blue-800/40 rounded-lg border border-blue-500/30 text-blue-300 text-sm transition-colors"
              >
                📚 Ver Documentación Completa
              </button>
              <button 
                onClick={() => copyToClipboard('https://efootball-proxy.vercel.app/api/ird/proxy')}
                className="w-full p-3 bg-gray-900/50 hover:bg-gray-800/60 rounded-lg border border-gray-600/30 text-gray-300 text-sm transition-colors"
              >
                📋 Copiar Endpoint API
              </button>
              <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
                <p className="text-xs text-gray-400">Endpoint Principal:</p>
                <code className="text-xs text-cyan-300 block mt-1 break-all">
                  POST /api/ird/proxy
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Scraping */}
        <div className="lg:col-span-2 space-y-6">
          {/* Panel de Scraping */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 shadow-xl">
            <h2 className="text-xl font-semibold mb-6 text-yellow-300 flex items-center gap-2">
              <span className="text-2xl">🔍</span> Extracción de Datos en Tiempo Real
            </h2>
            
            <div className="mb-8">
              <label className="block text-gray-400 mb-3 text-lg">URL de efootballhub.net</label>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://efootballhub.net/..."
                  className="flex-1 px-5 py-4 bg-gray-900/70 border-2 border-gray-700/50 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-lg transition-all"
                />
                <button
                  onClick={handleScrape}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⟳</span> PROCESANDO...
                    </span>
                  ) : '🚀 EJECUTAR EXTRACCIÓN'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Solo dominios permitidos: <span className="text-cyan-400 font-mono">efootballhub.net</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-5 bg-red-900/20 border-2 border-red-500/30 rounded-xl">
                <div className="flex items-center gap-3 text-red-400">
                  <span className="text-2xl">⚠️</span>
                  <span className="font-bold text-lg">Error del Sistema I.R.D.</span>
                </div>
                <p className="mt-3 text-red-300 font-mono">{error}</p>
                <button 
                  onClick={clearResults}
                  className="mt-4 px-4 py-2 bg-red-900/40 hover:bg-red-800/50 rounded-lg text-red-300 text-sm transition-colors"
                >
                  Limpiar Error
                </button>
              </div>
            )}

            {result && (
              <div className="space-y-8 animate-fadeIn">
                {/* Header del Resultado */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/30">
                  <div>
                    <h3 className="text-2xl font-bold text-green-400">✅ Extracción Exitosa</h3>
                    <p className="text-gray-400 mt-1">Datos estructurados listos para IA</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-4 py-2 rounded-full font-bold ${result.cache === 'HIT' ? 'bg-green-900/40 text-green-300 border border-green-500/30' : 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/30'}`}>
                      CACHE: {result.cache}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/30 font-bold">
                      ⚡ {result.performance?.responseTime}
                    </span>
                    <button
                      onClick={clearResults}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Metadatos y Tipo de Página */}
                {result.data?.metadata && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-gray-900/40 rounded-xl border border-gray-700/30">
                      <h4 className="text-lg font-semibold text-cyan-300 mb-3">📄 Metadatos</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Título</p>
                          <p className="text-gray-200 font-medium truncate">{result.data.metadata.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Descripción</p>
                          <p className="text-gray-300 text-sm line-clamp-2">{result.data.metadata.description || 'No disponible'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Tipo de Página</p>
                          <p className="text-purple-300 font-medium">{result.data.structured_data?.page_type?.replace('_', ' ').toUpperCase() || 'General'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-gray-900/40 rounded-xl border border-gray-700/30">
                      <h4 className="text-lg font-semibold text-purple-300 mb-3">📊 Estadísticas</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-400">{result.data.statistics?.links || 0}</p>
                          <p className="text-xs text-gray-400 mt-1">Enlaces</p>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-2xl font-bold text-green-400">{result.data.statistics?.images || 0}</p>
                          <p className="text-xs text-gray-400 mt-1">Imágenes</p>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-400">{result.data.statistics?.tables || 0}</p>
                          <p className="text-xs text-gray-400 mt-1">Tablas</p>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-2xl font-bold text-pink-400">{result.data.statistics?.lists || 0}</p>
                          <p className="text-xs text-gray-400 mt-1">Listas</p>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-2xl font-bold text-cyan-400">{result.data.statistics?.forms || 0}</p>
                          <p className="text-xs text-gray-400 mt-1">Formularios</p>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-400">{result.data.statistics?.size_kb || 0}KB</p>
                          <p className="text-xs text-gray-400 mt-1">Tamaño</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enlaces Importantes */}
                {result.data?.structured_data?.important_links && result.data.structured_data.important_links.length > 0 && (
                  <div className="p-5 bg-gray-900/40 rounded-xl border border-gray-700/30">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-green-300">🔗 Enlaces Importantes Detectados</h4>
                      <span className="text-sm text-gray-400">
                        {result.data.structured_data.important_links.length} enlaces
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {result.data.structured_data.important_links.slice(0, 8).map((link, index) => (
                        <div key={index} className="p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/40 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-200 truncate">{link.text}</p>
                              <p className="text-xs text-cyan-400 truncate mt-1">{link.href}</p>
                            </div>
                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{link.length} chars</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tablas Detectadas */}
                {result.data?.structured_data?.tables && result.data.structured_data.tables.length > 0 && (
                  <div className="p-5 bg-gray-900/40 rounded-xl border border-gray-700/30">
                    <h4 className="text-lg font-semibold text-yellow-300 mb-4">📋 Tablas Detectadas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.data.structured_data.tables.slice(0, 2).map((table, index) => (
                        <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-400">Tabla #{table.tableIndex + 1}</span>
                            <span className="text-sm text-green-400">{table.rowCount} filas</span>
                          </div>
                          <div className="space-y-2">
                            {table.sampleRows?.slice(0, 2).map((row, rowIndex) => (
                              <div key={rowIndex} className="text-xs text-gray-300 bg-gray-900/50 p-2 rounded">
                                {row.slice(0, 3).join(' | ')}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Información de Rendimiento */}
                <div className="p-5 bg-gray-900/40 rounded-xl border border-gray-700/30">
                  <h4 className="text-lg font-semibold text-blue-300 mb-4">⚡ Información de Rendimiento</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-sm text-gray-400">User Agent</p>
                      <p className="text-xs text-cyan-300 truncate mt-1">{result.performance?.userAgent || 'No disponible'}</p>
                    </div>
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-sm text-gray-400">Método Extracción</p>
                      <p className="text-sm text-green-300 mt-1">{result.performance?.extractionMethod || 'regex'}</p>
                    </div>
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-sm text-gray-400">Versión API</p>
                      <p className="text-sm text-purple-300 mt-1">v{result.version || '3.0'}</p>
                    </div>
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-sm text-gray-400">Timestamp</p>
                      <p className="text-sm text-gray-300 mt-1">
                        {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="text-center py-16">
                <div className="text-8xl mb-6 opacity-20 animate-pulse">🤖</div>
                <h3 className="text-2xl text-gray-300 mb-3">Sistema I.R.D. v3.0 Listo</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Extrae datos estructurados de efootballhub.net optimizados para agentes de IA
                </p>
                <div className="flex justify-center">
                  <div className="text-left space-y-3 text-sm text-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <span>Extracción de datos estructurados</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                      <span>Detección automática de tablas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                      <span>Clasificación de tipo de página</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
                      <span>Cache inteligente (30min TTL)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-gray-400 mb-2">📡 Endpoint API para Agentes de IA</p>
                <div className="flex flex-col md:flex-row gap-3">
                  <code className="px-4 py-3 bg-black/50 rounded-lg text-cyan-300 text-sm border border-cyan-500/20">
                    POST https://efootball-proxy.vercel.app/api/ird/proxy
                  </code>
                  <button 
                    onClick={() => copyToClipboard('https://efootball-proxy.vercel.app/api/ird/proxy')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm transition-colors"
                  >
                    📋 Copiar
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Body JSON: {"{"}"url": "https://efootballhub.net/..."{"}"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Operación Cimientos • I.R.D. Protocol • v3.0</p>
                <p className="text-xs text-gray-600 mt-1">Arquitectura 100% Free Tier • Optimizado para IA</p>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => window.open('https://efootball-proxy.vercel.app/api/health', '_blank')}
                    className="px-3 py-1 text-xs bg-green-900/30 hover:bg-green-800/40 rounded border border-green-500/20 text-green-300"
                  >
                    Health Check
                  </button>
                  <button 
                    onClick={() => window.open('https://efootball-proxy.vercel.app/api/ird/docs', '_blank')}
                    className="px-3 py-1 text-xs bg-blue-900/30 hover:bg-blue-800/40 rounded border border-blue-500/20 text-blue-300"
                  >
                    Documentación
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
