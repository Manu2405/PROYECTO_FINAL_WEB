import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ArtistPortfolio() {
  const { user } = useAuth();
  const [designs, setDesigns] = useState([]);

  const load = () => {
    fetch(`/api/disenos?id_artista=${user.id_usuario}`)
      .then((r) => r.json())
      .then(setDesigns)
      .catch(() => {});
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar diseno?')) return;
    try {
      await api.deleteDesign(id);
      load();
    } catch (e) {}
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Mi portafolio</h1>
        <Link to="/artista/portafolio/nuevo" className="btn btn-primary">Nuevo diseno</Link>
      </div>
      <div className="grid-3">
        {designs.map((d) => (
          <div key={d.id_diseno} className="glass card">
            <img src={d.imagen_url} alt={d.titulo} />
            <h3>{d.titulo}</h3>
            <p>{d.estilo} — {d.likes} likes</p>
            <p style={{ fontSize: '0.85rem' }}>{d.visible_portafolio ? 'Visible' : 'Oculto'} - {d.likes} likes</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Link to={`/artista/portafolio/${d.id_diseno}`} className="btn btn-secondary btn-sm">Editar</Link>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id_diseno)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
