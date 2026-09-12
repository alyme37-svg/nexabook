"use client";

import {
  Archive,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Search,
  Tags,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Service, ServiceStatus } from "@/domain/types";
import { demoTimestamp } from "@/domain/sample-data";
import { ServiceDetail } from "@/features/services/components/service-detail";
import { ServiceForm } from "@/features/services/components/service-form";
import { useNexaBookStore } from "@/store/app-store";

const subscribeToClient = () => () => undefined;
export function ServicesPage() {
  const ready = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const services = useNexaBookStore((state) => state.services);
  const teamMembers = useNexaBookStore((state) => state.teamMembers);
  const bookings = useNexaBookStore((state) => state.bookings);
  const settings = useNexaBookStore((state) => state.businessSettings);
  const updateService = useNexaBookStore((state) => state.updateService);
  const removeService = useNexaBookStore((state) => state.removeService);
  const createActivityEvent = useNexaBookStore(
    (state) => state.createActivityEvent,
  );
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ServiceStatus>("all");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Service>();
  const [form, setForm] = useState<{ open: boolean; service?: Service }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<Service>();
  const categories = useMemo(
    () => [...new Set(services.map((service) => service.category))].toSorted(),
    [services],
  );
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return services
      .filter(
        (service) =>
          (status === "all" || service.status === status) &&
          (category === "all" || service.category === category) &&
          (!search ||
            `${service.name} ${service.description} ${service.category}`
              .toLowerCase()
              .includes(search)),
      )
      .toSorted((a, b) => a.name.localeCompare(b.name));
  }, [category, query, services, status]);
  const money = new Intl.NumberFormat(settings.locale, {
    style: "currency",
    currency: settings.currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });
  const assigned = (serviceId: string) =>
    teamMembers.filter((member) => member.serviceIds.includes(serviceId));
  const bookingCount = (serviceId: string) =>
    bookings.filter((booking) => booking.serviceId === serviceId).length;
  function toggleStatus(service: Service) {
    const next: ServiceStatus =
      service.status === "active" ? "inactive" : "active";
    updateService(service.id, { status: next });
    createActivityEvent({
      kind: "service_updated",
      entityType: "service",
      entityId: service.id,
      actorId: "team-004",
      title: next === "active" ? "Service activated" : "Service archived",
      description: `${service.name} is now ${next === "active" ? "available for booking" : "archived"}.`,
      occurredAt: demoTimestamp(),
      metadata: { status: next },
    });
  }
  function deleteService() {
    if (!deleting) return;
    removeService(deleting.id);
    if (selected?.id === deleting.id) setSelected(undefined);
  }
  if (!ready)
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
            Catalogue
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-[-0.04em] sm:text-[2rem]">
            Services
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Define the services clients can book and the team members who
            provide them.
          </p>
        </div>
        <Button onClick={() => setForm({ open: true })}>
          <Plus aria-hidden="true" />
          Add service
        </Button>
      </header>
      <Card className="overflow-visible">
        <div className="grid gap-3 border-b bg-muted/20 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(16rem,1fr)_12rem_12rem]">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services or categories"
              aria-label="Search services"
              className="pl-9"
            />
          </div>
          <Select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter services by category"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | ServiceStatus)
            }
            aria-label="Filter services by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Archived</option>
          </Select>
        </div>
        {filtered.length ? (
          <>
            <div className="hidden xl:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Assigned team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-14">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((service) => (
                    <ServiceRow
                      key={service.id}
                      service={service}
                      members={assigned(service.id)}
                      money={money}
                      hasHistory={bookingCount(service.id) > 0}
                      onOpen={() => setSelected(service)}
                      onToggle={() => toggleStatus(service)}
                      onDelete={() => setDeleting(service)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 p-3 xl:hidden">
              {filtered.map((service) => {
                const members = assigned(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelected(service)}
                    className="rounded-xl border bg-card p-4 text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/25"
                  >
                    <div className="flex gap-3">
                      <span
                        className="mt-1 size-3 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="truncate font-bold">
                            {service.name}
                          </span>
                          <StatusBadge status={service.status} />
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {service.category} · {service.durationMinutes} min
                        </span>
                      </span>
                    </div>
                    <span className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                      <span>
                        <span className="block text-xs text-muted-foreground">
                          Price
                        </span>
                        <span className="mt-1 block font-semibold numbers-tabular">
                          {money.format(service.price)}
                        </span>
                      </span>
                      <span>
                        <span className="block text-xs text-muted-foreground">
                          Assigned team
                        </span>
                        <span className="mt-1 block font-semibold numbers-tabular">
                          {members.length}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={Tags}
              title="No services found"
              description="Adjust the filters or add a new service to build your catalogue."
              action={
                <Button onClick={() => setForm({ open: true })}>
                  <Plus aria-hidden="true" />
                  Add service
                </Button>
              }
            />
          </div>
        )}
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground numbers-tabular">
            {filtered.length}
          </span>{" "}
          of {services.length} services
        </div>
      </Card>
      {selected ? (
        <ServiceDetail
          open
          service={selected}
          members={assigned(selected.id)}
          locale={settings.locale}
          onOpenChange={(open) => {
            if (!open) setSelected(undefined);
          }}
          onEdit={() => {
            setForm({ open: true, service: selected });
            setSelected(undefined);
          }}
        />
      ) : null}
      {form.open ? (
        <ServiceForm
          open
          service={form.service}
          onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined);
        }}
        title={
          deleting && bookingCount(deleting.id) > 0
            ? "Archive this service?"
            : "Delete this service?"
        }
        description={
          deleting
            ? bookingCount(deleting.id) > 0
              ? `${deleting.name} has booking history, so it will be archived and retained in historical appointments.`
              : `This permanently removes ${deleting.name} and unassigns it from ${assigned(deleting.id).length} team member${assigned(deleting.id).length === 1 ? "" : "s"}.`
            : ""
        }
        confirmLabel={
          deleting && bookingCount(deleting.id) > 0
            ? "Archive service"
            : "Delete service"
        }
        confirmVariant={
          deleting && bookingCount(deleting.id) > 0 ? "default" : "destructive"
        }
        onConfirm={deleteService}
      />
    </PageContainer>
  );
}
function ServiceRow({
  service,
  members,
  money,
  hasHistory,
  onOpen,
  onToggle,
  onDelete,
}: {
  service: Service;
  members: ReturnType<typeof useNexaBookStore.getState>["teamMembers"];
  money: Intl.NumberFormat;
  hasHistory: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
        >
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: service.color }}
          />
          <span>
            <span className="block font-semibold">{service.name}</span>
            <span className="block max-w-64 truncate text-xs text-muted-foreground">
              {service.description}
            </span>
          </span>
        </button>
      </TableCell>
      <TableCell>{service.category}</TableCell>
      <TableCell className="numbers-tabular">
        {service.durationMinutes} min{" "}
        <span className="text-xs text-muted-foreground">
          + {service.bufferMinutes} buffer
        </span>
      </TableCell>
      <TableCell className="font-semibold numbers-tabular">
        {money.format(service.price)}
      </TableCell>
      <TableCell>
        <div className="flex -space-x-1.5">
          {members.slice(0, 3).map((member) => (
            <Avatar
              key={member.id}
              name={`${member.firstName} ${member.lastName}`}
              size="sm"
            />
          ))}
          {members.length > 3 ? (
            <span className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-card">
              +{members.length - 3}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={service.status} />
      </TableCell>
      <TableCell>
        <details className="relative">
          <summary
            className="grid size-9 list-none place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25 [&::-webkit-details-marker]:hidden"
            aria-label={`Actions for ${service.name}`}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </summary>
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border bg-card p-1.5 shadow-float">
            <button
              type="button"
              onClick={onOpen}
              className="min-h-9 w-full rounded-lg px-2.5 text-left text-sm font-medium hover:bg-muted"
            >
              View details
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm font-medium hover:bg-muted"
            >
              {service.status === "active" ? (
                <Archive className="size-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )}
              {service.status === "active"
                ? "Archive service"
                : "Activate service"}
            </button>
            <div className="my-1 border-t" />
            <button
              type="button"
              onClick={onDelete}
              className={
                hasHistory
                  ? "flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm font-medium text-foreground hover:bg-muted"
                  : "flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm font-medium text-destructive hover:bg-rose-50"
              }
            >
              {hasHistory ? (
                <Archive className="size-4" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              {hasHistory ? "Archive service" : "Delete service"}
            </button>
          </div>
        </details>
      </TableCell>
    </TableRow>
  );
}
