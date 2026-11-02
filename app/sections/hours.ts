// Opening hours (placeholder): shown in the Visit section and read by the
// footer's "open now" sign. Days are 0 = Sunday … 6 = Saturday; a close time
// earlier than the open time runs past midnight.
export const HOURS = [
  { label: "Mon – Thu", days: [1, 2, 3, 4], open: "11:30", close: "22:00" },
  { label: "Fri – Sat", days: [5, 6], open: "11:30", close: "01:00" },
  { label: "Sunday", days: [0], open: "12:00", close: "21:00" },
] as const;

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const forDay = (day: number) => HOURS.find((h) => (h.days as readonly number[]).includes(day))!;

export type OpenStatus = { open: true; until: string } | { open: false; opens: string };

/** Whether the restaurant is open at `now`, and until when (or when it opens next). */
export function openStatus(now: Date): OpenStatus {
  const day = now.getDay();
  const t = now.getHours() * 60 + now.getMinutes();

  // still inside yesterday's late session?
  const prev = forDay((day + 6) % 7);
  if (minutes(prev.close) < minutes(prev.open) && t < minutes(prev.close)) return { open: true, until: prev.close };

  const today = forDay(day);
  const close = minutes(today.close) < minutes(today.open) ? minutes(today.close) + 24 * 60 : minutes(today.close);
  if (t >= minutes(today.open) && t < close) return { open: true, until: today.close };
  if (t < minutes(today.open)) return { open: false, opens: today.open };
  return { open: false, opens: forDay((day + 1) % 7).open };
}
