import { isEffectiveBooking } from "@/domain/booking-derived";
import type {
  Booking,
  Service,
  TeamMember,
  Weekday,
  WeeklyAvailability,
} from "@/domain/types";

const weekdays: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function dateKey(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function zonedDateTimeToIso(
  day: string,
  time: string,
  timeZone: string,
) {
  const [year, month, date] = day.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const target = Date.UTC(year, month - 1, date, hour, minute);
  let guess = target;
  for (let pass = 0; pass < 2; pass += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(guess));
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value ?? 0);
    const rendered = Date.UTC(
      value("year"),
      value("month") - 1,
      value("day"),
      value("hour") % 24,
      value("minute"),
    );
    guess += target - rendered;
  }
  return new Date(guess).toISOString();
}

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function asTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function getAvailableSlots({
  day,
  service,
  teamMember,
  bookings,
  services,
  timeZone,
  businessHours,
  excludeBookingId,
}: {
  day: string;
  service: Service;
  teamMember: TeamMember;
  bookings: Booking[];
  services?: Service[];
  timeZone: string;
  businessHours?: WeeklyAvailability;
  excludeBookingId?: string;
}) {
  const weekday = weekdays[new Date(`${day}T12:00:00Z`).getUTCDay()];
  const teamRanges = teamMember.availability[weekday];
  const businessRanges = businessHours?.[weekday] ?? teamRanges;
  const ranges = teamRanges.flatMap((teamRange) =>
    businessRanges.flatMap((businessRange) => {
      const start = Math.max(
        minutes(teamRange.start),
        minutes(businessRange.start),
      );
      const end = Math.min(minutes(teamRange.end), minutes(businessRange.end));
      return start < end ? [{ start: asTime(start), end: asTime(end) }] : [];
    }),
  );
  const occupied = bookings.filter(
    (booking) =>
      booking.id !== excludeBookingId &&
      booking.teamMemberId === teamMember.id &&
      isEffectiveBooking(booking),
  );
  const serviceBuffer = new Map(
    (services ?? []).map((item) => [item.id, item.bufferMinutes]),
  );
  const total = service.durationMinutes + service.bufferMinutes;
  return ranges.flatMap((range) => {
    const slots: string[] = [];
    for (
      let cursor = minutes(range.start);
      cursor + total <= minutes(range.end);
      cursor += 30
    ) {
      const time = asTime(cursor);
      const start = new Date(zonedDateTimeToIso(day, time, timeZone)).getTime();
      const end = start + total * 60_000;
      const conflicts = occupied.some((booking) => {
        const occupiedEnd =
          new Date(booking.endsAt).getTime() +
          (serviceBuffer.get(booking.serviceId) ?? 0) * 60_000;
        return (
          start < occupiedEnd && end > new Date(booking.startsAt).getTime()
        );
      });
      if (!conflicts) slots.push(time);
    }
    return slots;
  });
}

export function formatTime(iso: string, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(
  iso: string,
  locale: string,
  timeZone: string,
  style: "short" | "long" = "short",
) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: style === "long" ? "long" : "short",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: style === "long" ? "numeric" : undefined,
  }).format(new Date(iso));
}

export function addDays(day: string, amount: number) {
  const value = new Date(`${day}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

export function startOfWeek(day: string, weekStartsOn: 0 | 1 = 1) {
  const value = new Date(`${day}T12:00:00Z`);
  value.setUTCDate(
    value.getUTCDate() - ((value.getUTCDay() - weekStartsOn + 7) % 7),
  );
  return value.toISOString().slice(0, 10);
}
