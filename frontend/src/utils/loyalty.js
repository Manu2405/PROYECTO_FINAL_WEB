export const LOYALTY_LEVELS = [
  { name: 'Bronce', min: 0, max: 99, color: '#cd7f32' },
  { name: 'Plata', min: 100, max: 299, color: '#c0c0c0' },
  { name: 'Oro', min: 300, max: 999, color: '#D4AF37' },
  { name: 'Diamante', min: 1000, max: null, color: '#b9f2ff' },
];

export function getLevelProgress(nivel, puntos) {
  const level = LOYALTY_LEVELS.find((l) => l.name === nivel) || LOYALTY_LEVELS[0];
  const max = level.max ?? level.min + 500;
  const range = max - level.min + 1;
  const current = Math.max(0, puntos - level.min);
  const percent = level.max === null
    ? Math.min(100, 70 + (puntos - level.min) / 10)
    : Math.min(100, (current / range) * 100);

  return { level, percent: Math.round(percent) };
}
