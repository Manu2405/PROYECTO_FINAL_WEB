export function formatBs(amount) {
  const n = Number(amount) || 0;
  return `Bs. ${n.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
