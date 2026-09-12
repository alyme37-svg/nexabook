"use client";

import { Input } from "@/components/ui/input";
import type { Weekday, WeeklyAvailability } from "@/domain/types";
import { cn } from "@/lib/utils";

const weekdays: Array<{ key: Weekday; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export function BusinessHoursEditor({ value, onChange }: { value: WeeklyAvailability; onChange: (value: WeeklyAvailability) => void }) {
  function toggleDay(day: Weekday) {
    onChange({ ...value, [day]: value[day].length ? [] : [{ start: "09:00", end: "17:00" }] });
  }

  function changeTime(day: Weekday, field: "start" | "end", nextValue: string) {
    const currentRange = value[day][0] ?? { start: "09:00", end: "17:00" };
    onChange({ ...value, [day]: [{ ...currentRange, [field]: nextValue }] });
  }

  return (
    <div className="grid gap-2">
      {weekdays.map(({ key, label }) => {
        const range = value[key][0];
        return (
          <div key={key} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[7.5rem_1fr] sm:items-center">
            <button
              type="button"
              aria-pressed={Boolean(range)}
              onClick={() => toggleDay(key)}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-lg px-2 text-left text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                range ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className={cn("size-2 rounded-full", range ? "bg-success" : "bg-muted-foreground/35")} aria-hidden="true" />
              {label}
            </button>
            {range ? (
              <div className="grid grid-cols-2 gap-2">
                <Input aria-label={`${label} opening time`} type="time" value={range.start} onChange={(event) => changeTime(key, "start", event.target.value)} />
                <Input aria-label={`${label} closing time`} type="time" value={range.end} onChange={(event) => changeTime(key, "end", event.target.value)} />
              </div>
            ) : (
              <p className="px-2 text-sm text-muted-foreground">Closed</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
