import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { parseMapCoordinates, resolveMapCoordinates } from '../../utils/mapParser';
import MultiFileUpload from '../../components/MultiFileUpload';

const FIELD_LABELS = {
  nombre: 'Nombre',
  descripcion: 'Descripción',
  direccion: 'Dirección',
  link_mapa: 'Enlace de mapa (Google Maps o Apple Maps)',
  telefono: 'Teléfono',
  email: 'Email',
  horario_apertura: 'Horario de apertura',
  horario_cierre: 'Horario de cierre',
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
};

export default function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(empty);
  const [imagenes, setImagenes] = useState([]);
  const [existingImagenes, setExistingImagenes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.getBranchesAdmin().then(setBranches).catch(() => {});

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(empty);
    setImagenes([]);
    setExistingImagenes([]);
    setEditId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let coords = parseMapCoordinates(form.link_mapa);
    if (!coords) {
      try {
        coords = await resolveMapCoordinates(form.link_mapa, api.resolveMapCoordinates);
      } catch {
        coords = null;
      }
    }
    if (!coords) {
      setError('No se pudieron leer las coordenadas del enlace. Copia el enlace completo desde Google Maps o Apple Maps.');
      return;
    }

    const fd = new FormData();
    fd.append('nombre', form.nombre);
    fd.append('descripcion', form.descripcion);
    fd.append('direccion', form.direccion);
    fd.append('telefono', form.telefono);
    fd.append('email', form.email);
    fd.append('horario_apertura', form.horario_apertura);
    fd.append('horario_cierre', form.horario_cierre);
    fd.append('link_mapa', form.link_mapa);
    fd.append('latitud', coords.lat);
    fd.append('longitud', coords.lng);
    imagenes.forEach((file) => fd.append('imagenes', file));

    try {
      if (editId) await api.updateBranch(editId, fd);
      else await api.createBranch(fd);
      resetForm();
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
    });
    setExistingImagenes(b.imagenes || []);
    setImagenes([]);
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
            <input
              className="input"
              type={key.includes('horario') ? 'time' : 'text'}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={['nombre', 'direccion', 'link_mapa'].includes(key)}
              placeholder={key === 'link_mapa' ? 'https://maps.google.com/... o https://maps.apple.com/...' : ''}
            />
          </div>
        ))}
        <div className="form-group">
          <MultiFileUpload
            label="Imágenes (1–5, opcional)"
            files={imagenes}
            onChange={setImagenes}
            existingUrls={editId ? existingImagenes : []}
            maxFiles={5}
          />
          {editId && existingImagenes.length > 0 && imagenes.length === 0 && (
            <p className="text-muted text-sm" style={{ marginTop: '8px' }}>
              Las imágenes actuales se conservarán si no subes nuevas. Al subir imágenes nuevas, reemplazarán las existentes.
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && (
          <button type="button" className="btn btn-secondary" style={{ marginLeft: '8px' }} onClick={resetForm}>
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
