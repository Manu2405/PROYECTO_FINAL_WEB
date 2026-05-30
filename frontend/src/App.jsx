import React from 'react';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0c0c0e',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Sacred Ink Tattoo Studio</h1>
      <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginBottom: '20px' }}>
        Frontend base inicializado correctamente con React y Vite.
      </p>
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '15px 25px',
        fontSize: '0.95rem'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Librerías instaladas listas para usar:</p>
        <ul style={{ textAlign: 'left', margin: '0', paddingLeft: '20px', color: '#e4e4e7' }}>
          <li><code>leaflet</code> &amp; <code>react-leaflet</code> (OpenStreetMap)</li>
          <li><code>react-router-dom</code> (Enrutamiento)</li>
          <li><code>lucide-react</code> (Iconos)</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
