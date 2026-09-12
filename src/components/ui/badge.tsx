import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-muted-foreground",
        brand: "border-indigo-200 bg-indigo-50 text-indigo-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        danger: "border-rose-200 bg-rose-50 text-rose-700",
        info: "border-sky-200 bg-sky-50 text-sky-700",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const statusPresentation = {
  active: ["Active", "success"],
  confirmed: ["Confirmed", "success"],
  completed: ["Completed", "success"],
  paid: ["Paid", "success"],
  pending: ["Pending", "warning"],
  partial: ["Partially paid", "warning"],
  in_progress: ["In progress", "info"],
  prospect: ["Prospect", "brand"],
  away: ["Away", "warning"],
  inactive: ["Inactive", "neutral"],
  unpaid: ["Unpaid", "neutral"],
  cancelled: ["Cancelled", "danger"],
  no_show: ["No show", "danger"],
  refunded: ["Refunded", "neutral"],
} as const;

export type SupportedStatus = keyof typeof statusPresentation;

export function StatusBadge({ status, className }: { status: SupportedStatus; className?: string }) {
  const [label, variant] = statusPresentation[status];
  return (
    <Badge variant={variant} className={className}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </Badge>
  );
}
