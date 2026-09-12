"use client";

import {
  CalendarDays,
  Mail,
  MessageSquareText,
  Pencil,
  Phone,
  WalletCards,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getEffectiveBookingValue } from "@/domain/booking-derived";
import type { Booking, Client, Service, TeamMember } from "@/domain/types";
import { formatDate, formatTime } from "@/features/bookings/booking-utils";

export function ClientDetail({
  open,
  onOpenChange,
  client,
  bookings,
  serviceMap,
  teamMap,
  locale,
  currency,
  timeZone,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  bookings: Booking[];
  serviceMap: Map<string, Service>;
  teamMap: Map<string, TeamMember>;
  locale: string;
  currency: string;
  timeZone: string;
  onEdit: () => void;
}) {
  const name = `${client.firstName} ${client.lastName}`;
  const history = bookings
    .filter((booking) => booking.clientId === client.id)
    .toSorted((a, b) => b.startsAt.localeCompare(a.startsAt));
  const spend = getEffectiveBookingValue(history);
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(42rem,100vw)] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b px-5 py-6 sm:px-7">
          <div className="flex items-start gap-3">
            <Avatar name={name} className="size-11 text-sm" />
            <div className="min-w-0 flex-1">
              <SheetTitle>{name}</SheetTitle>
              <SheetDescription>{client.email}</SheetDescription>
            </div>
            <StatusBadge status={client.status} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {client.tags.map((tag) => (
              <Badge key={tag} variant="brand">
                {tag}
              </Badge>
            ))}
          </div>
        </SheetHeader>
        <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 border-b bg-muted/20 p-5 sm:grid-cols-3 sm:px-7">
            <Stat
              icon={CalendarDays}
              label="Bookings"
              value={history.length.toLocaleString(locale)}
            />
            <Stat
              icon={WalletCards}
              label="Booking value"
              value={money.format(spend)}
            />
            <Stat
              icon={MessageSquareText}
              label="Contact"
              value={client.preferredContact.toUpperCase()}
            />
          </div>
          <div className="grid gap-6 px-5 py-6 sm:px-7">
            <section>
              <h3 className="text-sm font-bold">Contact details</h3>
              <div className="mt-3 grid gap-3 text-sm">
                <Detail icon={Mail} value={client.email} />
                <Detail icon={Phone} value={client.phone} />
              </div>
            </section>
            <section>
              <h3 className="text-sm font-bold">Notes</h3>
              <p className="mt-3 rounded-xl border bg-muted/25 p-4 text-sm leading-6 text-muted-foreground">
                {client.notes || "No notes have been added for this client."}
              </p>
            </section>
            <section>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold">Booking history</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Appointments are drawn directly from the booking record.
                  </p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground numbers-tabular">
                  {history.length} total
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                {history.length ? (
                  history.map((booking) => {
                    const service = serviceMap.get(booking.serviceId);
                    const member = teamMap.get(booking.teamMemberId);
                    return (
                      <article
                        key={booking.id}
                        className="rounded-xl border p-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {service?.name ?? "Archived service"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(booking.startsAt, locale, timeZone)} ·{" "}
                              {formatTime(booking.startsAt, locale, timeZone)} ·{" "}
                              {member
                                ? `${member.firstName} ${member.lastName}`
                                : "Unassigned"}
                            </p>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    No bookings yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
        <div className="border-t px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7">
          <Button className="w-full" onClick={onEdit}>
            <Pencil aria-hidden="true" />
            Edit client
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div>
      <Icon className="size-4 text-primary" aria-hidden="true" />
      <p className="mt-2 text-lg font-bold numbers-tabular">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
function Detail({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <p className="flex items-center gap-2.5">
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      {value}
    </p>
  );
}
