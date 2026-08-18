const BOOKING_WINDOW_DAYS = 14;

// Server-side only — never call from client-rendered code (hydration mismatch risk).
// Computes the current calendar date in Asia/Bangkok, regardless of the server's own timezone.
export function getTodayBangkok(): Date {
  const now = new Date();
  const bangkok = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  return new Date(bangkok.getFullYear(), bangkok.getMonth(), bangkok.getDate());
}

export function buildDateWindow(today: Date, count: number = BOOKING_WINDOW_DAYS): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parses a "YYYY-MM-DD" string as a calendar date (no timezone conversion),
// or returns null if it isn't within [today, today + windowDays - 1].
export function parseDateInWindow(
  isoDate: string,
  today: Date,
  windowDays: number = BOOKING_WINDOW_DAYS,
): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(m) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null; // rejects invalid calendar dates like 2026-02-30
  }
  const earliest = today.getTime();
  const latest = new Date(today).setDate(today.getDate() + windowDays - 1);
  const time = date.getTime();
  if (time < earliest || time > latest) return null;
  return date;
}
