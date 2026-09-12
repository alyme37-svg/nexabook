"use client";

import { Check, Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { notifySuccess } from "@/components/ui/toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TeamMember, Weekday, WeeklyAvailability } from "@/domain/types";
import { demoTimestamp } from "@/domain/sample-data";
import { cn } from "@/lib/utils";
import { useNexaBookStore } from "@/store/app-store";

const days: Array<{ key: Weekday; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];
const freshAvailability = (): WeeklyAvailability => ({
  monday: [{ start: "09:00", end: "17:30" }],
  tuesday: [{ start: "09:00", end: "17:30" }],
  wednesday: [{ start: "09:00", end: "17:30" }],
  thursday: [{ start: "09:00", end: "17:30" }],
  friday: [{ start: "09:00", end: "17:30" }],
  saturday: [{ start: "09:00", end: "14:00" }],
  sunday: [],
});

export function MemberForm({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
}) {
  const services = useNexaBookStore((state) => state.services);
  const createTeamMember = useNexaBookStore((state) => state.createTeamMember);
  const updateTeamMember = useNexaBookStore((state) => state.updateTeamMember);
  const createActivityEvent = useNexaBookStore(
    (state) => state.createActivityEvent,
  );
  const [firstName, setFirstName] = useState(member?.firstName ?? "");
  const [lastName, setLastName] = useState(member?.lastName ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [title, setTitle] = useState(member?.title ?? "Service specialist");
  const [bio, setBio] = useState(member?.bio ?? "");
  const [role, setRole] = useState<TeamMember["role"]>(
    member?.role ?? "specialist",
  );
  const [status, setStatus] = useState<TeamMember["status"]>(
    member?.status ?? "active",
  );
  const [serviceIds, setServiceIds] = useState(member?.serviceIds ?? []);
  const [availability, setAvailability] = useState<WeeklyAvailability>(
    member?.availability ?? freshAvailability(),
  );
  const [hoursSubmitted, setHoursSubmitted] = useState(false);
  const hourErrors = Object.fromEntries(
    days.map(({ key }) => {
      const range = availability[key][0];
      return [
        key,
        range && (!range.start || !range.end || range.start >= range.end)
          ? "End time must be later than start time."
          : "",
      ];
    }),
  ) as Record<Weekday, string>;
  function toggleService(id: string) {
    setServiceIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }
  function changeHours(day: Weekday, field: "start" | "end", value: string) {
    setAvailability((current) => ({
      ...current,
      [day]: current[day].length
        ? [{ ...current[day][0], [field]: value }]
        : [
            {
              start: field === "start" ? value : "09:00",
              end: field === "end" ? value : "17:00",
            },
          ],
    }));
  }
  function toggleDay(day: Weekday) {
    setAvailability((current) => ({
      ...current,
      [day]: current[day].length ? [] : [{ start: "09:00", end: "17:00" }],
    }));
  }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHoursSubmitted(true);
    if (Object.values(hourErrors).some(Boolean)) return;
    const data = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      title: title.trim(),
      bio,
      role,
      status,
      serviceIds,
      availability,
      avatarUrl: null,
    };
    const saved = member
      ? (updateTeamMember(member.id, data), member)
      : createTeamMember(data);
    createActivityEvent({
      kind: member ? "team_member_updated" : "team_member_created",
      entityType: "team_member",
      entityId: saved.id,
      actorId: "team-004",
      title: member ? "Team member updated" : "Team member added",
      description: `${data.firstName} ${data.lastName} ${member ? "was updated" : "joined the team"}.`,
      occurredAt: demoTimestamp(),
      metadata: { status },
    });
    onOpenChange(false);
    notifySuccess(
      member ? "Team member updated" : "Team member added",
      `${data.firstName} ${data.lastName}'s availability is now up to date.`,
    );
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(42rem,100vw)] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b px-5 py-5 sm:px-7">
          <SheetTitle>
            {member ? "Edit team member" : "Add team member"}
          </SheetTitle>
          <SheetDescription>
            Set the services and working hours that shape booking availability.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={save}
          className="scrollbar-subtle flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <div className="grid gap-6 px-5 py-6 sm:px-7">
            <section className="grid gap-4">
              <h2 className="text-sm font-bold">Profile</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" htmlFor="member-first">
                  <Input
                    id="member-first"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    autoFocus
                  />
                </Field>
                <Field label="Last name" htmlFor="member-last">
                  <Input
                    id="member-last"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </Field>
              </div>
              <Field label="Work email" htmlFor="member-email">
                <Input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone" htmlFor="member-phone">
                  <Input
                    id="member-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                  />
                </Field>
                <Field label="Job title" htmlFor="member-title">
                  <Input
                    id="member-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Role" htmlFor="member-role">
                  <Select
                    id="member-role"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as TeamMember["role"])
                    }
                  >
                    <option value="specialist">Specialist</option>
                    <option value="manager">Manager</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="owner">Owner</option>
                  </Select>
                </Field>
                <Field label="Status" htmlFor="member-status">
                  <Select
                    id="member-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as TeamMember["status"])
                    }
                  >
                    <option value="active">Active</option>
                    <option value="away">Away</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </Field>
              </div>
              <Field label="Bio" htmlFor="member-bio">
                <textarea
                  id="member-bio"
                  rows={3}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="w-full resize-none rounded-md border border-input bg-card px-3 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 md:text-sm"
                />
              </Field>
            </section>
            <section>
              <h2 className="text-sm font-bold">Assigned services</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Only active services are shown to clients when this member is
                selected.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {services
                  .filter((service) => service.status === "active")
                  .map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      aria-pressed={serviceIds.includes(service.id)}
                      onClick={() => toggleService(service.id)}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors hover:bg-muted/35 focus-visible:ring-3 focus-visible:ring-ring/25",
                        serviceIds.includes(service.id) &&
                          "border-primary bg-accent",
                      )}
                    >
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <span className="flex-1 text-sm font-semibold">
                        {service.name}
                      </span>
                      {serviceIds.includes(service.id) ? (
                        <Check
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  ))}
              </div>
            </section>
            <section>
              <h2 className="text-sm font-bold">Working hours</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                These hours are used to calculate available booking slots.
              </p>
              <div className="mt-3 grid gap-2">
                {days.map(({ key, label }) => {
                  const range = availability[key][0];
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-[5.5rem_1fr] items-center gap-3 rounded-xl border p-3"
                    >
                      <button
                        type="button"
                        onClick={() => toggleDay(key)}
                        aria-pressed={Boolean(range)}
                        className={cn(
                          "min-h-10 rounded-lg px-2 text-left text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                          range ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </button>
                      {range ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            aria-label={`${label} start time`}
                            aria-invalid={
                              hoursSubmitted && Boolean(hourErrors[key])
                            }
                            aria-describedby={
                              hoursSubmitted && hourErrors[key]
                                ? `${key}-hours-error`
                                : undefined
                            }
                            type="time"
                            value={range.start}
                            onChange={(event) =>
                              changeHours(key, "start", event.target.value)
                            }
                          />
                          <Input
                            aria-label={`${label} end time`}
                            aria-invalid={
                              hoursSubmitted && Boolean(hourErrors[key])
                            }
                            aria-describedby={
                              hoursSubmitted && hourErrors[key]
                                ? `${key}-hours-error`
                                : undefined
                            }
                            type="time"
                            value={range.end}
                            onChange={(event) =>
                              changeHours(key, "end", event.target.value)
                            }
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Unavailable
                        </p>
                      )}
                      {hoursSubmitted && hourErrors[key] ? (
                        <p
                          id={`${key}-hours-error`}
                          className="col-span-2 text-xs font-medium text-destructive"
                          role="alert"
                        >
                          {hourErrors[key]}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          <div className="mt-auto flex justify-end gap-3 border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Save aria-hidden="true" />
              {member ? "Save changes" : "Add member"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
