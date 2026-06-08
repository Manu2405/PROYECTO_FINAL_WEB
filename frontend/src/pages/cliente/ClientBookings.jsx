import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';

export default function ClientBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.getMyBookings().then(setBookings).catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Mis reservas</h1>
        <Link to="/artistas" className="btn btn-primary">Reservar con artista</Link>
      </div>
      {bookings.map((b) => (
        <div key={b.id_reserva} className="glass card" style={{ marginBottom: '12px' }}>
          <p><strong>#{b.id_reserva}</strong> - {b.artista_nombre} {b.artista_apellido}</p>
          <p className="text-muted">{new Date(b.fecha_reserva).toLocaleString()} - {b.zona_cuerpo}</p>
          <span className={`badge badge-${b.estado}`}>{b.estado}</span>
          {b.descuento_porcentaje > 0 && <span className="text-gold" style={{ marginLeft: '8px' }}>-{b.descuento_porcentaje}%</span>}
          <Link to={`/cliente/reservas/${b.id_reserva}`} style={{ marginLeft: '12px' }}>Detalle</Link>
        </div>
      ))}
    </div>
  );
}
