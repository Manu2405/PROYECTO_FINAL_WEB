export function formatTime(t) {
  if (!t) return '';
  const str = String(t);
  return str.slice(0, 5);
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function maxBookingDateISO() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function formatMonthYear(year, month) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatDateOnly(value) {
  if (!value) return '';
  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split('-').map(Number);
  if (!year || !month || !day) return raw;
  return `${day} de ${MONTH_NAMES[month - 1]} de ${year}`;
}
