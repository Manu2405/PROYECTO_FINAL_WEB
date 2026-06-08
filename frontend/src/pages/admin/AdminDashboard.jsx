import React, { useEffect, useState } from 'react';

import { api } from '../../utils/api';



function formatBs(amount) {

  return `Bs. ${Number(amount).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

}



export default function AdminDashboard() {

  const [stats, setStats] = useState({ users: 0, bookings: 0, payments: 0, pendingPayments: 0, revenue: 0 });

  const [byStatus, setByStatus] = useState({});

  const [byArtist, setByArtist] = useState({});



  useEffect(() => {

    Promise.all([

      api.getAllUsers(),

      api.getAllBookings(),

      api.getAllPayments(),

    ]).then(([users, bookings, payments]) => {

      const statusCount = {};

      bookings.forEach((b) => {

        statusCount[b.estado] = (statusCount[b.estado] || 0) + 1;

      });



      const artistCount = {};

      bookings.forEach((b) => {

        const name = `${b.artista_nombre} ${b.artista_apellido}`;

        artistCount[name] = (artistCount[name] || 0) + 1;

      });



      const paid = payments.filter((p) => p.estado === 'pagado');

      const revenue = paid.reduce((s, p) => s + parseFloat(p.monto), 0);



      setStats({

        users: users.length,

        bookings: bookings.length,

        payments: payments.length,

        pendingPayments: payments.filter((p) => p.estado === 'pendiente').length,

        revenue,

      });

      setByStatus(statusCount);

      setByArtist(artistCount);

    }).catch(() => {});

  }, []);



  const maxStatus = Math.max(...Object.values(byStatus), 1);

  const maxArtist = Math.max(...Object.values(byArtist), 1);



  return (

    <div>

      <h1 style={{ marginBottom: '20px' }}>Panel de control</h1>

      <div className="grid-3" style={{ marginBottom: '32px' }}>

        <div className="glass stat-card"><h3>{stats.users}</h3><p>Usuarios</p></div>

        <div className="glass stat-card"><h3>{stats.bookings}</h3><p>Reservas</p></div>

        <div className="glass stat-card"><h3>{stats.payments}</h3><p>Pagos</p></div>

        <div className="glass stat-card"><h3>{stats.pendingPayments}</h3><p>Pagos pendientes</p></div>

        <div className="glass stat-card"><h3>{formatBs(stats.revenue)}</h3><p>Ingresos totales</p></div>

      </div>



      <div className="glass card" style={{ marginBottom: '24px' }}>

        <h2 style={{ marginBottom: '16px' }}>Reservas por estado</h2>

        <div className="bar-chart">

          {Object.entries(byStatus).map(([estado, count]) => (

            <div key={estado} className="bar-row">

              <span className="bar-label">{estado}</span>

              <div className="bar-track">

                <div className="bar-fill" style={{ width: `${(count / maxStatus) * 100}%` }}>{count}</div>

              </div>

            </div>

          ))}

        </div>

      </div>



      <div className="glass card">

        <h2 style={{ marginBottom: '16px' }}>Reservas por artista</h2>

        <div className="bar-chart">

          {Object.entries(byArtist).map(([name, count]) => (

            <div key={name} className="bar-row">

              <span className="bar-label">{name}</span>

              <div className="bar-track">

                <div className="bar-fill" style={{ width: `${(count / maxArtist) * 100}%` }}>{count}</div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

