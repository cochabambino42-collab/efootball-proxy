'use client';
import { useState } from 'react';

export default function DashboardPage() {
  const [url, setUrl] = useState('https://efootballhub.net/database');
  
  return (
    <div style={{padding: 20}}>
      <h1>🚀 Dashboard I.R.D. - EN CONSTRUCCIÓN</h1>
      <p>Pronto tendrás aquí el panel completo para interactuar con efootballhub.net</p>
      <input 
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{width: '100%', padding: 8, marginTop: 10}}
      />
      <button style={{marginTop: 10, padding: 10}}>
        Probar Proxy
      </button>
    </div>
  );
  }
