import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import Map from '../components/Map';
import { formatTime } from '../utils/time';

export default function Branches() {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    api.getBranches().then(setBranches).catch(() => {});
  }, []);

  return (
    <div className="branches-page">
      <header className="page-hero">
        <h1>Nuestras <span>sucursales</span></h1>
      </header>

      <Map branches={branches} />

      <div className="section-divider">
        <span>Listado de sucursales</span>
      </div>

      <div className="branch-grid">
        {branches.map((b) => {
          const img = b.imagenes?.[0] || b.imagen_url;
          return (
            <Link key={b.id_sucursal} to={`/sucursales/${b.id_sucursal}`} className="branch-card">
              {img && (
                <div className="branch-card-img img-contain-wrap">
                  <img src={img} alt={b.nombre} />
                </div>
              )}
              <div className="branch-card-content">
                <h3>{b.nombre}</h3>
                <p className="branch-address">{b.direccion}</p>
                <div className="branch-meta">
                  <span>Tel: {b.telefono}</span>
                  <span>Horario: {formatTime(b.horario_apertura)} – {formatTime(b.horario_cierre)}</span>
                </div>
                <span className="branch-cta">Ver sucursal</span>
              </div>
            </Link>
          );
        })}
      </div>

      {!branches.length && <p className="text-muted">No hay sucursales registradas.</p>}
    </div>
  );
}
