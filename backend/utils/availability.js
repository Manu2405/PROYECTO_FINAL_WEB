function parseTimeToMinutes(timeStr) {
  const [h, m] = String(timeStr).slice(0, 5).split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getBlockedRanges(bookings) {
  return bookings.map((b) => {
    const start = new Date(b.fecha_reserva);
    const end = b.hora_fin ? new Date(b.hora_fin) : new Date(start.getTime() + (parseFloat(b.duracion_horas) || 1) * 3600000);
    return {
      start: start.getHours() * 60 + start.getMinutes(),
      end: end.getHours() * 60 + end.getMinutes(),
    };
  });
}

function isSlotBlocked(slotStart, durationHours, blocked) {
  const slotEnd = slotStart + durationHours * 60;
  return blocked.some((r) => slotStart < r.end && slotEnd > r.start);
}

function getAvailableSlots(horarioInicio, horarioFin, bookings, durationHours = 1) {
  const startMin = parseTimeToMinutes(horarioInicio);
  const endMin = parseTimeToMinutes(horarioFin);
  const blocked = getBlockedRanges(bookings);
  const slots = [];

  for (let t = startMin; t + durationHours * 60 <= endMin; t += 60) {
    if (!isSlotBlocked(t, durationHours, blocked)) {
      slots.push(minutesToTime(t));
    }
  }

  return { slots, diaCompleto: slots.length === 0 };
}

function getMonthAvailability(artist, bookingsByDate, year, month, durationHours = 1) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(`${dateStr}T12:00:00`);
    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (dateObj < today) {
      result[dateStr] = { disponible: false, pasado: true };
      continue;
    }
    if (dateObj > maxDate) {
      result[dateStr] = { disponible: false, fueraDeLimite: true };
      continue;
    }
    const dayBookings = bookingsByDate[dateStr] || [];
    const { slots, diaCompleto } = getAvailableSlots(
      artist.horario_inicio,
      artist.horario_fin,
      dayBookings,
      durationHours
    );
    result[dateStr] = { disponible: !diaCompleto, slots, diaCompleto };
  }

  return result;
}

module.exports = {
  getAvailableSlots,
  getMonthAvailability,
  parseTimeToMinutes,
  minutesToTime,
};
