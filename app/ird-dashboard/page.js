'use client';
import { useState } from 'react';

export default function DashboardPage() {
  const [url, setUrl] = useState('https://efootballhub.net/database');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testProxy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ird/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Fallo en la conexión' });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>🔧 Dashboard I.R.D. - Proxy para efootballhub.net</h1>
      <p>Prueba la API del proxy que acabamos de instalar:</p>
      
      <div style={{ marginTop: 20 }}>
        <input 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ 
            width: '100%', 
            padding: 10, 
            marginBottom: 10,
            border: '1px solid #ccc',
            borderRadius: 4
          }}
        />
        <button 
          onClick={testProxy}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Probando...' : 'Probar Proxy API'}
        </button>
      </div>

      {result && (
        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          background: '#f5f5f5', 
          borderRadius: 4 
        }}>
          <h3>Respuesta del API:</h3>
          <pre style={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            fontSize: 12
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 30, padding: 15, background: '#e8f5e9' }}>
        <h3>✅ Progreso del Sistema I.R.D.</h3>
        <ul>
          <li>✅ Aplicación desplegada en Vercel</li>
          <li>✅ Dashboard básico funcionando</li>
          <li>✅ API del proxy instalada</li>
          <li>🔲 Sistema de caché en memoria (siguiente paso)</li>
          <li>🔲 Panel de métricas en tiempo real</li>
          <li>🔲 Scraping real de efootballhub.net</li>
        </ul>
      </div>
    </div>
  );
}
