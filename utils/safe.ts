import dayjs from 'dayjs';

export function safeNumber(value: unknown, options?: { decimals?: number; fallback?: string }) {
  const decimals = options?.decimals ?? 1;
  const fallback = options?.fallback ?? '—';
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  try {
    return value.toFixed(decimals);
  } catch {
    return fallback;
  }
}

export function safeInt(value: unknown, options?: { fallback?: string }) {
  const fallback = options?.fallback ?? '—';
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return String(Math.floor(value));
}

export function safeString(value: unknown, fallback = 'Non disponible') {
  if (typeof value !== 'string') return fallback;
  const v = value.trim();
  return v ? v : fallback;
}

export function safeDateTime(value: unknown, fallback = 'Date inconnue') {
  try {
    const d = dayjs(value as any);
    if (!d.isValid()) return fallback;
    return d.format('DD/MM/YYYY HH:mm');
  } catch {
    return fallback;
  }
}

export function safeChartSeries(values: unknown[], minPoints = 2) {
  const base = Array.isArray(values)
    ? values.map((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0))
    : [];

  if (base.length >= minPoints) return base;
  if (base.length === 1) return [base[0], base[0]];
  return Array.from({ length: minPoints }, () => 0);
}

