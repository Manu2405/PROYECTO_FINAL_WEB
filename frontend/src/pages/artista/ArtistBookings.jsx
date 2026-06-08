import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';

export default function ArtistBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.getArtistBookings().then(setBookings).catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Mis reservas</h1>
      {bookings.map((b) => (
        <div key={b.id_reserva} className="glass card" style={{ marginBottom: '12px' }}>
          <p>#{b.id_reserva} - {b.cliente_nombre} {b.cliente_apellido}</p>
          <p className="text-muted">{new Date(b.fecha_reserva).toLocaleString()} - {b.zona_cuerpo}</p>
          <span className={`badge badge-${b.estado}`}>{b.estado}</span>
          <Link to={`/artista/reservas/${b.id_reserva}`} style={{ marginLeft: '12px' }}>Detalle</Link>
        </div>
      ))}
    </div>
  );
}
