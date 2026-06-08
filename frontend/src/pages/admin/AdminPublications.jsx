import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';

export default function AdminPublications() {
  const [publications, setPublications] = useState([]);

  const load = () => api.getPublications().then(setPublications).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar publicacion?')) return;
    try {
      await api.deletePublication(id);
      load();
    } catch (e) {}
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Publicaciones</h1>
      <div className="grid-2">
        {publications.map((p) => (
          <div key={p.id_publicacion} className="glass card">
            <img src={p.imagen_url} alt="pub" />
            <p>{p.descripcion}</p>
            <p style={{ fontSize: '0.85rem' }}>{p.cliente_nombre}</p>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id_publicacion)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
