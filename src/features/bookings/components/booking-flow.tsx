"use client";

import {
  CalendarDays,
  Check,
  Clock3,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { notifySuccess } from "@/components/ui/toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DEMO_NOW, demoTimestamp } from "@/domain/sample-data";
import { cn } from "@/lib/utils";
import { useNexaBookStore } from "@/store/app-store";
import {
  addDays,
  dateKey,
  formatDate,
  formatTime,
  getAvailableSlots,
  zonedDateTimeToIso,
} from "@/features/bookings/booking-utils";

const steps = [
  "Client",
  "Service",
  "Team member",
  "Date & time",
  "Confirmation",
] as const;

export function BookingFlow({
  open,
  onOpenChange,
  bookingId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId?: string;
}) {
  const clients = useNexaBookStore((state) => state.clients);
  const services = useNexaBookStore((state) => state.services);
  const teamMembers = useNexaBookStore((state) => state.teamMembers);
  const bookings = useNexaBookStore((state) => state.bookings);
  const settings = useNexaBookStore((state) => state.businessSettings);
  const createBooking = useNexaBookStore((state) => state.createBooking);
  const updateBooking = useNexaBookStore((state) => state.updateBooking);
  const createActivityEvent = useNexaBookStore(
    (state) => state.createActivityEvent,
  );
  const original = bookingId
    ? bookings.find((booking) => booking.id === bookingId)
    : undefined;
  const initialDay = original
    ? dateKey(new Date(original.startsAt), settings.timezone)
    : dateKey(new Date(DEMO_NOW), settings.timezone);

  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState(original?.clientId ?? "");
  const [serviceId, setServiceId] = useState(original?.serviceId ?? "");
  const [teamMemberId, setTeamMemberId] = useState(
    original?.teamMemberId ?? "",
  );
  const [day, setDay] = useState(initialDay);
  const [time, setTime] = useState(
    original
      ? new Intl.DateTimeFormat("en-CA", {
          timeZone: settings.timezone,
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(original.startsAt))
      : "",
  );
  const [notes, setNotes] = useState(original?.notes ?? "");
  const [clientSearch, setClientSearch] = useState("");
  const [bookingError, setBookingError] = useState("");

  const client = clients.find((item) => item.id === clientId);
  const service = services.find((item) => item.id === serviceId);
  const teamMember = teamMembers.find((item) => item.id === teamMemberId);
  const matchingClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    return clients
      .filter(
        (item) =>
          !query ||
          `${item.firstName} ${item.lastName} ${item.email}`
            .toLowerCase()
            .includes(query),
      )
      .slice(0, 8);
  }, [clientSearch, clients]);
  const eligibleTeam = service
    ? teamMembers.filter(
        (item) =>
          (item.status === "active" || item.id === original?.teamMemberId) &&
          (item.serviceIds.includes(service.id) ||
            item.id === original?.teamMemberId),
      )
    : [];
  const slots =
    service && teamMember
      ? getAvailableSlots({
          day,
          service,
          teamMember,
          bookings,
          services,
          timeZone: settings.timezone,
          businessHours: settings.businessHours,
          excludeBookingId: original?.id,
        })
      : [];
  const canContinue = [
    Boolean(client),
    Boolean(service),
    Boolean(teamMember),
    Boolean(day && time),
    true,
  ][step];

  function saveBooking() {
    if (!client || !service || !teamMember || !time) {
      setBookingError("Complete every booking step before confirming.");
      return;
    }
    const currentState = useNexaBookStore.getState();
    const currentClient = currentState.clients.find(
      (item) => item.id === client.id,
    );
    const currentService = currentState.services.find(
      (item) => item.id === service.id,
    );
    const currentTeamMember = currentState.teamMembers.find(
      (item) => item.id === teamMember.id,
    );
    if (!currentClient || !currentService || !currentTeamMember) {
      setBookingError(
        "One of the selected booking options is no longer available.",
      );
      return;
    }
    const originalRelationship =
      original?.serviceId === currentService.id &&
      original.teamMemberId === currentTeamMember.id;
    if (
      currentService.status !== "active" &&
      currentService.id !== original?.serviceId
    ) {
      setBookingError(
        "This service is no longer available. Choose another service.",
      );
      return;
    }
    if (
      (currentTeamMember.status !== "active" ||
        !currentTeamMember.serviceIds.includes(currentService.id)) &&
      !originalRelationship
    ) {
      setBookingError(
        "This team member is no longer available for the selected service.",
      );
      return;
    }
    const firstDay = dateKey(new Date(DEMO_NOW), settings.timezone);
    const lastDay = addDays(firstDay, settings.bookingWindowDays);
    const originalDay = original
      ? dateKey(new Date(original.startsAt), settings.timezone)
      : undefined;
    if ((day < firstDay || day > lastDay) && day !== originalDay) {
      setBookingError(
        "The selected date is outside the current booking window.",
      );
      return;
    }
    const validSlots = getAvailableSlots({
      day,
      service: currentService,
      teamMember: currentTeamMember,
      bookings: currentState.bookings,
      services: currentState.services,
      timeZone: settings.timezone,
      businessHours: settings.businessHours,
      excludeBookingId: original?.id,
    });
    if (!validSlots.includes(time)) {
      setBookingError(
        "That time is no longer available. Choose another opening.",
      );
      setStep(3);
      setTime("");
      return;
    }
    const startsAt = zonedDateTimeToIso(day, time, settings.timezone);
    const endsAt = new Date(
      new Date(startsAt).getTime() + currentService.durationMinutes * 60_000,
    ).toISOString();
    const data = {
      clientId: currentClient.id,
      serviceId: currentService.id,
      teamMemberId: currentTeamMember.id,
      startsAt,
      endsAt,
      status: original?.status ?? ("confirmed" as const),
      paymentStatus: original?.paymentStatus ?? ("unpaid" as const),
      source: original?.source ?? ("staff" as const),
      price: original?.price ?? currentService.price,
      currency: original?.currency ?? currentService.currency,
      notes,
    };
    const saved = original
      ? (updateBooking(original.id, data), original)
      : createBooking(data);
    createActivityEvent({
      kind: original ? "booking_updated" : "booking_created",
      entityType: "booking",
      entityId: saved.id,
      actorId: "team-004",
      title: original ? "Booking updated" : "Booking created",
      description: `${currentService.name} for ${currentClient.firstName} ${currentClient.lastName}.`,
      occurredAt: demoTimestamp(),
      metadata: { source: "staff" },
    });
    onOpenChange(false);
    notifySuccess(
      original ? "Booking updated" : "Booking created",
      `${currentClient.firstName} ${currentClient.lastName} · ${formatDate(startsAt, settings.locale, settings.timezone, "short")} at ${formatTime(startsAt, settings.locale, settings.timezone)}`,
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(42rem,100vw)] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b px-5 py-5 sm:px-7">
          <SheetTitle>
            {original ? "Edit booking" : "Create a booking"}
          </SheetTitle>
          <SheetDescription>
            {original
              ? "Update the appointment details and save your changes."
              : "Build a complete appointment in five clear steps."}
          </SheetDescription>
        </SheetHeader>

        <nav
          className="scrollbar-subtle overflow-x-auto border-b bg-muted/35 px-5 sm:px-7"
          aria-label="Booking progress"
        >
          <ol className="flex min-w-max items-center gap-1 py-3">
            {steps.map((label, index) => (
              <li key={label} className="flex items-center">
                <button
                  type="button"
                  onClick={() => index < step && setStep(index)}
                  disabled={index > step}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                    index === step
                      ? "bg-card text-foreground shadow-[0_1px_2px_rgb(17_21_47/0.05)]"
                      : index < step
                        ? "text-primary"
                        : "text-muted-foreground",
                  )}
                  aria-current={index === step ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full border text-[10px]",
                      index < step &&
                        "border-primary bg-primary text-primary-foreground",
                      index === step && "border-primary text-primary",
                    )}
                  >
                    {index < step ? (
                      <Check className="size-3" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div
          key={step}
          className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto px-5 py-6 animate-[step-in_180ms_ease-out] sm:px-7"
        >
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.025em]">
              {steps[step]}
            </h2>
          </div>

          {step === 0 ? (
            <div className="space-y-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="Search clients"
                  placeholder="Search by name or email"
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="grid gap-2">
                {matchingClients.map((item) => {
                  const name = `${item.firstName} ${item.lastName}`;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={clientId === item.id}
                      onClick={() => {
                        setClientId(item.id);
                        setBookingError("");
                      }}
                      className={cn(
                        "flex min-h-16 items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/25",
                        clientId === item.id && "border-primary bg-accent",
                      )}
                    >
                      <Avatar name={name} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{name}</span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {item.email}
                        </span>
                      </span>
                      {clientId === item.id ? (
                        <Check
                          className="size-5 text-primary"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
                {!matchingClients.length ? (
                  <div className="rounded-xl border border-dashed bg-muted/25 px-5 py-8 text-center">
                    <p className="text-sm font-semibold">No matching clients</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try a different name or email address.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {services
                .filter((item) => item.status === "active")
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={serviceId === item.id}
                    onClick={() => {
                      setServiceId(item.id);
                      setTeamMemberId("");
                      setTime("");
                      setBookingError("");
                    }}
                    className={cn(
                      "rounded-xl border p-4 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/25",
                      serviceId === item.id && "border-primary bg-accent",
                    )}
                  >
                    <span
                      className="mb-3 block size-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="block font-semibold">{item.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {item.durationMinutes} min ·{" "}
                      {new Intl.NumberFormat(settings.locale, {
                        style: "currency",
                        currency: item.currency,
                        currencyDisplay: "narrowSymbol",
                        maximumFractionDigits: 0,
                      }).format(item.price)}
                    </span>
                  </button>
                ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-3">
              {eligibleTeam.map((item) => {
                const name = `${item.firstName} ${item.lastName}`;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={teamMemberId === item.id}
                    onClick={() => {
                      setTeamMemberId(item.id);
                      setTime("");
                      setBookingError("");
                    }}
                    className={cn(
                      "flex min-h-20 items-center gap-4 rounded-xl border p-4 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/25",
                      teamMemberId === item.id && "border-primary bg-accent",
                    )}
                  >
                    <Avatar name={name} />
                    <span className="flex-1">
                      <span className="block font-semibold">{name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {item.title}
                      </span>
                    </span>
                    <Badge
                      variant={item.status === "active" ? "success" : "warning"}
                    >
                      {item.status === "active" ? "Available" : "Away"}
                    </Badge>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <label
                htmlFor="booking-day"
                className="grid gap-1.5 text-sm font-medium"
              >
                Appointment date
                <DatePicker
                  id="booking-day"
                  min={dateKey(new Date(DEMO_NOW), settings.timezone)}
                  max={addDays(
                    dateKey(new Date(DEMO_NOW), settings.timezone),
                    settings.bookingWindowDays,
                  )}
                  isDateDisabled={(value) =>
                    service && teamMember
                      ? getAvailableSlots({
                          day: value,
                          service,
                          teamMember,
                          bookings,
                          services,
                          timeZone: settings.timezone,
                          businessHours: settings.businessHours,
                          excludeBookingId: original?.id,
                        }).length === 0
                      : false
                  }
                  value={day}
                  onChange={(value) => {
                    setDay(value);
                    setTime("");
                    setBookingError("");
                  }}
                />
              </label>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Available times</p>
                  <span className="text-xs text-muted-foreground">
                    {slots.length} openings
                  </span>
                </div>
                {slots.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={time === slot}
                        onClick={() => {
                          setTime(slot);
                          setBookingError("");
                        }}
                        className={cn(
                          "min-h-11 rounded-lg border bg-card px-3 text-sm font-semibold outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/25",
                          time === slot &&
                            "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {formatTime(
                          zonedDateTimeToIso(day, slot, settings.timezone),
                          settings.locale,
                          settings.timezone,
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-muted/30 px-5 py-8 text-center">
                    <Clock3
                      className="mx-auto size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-sm font-semibold">
                      No available times
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Choose another day or team member.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {step === 4 && client && service && teamMember ? (
            <div className="space-y-5">
              <div className="rounded-2xl border bg-[linear-gradient(145deg,var(--card),#f8f7ff)] p-5">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Check className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-lg font-bold">
                      Ready to {original ? "update" : "book"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Review the details below. The appointment will appear in
                      Bookings and Calendar immediately.
                    </p>
                  </div>
                </div>
              </div>
              <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                <Summary
                  icon={UserRound}
                  label="Client"
                  value={`${client.firstName} ${client.lastName}`}
                />
                <Summary
                  icon={CalendarDays}
                  label="Service"
                  value={service.name}
                />
                <Summary
                  icon={UsersRound}
                  label="Team member"
                  value={`${teamMember.firstName} ${teamMember.lastName}`}
                />
                <Summary
                  icon={Clock3}
                  label="Date & time"
                  value={`${formatDate(zonedDateTimeToIso(day, time, settings.timezone), settings.locale, settings.timezone, "long")} · ${formatTime(zonedDateTimeToIso(day, time, settings.timezone), settings.locale, settings.timezone)}`}
                />
              </dl>
              <label
                htmlFor="booking-notes"
                className="grid gap-1.5 text-sm font-medium"
              >
                Notes{" "}
                <span className="font-normal text-muted-foreground">
                  Optional
                </span>
                <textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Add preparation details or client preferences"
                  className="w-full resize-none rounded-md border border-input bg-card px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 md:text-sm"
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="border-t bg-card px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
          {bookingError ? (
            <p
              className="mb-2 text-sm font-medium text-destructive"
              role="alert"
            >
              {bookingError}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() =>
                step === 0 ? onOpenChange(false) : setStep((value) => value - 1)
              }
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              disabled={!canContinue}
              onClick={() =>
                step === steps.length - 1
                  ? saveBooking()
                  : setStep((value) => value + 1)
              }
            >
              {step === steps.length - 1
                ? original
                  ? "Save changes"
                  : "Create booking"
                : "Continue"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
      </div>
    </div>
  );
}
