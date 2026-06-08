import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DesignCard from '../components/DesignCard';
import { formatTime } from '../utils/time';

export default function ArtistProfile() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [reviews, setReviews] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getArtists().then((list) => {
      setArtist(list.find((a) => a.id_usuario === parseInt(id, 10)) || null);
    });

    const token = localStorage.getItem('token');
    fetch(`/api/disenos?id_artista=${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then(setDesigns)
      .catch(() => {});

    api.getReviewsByArtist(id).then(setReviews).catch(() => {});
  }, [id]);

  const handleReservar = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/reservar?artista=${id}`);
  };

  if (!artist) return <p>Cargando...</p>;

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.puntuacion, 0) / reviews.length).toFixed(1)
    : 'N/A';

  const canReserve = !user || user.rol === 'cliente';

  return (
    <div className="artist-profile-page">
      <div className="artist-hero glass">
        <div className="artist-hero-photo-wrap img-contain-wrap">
          <img
            src={artist.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.nombre)}&background=8B0000&color=D4AF37`}
            alt={artist.nombre}
            className="artist-hero-photo"
          />
        </div>
        <div className="artist-hero-info">
          <h1>{artist.nombre} {artist.apellido}</h1>
          {artist.sucursal_nombre && <p className="text-muted">{artist.sucursal_nombre}</p>}
          {artist.horario_inicio && (
            <p className="text-sm">Horario: {formatTime(artist.horario_inicio)} – {formatTime(artist.horario_fin)}</p>
          )}
          {artist.biografia && <p className="artist-hero-bio">{artist.biografia}</p>}
          <div className="artist-hero-specs">
            {(artist.especialidades || []).map((e) => (
              <span key={e.id_especialidad || e.nombre} className="spec-tag">{e.nombre}</span>
            ))}
          </div>
          <p className="artist-hero-rating">Calificación: {avg} / 5 ({reviews.length} reseñas)</p>
          {canReserve && (
            <button type="button" className="btn btn-primary" onClick={handleReservar}>
              Reservar
            </button>
          )}
        </div>
      </div>

      <h2 className="section-title">Portafolio</h2>
      {designs.length > 0 ? (
        <div className="design-grid">
          {designs.map((d) => (
            <DesignCard key={d.id_diseno} design={d} />
          ))}
        </div>
      ) : (
        <p className="text-muted">Sin diseños en portafolio.</p>
      )}

      <h2 className="section-title section-title-spaced">Reseñas</h2>
      {reviews.length === 0 && <p className="text-muted">Sin reseñas.</p>}
      {reviews.map((r) => (
        <div key={r.id_resena} className="glass card review-card">
          <p className="review-score">{r.puntuacion} / 5</p>
          <p>{r.comentario}</p>
          <p className="text-muted text-xs">{r.cliente_nombre} {r.cliente_apellido}</p>
        </div>
      ))}
    </div>
  );
}
