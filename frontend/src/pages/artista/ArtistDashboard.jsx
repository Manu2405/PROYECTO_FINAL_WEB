import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';

export default function ArtistDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.getArtistBookings().then((b) => setBookings(b.slice(0, 5))).catch(() => {});
  }, []);

  const pendientes = bookings.filter((b) => b.estado === 'pendiente').length;

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Panel de control</h1>
      <div className="glass card" style={{ marginBottom: '24px' }}>
        <p>Reservas pendientes: <strong>{pendientes}</strong></p>
        <Link to="/artista/reservas" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>Ver todas</Link>
      </div>
      <h2 style={{ marginBottom: '12px' }}>Ultimas reservas</h2>
      {bookings.map((b) => (
        <div key={b.id_reserva} className="glass card" style={{ marginBottom: '12px' }}>
          <p>#{b.id_reserva} - {b.cliente_nombre} - {new Date(b.fecha_reserva).toLocaleString()}</p>
          <span className={`badge badge-${b.estado}`}>{b.estado}</span>
          <Link to={`/artista/reservas/${b.id_reserva}`} style={{ marginLeft: '12px' }}>Gestionar</Link>
        </div>
      ))}
    </div>
  );
}
