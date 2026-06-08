import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="glass card" style={{ textAlign: 'center', padding: '60px' }}>
      <h1>404</h1>
      <p className="text-muted" style={{ margin: '16px 0' }}>Pagina no encontrada</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  );
}
