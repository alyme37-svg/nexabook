"use client";

import { CalendarPlus2, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking } from "@/domain/types";
import { DEMO_NOW } from "@/domain/sample-data";
import { BookingFlow } from "@/features/bookings/components/booking-flow";
import { dateKey } from "@/features/bookings/booking-utils";
import { BookingDetail } from "@/features/calendar/components/booking-detail";
import {
  DayView,
  MonthView,
  WeekView,
  type CalendarData,
} from "@/features/calendar/components/calendar-views";
import {
  formatDayKey,
  moveCalendarDate,
  weekDays,
} from "@/features/calendar/calendar-utils";
import { cn } from "@/lib/utils";
import { useNexaBookStore } from "@/store/app-store";

const subscribeToClient = () => () => undefined;
type View = "day" | "week" | "month";

export function CalendarPage() {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const bookings = useNexaBookStore((state) => state.bookings);
  const clients = useNexaBookStore((state) => state.clients);
  const services = useNexaBookStore((state) => state.services);
  const teamMembers = useNexaBookStore((state) => state.teamMembers);
  const settings = useNexaBookStore((state) => state.businessSettings);
  const today = dateKey(new Date(DEMO_NOW), settings.timezone);
  const [view, setView] = useState<View>("week");
  const [day, setDay] = useState(today);
  const [selected, setSelected] = useState<Booking>();
  const [flow, setFlow] = useState<{ open: boolean; bookingId?: string }>({
    open: false,
  });
  const data = useMemo<CalendarData>(
    () => ({
      bookings,
      clients: new Map(clients.map((item) => [item.id, item])),
      services: new Map(services.map((item) => [item.id, item])),
      team: new Map(teamMembers.map((item) => [item.id, item])),
      locale: settings.locale,
      timeZone: settings.timezone,
      weekStartsOn: settings.weekStartsOn,
    }),
    [
      bookings,
      clients,
      services,
      settings.locale,
      settings.timezone,
      settings.weekStartsOn,
      teamMembers,
    ],
  );
  const label =
    view === "day"
      ? formatDayKey(day, settings.locale, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : view === "week"
        ? `${formatDayKey(weekDays(day, settings.weekStartsOn)[0], settings.locale, { month: "short", day: "numeric" })} – ${formatDayKey(weekDays(day, settings.weekStartsOn)[6], settings.locale, { month: "short", day: "numeric", year: "numeric" })}`
        : formatDayKey(day, settings.locale, {
            month: "long",
            year: "numeric",
          });

  if (!isClient)
    return (
      <PageContainer className="space-y-5">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-[38rem] rounded-xl" />
      </PageContainer>
    );

  return (
    <PageContainer className="space-y-5 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Team schedule
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-[-0.04em] sm:text-[2rem]">
            Calendar
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            See every appointment and keep the week moving smoothly.
          </p>
        </div>
        <Button onClick={() => setFlow({ open: true })}>
          <CalendarPlus2 aria-hidden="true" />
          New booking
        </Button>
      </header>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous period"
              onClick={() =>
                setDay((value) => moveCalendarDate(value, view, -1))
              }
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button variant="outline" onClick={() => setDay(today)}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next period"
              onClick={() =>
                setDay((value) => moveCalendarDate(value, view, 1))
              }
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            <h2 className="ml-1 text-sm font-bold sm:text-base">{label}</h2>
          </div>
          <div
            className="grid grid-cols-3 rounded-lg bg-muted p-1"
            aria-label="Calendar view"
          >
            {(["day", "week", "month"] as View[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={view === item}
                onClick={() => setView(item)}
                className={cn(
                  "min-h-9 rounded-md px-4 text-sm font-semibold capitalize outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/25",
                  view === item
                    ? "bg-card text-foreground shadow-[0_1px_3px_rgb(17_21_47/0.08)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {view === "day" ? (
          <DayView day={day} data={data} onSelect={setSelected} />
        ) : view === "week" ? (
          <WeekView key={day} day={day} data={data} onSelect={setSelected} />
        ) : (
          <MonthView
            day={day}
            data={data}
            onSelect={setSelected}
            onDaySelect={(value) => {
              setDay(value);
              setView("day");
            }}
          />
        )}
      </Card>
      {selected ? (
        <BookingDetail
          booking={selected}
          client={data.clients.get(selected.clientId)}
          service={data.services.get(selected.serviceId)}
          member={data.team.get(selected.teamMemberId)}
          locale={settings.locale}
          timeZone={settings.timezone}
          open
          onOpenChange={(open) => {
            if (!open) setSelected(undefined);
          }}
          onEdit={() => {
            const bookingId = selected.id;
            setSelected(undefined);
            setFlow({ open: true, bookingId });
          }}
        />
      ) : null}
      {flow.open ? (
        <BookingFlow
          open
          onOpenChange={(open) => setFlow((current) => ({ ...current, open }))}
          bookingId={flow.bookingId}
        />
      ) : null}
    </PageContainer>
  );
}
