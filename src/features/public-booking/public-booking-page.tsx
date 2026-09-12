"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Leaf,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Brand } from "@/components/brand-mark";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_NOW, demoTimestamp } from "@/domain/sample-data";
import type { Service, TeamMember } from "@/domain/types";
import {
  addDays,
  dateKey,
  formatDate,
  formatTime,
  getAvailableSlots,
  zonedDateTimeToIso,
} from "@/features/bookings/booking-utils";
import { cn } from "@/lib/utils";
import { useNexaBookStore } from "@/store/app-store";

const stepLabels = [
  "Service",
  "Team member",
  "Date",
  "Time",
  "Your details",
  "Confirm",
] as const;
const subscribeToClient = () => () => undefined;

type ClientDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const emptyDetails: ClientDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export function PublicBookingPage() {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const services = useNexaBookStore((state) => state.services);
  const teamMembers = useNexaBookStore((state) => state.teamMembers);
  const bookings = useNexaBookStore((state) => state.bookings);
  const clients = useNexaBookStore((state) => state.clients);
  const settings = useNexaBookStore((state) => state.businessSettings);
  const createClient = useNexaBookStore((state) => state.createClient);
  const updateClient = useNexaBookStore((state) => state.updateClient);
  const createBooking = useNexaBookStore((state) => state.createBooking);
  const createActivityEvent = useNexaBookStore(
    (state) => state.createActivityEvent,
  );

  const firstBookableDay = addDays(
    dateKey(new Date(DEMO_NOW), settings.timezone),
    1,
  );
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [teamMemberId, setTeamMemberId] = useState("");
  const [day, setDay] = useState(firstBookableDay);
  const [time, setTime] = useState("");
  const [details, setDetails] = useState<ClientDetails>(emptyDetails);
  const [touchedDetails, setTouchedDetails] = useState<
    Partial<Record<keyof ClientDetails, boolean>>
  >({});
  const [savedBookingId, setSavedBookingId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState("");

  const activeServices = useMemo(
    () => services.filter((item) => item.status === "active"),
    [services],
  );
  const service = services.find((item) => item.id === serviceId);
  const teamMember = teamMembers.find((item) => item.id === teamMemberId);
  const eligibleTeam = useMemo(
    () =>
      service
        ? teamMembers.filter(
            (item) =>
              item.status === "active" && item.serviceIds.includes(service.id),
          )
        : [],
    [service, teamMembers],
  );
  const availableDays = useMemo(
    () =>
      Array.from(
        { length: Math.max(1, settings.bookingWindowDays) },
        (_, index) => addDays(firstBookableDay, index),
      ),
    [firstBookableDay, settings.bookingWindowDays],
  );
  const slots = useMemo(
    () =>
      service && teamMember
        ? getAvailableSlots({
            day,
            service,
            teamMember,
            bookings,
            services,
            timeZone: settings.timezone,
            businessHours: settings.businessHours,
          })
        : [],
    [
      bookings,
      day,
      service,
      services,
      settings.businessHours,
      settings.timezone,
      teamMember,
    ],
  );
  const detailErrors = getDetailErrors(details);
  const detailsComplete = Object.values(detailErrors).every((error) => !error);
  const canContinue = [
    Boolean(service),
    Boolean(teamMember),
    Boolean(day && slots.length),
    Boolean(time),
    detailsComplete,
    true,
  ][step];

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat(settings.locale, {
        style: "currency",
        currency: settings.currency,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 0,
      }),
    [settings.currency, settings.locale],
  );

  function chooseService(id: string) {
    setServiceId(id);
    setTeamMemberId("");
    setTime("");
    setBookingError("");
  }

  function chooseTeamMember(id: string) {
    setTeamMemberId(id);
    setTime("");
    setBookingError("");
  }

  function updateDetails(field: keyof ClientDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  function confirmBooking() {
    if (!service || !teamMember || !day || !time || !detailsComplete) return;
    const currentState = useNexaBookStore.getState();
    const currentService = currentState.services.find(
      (item) => item.id === service.id,
    );
    const currentMember = currentState.teamMembers.find(
      (item) => item.id === teamMember.id,
    );
    const withinWindow = availableDays.includes(day);
    const validSlots =
      currentService && currentMember
        ? getAvailableSlots({
            day,
            service: currentService,
            teamMember: currentMember,
            bookings: currentState.bookings,
            services: currentState.services,
            timeZone: currentState.businessSettings.timezone,
            businessHours: currentState.businessSettings.businessHours,
          })
        : [];
    if (
      !withinWindow ||
      currentService?.status !== "active" ||
      currentMember?.status !== "active" ||
      !currentMember.serviceIds.includes(currentService.id) ||
      !validSlots.includes(time)
    ) {
      setBookingError(
        "That appointment is no longer available. Please choose another date and time.",
      );
      setStep(2);
      setTime("");
      return;
    }
    const existingClient = clients.find(
      (client) =>
        client.email.toLowerCase() === details.email.trim().toLowerCase(),
    );
    const client =
      existingClient ??
      createClient({
        firstName: details.firstName.trim(),
        lastName: details.lastName.trim(),
        email: details.email.trim().toLowerCase(),
        phone: details.phone.trim(),
        status: "active",
        preferredContact: "email",
        tags: ["Online booking"],
        notes: "",
      });
    if (existingClient) {
      updateClient(existingClient.id, {
        firstName: details.firstName.trim(),
        lastName: details.lastName.trim(),
        phone: details.phone.trim(),
        status: "active",
      });
    } else {
      createActivityEvent({
        kind: "client_created",
        entityType: "client",
        entityId: client.id,
        actorId: null,
        title: "Client added",
        description: `${client.firstName} ${client.lastName} booked online.`,
        occurredAt: demoTimestamp(),
        metadata: { source: "online" },
      });
    }

    const startsAt = zonedDateTimeToIso(day, time, settings.timezone);
    const booking = createBooking({
      clientId: client.id,
      serviceId: service.id,
      teamMemberId: teamMember.id,
      startsAt,
      endsAt: new Date(
        new Date(startsAt).getTime() + service.durationMinutes * 60_000,
      ).toISOString(),
      status: "confirmed",
      paymentStatus: "unpaid",
      source: "online",
      price: service.price,
      currency: service.currency,
      notes: "Booked through the Luna Wellness public booking page.",
    });
    createActivityEvent({
      kind: "booking_created",
      entityType: "booking",
      entityId: booking.id,
      actorId: null,
      title: "Online booking received",
      description: `${service.name} for ${client.firstName} ${client.lastName}.`,
      occurredAt: demoTimestamp(),
      metadata: { source: "online" },
    });
    setSavedBookingId(booking.id);
  }

  function startAnotherBooking() {
    setStep(0);
    setServiceId("");
    setTeamMemberId("");
    setDay(firstBookableDay);
    setTime("");
    setDetails(emptyDetails);
    setTouchedDetails({});
    setSavedBookingId(null);
  }

  if (!isClient) return <PublicBookingLoading />;

  if (savedBookingId && service && teamMember) {
    return (
      <BookingSuccess
        businessName={settings.businessName}
        service={service}
        teamMember={teamMember}
        day={day}
        time={time}
        locale={settings.locale}
        timeZone={settings.timezone}
        onRestart={startAnotherBooking}
      />
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-dvh bg-[radial-gradient(circle_at_88%_0%,rgb(129_140_248/0.12),transparent_26rem),var(--background)] outline-none"
    >
      <PublicHeader />
      <div className="mx-auto grid max-w-7xl gap-7 px-4 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
        <section className="min-w-0">
          <div className="mb-7">
            <Badge variant="brand" className="bg-white">
              <Sparkles className="size-3" aria-hidden="true" /> Online booking
            </Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              Make time for feeling your best.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Choose what works for you. We’ll show only the team and times
              available for your service.
            </p>
          </div>

          <Card className="min-w-0 overflow-hidden shadow-[0_22px_60px_-45px_rgb(35_42_84/0.48)]">
            <nav
              className="scrollbar-subtle overflow-x-auto border-b bg-muted/30 px-4 sm:px-6"
              aria-label="Booking progress"
            >
              <ol className="flex min-w-max items-center gap-1 py-3">
                {stepLabels.map((label, index) => (
                  <li key={label} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => index < step && setStep(index)}
                      disabled={index > step}
                      aria-current={index === step ? "step" : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                        index === step
                          ? "bg-card text-foreground shadow-[0_1px_2px_rgb(17_21_47/0.06)]"
                          : index < step
                            ? "text-primary"
                            : "text-muted-foreground",
                      )}
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
              className="min-h-[31rem] p-5 animate-[step-in_180ms_ease-out] sm:p-7"
            >
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Step {step + 1} of {stepLabels.length}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-[-0.035em]">
                  {stepHeading(step)}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {stepDescription(step)}
                </p>
              </div>

              {step === 0 ? (
                <ServiceStep
                  services={activeServices}
                  selectedId={serviceId}
                  currency={formatCurrency}
                  onSelect={chooseService}
                />
              ) : null}
              {step === 1 ? (
                <TeamStep
                  members={eligibleTeam}
                  selectedId={teamMemberId}
                  onSelect={chooseTeamMember}
                />
              ) : null}
              {step === 2 ? (
                <DateStep
                  days={availableDays}
                  selectedDay={day}
                  isAvailable={(value) =>
                    Boolean(
                      service &&
                      teamMember &&
                      getAvailableSlots({
                        day: value,
                        service,
                        teamMember,
                        bookings,
                        services,
                        timeZone: settings.timezone,
                        businessHours: settings.businessHours,
                      }).length,
                    )
                  }
                  onSelect={(value) => {
                    setDay(value);
                    setTime("");
                    setBookingError("");
                  }}
                />
              ) : null}
              {step === 3 ? (
                <TimeStep
                  slots={slots}
                  selectedTime={time}
                  day={day}
                  timeZone={settings.timezone}
                  locale={settings.locale}
                  onSelect={(value) => {
                    setTime(value);
                    setBookingError("");
                  }}
                />
              ) : null}
              {step === 4 ? (
                <DetailsStep
                  details={details}
                  errors={detailErrors}
                  touched={touchedDetails}
                  onChange={updateDetails}
                  onBlur={(field) =>
                    setTouchedDetails((current) => ({
                      ...current,
                      [field]: true,
                    }))
                  }
                />
              ) : null}
              {step === 5 && service && teamMember ? (
                <ConfirmStep
                  businessName={settings.businessName}
                  service={service}
                  teamMember={teamMember}
                  day={day}
                  time={time}
                  details={details}
                  locale={settings.locale}
                  timeZone={settings.timezone}
                  currency={formatCurrency}
                />
              ) : null}
            </div>

            <div className="border-t bg-muted/20 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
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
                    step === 0 ? history.back() : setStep((value) => value - 1)
                  }
                >
                  <ArrowLeft aria-hidden="true" />{" "}
                  {step === 0 ? "Back" : "Previous"}
                </Button>
                <Button
                  disabled={!canContinue}
                  onClick={() =>
                    step === stepLabels.length - 1
                      ? confirmBooking()
                      : setStep((value) => value + 1)
                  }
                >
                  {step === stepLabels.length - 1
                    ? "Confirm booking"
                    : "Continue"}
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <aside
          className="space-y-4 lg:pt-[8.35rem]"
          aria-label="Luna Wellness details"
        >
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[linear-gradient(135deg,#ecfdf5,#eef2ff)] text-emerald-700 ring-1 ring-emerald-100">
                <Leaf className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold">{settings.businessName}</h2>
                <p className="text-xs text-muted-foreground">
                  Health · Beauty · Balance
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t pt-5 text-sm text-muted-foreground">
              <p className="flex gap-3">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  {settings.address.line1}
                  <br />
                  {settings.address.city}, {settings.address.region}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Mail
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />{" "}
                {settings.email}
              </p>
            </div>
          </Card>
          <div className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/65 p-4 text-xs leading-5 text-indigo-950/70">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-indigo-600"
              aria-hidden="true"
            />
            <p>
              Your details stay in this browser as part of the interactive
              NexaBook demo.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function PublicHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="NexaBook home"
          className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
        >
          <Brand />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-muted-foreground sm:block">
            Booking powered by NexaBook
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link href="/demo/login">Business login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function ServiceStep({
  services,
  selectedId,
  currency,
  onSelect,
}: {
  services: Service[];
  selectedId: string;
  currency: Intl.NumberFormat;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((service) => (
        <button
          key={service.id}
          type="button"
          aria-pressed={service.id === selectedId}
          onClick={() => onSelect(service.id)}
          className={cn(
            "group rounded-xl border p-4 text-left outline-none transition-[border-color,background-color,box-shadow] hover:border-indigo-200 hover:bg-indigo-50/25 focus-visible:ring-3 focus-visible:ring-ring/25",
            service.id === selectedId &&
              "border-primary bg-indigo-50/65 shadow-[inset_3px_0_0_0_var(--primary)]",
          )}
        >
          <span
            className="mb-4 block size-2.5 rounded-full"
            style={{ backgroundColor: service.color }}
          />
          <span className="flex items-start justify-between gap-3">
            <span className="font-bold">{service.name}</span>
            {service.id === selectedId ? (
              <CheckCircle2
                className="size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
            ) : null}
          </span>
          <span className="mt-1.5 block text-sm leading-5 text-muted-foreground">
            {service.description}
          </span>
          <span className="mt-4 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock3 className="size-3.5" aria-hidden="true" />{" "}
              {service.durationMinutes} min
            </span>
            <strong className="text-sm text-foreground">
              {currency.format(service.price)}
            </strong>
          </span>
        </button>
      ))}
    </div>
  );
}

function TeamStep({
  members,
  selectedId,
  onSelect,
}: {
  members: TeamMember[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (!members.length)
    return (
      <EmptyChoice
        title="No team members are available"
        copy="Choose another service to see more options."
      />
    );
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {members.map((member) => {
        const name = `${member.firstName} ${member.lastName}`;
        return (
          <button
            key={member.id}
            type="button"
            aria-pressed={member.id === selectedId}
            onClick={() => onSelect(member.id)}
            className={cn(
              "flex min-h-24 items-center gap-4 rounded-xl border p-4 text-left outline-none transition-[border-color,background-color] hover:border-indigo-200 hover:bg-indigo-50/25 focus-visible:ring-3 focus-visible:ring-ring/25",
              member.id === selectedId && "border-primary bg-indigo-50/65",
            )}
          >
            <Avatar name={name} className="size-11 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{name}</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {member.title}
              </span>
            </span>
            {member.id === selectedId ? (
              <CheckCircle2
                className="size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function DateStep({
  days,
  selectedDay,
  isAvailable,
  onSelect,
}: {
  days: string[];
  selectedDay: string;
  isAvailable: (day: string) => boolean;
  onSelect: (day: string) => void;
}) {
  const pageSize = 7;
  const selectedIndex = Math.max(0, days.indexOf(selectedDay));
  const [page, setPage] = useState(Math.floor(selectedIndex / pageSize));
  const pageCount = Math.max(1, Math.ceil(days.length / pageSize));
  const visibleDays = days.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Showing {page * pageSize + 1}–
          {Math.min(days.length, (page + 1) * pageSize)} of {days.length} days
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous dates"
            disabled={page === 0}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next dates"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((value) => value + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {visibleDays.map((day) => {
          const value = new Date(`${day}T12:00:00Z`);
          const available = isAvailable(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={day === selectedDay}
              disabled={!available}
              onClick={() => onSelect(day)}
              className={cn(
                "min-h-24 rounded-xl border bg-card p-3 text-center outline-none transition-[border-color,background-color] hover:border-indigo-200 hover:bg-indigo-50/25 focus-visible:ring-3 focus-visible:ring-ring/25",
                day === selectedDay && "border-primary bg-indigo-50/65",
                !available && "cursor-not-allowed bg-muted/35 opacity-55",
              )}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {new Intl.DateTimeFormat("en-CA", { weekday: "short" }).format(
                  value,
                )}
              </span>
              <span className="mt-2 block text-2xl font-bold">
                {new Intl.DateTimeFormat("en-CA", { day: "numeric" }).format(
                  value,
                )}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("en-CA", { month: "short" }).format(
                  value,
                )}
              </span>
              <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {available ? "Available" : "Unavailable"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeStep({
  slots,
  selectedTime,
  day,
  locale,
  timeZone,
  onSelect,
}: {
  slots: string[];
  selectedTime: string;
  day: string;
  locale: string;
  timeZone: string;
  onSelect: (time: string) => void;
}) {
  if (!slots.length)
    return (
      <EmptyChoice
        title="No openings on this day"
        copy="Go back and choose another date or team member."
      />
    );
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          aria-pressed={slot === selectedTime}
          onClick={() => onSelect(slot)}
          className={cn(
            "min-h-12 rounded-lg border bg-card px-3 text-sm font-semibold outline-none transition-[border-color,background-color,color] hover:border-indigo-200 hover:bg-indigo-50/35 focus-visible:ring-3 focus-visible:ring-ring/25",
            slot === selectedTime &&
              "border-primary bg-primary text-primary-foreground hover:bg-primary",
          )}
        >
          {formatTime(
            zonedDateTimeToIso(day, slot, timeZone),
            locale,
            timeZone,
          )}
        </button>
      ))}
    </div>
  );
}

function DetailsStep({
  details,
  errors,
  touched,
  onChange,
  onBlur,
}: {
  details: ClientDetails;
  errors: Record<keyof ClientDetails, string>;
  touched: Partial<Record<keyof ClientDetails, boolean>>;
  onChange: (field: keyof ClientDetails, value: string) => void;
  onBlur: (field: keyof ClientDetails) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field
        label="First name"
        htmlFor="public-first-name"
        error={touched.firstName ? errors.firstName : undefined}
      >
        <Input
          id="public-first-name"
          aria-describedby={
            touched.firstName ? "public-first-name-message" : undefined
          }
          autoComplete="given-name"
          required
          invalid={Boolean(touched.firstName && errors.firstName)}
          value={details.firstName}
          onChange={(event) => onChange("firstName", event.target.value)}
          onBlur={() => onBlur("firstName")}
        />
      </Field>
      <Field
        label="Last name"
        htmlFor="public-last-name"
        error={touched.lastName ? errors.lastName : undefined}
      >
        <Input
          id="public-last-name"
          aria-describedby={
            touched.lastName ? "public-last-name-message" : undefined
          }
          autoComplete="family-name"
          required
          invalid={Boolean(touched.lastName && errors.lastName)}
          value={details.lastName}
          onChange={(event) => onChange("lastName", event.target.value)}
          onBlur={() => onBlur("lastName")}
        />
      </Field>
      <Field
        label="Email address"
        htmlFor="public-email"
        hint="We’ll send your booking confirmation here."
        error={touched.email ? errors.email : undefined}
      >
        <Input
          id="public-email"
          aria-describedby="public-email-message"
          type="email"
          autoComplete="email"
          required
          invalid={Boolean(touched.email && errors.email)}
          value={details.email}
          onChange={(event) => onChange("email", event.target.value)}
          onBlur={() => onBlur("email")}
        />
      </Field>
      <Field
        label="Phone number"
        htmlFor="public-phone"
        hint="Used only if the team needs to reach you."
        error={touched.phone ? errors.phone : undefined}
      >
        <Input
          id="public-phone"
          aria-describedby="public-phone-message"
          type="tel"
          autoComplete="tel"
          required
          invalid={Boolean(touched.phone && errors.phone)}
          value={details.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          onBlur={() => onBlur("phone")}
        />
      </Field>
    </div>
  );
}

function ConfirmStep({
  businessName,
  service,
  teamMember,
  day,
  time,
  details,
  locale,
  timeZone,
  currency,
}: {
  businessName: string;
  service: Service;
  teamMember: TeamMember;
  day: string;
  time: string;
  details: ClientDetails;
  locale: string;
  timeZone: string;
  currency: Intl.NumberFormat;
}) {
  const iso = zonedDateTimeToIso(day, time, timeZone);
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-indigo-100 bg-[linear-gradient(145deg,#f8f9ff,#ffffff)] p-5">
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Check className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold">Everything looks good.</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Review your appointment, then confirm it with {businessName}.
            </p>
          </div>
        </div>
      </div>
      <dl className="grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
        <Summary
          icon={Sparkles}
          label="Service"
          value={service.name}
          detail={`${service.durationMinutes} min · ${currency.format(service.price)}`}
        />
        <Summary
          icon={UserRound}
          label="With"
          value={`${teamMember.firstName} ${teamMember.lastName}`}
          detail={teamMember.title}
        />
        <Summary
          icon={CalendarDays}
          label="Date"
          value={formatDate(iso, locale, timeZone, "long")}
        />
        <Summary
          icon={Clock3}
          label="Time"
          value={formatTime(iso, locale, timeZone)}
        />
        <Summary
          icon={Mail}
          label="Confirmation to"
          value={`${details.firstName} ${details.lastName}`}
          detail={details.email}
        />
      </dl>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" /> No
        payment is required to reserve this appointment.
      </p>
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-bold">{value}</dd>
        {detail ? (
          <dd className="mt-0.5 text-xs text-muted-foreground">{detail}</dd>
        ) : null}
      </div>
    </div>
  );
}

function EmptyChoice({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/25 px-6 py-12 text-center">
      <Clock3
        className="mx-auto size-6 text-muted-foreground"
        aria-hidden="true"
      />
      <p className="mt-3 font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
    </div>
  );
}

function BookingSuccess({
  businessName,
  service,
  teamMember,
  day,
  time,
  locale,
  timeZone,
  onRestart,
}: {
  businessName: string;
  service: Service;
  teamMember: TeamMember;
  day: string;
  time: string;
  locale: string;
  timeZone: string;
  onRestart: () => void;
}) {
  const iso = zonedDateTimeToIso(day, time, timeZone);
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-dvh bg-[radial-gradient(circle_at_50%_0%,rgb(99_102_241/0.13),transparent_30rem),var(--background)] outline-none"
    >
      <PublicHeader />
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-2xl place-items-center px-4 py-12">
        <Card className="w-full p-6 text-center shadow-[0_24px_70px_-45px_rgb(35_42_84/0.55)] animate-[step-in_220ms_ease-out] sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60 animate-[success-pop_220ms_cubic-bezier(0.2,0.8,0.2,1)]">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </span>
          <Badge variant="success" className="mx-auto mt-7">
            Booking confirmed
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.045em]">
            You’re all set.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Your appointment is now in the {businessName} schedule and the
            NexaBook admin workspace.
          </p>
          <dl className="mt-8 grid gap-4 rounded-xl border bg-muted/20 p-5 text-left sm:grid-cols-2">
            <Summary icon={Sparkles} label="Service" value={service.name} />
            <Summary
              icon={UserRound}
              label="With"
              value={`${teamMember.firstName} ${teamMember.lastName}`}
            />
            <Summary
              icon={CalendarDays}
              label="Date"
              value={formatDate(iso, locale, timeZone, "long")}
            />
            <Summary
              icon={Clock3}
              label="Time"
              value={formatTime(iso, locale, timeZone)}
            />
          </dl>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={onRestart} variant="outline">
              Book another visit
            </Button>
            <Button asChild>
              <Link href="/demo/login">
                View admin demo <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

function PublicBookingLoading() {
  return (
    <main id="main-content" className="min-h-dvh">
      <PublicHeader />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Skeleton className="h-[38rem] rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </main>
  );
}

function stepHeading(step: number) {
  return [
    "Choose a service",
    "Choose your specialist",
    "Choose a date",
    "Choose a time",
    "Tell us about you",
    "Review your booking",
  ][step];
}

function stepDescription(step: number) {
  return [
    "Select the treatment that fits what you need today.",
    "Pick the person you’d like to see.",
    "Choose a day that works for your schedule.",
    "These times are available with your selected specialist.",
    "We only need the basics to reserve your visit.",
    "Check the details before adding this appointment to the schedule.",
  ][step];
}

function getDetailErrors(
  details: ClientDetails,
): Record<keyof ClientDetails, string> {
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim());
  const phoneIsValid = details.phone.replace(/\D/g, "").length >= 7;
  return {
    firstName: details.firstName.trim() ? "" : "Enter your first name.",
    lastName: details.lastName.trim() ? "" : "Enter your last name.",
    email: emailIsValid ? "" : "Enter a valid email address.",
    phone: phoneIsValid ? "" : "Enter a valid phone number.",
  };
}
