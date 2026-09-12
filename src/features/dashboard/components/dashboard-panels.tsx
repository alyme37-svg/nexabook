import { CalendarClock, Clock3, UserPlus } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAppointment } from "@/features/dashboard/dashboard-data";

function AppointmentTime({
  value,
  timeZone,
}: {
  value: string;
  timeZone: string;
}) {
  return (
    <time
      dateTime={value}
      className="numbers-tabular text-xs font-semibold text-foreground"
    >
      {new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))}
    </time>
  );
}

export function UpcomingAppointments({
  appointments,
  timeZone,
}: {
  appointments: DashboardAppointment[];
  timeZone: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b py-4">
        <div>
          <CardTitle>Upcoming appointments</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Next across the team
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/bookings">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {!appointments.length ? (
            <div className="px-5 py-10 text-center">
              <CalendarClock
                className="mx-auto size-6 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-semibold">
                No upcoming appointments
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                New bookings will appear here as soon as they are scheduled.
              </p>
            </div>
          ) : null}
          {appointments.map(({ booking, client, service, teamMember }) => {
            const clientName = `${client.firstName} ${client.lastName}`;
            return (
              <div
                key={booking.id}
                className="grid min-h-[4.65rem] grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 px-4 transition-colors hover:bg-muted/35 sm:grid-cols-[4.5rem_minmax(0,1.25fr)_minmax(8.5rem,0.8fr)_auto] sm:px-5"
              >
                <AppointmentTime value={booking.startsAt} timeZone={timeZone} />
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={clientName} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {clientName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground sm:hidden">
                      {service.name}
                    </p>
                  </div>
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-xs font-medium">{service.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    with {teamMember.firstName}
                  </p>
                </div>
                <StatusBadge
                  status={booking.status}
                  className="hidden md:inline-flex"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function TodaySchedule({
  appointments,
  completed,
  total,
  timeZone,
}: {
  appointments: DashboardAppointment[];
  completed: number;
  total: number;
  timeZone: string;
}) {
  const nextAppointments = appointments
    .filter(({ booking }) => booking.status !== "completed")
    .slice(0, 4);
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Today&apos;s schedule</CardTitle>
          <span className="numbers-tabular text-xs font-semibold text-primary">
            {completed}/{total}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {completed} completed · {total - completed} remaining
        </p>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          aria-label={`${progress}% of today's schedule completed`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#4f46e5,#8b5cf6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-1 px-3 pb-3">
        {nextAppointments.map(({ booking, client, service }) => {
          const clientName = `${client.firstName} ${client.lastName}`;
          return (
            <div
              key={booking.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/55"
            >
              <div className="grid min-w-12 gap-0.5">
                <AppointmentTime value={booking.startsAt} timeZone={timeZone} />
                <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                  {booking.status === "in_progress" ? "Now" : "Next"}
                </span>
              </div>
              <Avatar name={clientName} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{clientName}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {service.name}
                </p>
              </div>
              <span
                className="ml-auto size-2 shrink-0 rounded-full"
                style={{ backgroundColor: service.color }}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

type RecentActivityItem = {
  id: string;
  entityType: string;
  title: string;
  description: string;
  relativeTime: string;
};

export function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Recent activity</CardTitle>
          <Clock3 className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-xs text-muted-foreground">
          Latest changes across the workspace
        </p>
      </CardHeader>
      <CardContent className="grid gap-1 px-3 pb-3">
        {items.map((item) => {
          const Icon = item.entityType === "client" ? UserPlus : CalendarClock;
          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/55"
            >
              <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-3.5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-xs font-semibold">{item.title}</p>
                  <time className="shrink-0 text-[10px] font-medium text-muted-foreground">
                    {item.relativeTime}
                  </time>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
