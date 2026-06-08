import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';

export default function Redeem() {
  const [level, setLevel] = useState(null);
  const [bloques, setBloques] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => api.getMyPoints().then(setLevel).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleRedeem = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const result = await api.redeemPoints(bloques);
      setSuccess(result.message);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const descuento = bloques * 10;
  const puntos = bloques * 100;

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Canjear puntos</h1>
      <div className="glass card" style={{ marginBottom: '20px' }}>
        <p>Regla: 100 puntos = 10% de descuento</p>
        <p>Maximo: 300 puntos = 30% por canje</p>
        <p>Tus puntos: {level?.puntos_totales ?? 0}</p>
        {level?.descuento_pendiente > 0 && (
          <p className="text-gold">Ya tienes {level.descuento_pendiente}% pendiente para tu proxima reserva</p>
        )}
      </div>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <form onSubmit={handleRedeem} className="glass card">
        <div className="form-group">
          <label className="label">Bloques (1 a 3)</label>
          <select className="select" value={bloques} onChange={(e) => setBloques(parseInt(e.target.value))} disabled={level?.descuento_pendiente > 0}>
            <option value={1}>1 bloque - 10% (100 pts)</option>
            <option value={2}>2 bloques - 20% (200 pts)</option>
            <option value={3}>3 bloques - 30% (300 pts)</option>
          </select>
        </div>
        <p style={{ marginBottom: '16px' }}>Canjeas {puntos} puntos por {descuento}% de descuento en tu proxima reserva</p>
        <button type="submit" className="btn btn-primary" disabled={level?.descuento_pendiente > 0}>
          Canjear
        </button>
      </form>
    </div>
  );
}
