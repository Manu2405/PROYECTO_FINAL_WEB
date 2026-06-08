import React from 'react';
import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="glass card" style={{ textAlign: 'center', padding: '60px' }}>
      <h1>Sin permiso</h1>
      <p className="text-muted" style={{ margin: '16px 0' }}>No puedes acceder a esta seccion</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  );
}
