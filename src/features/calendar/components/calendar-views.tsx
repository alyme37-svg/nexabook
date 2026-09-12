"use client";

import { CalendarX2 } from "lucide-react";
import { useState } from "react";

import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Booking, Client, Service, TeamMember } from "@/domain/types";
import { cn } from "@/lib/utils";
import { dateKey, formatTime } from "@/features/bookings/booking-utils";
import {
  formatDayKey,
  monthDays,
  weekDays,
} from "@/features/calendar/calendar-utils";

export interface CalendarData {
  bookings: Booking[];
  clients: Map<string, Client>;
  services: Map<string, Service>;
  team: Map<string, TeamMember>;
  locale: string;
  timeZone: string;
  weekStartsOn: 0 | 1;
}

function bookingsFor(day: string, data: CalendarData) {
  return data.bookings
    .filter(
      (booking) => dateKey(new Date(booking.startsAt), data.timeZone) === day,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function EventButton({
  booking,
  data,
  onSelect,
  compact = false,
}: {
  booking: Booking;
  data: CalendarData;
  onSelect: (booking: Booking) => void;
  compact?: boolean;
}) {
  const client = data.clients.get(booking.clientId);
  const service = data.services.get(booking.serviceId);
  return (
    <button
      type="button"
      onClick={() => onSelect(booking)}
      className={cn(
        "relative w-full overflow-hidden rounded-lg border bg-card text-left outline-none transition-[border-color,background-color,box-shadow] hover:border-primary/45 hover:bg-accent/35 focus-visible:ring-3 focus-visible:ring-ring/25",
        compact ? "p-2" : "p-3",
        booking.status === "cancelled" && "opacity-55",
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: service?.color }}
      />
      <p className="pl-1 text-[11px] font-bold text-primary numbers-tabular">
        {formatTime(booking.startsAt, data.locale, data.timeZone)}
        {compact
          ? ""
          : ` – ${formatTime(booking.endsAt, data.locale, data.timeZone)}`}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate pl-1 font-semibold",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {client?.firstName} {client?.lastName}
      </p>
      {compact ? null : (
        <p className="mt-1 truncate pl-1 text-xs text-muted-foreground">
          {service?.name} · {service?.durationMinutes} min
        </p>
      )}
    </button>
  );
}

export function WeekView({
  day,
  data,
  onSelect,
}: {
  day: string;
  data: CalendarData;
  onSelect: (booking: Booking) => void;
}) {
  const days = weekDays(day, data.weekStartsOn);
  const [mobileDay, setMobileDay] = useState(
    days.includes(day) ? day : days[0],
  );
  return (
    <>
      <div className="border-b p-3 md:hidden">
        <div className="grid grid-cols-7 gap-1">
          {days.map((date) => (
            <button
              key={date}
              type="button"
              aria-pressed={mobileDay === date}
              onClick={() => setMobileDay(date)}
              className={cn(
                "min-h-12 rounded-lg px-1 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                mobileDay === date
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="block text-[10px] font-semibold uppercase">
                {formatDayKey(date, data.locale, { weekday: "short" }).slice(
                  0,
                  2,
                )}
              </span>
              <span className="mt-0.5 block text-sm font-bold numbers-tabular">
                {formatDayKey(date, data.locale, { day: "numeric" })}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="md:hidden">
        <DayView day={mobileDay} data={data} onSelect={onSelect} />
      </div>
      <div className="scrollbar-subtle hidden overflow-x-auto md:block">
        <div className="grid min-w-[66rem] grid-cols-7 divide-x">
          <span className="sr-only">Weekly appointment calendar</span>
          {days.map((date) => {
            const items = bookingsFor(date, data);
            return (
              <section
                key={date}
                className="min-h-[34rem] min-w-0"
                aria-label={formatDayKey(date, data.locale, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              >
                <header className="sticky top-0 z-10 border-b bg-card/95 px-3 py-3 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {formatDayKey(date, data.locale, { weekday: "short" })}
                  </p>
                  <p className="mt-1 text-xl font-bold numbers-tabular">
                    {formatDayKey(date, data.locale, { day: "numeric" })}
                  </p>
                </header>
                <div className="grid gap-2 p-2.5">
                  {items.length ? (
                    items.map((booking) => (
                      <EventButton
                        key={booking.id}
                        booking={booking}
                        data={data}
                        onSelect={onSelect}
                      />
                    ))
                  ) : (
                    <p className="px-2 py-5 text-center text-xs text-muted-foreground">
                      No bookings
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function DayView({
  day,
  data,
  onSelect,
}: {
  day: string;
  data: CalendarData;
  onSelect: (booking: Booking) => void;
}) {
  const items = bookingsFor(day, data);
  if (!items.length)
    return (
      <div className="p-5">
        <EmptyState
          icon={CalendarX2}
          title="The day is open"
          description="There are no bookings scheduled for this date."
        />
      </div>
    );
  return (
    <div className="mx-auto grid max-w-3xl gap-0 px-4 py-5 sm:px-6">
      {items.map((booking, index) => {
        const member = data.team.get(booking.teamMemberId);
        const service = data.services.get(booking.serviceId);
        return (
          <div key={booking.id} className="grid grid-cols-[4.75rem_1fr] gap-3">
            <div className="pt-3 text-right">
              <p className="text-sm font-bold numbers-tabular">
                {formatTime(booking.startsAt, data.locale, data.timeZone)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {service?.durationMinutes} min
              </p>
            </div>
            <div className="relative border-l pb-4 pl-4">
              <span
                className="absolute -left-[5px] top-4 size-2.5 rounded-full ring-4 ring-card"
                style={{ backgroundColor: service?.color }}
              />
              <button
                type="button"
                onClick={() => onSelect(booking)}
                className="w-full rounded-xl border bg-card p-4 text-left outline-none transition-colors hover:border-primary/40 hover:bg-accent/25 focus-visible:ring-3 focus-visible:ring-ring/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      {data.clients.get(booking.clientId)?.firstName}{" "}
                      {data.clients.get(booking.clientId)?.lastName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service?.name} · {member?.firstName} {member?.lastName}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </button>
              {index === items.length - 1 ? (
                <span className="absolute -bottom-1 -left-px h-4 border-l border-card" />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MonthView({
  day,
  data,
  onSelect,
  onDaySelect,
}: {
  day: string;
  data: CalendarData;
  onSelect: (booking: Booking) => void;
  onDaySelect: (day: string) => void;
}) {
  const currentMonth = day.slice(0, 7);
  const labels = weekDays("2026-09-07", data.weekStartsOn).map((date) =>
    formatDayKey(date, data.locale, { weekday: "short" }),
  );
  return (
    <div className="scrollbar-subtle overflow-x-auto">
      <div className="min-w-[52rem]">
        <div className="grid grid-cols-7 border-b bg-muted/35">
          {labels.map((label) => (
            <div
              key={label}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {monthDays(day, data.weekStartsOn).map((date) => {
            const items = bookingsFor(date, data);
            return (
              <section
                key={date}
                className={cn(
                  "min-h-32 border-b border-r p-2",
                  !date.startsWith(currentMonth) &&
                    "bg-muted/25 text-muted-foreground",
                )}
                aria-label={formatDayKey(date, data.locale, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              >
                <p className="mb-2 px-1 text-xs font-bold numbers-tabular">
                  {formatDayKey(date, data.locale, { day: "numeric" })}
                </p>
                <div className="grid gap-1.5">
                  {items.slice(0, 2).map((booking) => (
                    <EventButton
                      key={booking.id}
                      booking={booking}
                      data={data}
                      onSelect={onSelect}
                      compact
                    />
                  ))}
                  {items.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => onDaySelect(date)}
                      className="min-h-8 rounded-md px-1 text-left text-[11px] font-semibold text-primary outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/25"
                    >
                      +{items.length - 2} more
                    </button>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
