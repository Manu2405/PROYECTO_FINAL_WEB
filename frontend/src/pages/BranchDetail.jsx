import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import Map from '../components/Map';
import { formatTime } from '../utils/time';

export default function BranchDetail() {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    api.getBranchById(id).then(setBranch).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!branch?.imagenes?.length) return undefined;
    const t = setInterval(() => setSlide((s) => (s + 1) % branch.imagenes.length), 4000);
    return () => clearInterval(t);
  }, [branch]);

  if (!branch) return <p className="text-muted">Cargando...</p>;

  const imgs = branch.imagenes?.length ? branch.imagenes : (branch.imagen_url ? [branch.imagen_url] : []);
  const mapsLink = `https://www.google.com/maps?q=${branch.latitud},${branch.longitud}`;

  return (
    <div className="branch-detail">
      <Link to="/sucursales" className="text-muted text-sm">Volver a sucursales</Link>
      <h1 className="page-title branch-detail-title">{branch.nombre}</h1>

      {imgs.length > 0 && (
        <div className="branch-carousel">
          <div className="img-contain-wrap branch-carousel-img">
            <img src={imgs[slide]} alt={branch.nombre} />
          </div>
          {imgs.length > 1 && (
            <div className="carousel-dots">
              {imgs.map((_, i) => (
                <button key={i} type="button" className={i === slide ? 'active' : ''} onClick={() => setSlide(i)} />
              ))}
            </div>
          )}
        </div>
      )}

      {branch.descripcion && (
        <p className="branch-desc">{branch.descripcion}</p>
      )}

      <div className="branch-info-grid glass card">
        <div className="branch-info-item">
          <span className="branch-info-label">Dirección</span>
          <p className="branch-info-value">{branch.direccion}</p>
        </div>
        <div className="branch-info-item">
          <span className="branch-info-label">Teléfono</span>
          <p className="branch-info-value">{branch.telefono}</p>
        </div>
        <div className="branch-info-item">
          <span className="branch-info-label">Horario</span>
          <p className="branch-info-value">
            {formatTime(branch.horario_apertura)} – {formatTime(branch.horario_cierre)}
          </p>
        </div>
      </div>

      <section className="branch-location-section">
        <h2 className="section-title">Ubicación</h2>
        <p className="branch-location-address">{branch.direccion}</p>
        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm branch-maps-btn"
        >
          Abrir en Google Maps
        </a>
        <div className="branch-map-wrap">
          <Map branches={[branch]} />
        </div>
      </section>
    </div>
  );
}
