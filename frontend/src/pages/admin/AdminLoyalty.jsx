import React, { useEffect, useState } from 'react';

import { api } from '../../utils/api';

import { getLevelProgress } from '../../utils/loyalty';



export default function AdminLoyalty() {

  const [query, setQuery] = useState('');

  const [results, setResults] = useState([]);

  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    if (query.trim().length < 2) {

      setResults([]);

      return undefined;

    }



    const timer = setTimeout(() => {

      setLoading(true);

      api.searchClientsLoyalty(query.trim())

        .then(setResults)

        .catch(() => setResults([]))

        .finally(() => setLoading(false));

    }, 300);



    return () => clearTimeout(timer);

  }, [query]);



  const selectClient = async (client) => {

    try {

      const data = await api.getClientPointsAdmin(client.id_usuario);

      setSelected({

        nombre: `${data.cliente.nombre} ${data.cliente.apellido}`,

        nivel: data.fidelidad.nivel_actual,

        puntos: data.fidelidad.puntos_totales,

      });

      setQuery('');

      setResults([]);

    } catch (e) {

      setSelected(null);

    }

  };



  const progress = selected ? getLevelProgress(selected.nivel, selected.puntos) : null;



  return (

    <div>

      <h1 style={{ marginBottom: '20px' }}>Fidelidad</h1>

      <div className="glass card" style={{ marginBottom: '24px' }}>

        <p className="text-muted text-sm" style={{ marginBottom: '12px' }}>

          Busca clientes por nombre o apellido. Solo los clientes participan en el programa de puntos.

        </p>

        <div className="form-group" style={{ marginBottom: 0 }}>

          <label className="label">Buscar cliente</label>

          <input

            className="input"

            value={query}

            onChange={(e) => setQuery(e.target.value)}

            placeholder="Ej: Juan, Pérez, Juan Pérez..."

            autoComplete="off"

          />

        </div>

        {loading && <p className="text-muted text-sm" style={{ marginTop: '8px' }}>Buscando...</p>}

        {results.length > 0 && (

          <ul className="search-results">

            {results.map((c) => (

              <li key={c.id_usuario}>

                <button type="button" className="search-result-btn" onClick={() => selectClient(c)}>

                  {c.nombre} {c.apellido}

                </button>

              </li>

            ))}

          </ul>

        )}

        {query.trim().length >= 2 && !loading && results.length === 0 && (

          <p className="text-muted text-sm" style={{ marginTop: '8px' }}>No se encontraron clientes.</p>

        )}

      </div>



      {selected && progress && (

        <div className="glass card loyalty-card">

          <h3 style={{ marginBottom: '16px' }}>{selected.nombre}</h3>

          <div className="loyalty-level-header">

            <span className="loyalty-badge" style={{ borderColor: progress.level.color, color: progress.level.color }}>

              {selected.nivel}

            </span>

            <span className="text-gold">{selected.puntos} pts</span>

          </div>

          <div className="loyalty-bar-track">

            <div

              className="loyalty-bar-fill"

              style={{ width: `${progress.percent}%`, background: `linear-gradient(90deg, ${progress.level.color}, var(--color-secondary))` }}

            />

          </div>

          <p className="text-muted text-sm" style={{ marginTop: '8px' }}>

            Progreso en nivel {selected.nivel}

          </p>

        </div>

      )}

    </div>

  );

}

