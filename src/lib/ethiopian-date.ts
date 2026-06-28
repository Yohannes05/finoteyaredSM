import { EthDateTime } from 'ethiopian-calendar-date-converter';

// Returns the current Ethiopian date in Postgres-friendly YYYY-MM-DD format
export function getTodayEthioDate(): string {
  try {
    const now = EthDateTime.now();
    const y = now.year;
    const m = String(now.month).padStart(2, '0');
    const d = String(now.date).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return '2017-01-01'; // Safe fallback
  }
}
