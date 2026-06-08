import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';

export default function ClientDashboard() {
  const [level, setLevel] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.getMyPoints().then(setLevel).catch(() => {});
    api.getMyBookings().then((b) => setBookings(b.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Panel de control</h1>
      {level && (
        <div className="glass card" style={{ marginBottom: '24px' }}>
          <h2>Nivel: {level.nivel_actual}</h2>
          <p>Puntos: {level.puntos_totales}</p>
          {level.descuento_pendiente > 0 && (
            <p className="text-gold">Descuento pendiente: {level.descuento_pendiente}% en tu próxima reserva</p>
          )}
          <Link to="/cliente/fidelidad" className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>Ver fidelidad</Link>
        </div>
      )}
      <h2 style={{ marginBottom: '12px' }}>Próximas reservas</h2>
      {bookings.map((b) => (
        <div key={b.id_reserva} className="glass card" style={{ marginBottom: '12px' }}>
          <p>#{b.id_reserva} - {b.artista_nombre} - {new Date(b.fecha_reserva).toLocaleString()}</p>
          <span className={`badge badge-${b.estado}`}>{b.estado}</span>
          <Link to={`/cliente/reservas/${b.id_reserva}`} style={{ marginLeft: '12px' }}>Ver detalle</Link>
        </div>
      ))}
      <Link to="/artistas" className="btn btn-primary" style={{ marginTop: '12px' }}>Reservar con un artista</Link>
    </div>
  );
}
