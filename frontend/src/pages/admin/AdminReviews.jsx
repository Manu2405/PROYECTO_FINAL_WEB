import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  const load = () => api.getAllReviews().then(setReviews).catch(() => {});

  useEffect(() => { load(); }, []);

  const toggle = async (id, estado) => {
    try {
      await api.toggleReviewStatus(id, !estado);
      load();
    } catch (e) {}
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Reseñas</h1>
      {reviews.map((r) => (
        <div key={r.id_resena} className="glass card" style={{ marginBottom: '12px' }}>
          <p>{r.puntuacion} / 5 — {r.cliente_nombre} sobre {r.artista_nombre}</p>
          <p>{r.comentario}</p>
          <p style={{ fontSize: '0.85rem' }}>{r.estado ? 'Visible' : 'Oculta'}</p>
          <button className="btn btn-secondary btn-sm" onClick={() => toggle(r.id_resena, r.estado)}>
            {r.estado ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      ))}
    </div>
  );
}
