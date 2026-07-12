import { currencySymbol } from './currencies';

export function formatMoney(amount: number, currency = 'NGN'): string {
  const symbol = currencySymbol(currency);
  const value = Math.round(amount).toLocaleString('en');
  // Letter-based symbols (KSh, FCFA, Le, …) read better with a space; ₦/R/$/E£ don't.
  const spacer = /[a-z]$/i.test(symbol) ? ' ' : '';
  return `${symbol}${spacer}${value}`;
}

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', ...opts,
  });
}

export function formatTime(t: string): string {
  // 'HH:MM:SS' → 'HH:MM'
  return t.slice(0, 5);
}

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.round((d.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return formatDate(iso);
}

export const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export function pct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}
