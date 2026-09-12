"use client";

import { CalendarClock, Mail, Pencil, Phone, Sparkles } from "lucide-react";

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

const labels: Record<keyof TeamMember["availability"], string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
export function MemberDetail({
  open,
  onOpenChange,
  member,
  services,
  bookingCount,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  services: Service[];
  bookingCount: number;
  onEdit: () => void;
}) {
  const name = `${member.firstName} ${member.lastName}`;
  const assigned = services.filter((service) =>
    member.serviceIds.includes(service.id),
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto p-0">
        <SheetHeader className="border-b px-6 py-6">
          <div className="flex items-start gap-3">
            <Avatar name={name} className="size-11 text-sm" />
            <div className="min-w-0 flex-1">
              <SheetTitle>{name}</SheetTitle>
              <SheetDescription>{member.title}</SheetDescription>
            </div>
            <StatusBadge status={member.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {member.bio || "No bio provided."}
          </p>
        </SheetHeader>
        <div className="grid gap-6 p-6">
          <section>
            <h3 className="text-sm font-bold">At a glance</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Info
                icon={CalendarClock}
                label="Bookings"
                value={bookingCount.toLocaleString()}
              />
              <Info icon={Sparkles} label="Role" value={member.role} />
            </div>
          </section>
          <section>
            <h3 className="text-sm font-bold">Contact</h3>
            <div className="mt-3 grid gap-3 text-sm text-muted-foreground">
              <p className="flex gap-2.5">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {member.email}
              </p>
              <p className="flex gap-2.5">
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                {member.phone}
              </p>
            </div>
          </section>
          <section>
            <h3 className="text-sm font-bold">Assigned services</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {assigned.length ? (
                assigned.map((service) => (
                  <Badge key={service.id} variant="brand">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    {service.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No services assigned.
                </p>
              )}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-bold">Working hours</h3>
            <div className="mt-3 grid gap-2">
              {Object.entries(member.availability).map(([day, ranges]) => (
                <div
                  key={day}
                  className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold">
                    {labels[day as keyof TeamMember["availability"]]}
                  </span>
                  <span className="text-muted-foreground">
                    {ranges.length
                      ? ranges
                          .map((range) => `${range.start} – ${range.end}`)
                          .join(", ")
                      : "Unavailable"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="border-t px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Button className="w-full" onClick={onEdit}>
            <Pencil aria-hidden="true" />
            Edit member
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
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/25 p-3">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      <p className="mt-2 font-bold capitalize">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
