export function safeISO(s?: string | null): string | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}
// src/lib/dates.ts

/** Parse API date string to a Date object.
 *  - "YYYY-MM-DD" -> local date (no timezone shift)
 *  - ISO with Z/offset -> native Date
 *  - otherwise -> best-effort parse or null
 */
export function parseApiDate(s?: string | null): Date | null {
  if (!s) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return new Date(Number(y), Number(m) - 1, Number(d)); // local midnight
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
}

/** Format a Date or null; safe fallback text. */
export function formatDateLabel(d: Date | null, locale = navigator.language): string {
  return d ? d.toLocaleDateString(locale) : 'fecha desconocida';
}

/** End-of-day for inclusive comparisons (23:59:59.999 local). */
export function endOfDay(d: Date): Date {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e;
}
