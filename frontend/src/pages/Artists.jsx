import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Artists() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    api.getArtists().then(setArtists).catch(() => {});
  }, []);

  return (
    <div className="artists-page">
      <header className="page-hero">
        <h1>Nuestros <span>artistas</span></h1>
      </header>

      <div className="artist-grid">
        {artists.map((a) => (
          <Link key={a.id_usuario} to={`/artistas/${a.id_usuario}`} className="artist-card">
            <div className="artist-card-photo-wrap img-contain-wrap">
              <img
                src={a.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.nombre + ' ' + a.apellido)}&background=8B0000&color=D4AF37&size=256`}
                alt={`${a.nombre} ${a.apellido}`}
                className="artist-card-photo"
              />
            </div>
            <div className="artist-card-body">
              <h3>{a.nombre} {a.apellido}</h3>
              {a.sucursal_nombre && (
                <p className="artist-card-branch">{a.sucursal_nombre}</p>
              )}
              <div className="artist-card-specs">
                {(a.especialidades || []).length > 0 ? (
                  (a.especialidades || []).map((e) => (
                    <span key={e.id_especialidad || e.nombre} className="spec-tag">{e.nombre}</span>
                  ))
                ) : (
                  <span className="text-muted text-sm">Sin especialidades registradas</span>
                )}
              </div>
              <span className="artist-card-link">Ver perfil</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
