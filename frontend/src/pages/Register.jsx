import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import FileUpload from '../components/FileUpload';

export default function Register() {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', telefono: '' });
  const [foto, setFoto] = useState(null);
  const [fotoName, setFotoName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (foto) fd.append('foto', foto);
      const data = await api.register(fd);
      setSuccess(data.message || 'Revisa tu correo para confirmar tu cuenta.');
      setForm({ nombre: '', apellido: '', email: '', password: '', telefono: '' });
      setFoto(null);
      setFotoName('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="glass card" style={{ maxWidth: '450px', margin: '40px auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Registro</h1>
      {success && <div className="success-msg">{success}</div>}
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Nombre</label>
          <input className="input" name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="label">Apellido</label>
          <input className="input" name="apellido" value={form.apellido} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="label">Contrasena</label>
          <input className="input" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="label">Telefono</label>
          <input className="input" name="telefono" value={form.telefono} onChange={handleChange} />
        </div>
        <FileUpload
          label="Foto (opcional)"
          onChange={(f) => { setFoto(f); setFotoName(f?.name || ''); }}
          fileName={fotoName}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!!success}>Registrarse</button>
      </form>
      {success && (
        <Link to="/login" className="btn btn-secondary" style={{ width: '100%', marginTop: '12px', textAlign: 'center' }}>
          Ir a iniciar sesión
        </Link>
      )}
      <p className="text-muted" style={{ marginTop: '16px' }}>
        ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}
