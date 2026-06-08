import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { formatBs } from '../../utils/currency';

const estadoLabel = { pendiente: 'Pendiente', confirmada: 'Aprobada', cancelada: 'Cancelada', finalizada: 'Finalizada' };

export default function ArtistBookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('resumen');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [estimation, setEstimation] = useState({ precio_estimado: '', adelanto: '' });
  const [sessionForm, setSessionForm] = useState({
    numero_sesion: 1,
    fecha_inicio: '',
    fecha_fin: '',
    observaciones: '',
  });

  const load = () => {
    api.getBookingById(id).then((b) => {
      setBooking(b);
      setEstimation({ precio_estimado: b.precio_estimado, adelanto: b.adelanto });
    }).catch(() => {});
    api.getSessions(id).then(setSessions).catch(() => {});
    api.getPayments(id).then(setPayments).catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  const changeStatus = async (estado) => {
    try {
      await api.updateBookingStatus(id, estado);
      setSuccess(`Estado: ${estado}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveEstimation = async (e) => {
    e.preventDefault();
    try {
      await api.updateBookingEstimation(id, estimation.precio_estimado, estimation.adelanto);
      setSuccess('Cotizacion guardada');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    try {
      await api.createSession({
        id_reserva: parseInt(id),
        ...sessionForm,
        numero_sesion: parseInt(sessionForm.numero_sesion),
      });
      setSuccess('Sesion creada');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await api.deleteSession(sessionId);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!booking) return <p>Cargando...</p>;

  return (
    <div>
      <h1 style={{ marginBottom: '16px' }}>Reserva #{id}</h1>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="tabs">
        <button className={`tab ${tab === 'resumen' ? 'active' : ''}`} onClick={() => setTab('resumen')}>Resumen</button>
        <button className={`tab ${tab === 'sesiones' ? 'active' : ''}`} onClick={() => setTab('sesiones')}>Sesiones</button>
        <button className={`tab ${tab === 'pagos' ? 'active' : ''}`} onClick={() => setTab('pagos')}>Pagos</button>
      </div>

      {tab === 'resumen' && (
        <div className="glass card">
          <p>Cliente: {booking.cliente_nombre} {booking.cliente_apellido}</p>
          <p>Estado: <span className={`badge badge-${booking.estado}`}>{estadoLabel[booking.estado] || booking.estado}</span></p>
          <p>Fecha: {new Date(booking.fecha_reserva).toLocaleString()}</p>
          <p>Zona: {booking.zona_cuerpo} - {booking.tamano}</p>
          {booking.imagen_referencia_url && <img src={booking.imagen_referencia_url} alt="ref" style={{ maxWidth: '300px', marginTop: '12px', borderRadius: '8px' }} />}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {booking.estado === 'pendiente' && <button className="btn btn-primary btn-sm" onClick={() => changeStatus('confirmada')}>Aprobar</button>}
            {['pendiente', 'confirmada'].includes(booking.estado) && <button className="btn btn-danger btn-sm" onClick={() => changeStatus('cancelada')}>Cancelar</button>}
            {booking.estado === 'confirmada' && <button className="btn btn-primary btn-sm" onClick={() => changeStatus('finalizada')}>Finalizar</button>}
          </div>
          <form onSubmit={saveEstimation} style={{ marginTop: '20px' }}>
            <h3>Cotizacion</h3>
            <div className="form-group">
              <label className="label">Precio estimado</label>
              <input className="input" type="number" value={estimation.precio_estimado} onChange={(e) => setEstimation({ ...estimation, precio_estimado: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Adelanto</label>
              <input className="input" type="number" value={estimation.adelanto} onChange={(e) => setEstimation({ ...estimation, adelanto: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-secondary">Guardar cotizacion</button>
          </form>
        </div>
      )}

      {tab === 'sesiones' && (
        <div>
          {sessions.map((s) => (
            <div key={s.id_sesion} className="glass card" style={{ marginBottom: '12px' }}>
              <p>Sesion #{s.numero_sesion} - {s.estado}</p>
              <p>{new Date(s.fecha_inicio).toLocaleString()} - {new Date(s.fecha_fin).toLocaleString()}</p>
              <button className="btn btn-danger btn-sm" onClick={() => deleteSession(s.id_sesion)}>Eliminar</button>
            </div>
          ))}
          <form onSubmit={createSession} className="glass card" style={{ marginTop: '16px' }}>
            <h3>Nueva sesion</h3>
            <div className="form-group">
              <label className="label">Numero</label>
              <input className="input" type="number" value={sessionForm.numero_sesion} onChange={(e) => setSessionForm({ ...sessionForm, numero_sesion: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Inicio</label>
              <input className="input" type="datetime-local" value={sessionForm.fecha_inicio} onChange={(e) => setSessionForm({ ...sessionForm, fecha_inicio: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Fin</label>
              <input className="input" type="datetime-local" value={sessionForm.fecha_fin} onChange={(e) => setSessionForm({ ...sessionForm, fecha_fin: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Observaciones</label>
              <textarea className="textarea" rows="2" value={sessionForm.observaciones} onChange={(e) => setSessionForm({ ...sessionForm, observaciones: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Crear sesion</button>
          </form>
        </div>
      )}

      {tab === 'pagos' && (
        <div>
          {payments.map((p) => (
            <div key={p.id_pago} className="glass card" style={{ marginBottom: '12px' }}>
              <p>{formatBs(p.monto)} — {p.metodo_pago} — {p.estado}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
