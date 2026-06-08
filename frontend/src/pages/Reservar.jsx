import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import Modal from '../components/Modal';
import { WHATSAPP_NUMBER } from '../utils/constants';
import { formatMonthYear, maxBookingDateISO, todayISO } from '../utils/time';

const TAMANOS = [
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
  { value: 'grande', label: 'Grande' },
  { value: 'extra_grande', label: 'Extra grande' },
];

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

function emptySession() {
  return { fecha: todayISO(), horaInicio: '', horaFin: '', slots: [], diaCompleto: false };
}

function calcDuration(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 1;
  const [sh, sm] = horaInicio.split(':').map(Number);
  const [eh, em] = horaFin.split(':').map(Number);
  return Math.max(1, Math.min(3, (eh + em / 60) - (sh + sm / 60)));
}

function CalendarPicker({
  year, month, monthDays, selectedDate, onSelect, onPrev, onNext, canPrev, canNext, maxDate,
}) {
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(iso);
  }

  return (
    <div className="calendar-widget glass-inner">
      <div className="calendar-header">
        <button type="button" className="calendar-nav-btn" onClick={onPrev} disabled={!canPrev} aria-label="Mes anterior">
          ‹
        </button>
        <span className="calendar-month-label">{formatMonthYear(year, month)}</span>
        <button type="button" className="calendar-nav-btn" onClick={onNext} disabled={!canNext} aria-label="Mes siguiente">
          ›
        </button>
      </div>
      <div className="calendar-weekdays">
        {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="calendar-days">
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} className="calendar-day empty" />;
          const info = monthDays[day];
          const beyondLimit = day > maxDate;
          const unavailable = beyondLimit || info?.pasado || info?.diaCompleto || info?.disponible === false;
          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${selectedDate === day ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`}
              disabled={unavailable}
              onClick={() => !unavailable && onSelect(day)}
            >
              {parseInt(day.split('-')[2], 10)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeSlotPicker({ label, slots, horaInicio, horaFin, onSelectStart, onSelectEnd, diaCompleto }) {
  if (diaCompleto) {
    return <p className="error-msg">Este día no tiene horarios disponibles.</p>;
  }
  if (!slots.length) {
    return <p className="text-muted text-sm">Selecciona una fecha para ver los horarios.</p>;
  }
  return (
    <>
      <div className="form-group">
        <label className="label">{label}</label>
        <div className="slot-grid">
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              className={`slot-btn ${horaInicio === s ? 'active' : ''}`}
              onClick={() => onSelectStart(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {horaInicio && (
        <div className="form-group">
          <label className="label">Hora de fin</label>
          <div className="slot-grid">
            {slots.filter((s) => s > horaInicio).slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                className={`slot-btn ${horaFin === s ? 'active' : ''}`}
                onClick={() => onSelectEnd(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function Reservar() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const artistId = searchParams.get('artista');
  const navigate = useNavigate();

  const minDate = todayISO();
  const maxDate = maxBookingDateISO();

  const [artist, setArtist] = useState(null);
  const [level, setLevel] = useState(null);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [fecha, setFecha] = useState(todayISO());
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [slots, setSlots] = useState([]);
  const [monthDays, setMonthDays] = useState({});
  const [diaCompleto, setDiaCompleto] = useState(false);
  const [form, setForm] = useState({ zona_cuerpo: '', tamano: 'mediano', descripcion: '' });
  const [imagen, setImagen] = useState(null);
  const [imagenName, setImagenName] = useState('');
  const [modoSesiones, setModoSesiones] = useState('unica');
  const [numSesiones, setNumSesiones] = useState(2);
  const [sesiones, setSesiones] = useState([]);
  const [showSesionesModal, setShowSesionesModal] = useState(false);
  const [modalDraft, setModalDraft] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const duracionHoras = calcDuration(horaInicio, horaFin);

  useEffect(() => {
    if (!artistId) return;
    api.getArtists().then((list) => {
      const a = list.find((x) => String(x.id_usuario) === String(artistId));
      setArtist(a || null);
    }).catch(() => {});
    if (user?.rol === 'cliente') api.getMyPoints().then(setLevel).catch(() => {});
  }, [artistId, user]);

  useEffect(() => {
    if (!artistId || modoSesiones !== 'unica' || !fecha) return;
    api.getAvailability(artistId, fecha, duracionHoras)
      .then((data) => {
        setSlots(data.slots || []);
        setDiaCompleto(data.diaCompleto);
        if (!data.slots?.includes(horaInicio)) {
          setHoraInicio('');
          setHoraFin('');
        }
      })
      .catch(() => { setSlots([]); setDiaCompleto(true); });
  }, [artistId, fecha, duracionHoras, horaInicio, modoSesiones]);

  useEffect(() => {
    if (!artistId || modoSesiones !== 'unica') return;
    api.getAvailabilityMonth(artistId, calendarYear, calendarMonth, 1)
      .then((data) => setMonthDays(data.dias || {}))
      .catch(() => {});
  }, [artistId, calendarYear, calendarMonth, modoSesiones]);

  const loadSessionSlots = async (index, sessionFecha, duracion = 1) => {
    if (!artistId || !sessionFecha) return;
    try {
      const data = await api.getAvailability(artistId, sessionFecha, duracion);
      setModalDraft((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          slots: data.slots || [],
          diaCompleto: data.diaCompleto,
          horaInicio: '',
          horaFin: '',
        };
        return next;
      });
    } catch {
      setModalDraft((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], slots: [], diaCompleto: true };
        return next;
      });
    }
  };

  const selectSlot = (slot) => {
    setHoraInicio(slot);
    const [h, m] = slot.split(':').map(Number);
    const endH = h + Math.min(3, Math.max(1, duracionHoras));
    setHoraFin(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const canGoPrevMonth = useMemo(() => {
    const now = new Date();
    return calendarYear > now.getFullYear() || (calendarYear === now.getFullYear() && calendarMonth > now.getMonth() + 1);
  }, [calendarYear, calendarMonth]);

  const canGoNextMonth = useMemo(() => {
    const max = new Date(maxDate);
    return calendarYear < max.getFullYear() || (calendarYear === max.getFullYear() && calendarMonth < max.getMonth() + 1);
  }, [calendarYear, calendarMonth, maxDate]);

  const goPrevMonth = () => {
    if (!canGoPrevMonth) return;
    if (calendarMonth === 1) {
      setCalendarYear((y) => y - 1);
      setCalendarMonth(12);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (!canGoNextMonth) return;
    if (calendarMonth === 12) {
      setCalendarYear((y) => y + 1);
      setCalendarMonth(1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const openSesionesModal = () => {
    const draft = Array.from({ length: numSesiones }, () => emptySession());
    setModalDraft(draft);
    draft.forEach((s, i) => {
      loadSessionSlots(i, s.fecha);
    });
    setShowSesionesModal(true);
  };

  const updateModalSessionCount = (count) => {
    setNumSesiones(count);
    setModalDraft((prev) => {
      if (prev.length === count) return prev;
      if (prev.length < count) {
        const added = Array.from({ length: count - prev.length }, () => emptySession());
        added.forEach((s, i) => {
          const idx = prev.length + i;
          loadSessionSlots(idx, s.fecha);
        });
        return [...prev, ...added];
      }
      return prev.slice(0, count);
    });
  };

  const confirmSesionesModal = () => {
    const incomplete = modalDraft.some((s) => !s.fecha || !s.horaInicio || !s.horaFin);
    if (incomplete) {
      setError('Completa fecha y horario de cada sesión.');
      return;
    }
    setSesiones(modalDraft);
    setShowSesionesModal(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (user.rol !== 'cliente') { setError('Solo los clientes pueden reservar'); return; }

    if (modoSesiones === 'unica' && (!fecha || !horaInicio || !horaFin || diaCompleto)) {
      setError('Selecciona una fecha y horario disponibles.');
      return;
    }
    if (modoSesiones === 'multiple' && sesiones.length === 0) {
      setError('Configura las sesiones antes de continuar.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const primary = modoSesiones === 'multiple' ? sesiones[0] : { fecha, horaInicio, horaFin };
      const primaryDuracion = modoSesiones === 'multiple'
        ? calcDuration(primary.horaInicio, primary.horaFin)
        : duracionHoras;

      let descripcionFinal = form.descripcion || '';
      if (modoSesiones === 'multiple' && sesiones.length > 0) {
        const plan = sesiones.map((s, i) =>
          `Sesión ${i + 1}: ${s.fecha} ${s.horaInicio}–${s.horaFin}`
        ).join('\n');
        descripcionFinal = descripcionFinal
          ? `${descripcionFinal}\n\nPlan de sesiones:\n${plan}`
          : `Plan de sesiones:\n${plan}`;
      }

      const fd = new FormData();
      fd.append('id_artista', artistId);
      fd.append('fecha_reserva', primary.fecha);
      fd.append('hora_inicio', primary.horaInicio);
      fd.append('hora_fin', primary.horaFin);
      fd.append('zona_cuerpo', form.zona_cuerpo);
      fd.append('tamano', form.tamano);
      fd.append('descripcion', descripcionFinal);
      fd.append('duracion_horas', primaryDuracion);
      fd.append('numero_sesiones', modoSesiones === 'multiple' ? sesiones.length : 1);
      fd.append('modo_sesiones', modoSesiones);
      if (imagen) fd.append('imagen_referencia', imagen);

      const result = await api.createBooking(fd);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(result.whatsapp_message)}`;
      window.open(waUrl, '_blank');
      navigate(`/cliente/reservas/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!artistId) {
    return (
      <div className="glass card">
        <p>Selecciona un artista desde su perfil para reservar.</p>
        <Link to="/artistas">Ver artistas</Link>
      </div>
    );
  }

  if (!artist) return <p className="text-muted">Cargando artista...</p>;

  const submitDisabled = loading || (
    modoSesiones === 'unica'
      ? !horaInicio || !horaFin || diaCompleto
      : modoSesiones === 'multiple'
        ? sesiones.length === 0
        : false
  );

  return (
    <div className="reservar-page">
      <h1 className="page-title">Reservar con <span>{artist.nombre} {artist.apellido}</span></h1>
      <p className="text-muted reservar-subtitle">
        Completa los datos de tu reserva. Recibirás confirmación por WhatsApp.
      </p>

      {level?.descuento_pendiente > 0 && (
        <div className="success-msg">Tienes un descuento del {level.descuento_pendiente}% para esta reserva</div>
      )}
      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit} className="glass card reservar-form">
        <div className="form-group">
          <label className="label">Artista</label>
          <p className="artist-fixed-name">{artist.nombre} {artist.apellido}</p>
        </div>

        <div className="session-block glass-inner">
          <h3 className="session-block-title">Tipo de sesión</h3>
          <div className="session-options">
            <label className={`session-option ${modoSesiones === 'unica' ? 'active' : ''}`}>
              <input
                type="radio"
                name="modoSesiones"
                checked={modoSesiones === 'unica'}
                onChange={() => { setModoSesiones('unica'); setSesiones([]); setError(''); }}
              />
              <span>Una sesión</span>
            </label>
            <label className={`session-option ${modoSesiones === 'multiple' ? 'active' : ''}`}>
              <input
                type="radio"
                name="modoSesiones"
                checked={modoSesiones === 'multiple'}
                onChange={() => { setModoSesiones('multiple'); setHoraInicio(''); setHoraFin(''); setError(''); }}
              />
              <span>Varias sesiones</span>
            </label>
            <label className={`session-option ${modoSesiones === 'discutir' ? 'active' : ''}`}>
              <input
                type="radio"
                name="modoSesiones"
                checked={modoSesiones === 'discutir'}
                onChange={() => { setModoSesiones('discutir'); setSesiones([]); setError(''); }}
              />
              <span>Prefiero discutirlo con el artista</span>
            </label>
          </div>

          {modoSesiones === 'multiple' && (
            <div className="session-multiple-config">
              <p className="text-sm">Indica cuántas sesiones necesitas y define la fecha y horario de cada una.</p>
              <div className="session-multiple-actions">
                <select
                  className="select session-count-select"
                  value={numSesiones}
                  onChange={(e) => setNumSesiones(Number(e.target.value))}
                >
                  {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} sesiones</option>)}
                </select>
                <button type="button" className="btn btn-secondary" onClick={openSesionesModal}>
                  Configurar sesiones
                </button>
              </div>
              {sesiones.length > 0 && (
                <ul className="session-summary">
                  {sesiones.map((s, i) => (
                    <li key={i}>
                      Sesión {i + 1}: {s.fecha} · {s.horaInicio} – {s.horaFin}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {modoSesiones === 'unica' && (
          <div className="schedule-block">
            <div className="form-group">
              <label className="label">Fecha</label>
              <CalendarPicker
                year={calendarYear}
                month={calendarMonth}
                monthDays={monthDays}
                selectedDate={fecha}
                onSelect={setFecha}
                onPrev={goPrevMonth}
                onNext={goNextMonth}
                canPrev={canGoPrevMonth}
                canNext={canGoNextMonth}
                maxDate={maxDate}
              />
            </div>

            <TimeSlotPicker
              label="Horarios disponibles"
              slots={slots}
              horaInicio={horaInicio}
              horaFin={horaFin}
              diaCompleto={diaCompleto}
              onSelectStart={selectSlot}
              onSelectEnd={setHoraFin}
            />
          </div>
        )}

        <div className="form-group">
          <label className="label">Zona del cuerpo</label>
          <input className="input" value={form.zona_cuerpo} onChange={(e) => setForm({ ...form, zona_cuerpo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="label">Tamaño</label>
          <select className="select" value={form.tamano} onChange={(e) => setForm({ ...form, tamano: e.target.value })}>
            {TAMANOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Descripción</label>
          <textarea className="textarea" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </div>
        <FileUpload
          label="Imagen de referencia"
          onChange={(f) => { setImagen(f); setImagenName(f?.name || ''); }}
          fileName={imagenName}
        />
        <button type="submit" className="btn btn-primary" disabled={submitDisabled}>
          {loading ? 'Enviando...' : 'Realizar reserva'}
        </button>
      </form>

      {showSesionesModal && (
        <Modal title="Configurar sesiones" onClose={() => setShowSesionesModal(false)}>
          <div className="form-group">
            <label className="label">Cantidad de sesiones</label>
            <select
              className="select"
              value={numSesiones}
              onChange={(e) => updateModalSessionCount(Number(e.target.value))}
            >
              {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} sesiones</option>)}
            </select>
          </div>

          {modalDraft.map((session, index) => (
            <div key={index} className="modal-session-block glass-inner">
              <h4>Sesión {index + 1}</h4>
              <div className="form-group">
                <label className="label">Fecha</label>
                <input
                  className="input"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={session.fecha}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModalDraft((prev) => {
                      const next = [...prev];
                      next[index] = { ...next[index], fecha: val };
                      return next;
                    });
                    loadSessionSlots(index, val);
                  }}
                  required
                />
              </div>
              <TimeSlotPicker
                label="Horarios disponibles"
                slots={session.slots || []}
                horaInicio={session.horaInicio}
                horaFin={session.horaFin}
                diaCompleto={session.diaCompleto}
                onSelectStart={(slot) => {
                  setModalDraft((prev) => {
                    const next = [...prev];
                    const [h, m] = slot.split(':').map(Number);
                    const endH = h + 3;
                    next[index] = {
                      ...next[index],
                      horaInicio: slot,
                      horaFin: `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
                    };
                    return next;
                  });
                }}
                onSelectEnd={(slot) => {
                  setModalDraft((prev) => {
                    const next = [...prev];
                    next[index] = { ...next[index], horaFin: slot };
                    return next;
                  });
                }}
              />
            </div>
          ))}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowSesionesModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={confirmSesionesModal}>
              Confirmar sesiones
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
