import React, { useEffect, useState } from 'react';

import { api } from '../../utils/api';

import { parseMapCoordinates } from '../../utils/mapParser';



const FIELD_LABELS = {

  nombre: 'Nombre',

  descripcion: 'Descripción',

  direccion: 'Dirección',

  link_mapa: 'Enlace de mapa (Google Maps o Apple Maps)',

  telefono: 'Teléfono',

  email: 'Email',

  horario_apertura: 'Horario de apertura',

  horario_cierre: 'Horario de cierre',

  imagenes_urls: 'URLs de imágenes (1–5, una por línea)',

};



const empty = {

  nombre: '',

  descripcion: '',

  direccion: '',

  link_mapa: '',

  telefono: '',

  email: '',

  horario_apertura: '10:00',

  horario_cierre: '20:00',

  imagenes_urls: '',

};



export default function AdminBranches() {

  const [branches, setBranches] = useState([]);

  const [form, setForm] = useState(empty);

  const [editId, setEditId] = useState(null);

  const [error, setError] = useState('');



  const load = () => api.getBranchesAdmin().then(setBranches).catch(() => {});



  useEffect(() => { load(); }, []);



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');



    const coords = parseMapCoordinates(form.link_mapa);

    if (!coords) {

      setError('No se pudieron leer las coordenadas del enlace. Copia el enlace completo desde Google Maps o Apple Maps.');

      return;

    }



    const payload = {

      nombre: form.nombre,

      descripcion: form.descripcion,

      direccion: form.direccion,

      telefono: form.telefono,

      email: form.email,

      horario_apertura: form.horario_apertura,

      horario_cierre: form.horario_cierre,

      link_mapa: form.link_mapa,

      latitud: coords.lat,

      longitud: coords.lng,

      imagenes: form.imagenes_urls.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 5),

    };



    try {

      if (editId) await api.updateBranch(editId, payload);

      else await api.createBranch(payload);

      setForm(empty);

      setEditId(null);

      load();

    } catch (err) {

      setError(err.message);

    }

  };



  const startEdit = (b) => {

    setEditId(b.id_sucursal);

    setForm({

      nombre: b.nombre,

      descripcion: b.descripcion || '',

      direccion: b.direccion,

      link_mapa: `https://www.google.com/maps?q=${b.latitud},${b.longitud}`,

      telefono: b.telefono || '',

      email: b.email || '',

      horario_apertura: b.horario_apertura,

      horario_cierre: b.horario_cierre,

      imagenes_urls: (b.imagenes || []).join('\n'),

    });

    setError('');

  };



  const handleDelete = async (id) => {

    if (!window.confirm('¿Eliminar sucursal?')) return;

    try {

      await api.deleteBranch(id);

      load();

    } catch (e) {}

  };



  const fields = Object.keys(empty);



  return (

    <div>

      <h1 style={{ marginBottom: '20px' }}>Sucursales</h1>

      <form onSubmit={handleSubmit} className="glass card" style={{ marginBottom: '24px' }}>

        <h3>{editId ? 'Editar' : 'Nueva'} sucursal</h3>

        <p className="text-muted text-sm" style={{ marginBottom: '16px' }}>

          Pega el enlace de ubicación desde Google Maps o Apple Maps. Las coordenadas se extraen automáticamente para el mapa del inicio.

        </p>

        {error && <div className="error-msg">{error}</div>}

        {fields.map((key) => (

          <div key={key} className="form-group">

            <label className="label">{FIELD_LABELS[key]}</label>

            {key === 'imagenes_urls' ? (

              <textarea className="textarea" rows={3} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder="https://..." />

            ) : (

              <input

                className="input"

                type={key.includes('horario') ? 'time' : 'text'}

                value={form[key]}

                onChange={(e) => setForm({ ...form, [key]: e.target.value })}

                required={['nombre', 'direccion', 'link_mapa'].includes(key)}

                placeholder={key === 'link_mapa' ? 'https://maps.google.com/... o https://maps.apple.com/...' : ''}

              />

            )}

          </div>

        ))}

        <button type="submit" className="btn btn-primary">{editId ? 'Actualizar' : 'Crear'}</button>

        {editId && (

          <button type="button" className="btn btn-secondary" style={{ marginLeft: '8px' }} onClick={() => { setEditId(null); setForm(empty); setError(''); }}>

            Cancelar

          </button>

        )}

      </form>

      {branches.map((b) => (

        <div key={b.id_sucursal} className="glass card" style={{ marginBottom: '12px' }}>

          <h3>{b.nombre}</h3>

          <p>{b.direccion}</p>

          <p className="text-muted text-sm">Coordenadas: {b.latitud}, {b.longitud}</p>

          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(b)}>Editar</button>

          <button className="btn btn-danger btn-sm" style={{ marginLeft: '8px' }} onClick={() => handleDelete(b.id_sucursal)}>Eliminar</button>

        </div>

      ))}

    </div>

  );

}

