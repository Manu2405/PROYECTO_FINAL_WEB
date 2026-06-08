import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { api } from '../../utils/api';

import FileUpload from '../../components/FileUpload';



export default function DesignForm() {

  const { id } = useParams();

  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [form, setForm] = useState({ titulo: '', descripcion: '', estilo: '', visible_portafolio: true });

  const [imagen, setImagen] = useState(null);

  const [imagenName, setImagenName] = useState('');

  const [error, setError] = useState('');



  useEffect(() => {

    if (isEdit) {

      fetch(`/api/disenos/${id}`)

        .then((r) => r.json())

        .then((d) => setForm({

          titulo: d.titulo,

          descripcion: d.descripcion || '',

          estilo: d.estilo || '',

          visible_portafolio: d.visible_portafolio,

        }))

        .catch(() => {});

    }

  }, [id, isEdit]);



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    try {

      const fd = new FormData();

      fd.append('titulo', form.titulo);

      fd.append('descripcion', form.descripcion);

      fd.append('estilo', form.estilo);

      fd.append('visible_portafolio', form.visible_portafolio ? 'true' : 'false');

      if (imagen) fd.append('imagen', imagen);

      if (isEdit) await api.updateDesign(id, fd);

      else await api.createDesign(fd);

      navigate('/artista/portafolio');

    } catch (err) {

      setError(err.message);

    }

  };



  return (

    <div>

      <h1 className="page-title">{isEdit ? 'Editar' : 'Nuevo'} <span>diseño</span></h1>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit} className="glass card">

        <div className="form-group">

          <label className="label">Título</label>

          <input className="input" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />

        </div>

        <div className="form-group">

          <label className="label">Descripción</label>

          <textarea className="textarea" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

        </div>

        <div className="form-group">

          <label className="label">Estilo</label>

          <input className="input" value={form.estilo} onChange={(e) => setForm({ ...form, estilo: e.target.value })} />

        </div>

        <div className="form-group">

          <label className="label">

            <input type="checkbox" checked={form.visible_portafolio} onChange={(e) => setForm({ ...form, visible_portafolio: e.target.checked })} />

            {' '}Visible en portafolio

          </label>

        </div>

        <FileUpload

          label={`Imagen ${isEdit ? '(opcional)' : ''}`}

          onChange={(f) => { setImagen(f); setImagenName(f?.name || ''); }}

          fileName={imagenName}

        />

        <button type="submit" className="btn btn-primary">Guardar</button>

      </form>

    </div>

  );

}

