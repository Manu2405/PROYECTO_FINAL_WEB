import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('todos');

  const load = () => api.getAllPayments().then(setPayments).catch(() => {});

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      await api.updatePaymentStatus(id, 'pagado');
      load();
    } catch (e) {}
  };

  const filtered = filter === 'todos' ? payments : payments.filter((p) => p.estado === filter);

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Pagos</h1>
      <select className="select" style={{ maxWidth: '200px', marginBottom: '16px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="todos">Todos</option>
        <option value="pendiente">Pendientes</option>
        <option value="pagado">Pagados</option>
      </select>
      {filtered.map((p) => (
        <div key={p.id_pago} className="glass card" style={{ marginBottom: '12px' }}>
          <p>Pago #{p.id_pago} - Reserva #{p.id_reserva} - Bs. {Number(p.monto).toLocaleString('es-BO')}</p>
          <p>{p.metodo_pago} - <span className={`badge badge-${p.estado === 'pagado' ? 'confirmada' : 'pendiente'}`}>{p.estado}</span></p>
          {p.comprobante_url && <a href={p.comprobante_url} target="_blank" rel="noreferrer">Comprobante</a>}
          {p.estado === 'pendiente' && (
            <button className="btn btn-primary btn-sm" style={{ marginTop: '8px' }} onClick={() => approve(p.id_pago)}>Aprobar</button>
          )}
        </div>
      ))}
    </div>
  );
}
