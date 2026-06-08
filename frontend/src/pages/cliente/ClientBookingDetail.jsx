import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { formatBs } from '../../utils/currency';

const estadoLabel = { pendiente: 'Pendiente', confirmada: 'Aprobada', cancelada: 'Cancelada', finalizada: 'Finalizada' };
const tamanoLabel = { pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande', extra_grande: 'Extra grande' };

export default function ClientBookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('resumen');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [review, setReview] = useState({ puntuacion: 5, comentario: '' });
  const [existingReview, setExistingReview] = useState(null);
  const [payForm, setPayForm] = useState({ monto: '', metodo_pago: 'efectivo', referencia_transaccion: '' });
  const [comprobante, setComprobante] = useState(null);

  const load = () => {
    api.getBookingById(id).then(setBooking).catch(() => {});
    api.getSessions(id).then(setSessions).catch(() => {});
    api.getPayments(id).then(setPayments).catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (booking?.id_artista) {
      api.getReviewsByArtist(booking.id_artista).then((revs) => {
        const found = revs.find((r) => r.id_reserva === parseInt(id));
        setExistingReview(found || null);
      }).catch(() => {});
    }
  }, [booking, id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancelar esta reserva?')) return;
    try {
      await api.updateBookingStatus(id, 'cancelada', 'Cancelada por el cliente');
      setSuccess('Reserva cancelada');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      fd.append('id_reserva', id);
      fd.append('monto', payForm.monto);
      fd.append('metodo_pago', payForm.metodo_pago);
      if (payForm.referencia_transaccion) fd.append('referencia_transaccion', payForm.referencia_transaccion);
      if (comprobante) fd.append('comprobante', comprobante);
      await api.createPayment(fd);
      setSuccess('Pago registrado');
      setPayForm({ monto: '', metodo_pago: 'efectivo', referencia_transaccion: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await api.createReview({ id_reserva: parseInt(id), puntuacion: review.puntuacion, comentario: review.comentario });
      setSuccess('Reseña enviada');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!booking) return <p>Cargando...</p>;

  const canCancel = ['pendiente', 'confirmada'].includes(booking.estado);

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
          <p>Estado: <span className={`badge badge-${booking.estado}`}>{estadoLabel[booking.estado] || booking.estado}</span></p>
          <p>Artista: {booking.artista_nombre} {booking.artista_apellido}</p>
          <p>Fecha: {new Date(booking.fecha_reserva).toLocaleString('es-BO')}</p>
          <p>Zona: {booking.zona_cuerpo} — Tamaño: {tamanoLabel[booking.tamano] || booking.tamano}</p>
          <p>Precio estimado: {formatBs(booking.precio_estimado)}</p>
          <p>Adelanto: {formatBs(booking.adelanto)}</p>
          {booking.descuento_porcentaje > 0 && <p className="text-gold">Descuento aplicado: {booking.descuento_porcentaje}%</p>}
          {booking.descripcion && <p>{booking.descripcion}</p>}
          {booking.imagen_referencia_url && <img src={booking.imagen_referencia_url} alt="ref" style={{ maxWidth: '300px', marginTop: '12px', borderRadius: '8px' }} />}
          {canCancel && (
            <button className="btn btn-danger" style={{ marginTop: '16px' }} onClick={handleCancel}>Cancelar mi reserva</button>
          )}
          {booking.estado === 'finalizada' && !existingReview && (
            <form onSubmit={handleReview} style={{ marginTop: '20px' }}>
              <h3>Dejar resena</h3>
              <div className="form-group">
                <label className="label">Puntuacion (1-5)</label>
                <input className="input" type="number" min="1" max="5" value={review.puntuacion} onChange={(e) => setReview({ ...review, puntuacion: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Comentario</label>
                <textarea className="textarea" rows="3" value={review.comentario} onChange={(e) => setReview({ ...review, comentario: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary">Enviar reseña</button>
            </form>
          )}
          {existingReview && <p className="text-gold" style={{ marginTop: '16px' }}>Ya dejaste tu reseña</p>}
        </div>
      )}

      {tab === 'sesiones' && (
        <div>
          {sessions.length === 0 && <p>No hay sesiones programadas</p>}
          {sessions.map((s) => (
            <div key={s.id_sesion} className="glass card" style={{ marginBottom: '12px' }}>
              <p>Sesion #{s.numero_sesion} - {s.estado}</p>
              <p>{new Date(s.fecha_inicio).toLocaleString()} a {new Date(s.fecha_fin).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'pagos' && (
        <div>
          {payments.map((p) => (
            <div key={p.id_pago} className="glass card" style={{ marginBottom: '12px' }}>
              <p>{formatBs(p.monto)} — {p.metodo_pago} — {p.estado}</p>
              {p.comprobante_url && <a href={p.comprobante_url} target="_blank" rel="noreferrer">Ver comprobante</a>}
            </div>
          ))}
          <form onSubmit={handlePayment} className="glass card" style={{ marginTop: '16px' }}>
            <h3>Registrar pago</h3>
            <div className="form-group">
              <label className="label">Monto</label>
              <input className="input" type="number" step="0.01" value={payForm.monto} onChange={(e) => setPayForm({ ...payForm, monto: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Metodo</label>
              <select className="select" value={payForm.metodo_pago} onChange={(e) => setPayForm({ ...payForm, metodo_pago: e.target.value })}>
                <option value="efectivo">Efectivo</option>
                <option value="qr">QR</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Referencia</label>
              <input className="input" value={payForm.referencia_transaccion} onChange={(e) => setPayForm({ ...payForm, referencia_transaccion: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Comprobante</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => setComprobante(e.target.files[0])} />
            </div>
            <button type="submit" className="btn btn-primary">Registrar</button>
          </form>
        </div>
      )}
    </div>
  );
}
