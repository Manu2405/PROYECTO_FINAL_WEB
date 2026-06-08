import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    biografia: '',
    horario_inicio: '10:00',
    horario_fin: '18:00',
  });
  const [foto, setFoto] = useState(null);
  const [fotoName, setFotoName] = useState('');
  const [currentFotoUrl, setCurrentFotoUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getProfile().then((p) => {
      setProfile({
        nombre: p.nombre || '',
        apellido: p.apellido || '',
        telefono: p.telefono || '',
        biografia: p.biografia || '',
        horario_inicio: p.horario_inicio ? String(p.horario_inicio).slice(0, 5) : '10:00',
        horario_fin: p.horario_fin ? String(p.horario_fin).slice(0, 5) : '18:00',
      });
      setCurrentFotoUrl(p.foto_url || null);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      fd.append('nombre', profile.nombre);
      fd.append('apellido', profile.apellido);
      fd.append('telefono', profile.telefono);
      fd.append('biografia', profile.biografia);
      if (user?.rol === 'artista') {
        fd.append('horario_inicio', profile.horario_inicio);
        fd.append('horario_fin', profile.horario_fin);
      }
      if (foto) fd.append('foto', foto);

      const data = await api.updateProfile(fd);
      if (data.foto_url) setCurrentFotoUrl(data.foto_url);
      setFoto(null);
      setFotoName('');

      const stored = api.getCurrentUser();
      if (stored) {
        localStorage.setItem('user', JSON.stringify({
          ...stored,
          nombre: profile.nombre,
          apellido: profile.apellido,
          foto_url: data.foto_url || stored.foto_url,
        }));
        refreshUser();
      }

      setSuccess('Perfil actualizado');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Mi <span>perfil</span></h1>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <form onSubmit={handleSubmit} className="glass card">
        <div className="form-group">
          <label className="label">Nombre</label>
          <input className="input" value={profile.nombre} onChange={(e) => setProfile({ ...profile, nombre: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="label">Apellido</label>
          <input className="input" value={profile.apellido} onChange={(e) => setProfile({ ...profile, apellido: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="label">Teléfono</label>
          <input className="input" value={profile.telefono} onChange={(e) => setProfile({ ...profile, telefono: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="label">Biografía</label>
          <textarea className="textarea" rows={3} value={profile.biografia} onChange={(e) => setProfile({ ...profile, biografia: e.target.value })} />
        </div>
        {user?.rol === 'artista' && (
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Horario inicio</label>
              <input className="input" type="time" value={profile.horario_inicio} onChange={(e) => setProfile({ ...profile, horario_inicio: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Horario fin</label>
              <input className="input" type="time" value={profile.horario_fin} onChange={(e) => setProfile({ ...profile, horario_fin: e.target.value })} required />
            </div>
          </div>
        )}
        <FileUpload
          label="Foto de perfil"
          previewUrl={foto ? null : currentFotoUrl}
          onChange={(f) => { setFoto(f); setFotoName(f?.name || ''); }}
          fileName={fotoName}
          hint={currentFotoUrl ? 'Haz clic para cambiar la foto' : 'Haz clic para subir tu foto'}
        />
        <button type="submit" className="btn btn-primary">Guardar</button>
      </form>
    </div>
  );
}
