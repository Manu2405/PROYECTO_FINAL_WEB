import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';

export default function NewBooking() {
  const [searchParams] = useSearchParams();
  const [artists, setArtists] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [level, setLevel] = useState(null);
  const [form, setForm] = useState({
    id_artista: searchParams.get('artista') || '',
    id_diseno: '',
    fecha_reserva: '',
    zona_cuerpo: '',
    tamano: 'mediano',
    descripcion: '',
  });
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getArtists().then(setArtists).catch(() => {});
    api.getMyPoints().then(setLevel).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.id_artista) {
      fetch(`/api/disenos?id_artista=${form.id_artista}`)
        .then((r) => r.json())
        .then(setDesigns)
        .catch(() => {});
    }
  }, [form.id_artista]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (imagen) fd.append('imagen_referencia', imagen);
      const result = await api.createBooking(fd);
      navigate(`/cliente/reservas/${result.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Nueva reserva</h1>
      {level?.descuento_pendiente > 0 && (
        <div className="success-msg">
          Tienes un descuento del {level.descuento_pendiente}% que se aplicara a esta reserva
        </div>
      )}
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit} className="glass card">
        <div className="form-group">
          <label className="label">Artista</label>
          <select className="select" value={form.id_artista} onChange={(e) => setForm({ ...form, id_artista: e.target.value })} required>
            <option value="">Seleccionar</option>
            {artists.map((a) => (
              <option key={a.id_usuario} value={a.id_usuario}>{a.nombre} {a.apellido}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Diseno (opcional)</label>
          <select className="select" value={form.id_diseno} onChange={(e) => setForm({ ...form, id_diseno: e.target.value })}>
            <option value="">Ninguno</option>
            {designs.map((d) => (
              <option key={d.id_diseno} value={d.id_diseno}>{d.titulo}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Fecha y hora</label>
          <input className="input" type="datetime-local" value={form.fecha_reserva} onChange={(e) => setForm({ ...form, fecha_reserva: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="label">Zona del cuerpo</label>
          <input className="input" value={form.zona_cuerpo} onChange={(e) => setForm({ ...form, zona_cuerpo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="label">Tamano</label>
          <select className="select" value={form.tamano} onChange={(e) => setForm({ ...form, tamano: e.target.value })}>
            <option value="pequeno">Pequeno</option>
            <option value="mediano">Mediano</option>
            <option value="grande">Grande</option>
            <option value="extra_grande">Extra grande</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Descripcion</label>
          <textarea className="textarea" rows="3" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="label">Imagen de referencia</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />
        </div>
        <button type="submit" className="btn btn-primary">Solicitar reserva</button>
      </form>
    </div>
  );
}
