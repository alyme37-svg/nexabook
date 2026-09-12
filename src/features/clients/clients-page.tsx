"use client";

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Trash2,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

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
import { getEffectiveBookingValue } from "@/domain/booking-derived";
import type { Client, ClientStatus } from "@/domain/types";
import { ClientDetail } from "@/features/clients/components/client-detail";
import { ClientForm } from "@/features/clients/components/client-form";
import { useNexaBookStore } from "@/store/app-store";

const subscribeToClient = () => () => undefined;
const CLIENTS_PER_PAGE = 50;

export function ClientsPage() {
  const ready = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const clients = useNexaBookStore((state) => state.clients);
  const bookings = useNexaBookStore((state) => state.bookings);
  const services = useNexaBookStore((state) => state.services);
  const teamMembers = useNexaBookStore((state) => state.teamMembers);
  const settings = useNexaBookStore((state) => state.businessSettings);
  const removeClient = useNexaBookStore((state) => state.removeClient);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ClientStatus>("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Client>();
  const [form, setForm] = useState<{ open: boolean; client?: Client }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<Client>();
  const serviceMap = useMemo(
    () => new Map(services.map((item) => [item.id, item])),
    [services],
  );
  const teamMap = useMemo(
    () => new Map(teamMembers.map((item) => [item.id, item])),
    [teamMembers],
  );
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return clients
      .filter(
        (client) =>
          (status === "all" || client.status === status) &&
          (!search ||
            `${client.firstName} ${client.lastName} ${client.email} ${client.phone} ${client.tags.join(" ")}`
              .toLowerCase()
              .includes(search)),
      )
      .toSorted((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
  }, [clients, query, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / CLIENTS_PER_PAGE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleClients = filtered.slice(
    currentPage * CLIENTS_PER_PAGE,
    (currentPage + 1) * CLIENTS_PER_PAGE,
  );
  const historyFor = (clientId: string) =>
    bookings.filter((booking) => booking.clientId === clientId);
  const currency = new Intl.NumberFormat(settings.locale, {
    style: "currency",
    currency: settings.currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });

  function deleteClient() {
    if (!deleting) return;
    removeClient(deleting.id);
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
            Relationships
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-[-0.04em] sm:text-[2rem]">
            Clients
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Keep every client&apos;s preferences, history, and next visit within
            reach.
          </p>
        </div>
        <Button onClick={() => setForm({ open: true })}>
          <UserRoundPlus aria-hidden="true" />
          Add client
        </Button>
      </header>
      <Card className="overflow-visible">
        <div className="grid gap-3 border-b bg-muted/20 p-4 sm:grid-cols-[minmax(16rem,1fr)_12rem] sm:p-5">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Search clients by name, email, or tag"
              aria-label="Search clients"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "all" | ClientStatus);
              setPage(0);
            }}
            aria-label="Filter clients by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="prospect">Prospects</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        {filtered.length ? (
          <>
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Total bookings</TableHead>
                    <TableHead>Booking value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-14">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleClients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      history={historyFor(client.id)}
                      money={currency}
                      onOpen={() => setSelected(client)}
                      onDelete={() => setDeleting(client)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 p-3 lg:hidden">
              {visibleClients.map((client) => {
                const history = historyFor(client.id);
                const spend = getEffectiveBookingValue(history);
                const name = `${client.firstName} ${client.lastName}`;
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelected(client)}
                    className="rounded-xl border bg-card p-4 text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/25"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={name} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="truncate font-bold">{name}</span>
                          <StatusBadge status={client.status} />
                        </span>
                        <span className="mt-1 block truncate text-sm text-muted-foreground">
                          {client.email}
                        </span>
                      </span>
                      <ChevronRight
                        className="mt-1 size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                      <span>
                        <span className="block text-xs text-muted-foreground">
                          Bookings
                        </span>
                        <span className="mt-1 block font-semibold numbers-tabular">
                          {history.length}
                        </span>
                      </span>
                      <span>
                        <span className="block text-xs text-muted-foreground">
                          Booking value
                        </span>
                        <span className="mt-1 block font-semibold numbers-tabular">
                          {currency.format(spend)}
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
              icon={UsersRound}
              title="No clients found"
              description="Try another search or add a new client to begin building your client list."
              action={
                <Button onClick={() => setForm({ open: true })}>
                  <UserRoundPlus aria-hidden="true" />
                  Add client
                </Button>
              }
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground numbers-tabular">
              {filtered.length}
            </span>{" "}
            of {clients.length} clients
          </span>
          {pageCount > 1 ? (
            <span className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setPage((value) => value - 1)}
                aria-label="Previous client page"
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <span className="px-2 font-medium numbers-tabular">
                Page {currentPage + 1} of {pageCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage >= pageCount - 1}
                onClick={() => setPage((value) => value + 1)}
                aria-label="Next client page"
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </span>
          ) : null}
        </div>
      </Card>
      {selected ? (
        <ClientDetail
          open
          client={selected}
          onOpenChange={(open) => {
            if (!open) setSelected(undefined);
          }}
          bookings={bookings}
          serviceMap={serviceMap}
          teamMap={teamMap}
          locale={settings.locale}
          currency={settings.currency}
          timeZone={settings.timezone}
          onEdit={() => {
            setForm({ open: true, client: selected });
            setSelected(undefined);
          }}
        />
      ) : null}
      {form.open ? (
        <ClientForm
          open
          client={form.client}
          onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined);
        }}
        title="Delete this client?"
        description={
          deleting
            ? `This removes ${deleting.firstName} ${deleting.lastName} and ${historyFor(deleting.id).length} linked booking record${historyFor(deleting.id).length === 1 ? "" : "s"}. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete client"
        onConfirm={deleteClient}
      />
    </PageContainer>
  );
}

function ClientRow({
  client,
  history,
  money,
  onOpen,
  onDelete,
}: {
  client: Client;
  history: ReturnType<typeof useNexaBookStore.getState>["bookings"];
  money: Intl.NumberFormat;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const name = `${client.firstName} ${client.lastName}`;
  const spend = getEffectiveBookingValue(history);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  }>();

  useEffect(() => {
    if (!menuPosition) return;
    const close = () => setMenuPosition(undefined);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuPosition]);

  function toggleMenu() {
    if (menuPosition) {
      setMenuPosition(undefined);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = 94;
    const top =
      window.innerHeight - rect.bottom >= menuHeight + 8
        ? rect.bottom + 4
        : rect.top - menuHeight - 4;
    setMenuPosition({
      top: Math.max(8, top),
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }

  return (
    <TableRow>
      <TableCell>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
        >
          <Avatar name={name} size="sm" />
          <span>
            <span className="block font-semibold">{name}</span>
            <span className="block max-w-52 truncate text-xs text-muted-foreground">
              {client.email}
            </span>
          </span>
        </button>
      </TableCell>
      <TableCell>{client.phone}</TableCell>
      <TableCell>
        <div className="flex max-w-44 flex-wrap gap-1">
          {client.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell className="numbers-tabular font-semibold">
        {history.length}
      </TableCell>
      <TableCell className="numbers-tabular font-semibold">
        {money.format(spend)}
      </TableCell>
      <TableCell>
        <StatusBadge status={client.status} />
      </TableCell>
      <TableCell>
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleMenu}
          className="grid size-9 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25"
          aria-label={`Actions for ${name}`}
          aria-haspopup="menu"
          aria-expanded={Boolean(menuPosition)}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </button>
        {menuPosition
          ? createPortal(
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close client actions"
                  onClick={() => setMenuPosition(undefined)}
                />
                <div
                  role="menu"
                  aria-label={`Actions for ${name}`}
                  className="fixed z-50 w-44 rounded-xl border bg-card p-1.5 shadow-float"
                  style={menuPosition}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuPosition(undefined);
                      onOpen();
                    }}
                    className="min-h-9 w-full rounded-lg px-2.5 text-left text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
                  >
                    View details
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuPosition(undefined);
                      onDelete();
                    }}
                    className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm font-medium text-destructive hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete client
                  </button>
                </div>
              </>,
              document.body,
            )
          : null}
      </TableCell>
    </TableRow>
  );
}
