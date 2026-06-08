import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Specialties() {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [selected, setSelected] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSpecialties().then(setAll).catch(() => {});
    api.getArtistSpecialties(user.id_usuario).then((s) => setSelected(s.map((x) => x.id_especialidad))).catch(() => {});
  }, [user]);

  const toggle = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setError('');
    try {
      await api.updateArtistSpecialties(selected);
      setSuccess('Especialidades guardadas');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Mis especialidades</h1>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <div className="glass card">
        {all.map((s) => (
          <label key={s.id_especialidad} style={{ display: 'block', marginBottom: '8px' }}>
            <input type="checkbox" checked={selected.includes(s.id_especialidad)} onChange={() => toggle(s.id_especialidad)} />
            {' '}{s.nombre} - {s.descripcion}
          </label>
        ))}
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleSave}>Guardar</button>
      </div>
    </div>
  );
}
