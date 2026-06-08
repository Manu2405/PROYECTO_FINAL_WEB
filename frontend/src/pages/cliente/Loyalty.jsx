import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { getLevelProgress, LOYALTY_LEVELS } from '../../utils/loyalty';

export default function Loyalty() {
  const [level, setLevel] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.getMyPoints().then(setLevel).catch(() => {});
    api.getMyPointsHistory().then(setHistory).catch(() => {});
  }, []);

  const progress = level ? getLevelProgress(level.nivel_actual, level.puntos_totales) : null;

  return (
    <div>
      <h1 className="page-title">Programa de <span>fidelidad</span></h1>
      {level && progress && (
        <div className="glass card loyalty-dashboard">
          <div className="loyalty-level-header">
            <h2>Nivel {level.nivel_actual}</h2>
            <span className="text-gold">{level.puntos_totales} pts</span>
          </div>
          <div className="loyalty-bar-track" style={{ height: '20px', marginBottom: '16px' }}>
            <div
              className="loyalty-bar-fill"
              style={{ width: `${progress.percent}%`, background: `linear-gradient(90deg, ${progress.level.color}, var(--color-secondary))` }}
            />
          </div>
          <div className="loyalty-levels-chart">
            {LOYALTY_LEVELS.map((l) => {
              const active = l.name === level.nivel_actual;
              const pct = active ? progress.percent : (level.puntos_totales >= l.min ? 100 : (level.puntos_totales / l.min) * 100);
              return (
                <div key={l.name} className={`level-bar-item ${active ? 'active' : ''}`}>
                  <span className="level-bar-label">{l.name}</span>
                  <div className="level-bar-track">
                    <div className="level-bar-fill" style={{ width: `${Math.min(100, pct)}%`, background: l.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          {level.descuento_pendiente > 0 ? (
            <p className="text-gold">Descuento pendiente: {level.descuento_pendiente}%</p>
          ) : (
            <p className="text-muted">Sin descuento pendiente</p>
          )}
          <Link to="/cliente/fidelidad/canjear" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Canjear puntos</Link>
        </div>
      )}
      <h2 style={{ marginBottom: '12px' }}>Historial</h2>
      {history.map((h) => (
        <div key={h.id_historial} className="glass card" style={{ marginBottom: '8px', padding: '12px' }}>
          <p>{h.puntos > 0 ? '+' : ''}{h.puntos} pts — {h.motivo}</p>
          <p className="text-muted text-xs">{new Date(h.fecha).toLocaleString('es-BO')}</p>
        </div>
      ))}
    </div>
  );
}
