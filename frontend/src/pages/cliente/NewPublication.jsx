import React, { useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { api } from '../../utils/api';

import FileUpload from '../../components/FileUpload';



export default function NewPublication() {

  const [artists, setArtists] = useState([]);

  const [form, setForm] = useState({ id_artista: '', descripcion: '', zona_cuerpo: '' });

  const [imagen, setImagen] = useState(null);

  const [imagenName, setImagenName] = useState('');

  const [error, setError] = useState('');

  const navigate = useNavigate();

  const now = new Date();



  useEffect(() => {

    api.getArtists().then(setArtists).catch(() => {});

  }, []);



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    try {

      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      fd.append('fecha_tatuaje', now.toISOString().split('T')[0]);

      fd.append('imagen', imagen);

      await api.createPublication(fd);

      navigate('/comunidad');

    } catch (err) {

      setError(err.message);

    }

  };



  return (

    <div>

      <Link to="/comunidad" className="text-muted text-sm">Volver a comunidad</Link>

      <h1 className="page-title" style={{ marginTop: '12px' }}>Publicar</h1>

      <p className="text-muted text-sm" style={{ marginBottom: '16px' }}>

        Fecha y hora: {now.toLocaleString('es-BO')}

      </p>

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

          <label className="label">Zona del cuerpo</label>

          <input className="input" value={form.zona_cuerpo} onChange={(e) => setForm({ ...form, zona_cuerpo: e.target.value })} />

        </div>

        <div className="form-group">

          <label className="label">Descripción</label>

          <textarea className="textarea" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

        </div>

        <FileUpload

          label="Imagen del tatuaje"

          onChange={(f) => { setImagen(f); setImagenName(f?.name || ''); }}

          fileName={imagenName}

        />

        <button type="submit" className="btn btn-primary" disabled={!imagen}>Publicar</button>

      </form>

    </div>

  );

}

