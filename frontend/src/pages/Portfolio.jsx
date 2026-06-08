import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import DesignCard from '../components/DesignCard';

export default function Portfolio() {
  const [allDesigns, setAllDesigns] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [estilo, setEstilo] = useState('');

  const load = () => {
    const url = estilo
      ? `/api/disenos?estilo=${encodeURIComponent(estilo)}&sort=likes`
      : '/api/disenos?sort=likes';
    const token = localStorage.getItem('token');
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then(setAllDesigns)
      .catch(() => {});
  };

  useEffect(() => {
    api.getSpecialties().then(setSpecialties).catch(() => {});
    load();
  }, [estilo]);

  const allEstilos = [...new Set([
    ...specialties.map((s) => s.nombre),
    ...allDesigns.map((d) => d.estilo).filter(Boolean),
  ])].sort();

  const topLiked = [...allDesigns].sort((a, b) => b.likes - a.likes).slice(0, 10);
  const newest = [...allDesigns].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)).slice(0, 10);

  const bySpecialty = (spec) =>
    allDesigns.filter((d) => d.estilo === spec).sort((a, b) => b.likes - a.likes).slice(0, 10);

  const Section = ({ title, items }) => items.length > 0 && (
    <section className="styles-section">
      <div className="section-title-bar">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="design-grid design-grid-text">
        {items.map((d) => (
          <DesignCard key={`${title}-${d.id_diseno}`} design={d} textOnly />
        ))}
      </div>
    </section>
  );

  return (
    <div className="estilos-page">
      <header className="page-hero">
        <h1><span>Tatuajes</span></h1>
      </header>

      <div className="filter-bar glass">
        <label className="label">Filtrar por estilo</label>
        <select className="select" value={estilo} onChange={(e) => setEstilo(e.target.value)}>
          <option value="">Todos los estilos</option>
          {allEstilos.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!estilo && (
        <>
          <Section title="Destacados" items={topLiked} />
          {allEstilos.slice(0, 6).map((spec) => (
            <Section key={spec} title={spec} items={bySpecialty(spec)} />
          ))}
          <Section title="Añadidos recientemente" items={newest} />
        </>
      )}

      {estilo && (
        <Section title={estilo} items={allDesigns} />
      )}

      {!allDesigns.length && (
        <p className="text-muted">No hay tatuajes registrados todavía.</p>
      )}
    </div>
  );
}
