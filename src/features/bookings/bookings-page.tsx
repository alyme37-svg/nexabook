"use client";

import { CalendarPlus2, CalendarX2, Filter, Search } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BookingStatus } from "@/domain/types";
import { DEMO_NOW } from "@/domain/sample-data";
import { BookingActions } from "@/features/bookings/components/booking-actions";
import { BookingFlow } from "@/features/bookings/components/booking-flow";
import {
  dateKey,
  formatDate,
  formatTime,
} from "@/features/bookings/booking-utils";
import { cn } from "@/lib/utils";
import { useNexaBookStore } from "@/store/app-store";

const subscribeToClient = () => () => undefined;
const tabs: Array<{ value: "all" | BookingStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function BookingsPage() {
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [serviceId, setServiceId] = useState("all");
  const [teamMemberId, setTeamMemberId] = useState("all");
  const [flow, setFlow] = useState<{ open: boolean; bookingId?: string }>({
    open: false,
  });
  const today = dateKey(new Date(DEMO_NOW), settings.timezone);
  const clientMap = useMemo(
    () => new Map(clients.map((item) => [item.id, item])),
    [clients],
  );
  const serviceMap = useMemo(
    () => new Map(services.map((item) => [item.id, item])),
    [services],
  );
  const teamMap = useMemo(
    () => new Map(teamMembers.map((item) => [item.id, item])),
    [teamMembers],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings
      .filter((booking) => {
        const client = clientMap.get(booking.clientId);
        const service = serviceMap.get(booking.serviceId);
        const team = teamMap.get(booking.teamMemberId);
        const bookingDay = dateKey(
          new Date(booking.startsAt),
          settings.timezone,
        );
        const matchesSearch =
          !query ||
          `${client?.firstName} ${client?.lastName} ${client?.email} ${service?.name} ${team?.firstName} ${team?.lastName}`
            .toLowerCase()
            .includes(query);
        const matchesDate =
          dateFilter === "all" ||
          (dateFilter === "today" && bookingDay === today) ||
          (dateFilter === "upcoming" && bookingDay >= today) ||
          (dateFilter === "past" && bookingDay < today);
        return (
          matchesSearch &&
          matchesDate &&
          (status === "all" || booking.status === status) &&
          (serviceId === "all" || booking.serviceId === serviceId) &&
          (teamMemberId === "all" || booking.teamMemberId === teamMemberId)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
      );
  }, [
    bookings,
    clientMap,
    dateFilter,
    search,
    serviceId,
    serviceMap,
    settings.timezone,
    status,
    teamMap,
    teamMemberId,
    today,
  ]);

  if (!isClient)
    return (
      <PageContainer className="space-y-5">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-[32rem] rounded-xl" />
      </PageContainer>
    );

  return (
    <PageContainer className="space-y-5 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Appointments
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-[-0.04em] sm:text-[2rem]">
            Bookings
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Manage appointments, availability, and client care in one focused
            view.
          </p>
        </div>
        <Button onClick={() => setFlow({ open: true })}>
          <CalendarPlus2 aria-hidden="true" />
          New booking
        </Button>
      </header>

      <Card className="overflow-visible">
        <div className="border-b px-4 pt-4 sm:px-5">
          <div className="scrollbar-subtle overflow-x-auto">
            <div
              className="flex min-w-max gap-1"
              aria-label="Filter bookings by status"
            >
              {tabs.map((tab) => {
                const count =
                  tab.value === "all"
                    ? bookings.length
                    : bookings.filter((booking) => booking.status === tab.value)
                        .length;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    aria-pressed={status === tab.value}
                    onClick={() => setStatus(tab.value)}
                    className={cn(
                      "min-h-10 border-b-2 px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/25",
                      status === tab.value
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label}
                    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] numbers-tabular">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b bg-muted/20 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(14rem,1.5fr)_repeat(3,minmax(10rem,0.75fr))]">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clients, services, or team"
              aria-label="Search bookings"
              className="pl-9"
            />
          </div>
          <Select
            aria-label="Filter by date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </Select>
          <Select
            aria-label="Filter by service"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
          >
            <option value="all">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by team member"
            value={teamMemberId}
            onChange={(event) => setTeamMemberId(event.target.value)}
          >
            <option value="all">All team members</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </Select>
        </div>

        {filtered.length ? (
          <>
            <div className="hidden xl:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Team member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="w-14">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((booking) => {
                    const client = clientMap.get(booking.clientId);
                    const service = serviceMap.get(booking.serviceId);
                    const member = teamMap.get(booking.teamMemberId);
                    const clientName = client
                      ? `${client.firstName} ${client.lastName}`
                      : "Unknown client";
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <p className="font-semibold">
                            {formatDate(
                              booking.startsAt,
                              settings.locale,
                              settings.timezone,
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground numbers-tabular">
                            {formatTime(
                              booking.startsAt,
                              settings.locale,
                              settings.timezone,
                            )}{" "}
                            –{" "}
                            {formatTime(
                              booking.endsAt,
                              settings.locale,
                              settings.timezone,
                            )}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={clientName} size="sm" />
                            <div className="min-w-0">
                              <p className="font-semibold">{clientName}</p>
                              <p className="max-w-44 truncate text-xs text-muted-foreground">
                                {client?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: service?.color }}
                            />
                            <span className="font-medium">{service?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member?.firstName} {member?.lastName}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.paymentStatus} />
                        </TableCell>
                        <TableCell>
                          <BookingActions
                            booking={booking}
                            clientName={clientName}
                            onEdit={() =>
                              setFlow({ open: true, bookingId: booking.id })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 p-3 xl:hidden">
              {filtered.map((booking) => {
                const client = clientMap.get(booking.clientId);
                const service = serviceMap.get(booking.serviceId);
                const member = teamMap.get(booking.teamMemberId);
                const clientName = client
                  ? `${client.firstName} ${client.lastName}`
                  : "Unknown client";
                return (
                  <article
                    key={booking.id}
                    className="rounded-xl border bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={clientName} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{clientName}</p>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {service?.name}
                        </p>
                      </div>
                      <BookingActions
                        booking={booking}
                        clientName={clientName}
                        onEdit={() =>
                          setFlow({ open: true, bookingId: booking.id })
                        }
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Date & time
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatDate(
                            booking.startsAt,
                            settings.locale,
                            settings.timezone,
                          )}{" "}
                          ·{" "}
                          {formatTime(
                            booking.startsAt,
                            settings.locale,
                            settings.timezone,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Team member
                        </p>
                        <p className="mt-1 font-semibold">
                          {member?.firstName} {member?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge status={booking.status} />
                      <StatusBadge status={booking.paymentStatus} />
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={CalendarX2}
              title="No bookings found"
              description="Adjust the filters or create a new booking to fill the schedule."
              action={
                <Button onClick={() => setFlow({ open: true })}>
                  <CalendarPlus2 aria-hidden="true" />
                  New booking
                </Button>
              }
            />
          </div>
        )}
        <div className="flex items-center gap-2 border-t px-5 py-3 text-xs text-muted-foreground">
          <Filter className="size-3.5" aria-hidden="true" />
          Showing{" "}
          <span className="font-semibold text-foreground numbers-tabular">
            {filtered.length}
          </span>{" "}
          of {bookings.length} bookings
        </div>
      </Card>
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
