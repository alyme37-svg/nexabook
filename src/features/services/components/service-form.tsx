"use client";

import { Check, Save } from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";
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
import type { Service } from "@/domain/types";
import { demoTimestamp } from "@/domain/sample-data";
import { cn } from "@/lib/utils";
import { useNexaBookStore } from "@/store/app-store";

const colors = [
  "#6366f1",
  "#8b5cf6",
  "#0ea5e9",
  "#14b8a6",
  "#ec4899",
  "#f59e0b",
];
export function ServiceForm({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service;
}) {
  const teamMembers = useNexaBookStore((state) => state.teamMembers);
  const settings = useNexaBookStore((state) => state.businessSettings);
  const createService = useNexaBookStore((state) => state.createService);
  const updateService = useNexaBookStore((state) => state.updateService);
  const updateTeamMember = useNexaBookStore((state) => state.updateTeamMember);
  const createActivityEvent = useNexaBookStore(
    (state) => state.createActivityEvent,
  );
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [category, setCategory] = useState(service?.category ?? "Wellness");
  const [duration, setDuration] = useState(
    String(service?.durationMinutes ?? 60),
  );
  const [buffer, setBuffer] = useState(String(service?.bufferMinutes ?? 15));
  const [price, setPrice] = useState(String(service?.price ?? 95));
  const [status, setStatus] = useState<Service["status"]>(
    service?.status ?? "active",
  );
  const [color, setColor] = useState(service?.color ?? colors[0]);
  const [assigned, setAssigned] = useState(() =>
    teamMembers
      .filter((member) => service && member.serviceIds.includes(service.id))
      .map((member) => member.id),
  );
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = {
      name: name.trim(),
      description,
      category: category.trim(),
      durationMinutes: Number(duration),
      bufferMinutes: Number(buffer),
      price: Number(price),
      currency: service?.currency ?? settings.currency,
      status,
      color,
    };
    const saved = service
      ? (updateService(service.id, data), service)
      : createService(data);
    teamMembers.forEach((member) => {
      const hasService = member.serviceIds.includes(saved.id);
      const shouldAssign = assigned.includes(member.id);
      if (hasService !== shouldAssign)
        updateTeamMember(member.id, {
          serviceIds: shouldAssign
            ? [...member.serviceIds, saved.id]
            : member.serviceIds.filter((id) => id !== saved.id),
        });
    });
    createActivityEvent({
      kind: service ? "service_updated" : "service_created",
      entityType: "service",
      entityId: saved.id,
      actorId: "team-004",
      title: service ? "Service updated" : "Service added",
      description: `${data.name} ${service ? "was updated" : "was added to the catalogue"}.`,
      occurredAt: demoTimestamp(),
      metadata: { status, price: data.price },
    });
    onOpenChange(false);
    notifySuccess(
      service ? "Service updated" : "Service added",
      `${data.name} is ${data.status === "active" ? "available for future bookings" : "saved as inactive"}.`,
    );
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(42rem,100vw)] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b px-5 py-5 sm:px-7">
          <SheetTitle>{service ? "Edit service" : "Add service"}</SheetTitle>
          <SheetDescription>
            Set the appointment details and choose who can deliver this service.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={save}
          className="scrollbar-subtle flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <div className="grid gap-6 px-5 py-6 sm:px-7">
            <section className="grid gap-4">
              <h2 className="text-sm font-bold">Service details</h2>
              <Field label="Service name" htmlFor="service-name">
                <Input
                  id="service-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  autoFocus
                />
              </Field>
              <Field label="Description" htmlFor="service-description">
                <textarea
                  id="service-description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full resize-none rounded-md border border-input bg-card px-3 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 md:text-sm"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" htmlFor="service-category">
                  <Input
                    id="service-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                  />
                </Field>
                <Field label="Status" htmlFor="service-status">
                  <Select
                    id="service-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as Service["status"])
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Archived</option>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Duration" htmlFor="service-duration">
                  <Input
                    id="service-duration"
                    type="number"
                    min="15"
                    step="15"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    required
                  />
                  <span className="text-xs text-muted-foreground">Minutes</span>
                </Field>
                <Field label="Buffer" htmlFor="service-buffer">
                  <Input
                    id="service-buffer"
                    type="number"
                    min="0"
                    step="5"
                    value={buffer}
                    onChange={(event) => setBuffer(event.target.value)}
                    required
                  />
                  <span className="text-xs text-muted-foreground">Minutes</span>
                </Field>
                <Field label="Price" htmlFor="service-price">
                  <Input
                    id="service-price"
                    type="number"
                    min="0"
                    step="5"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    required
                  />
                  <span className="text-xs text-muted-foreground">
                    {settings.currency}
                  </span>
                </Field>
              </div>
            </section>
            <section>
              <h2 className="text-sm font-bold">Service color</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(option)}
                    aria-label={`Use service color ${option}`}
                    aria-pressed={color === option}
                    className={cn(
                      "relative grid size-10 place-items-center rounded-lg border outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                      color === option && "border-primary bg-accent",
                    )}
                  >
                    <span
                      className="size-5 rounded-full"
                      style={{ backgroundColor: option }}
                    />
                    {color === option ? (
                      <Check
                        className="absolute size-3 text-white"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-sm font-bold">Assigned team members</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Assigning a member makes this service available in the booking
                flow.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {teamMembers
                  .filter((member) => member.status !== "inactive")
                  .map((member) => {
                    const memberName = `${member.firstName} ${member.lastName}`;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        aria-pressed={assigned.includes(member.id)}
                        onClick={() =>
                          setAssigned((current) =>
                            current.includes(member.id)
                              ? current.filter((id) => id !== member.id)
                              : [...current, member.id],
                          )
                        }
                        className={cn(
                          "flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors hover:bg-muted/35 focus-visible:ring-3 focus-visible:ring-ring/25",
                          assigned.includes(member.id) &&
                            "border-primary bg-accent",
                        )}
                      >
                        <Avatar name={memberName} size="sm" />
                        <span className="flex-1 text-sm font-semibold">
                          {memberName}
                        </span>
                        {assigned.includes(member.id) ? (
                          <Check
                            className="size-4 text-primary"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
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
              {service ? "Save changes" : "Add service"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
