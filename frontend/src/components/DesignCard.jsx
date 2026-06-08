import React from 'react';
import { Link } from 'react-router-dom';

export default function DesignCard({ design, textOnly = false, showImage = true }) {
  if (textOnly) {
    return (
      <div className="design-card design-card-text">
        <div className="design-card-body">
          <h3>{design.titulo}</h3>
          {design.estilo && <span className="style-tag">{design.estilo}</span>}
          <Link to={`/artistas/${design.id_artista}`} className="design-artist-link">
            {design.artista_nombre} {design.artista_apellido}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="design-card">
      {showImage && (
        <div className="design-card-img-wrap img-contain-wrap">
          <img src={design.imagen_url} alt={design.titulo} loading="lazy" />
        </div>
      )}
      <div className="design-card-body">
        <h3>{design.titulo}</h3>
        {design.estilo && <span className="style-tag">{design.estilo}</span>}
        <Link to={`/artistas/${design.id_artista}`} className="design-artist-link">
          {design.artista_nombre} {design.artista_apellido}
        </Link>
      </div>
    </div>
  );
}
