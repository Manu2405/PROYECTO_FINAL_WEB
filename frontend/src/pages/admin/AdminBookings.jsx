import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.getAllBookings().then(setBookings).catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Todas las reservas</h1>
      {bookings.map((b) => (
        <div key={b.id_reserva} className="glass card" style={{ marginBottom: '12px' }}>
          <p>#{b.id_reserva} - {b.cliente_nombre} con {b.artista_nombre}</p>
          <p className="text-muted">{new Date(b.fecha_reserva).toLocaleString()}</p>
          <span className={`badge badge-${b.estado}`}>{b.estado}</span>
        </div>
      ))}
    </div>
  );
}
