import { addDays, startOfWeek } from "@/features/bookings/booking-utils";

export function weekDays(day: string, weekStartsOn: 0 | 1 = 1) {
  const start = startOfWeek(day, weekStartsOn);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function monthDays(day: string, weekStartsOn: 0 | 1 = 1) {
  const [year, month] = day.split("-").map(Number);
  const first = `${year}-${String(month).padStart(2, "0")}-01`;
  const start = startOfWeek(first, weekStartsOn);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function moveCalendarDate(day: string, view: "day" | "week" | "month", direction: number) {
  if (view === "day") return addDays(day, direction);
  if (view === "week") return addDays(day, direction * 7);
  const value = new Date(`${day}T12:00:00Z`);
  value.setUTCMonth(value.getUTCMonth() + direction);
  return value.toISOString().slice(0, 10);
}

export function formatDayKey(day: string, locale: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options }).format(new Date(`${day}T12:00:00Z`));
}
