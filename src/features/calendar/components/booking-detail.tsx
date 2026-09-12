"use client";

import {
  CalendarDays,
  Clock3,
  CreditCard,
  FileText,
  Pencil,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Booking, Client, Service, TeamMember } from "@/domain/types";
import { formatDate, formatTime } from "@/features/bookings/booking-utils";

export function BookingDetail({
  booking,
  client,
  service,
  member,
  locale,
  timeZone,
  open,
  onOpenChange,
  onEdit,
}: {
  booking: Booking;
  client?: Client;
  service?: Service;
  member?: TeamMember;
  locale: string;
  timeZone: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  const clientName = client
    ? `${client.firstName} ${client.lastName}`
    : "Unknown client";
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto p-0">
        <SheetHeader className="border-b px-6 py-6">
          <div className="mb-3 flex items-center gap-3">
            <Avatar name={clientName} />
            <div className="min-w-0">
              <SheetTitle>{clientName}</SheetTitle>
              <SheetDescription className="truncate">
                {client?.email}
              </SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={booking.status} />
            <StatusBadge status={booking.paymentStatus} />
          </div>
        </SheetHeader>
        <div className="grid gap-5 p-6">
          <div className="rounded-xl border bg-[linear-gradient(145deg,var(--card),#f8f7ff)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
              Appointment
            </p>
            <p className="mt-2 text-lg font-bold">{service?.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(booking.startsAt, locale, timeZone, "long")}
            </p>
          </div>
          <dl className="grid gap-4">
            <Detail
              icon={Clock3}
              label="Time"
              value={`${formatTime(booking.startsAt, locale, timeZone)} – ${formatTime(booking.endsAt, locale, timeZone)}`}
            />
            <Detail
              icon={UsersRound}
              label="Team member"
              value={
                member ? `${member.firstName} ${member.lastName}` : "Unassigned"
              }
            />
            <Detail
              icon={UserRound}
              label="Client phone"
              value={client?.phone ?? "Not available"}
            />
            <Detail
              icon={CreditCard}
              label="Price"
              value={new Intl.NumberFormat(locale, {
                style: "currency",
                currency: booking.currency,
                currencyDisplay: "narrowSymbol",
              }).format(booking.price)}
            />
            <Detail
              icon={CalendarDays}
              label="Source"
              value={booking.source.replace("_", " ")}
            />
            {booking.notes ? (
              <Detail icon={FileText} label="Notes" value={booking.notes} />
            ) : null}
          </dl>
        </div>
        <div className="mt-auto border-t px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Button className="w-full" onClick={onEdit}>
            <Pencil aria-hidden="true" />
            Edit booking
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-semibold capitalize">{value}</dd>
      </div>
    </div>
  );
}
