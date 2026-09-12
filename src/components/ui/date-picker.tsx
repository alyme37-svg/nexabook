"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

function fromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function DatePicker({
  id,
  value,
  min,
  max,
  onChange,
  disabled,
  isDateDisabled,
}: {
  id?: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isDateDisabled?: (value: string) => boolean;
}) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(() =>
    fromKey(value || min || toKey(new Date())),
  );
  const [position, setPosition] = React.useState<React.CSSProperties>();
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement>();
  const days = React.useMemo(() => monthDays(visibleMonth), [visibleMonth]);
  const formatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        close();
      }
    };
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("pointerdown", closeOnOutsidePress, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("pointerdown", closeOnOutsidePress, true);
    };
  }, [open]);

  function openCalendar() {
    if (disabled || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const container =
      triggerRef.current.closest<HTMLElement>('[role="dialog"]') ??
      document.body;
    const insideDialog = container !== document.body;
    const bounds = insideDialog
      ? container.getBoundingClientRect()
      : {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
    const width = Math.min(320, bounds.width - 16);
    const height = 362;
    const opensAbove =
      window.innerHeight - rect.bottom < height + 10 && rect.top > height;
    const relativeLeft = rect.left - bounds.left;
    const relativeTop = opensAbove
      ? rect.top - bounds.top - height - 6
      : rect.bottom - bounds.top + 6;
    setVisibleMonth(fromKey(value || min || toKey(new Date())));
    setPosition({
      position: insideDialog ? "absolute" : "fixed",
      left: Math.max(8, Math.min(relativeLeft, bounds.width - width - 8)),
      top: Math.max(8, Math.min(relativeTop, bounds.height - height - 8)),
      width,
    });
    setPortalContainer(container);
    setOpen(true);
  }

  function unavailable(day: string) {
    return Boolean(
      (min && day < min) || (max && day > max) || isDateDisabled?.(day),
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-left text-base outline-none transition-[border-color,box-shadow,background-color] hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 md:h-10 md:text-sm",
          open && "border-ring ring-3 ring-ring/20",
        )}
      >
        <span>
          {value ? formatter.format(fromKey(value)) : "Choose a date"}
        </span>
        <CalendarDays
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
      </button>
      {open && position && portalContainer
        ? createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-label="Choose appointment date"
              className="z-[60] rounded-2xl border bg-popover p-3 text-popover-foreground shadow-float"
              style={position}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  triggerRef.current?.focus();
                }
              }}
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25"
                  aria-label="Previous month"
                  onClick={() =>
                    setVisibleMonth(
                      (current) =>
                        new Date(
                          current.getFullYear(),
                          current.getMonth() - 1,
                          1,
                          12,
                        ),
                    )
                  }
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <p className="text-sm font-bold">
                  {visibleMonth.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25"
                  aria-label="Next month"
                  onClick={() =>
                    setVisibleMonth(
                      (current) =>
                        new Date(
                          current.getFullYear(),
                          current.getMonth() + 1,
                          1,
                          12,
                        ),
                    )
                  }
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-7 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
                  <span key={label} className="py-1">
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {days.map((date) => {
                  const day = toKey(date);
                  const outside = date.getMonth() !== visibleMonth.getMonth();
                  const isSelected = day === value;
                  const isDisabled = unavailable(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isDisabled}
                      aria-label={formatter.format(date)}
                      aria-pressed={isSelected}
                      onClick={() => {
                        onChange(day);
                        setOpen(false);
                        requestAnimationFrame(() =>
                          triggerRef.current?.focus(),
                        );
                      }}
                      className={cn(
                        "grid aspect-square min-h-9 place-items-center rounded-lg text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/25",
                        outside && "text-muted-foreground/50",
                        isDisabled &&
                          "cursor-not-allowed text-muted-foreground/25 line-through hover:bg-transparent",
                        isSelected &&
                          "bg-primary text-primary-foreground shadow-sm hover:bg-primary",
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  Available booking dates
                </p>
                {min && !unavailable(min) ? (
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-accent"
                    onClick={() => {
                      onChange(min);
                      setOpen(false);
                    }}
                  >
                    First available
                  </button>
                ) : null}
              </div>
            </div>,
            portalContainer,
          )
        : null}
    </>
  );
}
