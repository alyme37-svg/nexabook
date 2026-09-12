"use client";

import {
  CheckCircle2,
  CircleSlash2,
  Clock3,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Booking, BookingStatus } from "@/domain/types";
import { demoTimestamp } from "@/domain/sample-data";
import { useNexaBookStore } from "@/store/app-store";

export function BookingActions({
  booking,
  clientName,
  onEdit,
}: {
  booking: Booking;
  clientName: string;
  onEdit: () => void;
}) {
  const updateBooking = useNexaBookStore((state) => state.updateBooking);
  const removeBooking = useNexaBookStore((state) => state.removeBooking);
  const createActivityEvent = useNexaBookStore(
    (state) => state.createActivityEvent,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  function changeStatus(status: BookingStatus) {
    updateBooking(booking.id, { status });
    createActivityEvent({
      kind: status === "cancelled" ? "booking_cancelled" : "booking_updated",
      entityType: "booking",
      entityId: booking.id,
      actorId: "team-004",
      title:
        status === "cancelled" ? "Booking cancelled" : "Booking status updated",
      description: `${clientName}'s appointment is now ${status.replace("_", " ")}.`,
      occurredAt: demoTimestamp(),
      metadata: { status },
    });
  }

  return (
    <>
      <details className="group relative">
        <summary
          className="grid size-9 list-none place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25 [&::-webkit-details-marker]:hidden"
          aria-label={`Actions for ${clientName}`}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </summary>
        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border bg-card p-1.5 shadow-float">
          <Action icon={Pencil} onClick={onEdit}>
            Edit booking
          </Action>
          {booking.status !== "confirmed" ? (
            <Action
              icon={CheckCircle2}
              onClick={() => changeStatus("confirmed")}
            >
              Mark confirmed
            </Action>
          ) : null}
          {booking.status !== "in_progress" &&
          !["cancelled", "completed"].includes(booking.status) ? (
            <Action icon={Clock3} onClick={() => changeStatus("in_progress")}>
              Start appointment
            </Action>
          ) : null}
          {booking.status !== "completed" && booking.status !== "cancelled" ? (
            <Action
              icon={CheckCircle2}
              onClick={() => changeStatus("completed")}
            >
              Mark completed
            </Action>
          ) : null}
          {booking.status !== "cancelled" ? (
            <Action
              icon={CircleSlash2}
              onClick={() => changeStatus("cancelled")}
              danger
            >
              Cancel booking
            </Action>
          ) : null}
          <div className="my-1 border-t" />
          <Action icon={Trash2} onClick={() => setDeleteOpen(true)} danger>
            Delete permanently
          </Action>
        </div>
      </details>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this booking?</DialogTitle>
            <DialogDescription>
              This permanently removes {clientName}&apos;s appointment from
              Bookings and Calendar. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep booking
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                removeBooking(booking.id);
                setDeleteOpen(false);
              }}
            >
              Delete booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Action({
  icon: Icon,
  children,
  onClick,
  danger = false,
}: {
  icon: typeof Pencil;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        onClick();
        event.currentTarget.closest("details")?.removeAttribute("open");
      }}
      className={`flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30 ${danger ? "text-destructive hover:bg-rose-50" : "text-foreground hover:bg-muted"}`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </button>
  );
}
