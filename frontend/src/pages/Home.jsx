import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { BRAND_NAME } from '../utils/constants';

const LOGO_SRC = '/images/logo_estudio.png';
const VIDEO_INICIO = '/videos/video_inicio.mp4';
const VIDEO_DESCRIPCION = '/videos/video_descripcion.mp4';

export default function Home() {
  const [designs, setDesigns] = useState([]);
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    fetch('/api/disenos?sort=likes')
      .then((r) => r.json())
      .then(setDesigns)
      .catch(() => {});
    api.getPublications().then(setPublications).catch(() => {});
  }, []);

  const featured = useMemo(
    () => [...designs].sort((a, b) => b.likes - a.likes).slice(0, 5),
    [designs],
  );

  const carouselItems = useMemo(() => {
    if (!designs.length) return [];
    return [...designs, ...designs];
  }, [designs]);

  const latestPosts = publications.slice(0, 2);

  return (
    <div className="home-page">
      <section className="home-hero-video home-full-bleed">
        <video
          className="home-hero-video-el"
          src={VIDEO_INICIO}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="home-hero-video-overlay">
          <h1 className="home-hero-brand">{BRAND_NAME}</h1>
        </div>
      </section>

      <section className="home-intro container">
        <div className="home-intro-media">
          <video
            className="home-intro-video"
            src={VIDEO_DESCRIPCION}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
        <div className="home-intro-text">
          <h2 className="home-intro-title">{BRAND_NAME}</h2>
          <p className="home-intro-desc">
            Bienvenido a nuestro estudio de tatuajes. Ofrecemos diseños personalizados,
            artistas especializados en distintos estilos, reservas en línea, atención en
            múltiples sucursales y un espacio para compartir tu arte con la comunidad.
          </p>
          <Link to="/artistas" className="btn btn-primary home-cta-btn">RESERVA YA</Link>
        </div>
      </section>

      <section className="home-section container">
        <h2 className="home-section-title">ALGUNOS DE NUESTROS TATUAJES</h2>
        {featured.length > 0 ? (
          <>
            <div className="home-featured-grid">
              {featured.map((d) => (
                <Link key={d.id_diseno} to={`/artistas/${d.id_artista}`} className="home-tattoo-card">
                  <div className="img-contain-wrap">
                    <img src={d.imagen_url} alt={d.titulo} />
                  </div>
                  <div className="home-tattoo-card-info">
                    <span>{d.titulo}</span>
                    <small>{d.artista_nombre} {d.artista_apellido}</small>
                  </div>
                </Link>
              ))}
            </div>
            <div className="home-section-footer">
              <Link to="/estilos" className="btn btn-secondary">Ver más</Link>
            </div>
          </>
        ) : (
          <p className="text-muted">Aún no hay tatuajes publicados.</p>
        )}
      </section>

      <section className="home-community-block home-full-bleed">
        <div className="container home-community-inner">
          <div className="home-community-posts">
            <h3 className="home-block-label">Comunidad</h3>
            {latestPosts.length > 0 ? (
              <div className="home-community-grid">
                {latestPosts.map((p) => (
                  <Link key={p.id_publicacion} to="/comunidad" className="home-community-card">
                    <div className="img-contain-wrap">
                      <img src={p.imagen_url} alt={p.descripcion || 'Publicación'} />
                    </div>
                    <p className="home-community-card-text">{p.descripcion || 'Ver publicación'}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted">Sin publicaciones recientes.</p>
            )}
            <Link to="/comunidad" className="btn btn-secondary btn-sm home-community-more">
              Ver más publicaciones
            </Link>
          </div>
          <div className="home-community-logo">
            <img src={LOGO_SRC} alt={`Logo ${BRAND_NAME}`} />
          </div>
        </div>
      </section>

      {designs.length > 0 && (
        <section className="home-marquee-section home-full-bleed">
          <div className="home-marquee-wrap">
            <div
              className="home-marquee-track"
              style={{ '--marquee-duration': `${Math.max(designs.length * 5, 20)}s` }}
            >
              {carouselItems.map((d, i) => (
                <Link
                  key={`${d.id_diseno}-${i}`}
                  to={`/artistas/${d.id_artista}`}
                  className="home-marquee-item"
                >
                  <div className="img-contain-wrap">
                    <img src={d.imagen_url} alt={d.titulo} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
