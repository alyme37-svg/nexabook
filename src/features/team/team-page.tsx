"use client";

import {
  CircleSlash2,
  LayoutGrid,
  List,
  MoreHorizontal,
  Search,
  Trash2,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
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
import type { TeamMember, TeamMemberStatus } from "@/domain/types";
import { demoTimestamp } from "@/domain/sample-data";
import { MemberDetail } from "@/features/team/components/member-detail";
import { MemberForm } from "@/features/team/components/member-form";
import { cn } from "@/lib/utils";
import { useNexaBookStore } from "@/store/app-store";

const subscribeToClient = () => () => undefined;

export function TeamPage() {
  const ready = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const teamMembers = useNexaBookStore((state) => state.teamMembers);
  const services = useNexaBookStore((state) => state.services);
  const bookings = useNexaBookStore((state) => state.bookings);
  const updateTeamMember = useNexaBookStore((state) => state.updateTeamMember);
  const removeTeamMember = useNexaBookStore((state) => state.removeTeamMember);
  const createActivityEvent = useNexaBookStore(
    (state) => state.createActivityEvent,
  );
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | TeamMemberStatus>("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<TeamMember>();
  const [form, setForm] = useState<{ open: boolean; member?: TeamMember }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<TeamMember>();
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return teamMembers
      .filter(
        (member) =>
          (status === "all" || member.status === status) &&
          (!search ||
            `${member.firstName} ${member.lastName} ${member.title} ${member.email}`
              .toLowerCase()
              .includes(search)),
      )
      .toSorted((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
  }, [query, status, teamMembers]);
  const bookingCount = (memberId: string) =>
    bookings.filter((booking) => booking.teamMemberId === memberId).length;
  function setMemberStatus(member: TeamMember, next: TeamMemberStatus) {
    updateTeamMember(member.id, { status: next });
    createActivityEvent({
      kind: "team_member_updated",
      entityType: "team_member",
      entityId: member.id,
      actorId: "team-004",
      title: "Team status updated",
      description: `${member.firstName} ${member.lastName} is now ${next.replace("_", " ")}.`,
      occurredAt: demoTimestamp(),
      metadata: { status: next },
    });
  }
  function deleteMember() {
    if (!deleting) return;
    removeTeamMember(deleting.id);
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
            People & availability
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-[-0.04em] sm:text-[2rem]">
            Team
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Manage who is available, what they offer, and when they work.
          </p>
        </div>
        <Button onClick={() => setForm({ open: true })}>
          <UserPlus aria-hidden="true" />
          Add team member
        </Button>
      </header>
      <Card className="overflow-visible">
        <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search team members"
              aria-label="Search team members"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | TeamMemberStatus)
            }
            aria-label="Filter team by status"
            className="sm:w-40"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="away">Away</option>
            <option value="inactive">Inactive</option>
          </Select>
          <div className="hidden grid-cols-2 rounded-lg border bg-card p-1 xl:grid">
            <button
              type="button"
              aria-pressed={layout === "grid"}
              onClick={() => setLayout("grid")}
              className={cn(
                "grid size-9 place-items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                layout === "grid" && "bg-muted text-primary",
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-pressed={layout === "list"}
              onClick={() => setLayout("list")}
              className={cn(
                "grid size-9 place-items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                layout === "list" && "bg-muted text-primary",
              )}
              aria-label="List view"
            >
              <List className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        {filtered.length ? (
          layout === "grid" ? (
            <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  services={services}
                  bookingCount={bookingCount(member.id)}
                  onOpen={() => setSelected(member)}
                  onStatus={setMemberStatus}
                  onDelete={() => setDeleting(member)}
                />
              ))}
            </div>
          ) : (
            <div className="scrollbar-subtle max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team member</TableHead>
                    <TableHead>Assigned services</TableHead>
                    <TableHead>Working hours</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-14">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((member) => {
                    const name = `${member.firstName} ${member.lastName}`;
                    const assigned = services.filter((service) =>
                      member.serviceIds.includes(service.id),
                    );
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => setSelected(member)}
                            className="flex items-center gap-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                          >
                            <Avatar name={name} size="sm" />
                            <span>
                              <span className="block font-semibold">
                                {name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {member.title}
                              </span>
                            </span>
                          </button>
                        </TableCell>
                        <TableCell>
                          {assigned
                            .slice(0, 2)
                            .map((service) => service.name)
                            .join(", ") || "None"}
                        </TableCell>
                        <TableCell>
                          {member.availability.monday[0]
                            ? `${member.availability.monday[0].start} – ${member.availability.monday[0].end}`
                            : "Unavailable"}
                        </TableCell>
                        <TableCell className="numbers-tabular font-semibold">
                          {bookingCount(member.id)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={member.status} />
                        </TableCell>
                        <TableCell>
                          <Menu
                            member={member}
                            hasHistory={bookingCount(member.id) > 0}
                            onOpen={() => setSelected(member)}
                            onStatus={setMemberStatus}
                            onDelete={() => setDeleting(member)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className="p-4">
            <EmptyState
              icon={UsersRound}
              title="No team members found"
              description="Adjust the filters or add a team member to build the schedule."
              action={
                <Button onClick={() => setForm({ open: true })}>
                  <UserPlus aria-hidden="true" />
                  Add team member
                </Button>
              }
            />
          </div>
        )}
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground numbers-tabular">
            {filtered.length}
          </span>{" "}
          of {teamMembers.length} team members
        </div>
      </Card>
      {selected ? (
        <MemberDetail
          open
          member={selected}
          services={services}
          bookingCount={bookingCount(selected.id)}
          onOpenChange={(open) => {
            if (!open) setSelected(undefined);
          }}
          onEdit={() => {
            setForm({ open: true, member: selected });
            setSelected(undefined);
          }}
        />
      ) : null}
      {form.open ? (
        <MemberForm
          open
          member={form.member}
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
            ? "Deactivate this team member?"
            : "Delete this team member?"
        }
        description={
          deleting
            ? bookingCount(deleting.id) > 0
              ? `${deleting.firstName} ${deleting.lastName} has booking history, so the member will be deactivated and retained in historical appointments.`
              : `This permanently removes ${deleting.firstName} ${deleting.lastName}.`
            : ""
        }
        confirmLabel={
          deleting && bookingCount(deleting.id) > 0
            ? "Deactivate member"
            : "Delete member"
        }
        confirmVariant={
          deleting && bookingCount(deleting.id) > 0 ? "default" : "destructive"
        }
        onConfirm={deleteMember}
      />
    </PageContainer>
  );
}

function MemberCard({
  member,
  services,
  bookingCount,
  onOpen,
  onStatus,
  onDelete,
}: {
  member: TeamMember;
  services: ReturnType<typeof useNexaBookStore.getState>["services"];
  bookingCount: number;
  onOpen: () => void;
  onStatus: (member: TeamMember, status: TeamMemberStatus) => void;
  onDelete: () => void;
}) {
  const name = `${member.firstName} ${member.lastName}`;
  const assigned = services.filter((service) =>
    member.serviceIds.includes(service.id),
  );
  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
        >
          <Avatar name={name} />
          <span className="min-w-0">
            <span className="block truncate font-bold">{name}</span>
            <span className="block truncate text-sm text-muted-foreground">
              {member.title}
            </span>
          </span>
        </button>
        <Menu
          member={member}
          hasHistory={bookingCount > 0}
          onOpen={onOpen}
          onStatus={onStatus}
          onDelete={onDelete}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {assigned.slice(0, 3).map((service) => (
          <Badge key={service.id} variant="neutral">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: service.color }}
            />
            {service.name}
          </Badge>
        ))}
        {assigned.length > 3 ? (
          <Badge variant="neutral">+{assigned.length - 3}</Badge>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3">
        <div>
          <p className="text-xs text-muted-foreground">Availability</p>
          <p className="mt-1 text-sm font-semibold">
            {member.availability.monday[0]
              ? `${member.availability.monday[0].start} – ${member.availability.monday[0].end}`
              : "Unavailable"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Bookings</p>
          <p className="mt-1 text-sm font-semibold numbers-tabular">
            {bookingCount}
          </p>
        </div>
      </div>
    </article>
  );
}
function Menu({
  member,
  hasHistory,
  onOpen,
  onStatus,
  onDelete,
}: {
  member: TeamMember;
  hasHistory: boolean;
  onOpen: () => void;
  onStatus: (member: TeamMember, status: TeamMemberStatus) => void;
  onDelete: () => void;
}) {
  return (
    <details className="relative">
      <summary
        className="grid size-9 list-none place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25 [&::-webkit-details-marker]:hidden"
        aria-label={`Actions for ${member.firstName} ${member.lastName}`}
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
        {(["active", "away", "inactive"] as TeamMemberStatus[])
          .filter((status) => status !== member.status)
          .map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatus(member, status)}
              className="min-h-9 w-full rounded-lg px-2.5 text-left text-sm font-medium capitalize hover:bg-muted"
            >
              Mark {status}
            </button>
          ))}
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
            <CircleSlash2 className="size-4" aria-hidden="true" />
          ) : (
            <Trash2 className="size-4" aria-hidden="true" />
          )}
          {hasHistory ? "Deactivate member" : "Delete member"}
        </button>
      </div>
    </details>
  );
}
