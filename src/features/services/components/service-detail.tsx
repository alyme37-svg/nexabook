"use client";

import { Clock3, Pencil, WalletCards } from "lucide-react";

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
import type { Service, TeamMember } from "@/domain/types";

export function ServiceDetail({
  open,
  onOpenChange,
  service,
  members,
  locale,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
  members: TeamMember[];
  locale: string;
  onEdit: () => void;
}) {
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: service.currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto p-0">
        <SheetHeader className="border-b px-6 py-6">
          <div className="flex items-start gap-3">
            <span
              className="mt-1 size-3 rounded-full"
              style={{ backgroundColor: service.color }}
            />
            <div className="min-w-0 flex-1">
              <SheetTitle>{service.name}</SheetTitle>
              <SheetDescription>{service.category}</SheetDescription>
            </div>
            <StatusBadge status={service.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {service.description}
          </p>
        </SheetHeader>
        <div className="grid gap-6 p-6">
          <section className="grid grid-cols-3 gap-3">
            <Info
              icon={Clock3}
              label="Duration"
              value={`${service.durationMinutes} min`}
            />
            <Info
              icon={Clock3}
              label="Buffer"
              value={`${service.bufferMinutes} min`}
            />
            <Info
              icon={WalletCards}
              label="Price"
              value={money.format(service.price)}
            />
          </section>
          <section>
            <h3 className="text-sm font-bold">Assigned team</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              These members can be selected when creating a booking.
            </p>
            <div className="mt-3 grid gap-2">
              {members.length ? (
                members.map((member) => {
                  const name = `${member.firstName} ${member.lastName}`;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      <Avatar name={name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {member.title}
                        </span>
                      </span>
                      <Badge variant="neutral">{member.status}</Badge>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  No team members are assigned yet.
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="border-t px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Button className="w-full" onClick={onEdit}>
            <Pencil aria-hidden="true" />
            Edit service
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/25 p-3">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      <p className="mt-2 text-sm font-bold numbers-tabular">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
